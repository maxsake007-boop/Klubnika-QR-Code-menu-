import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pos_tablet_zoom');
      if (saved) {
        const parsed = Number(saved);
        if (parsed >= 0.35 && parsed <= 0.8) return parsed;
      }
    } catch {}
    return 0.5; // Default: 50% (scaled down 2x)
  });

  useEffect(() => {
    const applyZoom = () => {
      const isTabletLandscape = window.innerWidth <= 1024 && window.innerHeight <= 550;
      if (isTabletLandscape) {
        document.documentElement.style.setProperty('--tablet-zoom', String(zoomLevel));
        (document.body.style as any).zoom = String(zoomLevel);
        (document.documentElement.style as any).zoom = String(zoomLevel);
      } else {
        document.documentElement.style.removeProperty('--tablet-zoom');
        (document.body.style as any).zoom = '';
        (document.documentElement.style as any).zoom = '';
      }
    };

    applyZoom();
    window.addEventListener('resize', applyZoom);
    return () => {
      window.removeEventListener('resize', applyZoom);
    };
  }, [zoomLevel]);

  const handleZoomChange = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.round((prev + delta) * 100) / 100;
      const clamped = Math.max(0.35, Math.min(0.75, next));
      try {
        localStorage.setItem('pos_tablet_zoom', String(clamped));
      } catch {}
      return clamped;
    });
  };

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

        {/* Right: Controls & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Tablet Zoom Switcher (visible only on tablet landscape <= 1024x550) */}
          <div
            className="tab-zoom-pill hidden items-center gap-1 bg-[#fff1ec] px-2.5 py-1 rounded-full border border-[#ffe2d8] text-xs shadow-2xs"
            title="Масштаб отображения на планшете"
          >
            <span className="material-symbols-outlined text-[15px] text-[#dc2626]">fit_screen</span>
            <button
              type="button"
              onClick={() => handleZoomChange(-0.05)}
              className="w-5 h-5 rounded-full bg-white hover:bg-[#ffe2d8] text-[#dc2626] font-black flex items-center justify-center text-xs shadow-2xs cursor-pointer active:scale-90"
              title="Уменьшить масштаб"
            >
              -
            </button>
            <span className="px-1 text-[11px] font-black text-[#2a170f] min-w-[32px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoomChange(0.05)}
              className="w-5 h-5 rounded-full bg-white hover:bg-[#ffe2d8] text-[#dc2626] font-black flex items-center justify-center text-xs shadow-2xs cursor-pointer active:scale-90"
              title="Увеличить масштаб"
            >
              +
            </button>
          </div>

          {onLogout && (
            <button
              id="header-logout-btn"
              type="button"
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] text-[#dc2626] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Выйти из админ-панели"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Выйти</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

