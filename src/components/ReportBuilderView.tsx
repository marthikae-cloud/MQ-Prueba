import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Filter, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  Printer,
  LayoutTemplate,
  Eye,
  Code2,
  Database,
  Terminal
} from 'lucide-react';

interface LocalClienteRow {
  codClie: string;
  descrip: string;
  rif: string;
  saldoBs: number;
  saldoUsd: number;
  pagosABs: number;
  pagosAUsd: number;
  saldoNetoBs: number;
  saldoNetoUsd: number;
  cuotasPendientes: number;
  fechaCuotaMasAntigua: string | null;
  ultimaFechaPago: string | null;
  ultimoMontoPagoBs: number | null;
  ultimoMontoPagoUsd: number | null;
  ultimoNroDoc: string | null;
  diasSinPagar: number | null;
  estado: 'SOLVENTE' | 'DEUDOR' | 'A_FAVOR';
}

export const ReportBuilderView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [copiedQueryOnly, setCopiedQueryOnly] = useState(false);
  const [copiedRap, setCopiedRap] = useState(false);
  const [databaseName, setDatabaseName] = useState('BazarAdminDb');
  const [tasaCambio, setTasaCambio] = useState<number>(49.10);
  const [filtroEstado, setFiltroEstado] = useState<'0' | '1' | '2' | '3'>('0');
  const [useSaldoNeto, setUseSaldoNeto] = useState<boolean>(true);
  const [paramSyntax, setParamSyntax] = useState<'colon' | 'at'>('colon');
  const [zebraStriping, setZebraStriping] = useState<boolean>(true);
  const [tabMode, setTabMode] = useState<'sheet' | 'blueprint' | 'case_guide' | 'table'>('sheet');
  const [copiedCaseSnippet, setCopiedCaseSnippet] = useState<string | null>(null);

  const copyToClipboardSnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaseSnippet(id);
    setTimeout(() => setCopiedCaseSnippet(null), 2500);
  };

  // Sample data representing Bazar shopping center tenants / commercial locals
  const sampleLocales: LocalClienteRow[] = [
    {
      codClie: 'LOC-101',
      descrip: 'Boutique Glamour C.A.',
      rif: 'J-30489123-1',
      saldoBs: 0.00,
      saldoUsd: 0.00,
      pagosABs: 491.00,
      pagosAUsd: 10.00,
      saldoNetoBs: -491.00,
      saldoNetoUsd: -10.00,
      cuotasPendientes: 0,
      fechaCuotaMasAntigua: null,
      ultimaFechaPago: '2026-10-22',
      ultimoMontoPagoBs: 7365.00,
      ultimoMontoPagoUsd: 150.00,
      ultimoNroDoc: 'COB-00892',
      diasSinPagar: 2,
      estado: 'A_FAVOR'
    },
    {
      codClie: 'LOC-102',
      descrip: 'Cafetería Espresso Bazar',
      rif: 'J-40112948-5',
      saldoBs: 0.00,
      saldoUsd: 0.00,
      pagosABs: 0.00,
      pagosAUsd: 0.00,
      saldoNetoBs: 0.00,
      saldoNetoUsd: 0.00,
      cuotasPendientes: 0,
      fechaCuotaMasAntigua: null,
      ultimaFechaPago: '2026-10-20',
      ultimoMontoPagoBs: 4910.00,
      ultimoMontoPagoUsd: 100.00,
      ultimoNroDoc: 'COB-00874',
      diasSinPagar: 4,
      estado: 'SOLVENTE'
    },
    {
      codClie: 'LOC-103',
      descrip: 'TecnoAccesorios Móvil Express',
      rif: 'V-18459203-0',
      saldoBs: 14730.00,
      saldoUsd: 300.00,
      pagosABs: 0.00,
      pagosAUsd: 0.00,
      saldoNetoBs: 14730.00,
      saldoNetoUsd: 300.00,
      cuotasPendientes: 3,
      fechaCuotaMasAntigua: '2026-07-05',
      ultimaFechaPago: '2026-09-15',
      ultimoMontoPagoBs: 9820.00,
      ultimoMontoPagoUsd: 200.00,
      ultimoNroDoc: 'COB-00750',
      diasSinPagar: 39,
      estado: 'DEUDOR'
    },
    {
      codClie: 'LOC-104',
      descrip: 'Óptica Visión Clara',
      rif: 'J-50123984-2',
      saldoBs: 3928.00,
      saldoUsd: 80.00,
      pagosABs: 1964.00,
      pagosAUsd: 40.00,
      saldoNetoBs: 1964.00,
      saldoNetoUsd: 40.00,
      cuotasPendientes: 1,
      fechaCuotaMasAntigua: '2026-10-01',
      ultimaFechaPago: '2026-10-10',
      ultimoMontoPagoBs: 5892.00,
      ultimoMontoPagoUsd: 120.00,
      ultimoNroDoc: 'COB-00841',
      diasSinPagar: 14,
      estado: 'DEUDOR'
    },
    {
      codClie: 'LOC-105',
      descrip: 'Peluquería & Spa Unisex',
      rif: 'V-15894120-4',
      saldoBs: 0.00,
      saldoUsd: 0.00,
      pagosABs: 0.00,
      pagosAUsd: 0.00,
      saldoNetoBs: 0.00,
      saldoNetoUsd: 0.00,
      cuotasPendientes: 0,
      fechaCuotaMasAntigua: null,
      ultimaFechaPago: '2026-10-23',
      ultimoMontoPagoBs: 11784.00,
      ultimoMontoPagoUsd: 240.00,
      ultimoNroDoc: 'COB-00898',
      diasSinPagar: 1,
      estado: 'SOLVENTE'
    },
    {
      codClie: 'LOC-106',
      descrip: 'Calzados & Modas Andina',
      rif: 'J-31849201-9',
      saldoBs: 24550.00,
      saldoUsd: 500.00,
      pagosABs: 0.00,
      pagosAUsd: 0.00,
      saldoNetoBs: 24550.00,
      saldoNetoUsd: 500.00,
      cuotasPendientes: 5,
      fechaCuotaMasAntigua: '2026-05-01',
      ultimaFechaPago: null,
      ultimoMontoPagoBs: null,
      ultimoMontoPagoUsd: null,
      ultimoNroDoc: null,
      diasSinPagar: null,
      estado: 'DEUDOR'
    }
  ];

  // Filter dynamic simulation
  const filteredLocales = sampleLocales.filter(loc => {
    const isSolvente = useSaldoNeto ? loc.saldoNetoBs <= 0.01 : loc.saldoBs <= 0.01;
    const isDeudor = useSaldoNeto ? loc.saldoNetoBs > 0.01 : loc.saldoBs > 0.01;

    if (filtroEstado === '1') return isSolvente;
    if (filtroEstado === '2') return isDeudor;
    if (filtroEstado === '3') return loc.pagosABs > 0;
    return true; // 0 = Todos
  });

  // Generate T-SQL script for Report Builder
  const reportBuilderSql = `-- ==============================================================================
-- SAINT ENTERPRISE ADMINISTRATIVO - CONSULTA PARA REPORT BUILDER / SSRS
-- REPORTE: ESTADO DE CUENTA DE LOCALES / CLIENTES CON CONVERSION MULTIMONEDA
-- BASE DE DATOS: ${databaseName || 'BazarAdminDb'}
-- ==============================================================================
-- PARAMETROS REPORT BUILDER:
--   @FiltroEstado: 
--      0 = 'TODOS'      -> Muestra la totalidad de locales/clientes
--      1 = 'SOLVENTES'  -> Muestra solo locales al día (Saldo Neto <= 0)
--      2 = 'DEUDORES'   -> Muestra solo locales morosos (Saldo Neto > 0)
--   @TasaDiaParam:
--      0 o NULL         -> Toma automáticamente la tasa vigente de SACONF.Factor
--      Valor numérico   -> Permite simular el reporte a una tasa manual específica
-- ==============================================================================

USE [${databaseName || 'BazarAdminDb'}];
GO

-- Declaración de parámetros para ejecución de prueba en SSMS:
DECLARE @FiltroEstado   INT = ${filtroEstado};            -- 0: Todos | 1: Solventes | 2: Con Deuda
DECLARE @TasaDiaParam   DECIMAL(28, 4) = ${tasaCambio};  -- Si es 0 o NULL, toma la tasa de SACONF

SET NOCOUNT ON;

-- 1. Determinar la Tasa de Cambio del Día
DECLARE @TasaDia DECIMAL(28, 4);

IF (@TasaDiaParam IS NOT NULL AND @TasaDiaParam > 0)
    SET @TasaDia = @TasaDiaParam;
ELSE
    SELECT TOP 1 @TasaDia = ISNULL(Factor, 1.0000) FROM dbo.SACONF;

-- Prevenir división por cero si la tabla de configuración no tuviera tasa válida
IF (@TasaDia IS NULL OR @TasaDia <= 0)
    SET @TasaDia = 1.0000;

-- 2. CTE para contabilizar Cuotas (70) y Facturas (10) Vivas Pendientes de Pago
;WITH CTE_DocsPendientes AS (
    SELECT 
        CodClie,
        -- Facturas (10) y Cuotas (70) vivas pendientes con saldo > 0
        COUNT(CASE WHEN TipoCxC IN ('10', '70') THEN 1 END) AS CuotasPendientes,
        -- Total de todos los documentos vivos pendientes con saldo > 0
        COUNT(*)                                             AS TotalDocsPendientes,
        -- Fecha de la cuota o factura pendiente más antigua
        MIN(FechaE)                                          AS FechaCuotaMasAntigua
    FROM dbo.SAACxC
    WHERE Saldo > 0 
      AND TipoCxC IN ('10', '20', '27', '60', '70')
    GROUP BY CodClie
),
-- 3. CTE para obtener el Último Pago Registrado por Local/Cliente (TipoCxC = '41')
CTE_UltimoPago AS (
    SELECT 
        CodClie,
        FechaE                      AS UltimaFechaPago,
        NumeroD                     AS UltimoNroRecibo,
        Monto                       AS UltimoMontoPago_Bs,
        ISNULL(MontoMEx, ROUND(Monto / NULLIF(@TasaDia, 0), 2)) AS UltimoMontoPago_USD,
        ROW_NUMBER() OVER (
            PARTITION BY CodClie 
            ORDER BY FechaE DESC, NroUnico DESC
        ) AS FilaReciente
    FROM dbo.SAACxC
    WHERE TipoCxC = '41' -- Pagos recibidos / Cobros
)
-- 4. Consulta Principal para el Dataset de Report Builder
SELECT 
    -- Datos del Local / Cliente
    CL.CodClie                                    AS [CodLocal],
    CL.Descrip                                    AS [NombreLocal_Cliente],
    CL.ID3                                        AS [RIF_Cedula],
    ISNULL(CL.Telef, '')                          AS [Telefono],
    
    -- Tasa aplicada en el reporte
    @TasaDia                                      AS [TasaCambio_Aplicada],

    -- Cuotas y Facturas Pendientes de Cobro (¡NUEVO!)
    ISNULL(DP.CuotasPendientes, 0)                AS [CuotasPendientes],
    ISNULL(DP.TotalDocsPendientes, 0)             AS [TotalDocsPendientes],
    DP.FechaCuotaMasAntigua                       AS [FechaCuotaMasAntigua],

    -- Saldos de Documentos de Deuda (Facturas, ND, Giros)
    ROUND(ISNULL(CL.Saldo, 0.00), 2)              AS [SaldoDeuda_Bs],
    ROUND(ISNULL(CL.Saldo, 0.00) / @TasaDia, 2)   AS [SaldoDeuda_USD],

    -- Saldos de Anticipos Disponibles (Tipo 50 menos 25)
    ROUND(ISNULL(CL.PagosA, 0.00), 2)             AS [Anticipos_Bs],
    ROUND(ISNULL(CL.PagosA, 0.00) / @TasaDia, 2)  AS [Anticipos_USD],

    -- Posición Neta de Cartera (Deuda Bruta menos Anticipos a Favor)
    ROUND(ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00), 2)             AS [SaldoNeto_Bs],
    ROUND((ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) / @TasaDia, 2) AS [SaldoNeto_USD],

    -- Auditoría del Último Pago Efectuado
    UP.UltimaFechaPago                            AS [FechaUltimoPago],
    ISNULL(UP.UltimoNroRecibo, 'SIN PAGOS')        AS [ReciboUltimoPago],
    ROUND(ISNULL(UP.UltimoMontoPago_Bs, 0.00), 2) AS [MontoUltimoPago_Bs],
    ROUND(ISNULL(UP.UltimoMontoPago_USD, 0.00), 2) AS [MontoUltimoPago_USD],
    DATEDIFF(DAY, UP.UltimaFechaPago, GETDATE())   AS [DiasDesdeUltimoPago],

    -- Clasificación de Solvencia
    CASE 
        WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00 THEN 'SOLVENTE'
        ELSE 'CON DEUDA'
    END AS [EstadoSolvencia],

    CASE 
        WHEN ISNULL(CL.PagosA, 0.00) > 0 AND (ISNULL(CL.Saldo, 0.00) <= 0.00) THEN 'TIENE ANTICIPOS A FAVOR'
        WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00 THEN 'AL DIA / SOLVENTE'
        WHEN DATEDIFF(DAY, UP.UltimaFechaPago, GETDATE()) > 30 THEN 'MOROSO (> 30 DIAS SIN PAGO)'
        ELSE 'CON SALDO PENDIENTE'
    END AS [DetalleEstatus],

    -- Bandera para Zebra Striping / Filas Alternas (0 = Blanco, 1 = Sombreado)
    (ROW_NUMBER() OVER (
        PARTITION BY (CASE WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) > 0 THEN 0 ELSE 1 END)
        ORDER BY (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) DESC, CL.CodClie ASC
    ) % 2) AS [FilaAlterna]

FROM dbo.SACLIE CL
LEFT JOIN CTE_DocsPendientes DP 
    ON CL.CodClie = DP.CodClie
LEFT JOIN CTE_UltimoPago UP 
    ON CL.CodClie = UP.CodClie AND UP.FilaReciente = 1

WHERE 
    -- Filtro de Parámetro de Solvencia:
    (
        @FiltroEstado = 0  -- 0: Todos los Locales
        OR (@FiltroEstado = 1 AND (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00) -- 1: Solo Solventes
        OR (@FiltroEstado = 2 AND (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) > 0.00)  -- 2: Solo con Deuda
    )

ORDER BY 
    CASE WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) > 0 THEN 0 ELSE 1 END,
    (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) DESC,
    CL.CodClie ASC;
GO
`;

  // Native Saint ReportBuilder (Delphi DADE / ADO) query with colon : prefix
  const reportBuilderSqlColon = `-- ==============================================================================
-- SAINT ENTERPRISE ADMINISTRATIVO - CONSULTA PARA SAINT REPORT BUILDER
-- SINTAXIS NATIVA CON DOS PUNTOS (:FiltroEstado, :TasaDiaParam)
-- MOTOR: DELPHI DADE / ADO DATA PIPELINE | BASE DE DATOS: ${databaseName || 'BazarAdminDb'}
-- ==============================================================================
-- ¡IMPORTANTE!: En Saint ReportBuilder (desarrollado en Delphi), los parámetros
-- se declaran con DOS PUNTOS (:). Esto permite que el motor de reportes detecte
-- automáticamente el parámetro y genere el Diálogo de Petición al usuario.
--
-- PARAMETROS:
--   :FiltroEstado  -> 0: Todos los Locales | 1: Solo Solventes | 2: Con Deuda
--   :TasaDiaParam  -> 0: Automática de SACONF.Factor | > 0: Tasa Manual en Divisas
-- ==============================================================================

USE [${databaseName || 'BazarAdminDb'}];
GO

;WITH CTE_Tasa AS (
    SELECT 
        CASE 
            WHEN :TasaDiaParam > 0 THEN CAST(:TasaDiaParam AS DECIMAL(28, 4))
            ELSE ISNULL((SELECT TOP 1 Factor FROM dbo.SACONF), 1.0000)
        END AS TasaDia
),
CTE_DocsPendientes AS (
    SELECT 
        CodClie,
        -- Facturas (10) y Cuotas (70) vivas pendientes con saldo > 0
        COUNT(CASE WHEN TipoCxC IN ('10', '70') THEN 1 END) AS CuotasPendientes,
        -- Total de todos los documentos vivos pendientes con saldo > 0
        COUNT(*)                                             AS TotalDocsPendientes,
        -- Fecha de la cuota o factura pendiente más antigua
        MIN(FechaE)                                          AS FechaCuotaMasAntigua
    FROM dbo.SAACxC
    WHERE Saldo > 0 
      AND TipoCxC IN ('10', '20', '27', '60', '70')
    GROUP BY CodClie
),
CTE_UltimoPago AS (
    SELECT 
        CodClie,
        FechaE                                                   AS UltimaFechaPago,
        NumeroD                                                  AS UltimoNroRecibo,
        Monto                                                    AS UltimoMontoPago_Bs,
        ISNULL(MontoMEx, ROUND(Monto / NULLIF(Factor, 0), 2))    AS UltimoMontoPago_USD,
        ROW_NUMBER() OVER (
            PARTITION BY CodClie 
            ORDER BY FechaE DESC, NroUnico DESC
        ) AS FilaReciente
    FROM dbo.SAACxC
    WHERE TipoCxC = '41' -- Pagos recibidos / Cobros en Saint Enterprise
)
SELECT 
    -- Datos del Local / Arrendatario
    CL.CodClie                                               AS [CodLocal],
    CL.Descrip                                               AS [NombreLocal_Cliente],
    CL.ID3                                                   AS [RIF_Cedula],
    ISNULL(CL.Telef, '')                                     AS [Telefono],
    
    -- Tasa aplicada
    T.TasaDia                                                AS [TasaCambio_Aplicada],

    -- Cuotas y Facturas Pendientes de Cobro (¡NUEVO!)
    ISNULL(DP.CuotasPendientes, 0)                            AS [CuotasPendientes],
    ISNULL(DP.TotalDocsPendientes, 0)                         AS [TotalDocsPendientes],
    DP.FechaCuotaMasAntigua                                   AS [FechaCuotaMasAntigua],

    -- Deuda Bruta en Documentos
    ROUND(ISNULL(CL.Saldo, 0.00), 2)                         AS [SaldoDeuda_Bs],
    ROUND(ISNULL(CL.Saldo, 0.00) / T.TasaDia, 2)             AS [SaldoDeuda_USD],

    -- Anticipos Disponibles a Favor (50 - 25)
    ROUND(ISNULL(CL.PagosA, 0.00), 2)                        AS [Anticipos_Bs],
    ROUND(ISNULL(CL.PagosA, 0.00) / T.TasaDia, 2)            AS [Anticipos_USD],

    -- Posición Neta de Cartera (Deuda Bruta menos Anticipos a Favor)
    ROUND(ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00), 2)             AS [SaldoNeto_Bs],
    ROUND((ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) / T.TasaDia, 2) AS [SaldoNeto_USD],

    -- Auditoría del Último Pago
    UP.UltimaFechaPago                                       AS [FechaUltimoPago],
    ISNULL(UP.UltimoNroRecibo, 'SIN PAGOS')                   AS [ReciboUltimoPago],
    ROUND(ISNULL(UP.UltimoMontoPago_Bs, 0.00), 2)            AS [MontoUltimoPago_Bs],
    ROUND(ISNULL(UP.UltimoMontoPago_USD, 0.00), 2)           AS [MontoUltimoPago_USD],
    DATEDIFF(DAY, UP.UltimaFechaPago, GETDATE())              AS [DiasDesdeUltimoPago],

    -- Clasificación de Solvencia
    CASE 
        WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00 THEN 'SOLVENTE'
        ELSE 'CON DEUDA'
    END AS [EstadoSolvencia],

    CASE 
        WHEN ISNULL(CL.PagosA, 0.00) > 0 AND (ISNULL(CL.Saldo, 0.00) <= 0.00) THEN 'TIENE ANTICIPOS A FAVOR'
        WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00 THEN 'AL DIA / SOLVENTE'
        WHEN DATEDIFF(DAY, UP.UltimaFechaPago, GETDATE()) > 30 THEN 'MOROSO (> 30 DIAS SIN PAGO)'
        ELSE 'CON SALDO PENDIENTE'
    END AS [DetalleEstatus],

    -- Bandera para Zebra Striping / Filas Alternas en ReportBuilder (0 = Blanco, 1 = Sombreado)
    (ROW_NUMBER() OVER (
        PARTITION BY (CASE WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) > 0 THEN 0 ELSE 1 END)
        ORDER BY (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) DESC, CL.CodClie ASC
    ) % 2) AS [FilaAlterna]

FROM dbo.SACLIE CL
CROSS JOIN CTE_Tasa T
LEFT JOIN CTE_DocsPendientes DP 
    ON CL.CodClie = DP.CodClie
LEFT JOIN CTE_UltimoPago UP 
    ON CL.CodClie = UP.CodClie AND UP.FilaReciente = 1

WHERE 
    -- Parámetros nativos con dos puntos (:) para Saint ReportBuilder
    (
        :FiltroEstado = 0  -- 0: Todos los Locales
        OR (:FiltroEstado = 1 AND (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00) -- 1: Solo Solventes
        OR (:FiltroEstado = 2 AND (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) > 0.00)  -- 2: Solo con Deuda
    )

ORDER BY 
    CASE WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) > 0 THEN 0 ELSE 1 END,
    (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) DESC,
    CL.CodClie ASC;
`;

  const activeSql = paramSyntax === 'colon' ? reportBuilderSqlColon : reportBuilderSql;

  const handleCopyFull = () => {
    navigator.clipboard.writeText(activeSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `Saint_ReportBuilder_${paramSyntax === 'colon' ? 'Delphi_Colon' : 'SSMS_At'}_Locales_Solvencia_${databaseName}.sql`;
    const blob = new Blob([activeSql], { type: 'text/plain;charset=utf-8' });
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border border-blue-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <FileText className="w-4 h-4 text-blue-400" /> Saint Report Builder & SSRS
              </span>
              <span className="text-xs text-slate-400">Canal Integrador Saint • BazarAdminDb</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Consulta de Locales & Solvencia en Divisas (Con Parámetros)
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Query optimizado de alto rendimiento para Report Builder. Convierte automáticamente 
              saldos de deuda y anticipos (<code className="text-amber-300 font-mono">SACLIE.PagosA</code>) a dólares usando la tasa del día de <code className="text-blue-300 font-mono">SACONF.Factor</code>, calcula la posición neta e incorpora el último pago (<code className="text-emerald-300 font-mono">TipoCxC = 41</code>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
            <button
              onClick={handleCopyFull}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado al Portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copiar Query T-SQL</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md shadow-blue-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .SQL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Report Builder Parameter Simulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Simulador de Parámetros del Reporte</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Database Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Base de Datos:</span>
              <input
                type="text"
                value={databaseName}
                onChange={(e) => setDatabaseName(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500 w-36"
                placeholder="BazarAdminDb"
              />
            </div>

            {/* Rate Input */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Tasa del Día (Bs/$):</span>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={tasaCambio}
                  onChange={(e) => setTasaCambio(parseFloat(e.target.value) || 1)}
                  className="bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-2 py-1 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500 w-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setFiltroEstado('0')}
            className={`p-3 rounded-xl border text-left transition ${
              filtroEstado === '0'
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Parámetro @FiltroEstado = 0</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono">TODOS</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">Todos los Locales</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Muestra la cartera completa del Bazar</p>
          </button>

          <button
            onClick={() => setFiltroEstado('1')}
            className={`p-3 rounded-xl border text-left transition ${
              filtroEstado === '1'
                ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300">Parámetro @FiltroEstado = 1</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">SOLVENTES</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">Solo Locales Solventes</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Saldo neto {'<='} 0 (al día o con saldo a favor)</p>
          </button>

          <button
            onClick={() => setFiltroEstado('2')}
            className={`p-3 rounded-xl border text-left transition ${
              filtroEstado === '2'
                ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-300">Parámetro @FiltroEstado = 2</span>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-mono font-bold">DEUDORES</span>
            </div>
            <div className="text-sm font-bold text-white mt-1">Solo Locales con Deuda</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Saldo neto {'>'} 0 (pendientes de cobro)</p>
          </button>
        </div>

        {/* Toggle Net Balance vs Gross Debt */}
        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Criterio de Solvencia:</span>
            <span className="text-slate-400">
              {useSaldoNeto 
                ? 'Posición Neta: Considera Deuda - Anticipos PagosA (Recomendado para centros comerciales/Bazar)'
                : 'Deuda Bruta: Considera únicamente SACLIE.Saldo sin descontar anticipos'}
            </span>
          </div>
          <button
            onClick={() => setUseSaldoNeto(!useSaldoNeto)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            Cambiar a {useSaldoNeto ? 'Deuda Bruta' : 'Posición Neta (Deuda - PagosA)'}
          </button>
        </div>
      </div>

      {/* Sub-navigation for Report Design: Print Sheet, Blueprint, and Table */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setTabMode('sheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            tabMode === 'sheet'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Printer className="w-4 h-4 text-emerald-300" />
          <span>Hoja Impresa (Vista Previa de Diseño)</span>
        </button>

        <button
          onClick={() => setTabMode('blueprint')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            tabMode === 'blueprint'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 text-cyan-300" />
          <span>Plano de Bandas & Controles</span>
        </button>

        <button
          onClick={() => setTabMode('case_guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            tabMode === 'case_guide'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4 text-amber-300" />
          <span>Uso de CASE (SQL vs Pascal RAP)</span>
        </button>

        <button
          onClick={() => setTabMode('table')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            tabMode === 'table'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-purple-300" />
          <span>Datos Crudos del Dataset ({filteredLocales.length})</span>
        </button>
      </div>

      {/* 1. PRINT PREVIEW SHEET: White A4 format simulating real printed report */}
      {tabMode === 'sheet' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Printer className="w-4 h-4 text-emerald-400" /> 
              Simulación de Hoja Tamaño Carta / A4 en Saint Report Builder ({filteredLocales.length} de 2.714 Locales)
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZebraStriping(!zebraStriping)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${
                  zebraStriping 
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Activar o desactivar filas sombreadas intercaladas para lectura cómoda"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Rayado Cebra (Líneas Alternadas): <strong>{zebraStriping ? 'ACTIVADO' : 'DESACTIVADO'}</strong></span>
              </button>
              <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                Tasa: {tasaCambio.toFixed(4)} Bs/$
              </span>
            </div>
          </div>

          {/* Realistic White Paper Sheet */}
          <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 max-w-5xl mx-auto font-sans border border-slate-200">
            {/* Page Header Band */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    CENTRO COMERCIAL BAZAR ADMINISTRATIVO
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    RIF: J-31245678-0 • Administración de Inmuebles y Locales
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  <div>FECHA: 24/10/2026</div>
                  <div>HORA: 09:30:15 AM</div>
                  <div>PÁGINA: 1 de 1</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-base font-black uppercase tracking-wide text-slate-900">
                  ESTADO DE CUENTA Y SOLVENCIA DE LOCALES COMERCIALES
                </h3>
                <div className="text-xs text-slate-600 mt-0.5 font-medium flex items-center justify-center gap-2">
                  <span>Valores expresados en: <strong>DÓLARES AMERICANOS ($)</strong></span>
                  <span>•</span>
                  <span>Factor de Cambio Oficial: <strong>{tasaCambio.toFixed(4)} Bs/$</strong></span>
                  <span>•</span>
                  <span>Filtro: <strong>{filtroEstado === '0' ? 'TODOS LOS LOCALES' : filtroEstado === '1' ? 'SOLO SOLVENTES' : 'SOLO CON DEUDA'}</strong></span>
                </div>
              </div>
            </div>

            {/* Column Headers */}
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-800 font-bold uppercase text-[10px] bg-slate-100">
                  <th className="py-1.5 px-2">Código</th>
                  <th className="py-1.5 px-2">Local / Arrendatario</th>
                  <th className="py-1.5 px-2 text-center text-amber-900 bg-amber-50">Cuotas Pend.</th>
                  <th className="py-1.5 px-2 text-right">Deuda ($)</th>
                  <th className="py-1.5 px-2 text-right">Anticipos ($)</th>
                  <th className="py-1.5 px-2 text-right font-black">Saldo Neto ($)</th>
                  <th className="py-1.5 px-2 text-center">Último Pago</th>
                  <th className="py-1.5 px-2 text-right">Monto ($)</th>
                  <th className="py-1.5 px-2 text-center">Días</th>
                  <th className="py-1.5 px-2 text-center">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Group 1: Deudores */}
                {filteredLocales.filter(l => l.saldoNetoBs > 0.01).length > 0 && (
                  <>
                    <tr className="bg-red-50 text-red-900 font-bold text-[10px]">
                      <td colSpan={10} className="py-1 px-2 uppercase tracking-wide border-t border-b border-red-200">
                        🔴 GRUPO: LOCALES CON SALDO PENDIENTE ({filteredLocales.filter(l => l.saldoNetoBs > 0.01).length} LOCALES)
                      </td>
                    </tr>
                    {filteredLocales.filter(l => l.saldoNetoBs > 0.01).map((loc, idx) => {
                      const isAlternate = zebraStriping && (idx % 2 === 1);
                      return (
                        <tr 
                          key={loc.codClie} 
                          className={`transition-colors ${isAlternate ? 'bg-slate-100/80' : 'bg-white'} hover:bg-amber-50/70`}
                        >
                          <td className="py-1.5 px-2 font-mono font-bold text-slate-700">{loc.codClie}</td>
                          <td className="py-1.5 px-2">
                            <div className="font-semibold text-slate-900">{loc.descrip}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{loc.rif}</div>
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono">
                            {loc.cuotasPendientes > 0 ? (
                              <div>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  {loc.cuotasPendientes} {loc.cuotasPendientes === 1 ? 'cuota' : 'cuotas'}
                                </span>
                                {loc.fechaCuotaMasAntigua && (
                                  <div className="text-[9px] text-slate-500 mt-0.5">desde {loc.fechaCuotaMasAntigua}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-bold">-</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono">${(loc.saldoBs / tasaCambio).toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono">${(loc.pagosABs / tasaCambio).toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-red-700">
                            ${((loc.saldoBs - loc.pagosABs) / tasaCambio).toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[10px]">
                            {loc.ultimaFechaPago || 'Sin Pagos'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono">
                            {loc.ultimoMontoPagoUsd ? `$${loc.ultimoMontoPagoUsd.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[10px]">
                            {loc.diasSinPagar !== null ? `${loc.diasSinPagar} d` : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800">
                              MOROSO
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Subtotal Deudores */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-[10px]">
                      <td colSpan={2} className="py-1.5 px-2 text-right uppercase">SUBTOTAL DEUDORES:</td>
                      <td className="py-1.5 px-2 text-center font-mono text-amber-900 font-bold">
                        {filteredLocales.filter(l => l.saldoNetoBs > 0.01).reduce((acc, curr) => acc + curr.cuotasPendientes, 0)} cuotas
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        ${filteredLocales.filter(l => l.saldoNetoBs > 0.01).reduce((acc, curr) => acc + (curr.saldoBs / tasaCambio), 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        ${filteredLocales.filter(l => l.saldoNetoBs > 0.01).reduce((acc, curr) => acc + (curr.pagosABs / tasaCambio), 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-red-700">
                        ${filteredLocales.filter(l => l.saldoNetoBs > 0.01).reduce((acc, curr) => acc + ((curr.saldoBs - curr.pagosABs) / tasaCambio), 0).toFixed(2)}
                      </td>
                      <td colSpan={4}></td>
                    </tr>
                  </>
                )}

                {/* Group 2: Solventes */}
                {filteredLocales.filter(l => l.saldoNetoBs <= 0.01).length > 0 && (
                  <>
                    <tr className="bg-emerald-50 text-emerald-900 font-bold text-[10px]">
                      <td colSpan={10} className="py-1 px-2 uppercase tracking-wide border-t border-b border-emerald-200 mt-2">
                        🟢 GRUPO: LOCALES SOLVENTES / AL DÍA ({filteredLocales.filter(l => l.saldoNetoBs <= 0.01).length} LOCALES)
                      </td>
                    </tr>
                    {filteredLocales.filter(l => l.saldoNetoBs <= 0.01).map((loc, idx) => {
                      const isAlternate = zebraStriping && (idx % 2 === 1);
                      return (
                        <tr 
                          key={loc.codClie} 
                          className={`transition-colors ${isAlternate ? 'bg-slate-100/80' : 'bg-white'} hover:bg-emerald-50/70`}
                        >
                          <td className="py-1.5 px-2 font-mono font-bold text-slate-700">{loc.codClie}</td>
                          <td className="py-1.5 px-2">
                            <div className="font-semibold text-slate-900">{loc.descrip}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{loc.rif}</div>
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-slate-400">
                            0
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono">${(loc.saldoBs / tasaCambio).toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono">${(loc.pagosABs / tasaCambio).toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700">
                            ${((loc.saldoBs - loc.pagosABs) / tasaCambio).toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[10px]">
                            {loc.ultimaFechaPago || 'Sin Pagos'}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono">
                            {loc.ultimoMontoPagoUsd ? `$${loc.ultimoMontoPagoUsd.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-center font-mono text-[10px]">
                            {loc.diasSinPagar !== null ? `${loc.diasSinPagar} d` : '-'}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              SOLVENTE
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Subtotal Solventes */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-[10px]">
                      <td colSpan={2} className="py-1.5 px-2 text-right uppercase">SUBTOTAL SOLVENTES:</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-400">0</td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        ${filteredLocales.filter(l => l.saldoNetoBs <= 0.01).reduce((acc, curr) => acc + (curr.saldoBs / tasaCambio), 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">
                        ${filteredLocales.filter(l => l.saldoNetoBs <= 0.01).reduce((acc, curr) => acc + (curr.pagosABs / tasaCambio), 0).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-emerald-700">
                        ${filteredLocales.filter(l => l.saldoNetoBs <= 0.01).reduce((acc, curr) => acc + ((curr.saldoBs - curr.pagosABs) / tasaCambio), 0).toFixed(2)}
                      </td>
                      <td colSpan={4}></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            {/* Grand Summary Band */}
            <div className="mt-6 border-t-2 border-slate-900 pt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>RESUMEN GENERAL DEL BAZAR</span>
                <span className="text-[10px] text-slate-500 font-normal">Componente ppSummaryBand</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Locales</div>
                  <div className="text-base font-black text-slate-800 font-mono">{filteredLocales.length}</div>
                </div>
                <div className="bg-white p-2.5 rounded border border-amber-300 shadow-sm bg-amber-50/40">
                  <div className="text-[10px] text-amber-800 uppercase font-bold">Cuotas Pendientes</div>
                  <div className="text-base font-black text-amber-700 font-mono">
                    {filteredLocales.reduce((acc, curr) => acc + curr.cuotasPendientes, 0)} cuotas
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Deuda ($)</div>
                  <div className="text-base font-black text-amber-700 font-mono">
                    ${filteredLocales.reduce((acc, curr) => acc + (curr.saldoBs / tasaCambio), 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Anticipos ($)</div>
                  <div className="text-base font-black text-purple-700 font-mono">
                    ${filteredLocales.reduce((acc, curr) => acc + (curr.pagosABs / tasaCambio), 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Cartera Neta ($)</div>
                  <div className="text-base font-black text-red-700 font-mono">
                    ${filteredLocales.reduce((acc, curr) => acc + ((curr.saldoBs - curr.pagosABs) / tasaCambio), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature & Audit Footers */}
            <div className="mt-10 pt-4 border-t border-slate-300 flex justify-between items-end text-[10px] text-slate-500">
              <div>
                <div className="w-44 border-b border-slate-400 mb-1"></div>
                <div>Firma Administrador / Auditor</div>
              </div>
              <div className="text-right">
                <div>Documento generado por Saint Enterprise Administrativo</div>
                <div className="text-[9px] font-mono">Database: {databaseName} • Servidor SQL Server</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BLUEPRINT GUIDE: Band-by-Band Component Structure for ReportBuilder */}
      {tabMode === 'blueprint' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-cyan-400" />
              Estructura de Bandas & Controles para el Diseñador de ReportBuilder
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sigue este mapa para colocar los controles en el lienzo (Canvas) de Digital Metaphors ReportBuilder en Saint Enterprise.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Band 1: Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  1. Banda Header (ppHeaderBand1) - Altura sugerida: 35mm
                </span>
                <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">Encabezado de Página</span>
              </div>
              <ul className="text-slate-300 space-y-1.5 pl-4 list-disc">
                <li><code className="text-slate-200 font-mono">ppLabel1</code>: Título de la empresa (Ej: "CENTRO COMERCIAL BAZAR").</li>
                <li><code className="text-slate-200 font-mono">ppLabel2</code>: Subtítulo ("ESTADO DE CUENTA Y SOLVENCIA DE LOCALES").</li>
                <li><code className="text-slate-200 font-mono">ppDBText</code> o <code className="text-slate-200 font-mono">ppVariable</code>: Muestra <code className="text-emerald-300 font-mono">TasaCambio_Aplicada</code> con formato <code className="text-slate-400">#,##0.00 'Bs/$'</code>.</li>
                <li><code className="text-slate-200 font-mono">ppSystemVariable1</code>: Fecha y Hora de impresión (<code className="text-slate-400">spPrintDateTime</code>).</li>
                <li><code className="text-slate-200 font-mono">ppSystemVariable2</code>: Número de página (<code className="text-slate-400">spPageNoDesc</code>: "Página X de Y").</li>
              </ul>
            </div>

            {/* Band 2: Group Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  2. Banda GroupHeader (ppGroupHeaderBand1) - Agrupado por: EstadoSolvencia
                </span>
                <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">Ruptura de Grupo</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                En el menú <strong>Report &gt; Groups</strong>, añade un grupo con el campo <code className="text-amber-300 font-mono">EstadoSolvencia</code>.
              </p>
              <ul className="text-slate-300 space-y-1.5 pl-4 list-disc">
                <li><code className="text-slate-200 font-mono">ppDBText</code>: Enlazado a <code className="text-amber-300 font-mono">EstadoSolvencia</code> (Fuente Arial 10pt Bold, fondo sombreado).</li>
                <li>Encabezados de columnas de la tabla (Código, Razón Social, Deuda $, Anticipos $, Saldo Neto, etc.).</li>
              </ul>
            </div>

            {/* Band 3: Detail */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-blue-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  3. Banda Detail (ppDetailBand1) - Altura sugerida: 6.5mm
                </span>
                <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">Cuerpo del Reporte</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pl-2">
                <div>• <code className="text-cyan-300 font-mono">ppDBText1</code>: <code className="text-slate-400">CodLocal</code> (Ancho 18mm)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText2</code>: <code className="text-slate-400">NombreLocal_Cliente</code> (Ancho 45mm)</div>
                <div>• <code className="text-amber-300 font-mono font-bold">ppDBText3</code>: <code className="text-slate-200">CuotasPendientes</code> (Ancho 15mm, Format: <code className="text-slate-400">#,##0 'cuotas'</code>)</div>
                <div>• <code className="text-amber-300 font-mono">ppDBText4</code>: <code className="text-slate-400">FechaCuotaMasAntigua</code> (Ancho 18mm, Format: <code className="text-slate-400">dd/mm/yyyy</code>)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText5</code>: <code className="text-slate-400">SaldoDeuda_USD</code> (Format: <code className="text-slate-400">$#,##0.00</code>)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText6</code>: <code className="text-slate-400">Anticipos_USD</code> (Format: <code className="text-slate-400">$#,##0.00</code>)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText7</code>: <code className="text-slate-400">SaldoNeto_USD</code> (Negrita, Format: <code className="text-slate-400">$#,##0.00</code>)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText8</code>: <code className="text-slate-400">FechaUltimoPago</code> (Format: <code className="text-slate-400">dd/mm/yyyy</code>)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText9</code>: <code className="text-slate-400">MontoUltimoPago_USD</code> (Format: <code className="text-slate-400">$#,##0.00</code>)</div>
                <div>• <code className="text-cyan-300 font-mono">ppDBText10</code>: <code className="text-slate-400">DiasDesdeUltimoPago</code> (Centrado)</div>
              </div>
            </div>

            {/* Band 4: Group Footer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  4. Banda GroupFooter (ppGroupFooterBand1) - Subtotales
                </span>
                <span className="text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">Subtotales por Estado</span>
              </div>
              <ul className="text-slate-300 space-y-1.5 pl-4 list-disc">
                <li><code className="text-slate-200 font-mono">ppDBCalc1</code>: <code className="text-slate-400">DBCalcType = dcCount</code> sobre <code className="text-slate-200 font-mono">CodLocal</code> (Cantidad de locales).</li>
                <li><code className="text-amber-300 font-mono font-bold">ppDBCalc2</code>: <code className="text-slate-400">DBCalcType = dcSum</code> sobre <code className="text-amber-300 font-mono">CuotasPendientes</code> (Total cuotas atrasadas en el grupo).</li>
                <li><code className="text-slate-200 font-mono">ppDBCalc3</code>: <code className="text-slate-400">DBCalcType = dcSum</code> sobre <code className="text-slate-200 font-mono">SaldoDeuda_USD</code>.</li>
                <li><code className="text-slate-200 font-mono">ppDBCalc4</code>: <code className="text-slate-400">DBCalcType = dcSum</code> sobre <code className="text-slate-200 font-mono">Anticipos_USD</code>.</li>
                <li><code className="text-slate-200 font-mono">ppDBCalc5</code>: <code className="text-slate-400">DBCalcType = dcSum</code> sobre <code className="text-slate-200 font-mono">SaldoNeto_USD</code>.</li>
              </ul>
            </div>

            {/* Band 5: Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  5. Banda Summary (ppSummaryBand1) - Gran Total Consolidado
                </span>
                <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Totales Finales</span>
              </div>
              <p className="text-slate-300">
                Coloca cuadros <code className="text-slate-200 font-mono">ppShape</code> y componentes <code className="text-slate-200 font-mono">ppDBCalc</code> con <code className="text-emerald-300 font-mono">ResetType = rtReport</code> para calcular la cartera global en dólares, total de cuotas atrasadas y bolívares.
              </p>
            </div>
          </div>

          {/* STEP-BY-STEP TUTORIAL: Zebra Striping (Alternating row background) in Saint ReportBuilder */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950 to-blue-950/30 border-2 border-indigo-500/40 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Tutorial: Cómo hacer que salga una línea en color y otra no (Zebra Striping)
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                      Ideal para 2.714 Locales
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Técnica estándar en Digital Metaphors ReportBuilder (Delphi) para Saint Enterprise. Evita que la vista se pierda al leer tantas filas.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`procedure ppDetailBand1BeforePrint;
begin
  ppShapeFondo.Visible := not ppShapeFondo.Visible;
end;`);
                  setCopiedRap(true);
                  setTimeout(() => setCopiedRap(false), 2500);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30 shrink-0"
              >
                {copiedRap ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>¡Código RAP Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-indigo-200" />
                    <span>Copiar Código Pascal RAP</span>
                  </>
                )}
              </button>
            </div>

            {/* Visual Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Step 1 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  <span>Insertar ppShape de Fondo</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  En la paleta de componentes de ReportBuilder, selecciona la herramienta <strong>Shape</strong> (Forma) y dibuja un rectángulo en la banda <strong>Detail (Detalle)</strong>.
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>• Nombre: <span className="text-cyan-300">ppShapeFondo</span></div>
                  <div>• Ancho: Igual al ancho del reporte</div>
                  <div>• Alto: Igual a la altura de Detail</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  <span>Propiedades y "Send to Back"</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Configura el color y bordes, luego envía el rectángulo al fondo para no tapar los textos:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>• <span className="text-amber-300">Pen.Style</span>: <code className="text-slate-200">psClear</code> (Sin bordes)</div>
                  <div>• <span className="text-amber-300">Brush.Color</span>: <code className="text-slate-200">$00F4F4F4</code> o Gris Claro</div>
                  <div>• Clic derecho: <span className="text-emerald-400 font-semibold">Send to Back</span> (Enviar al Fondo)</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-[10px] font-mono">
                    3
                  </span>
                  <span>Pestaña Calc (Código RAP)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Haz clic en la pestaña <strong>Calc</strong> (arriba a la izquierda, junto a Design). En el árbol:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>1. Clic en <span className="text-cyan-300">Detail</span></div>
                  <div>2. Evento: <span className="text-amber-300">BeforePrint</span></div>
                  <div>3. Escribe 1 sola línea de código:</div>
                </div>
              </div>
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-indigo-300 font-bold flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Código Delphi RAP para ReportBuilder (Pestaña "Calc" &gt; Detail &gt; BeforePrint):
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1 Línea de Ejecución</span>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs leading-relaxed overflow-x-auto">
{`procedure ppDetailBand1BeforePrint;
begin
  // Alterna automáticamente la visibilidad en cada fila (1 sombreada, 1 blanca)
  ppShapeFondo.Visible := not ppShapeFondo.Visible;
end;`}
              </pre>

              {/* Pro Tip: Group Header Reset */}
              <div className="flex items-start gap-2 text-xs bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-lg text-slate-300">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Consejo Pro para 2.714 Locales:</strong> Para que cada nuevo grupo (Deudores o Solventes) siempre comience con una fila blanca limpia, ve en la pestaña <strong>Calc</strong> a <code className="text-cyan-300 font-mono">GroupHeader1</code> &gt; evento <code className="text-amber-300 font-mono">BeforePrint</code> y escribe: <code className="text-emerald-300 font-mono">ppShapeFondo.Visible := False;</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 GUÍA DE USO DE CASE: SQL (DADE) VS PASCAL RAP */}
      {tabMode === 'case_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Manual Técnico ReportBuilder
                </span>
                <span className="text-xs text-slate-400">Digital Metaphors &bull; Saint Enterprise</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                ¿Cómo se usa el CASE en ReportBuilder? (SQL vs Pascal RAP)
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                En ReportBuilder tienes <strong>dos entornos totalmente distintos</strong> para usar condicionales:
                la consulta <strong>SQL (DADE / Editor de Datos)</strong> y el motor de scripts <strong>RAP (Pestaña "Calc" en Delphi Pascal)</strong>.
              </p>
            </div>
          </div>

          {/* Comparative Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* SQL Method */}
            <div className="bg-slate-950 border-2 border-blue-500/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>1. En la Consulta SQL (Recomendado 90%)</span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                  DADE / Datos
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Se escribe directamente dentro del <code className="text-blue-300 font-mono">SELECT</code> de tu consulta. SQL Server lo evalúa a toda velocidad para los 2.714 locales antes de que el reporte dibuje nada.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <div className="text-white font-semibold">Ventajas:</div>
                <div>&bull; Permite comparaciones con rangos (<code className="text-slate-200">BETWEEN</code>, <code className="text-slate-200">&gt;=</code>, <code className="text-slate-200">&lt;=</code>).</div>
                <div>&bull; Compara cadenas de texto y valores nulos (<code className="text-slate-200">IS NULL</code>).</div>
                <div>&bull; El resultado se convierte en un campo más para arrastrar (<code className="text-cyan-300 font-mono">ppDBText</code>).</div>
              </div>
            </div>

            {/* RAP Method */}
            <div className="bg-slate-950 border-2 border-amber-500/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>2. En la Pestaña "Calc" (Código Pascal RAP)</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  Eventos / Calc
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Se programa en el lenguaje Pascal de Delphi dentro de eventos como <code className="text-amber-300 font-mono">DetailBeforePrint</code> o en componentes <code className="text-amber-300 font-mono">ppVariable.OnCalc</code>.
              </p>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
                <div className="text-white font-semibold">Ventajas & Limitación Clave:</div>
                <div>&bull; <strong>Ideal para diseño visual:</strong> cambiar el color del texto a rojo si debe, ocultar controles, cambiar bordes.</div>
                <div>&bull; <strong>¡Atención!:</strong> En Pascal, <code className="text-amber-300 font-mono">case .. of</code> solo acepta <strong>números enteros</strong>. Para textos o rangos se usa <code className="text-slate-200 font-mono">if .. then .. else</code>.</div>
              </div>
            </div>
          </div>

          {/* Real World Examples with Copy Buttons */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Ejemplos Prácticos Listos para Usar en Saint
            </h4>

            {/* Example 1: SQL Classification */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="font-bold text-blue-300">Ejemplo 1 (SQL): Clasificar a los Locales según Nivel de Mora</span>
                  <p className="text-[11px] text-slate-400">Pega esto dentro del SELECT en la pestaña Datos / DADE de ReportBuilder</p>
                </div>
                <button
                  onClick={() => copyToClipboardSnippet('case_sql_1', `CASE 
    WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00 THEN 'SOLVENTE / AL DIA'
    WHEN ISNULL(DP.CuotasPendientes, 0) >= 3 THEN 'MOROSO CRITICO (3+ CUOTAS)'
    WHEN ISNULL(DP.CuotasPendientes, 0) BETWEEN 1 AND 2 THEN 'RETRASO MODERADO'
    ELSE 'CON SALDO PENDIENTE'
END AS [NivelMora]`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCaseSnippet === 'case_sql_1' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaseSnippet === 'case_sql_1' ? '¡Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto">
{`SELECT 
    CL.CodClie,
    CL.Descrip,
    -- Clasificación dinámica con CASE WHEN:
    CASE 
        WHEN (ISNULL(CL.Saldo, 0.00) - ISNULL(CL.PagosA, 0.00)) <= 0.00 THEN 'SOLVENTE / AL DIA'
        WHEN ISNULL(DP.CuotasPendientes, 0) >= 3 THEN 'MOROSO CRITICO (3+ CUOTAS)'
        WHEN ISNULL(DP.CuotasPendientes, 0) BETWEEN 1 AND 2 THEN 'RETRASO MODERADO'
        ELSE 'CON SALDO PENDIENTE'
    END AS [NivelMora]
FROM dbo.SACLIE CL ...`}
              </pre>
            </div>

            {/* Example 2: SQL Code to Description Mapping */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="font-bold text-blue-300">Ejemplo 2 (SQL): Traducir Tipos de Documentos CxC de Saint (10, 20, 41, 50, 70)</span>
                  <p className="text-[11px] text-slate-400">Convierte el código en texto descriptivo para que el usuario no vea códigos numéricos</p>
                </div>
                <button
                  onClick={() => copyToClipboardSnippet('case_sql_2', `CASE TipoCxC
    WHEN '10' THEN 'Factura Comercial'
    WHEN '20' THEN 'Nota de Débito'
    WHEN '41' THEN 'Recibo de Cobro'
    WHEN '50' THEN 'Anticipo Recibido'
    WHEN '70' THEN 'Cuota de Alquiler / Condominio'
    ELSE 'Otro Documento'
END AS [NombreDocumento]`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCaseSnippet === 'case_sql_2' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaseSnippet === 'case_sql_2' ? '¡Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto">
{`CASE TipoCxC
    WHEN '10' THEN 'Factura Comercial'
    WHEN '20' THEN 'Nota de Débito'
    WHEN '41' THEN 'Recibo de Cobro'
    WHEN '50' THEN 'Anticipo Recibido'
    WHEN '70' THEN 'Cuota de Alquiler / Condominio'
    ELSE 'Otro Documento'
END AS [NombreDocumento]`}
              </pre>
            </div>

            {/* Example 3: Pascal RAP Variable Calculation */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="font-bold text-amber-300">Ejemplo 3 (RAP): Usando un Componente ppVariable con IF / ELSE</span>
                  <p className="text-[11px] text-slate-400">Inserta un <code className="text-cyan-300 font-mono">ppVariable</code> en Detail y en la pestaña Calc abre el evento <strong>OnCalc</strong></p>
                </div>
                <button
                  onClick={() => copyToClipboardSnippet('case_rap_1', `procedure ppVariableEstadoOnCalc(var Value: Variant);
begin
  if (Report.DataPipeline['SaldoNeto_USD'] <= 0) then
    Value := 'Solvente'
  else if (Report.DataPipeline['CuotasPendientes'] >= 3) then
    Value := 'Cobro Urgente'
  else
    Value := 'Pendiente';
end;`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCaseSnippet === 'case_rap_1' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaseSnippet === 'case_rap_1' ? '¡Copiado!' : 'Copiar Pascal RAP'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono text-xs overflow-x-auto">
{`procedure ppVariableEstadoOnCalc(var Value: Variant);
begin
  // Nota: En Pascal RAP para evaluar rangos o números decimales se usa if / else:
  if (Report.DataPipeline['SaldoNeto_USD'] <= 0) then
    Value := 'Solvente'
  else if (Report.DataPipeline['CuotasPendientes'] >= 3) then
    Value := 'Cobro Urgente'
  else
    Value := 'Pendiente';
end;`}
              </pre>
            </div>

            {/* Example 4: Pascal Native CASE..OF Statement */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="font-bold text-amber-300">Ejemplo 4 (RAP): Sentencia Nativa CASE .. OF en Delphi Pascal</span>
                  <p className="text-[11px] text-slate-400">Funciona cuando el valor evaluado es un número entero (ej: código numérico de tipo)</p>
                </div>
                <button
                  onClick={() => copyToClipboardSnippet('case_rap_2', `procedure ppVariableTipoOnCalc(var Value: Variant);
var
  tipoDocInt: Integer;
begin
  tipoDocInt := StrToIntDef(Report.DataPipeline['TipoCxC'], 0);

  case tipoDocInt of
    10: Value := 'Factura de Venta';
    20: Value := 'Nota de Débito';
    41: Value := 'Pago / Cobro Recibido';
    50: Value := 'Anticipo';
    70: Value := 'Cuota Local';
  else
    Value := 'Otro Documento';
  end;
end;`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCaseSnippet === 'case_rap_2' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaseSnippet === 'case_rap_2' ? '¡Copiado!' : 'Copiar Pascal RAP'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono text-xs overflow-x-auto">
{`procedure ppVariableTipoOnCalc(var Value: Variant);
var
  tipoDocInt: Integer;
begin
  tipoDocInt := StrToIntDef(Report.DataPipeline['TipoCxC'], 0);

  case tipoDocInt of
    10: Value := 'Factura de Venta';
    20: Value := 'Nota de Débito';
    41: Value := 'Pago / Cobro Recibido';
    50: Value := 'Anticipo';
    70: Value := 'Cuota Local';
  else
    Value := 'Otro Documento';
  end;
end;`}
              </pre>
            </div>

            {/* Example 5: Conditional Color and Formatting in DetailBeforePrint */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="font-bold text-emerald-400">Ejemplo 5 (RAP): Cambiar Color de Texto en Rojo/Verde Condicionalmente</span>
                  <p className="text-[11px] text-slate-400">Pega esto en la pestaña Calc &gt; Detail &gt; BeforePrint</p>
                </div>
                <button
                  onClick={() => copyToClipboardSnippet('case_color', `procedure ppDetailBand1BeforePrint;
begin
  // Si el local tiene saldo pendiente > 0, pone el monto en Rojo y Negrita:
  if (Report.DataPipeline['SaldoNeto_USD'] > 0) then
  begin
    ppDBTextSaldoNeto.Font.Color := clRed;
    ppDBTextSaldoNeto.Font.Style := [fsBold];
  end
  else
  begin
    ppDBTextSaldoNeto.Font.Color := clGreen;
    ppDBTextSaldoNeto.Font.Style := [];
  end;
end;`)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCaseSnippet === 'case_color' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaseSnippet === 'case_color' ? '¡Copiado!' : 'Copiar Pascal RAP'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto">
{`procedure ppDetailBand1BeforePrint;
begin
  // Si el local tiene saldo pendiente > 0, pone el monto en Rojo y Negrita:
  if (Report.DataPipeline['SaldoNeto_USD'] > 0) then
  begin
    ppDBTextSaldoNeto.Font.Color := clRed;
    ppDBTextSaldoNeto.Font.Style := [fsBold];
  end
  else
  begin
    ppDBTextSaldoNeto.Font.Color := clGreen;
    ppDBTextSaldoNeto.Font.Style := [];
  end;
end;`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 3. RAW DATASET TABLE */}
      {tabMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Filas del Dataset ({filteredLocales.length} Locales)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Valores tabulares crudos retornados por el query para verificar integridad de datos.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium">
                Solventes: {sampleLocales.filter(l => l.saldoNetoBs <= 0.01).length}
              </span>
              <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-medium">
                Con Deuda: {sampleLocales.filter(l => l.saldoNetoBs > 0.01).length}
              </span>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-3">Código Local</th>
                    <th className="px-3.5 py-3">Razón Social / Local</th>
                    <th className="px-3.5 py-3 text-center text-amber-300">Cuotas Pend. (10 y 70)</th>
                    <th className="px-3.5 py-3 text-right">Deuda (Bs)</th>
                    <th className="px-3.5 py-3 text-right text-amber-300">Deuda ($)</th>
                    <th className="px-3.5 py-3 text-right text-purple-300">Anticipos ($)</th>
                    <th className="px-3.5 py-3 text-right text-blue-300 font-bold">Saldo Neto ($)</th>
                    <th className="px-3.5 py-3 text-center">Último Pago</th>
                    <th className="px-3.5 py-3 text-right text-emerald-400">Monto Pago ($)</th>
                    <th className="px-3.5 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {filteredLocales.map((loc) => (
                    <tr key={loc.codClie} className="hover:bg-slate-800/40 transition">
                      <td className="px-3.5 py-3 font-bold text-cyan-300">{loc.codClie}</td>
                      <td className="px-3.5 py-3 font-sans">
                        <div className="text-white font-medium">{loc.descrip}</div>
                        <div className="text-[10px] text-slate-500">{loc.rif}</div>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        {loc.cuotasPendientes > 0 ? (
                          <div>
                            <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              {loc.cuotasPendientes} cuotas
                            </span>
                            {loc.fechaCuotaMasAntigua && (
                              <div className="text-[10px] text-slate-500 mt-0.5">desde {loc.fechaCuotaMasAntigua}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right text-slate-400">
                        Bs. {loc.saldoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3.5 py-3 text-right text-amber-300 font-medium">
                        ${(loc.saldoBs / tasaCambio).toFixed(2)}
                      </td>
                      <td className="px-3.5 py-3 text-right text-purple-300 font-medium">
                        ${(loc.pagosABs / tasaCambio).toFixed(2)}
                      </td>
                      <td className="px-3.5 py-3 text-right font-bold text-white">
                        ${((loc.saldoBs - loc.pagosABs) / tasaCambio).toFixed(2)}
                      </td>
                      <td className="px-3.5 py-3 text-center font-sans">
                        {loc.ultimaFechaPago ? (
                          <div>
                            <div className="text-slate-300">{loc.ultimaFechaPago}</div>
                            <div className="text-[10px] text-slate-500">{loc.ultimoNroDoc} ({loc.diasSinPagar}d)</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Sin registro</span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right text-emerald-400">
                        {loc.ultimoMontoPagoUsd ? `$${loc.ultimoMontoPagoUsd.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-3.5 py-3 text-center font-sans">
                        {loc.estado === 'SOLVENTE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" /> Solvente
                          </span>
                        )}
                        {loc.estado === 'A_FAVOR' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            <CheckCircle className="w-3 h-3" /> A Favor ($10)
                          </span>
                        )}
                        {loc.estado === 'DEUDOR' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertCircle className="w-3 h-3" /> Con Deuda
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Guide on How to Setup in Saint Report Builder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Configuración de Parámetros en Saint Report Builder</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            En el diseñador de reportes de Saint o Microsoft Report Builder, agrega los siguientes parámetros en la sección <strong className="text-white">Parameters</strong>:
          </p>
          <ul className="space-y-2 text-slate-400 pl-3">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <div>
                <strong className="text-slate-200 font-mono">@FiltroEstado (Integer):</strong>
                <p className="text-[11px]">Etiquetas sugeridas: <code className="text-slate-300">0 = [Todos los Locales]</code>, <code className="text-emerald-300">1 = [Solventes / Al Día]</code>, <code className="text-red-300">2 = [Morosos / Con Deuda]</code>.</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <div>
                <strong className="text-slate-200 font-mono">@TasaDiaParam (Decimal, Opcional):</strong>
                <p className="text-[11px]">Déjalo en <code className="text-slate-300">0</code> por defecto para que consulte automáticamente la tasa de <code className="text-slate-200">SACONF.Factor</code>, o permite que el usuario ingrese una tasa manual.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Ventajas del Enfoque Técnico</span>
          </div>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cero Cursors / 100% Set-Based:</strong> Utiliza CTE con <code className="text-cyan-300 font-mono">ROW_NUMBER()</code> sobre <code className="text-cyan-300 font-mono">TipoCxC = '41'</code> para traer el último pago en microsegundos sin degradar SQL Server.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Doble Visión (Bs y USD):</strong> Permite totalizar en el reporte el monto exacto en Bolívares y su contravalor en Divisas a la tasa oficial del día.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Anticipos Claros:</strong> Desglosa los anticipos (<code className="text-purple-300 font-mono">PagosA</code>) de manera independiente para no confundir a los arrendatarios con pagos a favor.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">
                Sintaxis de Parámetros: {paramSyntax === 'colon' ? 'Nativo Saint (:FiltroEstado)' : 'T-SQL Estándar (@FiltroEstado)'}
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              {paramSyntax === 'colon' 
                ? 'Recomendado para el diseñador de Saint Report Builder (Delphi DADE / ADO) para generar los diálogos visuales de usuario.'
                : 'Recomendado para ejecutar directamente en SQL Server Management Studio (SSMS) o en Stored Procedures.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                onClick={() => setParamSyntax('colon')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  paramSyntax === 'colon'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                :Param (Saint ReportBuilder)
              </button>
              <button
                onClick={() => setParamSyntax('at')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  paramSyntax === 'at'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                @Param (SSMS / T-SQL)
              </button>
            </div>

            <button
              onClick={handleCopyFull}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Script'}</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96 select-all">
            {activeSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
