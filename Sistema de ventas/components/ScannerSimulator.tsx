
import React, { useState } from 'react';
import { SIZES, Icons } from '../constants';

interface ScannerSimulatorProps {
  onScan: (reference: string, size: string, quantity: number) => void;
  label?: string;
}

const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onScan, label = "Escanear Referencia" }) => {
  const [ref, setRef] = useState('');
  const [size, setSize] = useState(SIZES[2]); // Default M
  const [qty, setQty] = useState(1);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleTrigger = () => {
    if (ref.trim() && qty > 0) {
      onScan(ref.trim().toUpperCase(), size, qty);
      setRef('');
      setQty(1);
    }
  };

  const adjustQty = (amount: number) => {
    setQty(prev => Math.max(1, prev + amount));
  };

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      alert("Cámara activada. En un dispositivo real, aquí se abriría el visor del código de barras.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-xl p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-blue-100 shadow-xl shadow-blue-50/50 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-end">
          
          {/* Reference Input */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-4">{label}</label>
            <div className="relative">
              <input 
                type="text" 
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="REF-001..."
                className="w-full pl-12 pr-6 py-3.5 sm:py-4 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl focus:ring-4 focus:ring-blue-100 transition-all font-bold uppercase text-slate-900 text-sm sm:text-base"
                onKeyDown={(e) => e.key === 'Enter' && handleTrigger()}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Icons.Inventory />
              </div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest px-4">Talla</label>
            <select 
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-6 py-3.5 sm:py-4 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl focus:ring-4 focus:ring-pink-100 transition-all font-black appearance-none text-slate-900 text-sm sm:text-base"
            >
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Manual Quantity with +/- buttons */}
          <div className="lg:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center block">Cant. Manual</label>
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl sm:rounded-[24px] border border-slate-200 w-full max-w-[200px] mx-auto lg:mx-0">
              <button 
                type="button"
                onClick={() => adjustQty(-1)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-slate-500 hover:text-pink-500 hover:shadow-sm transition-all font-bold text-xl active:scale-90"
              >
                -
              </button>
              <input 
                type="number" 
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full min-w-0 bg-transparent border-none text-center font-black text-lg sm:text-xl focus:ring-0 px-2 text-slate-800"
              />
              <button 
                type="button"
                onClick={() => adjustQty(1)}
                className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-xl text-slate-500 hover:text-blue-500 hover:shadow-sm transition-all font-bold text-xl active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-3 flex gap-2">
            <button 
              onClick={toggleCamera}
              className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center rounded-2xl sm:rounded-3xl border-2 transition-all ${isCameraActive ? 'border-pink-500 text-pink-500 bg-pink-50' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
              title="Abrir Cámara"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </button>
            <button 
              onClick={handleTrigger}
              disabled={!ref.trim()}
              className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-pink-600 text-white font-black rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              AGREGAR
            </button>
          </div>
        </div>

        {isCameraActive && (
          <div className="h-40 sm:h-48 bg-slate-900 rounded-[24px] sm:rounded-3xl flex items-center justify-center text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-pulse border-4 border-blue-500/20">
            [ Simulación de Visor de Cámara Activo ]
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerSimulator;
