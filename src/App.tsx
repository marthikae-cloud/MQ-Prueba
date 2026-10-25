/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Code2, 
  Calculator, 
  BookOpen, 
  CheckCircle2,
  Database,
  Terminal,
  Award,
  Scale,
  Zap
} from 'lucide-react';
import { Header } from './components/Header';
import { ScriptAuditView } from './components/ScriptAuditView';
import { SqlGeneratorView } from './components/SqlGeneratorView';
import { CxCSimulatorView } from './components/CxCSimulatorView';
import { TipoCxCDictionaryView } from './components/TipoCxCDictionaryView';
import { ReconciliationView } from './components/ReconciliationView';
import { TriggerAuditView } from './components/TriggerAuditView';
import { RatesHistoryView } from './components/RatesHistoryView';
import { ReportBuilderView } from './components/ReportBuilderView';
import { History, FileText } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'report_builder' | 'rates_history' | 'trigger' | 'reconciliation' | 'audit' | 'generator' | 'simulator' | 'dictionary'>('report_builder');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Navigation Tabs */}
      <div className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
            <button
              onClick={() => setActiveView('rates_history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'rates_history'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4 text-emerald-300" />
              <span>Histórico de Tasas (Bitácora)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Recomendado
              </span>
            </button>

            <button
              onClick={() => setActiveView('trigger')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'trigger'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Auditoría de Trigger Factor (SACONF)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                ¡Fallo!
              </span>
            </button>

            <button
              onClick={() => setActiveView('report_builder')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'report_builder'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>Report Builder: Locales & Solvencia</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                Nuevo
              </span>
            </button>

            <button
              onClick={() => setActiveView('reconciliation')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'reconciliation'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4 text-cyan-300" />
              <span>Comprobar Cuadre (SACLIE vs SAACxC)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                Cuadrado
              </span>
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'audit'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Auditoría de tu Script</span>
            </button>

            <button
              onClick={() => setActiveView('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'generator'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Scripts SQL Optimizados (Set-Based)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Solución
              </span>
            </button>

            <button
              onClick={() => setActiveView('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'simulator'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulador de Recálculo en Vivo</span>
            </button>

            <button
              onClick={() => setActiveView('dictionary')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === 'dictionary'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Diccionario TipoCxC & Guía DBA</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'report_builder' && (
          <ReportBuilderView />
        )}

        {activeView === 'rates_history' && (
          <RatesHistoryView />
        )}

        {activeView === 'trigger' && (
          <TriggerAuditView />
        )}

        {activeView === 'reconciliation' && (
          <ReconciliationView />
        )}

        {activeView === 'audit' && (
          <ScriptAuditView onGoToGenerator={() => setActiveView('generator')} />
        )}

        {activeView === 'generator' && (
          <SqlGeneratorView />
        )}

        {activeView === 'simulator' && (
          <CxCSimulatorView />
        )}

        {activeView === 'dictionary' && (
          <TipoCxCDictionaryView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Saint Enterprise Administrativo</span>
            <span>•</span>
            <span>Arquitectura de Base de Datos para Canales Integradores</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Microsoft SQL Server</span>
            <span>•</span>
            <span>Recálculo ACID Atómico</span>
            <span>•</span>
            <span>Tablas SAACxC & SACLIE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
