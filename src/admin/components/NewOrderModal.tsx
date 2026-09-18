import React, { useState, useEffect } from 'react';
import { Table, MenuItem, Order, OrderItem } from '../types';
import { formatMoney } from '../utils/format';

interface NewOrderModalProps {
  isOpen: boolean;
  table: Table | null;
  existingOrder: Order | null;
  menuItems: MenuItem[];
  onClose: () => void;
  onSaveOrder: (tableId: number, newItems: OrderItem[], notes?: string) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  table,
  existingOrder,
  menuItems,
  onClose,
  onSaveOrder,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<Record<string, { item: MenuItem; qty: number; note?: string }>>({});
  const [generalNotes, setGeneralNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCart({});
      setGeneralNotes('');
    }
  }, [isOpen, table?.id]);

  if (!isOpen || !table) return null;

  // Derive unique categories dynamically from menuItems
  const categoryMap = new Map<string, string>();
  categoryMap.set('all', 'Все');
  menuItems.forEach((item) => {
    if (item.category && item.categoryName) {
      categoryMap.set(item.category, item.categoryName);
    }
  });

  const categories = Array.from(categoryMap.entries()).map(([id, label]) => ({ id, label }));

  const filteredMenuItems = menuItems.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  const handleAddItem = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id];
      if (current) {
        return {
          ...prev,
          [item.id]: { ...current, qty: current.qty + 1 },
        };
      }
      return {
        ...prev,
        [item.id]: { item, qty: 1 },
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      if (current.qty <= 1) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: { ...current, qty: current.qty - 1 },
      };
    });
  };

  const cartList = Object.values(cart) as Array<{ item: MenuItem; qty: number; note?: string }>;
  const newItemsTotal: number = cartList.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const existingTotal: number = existingOrder ? existingOrder.total : 0;
  const grandTotal: number = existingTotal + newItemsTotal;

  const handleSubmit = () => {
    if (cartList.length === 0) return;

    const addedItems: OrderItem[] = cartList.map((c, idx) => ({
      id: `item-${table.id}-${Date.now()}-${idx}`,
      name: c.item.name,
      desc: c.note || c.item.desc,
      qty: c.qty,
      price: c.item.price * c.qty,
      category: c.item.category,
    }));

    onSaveOrder(table.id, addedItems, generalNotes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ffe2d8] w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="bg-[#fff1ec] px-6 py-4 border-b border-[#ffe2d8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dc2626] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#2a170f]">
                  {existingOrder ? `Добавление в чек Стола №${table.id}` : `Новый заказ на Стол №${table.id}`}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffe2d8] text-xs font-black text-[#dc2626]">
                  Стол №{table.id}
                </span>
              </div>
              <p className="text-xs text-[#5c403c]">
                {table.zone === 'main' ? 'Основной зал' : 'Терраса'} · {table.seats} места ·{' '}
                {existingOrder ? `Текущий чек #${existingOrder.id}` : 'Свободен для нового чека'}
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

        {/* Content split in 2 columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Menu catalog */}
          <div className="flex-1 flex flex-col p-4 sm:p-5 border-b md:border-b-0 md:border-r border-[#ffe2d8] overflow-y-auto">
            {/* Automatic Table Info Banner (No dropdown, No waiter/pos/qr toggle) */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-[#fff8f6] p-3 rounded-xl border border-[#ffe2d8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ffe2d8] text-[#dc2626] font-black text-sm flex items-center justify-center">
                  №{table.id}
                </div>
                <div>
                  <div className="text-xs font-black text-[#2a170f]">
                    Стол №{table.id} ({table.zone === 'main' ? 'Зал' : 'Терраса'}, {table.seats}м)
                  </div>
                  <div className="text-[11px] text-[#5c403c]">
                    {existingOrder
                      ? `Есть активный чек на ${formatMoney(existingOrder.total)} • Заказ запишется на этот стол`
                      : 'Стол свободен • Все выбранные позиции запишутся на этот стол'}
                  </div>
                </div>
              </div>

              {existingOrder && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#5c403c] block">В чеке стола:</span>
                  <span className="text-xs font-black text-[#dc2626]">{formatMoney(existingOrder.total)}</span>
                </div>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === c.id
                      ? 'bg-[#dc2626] text-white shadow-xs'
                      : 'bg-[#fff1ec] text-[#5c403c] hover:text-[#2a170f]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => {
                const inCart = cart[item.id];
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#fff8f6] border border-[#ffe2d8] flex flex-col justify-between hover:border-[#dc2626]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-[#2a170f] leading-snug">{item.name}</h4>
                        {item.isFresh && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#7cf994] text-[#007230] text-[9px] font-bold">
                            Свежее
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5c403c] line-clamp-1 mb-2">{item.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#ffe2d8]/60 mt-1">
                      <span className="text-xs font-extrabold text-[#dc2626]">{formatMoney(item.price)}</span>

                      {inCart ? (
                        <div className="flex items-center gap-1 bg-[#ffe2d8] rounded-full p-0.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-5 h-5 rounded-full bg-white text-[#dc2626] text-xs font-bold flex items-center justify-center shadow-2xs hover:bg-[#dc2626] hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-[#2a170f] w-5 text-center">{inCart.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(item)}
                            className="w-5 h-5 rounded-full bg-[#dc2626] text-white text-xs font-bold flex items-center justify-center shadow-2xs hover:bg-[#b70011] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddItem(item)}
                          disabled={!item.isAvailable}
                          className="px-3 py-1 rounded-full bg-[#dc2626] hover:bg-[#b70011] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>{item.isAvailable ? 'Добавить' : 'Стоп'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cart and Confirmation */}
          <div className="w-full md:w-84 bg-[#fff8f6] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ffe2d8]">
                <h3 className="text-sm font-black text-[#2a170f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#dc2626]">receipt_long</span>
                  <span>Чек Стола №{table.id}</span>
                </h3>
                <span className="text-xs font-black text-[#dc2626] bg-[#ffe2d8] px-2.5 py-0.5 rounded-full">
                  Стол №{table.id}
                </span>
              </div>

              {/* Show Existing Items on this table if active order exists */}
              {existingOrder && existingOrder.items.length > 0 && (
                <div className="flex flex-col gap-1.5 pb-2 border-b border-[#ffe2d8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#5c403c] uppercase tracking-wider">
                      Уже в заказе стола ({existingOrder.items.length}):
                    </span>
                    <span className="text-xs font-black text-[#5c403c]">
                      {formatMoney(existingTotal)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                    {existingOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white/70 border border-[#ffe2d8] text-xs"
                      >
                        <div className="flex items-center gap-1.5 flex-1 pr-2 truncate">
                          <span className="text-[10px] font-bold text-[#dc2626] bg-[#ffe2d8] px-1.5 py-0.2 rounded-md">
                            {item.qty}×
                          </span>
                          <span className="text-[#2a170f] font-medium truncate">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#2a170f] whitespace-nowrap">
                          {formatMoney(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly added items in this session */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#2a170f] uppercase tracking-wider">
                    {existingOrder ? 'Новые позиции к добавлению:' : 'Позиции нового заказа:'}
                  </span>
                  {newItemsTotal > 0 && (
                    <span className="text-xs font-black text-[#006e2d]">
                      +{formatMoney(newItemsTotal)}
                    </span>
                  )}
                </div>

                {cartList.length === 0 ? (
                  <div className="py-6 text-center text-[#916f6b] bg-white/50 rounded-xl border border-dashed border-[#ffe2d8] p-4">
                    <span className="material-symbols-outlined text-[28px] text-[#e6bdb8] mb-1">
                      add_shopping_cart
                    </span>
                    <p className="text-xs font-bold text-[#5c403c]">
                      {existingOrder
                        ? 'Выберите новые напитки или закуски слева'
                        : 'В чеке пока нет позиций'}
                    </p>
                    <p className="text-[10px] text-[#916f6b] mt-0.5">
                      Они запишутся в заказ именно на Стол №{table.id}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {cartList.map(({ item, qty }) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#ffe2d8] shadow-2xs"
                      >
                        <div className="flex-1 pr-2">
                          <div className="text-xs font-bold text-[#2a170f] leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-[#916f6b]">
                            {formatMoney(item.price)} / шт
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-5 h-5 rounded-full bg-[#ffe2d8] text-[#dc2626] text-xs font-bold flex items-center justify-center hover:bg-[#dc2626] hover:text-white transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-[#2a170f] w-4 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(item)}
                            className="w-5 h-5 rounded-full bg-[#dc2626] text-white text-xs font-bold flex items-center justify-center hover:bg-[#b70011] transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-xs font-bold text-[#2a170f] w-18 text-right">
                          {formatMoney(item.price * qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Note */}
              <div className="pt-1">
                <label className="text-[11px] font-bold text-[#5c403c] block mb-1">
                  Комментарий (пожелания гостя):
                </label>
                <input
                  type="text"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Например: без сахара, лед отдельно..."
                  className="w-full bg-white border border-[#ffe2d8] rounded-xl px-3 py-1.5 text-xs text-[#2a170f] placeholder-[#916f6b] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 font-medium"
                />
              </div>
            </div>

            {/* Bottom calculation & Submit */}
            <div className="pt-3 border-t border-[#ffe2d8] flex flex-col gap-2.5">
              {existingOrder ? (
                <div className="flex flex-col gap-1 bg-[#fff1ec] p-2.5 rounded-xl border border-[#ffe2d8]">
                  <div className="flex justify-between text-xs text-[#5c403c]">
                    <span>Ранее в заказе:</span>
                    <span className="font-bold text-[#2a170f]">{formatMoney(existingTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#006e2d]">
                    <span>Новые позиции:</span>
                    <span className="font-bold">+{formatMoney(newItemsTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#ffe2d8] mt-0.5">
                    <span className="text-xs font-black text-[#2a170f]">Итого по столу:</span>
                    <span className="text-lg font-black text-[#dc2626]">{formatMoney(grandTotal)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5c403c]">Итого к оплате:</span>
                  <span className="text-xl font-black text-[#dc2626]">{formatMoney(newItemsTotal)}</span>
                </div>
              )}

              <button
                id="btn-submit-new-order"
                type="button"
                disabled={cartList.length === 0}
                onClick={handleSubmit}
                className="w-full py-3 px-4 rounded-full bg-[#dc2626] hover:bg-[#b70011] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>
                  {existingOrder
                    ? `Записать в чек Стола №${table.id} (+${formatMoney(newItemsTotal)})`
                    : `Создать заказ на Стол №${table.id} (${formatMoney(newItemsTotal)})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
