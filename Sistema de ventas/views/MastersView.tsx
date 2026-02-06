
import React, { useState, useRef } from 'react';
import { User, UserRole, Client, AppState, Reference, Seller, Correria } from '../types';
import { Icons } from '../constants';

interface MastersViewProps {
  user: User;
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const MastersView: React.FC<MastersViewProps> = ({ user, state, updateState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'users' | 'references' | 'sellers' | 'correrias'>('clients');
  const clientFileRef = useRef<HTMLInputElement>(null);
  const referenceFileRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === UserRole.admin;

  // Forms Shared state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [seller, setSeller] = useState('');
  
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(0);
  const [designer, setDesigner] = useState('');
  const [cloth1, setCloth1] = useState('');
  const [avgCloth1, setAvgCloth1] = useState(0);
  const [cloth2, setCloth2] = useState('');
  const [avgCloth2, setAvgCloth2] = useState(0);

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [pin, setPin] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GENERAL);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForms = () => {
    setId(''); setName(''); setAddress(''); setCity(''); setSeller('');
    setDesc(''); setPrice(0); setDesigner('');
    setCloth1(''); setAvgCloth1(0); setCloth2(''); setAvgCloth2(0);
    setYear(new Date().getFullYear().toString());
    setPin('');
    setUserRole(UserRole.GENERAL);
    setEditingId(null);
  };

  const handleImportCSV = (type: 'clients' | 'references', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rows = content.split('\n').filter(row => row.trim() !== '');
      
      updateState(prev => {
        const newState = { ...prev };
        if (type === 'clients') {
          const newClients: Client[] = [...prev.clients];
          for (let i = 1; i < rows.length; i++) {
            const [cId, cName, cAddr, cCity, cSell] = rows[i].split(/[;,]/).map(c => c.trim());
            if (cId && cName) {
              const idx = newClients.findIndex(c => c.id === cId);
              const clientData = { id: cId, name: cName, address: cAddr||'', city: cCity||'', seller: cSell||'' };
              if (idx > -1) newClients[idx] = clientData;
              else newClients.push(clientData);
            }
          }
          newState.clients = newClients;
        } else {
          const newRefs: Reference[] = [...prev.references];
          for (let i = 1; i < rows.length; i++) {
            const [rId, rDesc, rPrice, rDes, t1, p1, t2, p2] = rows[i].split(/[;,]/).map(c => c.trim());
            if (rId && rDesc) {
              const idx = newRefs.findIndex(r => r.id === rId);
              const refData = { 
                id: rId, description: rDesc, price: Number(rPrice)||0, 
                designer: rDes||'', cloth1: t1||'', avgCloth1: Number(p1)||0, 
                cloth2: t2||'', avgCloth2: Number(p2)||0 
              };
              if (idx > -1) newRefs[idx] = refData;
              else newRefs.push(refData);
            }
          }
          newState.references = newRefs;
        }
        return newState;
      });
      alert(`Importación finalizada.`);
    };
    reader.readAsText(file);
    if(e.target) e.target.value = '';
  };

  const handleSaveClient = () => {
    if (!id || !name) return alert("ID y Nombre son obligatorios");
    const newItem: Client = { id, name, address, city, seller };
    updateState(prev => {
      const exists = prev.clients.some(c => c.id === id);
      if (exists && !editingId) { alert("ID ya existe"); return prev; }
      return { ...prev, clients: editingId ? prev.clients.map(c => c.id === editingId ? newItem : c) : [...prev.clients, newItem] };
    });
    resetForms();
  };

  const handleSaveReference = () => {
    if (!id || !desc) return alert("Referencia y Descripción son obligatorias");
    const newItem: Reference = { id, description: desc, price, designer, cloth1, avgCloth1, cloth2, avgCloth2 };
    updateState(prev => {
      const exists = prev.references.some(r => r.id === id);
      if (exists && !editingId) { alert("Referencia ya existe"); return prev; }
      return { ...prev, references: editingId ? prev.references.map(r => r.id === editingId ? newItem : r) : [...prev.references, newItem] };
    });
    resetForms();
  };

  const handleSaveSeller = () => {
    if (!isAdmin) return;
    if (!name) return alert("Nombre obligatorio");
    const newItem: Seller = { id: editingId || Math.random().toString(36).substr(2, 9), name };
    updateState(prev => ({
      ...prev,
      sellers: editingId ? prev.sellers.map(s => s.id === editingId ? newItem : s) : [...prev.sellers, newItem]
    }));
    resetForms();
  };

  const handleSaveCorreria = () => {
    if (!name || !year) return alert("Nombre y Año obligatorios");
    const newItem: Correria = { id: editingId || Math.random().toString(36).substr(2, 9), name, year };
    updateState(prev => ({
      ...prev,
      correrias: editingId ? prev.correrias.map(c => c.id === editingId ? newItem : c) : [...prev.correrias, newItem]
    }));
    resetForms();
  };

  const handleSaveUser = () => {
    if (!isAdmin) return;
    if (!name || !id || pin.length !== 4) return alert("Nombre, Login (3 car) y PIN (4 num) son obligatorios");
    const newItem: User = { 
      id: editingId || Math.random().toString(36).substr(2, 9), 
      name, 
      loginCode: id.toUpperCase(), 
      pin, 
      role: userRole 
    };
    updateState(prev => ({
      ...prev,
      users: editingId ? prev.users.map(u => u.id === editingId ? newItem : u) : [...prev.users, newItem]
    }));
    resetForms();
  };

  const handleDelete = (type: string, targetId: string) => {
    if (!isAdmin && (type === 'user' || type === 'seller')) return;
    if (!confirm("¿Seguro que desea eliminar este registro?")) return;
    updateState(prev => {
      const newState = { ...prev };
      if (type === 'client') newState.clients = prev.clients.filter(x => x.id !== targetId);
      if (type === 'reference') newState.references = prev.references.filter(x => x.id !== targetId);
      if (type === 'seller') newState.sellers = prev.sellers.filter(x => x.id !== targetId);
      if (type === 'correria') newState.correrias = prev.correrias.filter(x => x.id !== targetId);
      if (type === 'user') {
        if (targetId === user.id) { alert("No puedes eliminar tu propio usuario"); return prev; }
        newState.users = prev.users.filter(x => x.id !== targetId);
      }
      return newState;
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Maestros</h2>
          <p className="text-slate-400 font-medium">Configuración de base de datos</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-3xl shadow-sm border border-slate-100 w-fit">
        <TabBtn active={activeSubTab === 'clients'} onClick={() => {setActiveSubTab('clients'); resetForms();}} label="Clientes" />
        <TabBtn active={activeSubTab === 'references'} onClick={() => {setActiveSubTab('references'); resetForms();}} label="Referencias" />
        <TabBtn active={activeSubTab === 'sellers'} onClick={() => {setActiveSubTab('sellers'); resetForms();}} label="Vendedores" />
        <TabBtn active={activeSubTab === 'correrias'} onClick={() => {setActiveSubTab('correrias'); resetForms();}} label="Correrías" />
        <TabBtn active={activeSubTab === 'users'} onClick={() => {setActiveSubTab('users'); resetForms();}} label="Usuarios" />
      </div>

      {activeSubTab === 'clients' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="ID Cliente" value={id} onChange={setId} disabled={!!editingId} />
                  <Input label="Nombre del Cliente" value={name} onChange={setName} />
                  <Input label="Dirección" value={address} onChange={setAddress} />
                  <Input label="Ciudad" value={city} onChange={setCity} />
                  <Input label="Vendedor" value={seller} onChange={setSeller} className="md:col-span-2" />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveClient} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">GUARDAR CLIENTE</button>
                  {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xl font-black text-slate-800">Importar Clientes</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed">CSV: <span className="text-blue-500">ID;Nombre;Dirección;Ciudad;Vendedor</span></p>
                <input type="file" ref={clientFileRef} onChange={(e) => handleImportCSV('clients', e)} accept=".csv" className="hidden" />
                <button onClick={() => clientFileRef.current?.click()} className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl border-2 border-dashed border-slate-200 hover:bg-blue-50 transition-colors">SUBIR CSV</button>
              </div>
            </div>
          </div>
          <TableWrapper title="Listado de Clientes">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50/50"><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">ID</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Cliente</th><th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Vendedor</th><th className="px-8 py-4 text-right">Acción</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {state.clients.sort((a,b)=>a.id.localeCompare(b.id)).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-bold text-blue-500">{c.id}</td>
                    <td className="px-8 py-4 font-black text-slate-800">{c.name}</td>
                    <td className="px-8 py-4 font-bold text-pink-500 uppercase text-[10px]">{c.seller}</td>
                    <td className="px-8 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => { setEditingId(c.id); setId(c.id); setName(c.name); setAddress(c.address); setCity(c.city); setSeller(c.seller); }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Icons.Edit /></button>
                      <button onClick={() => handleDelete('client', c.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Icons.Delete /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'references' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FormWrapper title={editingId ? 'Editar Referencia' : 'Nueva Referencia'}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Input label="Referencia" value={id} onChange={setId} disabled={!!editingId} />
                  <Input label="Descripción" value={desc} onChange={setDesc} className="md:col-span-3" />
                  <Input label="Precio Venta" type="number" value={price} onChange={v => setPrice(Number(v))} />
                  <Input label="Diseñadora" value={designer} onChange={setDesigner} />
                  <Input label="Tela 1" value={cloth1} onChange={setCloth1} />
                  <Input label="Prom. Tela 1" type="number" value={avgCloth1} onChange={v => setAvgCloth1(Number(v))} />
                  <Input label="Tela 2" value={cloth2} onChange={setCloth2} />
                  <Input label="Prom. Tela 2" type="number" value={avgCloth2} onChange={v => setAvgCloth2(Number(v))} />
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveReference} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">GUARDAR REFERENCIA</button>
                  {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                </div>
              </FormWrapper>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xl font-black text-slate-800">Importar Referencias</h3>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed">CSV: <span className="text-indigo-500">Ref;Desc;Precio;Diseñadora;Tela1;Prom1;Tela2;Prom2</span></p>
                <input type="file" ref={referenceFileRef} onChange={(e) => handleImportCSV('references', e)} accept=".csv" className="hidden" />
                <button onClick={() => referenceFileRef.current?.click()} className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl border-2 border-dashed border-slate-200 hover:bg-indigo-50 transition-colors">SUBIR CSV</button>
              </div>
            </div>
          </div>
          <TableWrapper title="Listado de Referencias">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead><tr className="bg-slate-50/50"><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Ref</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Descripción</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Precio</th><th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Telas / Prom</th><th className="px-6 py-4 text-right">Acción</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {state.references.sort((a,b)=>a.id.localeCompare(b.id)).map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-indigo-600">{r.id}</td>
                      <td className="px-6 py-4 font-black text-slate-900">{r.description}</td>
                      <td className="px-6 py-4 font-bold text-slate-400">${r.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[10px] space-y-1">
                        <div className="flex gap-2">
                          <span className="font-black text-slate-700">{r.cloth1}:</span> <span>{r.avgCloth1}</span>
                        </div>
                        {r.cloth2 && (
                          <div className="flex gap-2">
                            <span className="font-black text-slate-700">{r.cloth2}:</span> <span>{r.avgCloth2}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { 
                          setEditingId(r.id); setId(r.id); setDesc(r.description); setPrice(r.price); 
                          setDesigner(r.designer); setCloth1(r.cloth1||''); setAvgCloth1(r.avgCloth1||0);
                          setCloth2(r.cloth2||''); setAvgCloth2(r.avgCloth2||0);
                        }} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Icons.Edit /></button>
                        <button onClick={() => handleDelete('reference', r.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Icons.Delete /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableWrapper>
        </div>
      )}

      {activeSubTab === 'sellers' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           {isAdmin ? (
             <FormWrapper title={editingId ? 'Editar Vendedor' : 'Nuevo Vendedor'}>
                <div className="max-w-md space-y-4">
                   <Input label="Nombre del Vendedor" value={name} onChange={setName} />
                   <div className="flex gap-4">
                      <button onClick={handleSaveSeller} className="px-10 py-4 bg-pink-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">GUARDAR</button>
                      {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
                   </div>
                </div>
             </FormWrapper>
           ) : (
             <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-amber-700 font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Se requiere acceso de administrador para crear o editar vendedores.
             </div>
           )}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.sellers.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                   <p className="font-black text-slate-800">{s.name}</p>
                   {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(s.id); setName(s.name); }} className="p-2 text-pink-400 hover:bg-pink-50 rounded-lg transition-colors"><Icons.Edit /></button>
                      <button onClick={() => handleDelete('seller', s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Icons.Delete /></button>
                    </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'correrias' && (
        <div className="space-y-6 animate-in fade-in duration-300">
           <FormWrapper title={editingId ? 'Editar Correría' : 'Nueva Correría'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                 <Input label="Nombre de Campaña" value={name} onChange={setName} />
                 <Input label="Año" value={year} onChange={setYear} type="number" />
              </div>
              <div className="flex gap-4 mt-6">
                 <button onClick={handleSaveCorreria} className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">GUARDAR</button>
                 {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
              </div>
           </FormWrapper>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {state.correrias.sort((a,b)=>b.year.localeCompare(a.year)).map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                   <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.year}</p>
                      <p className="font-black text-slate-800">{c.name}</p>
                   </div>
                   <div className="flex gap-2">
                    <button onClick={() => { setEditingId(c.id); setName(c.name); setYear(c.year); }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"><Icons.Edit /></button>
                    <button onClick={() => handleDelete('correria', c.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Icons.Delete /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {isAdmin ? (
            <FormWrapper title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Input label="Nombre del Usuario" value={name} onChange={setName} />
                <Input label="Código (3 Letras)" value={id} onChange={setId} maxLength={3} disabled={!!editingId} />
                <Input label="PIN (4 Números)" value={pin} onChange={setPin} maxLength={4} type="password" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Rol del Usuario</label>
                  <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value={UserRole.GENERAL}>Vendedor / Operario</option>
                    <option value={UserRole.admin}>Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                 <button onClick={handleSaveUser} className="px-10 py-4 bg-pink-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform">GUARDAR USUARIO</button>
                 {editingId && <button onClick={resetForms} className="px-6 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl">CANCELAR</button>}
              </div>
            </FormWrapper>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 text-amber-700 font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
               </svg>
               Se requiere acceso de administrador para crear o editar usuarios.
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {state.users.map(u => (
               <div key={u.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  {u.role === UserRole.admin && (
                    <div className="absolute top-0 right-0 p-2">
                      <span className="text-[8px] font-black bg-pink-500 text-white px-3 py-1 rounded-bl-2xl uppercase tracking-widest">Admin</span>
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-inner ${u.role === UserRole.admin ? 'bg-gradient-to-br from-pink-500 to-pink-400' : 'bg-gradient-to-br from-blue-500 to-blue-400'}`}>
                    {u.loginCode}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-none mb-1">{u.name}</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PIN: ****</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 w-full pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => { 
                          setEditingId(u.id); 
                          setName(u.name); 
                          setId(u.loginCode); 
                          setPin(u.pin); 
                          setUserRole(u.role); 
                        }} 
                        className="flex-1 py-2 bg-blue-50 text-blue-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-colors"
                      >
                        Editar
                      </button>
                      {u.id !== user.id && (
                        <button 
                          onClick={() => handleDelete('user', u.id)} 
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Icons.Delete />
                        </button>
                      )}
                    </div>
                  )}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${active ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>{label}</button>
);

const FormWrapper = ({ children, title }: any) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
    <h3 className="text-xl font-black text-slate-800">{title}</h3>
    {children}
  </div>
);

const TableWrapper = ({ children, title }: any) => (
  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
    <div className="p-6 bg-slate-50 border-b border-slate-100 font-black text-slate-700">{title}</div>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text", className = "", disabled = false, maxLength }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      maxLength={maxLength}
      className="w-full px-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50" 
    />
  </div>
);

export default MastersView;
