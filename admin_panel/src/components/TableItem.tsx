import React from 'react';
import { Table, Order } from '../types';
import { formatNumber } from '../utils/format';

interface TableItemProps {
  table: Table;
  order: Order | null;
  isSelected: boolean;
  onSelect: (table: Table, order: Order | null) => void;
}

export const TableItem: React.FC<TableItemProps> = ({
  table,
  order,
  isSelected,
  onSelect,
}) => {
  const isOccupied = !!order;
  const isPaid = order?.status === 'paid';
  const isNew = order?.status === 'new';

  // Outer container highlight
  const getContainerClass = () => {
    if (isSelected) {
      return 'bg-[#dc2626]/10 ring-2 ring-[#dc2626] shadow-sm scale-[1.02]';
    }
    return 'hover:bg-[#ffe9e2]/60';
  };

  // Chair color based on state
  const getChairClass = (chairOccupied: boolean) => {
    if (isSelected) return 'bg-[#dc2626] shadow-xs';
    if (isPaid) return 'bg-[#006e2d]/50';
    if (chairOccupied) return 'bg-[#dc2626]/40';
    return 'bg-[#eed7d2] group-hover:bg-[#e4c2bc]';
  };

  // Table surface styling
  const getTabletopClass = () => {
    if (isSelected) {
      return 'bg-white border-2 border-[#dc2626] shadow-md';
    }
    if (isPaid) {
      return 'bg-white border-2 border-[#006e2d] shadow-xs';
    }
    if (isOccupied) {
      return 'bg-white border-2 border-[#dc2626] shadow-xs';
    }
    return 'bg-[#fff5f2] border border-[#e6bdb8] shadow-xs group-hover:border-[#dc2626]/50 group-hover:bg-[#fff0eb]';
  };

  // Render chairs according to table shape / seat count
  const renderChairsAndTable = () => {
    // 2-seat corner table (1 chair top, 1 chair bottom)
    if (table.seats === 2 || table.shape === 'rect-2') {
      return (
        <div className="relative flex items-center justify-center py-2.5 px-1 w-full h-full">
          {/* Top chair */}
          <span
            className={`absolute -top-1.5 w-10 h-3 rounded-t-full transition-colors ${getChairClass(
              isOccupied,
            )}`}
          />
          {/* Bottom chair */}
          <span
            className={`absolute -bottom-1.5 w-10 h-3 rounded-b-full transition-colors ${getChairClass(
              isOccupied,
            )}`}
          />

          {/* Tabletop */}
          <div
            className={`w-[110px] sm:w-[126px] h-[82px] sm:h-[88px] rounded-xl flex flex-col items-center justify-center p-1.5 transition-all ${getTabletopClass()}`}
          >
            {isOccupied && order ? (
              <>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-sm font-black text-[#2a170f]">№{table.id}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPaid ? 'bg-[#006e2d]' : isNew ? 'bg-[#dc2626] animate-pulse' : 'bg-[#dc2626]'
                    }`}
                  />
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] sm:text-[10.5px] leading-tight mt-1 truncate max-w-[102px] sm:max-w-[118px] ${
                    isSelected
                      ? 'bg-[#dc2626] text-white shadow-xs'
                      : isPaid
                      ? 'bg-[#7cf994] text-[#007230]'
                      : 'bg-[#ffe2d8] text-[#b70011]'
                  }`}
                >
                  #{order.id} · {formatNumber(order.total)} сум
                </span>
                <span
                  className={`text-[10px] sm:text-[10.5px] font-semibold leading-none mt-1 ${
                    isPaid
                      ? 'text-[#006e2d]'
                      : isNew
                      ? 'text-[#b70011]'
                      : 'text-[#5c403c]'
                  }`}
                >
                  {order.statusLabel}
                </span>
              </>
            ) : (
              <>
                <span className="text-base font-black text-[#2a170f]">№{table.id}</span>
                <span className="text-xs text-[#916f6b] font-medium leading-tight mt-0.5">Свободен</span>
                <span className="text-[11px] text-[#b08882] font-semibold leading-none mt-0.5">
                  2 места
                </span>
              </>
            )}
          </div>
        </div>
      );
    }

    // 4-seat standard table (2 chairs top, 2 chairs bottom)
    return (
      <div className="relative flex items-center justify-center py-2.5 px-1 w-full h-full">
        {/* 2 chairs top */}
        <div className={`absolute ${isSelected ? '-top-2' : '-top-1.5'} flex gap-3.5`}>
          <span
            className={`${
              isSelected ? 'w-8 h-3.5' : 'w-7 sm:w-8 h-3'
            } rounded-t-full transition-all ${getChairClass(isOccupied)}`}
          />
          <span
            className={`${
              isSelected ? 'w-8 h-3.5' : 'w-7 sm:w-8 h-3'
            } rounded-t-full transition-all ${getChairClass(isOccupied)}`}
          />
        </div>

        {/* 2 chairs bottom */}
        <div className={`absolute ${isSelected ? '-bottom-2' : '-bottom-1.5'} flex gap-3.5`}>
          <span
            className={`${
              isSelected ? 'w-8 h-3.5' : 'w-7 sm:w-8 h-3'
            } rounded-b-full transition-all ${getChairClass(isOccupied)}`}
          />
          <span
            className={`${
              isSelected ? 'w-8 h-3.5' : 'w-7 sm:w-8 h-3'
            } rounded-b-full transition-all ${getChairClass(isOccupied)}`}
          />
        </div>

        {/* Tabletop */}
        <div
          className={`${
            isSelected ? 'w-[130px] sm:w-[150px] h-[88px] sm:h-[94px] p-2' : 'w-[124px] sm:w-[144px] h-[84px] sm:h-[90px] p-1.5'
          } rounded-xl flex flex-col items-center justify-center transition-all ${getTabletopClass()}`}
        >
          {isOccupied && order ? (
            <>
              <div className="flex items-center gap-1.5 leading-none">
                <span
                  className={`text-sm font-black ${
                    isSelected ? 'text-[#b70011]' : 'text-[#2a170f]'
                  }`}
                >
                  №{table.id}
                </span>
                {table.id === 7 && (
                  <span className="material-symbols-outlined text-[#dc2626] text-[15px]">
                    star
                  </span>
                )}
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPaid
                      ? 'bg-[#006e2d]'
                      : isNew
                      ? 'bg-[#dc2626] animate-pulse'
                      : 'bg-[#dc2626]'
                  }`}
                />
              </div>

              <span
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-[10.5px] leading-tight mt-1 truncate max-w-[116px] sm:max-w-[136px] ${
                  isSelected
                    ? 'bg-[#dc2626] text-white shadow-xs'
                    : isPaid
                    ? 'bg-[#7cf994] text-[#007230]'
                    : 'bg-[#ffe2d8] text-[#b70011]'
                }`}
              >
                #{order.id} · {formatNumber(order.total)} сум
              </span>

              <span
                className={`text-[10px] sm:text-[10.5px] font-semibold leading-none mt-1 ${
                  isSelected
                    ? 'text-[#b70011]'
                    : isPaid
                    ? 'text-[#006e2d]'
                    : 'text-[#5c403c]'
                }`}
              >
                {isSelected && isNew ? '14:22 · Новый' : order.statusLabel}
              </span>
            </>
          ) : (
            <>
              <span className="text-base font-black text-[#2a170f]">№{table.id}</span>
              <span className="text-xs text-[#916f6b] font-medium leading-tight mt-0.5">Свободен</span>
              <span className="text-[11px] text-[#b08882] font-semibold leading-none mt-0.5">
                4 места
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <button
      id={`table-card-${table.id}`}
      type="button"
      onClick={() => onSelect(table, order)}
      className={`table-card group relative p-2 rounded-xl transition-all text-center flex flex-col items-center justify-center min-h-[142px] sm:min-h-[150px] focus:outline-hidden ${getContainerClass()}`}
      title={`Стол №${table.id} (${table.seats} мест) - ${
        isOccupied ? `Заказ #${order?.id} (${formatNumber(order?.total || 0)} сум)` : 'Свободен'
      }`}
    >
      {renderChairsAndTable()}
    </button>
  );
};
