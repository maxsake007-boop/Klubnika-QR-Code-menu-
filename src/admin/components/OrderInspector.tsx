import React from 'react';
import { Order, Table } from '../types';
import { formatMoney } from '../utils/format';

interface OrderInspectorProps {
  order: Order | null;
  table: Table | null;
  onAcceptPayment: (order: Order) => void;
  onMarkReady: (order: Order) => void;
  onTransfer?: (order: Order) => void;
  onFreeTable: (tableId: number, orderId?: string) => void;
  onOpenNewOrder?: (tableId: number) => void;
}

export const OrderInspector: React.FC<OrderInspectorProps> = ({
  order,
  table,
  onAcceptPayment,
  onMarkReady,
  onFreeTable,
  onOpenNewOrder,
}) => {
  // Case 1: Neither table nor order selected
  if (!table && !order) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-md border border-[#ffe2d8] flex flex-col items-center justify-center text-center min-h-[420px]">
        <div className="w-16 h-16 rounded-xl bg-[#fff1ec] flex items-center justify-center text-[#dc2626] mb-4">
          <span className="material-symbols-outlined text-[32px]">touch_app</span>
        </div>
        <h3 className="text-lg font-bold text-[#2a170f] mb-1">Выберите стол на карте</h3>
        <p className="text-xs text-[#5c403c] max-w-[260px]">
          Нажмите на любой стол, чтобы сразу открыть или дополнить заказ для этого стола
        </p>
      </div>
    );
  }

  // Case 2: Table selected, but currently free (no order yet)
  if (table && !order) {
    const zoneLabel = table.zone === 'main' ? 'Основной зал' : 'Зона «Терраса»';
    return (
      <div
        id="order-inspector"
        className="bg-white p-6 rounded-xl shadow-lg border border-[#ffe2d8] flex flex-col gap-5 ring-2 ring-[#dc2626]"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#ffe2d8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#7cf994] text-[#007230]">
                Свободен
              </span>
              <span className="text-xs text-[#5c403c] uppercase tracking-wider font-semibold">
                Готов к гостям
              </span>
            </div>
            <h2 id="inspect-title" className="text-2xl font-extrabold text-[#2a170f] mt-1">
              Стол №{table.id}
            </h2>
            <p className="text-xs text-[#5c403c]">
              {zoneLabel} · {table.seats} места
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#fff1ec] border border-[#ffe2d8] flex items-center justify-center text-[#dc2626]">
            <span className="material-symbols-outlined text-[26px]">table_restaurant</span>
          </div>
        </div>

        {/* Empty state content */}
        <div className="p-6 rounded-xl bg-[#fff8f6] border border-dashed border-[#ffe2d8] flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#dc2626] shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">add_shopping_cart</span>
          </div>
          <p className="text-sm font-bold text-[#2a170f]">На этом столе нет активного заказа</p>
          <p className="text-xs text-[#5c403c]">
            Нажмите кнопку ниже, чтобы открыть меню и добавить позиции на Стол №{table.id}
          </p>
        </div>

        {/* Add Order Button */}
        <button
          id="btn-add-order-inspector"
          type="button"
          onClick={() => onOpenNewOrder?.(table.id)}
          className="w-full py-3.5 px-6 rounded-xl bg-[#dc2626] hover:bg-[#b70011] text-white text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Добавить заказ на Стол №{table.id}</span>
        </button>
      </div>
    );
  }

  // Case 3: Table and active order exist
  const currentTable = table!;
  const currentOrder = order!;
  const zoneLabel = currentTable.zone === 'main' ? 'Основной зал' : 'Зона «Терраса»';
  const tableLabel = `${zoneLabel} · ${currentTable.seats} места · ${currentOrder.sourceLabel}`;

  return (
    <div
      id="order-inspector"
      className="bg-white p-6 rounded-xl shadow-lg border border-[#ffe2d8] flex flex-col gap-4 ring-2 ring-[#dc2626]"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-[#ffe2d8]">
        <div>
          <div className="flex items-center gap-2">
            <span
              id="inspect-status-badge"
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                currentOrder.status === 'new'
                  ? 'bg-[#dc2626] text-white'
                  : currentOrder.status === 'cooking'
                  ? 'bg-[#412b22] text-[#ffede7]'
                  : currentOrder.status === 'paid'
                  ? 'bg-[#7cf994] text-[#007230]'
                  : 'bg-[#ffdbcd] text-[#2a170f]'
              }`}
            >
              {currentOrder.statusLabel}
            </span>
            <span className="text-xs text-[#5c403c] uppercase tracking-wider font-semibold">
              Заказ #{currentOrder.id}
            </span>
          </div>

          <h2 id="inspect-title" className="text-2xl font-extrabold text-[#2a170f] mt-1">
            Стол {currentTable.id}
          </h2>
          <p className="text-xs text-[#5c403c]">{tableLabel}</p>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#5c403c]">Время создания</span>
          <p id="inspect-time" className="text-sm font-bold text-[#2a170f]">
            {currentOrder.time}
          </p>
          <span className="text-xs font-bold text-[#b70011]">{currentOrder.timeAgo}</span>
        </div>
      </div>

      {/* Itemized list */}
      <div id="inspect-items" className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {currentOrder.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#fff1ec] border border-[#ffe2d8]/60 hover:border-[#e6bdb8] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#ffe2d8] flex items-center justify-center text-[#dc2626] font-bold text-xs">
                {item.qty}×
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#2a170f]">{item.name}</h3>
                <p className="text-[11px] text-[#5c403c]">{item.desc}</p>
              </div>
            </div>
            <div className="text-right text-sm font-bold text-[#2a170f] whitespace-nowrap">
              {formatMoney(item.price)}
            </div>
          </div>
        ))}
      </div>

      {/* Total Calculation Card */}
      <div className="bg-[#fff1ec] p-4 rounded-xl flex items-center justify-between border-2 border-[#dc2626]/30 shadow-xs">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-[#2a170f] block">
            Итого к оплате
          </span>
          <span className="text-[11px] font-semibold text-[#dc2626]">
            К расчету с гостем
          </span>
        </div>
        <div
          id="inspect-total"
          className="text-2xl sm:text-3xl font-black text-[#dc2626] tracking-tight"
        >
          {formatMoney(currentOrder.total)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Add more snacks/drinks directly to this table's check */}
        {currentOrder.status !== 'paid' && (
          <button
            id="btn-add-more-items"
            type="button"
            onClick={() => onOpenNewOrder?.(currentTable.id)}
            className="w-full py-2.5 px-4 rounded-lg bg-[#ffe2d8] hover:bg-[#ffd3c4] text-[#dc2626] text-xs font-black transition-all flex items-center justify-center gap-1.5 border border-[#dc2626]/30 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Добавить блюда / напитки в чек</span>
          </button>
        )}

        {currentOrder.status !== 'paid' ? (
          <button
            id="btn-accept-payment"
            type="button"
            onClick={() => onAcceptPayment(currentOrder)}
            className="w-full py-3 px-6 rounded-lg bg-[#dc2626] hover:bg-[#b70011] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Закрыть заказ / Оплата</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-lg bg-[#7cf994]/30 border border-[#006e2d]/30 text-[#006e2d] text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Чек успешно закрыт</span>
          </div>
        )}

        {currentOrder.status !== 'paid' && (
          <button
            id="btn-mark-ready"
            type="button"
            onClick={() => onMarkReady(currentOrder)}
            className="w-full py-2.5 px-6 rounded-lg bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>
              {currentOrder.status === 'ready' ? 'Заказ уже готов (подан)' : 'Отметить готовым'}
            </span>
          </button>
        )}

        <div className="pt-1">
          {currentOrder.status === 'paid' ? (
            <button
              id="btn-free-table"
              type="button"
              onClick={() => onFreeTable(currentTable.id, currentOrder.id)}
              className="w-full py-3 px-6 rounded-lg bg-[#006e2d] hover:bg-[#005a24] text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer animate-in fade-in"
            >
              <span className="material-symbols-outlined text-[19px]">meeting_room</span>
              <span>Освободить стол №{currentTable.id} (оплата принята)</span>
            </button>
          ) : (
            <button
              id="btn-free-table"
              type="button"
              onClick={() => onFreeTable(currentTable.id, currentOrder.id)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#fff8f6] hover:bg-[#ffe2d8]/60 text-[#916f6b] hover:text-[#5c403c] text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-dashed border-[#ffe2d8] active:scale-[0.98] cursor-pointer"
              title="Освобождение стола возможно только после оплаты"
            >
              <span className="material-symbols-outlined text-[17px] text-[#dc2626]">lock</span>
              <span>Освободить стол №{currentTable.id} (только после оплаты)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
