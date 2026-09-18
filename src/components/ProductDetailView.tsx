import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ShoppingBag, Plus, Minus, Hourglass, PieChart, Sparkles, Heart, Coffee } from 'lucide-react';
import { MenuItem } from '../types';
import { HeaderTableBadge } from './HeaderTableBadge';

interface ProductDetailViewProps {
  item: MenuItem;
  onBack: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
  tableNumber?: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  item,
  onBack,
  onAddToCart,
  tableNumber = '7',
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAdd = () => {
    onAddToCart(item, quantity);
    onBack();
  };

  const renderAttributeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Hourglass':
        return <Hourglass className="w-3.5 h-3.5 text-[#5c403c]" />;
      case 'PieChart':
        return <PieChart className="w-3.5 h-3.5 text-[#5c403c]" />;
      case 'Coffee':
        return <Coffee className="w-3.5 h-3.5 text-[#5c403c]" />;
      case 'Heart':
        return <Heart className="w-3.5 h-3.5 text-[#5c403c]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#5c403c]" />;
    }
  };

  return (
    <div id="product-detail-view" className="flex flex-col min-h-full bg-[#fff8f6] pb-24">
      {/* Header bar */}
      <div className="sticky top-0 z-20 bg-[#fff8f6]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#ffe4e6]">
        <div className="flex items-center gap-3">
          <button
            id="product-back-button"
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-[#ffe9e2] text-[#2a170f] transition-colors"
            aria-label="Назад к меню"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-base font-bold text-[#2a170f]">Product</h1>
        </div>
        <HeaderTableBadge tableNumber={tableNumber} />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Hero image */}
        <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden shadow-xs border border-[#ffe4e6] bg-[#ffe9e2]">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Title and Price */}
        <div className="pt-1">
          {item.overtitle && (
            <p className="text-[11px] font-bold text-[#dc2626] uppercase tracking-wider mb-1">
              {item.overtitle}
            </p>
          )}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2a170f] leading-snug">
              {item.name}
            </h2>
            <div className="text-xl sm:text-2xl font-extrabold text-[#dc2626] whitespace-nowrap">
              {item.price.toLocaleString('ru-RU')} сум
            </div>
          </div>
        </div>

        {/* Attribute badges */}
        {item.attributes && item.attributes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {item.attributes.map((attr, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fff1ec] text-[#2a170f] text-xs font-medium border border-[#ffd5c6]/60"
              >
                {renderAttributeIcon(attr.icon)}
                <span>{attr.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description card */}
        <div className="bg-white border border-[#ffe4e6] rounded-2xl p-4 shadow-xs">
          <p className="text-xs sm:text-sm text-[#5c403c] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Quantity selector card */}
        <div className="bg-white border border-[#ffe4e6] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#2a170f]">Количество</h3>
            <p className="text-xs text-[#786565]">Порции для стола {tableNumber}</p>
          </div>
          <div className="flex items-center gap-3 bg-[#fff1ec] px-3 py-1.5 rounded-full border border-[#ffd5c6]/60">
            <button
              id="product-decrease-qty"
              onClick={handleDecrement}
              className="p-0.5 text-[#786565] hover:text-[#b70011] transition-colors"
              aria-label="Уменьшить"
            >
              <Minus className="w-4 h-4 stroke-[2.5]" />
            </button>
            <span className="text-sm font-bold text-[#2a170f] min-w-[1.25rem] text-center">
              {quantity}
            </span>
            <button
              id="product-increase-qty"
              onClick={handleIncrement}
              className="w-5 h-5 bg-[#dc2626] text-white rounded-full flex items-center justify-center hover:bg-[#b91c1c] transition-colors shadow-xs"
              aria-label="Увеличить"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Kitchen trust badge */}
        <div className="flex items-center gap-2 px-1 pt-1 text-xs font-medium text-[#006e2d]">
          <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
          <span>Готовим на открытой кухне прямо перед подачей</span>
        </div>
      </div>

      {/* Sticky Bottom Add Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#fff8f6] via-[#fff8f6]/95 to-transparent z-30 max-w-lg md:max-w-xl mx-auto">
        <button
          id="product-add-to-cart-cta"
          onClick={handleAdd}
          className="w-full py-3.5 px-6 bg-[#dc2626] text-white font-bold rounded-full shadow-lg shadow-red-900/15 hover:bg-[#b91c1c] active:scale-[0.99] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span>Добавить в заказ</span>
          </div>
          <span className="text-base font-extrabold">{(item.price * quantity).toLocaleString('ru-RU')} сум</span>
        </button>
      </div>
    </div>
  );
};
