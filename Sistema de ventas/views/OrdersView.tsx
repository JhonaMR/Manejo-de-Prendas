
import React, { useState, useMemo } from 'react';
import { AppState, Correria, Reference, ProductionTracking } from '../types';

interface OrdersViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({ state, updateState }) => {
  const [selectedCorreriaId, setSelectedCorreriaId] = useState(state.correrias[0]?.id || '');
  const [refFilter, setRefFilter] = useState('');
  const [clothFilter, setClothFilter] = useState('');
  const [hideZeros, setHideZeros] = useState(false);

  const reportData = useMemo(() => {
    if (!selectedCorreriaId) return [];

    let data = state.references.map(ref => {
      const refOrders = state.orders.filter(o => o.correriaId === selectedCorreriaId);
      const totalSold = refOrders.reduce((acc, order) => {
        const item = order.items.find(i => i.reference === ref.id);
        return acc + (item?.quantity || 0);
      }, 0);

      const clientsWhoOrdered = new Set(
        refOrders
          .filter(o => o.items.some(i => i.reference === ref.id))
          .map(o => o.clientId)
      );

      const received = state.receptions.reduce((acc, r) => 
        acc + r.items.filter(i => i.reference === ref.id).reduce((a, b) => a + b.quantity, 0), 0);
      const dispatched = state.dispatches.reduce((acc, d) => 
        acc + d.items.filter(i => i.reference === ref.id).reduce((a, b) => a + b.quantity, 0), 0);
      const stock = received - dispatched;

      const prod = state.production.find(p => p.refId === ref.id && p.correriaId === selectedCorreriaId) || { programmed: 0, cut: 0 };
      const pending = totalSold - prod.cut;

      const totalCloth1 = (ref.avgCloth1 || 0) * totalSold;
      const totalCloth2 = (ref.avgCloth2 || 0) * totalSold;

      return {
        ...ref,
        totalSold,
        stock,
        programmed: prod.programmed,
        cut: prod.cut,
        pending: Math.max(0, pending),
        clientCount: clientsWhoOrdered.size,
        totalCloth1,
        totalCloth2
      };
    });

    if (refFilter) data = data.filter(r => r.id.includes(refFilter.toUpperCase()));
    if (clothFilter) data = data.filter(r => 
      (r.cloth1?.toUpperCase().includes(clothFilter.toUpperCase())) || 
      (r.cloth2?.toUpperCase().includes(clothFilter.toUpperCase()))
    );
    if (hideZeros) data = data.filter(r => r.totalSold > 0);

    return data;
  }, [selectedCorreriaId, state.orders, state.references, state.receptions, state.dispatches, state.production, refFilter, clothFilter, hideZeros]);

  const updateProduction = (refId: string, field: 'programmed' | 'cut', value: number) => {
    updateState(prev => {
      const existingIdx = prev.production.findIndex(p => p.refId === refId && p.correriaId === selectedCorreriaId);
      const newList = [...prev.production];
      if (existingIdx > -1) {
        newList[existingIdx] = { ...newList[existingIdx], [field]: value };
      } else {
        newList.push({ refId, correriaId: selectedCorreriaId, programmed: 0, cut: 0, [field]: value });
      }
      return { ...prev, production: newList };
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Ventas y producción</h2>
          <p className="text-slate-500 font-bold text-xs mt-1">Campaña: {state.correrias.find(c => c.id === selectedCorreriaId)?.name}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Referencia</span>
            <input type="text" value={refFilter} onChange={e => setRefFilter(e.target.value)} placeholder="Ej: 10210" className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-28 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-600 uppercase ml-2 mb-1">Tela</span>
            <input type="text" value={clothFilter} onChange={e => setClothFilter(e.target.value)} placeholder="Ej: Lino" className="px-3 py-1.5 bg-slate-50 rounded-xl text-xs font-bold w-28 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-100 pl-3 h-10 mt-2">
             <input type="checkbox" checked={hideZeros} onChange={e => setHideZeros(e.target.checked)} id="hz" className="rounded text-blue-600 focus:ring-blue-500" />
             <label htmlFor="hz" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">Ocultar 0</label>
          </div>
          <div className="flex flex-col border-l border-slate-100 pl-3">
            <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Campaña</span>
            <select value={selectedCorreriaId} onChange={e => setSelectedCorreriaId(e.target.value)} className="bg-transparent border-none font-black text-xs p-0 focus:ring-0 text-slate-800">
              {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[10px] min-w-[1300px] table-fixed">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-4 font-black uppercase w-32 text-slate-700">Referencia</th>
                <th className="px-2 py-4 font-black uppercase text-center w-16 text-blue-800">Vendido</th>
                <th className="px-2 py-4 font-black uppercase text-center w-14 text-slate-700">Stock</th>
                <th className="px-2 py-4 font-black uppercase text-center w-24 text-indigo-700">Prog.</th>
                <th className="px-2 py-4 font-black uppercase text-center w-24 text-pink-700">Cortado</th>
                <th className="px-2 py-4 font-black uppercase text-center w-14 text-red-700">Pend.</th>
                <th className="px-2 py-4 font-black uppercase text-center w-10 text-slate-700">Clt</th>
                <th className="px-4 py-4 font-black uppercase text-center w-48 border-l border-slate-200 text-slate-700">Tela 1 / Prom / Total</th>
                <th className="px-4 py-4 font-black uppercase text-center w-48 border-l border-slate-200 text-slate-700">Tela 2 / Prom / Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-black text-slate-800 text-[11px] leading-tight">{row.id}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase truncate">{row.description}</p>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span className={`px-2 py-1 rounded-md font-black ${row.totalSold > 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{row.totalSold}</span>
                  </td>
                  <td className="px-2 py-3 text-center font-bold text-slate-600">{row.stock}</td>
                  <td className="px-2 py-3 text-center">
                    <input type="number" value={row.programmed} onChange={e => updateProduction(row.id, 'programmed', Number(e.target.value))} className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-indigo-700 focus:ring-2 focus:ring-indigo-100" />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <input type="number" value={row.cut} onChange={e => updateProduction(row.id, 'cut', Number(e.target.value))} className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-black text-center text-pink-700 focus:ring-2 focus:ring-pink-100" />
                  </td>
                  <td className="px-2 py-3 text-center font-black text-red-600">{row.pending}</td>
                  <td className="px-2 py-3 text-center font-bold text-slate-600">{row.clientCount}</td>
                  
                  {/* TELA 1 Column */}
                  <td className="px-4 py-3 border-l border-slate-100">
                    {row.cloth1 ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="font-black text-slate-800 truncate text-[9px] uppercase">{row.cloth1}</span>
                          <span className="text-[8px] font-bold text-slate-500">Prom: {row.avgCloth1}</span>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          <span className="text-blue-700 font-black text-[10px]">{row.totalCloth1.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300">-</div>
                    )}
                  </td>

                  {/* TELA 2 Column */}
                  <td className="px-4 py-3 border-l border-slate-100">
                    {row.cloth2 ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="font-black text-slate-800 truncate text-[9px] uppercase">{row.cloth2}</span>
                          <span className="text-[8px] font-bold text-slate-500">Prom: {row.avgCloth2}</span>
                        </div>
                        <div className="bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
                          <span className="text-pink-700 font-black text-[10px]">{row.totalCloth2.toFixed(1)}m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-300">-</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;
