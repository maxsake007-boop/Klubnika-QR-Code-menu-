import React, { useState } from 'react';
import { BookOpen, Info, Receipt, ChevronUp, ChevronDown } from 'lucide-react';
import { CartItem } from '../types';
import { HeaderTableBadge } from './HeaderTableBadge';

interface OrderReceiptViewProps {
  orderItems: CartItem[];
  onReturnToMenu: () => void;
  tableNumber?: string;
}

export const OrderReceiptView: React.FC<OrderReceiptViewProps> = ({
  orderItems,
  onReturnToMenu,
  tableNumber = '7',
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  const totalPositions = orderItems.length;
  const totalPrice = orderItems.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' сум';
  };

  return (
    <div id="order-receipt-view" className="flex flex-col min-h-full bg-[#fff8f6] pb-12 pt-4">
      {/* Top right table badge */}
      <div className="px-4 py-2 flex justify-end max-w-lg mx-auto w-full">
        <HeaderTableBadge tableNumber={tableNumber} />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Main receipt card */}
        <div className="bg-white rounded-3xl border border-[#ffe4e6] p-4 sm:p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#fff1ec] pb-3">
            <h2 className="text-base font-bold text-[#2a170f]">Состав заказа</h2>
            <span className="text-xs font-semibold text-[#786565]">
              {totalPositions} {totalPositions === 1 ? 'позиция' : totalPositions < 5 ? 'позиции' : 'позиций'}
            </span>
          </div>

          {/* Items breakdown list */}
          {detailsExpanded && (
            <div className="space-y-3 pt-1">
              {orderItems.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#ffd5c6]/40"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#2a170f] truncate">
                        {item.shortName || item.name}
                      </p>
                      <p className="text-[11px] text-[#786565] mt-0.5">
                        {quantity} шт. × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#2a170f] shrink-0">
                    {formatPrice(item.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Pink highlight total banner */}
          <div className="bg-[#fff1ec] rounded-2xl p-3.5 flex items-center justify-between border border-[#ffd5c6]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ffe2d8] flex items-center justify-center text-[#dc2626]">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-[#2a170f]">Сумма к оплате</span>
            </div>
            <div className="text-xl font-extrabold text-[#dc2626]">
              {formatPrice(totalPrice)}
            </div>
          </div>
        </div>

        {/* Informational notice card */}
        <div className="bg-[#fff1ec] rounded-2xl p-4 border border-[#ffd5c6]/50 space-y-1 shadow-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#786565] shrink-0" />
            <h3 className="text-xs font-bold text-[#2a170f]">
              Оплата при завершении визита
            </h3>
          </div>
          <p className="text-xs text-[#5c403c] pl-6 leading-relaxed">
            Чек и оплата производятся официанту или на кассе при завершении визита.
          </p>
        </div>

        {/* Return to menu button */}
        <div className="pt-2">
          <button
            id="return-to-menu-button"
            onClick={onReturnToMenu}
            className="w-full py-3.5 px-6 bg-[#dc2626] text-white font-bold rounded-full shadow-lg shadow-red-900/15 hover:bg-[#b91c1c] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span>Вернуться в меню</span>
          </button>
        </div>

        {/* Toggle details link */}
        <div className="text-center pt-1">
          <button
            onClick={() => setDetailsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#786565] hover:text-[#2a170f] transition-colors"
          >
            {detailsExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Свернуть детали заказа</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>К деталям заказа</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
