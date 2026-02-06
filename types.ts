
export enum UserRole {
  GENERAL = 'general',
  admin = 'admin'
}

export interface User {
  id: string;
  name: string;
  loginCode: string; // 3 characters
  pin: string; // 4 digits
  role: UserRole;
}

export interface Seller {
  id: string;
  name: string;
}

export interface Correria {
  id: string;
  name: string;
  year: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  city: string;
  seller: string;
}

export interface Reference {
  id: string; 
  description: string;
  price: number;
  designer: string;
  cloth1?: string;
  avgCloth1?: number;
  cloth2?: string;
  avgCloth2?: number;
}

export interface ProductionTracking {
  refId: string;
  correriaId: string;
  programmed: number;
  cut: number;
}

export type ChargeType = 'Compra' | 'Cobro' | null;

export interface ItemEntry {
  reference: string;
  size: string;
  quantity: number;
}

export interface AuditLog {
  user: string;
  date: string;
}

export interface BatchReception {
  id: string;
  batchCode: string;
  confeccionista: string;
  hasSeconds: boolean | null;
  chargeType: ChargeType;
  chargeUnits: number;
  items: ItemEntry[];
  receivedBy: string;
  createdAt: string;
  editLogs: AuditLog[];
}

export interface Dispatch {
  id: string;
  clientId: string;
  invoiceNo: string;
  remissionNo: string;
  items: ItemEntry[];
  dispatchedBy: string;
  createdAt: string;
  editLogs: AuditLog[];
}

export interface Order {
  id: string;
  clientId: string;
  sellerId: string;
  correriaId: string;
  items: ItemEntry[];
  totalValue: number;
  createdAt: string;
  settledBy: string;
}

export interface AppState {
  users: User[];
  clients: Client[];
  references: Reference[];
  receptions: BatchReception[];
  dispatches: Dispatch[];
  sellers: Seller[];
  correrias: Correria[];
  orders: Order[];
  production: ProductionTracking[];
}
