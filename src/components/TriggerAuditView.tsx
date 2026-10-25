import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  Calculator,
  ArrowRight
} from 'lucide-react';

export const TriggerAuditView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [databaseName, setDatabaseName] = useState('BazarAdminDb');
  const [syncSaclieInTrigger, setSyncSaclieInTrigger] = useState(true);

  // Simulation state for demonstrating partial payment wipeout bug
  const [montoUsd] = useState(100);
  const [factorInicial] = useState(40);
  const [abonoUsd] = useState(80);
  const [nuevoFactor, setNuevoFactor] = useState(50);
  const [simulatedResult, setSimulatedResult] = useState<'none' | 'bug' | 'fixed'>('none');

  // Math for simulation:
  const montoInicialBs = montoUsd * factorInicial; // 4000
  const abonoInicialBs = abonoUsd * factorInicial; // 3200
  const saldoInicialBs = montoInicialBs - abonoInicialBs; // 800 ($20)
  const saldoRestanteUsd = montoUsd - abonoUsd; // 20

  // Buggy trigger result: Saldo = nuevoFactor * MontoMEx (100 * 50 = 5000)
  const saldoBugBs = nuevoFactor * montoUsd;
  // Fixed trigger result: Saldo = saldoInicialBs * (nuevoFactor / factorInicial) (800 * 50/40 = 1000)
  const saldoFixedBs = saldoInicialBs * (nuevoFactor / factorInicial);

  const triggerSql = `-- ==============================================================================
-- TRIGGER OPTIMIZADO: TRG_SACONF_UPDATE_FACTOR_SAACXC
-- Tabla: SACONF | Evento: AFTER UPDATE de Factor
-- Correcciones aplicadas:
--  1. Soporte para ND (20, 27), Giros (60), Cuotas (70) y Facturas (10).
--  2. PROTECCION DE ABONOS: No reinicia Saldo = Monto; escala proporcionalmente.
--  3. PROTECCION MONEDA LOCAL: Solo aplica si MontoMEx > 0.
--  4. SINCRONIZACION SACLIE: Sincroniza SACLIE.Saldo inmediatamente al cambiar la tasa.
--  5. EXCLUSION DE ANTICIPOS: No altera anticipos (50/25) porque son en Bs.
-- ==============================================================================
USE [${databaseName || 'BazarAdminDb'}];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

ALTER TRIGGER [dbo].[TRG_SACONF_UPDATE_FACTOR_SAACXC]
ON [dbo].[SACONF]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Verifica si la columna Factor fue modificada y si el valor realmente cambió
    IF UPDATE(Factor)
    BEGIN
        DECLARE @NuevoFactor DECIMAL(28, 4);
        DECLARE @FactorAnterior DECIMAL(28, 4);

        SELECT TOP 1 
            @NuevoFactor = i.Factor,
            @FactorAnterior = d.Factor
        FROM INSERTED i
        LEFT JOIN DELETED d ON i.CodSucu = d.CodSucu;

        -- Valida que el factor sea válido, mayor a cero y distinto al anterior
        IF (@NuevoFactor IS NOT NULL AND @NuevoFactor > 0 AND (@FactorAnterior IS NULL OR @NuevoFactor <> @FactorAnterior))
        BEGIN
            -- 2. Actualización en SAACxC usando SaldoMEx (Facturas 10, ND 20, 27, Giros 60, Cuotas 70)
            --    ¡LA SOLUCION PERFECTA: SaldoMEx guarda el saldo vivo en USD!
            --    (El trigger original tenía un error de tipeo/copiado: usó MontoMEx en lugar de SaldoMEx)
            UPDATE dbo.SAACxC
            SET 
                Monto = ROUND(@NuevoFactor * MontoMEx, 2),
                Saldo = ROUND(@NuevoFactor * SaldoMEx, 2),
                Factor = @NuevoFactor
            WHERE Saldo > 0 
              AND ISNULL(MontoMEx, 0) > 0
              -- Facturas, Notas de Débito, Giros y Cuotas (Anticipos 50/25 excluidos por ser en Bs)
              AND TipoCxC IN ('10', '20', '27', '60', '70');

${syncSaclieInTrigger ? `            -- 3. Sincronización inmediata de la ficha maestra SACLIE
            --    Evita que la cartera quede descuadrada al cambiar la tasa del día
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
` : ''}        END
    END
END;
GO
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(triggerSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `TRG_SACONF_UPDATE_FACTOR_SAACXC_OPTIMIZADO_${databaseName}.sql`;
    const blob = new Blob([triggerSql], { type: 'text/plain;charset=utf-8' });
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
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/40 border border-red-500/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Auditoría Crítica de Trigger
              </span>
              <span className="text-xs text-slate-400 font-mono">[dbo].[TRG_SACONF_UPDATE_FACTOR_SAACXC]</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Análisis del Disparador de Cambio de Factor (Tasa de Cambio)
            </h2>
            <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
              Detectamos un <strong>error de alto impacto contable</strong> en su trigger actual: la instrucción{' '}
              <code className="text-red-300 bg-slate-900 font-mono px-1.5 py-0.5 rounded">Saldo = ROUND(@NuevoFactor * MontoMEx, 2)</code>{' '}
              <strong>elimina los abonos y pagos parciales</strong> que los clientes hayan realizado, reiniciando la deuda al monto total de la factura cada vez que cambia la tasa del día.
            </p>
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
                  <span>Copiar Trigger Corregido</span>
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

      {/* 4 Critical Vulnerabilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Fallo 1: Error de Copiado - Se usó MontoMEx en lugar de SaldoMEx</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Al asignar <code className="text-red-300 font-mono">Saldo = @NuevoFactor * MontoMEx</code> (en vez de <code className="text-emerald-400 font-mono">SaldoMEx</code>), si un cliente debía una factura de $100 y ya había pagado $80 (quedándole $20 de saldo en <code className="text-emerald-400 font-mono">SaldoMEx</code>), el trigger <strong>le volvía a cobrar los $100 completos</strong>, borrando el cobro parcial.
          </p>
          <div className="text-[11px] text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <strong>Solución Exacta:</strong> Usar la columna nativa: <code className="text-emerald-400 font-mono">Saldo = ROUND(@NuevoFactor * SaldoMEx, 2)</code>.
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Fallo 2: Omisión de Notas de Débito, Giros y Cuotas</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El trigger solo actualizaba <code className="text-slate-300 font-mono">TipoCxC = 10</code>. Si el Bazar emite Notas de Débito (<code className="text-slate-300 font-mono">20, 27</code>), Giros (<code className="text-slate-300 font-mono">60</code>) o Cuotas (<code className="text-slate-300 font-mono">70</code>) en moneda referencial, estos quedaban congelados a la tasa vieja.
          </p>
          <div className="text-[11px] text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <strong>Solución:</strong> Incluir <code className="text-emerald-400 font-mono">TipoCxC IN ('10', '20', '27', '60', '70')</code> respetando los anticipos (50/25) en Bs.
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Fallo 3: Riesgo con Documentos en Moneda Nacional</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El trigger no valida si <code className="text-slate-300 font-mono">MontoMEx &gt; 0</code>. Si una factura fue emitida en Bolívares puros con <code className="text-slate-300 font-mono">MontoMEx = 0</code> o <code className="text-slate-300 font-mono">NULL</code>, el trigger sobreescribía <code className="text-red-300 font-mono">Monto = 0.00</code> y <code className="text-red-300 font-mono">Saldo = 0.00</code>, anulando la factura.
          </p>
          <div className="text-[11px] text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <strong>Solución:</strong> Filtrar estrictamente <code className="text-emerald-400 font-mono">AND ISNULL(MontoMEx, 0) &gt; 0</code>.
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Fallo 4: Descuadre Inmediato con la Tabla SACLIE</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            El trigger modificaba los saldos en <code className="text-slate-300 font-mono">SAACxC</code> pero no actualizaba <code className="text-slate-300 font-mono">SACLIE.Saldo</code>. Cada vez que el operador cambiaba el factor en Saint, la cartera se descuadraba automáticamente.
          </p>
          <div className="text-[11px] text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <strong>Solución:</strong> Sincronizar automáticamente <code className="text-emerald-400 font-mono">SACLIE.Saldo</code> dentro del mismo trigger.
          </div>
        </div>
      </div>

      {/* Interactive Simulation: See the Bug in Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              Simulador Visual: Caso de Factura con Abono Parcial
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vea qué le ocurre a una factura con abono cuando se actualiza el factor de cambio.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Nueva Tasa ($/Bs):</span>
            <input
              type="number"
              value={nuevoFactor}
              onChange={(e) => setNuevoFactor(Number(e.target.value) || 50)}
              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Case Details */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500">Monto Factura:</span>
            <div className="text-base font-bold text-white mt-0.5">$ {montoUsd}.00</div>
            <div className="text-[11px] text-slate-400">{montoInicialBs} Bs (Tasa inicial {factorInicial})</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500">Abono Realizado:</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">$ {abonoUsd}.00</div>
            <div className="text-[11px] text-slate-400">{abonoInicialBs} Bs pagados</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500">Saldo Restante Real:</span>
            <div className="text-base font-bold text-cyan-400 mt-0.5">$ {saldoRestanteUsd}.00</div>
            <div className="text-[11px] text-slate-400">Debe 800 Bs (a tasa {factorInicial})</div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500">Tasa Cambia A:</span>
            <div className="text-base font-bold text-amber-400 mt-0.5">{nuevoFactor}.00 Bs/$</div>
            <div className="text-[11px] text-slate-400">Trigger entra en acción</div>
          </div>
        </div>

        {/* Trigger Outcome Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-400" /> Resultado con tu Trigger Actual:
              </span>
              <span className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                ¡ERROR!
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-red-400">
              Saldo = Bs {saldoBugBs.toFixed(2)}
            </div>
            <p className="text-xs text-red-200/80">
              <strong>¡El cliente vuelve a deber los $100 completos (Bs {saldoBugBs})!</strong> El abono de $80 se perdió en el recálculo porque ejecutó <code className="text-white font-mono">Saldo = @NuevoFactor * MontoMEx</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Resultado con Trigger Corregido:
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                100% EXACTO
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              Saldo = Bs {saldoFixedBs.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-200/80">
              <strong>El cliente sigue debiendo exactamente sus $20 restantes</strong> (20 * {nuevoFactor} = Bs {saldoFixedBs.toFixed(2)}). El abono previo se respetó íntegramente.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer and Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncSaclie"
                checked={syncSaclieInTrigger}
                onChange={(e) => setSyncSaclieInTrigger(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
              />
              <label htmlFor="syncSaclie" className="text-xs font-bold text-white cursor-pointer">
                Sincronizar SACLIE.Saldo automáticamente dentro del Trigger
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copiar SQL</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .SQL</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96 select-all">
            {triggerSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
