import React from 'react';
import { Trash2, X, Info, Send, Armchair, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import { HeaderTableBadge } from './HeaderTableBadge';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: () => void;
  onGoToMenu: () => void;
  tableNumber?: string;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  onGoToMenu,
  tableNumber = '7',
}) => {
  const totalPositions = cart.length;
  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' сум';
  };

  return (
    <div id="cart-view" className="flex flex-col min-h-full bg-[#fff8f6] pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[#fff8f6]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#ffe4e6]">
        <h1 className="text-xl font-bold text-[#2a170f]">Корзина</h1>
        <HeaderTableBadge tableNumber={tableNumber} />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Order Subheader */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#2a170f]">Ваш заказ</h2>
            {totalPositions > 0 && (
              <span className="text-[11px] font-semibold text-[#786565] bg-[#fff1ec] px-2.5 py-0.5 rounded-full border border-[#ffd5c6]/40">
                {totalPositions} {totalPositions === 1 ? 'позиция' : totalPositions < 5 ? 'позиции' : 'позиций'}
              </span>
            )}
          </div>
          {totalPositions > 0 && (
            <button
              id="clear-cart-button"
              onClick={onClearCart}
              className="text-xs font-semibold text-[#786565] hover:text-[#dc2626] transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#ffe9e2]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить</span>
            </button>
          )}
        </div>

        {/* Table note banner */}
        <div className="bg-[#fff1ec] rounded-2xl p-3.5 border border-[#ffd5c6]/50 flex items-start gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-[#ffe2d8] flex items-center justify-center shrink-0 text-[#2a170f]">
            <Armchair className="w-4 h-4 text-[#5c403c]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2a170f]">Стол {tableNumber}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
              <span className="text-xs font-medium text-[#006e2d]">В зале</span>
            </div>
            <p className="text-xs text-[#5c403c] mt-0.5 leading-relaxed">
              Блюда и напитки будут доставлены официантом к вашему столу.
            </p>
          </div>
        </div>

        {/* Cart Item Cards */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#ffe4e6] p-8 text-center space-y-4 my-6">
            <p className="text-sm text-[#786565]">В вашей корзине пока пусто</p>
            <button
              onClick={onGoToMenu}
              className="px-6 py-2.5 bg-[#dc2626] text-white text-xs font-bold rounded-full hover:bg-[#b91c1c] transition-colors shadow-md"
            >
              Перейти в меню
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(({ item, quantity }) => {
              const itemTotal = item.price * quantity;
              const isPlural = quantity > 1;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#ffe4e6] p-3 shadow-xs flex items-center gap-3 relative"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0 border border-[#ffd5c6]/50 shadow-inner"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="text-xs sm:text-sm font-bold text-[#2a170f] truncate">
                      {item.shortName || item.name}
                    </h3>
                    <p className="text-[11px] text-[#786565] truncate mt-0.5">
                      {isPlural
                        ? `${item.weightOrVolume} × ${quantity} порции`
                        : `${item.weightOrVolume} • ${item.portionNote || 'Свежие ингредиенты'}`}
                    </p>
                    <div className="mt-1">
                      <span className="text-sm sm:text-base font-bold text-[#2a170f]">
                        {formatPrice(itemTotal)}
                      </span>
                      {isPlural && (
                        <span className="block text-[10px] text-[#786565]">
                          {formatPrice(item.price)} / порция
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove button (top right) */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-2.5 right-2.5 p-1 text-[#c5b0ad] hover:text-[#dc2626] transition-colors rounded-full hover:bg-[#fff1ec]"
                    aria-label={`Удалить ${item.name}`}
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Stepper capsule (bottom right) */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2.5 bg-[#fff1ec] px-2.5 py-1 rounded-full border border-[#ffd5c6]/60">
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                      className="text-[#786565] hover:text-[#b70011] transition-colors p-0.5"
                      aria-label="Уменьшить количество"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-bold text-[#2a170f] min-w-[1rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                      className="text-[#dc2626] hover:text-[#b91c1c] transition-colors p-0.5"
                      aria-label="Увеличить количество"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order total & Payment notice */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#ffe4e6] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#5c403c]">
              <span>Позиций в заказе ({totalItemsCount})</span>
              <span className="font-bold text-[#2a170f]">{formatPrice(totalPrice)}</span>
            </div>

            <div className="pt-2 border-t border-[#fff1ec] flex items-end justify-between">
              <div>
                <span className="text-sm font-bold text-[#2a170f] block">Итого к оплате</span>
                <span className="text-[10px] text-[#786565]">НДС включён</span>
              </div>
              <div className="text-2xl font-black text-[#dc2626] tracking-tight">
                {formatPrice(totalPrice)}
              </div>
            </div>

            {/* Waiter notice */}
            <div className="bg-[#fff1ec] rounded-xl p-3 flex items-start gap-2.5 border border-[#ffd5c6]/40 text-xs text-[#5c403c]">
              <Info className="w-4 h-4 text-[#786565] shrink-0 mt-0.5" />
              <p className="leading-snug">
                Оплата производится официанту или на кассе при расчёте.
              </p>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        {cart.length > 0 && (
          <div className="pt-2">
            <button
              id="submit-order-button"
              onClick={onPlaceOrder}
              className="w-full py-3.5 px-6 bg-[#dc2626] text-white font-bold rounded-full shadow-lg shadow-red-900/15 hover:bg-[#b91c1c] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Оформить заказ</span>
              <Send className="w-4 h-4 fill-white rotate-45 -mt-0.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
