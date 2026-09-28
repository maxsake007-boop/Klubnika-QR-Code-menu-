import React from 'react';
import { Table, Order } from '../types';
import { formatMoney } from '../utils/format';

interface ConfirmFreeTableModalProps {
  isOpen: boolean;
  table: Table | null;
  order: Order | null;
  onClose: () => void;
  onConfirm: (tableId: number, orderId?: string) => void;
  onOpenPayment?: (order: Order) => void;
}

export const ConfirmFreeTableModal: React.FC<ConfirmFreeTableModalProps> = ({
  isOpen,
  table,
  order,
  onClose,
  onConfirm,
  onOpenPayment,
}) => {
  if (!isOpen || !table) return null;

  const isPaid = order?.status === 'paid';
  const hasUnpaidOrder = !!order && !isPaid;

  const handleConfirm = () => {
    if (hasUnpaidOrder) return;
    onConfirm(table.id, order?.id);
    onClose();
  };

  const handleGoToPayment = () => {
    if (order && onOpenPayment) {
      onOpenPayment(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ffe2d8] w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#fff1ec] px-6 py-4 border-b border-[#ffe2d8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs text-white ${
                hasUnpaidOrder ? 'bg-[#dc2626]' : 'bg-[#006e2d]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">
                {hasUnpaidOrder ? 'lock' : 'meeting_room'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-black text-[#2a170f]">
                {hasUnpaidOrder ? 'Оплата не завершена' : 'Освобождение стола'}
              </h2>
              <p className="text-xs text-[#5c403c]">
                Стол №{table.id} ({table.zone === 'main' ? 'Основной зал' : 'Терраса'}, {table.seats} места)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#ffe2d8] text-[#5c403c] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {hasUnpaidOrder ? (
            /* Unpaid order blocker */
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#fff1ec] border border-[#ffe2d8] flex items-center justify-center text-[#dc2626] shadow-2xs">
                <span className="material-symbols-outlined text-[32px]">no_meeting_room</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-black text-[#2a170f]">
                  Нельзя освободить стол №{table.id}
                </h3>
                <p className="text-xs text-[#5c403c] leading-relaxed">
                  Стол можно закрыть и освободить <span className="font-extrabold text-[#dc2626]">только после принятия оплаты</span>.
                  Сначала рассчитайте гостя по активному чеку.
                </p>
              </div>

              {/* Order Card Info */}
              <div className="w-full bg-[#fff8f6] p-4 rounded-xl border border-[#ffe2d8] flex flex-col gap-2 text-left mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5c403c]">Активный чек:</span>
                  <span className="text-xs font-black text-[#2a170f]">#{order.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#5c403c]">
                  <span>Позиций в чеке:</span>
                  <span className="font-bold text-[#2a170f]">{order.items.length} шт.</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#ffe2d8] mt-1">
                  <span className="text-xs font-black text-[#2a170f]">Сумма к оплате:</span>
                  <span className="text-base font-black text-[#dc2626]">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Paid order or free table ready to clear */
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[#16a34a] shadow-2xs">
                <span className="material-symbols-outlined text-[32px]">task_alt</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-black text-[#2a170f]">
                  Подтвердите, что Стол №{table.id} освободился
                </h3>
                <p className="text-xs text-[#5c403c] leading-relaxed max-w-xs">
                  {order
                    ? `Чек #${order.id} на сумму ${formatMoney(order.total)} успешно оплачен.`
                    : 'На столе нет активных заказов.'}{' '}
                  Стол перейдет в статус <span className="font-bold text-[#006e2d]">«Свободен»</span> для новых гостей.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#fff8f6] px-6 py-4 border-t border-[#ffe2d8] flex items-center justify-end gap-3">
          <button
            id="btn-cancel-free-table"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#fff1ec] text-[#5c403c] font-bold text-xs border border-[#ffe2d8] transition-all cursor-pointer"
          >
            {hasUnpaidOrder ? 'Понятно' : 'Отмена'}
          </button>

          {hasUnpaidOrder ? (
            <button
              id="btn-go-to-payment-from-free"
              type="button"
              onClick={handleGoToPayment}
              className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b70011] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">receipt_long</span>
              <span>Принять оплату ({formatMoney(order.total)})</span>
            </button>
          ) : (
            <button
              id="btn-confirm-free-table"
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-[#006e2d] hover:bg-[#005a24] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">check</span>
              <span>Да, стол освободился</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
