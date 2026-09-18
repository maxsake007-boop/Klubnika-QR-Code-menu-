import React from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#ffffff]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(220,38,38,0.05)] border-b border-[#ffe9e2]">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Left: Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav
            className="flex items-center gap-1 bg-[#fff1ec] p-1 rounded-full border border-[#ffe2d8]"
            aria-label="Основная навигация"
          >
            <button
              id="tab-orders-btn"
              type="button"
              onClick={() => onTabChange('orders')}
              className={`px-4 py-1.5 transition-all text-sm font-bold rounded-full flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-[#dc2626] text-white shadow-sm'
                  : 'text-[#5c403c] hover:text-[#2a170f]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Заявки</span>
            </button>
            <button
              id="tab-menu-btn"
              type="button"
              onClick={() => onTabChange('menu-settings')}
              className={`px-4 py-1.5 transition-all text-sm font-bold rounded-full flex items-center gap-1.5 ${
                activeTab === 'menu-settings'
                  ? 'bg-[#dc2626] text-white shadow-sm'
                  : 'text-[#5c403c] hover:text-[#2a170f]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
              <span>Настройка меню</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
