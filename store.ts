
import { AppState, UserRole } from './types';

const STORAGE_KEY = 'inventory_pro_data_v2';

const INITIAL_DATA: AppState = {
  users: [
    { id: '1', name: 'Admin Principal', loginCode: 'ADM', pin: '0000', role: UserRole.admin },
    { id: '2', name: 'Jhon Montoya', loginCode: 'JAM', pin: '1234', role: UserRole.GENERAL }
  ],
  sellers: [
    { id: 's1', name: 'Lina Pulgarin' },
    { id: 's1', name: 'John Bolivar' },
    { id: 's2', name: 'Raul gonzalez' }
  ],
  correrias: [
    { id: 'c1', name: 'Madres', year: '2025' },
    { id: 'c2', name: 'Madres', year: '2026' }
  ],
  references: [
    { id: '10210', description: 'blusa dama', price: 19900, designer: 'Martha Ramirez', cloth1: 'Lino Milan', avgCloth1: 0.85, cloth2: 'Encaje', avgCloth2: 0.15 },
    { id: '12877', description: 'blusa dama', price: 21900, designer: 'Jackeline Perea', cloth1: 'Burda', avgCloth1: 0.90 },
    { id: '12871', description: 'buso dama', price: 25900, designer: 'Isabel Montoya', cloth1: 'Lycra algodon', avgCloth1: 1.2 }
  ],
  clients: [
    { id: '211', name: 'Media naranja', address: 'cll 77 a 45 a 30', city: 'Medellín', seller: 'John Bolivar' },
    { id: '212', name: 'La pantaleta', address: 'cll 83 # 57 a 14', city: 'Montería', seller: 'Lina Pulgarin' }
  ],
  receptions: [],
  dispatches: [],
  orders: [
    {
      id: 'o1',
      clientId: '211',
      sellerId: 's1',
      correriaId: 'c1',
      items: [{ reference: '10210', size: 'M', quantity: 50 }],
      totalValue: 995000,
      createdAt: '01/03/2025, 10:00:00 AM',
      settledBy: 'Admin Principal'
    }
  ],
  production: [
    { refId: '10210', correriaId: 'c1', programmed: 100, cut: 40 }
  ]
};

export const getAppData = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return INITIAL_DATA;
  const parsed = JSON.parse(data);
  // Migration for old data
  return {
    ...INITIAL_DATA,
    ...parsed,
    sellers: parsed.sellers || INITIAL_DATA.sellers,
    correrias: parsed.correrias || INITIAL_DATA.correrias,
    orders: parsed.orders || INITIAL_DATA.orders,
    production: parsed.production || INITIAL_DATA.production
  };
};

export const saveAppData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
