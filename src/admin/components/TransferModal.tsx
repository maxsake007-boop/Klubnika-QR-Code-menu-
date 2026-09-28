import React, { useState } from 'react';
import { Table, Order } from '../types';

interface TransferModalProps {
  isOpen: boolean;
  order: Order | null;
  currentTable: Table | null;
  tables: Table[];
  onClose: () => void;
  onConfirmTransfer: (orderId: string, fromTableId: number, toTableId: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  order,
  currentTable,
  tables,
  onClose,
  onConfirmTransfer,
}) => {
  const [targetTableId, setTargetTableId] = useState<number | null>(null);

  if (!isOpen || !order || !currentTable) return null;

  // Available free tables or different tables
  const availableTables = tables.filter((t) => t.id !== currentTable.id && !t.currentOrderId);

  const handleConfirm = () => {
    if (!targetTableId) return;
    onConfirmTransfer(order.id, currentTable.id, targetTableId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-[#ffe2d8] w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#fff1ec] px-6 py-4 border-b border-[#ffe2d8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#dc2626] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2a170f]">Пересадить гостей</h2>
              <p className="text-xs text-[#5c403c]">Заказ #{order.id} со Стола {currentTable.id}</p>
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
        <div className="p-6 flex flex-col gap-4">
          <div className="bg-[#fff8f6] p-3 rounded-xl border border-[#ffe2d8] text-xs flex items-center justify-between">
            <span className="text-[#5c403c]">Текущий стол:</span>
            <span className="font-bold text-[#dc2626]">
              Стол №{currentTable.id} ({currentTable.zone === 'main' ? 'Основной зал' : 'Терраса'},{' '}
              {currentTable.seats} мест)
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#5c403c] block mb-2 uppercase tracking-wider">
              Выберите свободный стол для пересадки:
            </label>
            {availableTables.length === 0 ? (
              <p className="text-xs text-[#b70011] bg-[#ffdad6] p-3 rounded-xl font-semibold">
                К сожалению, в данный момент нет других свободных столов.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {availableTables.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTargetTableId(t.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      targetTableId === t.id
                        ? 'border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] font-bold shadow-xs ring-2 ring-[#dc2626]'
                        : 'border-[#e6bdb8] bg-white text-[#2a170f] hover:bg-[#fff1ec]'
                    }`}
                  >
                    <span className="text-sm font-bold">№{t.id}</span>
                    <span className="text-[10px] text-[#5c403c]">
                      {t.zone === 'main' ? 'Зал' : 'Терраса'} · {t.seats}м
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fff1ec] px-6 py-4 border-t border-[#ffe2d8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-[#5c403c] hover:bg-[#ffe2d8] transition-colors"
          >
            Отмена
          </button>
          <button
            id="btn-confirm-transfer-modal"
            type="button"
            disabled={!targetTableId}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b70011] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Пересадить за Стол {targetTableId || '...'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
