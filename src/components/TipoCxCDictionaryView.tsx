import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Wrench, 
  HardDrive, 
  FileText
} from 'lucide-react';
import { SAINT_TIPOS_CXC, TipoCxCDef } from '../data/saintCxCSpecs';

export const TipoCxCDictionaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('TODOS');

  const filteredTipos = SAINT_TIPOS_CXC.filter(tipo => {
    const matchesSearch = 
      tipo.codigo.includes(searchTerm) ||
      tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.usoComun.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterClass === 'TODOS' || 
      tipo.clasificacion.toUpperCase().includes(filterClass.toUpperCase());

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (10, 31, 81), nombre o descripción..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['TODOS', 'DÉBITO', 'CRÉDITO', 'NEUTRO'].map(cls => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterClass === cls
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTipos.map(tipo => {
          const isDebit = tipo.factor === 1;
          const isCredit = tipo.factor === -1;

          return (
            <div 
              key={tipo.codigo}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
                      {tipo.codigo}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isDebit 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : isCredit 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {tipo.clasificacion} ({tipo.factor > 0 ? `+${tipo.factor}` : tipo.factor})
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-white text-sm mb-1.5">{tipo.nombre}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {tipo.descripcion}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Uso en Saint:</span> {tipo.usoComun}
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Integrator Expert Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          Guía de Mantenimiento y Recuperación para Canales Integradores Saint
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-400" />
              1. Índices Clave para Alto Desempeño en SAACxC
            </h4>
            <p className="text-slate-400 text-xs">
              Para que la consulta Set-Based con <code className="text-slate-300">PARTITION BY CodClie ORDER BY FechaE, NroUnico</code> vuele en menos de 2 segundos, verifique la existencia de este índice en SQL Server:
            </p>
            <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 text-[11px] font-mono overflow-x-auto">
{`CREATE NONCLUSTERED INDEX IX_SAACxC_CodClie_FechaE_NroUnico
ON dbo.SAACxC (CodClie, FechaE, NroUnico)
INCLUDE (Monto, TipoCxC, Saldo, SaldoAct);`}
            </pre>
            <p className="text-[11px] text-slate-400">
              Este índice convierte la búsqueda en un Index Seek directo eliminando cualquier cuello de botella.
            </p>
          </div>

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              2. Protocolo de Ejecución en Clientes con Producción Activa
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-400">
              <li>
                <strong className="text-slate-200">Ejecutar Script de Diagnóstico:</strong> Identificar cuántos clientes y facturas tienen descuadre.
              </li>
              <li>
                <strong className="text-slate-200">Respaldo Completo (.BAK):</strong> Nunca reparar una base de datos sin backup previo de SQL Server.
              </li>
              <li>
                <strong className="text-slate-200">Ejecutar en Bloque Transaccional:</strong> Si hay un cliente puntual con fallas, use el filtro <code className="text-slate-300">CodClie = 'X'</code> para resolverlo sin tocar a los demás.
              </li>
              <li>
                <strong className="text-slate-200">Mantenimiento Post-Reparación:</strong> Ejecutar <code className="text-slate-300">DBCC CHECKDB</code> y actualizar estadísticas (<code className="text-slate-300">sp_updatestats</code>).
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
