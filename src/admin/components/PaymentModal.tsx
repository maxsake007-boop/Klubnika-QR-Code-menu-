import React, { useState } from 'react';
import { Order, Table } from '../types';
import { formatMoney, formatWithDots } from '../utils/format';

interface PaymentModalProps {
  isOpen: boolean;
  order: Order | null;
  table: Table | null;
  onClose: () => void;
  onConfirmPayment: (orderId: string, method: string, freeTable: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  order,
  table,
  onClose,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<'card' | 'cash' | 'sbp'>('card');
  const [freeTableAfterPayment, setFreeTableAfterPayment] = useState<boolean>(true);
  const [cashReceived, setCashReceived] = useState<string>('');

  if (!isOpen || !order || !table) return null;

  const total = order.total;
  const numCashReceived = cashReceived ? Number(cashReceived.replace(/\D/g, '')) : 0;
  const changeAmount = numCashReceived > total ? numCashReceived - total : 0;

  const handlePay = () => {
    onConfirmPayment(order.id, method, freeTableAfterPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-[#ffe2d8] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#fff1ec] px-6 py-4 border-b border-[#ffe2d8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#dc2626] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2a170f]">Закрытие заказа #{order.id}</h2>
              <p className="text-xs text-[#5c403c]">
                Стол №{table.id} · Сумма заказа: {formatMoney(total)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#ffe2d8] text-[#5c403c] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Method selector - as a tag/note */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5c403c] uppercase tracking-wider">
                Тип оплаты (пометка для отчёта)
              </label>
              <span className="text-[11px] text-[#916f6b]">Оплата через внешнюю кассу</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                  method === 'card'
                    ? 'border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] font-bold shadow-xs'
                    : 'border-[#e6bdb8] bg-[#fff8f6] text-[#5c403c] hover:bg-[#fff1ec]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">credit_card</span>
                <span className="text-xs">Humo / Uzcard</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                  method === 'cash'
                    ? 'border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] font-bold shadow-xs'
                    : 'border-[#e6bdb8] bg-[#fff8f6] text-[#5c403c] hover:bg-[#fff1ec]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">local_atm</span>
                <span className="text-xs">Наличные</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('sbp')}
                className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                  method === 'sbp'
                    ? 'border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] font-bold shadow-xs'
                    : 'border-[#e6bdb8] bg-[#fff8f6] text-[#5c403c] hover:bg-[#fff1ec]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
                <span className="text-xs">Payme / Click</span>
              </button>
            </div>

            {/* Cash details with automatic dots formatting */}
            {method === 'cash' && (
              <div className="mt-3 p-3 bg-[#fff1ec] rounded-xl border border-[#ffe2d8] flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2a170f]">
                    Получено от гостя:
                  </label>
                  {numCashReceived > 0 && (
                    <span className="text-xs font-bold text-[#006e2d]">
                      Сдача: {formatWithDots(changeAmount)} сум
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cashReceived ? formatWithDots(cashReceived) : ''}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setCashReceived(digits);
                    }}
                    placeholder={`напр. ${formatWithDots(Math.ceil(total / 10000) * 10000)}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ffe2d8] text-[#2a170f] font-black text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5c403c] pointer-events-none">
                    сум
                  </span>
                </div>

                {/* Quick Cash Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[total, Math.ceil(total / 50000) * 50000, 100000, 200000]
                    .filter((val, idx, arr) => val >= total && arr.indexOf(val) === idx)
                    .map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashReceived(String(val))}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-[#ffe2d8] text-[#5c403c] transition-colors border border-[#ffe2d8]"
                      >
                        {formatWithDots(val)}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Table release checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer py-1 text-[#2a170f]">
            <input
              type="checkbox"
              checked={freeTableAfterPayment}
              onChange={(e) => setFreeTableAfterPayment(e.target.checked)}
              className="w-4 h-4 text-[#dc2626] rounded border-[#e6bdb8] focus:ring-[#dc2626]"
            />
            <span className="text-xs font-semibold">
              Автоматически освободить Стол {table.id}
            </span>
          </label>

          {/* Receipt / Total Card with clean moderate border radius */}
          <div className="p-4 bg-[#fff1ec] rounded-xl border-2 border-[#dc2626]/30 text-xs text-[#5c403c] flex flex-col gap-2 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#ffe2d8]">
              <span className="font-medium text-[#5c403c]">Официант / Кассир:</span>
              <span className="font-bold text-[#2a170f]">Анна К.</span>
            </div>
            <div className="flex justify-between items-center font-extrabold text-[#2a170f]">
              <span className="text-sm uppercase tracking-wide text-[#2a170f]">ИТОГО К ОПЛАТЕ:</span>
              <span className="text-[#dc2626] text-xl sm:text-2xl font-black">{formatMoney(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#fff1ec] px-6 py-4 border-t border-[#ffe2d8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#5c403c] hover:text-[#2a170f] hover:bg-[#ffe2d8] transition-colors"
          >
            Отмена
          </button>
          <button
            id="btn-confirm-payment-modal"
            type="button"
            onClick={handlePay}
            className="px-6 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b70011] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Закрыть заказ ({formatMoney(total)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
