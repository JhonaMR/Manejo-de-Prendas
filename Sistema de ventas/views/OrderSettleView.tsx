
import React, { useState, useRef } from 'react';
import { AppState, Order, ItemEntry, User, Client } from '../types';
import { Icons } from '../constants';

interface OrderSettleViewProps {
  state: AppState;
  user: User;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const OrderSettleView: React.FC<OrderSettleViewProps> = ({ state, user, updateState }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [selectedCorreriaId, setSelectedCorreriaId] = useState('');
  const [tempItems, setTempItems] = useState<ItemEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = state.clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.id.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const selectClient = (c: Client) => {
    setSelectedClientId(c.id);
    setClientSearch(`${c.id} - ${c.name}`);
    setShowClientResults(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rows = content.split('\n').filter(row => row.trim() !== '');
      
      const newItems: ItemEntry[] = [];
      for (let i = 1; i < rows.length; i++) {
        const [refId, qty] = rows[i].split(/[;,]/).map(c => c.trim());
        if (refId && qty) {
          const exists = state.references.some(r => r.id === refId);
          if (exists) {
            newItems.push({ reference: refId, size: 'UNICA', quantity: parseInt(qty) || 0 });
          }
        }
      }
      setTempItems(newItems);
    };
    reader.readAsText(file);
  };

  const handleSaveOrder = () => {
    if (!selectedClientId || !selectedSellerId || !selectedCorreriaId) {
      alert("Faltan campos obligatorios (Cliente, Vendedor o Campaña)");
      return;
    }
    if (tempItems.length === 0) {
      alert("No hay ítems cargados");
      return;
    }

    const totalValue = tempItems.reduce((acc, item) => {
      const ref = state.references.find(r => r.id === item.reference);
      return acc + (ref?.price || 0) * item.quantity;
    }, 0);

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: selectedClientId,
      sellerId: selectedSellerId,
      correriaId: selectedCorreriaId,
      items: tempItems,
      totalValue,
      createdAt: new Date().toLocaleString(),
      settledBy: user.name
    };

    updateState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders]
    }));

    alert("Pedido asentado con éxito");
    setTempItems([]);
    setSelectedClientId('');
    setClientSearch('');
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalUnits = tempItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Asentar Ventas</h2>
        <p className="text-slate-400 font-medium">Carga rápida de pedidos por cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800">1. Datos del Pedido</h3>
            
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Buscador Cliente</label>
                <input 
                  type="text" 
                  value={clientSearch}
                  onChange={(e) => { setClientSearch(e.target.value); setShowClientResults(true); if(!e.target.value) setSelectedClientId(''); }}
                  onFocus={() => setShowClientResults(true)}
                  placeholder="ID o Nombre..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                {showClientResults && clientSearch.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredClients.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => selectClient(c)}
                        className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <p className="font-black text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">ID: {c.id} • {c.city}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Vendedor</label>
                <select 
                  value={selectedSellerId} 
                  onChange={e => setSelectedSellerId(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900"
                >
                  <option value="">-- Seleccionar --</option>
                  {state.sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Campaña</label>
                <select 
                  value={selectedCorreriaId} 
                  onChange={e => setSelectedCorreriaId(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900"
                >
                  <option value="">-- Seleccionar --</option>
                  {state.correrias.map(c => <option key={c.id} value={c.id}>{c.name} {c.year}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800">2. Adjuntar Pedido</h3>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-2">
              Formato CSV: <span className="text-blue-500">Referencia;Cantidad</span><br/>
              La primera fila se ignora (Cabecera).
            </p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl border-2 border-dashed border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <Icons.Settle />
              CARGAR ARCHIVO
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-700">Vista Previa</h3>
              {tempItems.length > 0 && (
                <div className="flex gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Refs: {tempItems.length}</span>
                  <span className="text-[10px] font-black text-blue-500 uppercase">Total Unid: {totalUnits}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {tempItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Icons.Settle />
                  </div>
                  <p className="text-slate-300 font-bold italic">Sube un archivo para ver los detalles aquí</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <th className="px-8 py-4 font-black text-slate-400 uppercase">Referencia</th>
                      <th className="px-8 py-4 font-black text-slate-400 uppercase text-center">Cantidad</th>
                      <th className="px-8 py-4 font-black text-slate-400 uppercase text-right">Subtotal Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tempItems.map((item, idx) => {
                      const ref = state.references.find(r => r.id === item.reference);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-8 py-4">
                            <p className="font-black text-slate-800">{item.reference}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{ref?.description}</p>
                          </td>
                          <td className="px-8 py-4 text-center font-black text-blue-600">{item.quantity}</td>
                          <td className="px-8 py-4 text-right font-bold text-slate-400">${((ref?.price || 0) * item.quantity).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
              <button 
                onClick={handleSaveOrder}
                disabled={tempItems.length === 0}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black text-xl rounded-3xl shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                ASENTAR VENTA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSettleView;
