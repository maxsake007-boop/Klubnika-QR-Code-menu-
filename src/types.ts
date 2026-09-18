export interface MenuItem {
  id: string;
  name: string;
  shortName?: string;
  category: 'Десерты' | 'Кофе' | 'Завтраки' | 'Напитки';
  weightOrVolume: string;
  subtitle: string;
  description: string;
  price: number;
  imageUrl: string;
  isHit?: boolean;
  hitBadgeText?: string;
  overtitle?: string;
  tags?: string[];
  attributes?: Array<{
    icon: string;
    label: string;
  }>;
  portionNote?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type ScreenType = 'menu' | 'product-detail' | 'orders' | 'cart' | 'order-receipt';
