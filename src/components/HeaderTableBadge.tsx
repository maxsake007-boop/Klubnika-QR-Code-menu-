import React from 'react';
import { Armchair } from 'lucide-react';

interface HeaderTableBadgeProps {
  tableNumber?: string;
  className?: string;
}

export const HeaderTableBadge: React.FC<HeaderTableBadgeProps> = ({
  tableNumber = '7',
  className = '',
}) => {
  return (
    <div
      id="table-badge"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe9e2] text-[#2a170f] text-xs font-semibold shadow-xs border border-[#ffd5c6] ${className}`}
    >
      <Armchair className="w-3.5 h-3.5 text-[#5c403c]" />
      <span>Стол {tableNumber}</span>
    </div>
  );
};
