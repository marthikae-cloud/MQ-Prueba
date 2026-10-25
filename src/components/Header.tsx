import React from 'react';
import { Database, ShieldAlert, Zap, Award, Server } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Auditor & Optimizador CxC Saint Enterprise
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" /> Canal Integrador Certificado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Diagnóstico de seguridad, optimización basada en conjuntos (Set-Based CTE) y corrección de saldos para <span className="font-mono text-slate-300">SAACxC</span> y <span className="font-mono text-slate-300">SACLIE</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Motor: <strong>Microsoft SQL Server</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Rendimiento: <strong>CTE Window vs Cursores</strong></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
