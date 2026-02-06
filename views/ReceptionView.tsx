
import React, { useState } from 'react';
import { User, UserRole, BatchReception, ItemEntry, AppState, ChargeType, Reference } from '../types';
import ScannerSimulator from '../components/ScannerSimulator';
import { Icons } from '../constants';

interface ReceptionViewProps {
  user: User;
  receptions: BatchReception[];
  updateState: (updater: (prev: AppState) => AppState) => void;
  referencesMaster: Reference[];
}

const ReceptionView: React.FC<ReceptionViewProps> = ({ user, receptions, updateState, referencesMaster }) => {
  const [isCounting, setIsCounting] = useState(false);
  const [editingLot, setEditingLot] = useState<BatchReception | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refSearch, setRefSearch] = useState('');

  // Form states
  const [confeccionista, setConfeccionista] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [hasSeconds, setHasSeconds] = useState<boolean | null>(null);
  const [chargeType, setChargeType] = useState<ChargeType>(null);
  const [chargeUnits, setChargeUnits] = useState(0);
  const [items, setItems] = useState<ItemEntry[]>([]);

  const handleStart = () => {
    setIsCounting(true);
    setEditingLot(null);
    setConfeccionista('');
    setBatchCode('');
    setHasSeconds(null);
    setChargeType(null);
    setChargeUnits(0);
    setItems([]);
  };

  const handleEdit = (lot: BatchReception) => {
    // FIX: UserRole.admin instead of UserRole.ADMIN
    if (user.role !== UserRole.admin) {
      alert("Acceso administrativo requerido para editar.");
      return;
    }
    setEditingLot(lot);
    setIsCounting(true);
    setConfeccionista(lot.confeccionista);
    setBatchCode(lot.batchCode);
    setHasSeconds(lot.hasSeconds);
    setChargeType(lot.chargeType);
    setChargeUnits(lot.chargeUnits);
    setItems(lot.items);
  };

  const handleScan = (ref: string, size: string, quantity: number) => {
    const refExists = referencesMaster.some(r => r.id === ref);
    if (!refExists) {
      alert(`AVISO: La referencia "${ref}" no existe en el maestro de referencias. Recuerde crearla en el apartado de Maestros.`);
    }

    setItems(prev => {
      const idx = prev.findIndex(i => i.reference === ref && i.size === size);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { reference: ref, size, quantity }];
    });
  };

  const handleSave = () => {
    if (!confeccionista || !batchCode) {
      alert("Nombre y Remisión son obligatorios");
      return;
    }
    if (chargeType && chargeUnits <= 0) {
      alert(`Debe especificar unidades para ${chargeType}`);
      return;
    }

    const data: BatchReception = {
      id: editingLot ? editingLot.id : Math.random().toString(36).substr(2, 9),
      batchCode,
      confeccionista,
      hasSeconds,
      chargeType,
      chargeUnits,
      items,
      receivedBy: editingLot ? editingLot.receivedBy : user.name,
      createdAt: editingLot ? editingLot.createdAt : new Date().toLocaleString(),
      editLogs: editingLot ? [...editingLot.editLogs, { user: user.name, date: new Date().toLocaleString() }] : []
    };

    updateState(prev => ({
      ...prev,
      receptions: editingLot 
        ? prev.receptions.map(r => r.id === data.id ? data : r)
        : [data, ...prev.receptions]
    }));

    setIsCounting(false);
  };

  const filteredReceptions = receptions.filter(r => {
    if (!refSearch.trim()) return true;
    return r.items.some(item => 
      item.reference.toUpperCase().includes(refSearch.toUpperCase())
    );
  });

  if (isCounting) {
    const totalCount = items.reduce((a, b) => a + b.quantity, 0);

    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{editingLot ? 'Editar Lote' : 'Conteo de Lote'}</h2>
            <p className="text-slate-400 font-bold text-xs sm:text-base">Registro de ingreso de producción</p>
          </div>
          <button onClick={() => setIsCounting(false)} className="px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-white text-slate-400 font-bold hover:text-red-500 transition-all border border-slate-100 text-sm">
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Confeccionista</label>
              <input value={confeccionista} onChange={e => setConfeccionista(e.target.value)} placeholder="Nombre completo" className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-900" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest px-4">Remisión</label>
              <input value={batchCode} onChange={e => setBatchCode(e.target.value)} placeholder="Remisión rosada" className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold tracking-widest text-slate-900" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">¿Tiene Segundas?</p>
                <p className="text-[10px] text-slate-400 font-bold">Control de calidad</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setHasSeconds(true)} 
                  className={`px-4 py-2 sm:px-6 sm:py-2 rounded-xl text-xs font-bold transition-all ${hasSeconds === true ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' : 'bg-white text-slate-400 border border-slate-100'}`}
                >SÍ</button>
                <button 
                  onClick={() => setHasSeconds(false)} 
                  className={`px-4 py-2 sm:px-6 sm:py-2 rounded-xl text-xs font-bold transition-all ${hasSeconds === false ? 'bg-slate-300 text-white shadow-lg shadow-slate-100' : 'bg-white text-slate-400 border border-slate-100'}`}
                >NO</button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Faltantes</p>
                  <p className="text-[10px] text-slate-400 font-bold">Por unidades</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setChargeType(chargeType === 'Compra' ? null : 'Compra')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${chargeType === 'Compra' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-100'}`}>COMPRA</button>
                  <button onClick={() => setChargeType(chargeType === 'Cobro' ? null : 'Cobro')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${chargeType === 'Cobro' ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-white text-slate-400 border border-slate-100'}`}>COBRO</button>
                </div>
              </div>
              {chargeType && (
                <div className="flex items-center gap-4 animate-in slide-in-from-top-2">
                  <p className={`text-[10px] font-black uppercase w-24 sm:w-32 ${chargeType === 'Compra' ? 'text-blue-500' : 'text-pink-500'}`}>Unid. a {chargeType.toLowerCase()}:</p>
                  <div className="flex-1 flex items-center bg-white rounded-2xl border border-slate-200 p-1.5 max-w-[160px]">
                     <button type="button" onClick={() => setChargeUnits(u => Math.max(0, u - 1))} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 font-bold active:scale-90">-</button>
                     <input type="number" value={chargeUnits} onChange={e => setChargeUnits(Number(e.target.value))} className="flex-1 text-center font-black bg-transparent border-none focus:ring-0 text-slate-900" />
                     <button type="button" onClick={() => setChargeUnits(u => u + 1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-500 font-bold active:scale-90">+</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <ScannerSimulator onScan={handleScan} />

        {items.length > 0 && (
          <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-black text-slate-700">Resumen de Lectura</h3>
              <div className="px-6 py-2 bg-blue-600 text-white rounded-full font-black text-sm shadow-lg shadow-blue-100 w-fit">
                Total Global: {totalCount}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(
                items.reduce((acc, curr) => {
                  if (!acc[curr.reference]) acc[curr.reference] = [];
                  acc[curr.reference].push(curr);
                  return acc;
                }, {} as Record<string, ItemEntry[]>)
                // FIX: Cast Object.entries result to fix 'unknown' type issues
              ).map(([ref, sizes]: [string, any]) => (
                <div key={ref} className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tighter">{ref}</span>
                    <span className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase">Subtotal: {sizes.reduce((a: number, b: ItemEntry) => a + b.quantity, 0)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((s: ItemEntry) => (
                      <div key={s.size} className="px-4 py-2 sm:px-5 sm:py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 group relative">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.size}</span>
                        <span className="font-black text-slate-800 text-base sm:text-lg">{s.quantity}</span>
                        <button 
                          onClick={() => setItems(prev => prev.filter(p => !(p.reference === ref && p.size === s.size)))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSave} className="w-full py-5 sm:py-6 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black text-xl sm:text-2xl rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-blue-200 hover:scale-[1.01] transition-all">
          GUARDAR RECEPCIÓN
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">Recepción de lotes</h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base">Control de lotes recibidos</p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input 
                type="text" 
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
                placeholder="Buscar por referencia en lotes..."
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-900 shadow-sm text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleStart} className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-blue-500 to-pink-500 text-white font-black rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
          <Icons.Reception />
          INICIAR CONTEO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReceptions.length === 0 ? (
          <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Icons.Reception />
            </div>
            <p className="text-slate-400 font-bold text-base sm:text-lg italic">
              {refSearch ? `No se encontraron lotes con la referencia "${refSearch}"` : 'Sin historial de recepciones hoy'}
            </p>
          </div>
        ) : (
          filteredReceptions.map(r => {
            const isExpanded = expandedId === r.id;
            const totalQty = r.items.reduce((a, b) => a + b.quantity, 0);
            const itemsByRef = r.items.reduce((acc, curr) => {
              if(!acc[curr.reference]) acc[curr.reference] = { qty: 0, sizes: {} as Record<string, number> };
              acc[curr.reference].qty += curr.quantity;
              acc[curr.reference].sizes[curr.size] = (acc[curr.reference].sizes[curr.size] || 0) + curr.quantity;
              return acc;
            }, {} as Record<string, { qty: number, sizes: Record<string, number> }>);

            return (
              <div key={r.id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                <div 
                  className="p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] sm:text-[10px] font-black bg-blue-50 text-blue-500 px-2.5 py-1 rounded-full uppercase tracking-tighter">{r.batchCode}</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{r.createdAt}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-800">{r.confeccionista}</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase">Prendas: <span className="text-slate-800 font-black">{totalQty}</span></span>
                      {r.hasSeconds && <span className="text-pink-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span> Con Segundas</span>}
                      {r.chargeType && <span className="text-blue-500 text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {r.chargeType} {r.chargeUnits > 0 ? `(${r.chargeUnits} ud)` : ''}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="text-left md:text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Recibido por</p>
                      <p className="text-xs font-black text-slate-500">{r.receivedBy}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-auto md:ml-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(r); }} className="p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all opacity-100 md:opacity-0 group-hover:opacity-100">
                        <Icons.Edit />
                      </button>
                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                         </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detalles de Recepción</p>
                          <div className="space-y-1">
                             <p className="font-black text-slate-800 text-base sm:text-lg">Confeccionista: {r.confeccionista}</p>
                             <p className="text-xs sm:text-sm font-bold text-slate-500">Remisión: {r.batchCode}</p>
                             {r.hasSeconds && <p className="text-[9px] sm:text-[10px] font-black text-pink-500 uppercase">LOTE CON SEGUNDAS</p>}
                             {r.chargeType && <p className="text-[9px] sm:text-[10px] font-black text-blue-500 uppercase">{r.chargeType}: {r.chargeUnits} unidades</p>}
                          </div>
                       </div>
                       <div className="md:text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditoría</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-600">Asentado por: <span className="text-slate-900 font-black">{r.receivedBy}</span></p>
                          <p className="text-xs sm:text-sm font-bold text-slate-600">Fecha: <span className="text-slate-900 font-black">{r.createdAt}</span></p>
                       </div>
                    </div>

                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                       <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[300px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest">Referencia</th>
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest">Cant x Talla</th>
                                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-center">Total Ref</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Object.entries(itemsByRef).map(([ref, rData]: [string, any]) => (
                                  <tr key={ref}>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4 font-black text-blue-600 text-xs sm:text-sm">{ref}</td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                                        <div className="flex flex-wrap gap-2">
                                          {Object.entries(rData.sizes).map(([s, q]: [string, any]) => (
                                              <span key={s} className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-black text-slate-500">{s}: {q}</span>
                                          ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-center font-black text-slate-800 text-xs sm:text-sm">{rData.qty}</td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50/80 border-t border-slate-100">
                                  <td colSpan={2} className="px-4 py-4 sm:px-6 sm:py-6 font-black text-slate-400 text-[9px] sm:text-[10px] uppercase tracking-widest text-right">TOTAL GLOBAL LOTE</td>
                                  <td className="px-4 py-4 sm:px-6 sm:py-6 text-center font-black text-blue-600 text-xl sm:text-2xl">{totalQty}</td>
                                </tr>
                            </tfoot>
                        </table>
                       </div>
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

export default ReceptionView;
