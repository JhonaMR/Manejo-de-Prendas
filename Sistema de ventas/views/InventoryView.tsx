
import React, { useMemo, useState } from 'react';
import { BatchReception, Dispatch, ItemEntry } from '../types';

interface InventoryViewProps {
  receptions: BatchReception[];
  dispatches: Dispatch[];
}

const InventoryView: React.FC<InventoryViewProps> = ({ receptions, dispatches }) => {
  const [search, setSearch] = useState('');

  const stockByRef = useMemo(() => {
    const stock: Record<string, {
      received: number,
      dispatched: number,
      available: number,
      sizes: Record<string, { r: number, d: number, a: number }>,
      lotsCount: number
    }> = {};

    receptions.forEach(r => {
      r.items.forEach(item => {
        if (!stock[item.reference]) {
          stock[item.reference] = { received: 0, dispatched: 0, available: 0, sizes: {}, lotsCount: 0 };
        }
        stock[item.reference].received += item.quantity;
        stock[item.reference].available += item.quantity;
        
        if (!stock[item.reference].sizes[item.size]) stock[item.reference].sizes[item.size] = { r: 0, d: 0, a: 0 };
        stock[item.reference].sizes[item.size].r += item.quantity;
        stock[item.reference].sizes[item.size].a += item.quantity;
      });
      const uniqueRefsInBatch = new Set(r.items.map(i => i.reference));
      // FIX: Cast ref to string to fix 'unknown' type error
      uniqueRefsInBatch.forEach((ref: string) => {
        if (stock[ref]) stock[ref].lotsCount += 1;
      });
    });

    dispatches.forEach(d => {
      d.items.forEach(item => {
        if (!stock[item.reference]) return;
        stock[item.reference].dispatched += item.quantity;
        stock[item.reference].available -= item.quantity;
        
        if (!stock[item.reference].sizes[item.size]) stock[item.reference].sizes[item.size] = { r: 0, d: 0, a: 0 };
        stock[item.reference].sizes[item.size].d += item.quantity;
        stock[item.reference].sizes[item.size].a -= item.quantity;
      });
    });

    return stock;
  }, [receptions, dispatches]);

  // Filter and Sort entries
  const filteredSortedStock = useMemo(() => {
    return Object.entries(stockByRef)
      .filter(([ref]) => !search.trim() || ref.toUpperCase().includes(search.toUpperCase()))
      .sort(([refA], [refB]) => refA.localeCompare(refB));
  }, [stockByRef, search]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">Inventario</h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base">Existencias actuales por referencia</p>
        </div>
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar referencia..."
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

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {filteredSortedStock.length === 0 ? (
          <div className="bg-white p-12 sm:p-24 rounded-[32px] sm:rounded-[48px] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold italic">
            {search ? `No se encontraron resultados para "${search}"` : 'No hay mercancía registrada en bodega'}
          </div>
        ) : (
          filteredSortedStock.map(([ref, data]) => (
            <div key={ref} className="bg-white rounded-[20px] sm:rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all border-l-4 border-l-blue-500">
              {/* Header section - more compact */}
              <div className="px-4 py-2 sm:px-6 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 bg-slate-50/40">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none">{ref}</h3>
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded leading-none">
                    Lotes: {data.lotsCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white rounded-lg shadow-xs border border-slate-100 text-center min-w-[70px]">
                    <p className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Stock Disp.</p>
                    <p className="text-base sm:text-lg font-black text-blue-600 leading-none">{data.available}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-white rounded-lg shadow-xs border border-slate-100 text-center min-w-[70px]">
                    <p className="text-[6px] sm:text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Recibidas</p>
                    <p className="text-base sm:text-lg font-black text-slate-800 leading-none">{data.received}</p>
                  </div>
                </div>
              </div>

              {/* Sizes section - more compact */}
              <div className="px-4 py-2 sm:px-6 sm:py-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                <div className="lg:col-span-8 flex flex-wrap gap-1">
                  {/* FIX: Cast sData as any to fix 'unknown' type errors */}
                  {Object.entries(data.sizes).map(([size, sData]: [string, any]) => (
                    <div key={size} className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none">{size}</span>
                      <span className="text-[11px] sm:text-xs font-black text-slate-700 leading-none">{sData.a}</span>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-4 flex gap-1.5">
                   <div className="flex-1 p-1.5 bg-blue-50/50 rounded-lg text-center">
                      <p className="text-[6px] font-black text-blue-400 uppercase leading-none mb-0.5">Ingresos</p>
                      <p className="text-[10px] sm:text-xs font-black text-blue-600 leading-none">+{data.received}</p>
                   </div>
                   <div className="flex-1 p-1.5 bg-pink-50/50 rounded-lg text-center">
                      <p className="text-[6px] font-black text-pink-400 uppercase leading-none mb-0.5">Despachos</p>
                      <p className="text-[10px] sm:text-xs font-black text-pink-600 leading-none">-{data.dispatched}</p>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryView;
