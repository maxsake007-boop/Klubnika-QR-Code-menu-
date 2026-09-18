import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white py-3 border-t border-[#ffe2d8] shadow-[0_-1px_8px_rgba(220,38,38,0.03)] mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-[#5c403c]">
          <span className="font-semibold text-[#2a170f]">Терминал POS #01</span>
          <span className="text-[#e6bdb8]">•</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#006e2d] animate-pulse" />
            Синхронизация QR-заказов: онлайн
          </span>
          <span className="text-[#e6bdb8] hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[#916f6b]">Фискальный накопитель: готов к печати</span>
        </div>

        <div className="text-xs text-[#916f6b] flex items-center gap-3">
          <span>Версия POS: 3.4.2</span>
          <span>© Панель администратора и кассира</span>
        </div>
      </div>
    </footer>
  );
};
