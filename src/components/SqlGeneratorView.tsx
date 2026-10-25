import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Sliders, 
  ShieldCheck, 
  Database, 
  FileText, 
  Sparkles, 
  RefreshCw,
  Search,
  Code2
} from 'lucide-react';
import { 
  generateOptimizedSetBasedScript, 
  generateDiagnosticScript, 
  SqlScriptOptions 
} from '../utils/sqlGenerator';

export const SqlGeneratorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recalculo' | 'diagnostico'>('recalculo');
  const [copied, setCopied] = useState(false);

  // Form options
  const [databaseName, setDatabaseName] = useState('BazarAdminDb');
  const [targetClient, setTargetClient] = useState('');
  const [createPhysicalBackup, setCreatePhysicalBackup] = useState(true);
  const [updateSaclie, setUpdateSaclie] = useState(true);
  const [saclieMethod, setSaclieMethod] = useState<'last_saldoact' | 'sum_open_saldo'>('last_saldoact');
  const [updatePagosA, setUpdatePagosA] = useState(true);
  const [pagosAMethod, setPagosAMethod] = useState<'saldo' | 'monto'>('saldo');
  const [includeTransactionRollbackCheck, setIncludeTransactionRollbackCheck] = useState(true);

  const scriptOptions: SqlScriptOptions = useMemo(() => ({
    databaseName,
    targetClient,
    createPhysicalBackup,
    updateSaclie,
    saclieMethod,
    updatePagosA,
    pagosAMethod,
    includeDiagnosticReport: true,
    includeTransactionRollbackCheck
  }), [
    databaseName,
    targetClient,
    createPhysicalBackup,
    updateSaclie,
    saclieMethod,
    updatePagosA,
    pagosAMethod,
    includeTransactionRollbackCheck
  ]);

  const currentSql = useMemo(() => {
    if (activeTab === 'diagnostico') {
      return generateDiagnosticScript(databaseName);
    }
    return generateOptimizedSetBasedScript(scriptOptions);
  }, [activeTab, databaseName, scriptOptions]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = activeTab === 'diagnostico' 
      ? `Saint_Diagnostico_CxC_${databaseName}.sql` 
      : `Saint_Recalculo_CxC_Optimizado_${databaseName}.sql`;
    const blob = new Blob([currentSql], { type: 'text/plain;charset=utf-8' });
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
      {/* Top Selector Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('recalculo')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'recalculo'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Script Optimizado (Recálculo SAACxC + SACLIE)</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition ${
              activeTab === 'diagnostico'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Script de Diagnóstico Previo (SSMS)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copiar SQL</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-md shadow-emerald-600/20"
            title="Descargar archivo .sql"
          >
            <Download className="w-4 h-4" />
            <span>Descargar .SQL</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customization Panel */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Parámetros de Configuración Saint
            </h3>

            {/* Database Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nombre de Base de Datos en SQL Server
              </label>
              <div className="relative">
                <Database className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="BazarAdminDb"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Se incluirá en la sentencia <code className="text-slate-300">USE [{databaseName}]</code>.
              </p>
            </div>

            {activeTab === 'recalculo' && (
              <>
                {/* Specific Client */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Filtrar por Cliente Específico (Opcional)
                  </label>
                  <input
                    type="text"
                    value={targetClient}
                    onChange={(e) => setTargetClient(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Vacío para TODOS los clientes (ej: C-00142)"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dejar en blanco para procesar toda la base de datos de una sola vez.
                  </p>
                </div>

                {/* Sincronizar SACLIE */}
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="updateSaclie"
                      checked={updateSaclie}
                      onChange={(e) => setUpdateSaclie(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                    />
                    <div>
                      <label htmlFor="updateSaclie" className="text-xs font-bold text-white cursor-pointer">
                        Sincronizar tabla SACLIE (Recomendado)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Corrige el saldo en la ficha del cliente que Saint utiliza para verificar límite de crédito y ventas.
                      </p>
                    </div>
                  </div>

                  {updateSaclie && (
                    <div className="pl-7 space-y-2 pt-1 border-t border-slate-800">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Método de cálculo para SACLIE.Saldo:
                      </label>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="radio"
                            name="saclieMethod"
                            value="last_saldoact"
                            checked={saclieMethod === 'last_saldoact'}
                            onChange={() => setSaclieMethod('last_saldoact')}
                            className="text-blue-600"
                          />
                          <span>Último SaldoAct acumulado histórico</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="radio"
                            name="saclieMethod"
                            value="sum_open_saldo"
                            checked={saclieMethod === 'sum_open_saldo'}
                            onChange={() => setSaclieMethod('sum_open_saldo')}
                            className="text-blue-600"
                          />
                          <span>Sumatoria de documentos abiertos (Saldo &gt; 0)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sincronizar SACLIE.PagosA (Anticipos 50 - 25) */}
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="updatePagosA"
                      checked={updatePagosA}
                      onChange={(e) => setUpdatePagosA(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                    />
                    <div>
                      <label htmlFor="updatePagosA" className="text-xs font-bold text-white cursor-pointer">
                        Sincronizar columna SACLIE.PagosA
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Calcula los pagos adelantados / anticipos según la fórmula <code className="text-slate-300 font-mono">SUM(50) - SUM(25)</code>.
                      </p>
                    </div>
                  </div>

                  {updatePagosA && (
                    <div className="pl-7 space-y-2 pt-1 border-t border-slate-800">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Cálculo de anticipos en SAACxC:
                      </label>
                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="radio"
                            name="pagosAMethod"
                            value="saldo"
                            checked={pagosAMethod === 'saldo'}
                            onChange={() => setPagosAMethod('saldo')}
                            className="text-blue-600"
                          />
                          <span>Saldos disponibles vivos por cruzar (SAACxC.Saldo)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="radio"
                            name="pagosAMethod"
                            value="monto"
                            checked={pagosAMethod === 'monto'}
                            onChange={() => setPagosAMethod('monto')}
                            className="text-blue-600"
                          />
                          <span>Monto facial acumulado (SAACxC.Monto)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Safety Backup */}
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="createPhysicalBackup"
                    checked={createPhysicalBackup}
                    onChange={(e) => setCreatePhysicalBackup(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                  />
                  <div>
                    <label htmlFor="createPhysicalBackup" className="text-xs font-bold text-white cursor-pointer flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Crear tabla de respaldo preventivo
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Ejecuta un <code className="text-slate-300">SELECT * INTO SAACxC_BAK_...</code> antes de modificar registros para poder revertir en segundos.
                    </p>
                  </div>
                </div>

                {/* Transaction Safety */}
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="includeTransactionRollbackCheck"
                    checked={includeTransactionRollbackCheck}
                    onChange={(e) => setIncludeTransactionRollbackCheck(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                  />
                  <div>
                    <label htmlFor="includeTransactionRollbackCheck" className="text-xs font-bold text-white cursor-pointer">
                      Modo Transaccional Seguro (ACID)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Incluye <code className="text-slate-300">XACT_ABORT ON</code> y bloque <code className="text-slate-300">TRY...CATCH</code> con <code className="text-slate-300">ROLLBACK</code> automático si ocurre cualquier error.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick checklist for integrators */}
          <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-blue-400" />
              Recomendaciones para el Canal Integrador:
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Siempre realizar un respaldo completo (<code className="text-slate-300">.BAK</code>) desde SQL Server Management Studio antes de ejecutar rutinas masivas.</li>
              <li>Asegurar que los usuarios de Saint Enterprise hayan cerrado sesión o estén fuera de horario laboral.</li>
              <li>Luego de ejecutar el script, ejecutar una verificación de integridad con el botón de diagnóstico.</li>
            </ul>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Code2 className="w-4 h-4 text-blue-400" />
              {activeTab === 'recalculo' 
                ? 'T-SQL: Solución Set-Based Optimizada (SAACxC + SACLIE)' 
                : 'T-SQL: Script de Auditoría y Diagnóstico de Descuadres'}
            </span>
            <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
              {activeTab === 'recalculo' ? 'Set-Based CTE Window' : 'Consultas Diagnóstico'}
            </span>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <pre className="p-5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[620px] select-all">
              {currentSql}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
