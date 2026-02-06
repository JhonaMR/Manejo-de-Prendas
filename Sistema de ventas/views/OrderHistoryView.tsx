
import React, { useState, useMemo } from 'react';
import { AppState, Order } from '../types';
import { Icons } from '../constants';

interface OrderHistoryViewProps {
  state: AppState;
}

const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({ state }) => {
  const [filterSeller, setFilterSeller] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCorreria, setFilterCorreria] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const years = useMemo(() => Array.from(new Set(state.correrias.map(c => c.year))).sort(), [state.correrias]);

  const filteredOrders = useMemo(() => {
    return state.orders.filter(o => {
      const correria = state.correrias.find(c => c.id === o.correriaId);
      if (filterSeller && o.sellerId !== filterSeller) return false;
      if (filterYear && correria?.year !== filterYear) return false;
      if (filterCorreria && correria?.name !== filterCorreria) return false;
      return true;
    });
  }, [state.orders, state.correrias, filterSeller, filterYear, filterCorreria]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Historial de Pedidos</h2>
          <p className="text-slate-400 font-medium">Registro global de ventas tabuladas</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-4">Vendedor</label>
          <select 
            value={filterSeller} 
            onChange={e => setFilterSeller(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl font-bold text-xs"
          >
            <option value="">Todos los vendedores</option>
            {state.sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-4">Año</label>
          <select 
            value={filterYear} 
            onChange={e => setFilterYear(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl font-bold text-xs"
          >
            <option value="">Cualquier año</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-4">Correría</label>
          <select 
            value={filterCorreria} 
            onChange={e => setFilterCorreria(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl font-bold text-xs"
          >
            <option value="">Cualquier correría</option>
            {Array.from(new Set(state.correrias.map(c => c.name))).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button onClick={() => { setFilterSeller(''); setFilterYear(''); setFilterCorreria(''); }} className="px-6 self-end py-3 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase">Limpiar</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border border-slate-100 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
              <Icons.History />
            </div>
            <p className="text-slate-400 font-bold italic">No hay pedidos con los filtros seleccionados</p>
          </div>
        ) : (
          filteredOrders.map(o => {
            const client = state.clients.find(c => c.id === o.clientId);
            const seller = state.sellers.find(s => s.id === o.sellerId);
            const correria = state.correrias.find(c => c.id === o.correriaId);
            const isExpanded = expandedId === o.id;

            return (
              <div key={o.id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden transition-all group">
                <div 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase">{correria?.name} {correria?.year}</span>
                      <span className="text-[10px] text-slate-300 font-bold">{o.createdAt}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800">{client?.name || 'Cliente'}</h3>
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Vendedor: {seller?.name}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase">Resumen</p>
                      <p className="text-sm font-black text-slate-700">{o.items.length} Refs • {o.items.reduce((a,b)=>a+b.quantity,0)} Unid.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase">Valor Total</p>
                      <p className="text-lg font-black text-blue-600">${o.totalValue.toLocaleString()}</p>
                    </div>
                    <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-8 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 font-black text-slate-400 uppercase">Referencia</th>
                            <th className="px-6 py-4 font-black text-slate-400 uppercase text-center">Cantidad</th>
                            <th className="px-6 py-4 font-black text-slate-400 uppercase text-right">Precio Unit.</th>
                            <th className="px-6 py-4 font-black text-slate-400 uppercase text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {o.items.map((item, idx) => {
                            const ref = state.references.find(r => r.id === item.reference);
                            return (
                              <tr key={idx}>
                                <td className="px-6 py-4">
                                  <p className="font-black text-slate-800">{item.reference}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{ref?.description}</p>
                                </td>
                                <td className="px-6 py-4 text-center font-black text-slate-700">{item.quantity}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-500">${ref?.price.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-black text-blue-600">${((ref?.price || 0) * item.quantity).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50/80 font-black text-slate-800">
                            <td className="px-6 py-6 uppercase text-[9px] text-slate-400">Totales Pedido</td>
                            <td className="px-6 py-6 text-center">{o.items.reduce((a,b)=>a+b.quantity,0)}</td>
                            <td></td>
                            <td className="px-6 py-6 text-right text-blue-600 text-lg">${o.totalValue.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderHistoryView;
