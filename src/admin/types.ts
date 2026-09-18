export type OrderStatus = 'new' | 'cooking' | 'ready' | 'paid';

export interface OrderItem {
  id: string;
  name: string;
  desc: string;
  qty: number;
  price: number;
  category?: string;
}

export interface Order {
  id: string; // e.g. '2048'
  tableId: number;
  time: string; // e.g. '14:22:10'
  timeAgo: string; // e.g. '6 мин назад'
  status: OrderStatus;
  statusLabel: string;
  statusBadgeClass: string;
  source: 'qr' | 'waiter' | 'pos' | 'sbp';
  sourceLabel: string;
  waiterName?: string;
  items: OrderItem[];
  total: number;
  notes?: string;
  createdAt: number;
}

export type TableShape = 'rect-2' | 'rect-4' | 'round-6' | 'rect-6' | 'lounge-6';
export type TableZone = 'main' | 'terrace';

export interface Table {
  id: number;
  zone: TableZone;
  seats: number;
  shape: TableShape;
  currentOrderId: string | null;
  label?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'bakery' | 'coffee' | 'gelato' | 'pastry' | 'dessert' | string;
  categoryName: string;
  desc: string;
  price: number;
  isAvailable: boolean;
  isFresh?: boolean;
  calories?: number;
  allergens?: string[];
  imageUrl?: string;
  weight?: string;
}

export type ActiveTab = 'orders' | 'menu-settings';
export type ViewMode = 'floor' | 'list';
