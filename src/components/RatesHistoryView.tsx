import React, { useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Calendar, 
  UserCheck, 
  Monitor, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface RateLogSample {
  id: number;
  fechaHora: string;
  codUsua: string;
  codEsta: string;
  factorAnterior: number;
  factorNuevo: number;
  variacionPorc: number;
  docsRevaluados: number;
  observacion: string;
}

export const RatesHistoryView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [databaseName, setDatabaseName] = useState('BazarAdminDb');

  // Sample data simulating a real audit trail in ADD_Factor
  const [historyLogs] = useState<RateLogSample[]>([
    {
      id: 104,
      fechaHora: '2026-10-24 07:40:28',
      codUsua: '001',
      codEsta: 'ESTA01',
      factorAnterior: 48.2500,
      factorNuevo: 49.1000,
      variacionPorc: 1.76,
      docsRevaluados: 182,
      observacion: 'Tasa oficial BCV jornada de la mañana'
    },
    {
      id: 103,
      fechaHora: '2026-10-23 08:05:12',
      codUsua: 'SUPERV',
      codEsta: 'ESTA03',
      factorAnterior: 47.8000,
      factorNuevo: 48.2500,
      variacionPorc: 0.94,
      docsRevaluados: 179,
      observacion: 'Actualización diaria tasa BCV'
    },
    {
      id: 102,
      fechaHora: '2026-10-21 16:30:45',
      codUsua: '001',
      codEsta: 'SERVER',
      factorAnterior: 46.9000,
      factorNuevo: 47.8000,
      variacionPorc: 1.92,
      docsRevaluados: 174,
      observacion: 'Cierre de operaciones vespertino'
    },
    {
      id: 101,
      fechaHora: '2026-10-20 08:00:10',
      codUsua: 'CAJA01',
      codEsta: 'ESTA02',
      factorAnterior: 46.5000,
      factorNuevo: 46.9000,
      variacionPorc: 0.86,
      docsRevaluados: 168,
      observacion: 'Apertura de caja diaria'
    }
  ]);

  const historicalSql = `-- ==============================================================================
-- SAINT ENTERPRISE - TABLA DE EXTENSION PARA HISTORICO DE TASAS: ADD_Factor
-- Nomenclatura oficial de integrador: prefijo ADD_ para tablas personalizadas
-- Campos de auditoría Saint: CodUsua (Usuario), CodEsta (Estación), CodSucu
-- ==============================================================================
USE [${databaseName || 'BazarAdminDb'}];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ------------------------------------------------------------------------------
-- PASO 1: Creación de la tabla de extensión ADD_Factor
-- ------------------------------------------------------------------------------
IF OBJECT_ID('dbo.ADD_Factor', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ADD_Factor (
        ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY CLUSTERED,
        FechaHora DATETIME NOT NULL CONSTRAINT DF_ADD_Factor_Fecha DEFAULT (GETDATE()),
        CodSucu VARCHAR(10) NULL,
        CodUsua VARCHAR(20) NOT NULL CONSTRAINT DF_ADD_Factor_CodUsua DEFAULT ('001'),
        CodEsta VARCHAR(20) NOT NULL CONSTRAINT DF_ADD_Factor_CodEsta DEFAULT (HOST_NAME()),
        FactorAnterior DECIMAL(28, 4) NOT NULL,
        FactorNuevo DECIMAL(28, 4) NOT NULL,
        VariacionPorc AS (ROUND(((FactorNuevo - FactorAnterior) / NULLIF(FactorAnterior, 0)) * 100.0, 2)),
        DocsRevaluados INT NULL DEFAULT 0,
        UsuarioSQL VARCHAR(100) NOT NULL CONSTRAINT DF_ADD_Factor_UserSQL DEFAULT (SUSER_SNAME()),
        HostWindows VARCHAR(100) NOT NULL CONSTRAINT DF_ADD_Factor_HostWin DEFAULT (HOST_NAME()),
        Observacion VARCHAR(255) NULL
    );

    CREATE NONCLUSTERED INDEX IX_ADD_Factor_FechaHora
    ON dbo.ADD_Factor (FechaHora DESC);

    PRINT 'Tabla de extensión ADD_Factor creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla ADD_Factor ya existe en la base de datos.';
END;
GO

-- ------------------------------------------------------------------------------
-- PASO 2: Trigger Integrado en SACONF con inserción en ADD_Factor
-- ------------------------------------------------------------------------------
ALTER TRIGGER [dbo].[TRG_SACONF_UPDATE_FACTOR_SAACXC]
ON [dbo].[SACONF]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(Factor)
    BEGIN
        DECLARE @NuevoFactor DECIMAL(28, 4);
        DECLARE @FactorAnterior DECIMAL(28, 4);
        DECLARE @CodSucu VARCHAR(10);
        DECLARE @CodUsua VARCHAR(20);
        DECLARE @CodEsta VARCHAR(20);
        DECLARE @TotalDocsAfectados INT = 0;

        SELECT TOP 1 
            @NuevoFactor = i.Factor,
            @FactorAnterior = d.Factor,
            @CodSucu = i.CodSucu
        FROM INSERTED i
        LEFT JOIN DELETED d ON i.CodSucu = d.CodSucu;

        -- Identificación de usuario y estación de Saint Enterprise
        -- Si en la sesión o contexto existe CodUsua/CodEsta se toma, de lo contrario fallback seguro
        SET @CodUsua = ISNULL(CAST(SESSION_CONTEXT(N'CodUsua') AS VARCHAR(20)), SUSER_SNAME());
        SET @CodEsta = ISNULL(CAST(SESSION_CONTEXT(N'CodEsta') AS VARCHAR(20)), HOST_NAME());

        -- Valida que el factor sea válido y haya cambiado de valor
        IF (@NuevoFactor IS NOT NULL AND @NuevoFactor > 0 AND (@FactorAnterior IS NULL OR @NuevoFactor <> @FactorAnterior))
        BEGIN
            -- 1. Actualización en SAACxC usando SaldoMEx (Facturas 10, ND 20, 27, Giros 60, Cuotas 70)
            UPDATE dbo.SAACxC
            SET 
                Monto = ROUND(@NuevoFactor * MontoMEx, 2),
                Saldo = ROUND(@NuevoFactor * SaldoMEx, 2),
                Factor = @NuevoFactor
            WHERE Saldo > 0 
              AND ISNULL(MontoMEx, 0) > 0
              AND TipoCxC IN ('10', '20', '27', '60', '70');

            SET @TotalDocsAfectados = @@ROWCOUNT;

            -- 2. Sincronización inmediata de SACLIE.Saldo
            ;WITH CTE_DeudaActualizada AS (
                SELECT 
                    CodClie,
                    ROUND(SUM(
                        CASE 
                            WHEN TipoCxC IN ('10','20','27','35','60','70') THEN Saldo
                            WHEN TipoCxC IN ('31','36','37','41') THEN -Saldo
                            ELSE 0.00
                        END
                    ), 2) AS SaldoDeudaReal
                FROM dbo.SAACxC
                WHERE Saldo <> 0 
                  AND TipoCxC NOT IN ('50','25')
                GROUP BY CodClie
            )
            UPDATE CL
            SET CL.Saldo = ISNULL(D.SaldoDeudaReal, 0.00)
            FROM dbo.SACLIE CL
            INNER JOIN CTE_DeudaActualizada D ON CL.CodClie = D.CodClie
            WHERE CL.Saldo <> ISNULL(D.SaldoDeudaReal, 0.00);

            -- 3. Inserción en la tabla de extensión ADD_Factor
            INSERT INTO dbo.ADD_Factor (
                CodSucu,
                CodUsua,
                CodEsta,
                FactorAnterior,
                FactorNuevo,
                DocsRevaluados,
                Observacion
            )
            VALUES (
                @CodSucu,
                @CodUsua,
                @CodEsta,
                ISNULL(@FactorAnterior, @NuevoFactor),
                @NuevoFactor,
                @TotalDocsAfectados,
                'Actualización de factor con recálculo por SaldoMEx'
            );
        END
    END
END;
GO

-- ------------------------------------------------------------------------------
-- CONSULTA 1: Últimos 30 cambios en ADD_Factor con CodUsua y CodEsta
-- ------------------------------------------------------------------------------
SELECT TOP 30
    ID,
    CONVERT(varchar(19), FechaHora, 120) AS Fecha_Hora,
    CodUsua AS [Cod. Usuario],
    CodEsta AS [Cod. Estación],
    FactorAnterior AS [Tasa Anterior],
    FactorNuevo AS [Nueva Tasa],
    VariacionPorc AS [% Variación],
    DocsRevaluados AS [Docs CxC Actualizados],
    Observacion
FROM dbo.ADD_Factor
ORDER BY FechaHora DESC;

-- ------------------------------------------------------------------------------
-- CONSULTA 2: Detección de Errores de Tipeo (Saltos > 20% en un solo cambio)
-- ------------------------------------------------------------------------------
SELECT 
    ID,
    FechaHora,
    CodUsua,
    CodEsta,
    FactorAnterior,
    FactorNuevo,
    VariacionPorc,
    '⚠️ ALERTA: Salto cambiario anormal. Verificar error de digitación.' AS Alerta
FROM dbo.ADD_Factor
WHERE ABS(VariacionPorc) > 20.0
ORDER BY FechaHora DESC;
GO
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(historicalSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `Saint_Historico_Tasas_Cambio_${databaseName}.sql`;
    const blob = new Blob([historicalSql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Strategic Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/50 border border-emerald-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Veredicto de Ingeniería de Datos
              </span>
              <span className="text-xs text-slate-400">Canal Integrador Saint</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              ¿Es buena idea tener un histórico de tasas de cambio?
            </h2>
            <div className="p-3.5 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl text-slate-200 text-sm leading-relaxed max-w-4xl">
              <p className="font-semibold text-emerald-300 mb-1">
                SÍ, ES TOTALMENTE IMPRESCINDIBLE.
              </p>
              <p className="text-slate-300">
                En Saint Enterprise, la tabla <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">SACONF</code> solo guarda el factor actual (un único registro sobreescribible). 
                Al implementar una tabla de histórico (<code className="text-emerald-300 font-mono">dbo.ADD_Factor</code>) conectada al trigger, se obtiene trazabilidad legal, auditoría forense ante reclamos de clientes, cálculo exacto de diferencial cambiario fiscal y protección contra errores de digitación (ej: pulsar un cero de más).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copiar DDL + Trigger</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .SQL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Strategic Reasons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <UserCheck className="w-4 h-4" />
            <span>1. Auditoría Forense y Reclamos</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Si un cliente reclama que pagó con una tasa errónea, la bitácora prueba la fecha y hora exacta del cambio, la estación de trabajo y el usuario responsable.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>2. Prevención de Errores de Tipeo</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Si un usuario escribe por equivocación <code className="text-slate-200 font-mono">490.00</code> en lugar de <code className="text-slate-200 font-mono">49.00</code>, la bitácora registra el salto y permite revertir al factor anterior inmediatamente.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>3. Diferencial Cambiario Fiscal</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            En contabilidad fiscal venezolana/latinoamericana, la ganancia o pérdida cambiaria requiere confrontar la tasa del día de la factura vs la del cobro.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <span>4. Cierres Mensuales y Reconciliación</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Permite reconstruir el estado de cuenta histórico de cualquier cliente a cualquier fecha pasada usando la tasa que regía en ese instante.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Monitor className="w-4 h-4" />
            <span>5. Cero Sobrecarga de Servidor</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Al registrarse únicamente cuando cambia el factor (1 a 2 veces al día), el consumo de disco y memoria en SQL Server es de apenas unos pocos kilobytes al año.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl space-y-2 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>6. Integración Total con el Trigger</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            El trigger inserta automáticamente el registro en la bitácora sin requerir pantallas adicionales en Saint ni desarrollo externo.
          </p>
        </div>
      </div>

      {/* Simulated History Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              Vista Previa de la Bitácora Histórica (Simulación en Vivo)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Así se visualizarán las consultas de auditoría en SQL Server Management Studio.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg">
            dbo.ADD_Factor
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-3.5 py-3">ID</th>
                  <th className="px-3.5 py-3">Fecha y Hora</th>
                  <th className="px-3.5 py-3 text-right">Tasa Anterior</th>
                  <th className="px-3.5 py-3 text-right text-emerald-300">Nueva Tasa</th>
                  <th className="px-3.5 py-3 text-center">% Variación</th>
                  <th className="px-3.5 py-3">Cod. Usuario (CodUsua)</th>
                  <th className="px-3.5 py-3">Cod. Estación (CodEsta)</th>
                  <th className="px-3.5 py-3 text-center">Docs Revaluados</th>
                  <th className="px-3.5 py-3">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {historyLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-3.5 py-3 text-slate-500 font-bold">#{log.id}</td>
                    <td className="px-3.5 py-3 text-slate-300">{log.fechaHora}</td>
                    <td className="px-3.5 py-3 text-right text-slate-400">{log.factorAnterior.toFixed(4)}</td>
                    <td className="px-3.5 py-3 text-right font-bold text-emerald-400">{log.factorNuevo.toFixed(4)}</td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <ArrowUpRight className="w-3 h-3" /> +{log.variacionPorc.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-3.5 py-3 font-sans text-cyan-300 font-medium">{log.codUsua}</td>
                    <td className="px-3.5 py-3 font-sans text-slate-300">{log.codEsta}</td>
                    <td className="px-3.5 py-3 text-center text-white font-bold">{log.docsRevaluados} docs</td>
                    <td className="px-3.5 py-3 font-sans text-slate-400 text-[11px]">{log.observacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-white">
              Script DDL + Trigger con Auditoría Automática para SSMS
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Base de Datos:</span>
            <input
              type="text"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500 w-44"
              placeholder="BazarAdminDb"
            />
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96 select-all">
            {historicalSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
