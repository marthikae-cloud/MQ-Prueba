import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Search, 
  RefreshCw, 
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { generateReconciliationScript, generateAlignmentScript } from '../utils/sqlGenerator';

interface ClientReconciliationSample {
  codClie: string;
  nombre: string;
  saldoSaclie: number;
  saldoSaacxc: number;
  pagosASaclie: number;
  anticiposSaacxc: number;
  documentosVivos: number;
}

export const ReconciliationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comprobacion' | 'nivelacion'>('comprobacion');
  const [copied, setCopied] = useState(false);
  const [databaseName, setDatabaseName] = useState('BazarAdminDb');

  // Simulated live comparison dataset with Saldo (Deuda) and PagosA (Anticipos)
  const [clients, setClients] = useState<ClientReconciliationSample[]>([
    {
      codClie: 'C-00142',
      nombre: 'DISTRIBUIDORA BAZAR C.A.',
      saldoSaclie: 1700.00,
      saldoSaacxc: 1700.00,
      pagosASaclie: 400.00,
      anticiposSaacxc: 400.00,
      documentosVivos: 2
    },
    {
      codClie: 'C-00210',
      nombre: 'COMERCIAL LOS ANDES S.R.L.',
      saldoSaclie: 2450.00,
      saldoSaacxc: 1850.00, // Descuadre de deuda
      pagosASaclie: 0.00,
      anticiposSaacxc: 200.00, // Descuadre en PagosA
      documentosVivos: 3
    },
    {
      codClie: 'C-00305',
      nombre: 'FARMACIA CENTRAL EXPRESS',
      saldoSaclie: 820.50,
      saldoSaacxc: 970.50, // Descuadre de -150
      pagosASaclie: 150.00,
      anticiposSaacxc: 150.00,
      documentosVivos: 3
    },
    {
      codClie: 'C-00412',
      nombre: 'INVERSIONES LA COLINA',
      saldoSaclie: 3100.00,
      saldoSaacxc: 3100.00,
      pagosASaclie: 500.00,
      anticiposSaacxc: 500.00,
      documentosVivos: 4
    }
  ]);

  const [simulatedAligned, setSimulatedAligned] = useState(false);

  const totalDeudaSaclie = clients.reduce((acc, c) => acc + c.saldoSaclie, 0);
  const totalDeudaSaacxc = clients.reduce((acc, c) => acc + c.saldoSaacxc, 0);
  const totalAnticiposSaclie = clients.reduce((acc, c) => acc + c.pagosASaclie, 0);
  const totalAnticiposSaacxc = clients.reduce((acc, c) => acc + c.anticiposSaacxc, 0);

  const diffDeuda = Math.round((totalDeudaSaclie - totalDeudaSaacxc) * 100) / 100;
  const diffAnticipos = Math.round((totalAnticiposSaclie - totalAnticiposSaacxc) * 100) / 100;
  const isGlobalBalanced = Math.abs(diffDeuda) < 0.01 && Math.abs(diffAnticipos) < 0.01;

  const currentSql = activeTab === 'comprobacion'
    ? generateReconciliationScript(databaseName)
    : generateAlignmentScript(databaseName);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = activeTab === 'comprobacion' 
      ? `Saint_Comprobacion_Cuadre_CxC_${databaseName}.sql`
      : `Saint_Nivelacion_SACLIE_SAACxC_${databaseName}.sql`;
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

  const handleSimulateAlignment = () => {
    const aligned = clients.map(c => ({
      ...c,
      saldoSaclie: c.saldoSaacxc,
      pagosASaclie: c.anticiposSaacxc
    }));
    setClients(aligned);
    setSimulatedAligned(true);
  };

  const handleResetSimulation = () => {
    setClients([
      {
        codClie: 'C-00142',
        nombre: 'DISTRIBUIDORA BAZAR C.A.',
        saldoSaclie: 1700.00,
        saldoSaacxc: 1700.00,
        pagosASaclie: 400.00,
        anticiposSaacxc: 400.00,
        documentosVivos: 2
      },
      {
        codClie: 'C-00210',
        nombre: 'COMERCIAL LOS ANDES S.R.L.',
        saldoSaclie: 2450.00,
        saldoSaacxc: 1850.00,
        pagosASaclie: 0.00,
        anticiposSaacxc: 200.00,
        documentosVivos: 3
      },
      {
        codClie: 'C-00305',
        nombre: 'FARMACIA CENTRAL EXPRESS',
        saldoSaclie: 820.50,
        saldoSaacxc: 970.50,
        pagosASaclie: 150.00,
        anticiposSaacxc: 150.00,
        documentosVivos: 3
      },
      {
        codClie: 'C-00412',
        nombre: 'INVERSIONES LA COLINA',
        saldoSaclie: 3100.00,
        saldoSaacxc: 3100.00,
        pagosASaclie: 500.00,
        anticiposSaacxc: 500.00,
        documentosVivos: 4
      }
    ]);
    setSimulatedAligned(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <Scale className="w-4 h-4 text-blue-400" /> Conciliación y Cuadre de Cartera
              </span>
              <span className="text-xs text-slate-400">Verificación de Integridad Relacional</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              ¿Cómo comprobar que SUM(SAACxC.Saldo) == SUM(SACLIE.Saldo)?
            </h2>
            <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
              En Saint Enterprise, cada factura, nota de débito, cobro o nota de crédito tiene un campo <code className="text-blue-300 font-mono">SAACxC.Saldo</code> (saldo vivo pendiente). 
              La ficha de cada cliente en <code className="text-blue-300 font-mono">SACLIE.Saldo</code> debe coincidir <strong>al céntimo</strong> con la sumatoria de sus documentos abiertos. 
              A continuación dispone de los scripts T-SQL para auditarlo en SSMS y un simulador interactivo de cuadre.
            </p>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl shrink-0 w-full lg:w-auto">
            <div className="text-xs text-slate-400 font-medium mb-1">Ecuación Fundamental Saint:</div>
            <div className="font-mono text-xs text-emerald-400 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
              SACLIE.Saldo = ∑(Débitos.Saldo) - ∑(Créditos.Saldo)
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Reconciliation Sandbox Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Simulador Visual de Cuadre de Cartera (Muestra en Vivo)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare cómo el motor SQL detecta clientes con descuadre y los nivela automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!simulatedAligned ? (
              <button
                onClick={handleSimulateAlignment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md shadow-blue-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simular Nivelación Instantánea</span>
              </button>
            ) : (
              <button
                onClick={handleResetSimulation}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700"
              >
                <span>Restaurar Descuadre Inicial</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Balance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Total Deuda (SACLIE.Saldo):</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              $ {totalDeudaSaclie.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">vs SAACxC: $ {totalDeudaSaacxc.toFixed(2)}</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Total Anticipos (SACLIE.PagosA):</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              $ {totalAnticiposSaclie.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Anticipos 50 - 25 disponibles</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Posición Neta Real (Saldo - PagosA):</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              $ {(totalDeudaSaclie - totalAnticiposSaclie).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Deuda neta exigible de clientes</div>
          </div>

          <div className={`p-4 rounded-xl border ${
            isGlobalBalanced 
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
              : 'bg-red-950/30 border-red-500/40 text-red-300'
          }`}>
            <span className="text-xs font-semibold">Estado de Cuadre:</span>
            <div className="text-sm font-bold font-mono mt-1">
              {isGlobalBalanced ? 'DIFERENCIA: $ 0.00' : `Dif. Deuda: $ ${diffDeuda.toFixed(2)} | Dif. PagosA: $ ${diffAnticipos.toFixed(2)}`}
            </div>
            <div className="text-[11px] font-medium flex items-center gap-1 mt-1">
              {isGlobalBalanced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DEUDA Y ANTICIPOS CUADRADOS</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>REQUIERE NIVELACIÓN</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Clients Reconciliation Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-3.5 py-3">Código</th>
                  <th className="px-3.5 py-3">Cliente</th>
                  <th className="px-3.5 py-3 text-right">Saldo Deudor (SACLIE)</th>
                  <th className="px-3.5 py-3 text-right">Deuda SAACxC</th>
                  <th className="px-3.5 py-3 text-right text-amber-300">PagosA (SACLIE)</th>
                  <th className="px-3.5 py-3 text-right text-amber-300">Anticipos (50-25)</th>
                  <th className="px-3.5 py-3 text-right text-cyan-300 font-bold">Posición Neta</th>
                  <th className="px-3.5 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {clients.map((c) => {
                  const diffD = Math.round((c.saldoSaclie - c.saldoSaacxc) * 100) / 100;
                  const diffP = Math.round((c.pagosASaclie - c.anticiposSaacxc) * 100) / 100;
                  const isBalanced = Math.abs(diffD) < 0.01 && Math.abs(diffP) < 0.01;
                  const neto = Math.round((c.saldoSaclie - c.pagosASaclie) * 100) / 100;

                  return (
                    <tr key={c.codClie} className="hover:bg-slate-800/40 transition">
                      <td className="px-3.5 py-3 text-slate-300 font-bold">{c.codClie}</td>
                      <td className="px-3.5 py-3 font-sans text-white">{c.nombre}</td>
                      <td className="px-3.5 py-3 text-right text-slate-200">$ {c.saldoSaclie.toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-right text-slate-300">$ {c.saldoSaacxc.toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-right text-amber-300">$ {c.pagosASaclie.toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-right text-amber-300/80">$ {c.anticiposSaacxc.toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-right font-bold text-cyan-300">$ {neto.toFixed(2)}</td>
                      <td className="px-3.5 py-3 text-center font-sans">
                        {isBalanced ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Cuadrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" /> Descuadre
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SQL Script View & Downloader */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('comprobacion')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'comprobacion'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Script de Comprobación y Auditoría SSMS
            </button>
            <button
              onClick={() => setActiveTab('nivelacion')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'nivelacion'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Script de Auto-Nivelación Directa (SACLIE &lt;- SAACxC)
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .SQL</span>
            </button>
          </div>
        </div>

        {/* Database selector input */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <Database className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-300 font-medium">Base de Datos:</span>
          <input
            type="text"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-blue-500 w-48"
            placeholder="BazarAdminDb"
          />
        </div>

        {/* SQL Viewer */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96 select-all">
            {currentSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
