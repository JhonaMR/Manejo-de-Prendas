
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginViewProps {
  users: User[];
  onLogin: (u: User) => void;
  onRegister: (u: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin, onRegister }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (code.length !== 3) return setError('Login debe ser de 3 letras');
      if (pin.length !== 4) return setError('PIN debe ser de 4 números');
      if (!name) return setError('Nombre es requerido');

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        loginCode: code.toUpperCase(),
        pin,
        role: UserRole.GENERAL
      };
      onRegister(newUser);
      onLogin(newUser);
    } else {
      const u = users.find(x => x.loginCode.toUpperCase() === code.toUpperCase() && x.pin === pin);
      if (u) {
        onLogin(u);
      } else {
        setError('Credenciales inválidas');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 py-8">
        <div className="bg-white p-8 sm:p-12 rounded-[40px] sm:rounded-[48px] shadow-2xl border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/50 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          <div className="text-center mb-10 relative z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-pink-500 rounded-[24px] sm:rounded-[32px] mx-auto flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-2xl shadow-blue-200 mb-6">
              IP
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tighter">Bienvenido</h1>
            <p className="text-slate-400 font-medium text-sm sm:text-base">Gestiona tu inventario con precisión</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nombre Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Jhon Montoya"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-semibold text-slate-900"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Login (3 Letras)</label>
                <input 
                  type="text" 
                  maxLength={3}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="JAM"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-black text-center text-xl uppercase text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">PIN (4 Números)</label>
                <input 
                  type="password" 
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="****"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-pink-100 transition-all font-black text-center text-xl text-slate-900"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center animate-bounce">{error}</p>}

            <button 
              type="submit"
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black rounded-[20px] sm:rounded-[24px] shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-base sm:text-lg"
            >
              {isRegister ? 'Crear Cuenta' : 'Entrar'}
            </button>
          </form>

          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="w-full mt-8 text-slate-400 font-bold text-sm hover:text-blue-500 transition-colors"
          >
            {isRegister ? '¿Ya tienes cuenta? Ingresa' : '¿Nuevo aquí? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
