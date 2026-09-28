import React, { useState } from 'react';
import { Order, ViewMode } from '../types';
import { formatMoney } from '../utils/format';

interface OrdersListProps {
  orders: Record<string, Order>;
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
}

type OrderFilter = 'all' | 'new' | 'cooking' | 'paid';

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  viewMode,
  onViewModeChange,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ordersArray = (Object.values(orders) as Order[]).sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
  );

  const countNew = ordersArray.filter((o) => o.status === 'new').length;
  const countCooking = ordersArray.filter((o) => o.status === 'cooking').length;
  const countPaid = ordersArray.filter((o) => o.status === 'paid' || o.status === 'ready').length;

  const filteredOrders = ordersArray.filter((order) => {
    // Filter by tab
    if (filter === 'new' && order.status !== 'new') return false;
    if (filter === 'cooking' && order.status !== 'cooking') return false;
    if (filter === 'paid' && order.status !== 'paid' && order.status !== 'ready') return false;

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.includes(q);
      const matchTable = String(order.tableId).includes(q);
      const matchItems = order.items.some((i) => i.name.toLowerCase().includes(q));
      const matchSource = order.sourceLabel.toLowerCase().includes(q);
      return matchId || matchTable || matchItems || matchSource;
    }

    return true;
  });

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mode View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-[#fff1ec] p-1 rounded-full border border-[#ffe2d8]">
          <button
            id="orders-view-list-toggle"
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-1.5 rounded-full transition-all text-sm font-bold flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>Вид: Список заказов</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-xs font-semibold">
              {ordersArray.length}
            </span>
          </button>

          <button
            id="orders-view-floor-toggle"
            type="button"
            onClick={() => onViewModeChange('floor')}
            className={`px-4 py-1.5 rounded-full transition-all text-sm font-bold flex items-center gap-1.5 ${
              viewMode === 'floor'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
            <span>Карта столов (30)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[#5c403c] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#006e2d] animate-pulse" />
          <span>Автообновление заказов: каждые 15 сек</span>
        </div>
      </div>

      {/* Header & Status Filter Bar Card */}
      <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-sm border border-[#ffe2d8]">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-[#2a170f]">Текущие заказы</h1>
            <span className="px-2.5 py-1 rounded-full bg-[#ffe2d8] text-[#5c403c] text-xs font-semibold">
              {ordersArray.length} активных
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefreshClick}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] transition-all ${
                isRefreshing ? 'animate-spin text-[#dc2626]' : ''
              }`}
              title="Обновить список"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                isSearchOpen
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f]'
              }`}
              title="Поиск заказа"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по номеру заказа, столу или блюду..."
              className="w-full bg-[#fff8f6] border border-[#e6bdb8] rounded-full px-4 py-2 text-sm text-[#2a170f] placeholder-[#916f6b] focus:outline-hidden focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#916f6b] hover:text-[#2a170f]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Order Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'bg-[#fff1ec] text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            Все ({ordersArray.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('new')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === 'new'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'bg-[#fff1ec] text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            Новые ({countNew})
          </button>
          <button
            type="button"
            onClick={() => setFilter('cooking')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === 'cooking'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'bg-[#fff1ec] text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            Готовятся ({countCooking})
          </button>
          <button
            type="button"
            onClick={() => setFilter('paid')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === 'paid'
                ? 'bg-[#dc2626] text-white shadow-sm'
                : 'bg-[#fff1ec] text-[#5c403c] hover:text-[#2a170f]'
            }`}
          >
            К оплате / Оплачены ({countPaid})
          </button>
        </div>
      </div>

      {/* Orders Stack */}
      <div className="flex flex-col gap-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center border border-[#ffe2d8] text-[#916f6b]">
            <span className="material-symbols-outlined text-[36px] text-[#e6bdb8] mb-2">
              receipt
            </span>
            <p className="text-sm font-medium">Нет заказов, соответствующих фильтру</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const itemsSummary = order.items
              .map((i) => `${i.name} × ${i.qty}`)
              .join(', ');

            return (
              <article
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`order-card cursor-pointer p-4 rounded-xl transition-all duration-200 bg-white border border-[#ffe2d8] relative ${
                  isSelected
                    ? 'shadow-md ring-2 ring-[#dc2626]'
                    : 'shadow-xs hover:shadow-md hover:bg-[#fff8f6]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl font-bold text-[#2a170f]">#{order.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffe2d8] text-xs font-bold text-[#2a170f]">
                      Стол {order.tableId}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b70011]">
                      {order.status === 'new' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-ping" />
                      )}
                      <span>{order.time} ({order.timeAgo})</span>
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'new'
                        ? 'bg-[#dc2626] text-white shadow-xs'
                        : order.status === 'cooking'
                        ? 'bg-[#412b22] text-[#ffede7]'
                        : order.status === 'paid'
                        ? 'bg-[#7cf994] text-[#007230]'
                        : 'bg-[#ffdbcd] text-[#2a170f]'
                    }`}
                  >
                    {order.statusLabel}
                  </span>
                </div>

                <p className="text-sm text-[#5c403c] mb-2 line-clamp-1 font-normal">
                  {itemsSummary}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#ffe9e2] text-[#2a170f]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5c403c]">
                    <span className="material-symbols-outlined text-[16px]">
                      {order.source === 'qr' ? 'point_of_sale' : 'person'}
                    </span>
                    <span>{order.sourceLabel}</span>
                  </div>
                  <span
                    className={`text-base sm:text-lg font-extrabold ${
                      order.status === 'new' ? 'text-[#dc2626]' : 'text-[#2a170f]'
                    }`}
                  >
                    {formatMoney(order.total)}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
