import React from 'react';
import { Table, Order, ViewMode } from '../types';
import { TableItem } from './TableItem';

interface FloorMapProps {
  tables: Table[];
  orders: Record<string, Order>;
  selectedTableId: number | null;
  onSelectTable: (table: Table, order: Order | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNewOrderModal: (defaultTableId?: number) => void;
  activeOrdersCount: number;
}

export const FloorMap: React.FC<FloorMapProps> = ({
  tables,
  orders,
  selectedTableId,
  onSelectTable,
  viewMode,
  onViewModeChange,
  onOpenNewOrderModal,
  activeOrdersCount,
}) => {
  const mainTables = tables.filter((t) => t.zone === 'main');
  const terraceTables = tables.filter((t) => t.zone === 'terrace');

  const mainOccupied = mainTables.filter((t) => t.currentOrderId && orders[t.currentOrderId]).length;
  const mainFree = mainTables.length - mainOccupied;

  const terraceOccupied = terraceTables.filter((t) => t.currentOrderId && orders[t.currentOrderId]).length;
  const terraceFree = terraceTables.length - terraceOccupied;

  const totalOccupied = mainOccupied + terraceOccupied;
  const totalFree = tables.length - totalOccupied;

  return (
    <div className="flex flex-col gap-6">
      {/* View Switcher & Quick Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left Switcher Buttons */}
        <div className="flex items-center gap-1 bg-[#fff1ec] p-1 rounded-full border border-[#ffe2d8]">
          <button
            id="view-list-btn"
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-1.5 rounded-full transition-all text-sm font-bold flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_list</span>
            <span>Список заказов</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white/20 text-xs font-semibold">
              {activeOrdersCount}
            </span>
          </button>

          <button
            id="view-floor-btn"
            type="button"
            onClick={() => onViewModeChange('floor')}
            className={`px-4 py-1.5 rounded-full transition-all text-sm font-bold flex items-center gap-1.5 ${
              viewMode === 'floor'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Карта столов (30)</span>
          </button>
        </div>

        {/* Right Stats & Add Order */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#fff1ec] px-4 py-1.5 rounded-full text-xs text-[#5c403c] border border-[#ffe2d8]">
            <span>
              Всего: <strong className="text-[#2a170f]">30 столов</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#e6bdb8]"></span>
              Свободно: <strong className="text-[#2a170f]">{totalFree}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
              Занято с заказом: <strong className="text-[#dc2626]">{totalOccupied}</strong>
            </span>
            <span>•</span>
            <span>
              Зал: <strong className="text-[#2a170f]">18</strong>
            </span>
            <span>•</span>
            <span>
              Терраса: <strong className="text-[#2a170f]">12</strong>
            </span>
          </div>

          <button
            id="btn-add-order-floor"
            type="button"
            onClick={() => onOpenNewOrderModal(selectedTableId || 1)}
            className="px-4 py-1.5 rounded-full bg-[#dc2626] hover:bg-[#b70011] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Добавить заказ {selectedTableId ? `(Стол №${selectedTableId})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Main Hall Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#ffe2d8] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#ffe2d8]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b70011] text-[22px]">storefront</span>
            <h2 className="text-xl font-bold text-[#2a170f]">Основной зал</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#ffe2d8] text-xs text-[#5c403c] font-semibold">
              {mainTables.length} столов · {mainOccupied} занято
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#5c403c] text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#e6bdb8]" />
              Свободно: {mainFree}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              Занято: {mainOccupied}
            </span>
          </div>
        </div>

        {/* 4-column Grid (reduced from 6 to give tables spacious width) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4.5">
          {mainTables.map((table) => {
            const order = table.currentOrderId ? orders[table.currentOrderId] || null : null;
            const isSelected = selectedTableId === table.id;
            return (
              <TableItem
                key={table.id}
                table={table}
                order={order}
                isSelected={isSelected}
                onSelect={onSelectTable}
              />
            );
          })}
        </div>
      </div>

      {/* Terrace Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#ffe2d8] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#ffe2d8]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006e2d] text-[22px]">deck</span>
            <h2 className="text-xl font-bold text-[#2a170f]">Зона «Терраса»</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#ffe2d8] text-xs text-[#5c403c] font-semibold">
              {terraceTables.length} столов · {terraceOccupied} занято
            </span>
          </div>

          <div className="flex items-center gap-3 text-[#5c403c] text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#e6bdb8]" />
              Свободно: {terraceFree}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              Занято: {terraceOccupied}
            </span>
          </div>
        </div>

        {/* 4-column Grid (reduced from 6 to give tables spacious width) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4.5">
          {terraceTables.map((table) => {
            const order = table.currentOrderId ? orders[table.currentOrderId] || null : null;
            const isSelected = selectedTableId === table.id;
            return (
              <TableItem
                key={table.id}
                table={table}
                order={order}
                isSelected={isSelected}
                onSelect={onSelectTable}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
