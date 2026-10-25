import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Calculator, 
  Layers, 
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { SAMPLE_CLIENT_TRANSACTIONS, SampleTransaction, SAINT_TIPOS_CXC } from '../data/saintCxCSpecs';

export const CxCSimulatorView: React.FC = () => {
  const [transactions, setTransactions] = useState<SampleTransaction[]>(SAMPLE_CLIENT_TRANSACTIONS);
  const [isCalculated, setIsCalculated] = useState(false);
  const [clientHeaderBalance, setClientHeaderBalance] = useState<number>(0.00); // Dañado
  const [correctHeaderBalance, setCorrectHeaderBalance] = useState<number | null>(null);

  // Run calculation logic exactly as in Saint Enterprise Set-Based logic
  const runRecalculation = () => {
    let runningAccumulator = 0;
    const updated = transactions.map((t) => {
      let factor = 0;
      // Débitos: 10 (Factura), 20 (ND), 27 (ND), 35 (Reverso Adelanto), 60 (Giro), 70 (Cuota)
      if (['10', '20', '27', '35', '60', '70'].includes(t.tipoCxC)) {
        factor = 1;
      // Créditos: 31 (NC), 36 (NC Ajuste), 37 (NC Bonificación), 41 (Pago recibido)
      } else if (['31', '36', '37', '41'].includes(t.tipoCxC)) {
        factor = -1;
      }

      // Excluidos en SaldoAct para no duplicar cruces cuando se aplican vía cobro 41
      if (!['50', '25'].includes(t.tipoCxC)) {
        runningAccumulator += factor * t.monto;
      }

      return {
        ...t,
        saldoActCorrecto: Math.round(runningAccumulator * 100) / 100
      };
    });

    setTransactions(updated);
    setIsCalculated(true);
    setCorrectHeaderBalance(Math.round(runningAccumulator * 100) / 100);
  };

  const handleReset = () => {
    setTransactions(SAMPLE_CLIENT_TRANSACTIONS.map(t => ({
      ...t,
      saldoActCorrecto: undefined
    })));
    setIsCalculated(false);
    setCorrectHeaderBalance(null);
  };

  return (
    <div className="space-y-6">
      {/* Simulation explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Sandbox Interactivo
              </span>
              <h3 className="text-xl font-bold text-white">Simulador de Recálculo de Saldos (Cliente C-00142)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Observe cómo la base de datos almacena actualmente saldos dañados en <code className="text-slate-300 font-mono">SAACxC.SaldoAct</code> y <code className="text-slate-300 font-mono">SACLIE.Saldo</code>, 
              y cómo el algoritmo Set-Based reconstruye la cronología matemática exacta con su diccionario personalizado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCalculated ? (
              <button
                onClick={runRecalculation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ejecutar Recálculo Matemático</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Estado Inicial Dañado</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Header summary comparison card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Ficha del Cliente en SACLIE</span>
            <div className="text-base font-bold text-white mt-1">DISTRIBUIDORA BAZAR C.A.</div>
            <div className="text-xs text-slate-500 font-mono">Código: C-00142 | RIF: J-30491820-1</div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-red-400 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Saldo Dañado Actual en SACLIE:
            </span>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">
              $ {clientHeaderBalance.toFixed(2)}
            </div>
            <div className="text-[11px] text-red-300/70">
              Descuadrado (No refleja la deuda real de las facturas vivas)
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Corregido Post-Recálculo:
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {correctHeaderBalance !== null ? `$ ${correctHeaderBalance.toFixed(2)}` : 'Pendiente de calcular'}
            </div>
            <div className="text-[11px] text-emerald-300/70">
              {correctHeaderBalance !== null ? '100% Cuadrado con el histórico acumulado' : 'Haga clic en Ejecutar Recálculo'}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            Movimientos en SAACxC (Orden Cronológico: FechaE ASC, NroUnico ASC)
          </h4>
          <span className="text-xs text-slate-400">Total: {transactions.length} movimientos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">NroUnico</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">TipoCxC</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-center">Signo en DB</th>
                <th className="px-4 py-3 text-right text-red-400 bg-red-950/20">SaldoAct Dañado</th>
                <th className="px-4 py-3 text-right text-emerald-400 bg-emerald-950/20 font-bold">SaldoAct Corregido</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {transactions.map((item) => {
                const tipoDef = SAINT_TIPOS_CXC.find(t => t.codigo === item.tipoCxC);
                const isDebit = ['10', '20', '27', '35', '60', '70'].includes(item.tipoCxC);
                const isCredit = ['31', '36', '37', '41'].includes(item.tipoCxC);

                return (
                  <tr key={item.nroUnico} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-400 font-medium">{item.nroUnico}</td>
                    <td className="px-4 py-3 text-slate-300">{item.fechaE}</td>
                    <td className="px-4 py-3 font-semibold text-white">{item.numeroD}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans bg-slate-800 text-slate-300 border border-slate-700">
                        <strong>{item.tipoCxC}</strong> - {tipoDef?.nombre || 'Doc'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      $ {item.monto.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        isDebit 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : isCredit 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {isDebit ? '+ (Débito)' : isCredit ? '- (Crédito)' : '0 (Anticipo / Cruce)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-red-400 bg-red-950/10 font-bold line-through">
                      $ {item.saldoActErroneo.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 bg-emerald-950/10 font-extrabold text-sm">
                      {item.saldoActCorrecto !== undefined ? (
                        `$ ${item.saldoActCorrecto.toFixed(2)}`
                      ) : (
                        <span className="text-slate-500 text-xs font-sans">Sin calcular</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.saldoActCorrecto !== undefined ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cuadrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-sans font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Corrupto
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

      {/* Educational walkthrough of the formula */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          Fórmula Matemática y Reglas según su Diccionario Personalizado Saint
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
              1. Débitos (+1 al Saldo)
            </span>
            <p className="text-slate-400">
              Códigos: <code className="text-slate-300">10 (Factura), 20 (ND), 27 (ND), 35 (Reverso Adelanto), 60 (Giro), 70 (Cuota)</code>.
            </p>
            <p className="text-slate-400">
              Incrementan la deuda exigible al cliente.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
              2. Créditos (-1 al Saldo)
            </span>
            <p className="text-slate-400">
              Códigos: <code className="text-slate-300">31 (NC), 36 (NC Ajuste/Desc.), 37 (NC Bonif.), 41 (Pago recibido)</code>.
            </p>
            <p className="text-slate-400">
              Abonos y devoluciones que rebajan la deuda del cliente.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px]">
              3. Adelantos y Anulaciones (50 / 25)
            </span>
            <p className="text-slate-400">
              Códigos: <code className="text-slate-300">50 (Adelanto - Pago anticipado) y 25 (Anula anticipo)</code>.
            </p>
            <p className="text-slate-400">
              Se excluyen del acumulado histórico para no duplicar el cruce cuando se emite el recibo 41, pero en cartera viva el saldo no cruzado de 50 resta como crédito a favor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
