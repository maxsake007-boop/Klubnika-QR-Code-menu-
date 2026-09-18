import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Clock,
  CheckCircle2,
  Info,
  Receipt,
  Utensils,
  ArrowRight,
  Send,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { CartItem } from '../types';
import { HeaderTableBadge } from './HeaderTableBadge';

interface OrdersViewProps {
  cart: CartItem[]; // New items waiting to be added / submitted
  placedOrder: CartItem[]; // Active confirmed order
  orderNumber?: number;
  orderTime?: string;
  onUpdateCartQuantity: (itemId: string, newQty: number) => void;
  onRemoveCartItem: (itemId: string) => void;
  onClearCart: () => void;
  onPlaceInitialOrder: () => void;
  onAppendToOrder: () => void;
  onGoToMenu: () => void;
  onResetOrderForDemo?: () => void;
  tableNumber?: string;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  cart,
  placedOrder,
  orderNumber = 14,
  orderTime = '17:50',
  onUpdateCartQuantity,
  onRemoveCartItem,
  onClearCart,
  onPlaceInitialOrder,
  onAppendToOrder,
  onGoToMenu,
  onResetOrderForDemo,
  tableNumber = '7',
}) => {
  const [justAddedToast, setJustAddedToast] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' сум';
  };

  const hasPlacedOrder = placedOrder.length > 0;
  const hasPendingItems = cart.length > 0;

  const placedTotal = placedOrder.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0
  );
  const pendingTotal = cart.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0
  );
  const totalBill = placedTotal + pendingTotal;

  const handleAppendConfirm = () => {
    onAppendToOrder();
    setJustAddedToast('Блюда успешно добавлены в заказ!');
    setTimeout(() => setJustAddedToast(null), 3000);
  };

  const handleInitialOrderConfirm = () => {
    onPlaceInitialOrder();
    setJustAddedToast('Заказ принят и отправлен на кухню!');
    setTimeout(() => setJustAddedToast(null), 3000);
  };

  return (
    <div id="orders-view" className="flex flex-col min-h-full bg-[#fff8f6] pb-28">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 bg-[#fff8f6]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#ffe4e6]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#2a170f]">
            {hasPlacedOrder ? 'Ваш заказ' : 'Корзина заказа'}
          </h1>
          {hasPlacedOrder && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#16a34a] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
              Готовится
            </span>
          )}
        </div>
        <HeaderTableBadge tableNumber={tableNumber} />
      </div>

      {/* Floating Toast Notification */}
      {justAddedToast && (
        <div className="fixed top-14 left-4 right-4 z-40 max-w-md mx-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#2a170f] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 border border-[#412b22]">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>{justAddedToast}</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* ============================================================ */}
        {/* CASE 1: Active placed order exists                           */}
        {/* ============================================================ */}
        {hasPlacedOrder && (
          <>
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-[#ffe4e6] p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#fff1ec] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#16a34a]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#2a170f] flex items-center gap-1.5">
                      <span>Заказ № {orderNumber}</span>
                      <span className="text-[#a89995] font-normal">•</span>
                      <span className="text-[#786565] font-medium">{orderTime}</span>
                    </div>
                    <p className="text-[11px] text-[#16a34a] font-semibold flex items-center gap-1 mt-0.5">
                      <span>Передан на кухню</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#786565] block">
                    Стол {tableNumber}
                  </span>
                  <span className="text-xs font-bold text-[#dc2626]">В зале</span>
                </div>
              </div>

              {/* Prominent Action Button: "+ Добавить в заказ" */}
              <div className="pt-3">
                <button
                  id="btn-add-more-to-order-top"
                  onClick={onGoToMenu}
                  className="w-full py-2.5 px-4 bg-[#fff1ec] hover:bg-[#ffe2d8] active:scale-[0.99] text-[#dc2626] font-bold rounded-xl border border-[#ffd5c6] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-2xs"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Добавить в заказ</span>
                </button>
              </div>
            </div>

            {/* If the guest chose new items from menu (pending additions) */}
            {hasPendingItems && (
              <div className="bg-[#fff1ec] rounded-2xl border-2 border-[#dc2626]/30 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#dc2626]" />
                    <h3 className="text-xs font-bold text-[#2a170f] uppercase tracking-wide">
                      Новые блюда для добавления
                    </h3>
                  </div>
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-[#786565] hover:text-[#dc2626] transition-colors"
                  >
                    Отменить
                  </button>
                </div>

                {/* Items to add list */}
                <div className="space-y-2">
                  {cart.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-2.5 border border-[#ffd5c6]/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#ffd5c6]/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2a170f] truncate">
                            {item.shortName || item.name}
                          </p>
                          <p className="text-[10px] text-[#dc2626] font-semibold">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-[#fff8f6] rounded-lg px-2 py-1 border border-[#ffd5c6]">
                        <button
                          onClick={() => onUpdateCartQuantity(item.id, quantity - 1)}
                          className="text-[#786565] hover:text-[#dc2626] p-0.5"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="text-xs font-bold text-[#2a170f] min-w-[1rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateCartQuantity(item.id, quantity + 1)}
                          className="text-[#dc2626] p-0.5"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Button: Confirm addition to order */}
                <button
                  id="btn-confirm-append-to-order"
                  onClick={handleAppendConfirm}
                  className="w-full py-3 px-4 bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Send className="w-3.5 h-3.5 fill-white rotate-45 -mt-0.5" />
                  <span>Добавить в заказ (+ {formatPrice(pendingTotal)})</span>
                </button>
              </div>
            )}

            {/* Placed Items List Card */}
            <div className="bg-white rounded-2xl border border-[#ffe4e6] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#fff1ec] pb-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#786565]">
                  Состав текущего заказа
                </h2>
                <span className="text-xs font-bold text-[#2a170f]">
                  {placedOrder.length}{' '}
                  {placedOrder.length === 1 ? 'позиция' : placedOrder.length < 5 ? 'позиции' : 'позиций'}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {placedOrder.map(({ item, quantity }) => (
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

              {/* Total & Summary Banner */}
              <div className="bg-[#fff1ec] rounded-xl p-3.5 flex items-center justify-between border border-[#ffd5c6]/60 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffe2d8] flex items-center justify-center text-[#dc2626]">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2a170f] block">Сумма к оплате</span>
                    <span className="text-[10px] text-[#786565]">НДС включён</span>
                  </div>
                </div>
                <div className="text-lg sm:text-xl font-black text-[#dc2626]">
                  {formatPrice(placedTotal)}
                </div>
              </div>
            </div>

            {/* Waiter notice */}
            <div className="bg-[#fff1ec] rounded-xl p-3.5 flex items-start gap-2.5 border border-[#ffd5c6]/40 text-xs text-[#5c403c]">
              <Info className="w-4 h-4 text-[#786565] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Блюда и напитки доставляются официантом к вашему столу. Оплата производится официанту или на кассе при завершении визита.
              </p>
            </div>

            {/* Bottom prominent CTA: "+ Добавить в заказ" */}
            <div className="pt-2">
              <button
                id="btn-add-more-to-order-bottom"
                onClick={onGoToMenu}
                className="w-full py-3.5 px-6 bg-[#dc2626] text-white font-bold rounded-full shadow-lg shadow-red-900/15 hover:bg-[#b91c1c] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Добавить в заказ</span>
              </button>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* CASE 2: No placed order yet, but cart has items              */}
        {/* ============================================================ */}
        {!hasPlacedOrder && hasPendingItems && (
          <>
            {/* Header / Table notice */}
            <div className="bg-[#fff1ec] rounded-2xl p-3.5 border border-[#ffd5c6]/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ffe2d8] flex items-center justify-center text-[#dc2626] shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="text-xs text-[#5c403c] leading-relaxed">
                <span className="font-bold text-[#2a170f] block mb-0.5">
                  Стол {tableNumber} • В зале
                </span>
                Блюда и напитки будут приготовлены и доставлены официантом к вашему столу.
              </div>
            </div>

            {/* Subheader */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#2a170f]">Позиции к заказу</h2>
                <span className="text-[11px] font-semibold text-[#786565] bg-[#fff1ec] px-2.5 py-0.5 rounded-full border border-[#ffd5c6]/40">
                  {cart.length} {cart.length === 1 ? 'позиция' : cart.length < 5 ? 'позиции' : 'позиций'}
                </span>
              </div>
              <button
                id="clear-cart-button"
                onClick={onClearCart}
                className="text-xs font-semibold text-[#786565] hover:text-[#dc2626] transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#ffe9e2]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить</span>
              </button>
            </div>

            {/* Items list */}
            <div className="space-y-3">
              {cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#ffe4e6] p-3 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#ffd5c6]/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#2a170f] truncate">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#786565]">{item.weightOrVolume}</p>
                      <p className="text-xs font-extrabold text-[#dc2626] mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Stepper & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-[#fff8f6] rounded-xl px-2.5 py-1 border border-[#ffd5c6]">
                      <button
                        onClick={() => onUpdateCartQuantity(item.id, quantity - 1)}
                        className="text-[#786565] hover:text-[#dc2626] transition-colors p-0.5"
                        aria-label="Уменьшить количество"
                      >
                        {quantity === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-[#dc2626]" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                      <span className="text-xs font-bold text-[#2a170f] min-w-[1rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateCartQuantity(item.id, quantity + 1)}
                        className="text-[#dc2626] hover:text-[#b91c1c] transition-colors p-0.5"
                        aria-label="Увеличить количество"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick "+ Добавить ещё блюда" button */}
            <button
              onClick={onGoToMenu}
              className="w-full py-2.5 px-4 bg-[#fff1ec] hover:bg-[#ffe2d8] text-[#dc2626] border border-dashed border-[#ffd5c6] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить ещё блюда из меню</span>
            </button>

            {/* Order Total */}
            <div className="bg-white rounded-2xl border border-[#ffe4e6] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm text-[#5c403c]">
                <span>Позиций в заказе</span>
                <span className="font-bold text-[#2a170f]">{formatPrice(pendingTotal)}</span>
              </div>

              <div className="pt-2 border-t border-[#fff1ec] flex items-end justify-between">
                <div>
                  <span className="text-sm font-bold text-[#2a170f] block">Итого к оплате</span>
                  <span className="text-[10px] text-[#786565]">НДС включён</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#dc2626] tracking-tight">
                  {formatPrice(pendingTotal)}
                </div>
              </div>

              <div className="bg-[#fff1ec] rounded-xl p-3 flex items-start gap-2.5 border border-[#ffd5c6]/40 text-xs text-[#5c403c]">
                <Info className="w-4 h-4 text-[#786565] shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Оплата производится официанту или на кассе при расчёте.
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
              <button
                id="submit-order-button"
                onClick={handleInitialOrderConfirm}
                className="w-full py-3.5 px-6 bg-[#dc2626] text-white font-bold rounded-full shadow-lg shadow-red-900/15 hover:bg-[#b91c1c] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Оформить заказ</span>
                <Send className="w-4 h-4 fill-white rotate-45 -mt-0.5" />
              </button>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* CASE 3: Completely empty state                               */}
        {/* ============================================================ */}
        {!hasPlacedOrder && !hasPendingItems && (
          <div className="py-16 text-center space-y-4">
            <div className="w-20 h-20 bg-[#fff1ec] rounded-full flex items-center justify-center mx-auto text-[#dc2626] border border-[#ffd5c6]">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#2a170f]">У вас пока нет заказов</h2>
              <p className="text-xs text-[#786565] max-w-xs mx-auto">
                Выберите свежие десерты, выпечку или авторский кофе в меню нашего стола.
              </p>
            </div>
            <button
              id="empty-go-to-menu-button"
              onClick={onGoToMenu}
              className="mt-4 px-6 py-3 bg-[#dc2626] text-white font-bold rounded-full hover:bg-[#b91c1c] transition-all inline-flex items-center gap-2 text-xs shadow-md"
            >
              <span>Открыть меню</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Subtle Reset link for testing convenience */}
        {onResetOrderForDemo && (hasPlacedOrder || hasPendingItems) && (
          <div className="text-center pt-4">
            <button
              onClick={onResetOrderForDemo}
              className="text-[11px] text-[#a89995] hover:text-[#dc2626] transition-colors inline-flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Очистить заказ стола (тест)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
