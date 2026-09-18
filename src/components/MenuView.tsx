import React, { useState } from 'react';
import { Flame, Plus, Minus, ArrowRight } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { CATEGORIES } from '../data/menuData';

interface MenuViewProps {
  items: MenuItem[];
  cart: CartItem[];
  onSelectProduct: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onGoToCart: () => void;
  tableNumber?: string;
  hasActiveOrder?: boolean;
}

export const MenuView: React.FC<MenuViewProps> = ({
  items,
  cart,
  onSelectProduct,
  onUpdateQuantity,
  onGoToCart,
  tableNumber = '7',
  hasActiveOrder = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  // Filter items based on active category
  const filteredItems = selectedCategory === 'Все'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  // Find the featured hit item (Strawberry tart)
  const featuredItem = items.find((item) => item.isHit) || items[0];

  // Helper to get cart quantity of an item
  const getItemQuantity = (itemId: string) => {
    const found = cart.find((c) => c.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalItemsCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' сум';
  };

  const getPluralItemsWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'товар';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'товара';
    return 'товаров';
  };

  return (
    <div id="menu-view" className="flex flex-col min-h-full bg-[#fff8f6] pb-36">
      {/* Category Horizontal Pills */}
      <div className="sticky top-0 z-20 bg-[#fff8f6]/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-[#ffe4e6]/50">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                  isActive
                    ? 'bg-[#dc2626] text-white shadow-red-900/10'
                    : 'bg-[#fff1ec] text-[#2a170f] hover:bg-[#ffe2d8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto w-full">
        {/* Featured Hero Card (Hit of Season) */}
        {featuredItem && (selectedCategory === 'Все' || selectedCategory === featuredItem.category) && (
          <div
            id="featured-hero-card"
            className="bg-white rounded-3xl border border-[#ffe4e6] overflow-hidden shadow-xs transition-transform duration-200"
          >
            {/* Image Container with Badges */}
            <div
              onClick={() => onSelectProduct(featuredItem)}
              className="relative w-full h-44 sm:h-52 overflow-hidden cursor-pointer group bg-[#ffe9e2]"
            >
              <img
                src={featuredItem.imageUrl}
                alt={featuredItem.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Hit badge */}
              <div className="absolute top-3 left-3 bg-[#dc2626] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{featuredItem.hitBadgeText || 'Хит сезона'}</span>
              </div>
              {/* Weight badge */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                {featuredItem.weightOrVolume}
              </div>
            </div>

            {/* Content & Action */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div
                onClick={() => onSelectProduct(featuredItem)}
                className="cursor-pointer min-w-0 flex-1"
              >
                <h2 className="text-base font-bold text-[#2a170f] truncate">
                  Фирменный тарт
                </h2>
                <p className="text-xs text-[#786565] truncate mt-0.5">
                  {featuredItem.subtitle}
                </p>
                <div className="text-base font-extrabold text-[#dc2626] mt-1">
                  {formatPrice(featuredItem.price)}
                </div>
              </div>

              {/* Add / Stepper */}
              <div>
                {getItemQuantity(featuredItem.id) === 0 ? (
                  <button
                    id="hero-add-button"
                    onClick={() => onUpdateQuantity(featuredItem.id, 1)}
                    className="w-10 h-10 rounded-full bg-[#dc2626] text-white flex items-center justify-center hover:bg-[#b91c1c] active:scale-95 transition-all shadow-md shadow-red-900/20"
                    aria-label={`Добавить ${featuredItem.name}`}
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-[#dc2626] text-white px-3 py-1.5 rounded-full shadow-md text-xs font-bold">
                    <button
                      onClick={() => onUpdateQuantity(featuredItem.id, getItemQuantity(featuredItem.id) - 1)}
                      className="hover:opacity-80 transition-opacity p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="min-w-[1rem] text-center font-bold">
                      {getItemQuantity(featuredItem.id)}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(featuredItem.id, getItemQuantity(featuredItem.id) + 1)}
                      className="hover:opacity-80 transition-opacity p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-base font-bold text-[#2a170f]">Все блюда</h3>
          <span className="text-xs font-semibold text-[#786565]">
            {filteredItems.length} {filteredItems.length === 1 ? 'позиция' : filteredItems.length < 5 ? 'позиции' : 'позиций'}
          </span>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((dish) => {
            const qty = getItemQuantity(dish.id);

            return (
              <div
                key={dish.id}
                className="bg-white rounded-2xl border border-[#ffe4e6] p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div
                    onClick={() => onSelectProduct(dish)}
                    className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer group bg-[#ffe9e2]"
                  >
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {dish.weightOrVolume}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div
                    onClick={() => onSelectProduct(dish)}
                    className="cursor-pointer mt-2"
                  >
                    <h4 className="text-xs sm:text-sm font-bold text-[#2a170f] line-clamp-1">
                      {dish.name}
                    </h4>
                    <p className="text-[11px] text-[#786565] line-clamp-2 h-7 leading-tight mt-0.5">
                      {dish.subtitle}
                    </p>
                    <div className="text-xs sm:text-sm font-bold text-[#2a170f] mt-1">
                      {formatPrice(dish.price)}
                    </div>
                  </div>
                </div>

                {/* Bottom Action (Stepper or Button) */}
                <div className="mt-2.5">
                  {qty === 0 ? (
                    <button
                      onClick={() => onUpdateQuantity(dish.id, 1)}
                      className="w-full py-1.5 px-3 bg-[#dc2626] text-white text-xs font-bold rounded-full hover:bg-[#b91c1c] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>+ {formatPrice(dish.price)}</span>
                    </button>
                  ) : (
                    <div className="w-full py-1 px-3 bg-[#dc2626] text-white text-xs font-bold rounded-full flex items-center justify-between shadow-xs">
                      <button
                        onClick={() => onUpdateQuantity(dish.id, qty - 1)}
                        className="p-0.5 hover:opacity-80 transition-opacity"
                        aria-label="Уменьшить"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="min-w-[1rem] text-center font-bold">
                        {qty}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(dish.id, qty + 1)}
                        className="p-0.5 hover:opacity-80 transition-opacity"
                        aria-label="Увеличить"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Sticky Bottom Bar (When cart has items) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-[68px] left-0 right-0 px-4 z-20 pointer-events-none max-w-lg md:max-w-xl mx-auto w-full">
          <div
            id="floating-cart-bar"
            onClick={onGoToCart}
            className="pointer-events-auto bg-[#2a170f] text-white px-4 py-2.5 rounded-full flex items-center justify-between shadow-xl cursor-pointer hover:bg-[#382015] active:scale-[0.99] transition-all border border-[#412b22]"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[11px] text-[#ffdbcd]">
                <span className="w-2 h-2 rounded-full bg-[#16a34a] inline-block animate-pulse"></span>
                <span>
                  Стол {tableNumber} • {hasActiveOrder ? `+${totalItemsCount} к заказу` : `${totalItemsCount} ${getPluralItemsWord(totalItemsCount)}`}
                </span>
              </div>
              <span className="text-base font-extrabold text-white leading-tight">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onGoToCart();
              }}
              className="px-4 py-2 bg-[#dc2626] text-white text-xs font-bold rounded-full flex items-center gap-1.5 hover:bg-[#b91c1c] active:scale-95 transition-all shadow-md"
            >
              <span>{hasActiveOrder ? 'Добавить в заказ' : 'В корзину'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
