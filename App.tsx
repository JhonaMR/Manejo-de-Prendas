
import React, { useState, useEffect } from 'react';
import { AppState, User, UserRole } from './types';
import { getAppData, saveAppData } from './store';
import { Icons } from './constants';

// Views
import LoginView from './views/LoginView';
import ReceptionView from './views/ReceptionView';
import DispatchView from './views/DispatchView';
import InventoryView from './views/InventoryView';
import MastersView from './views/MastersView';
import ReportsView from './views/ReportsView';
import OrdersView from './views/OrdersView';
import OrderSettleView from './views/OrderSettleView';
import OrderHistoryView from './views/OrderHistoryView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getAppData());
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('reception');
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    saveAppData(state);
  }, [state]);

  const handleLogout = () => {
    setUser(null);
    setIsNavOpen(false);
  };

  if (!user) {
    return (
      <LoginView 
        users={state.users} 
        onLogin={setUser} 
        onRegister={(u) => setState(prev => ({ ...prev, users: [...prev.users, u] }))} 
      />
    );
  }

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsNavOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'reception':
        return <ReceptionView user={user} receptions={state.receptions} updateState={updateState} referencesMaster={state.references} />;
      case 'dispatch':
        return <DispatchView user={user} clients={state.clients} dispatches={state.dispatches} updateState={updateState} referencesMaster={state.references} />;
      case 'inventory':
        return <InventoryView receptions={state.receptions} dispatches={state.dispatches} />;
      case 'orders':
        return <OrdersView state={state} updateState={updateState} />;
      case 'settle':
        return <OrderSettleView state={state} user={user} updateState={updateState} />;
      case 'orderHistory':
        return <OrderHistoryView state={state} />;
      case 'masters':
        return <MastersView user={user} state={state} updateState={updateState} />;
      case 'reports':
        return <ReportsView state={state} user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden text-slate-700 bg-slate-50 flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsNavOpen(true)}
            className="p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm flex items-center justify-center"
            aria-label="Abrir Menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-14 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">
              Plow
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-lg tracking-tighter leading-none">Ventas y producción</h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Control de inventarios</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="font-bold text-sm leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 capitalize font-bold mt-1">{user.role}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${user.role === UserRole.admin ? 'bg-pink-500' : 'bg-blue-500'}`}>
            {user.loginCode}
          </div>
        </div>
      </header>

      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsNavOpen(false)}
      >
        <div 
          className={`absolute top-0 left-0 h-full w-full max-w-[320px] bg-white shadow-2xl transition-transform duration-300 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-14 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                  Plow
                </div>
                <h1 className="font-black text-xl tracking-tighter">Menú</h1>
             </div>
             <button onClick={() => setIsNavOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>

          <div className="p-6 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
            <NavItem active={activeTab === 'reception'} onClick={() => handleTabChange('reception')} icon={<Icons.Reception />} label="Recepción" />
            <NavItem active={activeTab === 'dispatch'} onClick={() => handleTabChange('dispatch')} icon={<Icons.Dispatch />} label="Despachos" />
            <NavItem active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')} icon={<Icons.Inventory />} label="Inventario" />
            <div className="my-4 border-t border-slate-100 pt-4">
              <p className="px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Comercial</p>
              <NavItem active={activeTab === 'orders'} onClick={() => handleTabChange('orders')} icon={<Icons.Orders />} label="Pedidos" />
              <NavItem active={activeTab === 'settle'} onClick={() => handleTabChange('settle')} icon={<Icons.Settle />} label="Asentar Ventas" />
              <NavItem active={activeTab === 'orderHistory'} onClick={() => handleTabChange('orderHistory')} icon={<Icons.History />} label="Historial Pedidos" />
            </div>
            <div className="my-4 border-t border-slate-100 pt-4">
              <NavItem active={activeTab === 'masters'} onClick={() => handleTabChange('masters')} icon={<Icons.Masters />} label="Maestros" />
              <NavItem active={activeTab === 'reports'} onClick={() => handleTabChange('reports')} icon={<Icons.Reports />} label="Reportes" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-8 border-t border-slate-100 bg-slate-50/50">
            <button onClick={handleLogout} className="w-full py-4 flex items-center justify-center gap-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
              <Icons.Logout />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden bg-slate-50">
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-[22px] transition-all group ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:translate-x-1'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>{icon}</span>
    <span className="text-[14px]">{label}</span>
  </button>
);

export default App;
