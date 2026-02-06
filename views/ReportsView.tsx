
import React, { useMemo, useState } from 'react';
import { AppState, BatchReception, Dispatch, Client, UserRole, User } from '../types';

interface ReportsViewProps {
  state: AppState;
  user: User;
}

const ReportsView: React.FC<ReportsViewProps> = ({ state, user }) => {
  const [reportType, setReportType] = useState<'kardex' | 'ref' | 'client' | 'seller'>('kardex');
  const [refInput, setRefInput] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [sellerInput, setSellerInput] = useState('');
  const [selectedCorreriaId, setSelectedCorreriaId] = useState('global');

  const kardexData = useMemo(() => {
    const data: Record<string, { in: number, out: number, av: number, lots: number }> = {};
    state.receptions.forEach(r => {
      const uniqueRefsInThisBatch = new Set<string>();
      r.items.forEach(i => {
        if (!data[i.reference]) data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
        data[i.reference].in += i.quantity;
        data[i.reference].av += i.quantity;
        uniqueRefsInThisBatch.add(i.reference);
      });
      uniqueRefsInThisBatch.forEach(ref => { if (data[ref]) data[ref].lots += 1; });
    });
    state.dispatches.forEach(d => d.items.forEach(i => {
      if (!data[i.reference]) data[i.reference] = { in: 0, out: 0, av: 0, lots: 0 };
      data[i.reference].out += i.quantity;
      data[i.reference].av -= i.quantity;
    }));
    return data;
  }, [state.receptions, state.dispatches]);

  const renderKardex = () => {
    const sorted = Object.entries(kardexData).sort((a,b)=>a[0].localeCompare(b[0]));
    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
        <div className="p-10 bg-blue-50 border-b border-slate-100"><h3 className="text-2xl font-black text-blue-900 tracking-tighter">Kardex Global</h3></div>
        <table className="w-full text-left">
          <thead><tr className="bg-slate-50"><th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400">Referencia</th><th className="px-6 py-6 text-center text-[10px] font-black uppercase text-slate-400">Lots</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-400">Entradas</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-400">Salidas</th><th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-400">Stock</th></tr></thead>
          <tbody>
            {sorted.map(([ref, stats]: [string, any]) => (
              <tr key={ref} className="hover:bg-slate-50 border-b border-slate-50 last:border-0"><td className="px-10 py-6 font-black text-slate-800">{ref}</td><td className="px-6 py-6 text-center font-bold">{stats.lots}</td><td className="px-10 py-6 text-right font-bold text-slate-400">{stats.in}</td><td className="px-10 py-6 text-right font-bold text-pink-400">{stats.out}</td><td className="px-10 py-6 text-right"><span className="px-4 py-1.5 bg-blue-100 text-blue-600 font-black rounded-xl">{stats.av}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRefDetail = () => {
    let refsToShow = state.references.sort((a,b)=>a.id.localeCompare(b.id));
    if (refInput) refsToShow = refsToShow.filter(r => r.id.includes(refInput.toUpperCase()));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {refsToShow.map(r => {
            const stats = kardexData[r.id] || { in: 0, out: 0, av: 0, lots: 0 };
            return (
              <div key={r.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <h4 className="text-2xl font-black text-indigo-600 tracking-tighter">{r.id}</h4>
                   <span className="text-[9px] font-black bg-slate-50 px-3 py-1 rounded-full uppercase text-slate-400">{r.designer}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 mb-6 uppercase">{r.description}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Entradas</p><p className="font-black text-slate-800">{stats.in}</p></div>
                   <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase mb-1">Salidas</p><p className="font-black text-pink-500">{stats.out}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderClientDetail = () => {
    let clientsToShow = state.clients.sort((a,b)=>a.id.localeCompare(b.id));
    if (clientInput) clientsToShow = clientsToShow.filter(c => c.id.includes(clientInput.toUpperCase()) || c.name.toUpperCase().includes(clientInput.toUpperCase()));

    return (
      <div className="space-y-6">
         <div className="flex justify-end bg-white p-4 rounded-3xl border mb-6">
            <select value={selectedCorreriaId} onChange={e=>setSelectedCorreriaId(e.target.value)} className="bg-transparent border-none text-xs font-black">
               <option value="global">Histórico Global</option>
               {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
            </select>
         </div>
         <div className="grid grid-cols-1 gap-4">
           {clientsToShow.map(c => {
             const clientOrders = state.orders.filter(o => o.clientId === c.id && (selectedCorreriaId === 'global' || o.correriaId === selectedCorreriaId));
             const clientDispatches = state.dispatches.filter(d => d.clientId === c.id && (selectedCorreriaId === 'global')); // Dispatches aren't tied directly to correria in state usually
             
             const totalOrdered = clientOrders.reduce((acc, o) => acc + o.items.reduce((a,i)=>a+i.quantity, 0), 0);
             const totalDispatched = clientDispatches.reduce((acc, d) => acc + d.items.reduce((a,i)=>a+i.quantity, 0), 0);

             return (
               <div key={c.id} className="bg-white p-6 rounded-[24px] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                  <div>
                    <h5 className="text-xl font-black text-slate-800 leading-none">{c.name}</h5>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">ID: {c.id} • VENDEDOR: <span className="text-pink-500 uppercase">{c.seller}</span></p>
                  </div>
                  <div className="flex gap-8 text-center">
                     <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Pedidas</p><p className="text-xl font-black text-blue-600">{totalOrdered}</p></div>
                     <div><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Despachadas</p><p className="text-xl font-black text-pink-600">{totalDispatched}</p></div>
                     <div className="border-l pl-8"><p className="text-[8px] font-black text-slate-300 uppercase mb-1">Pendientes</p><p className="text-xl font-black text-red-500">{Math.max(0, totalOrdered - totalDispatched)}</p></div>
                  </div>
               </div>
             );
           })}
         </div>
      </div>
    );
  };

  const renderSellerReport = () => {
    let sellersToShow = Array.from(new Set(state.clients.map(c => c.seller))).sort();
    if (sellerInput) sellersToShow = sellersToShow.filter(s => s.toUpperCase().includes(sellerInput.toUpperCase()));

    return (
      <div className="space-y-6">
         <div className="flex justify-end bg-white p-4 rounded-3xl border mb-6">
            <select value={selectedCorreriaId} onChange={e=>setSelectedCorreriaId(e.target.value)} className="bg-transparent border-none text-xs font-black">
               <option value="global">Histórico Global</option>
               {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
            </select>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sellersToShow.map(s => {
               const sellerOrders = state.orders.filter(o => o.sellerId === state.sellers.find(sel=>sel.name===s)?.id && (selectedCorreriaId === 'global' || o.correriaId === selectedCorreriaId));
               const totalUnits = sellerOrders.reduce((acc, o) => acc + o.items.reduce((a,i)=>a+i.quantity, 0), 0);
               const totalVal = sellerOrders.reduce((acc, o) => acc + o.totalValue, 0);

               return (
                 <div key={s} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Vendedor</p>
                       <h5 className="text-2xl font-black text-slate-800">{s}</h5>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-indigo-600">${totalVal.toLocaleString()}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase">{totalUnits} Unidades</p>
                    </div>
                 </div>
               );
            })}
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Reportes</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl text-[10px] uppercase">Exportar PDF</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 no-print items-center">
        <div className="flex gap-2 p-1 bg-white rounded-2xl border shadow-sm">
          <TabBtnSmall active={reportType === 'kardex'} onClick={() => setReportType('kardex')} label="Kardex" />
          <TabBtnSmall active={reportType === 'ref'} onClick={() => setReportType('ref')} label="Referencias" />
          <TabBtnSmall active={reportType === 'client'} onClick={() => setReportType('client')} label="Clientes" />
          {user.role === UserRole.admin && <TabBtnSmall active={reportType === 'seller'} onClick={() => setReportType('seller')} label="Vendedores" />}
        </div>
        
        {reportType === 'ref' && <input value={refInput} onChange={e => setRefInput(e.target.value)} placeholder="Ref..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'client' && <input value={clientInput} onChange={e => setClientInput(e.target.value)} placeholder="Cliente ID/Nombre..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
        {reportType === 'seller' && <input value={sellerInput} onChange={e => setSellerInput(e.target.value)} placeholder="Vendedor..." className="px-4 py-2 bg-white border rounded-xl text-xs font-bold" />}
      </div>

      <div className="mt-4">
        {reportType === 'kardex' && renderKardex()}
        {reportType === 'ref' && renderRefDetail()}
        {reportType === 'client' && renderClientDetail()}
        {reportType === 'seller' && renderSellerReport()}
      </div>
    </div>
  );
};

const TabBtnSmall = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${active ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{label}</button>
);

export default ReportsView;
