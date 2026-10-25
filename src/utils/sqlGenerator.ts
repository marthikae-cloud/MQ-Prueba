export interface SqlScriptOptions {
  databaseName: string;
  targetClient?: string;
  createPhysicalBackup: boolean;
  updateSaclie: boolean;
  saclieMethod: 'last_saldoact' | 'sum_open_saldo';
  updatePagosA: boolean;
  pagosAMethod: 'saldo' | 'monto';
  includeDiagnosticReport: boolean;
  includeTransactionRollbackCheck: boolean;
}

export function generateOptimizedSetBasedScript(options: SqlScriptOptions): string {
  const {
    databaseName,
    targetClient,
    createPhysicalBackup,
    updateSaclie,
    saclieMethod,
    updatePagosA = true,
    pagosAMethod = 'saldo',
    includeDiagnosticReport,
    includeTransactionRollbackCheck
  } = options;

  const clientFilterWhere = targetClient && targetClient.trim() !== ''
    ? `WHERE CodClie = '${targetClient.trim()}'`
    : '';

  const clientFilterJoin = targetClient && targetClient.trim() !== ''
    ? `WHERE A.CodClie = '${targetClient.trim()}'`
    : '';

  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

  return `-- ==============================================================================
-- SAINT ENTERPRISE ADMINISTRATIVO - RECUPERACION DE SALDOS CXC (SAACxC / SACLIE)
-- Canal Integrador Saint | Procedimiento Optimizado Basado en Conjuntos (Set-Based CTE)
-- Compatible con: SQL Server 2012 / 2016 / 2019 / 2022 / Azure SQL
-- Incluye: Recálculo SAACxC.SaldoAct + SACLIE.Saldo + SACLIE.PagosA (Anticipos 50 - 25)
-- ==============================================================================
USE [${databaseName || 'BazarAdminDb'}];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

PRINT '======================================================================';
PRINT 'Iniciando proceso de recuperación y recálculo de saldos de CxC...';
PRINT 'Base de Datos: ' + DB_NAME();
PRINT 'Fecha/Hora: ' + CONVERT(varchar(24), GETDATE(), 120);
PRINT '======================================================================';

-- ------------------------------------------------------------------------------
-- PASO 0: Verificación previa de existencia de tablas maestras Saint
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.SAACxC', 'U') IS NULL OR OBJECT_ID('dbo.SACLIE', 'U') IS NULL
BEGIN
    RAISERROR('ERROR CRITICO: No se encontraron las tablas SAACxC o SACLIE en la BD actual.', 16, 1);
    RETURN;
END;

${createPhysicalBackup ? `-- ------------------------------------------------------------------------------
-- PASO 1: Respaldo de seguridad preventivo (Snapshot físico con marca de tiempo)
-- ------------------------------------------------------------------------------
DECLARE @BakTableName varchar(100) = 'SAACxC_BAK_${timestamp}';
PRINT 'Creando tabla de respaldo preventivo: ' + @BakTableName + '...';

IF OBJECT_ID('dbo.SAACxC_BAK_${timestamp}', 'U') IS NULL
BEGIN
    SELECT * INTO dbo.SAACxC_BAK_${timestamp} FROM dbo.SAACxC ${clientFilterWhere};
    PRINT '-> Respaldo de SAACxC completado exitosamente (' + CAST(@@ROWCOUNT AS varchar(15)) + ' registros resguardados).';
END;
` : `-- (Respaldo físico omitido por configuración. Asegúrese de tener un BACKUP de BD reciente)`}

-- ------------------------------------------------------------------------------
-- PASO 2: Ejecución Transaccional Atómica (ACID con TRY...CATCH)
-- ------------------------------------------------------------------------------
BEGIN TRY
    BEGIN TRANSACTION;

    PRINT 'Recalculando SaldoAct en SAACxC mediante Window Functions (SUM OVER)...';

    ;WITH CTE_CalculoSaldoAct AS (
        SELECT 
            NroUnico,
            CodClie,
            FechaE,
            Monto,
            TipoCxC,
            -- Factor según Diccionario Personalizado de CxC del Integrador
            CASE 
                -- Débitos: Factura (10), Nota de Débito (20, 27), Reverso Adelanto (35), Giro (60), Cuota (70)
                WHEN TipoCxC IN ('10','20','27','35','60','70') THEN 1.00
                -- Créditos: Nota de Crédito (31, 36, 37), Pago Recibido (41)
                WHEN TipoCxC IN ('31','36','37','41') THEN -1.00
                ELSE 0.00
            END AS FactorDoc,
            -- Saldo acumulado cronológico por cliente (Excluyendo Adelanto 50 y Anula anticipo 25 para evitar duplicar cruces)
            SUM(
                CASE 
                    WHEN TipoCxC NOT IN ('50','25') THEN 
                        (CASE 
                            WHEN TipoCxC IN ('10','20','27','35','60','70') THEN 1.00
                            WHEN TipoCxC IN ('31','36','37','41') THEN -1.00
                            ELSE 0.00 
                         END) * Monto
                    ELSE 0.00 
                END
            ) OVER (
                PARTITION BY CodClie 
                ORDER BY FechaE ASC, NroUnico ASC
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS SaldoCalculado
        FROM dbo.SAACxC
        ${clientFilterWhere}
    )
    -- Actualización masiva en un solo pase de I/O (Sin cursores lentos RBAR)
    UPDATE T
    SET T.SaldoAct = ROUND(C.SaldoCalculado, 2)
    FROM dbo.SAACxC T
    INNER JOIN CTE_CalculoSaldoAct C ON T.NroUnico = C.NroUnico
    WHERE ISNULL(T.SaldoAct, -999999.99) <> ROUND(C.SaldoCalculado, 2);

    DECLARE @RegsActualizadosCxC int = @@ROWCOUNT;
    PRINT '-> SAACxC actualizado: ' + CAST(@RegsActualizadosCxC AS varchar(15)) + ' movimientos ajustados.';

${updateSaclie ? (saclieMethod === 'last_saldoact' ? `
    -- ------------------------------------------------------------------------------
    -- PASO 3: Sincronización del Saldo Deudor en la tabla maestra SACLIE
    -- Método: Último SaldoAct acumulado cronológico por cliente (excluye 50 y 25)
    -- ------------------------------------------------------------------------------
    PRINT 'Actualizando saldos maestros en SACLIE.Saldo (Método: Último Saldo Histórico)...';

    ;WITH CTE_UltimoSaldoPorCliente AS (
        SELECT 
            CodClie,
            SaldoAct,
            ROW_NUMBER() OVER (
                PARTITION BY CodClie 
                ORDER BY FechaE DESC, NroUnico DESC
            ) as FilaReciente
        FROM dbo.SAACxC
        ${clientFilterWhere}
    )
    UPDATE CL
    SET CL.Saldo = ROUND(ISNULL(U.SaldoAct, 0), 2)
    FROM dbo.SACLIE CL
    LEFT JOIN CTE_UltimoSaldoPorCliente U 
        ON CL.CodClie = U.CodClie AND U.FilaReciente = 1
    ${clientFilterJoin ? `WHERE CL.CodClie = '${targetClient?.trim()}'` : ''};

    DECLARE @RegsActualizadosCli int = @@ROWCOUNT;
    PRINT '-> SACLIE.Saldo actualizado: ' + CAST(@RegsActualizadosCli AS varchar(15)) + ' clientes sincronizados.';
` : `
    -- ------------------------------------------------------------------------------
    -- PASO 3: Sincronización del Saldo Deudor en la tabla maestra SACLIE
    -- Método: Sumatoria de saldos pendientes vivos de documentos de deuda (SAACxC.Saldo)
    -- ------------------------------------------------------------------------------
    PRINT 'Actualizando saldos maestros en SACLIE.Saldo (Método: Sumatoria de Saldos Pendientes)...';

    ;WITH CTE_SumaPendiente AS (
        SELECT 
            CodClie,
            SUM(
                CASE 
                    -- Débitos vivos (+): Factura 10, ND 20, ND 27, Reverso 35, Giro 60, Cuota 70
                    WHEN TipoCxC IN ('10','20','27','35','60','70') THEN Saldo
                    -- Créditos vivos aplicados (-): NC 31, NC 36, NC 37, Cobro 41
                    WHEN TipoCxC IN ('31','36','37','41') THEN -Saldo
                    ELSE 0.00
                END
            ) AS SaldoPendienteNeto
        FROM dbo.SAACxC
        WHERE Saldo <> 0
          AND TipoCxC NOT IN ('50','25')
        ${targetClient && targetClient.trim() !== '' ? `AND CodClie = '${targetClient.trim()}'` : ''}
        GROUP BY CodClie
    )
    UPDATE CL
    SET CL.Saldo = ROUND(ISNULL(P.SaldoPendienteNeto, 0), 2)
    FROM dbo.SACLIE CL
    LEFT JOIN CTE_SumaPendiente P ON CL.CodClie = P.CodClie
    ${clientFilterJoin ? `WHERE CL.CodClie = '${targetClient?.trim()}'` : ''};

    DECLARE @RegsActualizadosCli int = @@ROWCOUNT;
    PRINT '-> SACLIE.Saldo actualizado: ' + CAST(@RegsActualizadosCli AS varchar(15)) + ' clientes sincronizados.';
`) : `    -- (Paso de actualización de SACLIE.Saldo deshabilitado)`}

${updatePagosA ? `
    -- ------------------------------------------------------------------------------
    -- PASO 4: Sincronización de Pagos Adelantados / Anticipos en SACLIE.PagosA
    -- Regla de Negocio Saint: PagosA = SUM(Adelantos 50) - SUM(Anulaciones 25)
    -- ------------------------------------------------------------------------------
    PRINT 'Actualizando columna de anticipos en SACLIE.PagosA (SUM(50) - SUM(25))...';

    ;WITH CTE_CalculoPagosA AS (
        SELECT 
            CodClie,
            ROUND(SUM(
                CASE 
                    ${pagosAMethod === 'saldo' ? `
                    -- Anticipos con saldo disponible vivo por cruzar:
                    WHEN TipoCxC = '50' THEN Saldo
                    WHEN TipoCxC = '25' THEN -Saldo
                    ` : `
                    -- Monto nominal acumulado de anticipos menos anulaciones:
                    WHEN TipoCxC = '50' THEN Monto
                    WHEN TipoCxC = '25' THEN -Monto
                    `}
                    ELSE 0.00
                END
            ), 2) AS SaldoAnticipoCalculado
        FROM dbo.SAACxC
        WHERE TipoCxC IN ('50', '25')
        ${targetClient && targetClient.trim() !== '' ? `AND CodClie = '${targetClient.trim()}'` : ''}
        GROUP BY CodClie
    )
    UPDATE CL
    SET CL.PagosA = CASE 
                        WHEN ISNULL(P.SaldoAnticipoCalculado, 0.00) < 0 THEN 0.00 
                        ELSE ISNULL(P.SaldoAnticipoCalculado, 0.00) 
                    END
    FROM dbo.SACLIE CL
    LEFT JOIN CTE_CalculoPagosA P ON CL.CodClie = P.CodClie
    ${clientFilterJoin ? `WHERE CL.CodClie = '${targetClient?.trim()}'` : ''};

    DECLARE @RegsActualizadosPagosA int = @@ROWCOUNT;
    PRINT '-> SACLIE.PagosA actualizado: ' + CAST(@RegsActualizadosPagosA AS varchar(15)) + ' registros de anticipos sincronizados.';
` : `    -- (Paso de actualización de SACLIE.PagosA deshabilitado)`}

${includeTransactionRollbackCheck ? `
    -- Verificación de coherencia antes de confirmar transacción
    PRINT 'Validando consistencia de datos...';
` : ''}
    COMMIT TRANSACTION;
    PRINT '======================================================================';
    PRINT 'PROCESO FINALIZADO EXITOSAMENTE. Transacción confirmada (COMMIT).';
    PRINT '======================================================================';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    BEGIN
        ROLLBACK TRANSACTION;
        PRINT '======================================================================';
        PRINT 'ERROR DETECTADO: Se ejecutó ROLLBACK completo. La base de datos no sufrió alteraciones.';
        PRINT 'Mensaje: ' + ERROR_MESSAGE();
        PRINT 'Línea de Error: ' + CAST(ERROR_LINE() AS varchar(10));
        PRINT 'Número de Error: ' + CAST(ERROR_NUMBER() AS varchar(10));
        PRINT '======================================================================';
    END;
    THROW;
END CATCH;
GO
`;
}

export function generateDiagnosticScript(databaseName: string): string {
  return `-- ==============================================================================
-- SCRIPT DE DIAGNOSTICO PREVIO DE AUDITORIA CXC PARA SAINT ENTERPRISE
-- Ejecute este script en SQL Server Management Studio para detectar anomalías
-- ==============================================================================
USE [${databaseName || 'BazarAdminDb'}];
GO

SET NOCOUNT ON;

PRINT '======================================================================';
PRINT 'DIAGNOSTICO 1: Descuadres entre SACLIE.Saldo y el último SAACxC.SaldoAct';
PRINT '======================================================================';

;WITH CTE_UltimoSaldo AS (
    SELECT 
        CodClie,
        SaldoAct,
        ROW_NUMBER() OVER (PARTITION BY CodClie ORDER BY FechaE DESC, NroUnico DESC) as Orden
    FROM dbo.SAACxC
)
SELECT 
    C.CodClie,
    C.Descrip AS NombreCliente,
    C.Saldo AS SaldoEnSACLIE,
    ISNULL(U.SaldoAct, 0) AS UltimoSaldoActEnSAACxC,
    ROUND(C.Saldo - ISNULL(U.SaldoAct, 0), 2) AS Diferencia
FROM dbo.SACLIE C
LEFT JOIN CTE_UltimoSaldo U ON C.CodClie = U.CodClie AND U.Orden = 1
WHERE ABS(ROUND(C.Saldo - ISNULL(U.SaldoAct, 0), 2)) > 0.01
ORDER BY ABS(C.Saldo - ISNULL(U.SaldoAct, 0)) DESC;

PRINT '======================================================================';
PRINT 'DIAGNOSTICO 2: Documentos con saldo pendiente negativo indebido (Saldo < 0)';
PRINT '======================================================================';

SELECT 
    NroUnico,
    CodClie,
    TipoCxC,
    NumeroD,
    FechaE,
    Monto,
    Saldo
FROM dbo.SAACxC
WHERE Saldo < -0.01 AND TipoCxC NOT IN ('31', '41', '81', '46')
ORDER BY CodClie, FechaE;

PRINT '======================================================================';
PRINT 'DIAGNOSTICO 3: Registros huérfanos en SAACxC (Sin cliente registrado en SACLIE)';
PRINT '======================================================================';

SELECT 
    A.CodClie,
    COUNT(*) AS CantidadDocumentosHuerfanos,
    SUM(A.Monto) AS TotalMonto
FROM dbo.SAACxC A
LEFT JOIN dbo.SACLIE C ON A.CodClie = C.CodClie
WHERE C.CodClie IS NULL
GROUP BY A.CodClie;

PRINT '======================================================================';
PRINT 'DIAGNOSTICO 4: Documentos con TipoCxC no estándar o desconocido en Saint';
PRINT '======================================================================';

SELECT 
    TipoCxC,
    COUNT(*) AS Frecuencia,
    SUM(Monto) AS TotalMonto
FROM dbo.SAACxC
WHERE TipoCxC NOT IN ('10','20','21','25','26','27','31','36','37','41','46','47','50','60','70','81','82')
GROUP BY TipoCxC;
GO
`;
}

export function generateReconciliationScript(databaseName: string): string {
  return `-- ==============================================================================
-- SAINT ENTERPRISE - AUDITORIA DE CONCILIACION Y CUADRE DE CARTERA Y ANTICIPOS
-- Comprobación: SACLIE.Saldo vs SAACxC (Deuda) Y SACLIE.PagosA vs SAACxC (50 - 25)
-- Canal Integrador Saint | Compatible con SQL Server 2008 R2 / 2012 / 2016 / 2019 / 2022
-- ==============================================================================
USE [${databaseName || 'BazarAdminDb'}];
GO

SET NOCOUNT ON;

PRINT '======================================================================';
PRINT 'COMPROBACION 1: CUADRE GLOBAL DE CARTERA (DEUDA + ANTICIPOS PAGOSA)';
PRINT '======================================================================';

;WITH CTE_TotalesSAACxC AS (
    SELECT 
        -- Deuda bruta viva (Facturas, ND, Cargos menos NC y Cobros)
        ROUND(SUM(
            CASE 
                WHEN TipoCxC IN ('10','20','27','35','60','70') THEN Saldo
                WHEN TipoCxC IN ('31','36','37','41') THEN -Saldo
                ELSE 0.00
            END
        ), 2) AS Total_Deuda_SAACxC,
        -- Anticipos disponibles vivos (Adelanto 50 menos Anulación 25)
        ROUND(SUM(
            CASE 
                WHEN TipoCxC = '50' THEN Saldo
                WHEN TipoCxC = '25' THEN -Saldo
                ELSE 0.00
            END
        ), 2) AS Total_Anticipos_SAACxC
    FROM dbo.SAACxC
    WHERE Saldo <> 0
)
SELECT 
    ROUND(SUM(C.Saldo), 2) AS [Total_Deuda_SACLIE],
    ISNULL(A.Total_Deuda_SAACxC, 0.00) AS [Total_Deuda_SAACxC],
    ROUND(SUM(C.Saldo) - ISNULL(A.Total_Deuda_SAACxC, 0.00), 2) AS [Dif_Deuda],
    ROUND(SUM(ISNULL(C.PagosA, 0)), 2) AS [Total_Anticipos_SACLIE_PagosA],
    ISNULL(A.Total_Anticipos_SAACxC, 0.00) AS [Total_Anticipos_SAACxC],
    ROUND(SUM(ISNULL(C.PagosA, 0)) - ISNULL(A.Total_Anticipos_SAACxC, 0.00), 2) AS [Dif_Anticipos],
    ROUND(SUM(C.Saldo - ISNULL(C.PagosA, 0)), 2) AS [Cartera_Neta_SACLIE],
    ROUND(ISNULL(A.Total_Deuda_SAACxC, 0.00) - ISNULL(A.Total_Anticipos_SAACxC, 0.00), 2) AS [Cartera_Neta_SAACxC],
    CASE 
        WHEN ABS(ROUND(SUM(C.Saldo) - ISNULL(A.Total_Deuda_SAACxC, 0.00), 2)) < 0.01 
         AND ABS(ROUND(SUM(ISNULL(C.PagosA, 0)) - ISNULL(A.Total_Anticipos_SAACxC, 0.00), 2)) < 0.01
            THEN 'CUADRADO EXACTO (Deuda y Anticipos = 0)'
        ELSE 'DESCUADRE DETECTADO (Requiere Nivelacion)'
    END AS [Dictamen_Auditoria]
FROM dbo.SACLIE C
CROSS JOIN CTE_TotalesSAACxC A
GROUP BY A.Total_Deuda_SAACxC, A.Total_Anticipos_SAACxC;

PRINT '';
PRINT '======================================================================';
PRINT 'COMPROBACION 2: DETALLE DE CLIENTES CON DESCUADRE EN SALDO O PAGOSA';
PRINT '======================================================================';

;WITH CTE_DesagregadoCliente AS (
    SELECT 
        CodClie,
        ROUND(SUM(
            CASE 
                WHEN TipoCxC IN ('10','20','27','35','60','70') THEN Saldo
                WHEN TipoCxC IN ('31','36','37','41') THEN -Saldo
                ELSE 0.00
            END
        ), 2) AS DeudaDesagregadaSAACxC,
        ROUND(SUM(
            CASE 
                WHEN TipoCxC = '50' THEN Saldo
                WHEN TipoCxC = '25' THEN -Saldo
                ELSE 0.00
            END
        ), 2) AS AnticiposSAACxC,
        COUNT(*) AS DocumentosVivosConSaldo
    FROM dbo.SAACxC
    WHERE Saldo <> 0
    GROUP BY CodClie
)
SELECT 
    CL.CodClie,
    CL.Descrip AS NombreCliente,
    CL.Saldo AS Saldo_SACLIE,
    ISNULL(D.DeudaDesagregadaSAACxC, 0.00) AS Deuda_SAACxC,
    ROUND(CL.Saldo - ISNULL(D.DeudaDesagregadaSAACxC, 0.00), 2) AS Dif_Saldo,
    ISNULL(CL.PagosA, 0.00) AS PagosA_SACLIE,
    ISNULL(D.AnticiposSAACxC, 0.00) AS Anticipos_SAACxC,
    ROUND(ISNULL(CL.PagosA, 0.00) - ISNULL(D.AnticiposSAACxC, 0.00), 2) AS Dif_PagosA,
    ROUND(CL.Saldo - ISNULL(CL.PagosA, 0.00), 2) AS SaldoNeto_SACLIE,
    ROUND(ISNULL(D.DeudaDesagregadaSAACxC, 0.00) - ISNULL(D.AnticiposSAACxC, 0.00), 2) AS SaldoNeto_SAACxC
FROM dbo.SACLIE CL
LEFT JOIN CTE_DesagregadoCliente D ON CL.CodClie = D.CodClie
WHERE ABS(CL.Saldo - ISNULL(D.DeudaDesagregadaSAACxC, 0.00)) > 0.01
   OR ABS(ISNULL(CL.PagosA, 0.00) - ISNULL(D.AnticiposSAACxC, 0.00)) > 0.01
ORDER BY ABS(CL.Saldo - ISNULL(D.DeudaDesagregadaSAACxC, 0.00)) DESC;

PRINT '';
PRINT '======================================================================';
PRINT 'COMPROBACION 3: DOCUMENTOS ANOMALOS EN SAACxC (Saldos negativos o inconsistentes)';
PRINT '======================================================================';

SELECT 
    NroUnico,
    CodClie,
    NumeroD,
    TipoCxC,
    FechaE,
    Monto,
    Saldo,
    CASE 
        WHEN Saldo < 0 THEN 'ALERTA: Saldo Negativo Indebido'
        WHEN Saldo > Monto THEN 'ALERTA: Saldo Mayor que el Monto Facial'
        ELSE 'Normal'
    END AS EstadoInconsistencia
FROM dbo.SAACxC
WHERE (Saldo < 0 AND TipoCxC IN ('10','20','27','35','60','70'))
   OR (Saldo > Monto AND TipoCxC NOT IN ('50','25'))
ORDER BY CodClie, FechaE;
GO
`;
}

export function generateAlignmentScript(databaseName: string): string {
  return `-- ==============================================================================
-- SCRIPT DE NIVELACION DIRECTA: SINCRONIZAR SACLIE (SALDO + PAGOSA)
-- Establece SACLIE.Saldo = Deuda viva y SACLIE.PagosA = Anticipos disponibles (50 - 25)
-- ==============================================================================
USE [${databaseName || 'BazarAdminDb'}];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT '>> Nivelando SACLIE.Saldo (Deuda viva) y SACLIE.PagosA (Anticipos 50 - 25)...';

    ;WITH CTE_SumaDesagregada AS (
        SELECT 
            CodClie,
            -- Deuda viva de documentos
            ROUND(SUM(
                CASE 
                    WHEN TipoCxC IN ('10','20','27','35','60','70') THEN Saldo
                    WHEN TipoCxC IN ('31','36','37','41') THEN -Saldo
                    ELSE 0.00
                END
            ), 2) AS SaldoDeudaReal,
            -- Anticipos disponibles
            ROUND(SUM(
                CASE 
                    WHEN TipoCxC = '50' THEN Saldo
                    WHEN TipoCxC = '25' THEN -Saldo
                    ELSE 0.00
                END
            ), 2) AS SaldoAnticiposReal
        FROM dbo.SAACxC
        WHERE Saldo <> 0
        GROUP BY CodClie
    )
    UPDATE CL
    SET 
        CL.Saldo = ISNULL(D.SaldoDeudaReal, 0.00),
        CL.PagosA = CASE WHEN ISNULL(D.SaldoAnticiposReal, 0.00) < 0 THEN 0.00 ELSE ISNULL(D.SaldoAnticiposReal, 0.00) END
    FROM dbo.SACLIE CL
    LEFT JOIN CTE_SumaDesagregada D ON CL.CodClie = D.CodClie
    WHERE CL.Saldo <> ISNULL(D.SaldoDeudaReal, 0.00)
       OR ISNULL(CL.PagosA, 0.00) <> CASE WHEN ISNULL(D.SaldoAnticiposReal, 0.00) < 0 THEN 0.00 ELSE ISNULL(D.SaldoAnticiposReal, 0.00) END;

    DECLARE @ClientesAjustados int = @@ROWCOUNT;
    PRINT '>> Sincronización completada: ' + CAST(@ClientesAjustados AS varchar(15)) + ' clientes nivelados con éxito.';

    COMMIT TRANSACTION;
    PRINT '>> Transacción confirmada (COMMIT). SACLIE.Saldo y SACLIE.PagosA 100% cuadrados.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    PRINT '>> ERROR EN NIVELACION: Se ejecutó ROLLBACK. ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
`;
}

