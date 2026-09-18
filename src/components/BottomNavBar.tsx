import React from 'react';
import { Utensils, ShoppingBag } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'menu' | 'orders' | 'cart';
  onSelectTab: (tab: 'menu' | 'orders') => void;
  cartCount: number;
  hasActiveOrder?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  hasActiveOrder = false,
}) => {
  const isOrdersActive = activeTab === 'orders' || activeTab === 'cart';

  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#fff8f6]/95 backdrop-blur-md border-t border-[#ffe4e6] py-2.5 px-8 flex justify-around items-center max-w-lg md:max-w-xl mx-auto shadow-sm"
    >
      {/* Menu Tab */}
      <button
        id="nav-menu-button"
        onClick={() => onSelectTab('menu')}
        className={`flex flex-col items-center justify-center gap-1 transition-colors px-4 py-1 rounded-xl ${
          activeTab === 'menu' ? 'text-[#dc2626]' : 'text-[#786565] hover:text-[#2a170f]'
        }`}
      >
        <Utensils className="w-5 h-5 stroke-[2.2]" />
        <span className="text-xs font-semibold tracking-wide">Меню</span>
      </button>

      {/* Orders Tab */}
      <button
        id="nav-order-button"
        onClick={() => onSelectTab('orders')}
        className={`relative flex flex-col items-center justify-center gap-1 transition-colors px-4 py-1 rounded-xl ${
          isOrdersActive ? 'text-[#dc2626]' : 'text-[#786565] hover:text-[#2a170f]'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          {cartCount > 0 ? (
            <span
              id="cart-badge"
              className="absolute -top-1.5 -right-2 bg-[#dc2626] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
            >
              {cartCount}
            </span>
          ) : hasActiveOrder ? (
            <span
              id="active-order-indicator"
              className="absolute -top-1 -right-1 bg-[#16a34a] w-2.5 h-2.5 rounded-full ring-2 ring-white animate-pulse"
              title="Заказ готовится"
            />
          ) : null}
        </div>
        <span className="text-xs font-semibold tracking-wide">Заказы</span>
      </button>
    </nav>
  );
};
