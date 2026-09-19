import { useState, useEffect } from 'react';
import { ActiveTab, ViewMode, Table, Order, MenuItem, OrderItem } from './types';
import { INITIAL_TABLES, INITIAL_ORDERS, INITIAL_MENU_ITEMS } from './data/mockData';
import { Header } from './components/Header';
import { FloorMap } from './components/FloorMap';
import { OrdersList } from './components/OrdersList';
import { OrderInspector } from './components/OrderInspector';
import { MenuSettings } from './components/MenuSettings';
import { PaymentModal } from './components/PaymentModal';
import { NewOrderModal } from './components/NewOrderModal';
import { TransferModal } from './components/TransferModal';
import { ConfirmFreeTableModal } from './components/ConfirmFreeTableModal';
import { PinModal } from './components/PinModal';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { formatMoney } from './utils/format';

export interface AdminAppProps {
  onLogout?: () => void;
}

export default function App({ onLogout }: AdminAppProps = {}) {
  // Navigation & Views
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
  const [viewMode, setViewMode] = useState<ViewMode>('floor');

  // Core POS State
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Record<string, Order>>(INITIAL_ORDERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);

  // Selected table & order (defaults to Table 7 and Order 2048 from mockup)
  const [selectedTableId, setSelectedTableId] = useState<number | null>(7);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('2048');

  // Admin PIN Protection for Menu Settings
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem('pos_admin_pin') || '2841';
    } catch {
      return '2841';
    }
  });

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    try {
      localStorage.setItem('pos_admin_pin', newPin);
    } catch {
      // ignore
    }
    addToast('success', 'PIN-код обновлен', `Новый код доступа: ${newPin}`);
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setIsPinPromptOpen(true);
    addToast('info', 'Сессия заблокирована', 'Введите PIN-код для разблокировки');
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'menu-settings') {
      if (!isAdminUnlocked) {
        setIsPinPromptOpen(true);
        return;
      }
    } else {
      // Leaving Menu Settings locks access again so password is requested every time
      setIsAdminUnlocked(false);
    }
    setActiveTab(tab);
  };

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrderDefaultTable, setNewOrderDefaultTable] = useState<number | undefined>(undefined);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [confirmFreeTable, setConfirmFreeTable] = useState<{ table: Table; order: Order | null } | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeOrdersCount = Object.keys(orders).length;

  // Currently inspected order & table
  const currentTable = selectedTableId ? tables.find((t) => t.id === selectedTableId) || null : null;
  const currentOrder = selectedOrderId
    ? orders[selectedOrderId] || null
    : currentTable?.currentOrderId
    ? orders[currentTable.currentOrderId] || null
    : null;

  // Auto-refresh simulation for orders ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          const ord = updated[id];
          if (ord && ord.createdAt) {
            const mins = Math.max(1, Math.floor((Date.now() - ord.createdAt) / 60000));
            updated[id] = {
              ...ord,
              timeAgo: `${mins} мин назад`,
            };
          }
        });
        return updated;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Table selection handler
  const handleSelectTable = (table: Table, order: Order | null) => {
    setSelectedTableId(table.id);
    if (order) {
      setSelectedOrderId(order.id);
    } else {
      setSelectedOrderId(null);
    }
  };

  // Order selection handler
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders[orderId];
    if (ord) {
      setSelectedTableId(ord.tableId);
    }
  };

  // Quick Action: Accept Payment
  const handleAcceptPayment = (_order: Order) => {
    setIsPaymentOpen(true);
  };

  // Payment Confirmation
  const handleConfirmPayment = (orderId: string, method: string, freeTable: boolean) => {
    const ord = orders[orderId];
    if (!ord) return;

    // Update order status
    setOrders((prev) => ({
      ...prev,
      [orderId]: {
        ...ord,
        status: 'paid',
        statusLabel: 'Оплачен',
        statusBadgeClass: 'bg-secondary-container text-on-secondary-container',
        sourceLabel:
          method === 'cash'
            ? 'Оплата: Наличные'
            : method === 'sbp'
            ? 'Оплата: Payme / Click'
            : 'Оплата: Humo / Uzcard',
      },
    }));

    // Free table if requested
    if (freeTable) {
      setTables((prev) =>
        prev.map((t) => (t.id === ord.tableId ? { ...t, currentOrderId: null } : t)),
      );
    }

    addToast(
      'success',
      `Чек #${ord.id} оплачен на сумму ${formatMoney(ord.total)}`,
      freeTable ? `Стол №${ord.tableId} успешно освобожден.` : `Стол №${ord.tableId} остался за гостями.`,
    );
  };

  // Quick Action: Mark Ready
  const handleMarkReady = (order: Order) => {
    setOrders((prev) => ({
      ...prev,
      [order.id]: {
        ...order,
        status: 'ready',
        statusLabel: 'Подан / К оплате',
        statusBadgeClass: 'bg-surface-container-highest text-on-surface',
      },
    }));
    addToast(
      'success',
      `Заказ #${order.id} готов к подаче`,
      `Блюда переданы официанту на Стол №${order.tableId}.`,
    );
  };

  // Quick Action: Transfer Table
  const handleTransfer = (_order: Order) => {
    setIsTransferOpen(true);
  };

  const handleConfirmTransfer = (orderId: string, fromTableId: number, toTableId: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === fromTableId) return { ...t, currentOrderId: null };
        if (t.id === toTableId) return { ...t, currentOrderId: orderId };
        return t;
      }),
    );

    setOrders((prev) => {
      const ord = prev[orderId];
      if (!ord) return prev;
      return {
        ...prev,
        [orderId]: {
          ...ord,
          tableId: toTableId,
        },
      };
    });

    setSelectedTableId(toTableId);
    addToast(
      'success',
      `Гости успешно пересажены`,
      `Заказ #${orderId} перенесен со Стола ${fromTableId} на Стол ${toTableId}.`,
    );
  };

  // Quick Action: Request Free Table with Confirmation
  const handleFreeTable = (tableId: number, orderId?: string) => {
    const table = tables.find((t) => t.id === tableId) || null;
    if (!table) return;
    const order = (orderId ? orders[orderId] : null) || (table.currentOrderId ? orders[table.currentOrderId] : null) || null;
    setConfirmFreeTable({ table, order });
  };

  const handleExecuteFreeTable = (tableId: number, orderId?: string) => {
    const ord = orderId ? orders[orderId] : null;
    // Strict business rule: table can only be closed/freed after payment!
    if (ord && ord.status !== 'paid') {
      addToast(
        'warning',
        'Действие заблокировано',
        `Стол №${tableId} нельзя освободить: сначала необходимо принять оплату чека #${ord.id}!`,
      );
      return;
    }

    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, currentOrderId: null } : t)),
    );
    if (orderId) {
      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
      }
    }
    addToast('success', `Стол №${tableId} освобожден`, 'Стол переведен в статус «Свободен» и готов к приему новых гостей.');
  };

  // New Order Creation & Appending to Existing Table Order
  const handleOpenNewOrder = (tableId?: number) => {
    const targetId = tableId || selectedTableId || 1;
    setSelectedTableId(targetId);
    setNewOrderDefaultTable(targetId);
    setIsNewOrderOpen(true);
  };

  const handleSaveOrder = (tableId: number, addedItems: OrderItem[], notes?: string) => {
    const table = tables.find((t) => t.id === tableId);
    const existingOrderId = table?.currentOrderId;
    const existingOrder = existingOrderId ? orders[existingOrderId] : null;

    if (existingOrder && existingOrder.status !== 'paid') {
      // Append new items to existing order on this table
      const updatedItems = [...existingOrder.items, ...addedItems];
      const addedSum = addedItems.reduce((acc, item) => acc + item.price, 0);
      const updatedTotal = existingOrder.total + addedSum;

      setOrders((prev) => ({
        ...prev,
        [existingOrder.id]: {
          ...existingOrder,
          items: updatedItems,
          total: updatedTotal,
          timeAgo: 'Только что',
          notes: notes ? (existingOrder.notes ? `${existingOrder.notes}; ${notes}` : notes) : existingOrder.notes,
        },
      }));

      setSelectedOrderId(existingOrder.id);
      setSelectedTableId(tableId);

      addToast(
        'success',
        `Позиции добавлены в чек Стола №${tableId}`,
        `Добавлено ${addedItems.length} поз. на сумму ${formatMoney(addedSum)}. Новый итог чека: ${formatMoney(updatedTotal)}`,
      );
    } else {
      // Create new order for this table
      const newOrderId = String(Math.floor(2053 + Math.random() * 900));
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newTotal = addedItems.reduce((acc, item) => acc + item.price, 0);

      const newOrder: Order = {
        id: newOrderId,
        tableId,
        time: timeStr,
        timeAgo: 'Только что',
        status: 'new',
        statusLabel: 'Новый',
        statusBadgeClass: 'bg-primary-container text-on-primary-container',
        source: 'pos',
        sourceLabel: 'Касса',
        total: newTotal,
        items: addedItems,
        createdAt: Date.now(),
        notes,
      };

      setOrders((prev) => ({
        ...prev,
        [newOrderId]: newOrder,
      }));

      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, currentOrderId: newOrderId } : t)),
      );

      setSelectedOrderId(newOrderId);
      setSelectedTableId(tableId);

      addToast(
        'success',
        `Заказ #${newOrderId} оформлен для Стола №${tableId}`,
        `Сумма чека: ${formatMoney(newTotal)}. Отправлен в работу.`,
      );
    }
  };

  // Menu Settings Handlers
  const handleToggleMenuAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = !m.isAvailable;
          addToast(
            next ? 'success' : 'warning',
            next ? `Позиция возвращена в меню` : `Позиция отправлена в стоп-лист`,
            m.name,
          );
          return { ...m, isAvailable: next };
        }
        return m;
      }),
    );
  };

  const handleUpdateMenuPrice = (id: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          addToast('success', `Цена обновлена`, `${m.name}: ${formatMoney(newPrice)}`);
          return { ...m, price: newPrice };
        }
        return m;
      }),
    );
  };

  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `menu-custom-${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
    addToast('success', `Блюдо добавлено в меню`, newItem.name);
  };

  const handleDeleteMenuItem = (id: string) => {
    const item = menuItems.find((m) => m.id === id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    if (item) {
      addToast('info', `Позиция удалена`, item.name);
    }
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    addToast('success', `Товар обновлен`, updatedItem.name);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#2a170f]">
      {/* Top Fixed Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="w-full pt-16 flex-1 flex flex-col bg-[#ffffff]">
        {/* Tab 1: Orders & Floor Workspace */}
        {activeTab === 'orders' && (
          <div className="w-full px-4 sm:px-6 lg:px-10 py-6 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (8 cols): Floor Map or Orders List */}
              <section className="lg:col-span-8 flex flex-col gap-6">
                {viewMode === 'floor' ? (
                  <FloorMap
                    tables={tables}
                    orders={orders}
                    selectedTableId={selectedTableId}
                    onSelectTable={handleSelectTable}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onOpenNewOrderModal={handleOpenNewOrder}
                    activeOrdersCount={activeOrdersCount}
                  />
                ) : (
                  <OrdersList
                    orders={orders}
                    selectedOrderId={selectedOrderId}
                    onSelectOrder={handleSelectOrder}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onRefresh={() => {
                      addToast('info', 'Список заказов обновлен');
                    }}
                  />
                )}
              </section>

              {/* Right Column (4 cols): Order Inspector / Receipt Details */}
              <section className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
                <OrderInspector
                  order={currentOrder}
                  table={currentTable}
                  onAcceptPayment={handleAcceptPayment}
                  onMarkReady={handleMarkReady}
                  onTransfer={handleTransfer}
                  onFreeTable={handleFreeTable}
                  onOpenNewOrder={handleOpenNewOrder}
                />
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Menu Settings (Protected by Admin PIN) */}
        {activeTab === 'menu-settings' && (
          isAdminUnlocked ? (
            <MenuSettings
              menuItems={menuItems}
              onToggleAvailability={handleToggleMenuAvailability}
              onUpdatePrice={handleUpdateMenuPrice}
              onAddMenuItem={handleAddMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              adminPin={adminPin}
              onUpdatePin={handleUpdateAdminPin}
              onLockAdmin={handleLockAdmin}
              onToast={addToast}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-[#fff8f5]">
              <div className="w-16 h-16 rounded-full bg-[#ffdbcd] text-[#dc2626] flex items-center justify-center mb-4 shadow-sm border border-[#ffe2d8]">
                <span className="material-symbols-outlined text-[32px]">lock</span>
              </div>
              <h2 className="text-2xl font-black text-[#2a170f] mb-2">
                Доступ ограничен PIN-кодом
              </h2>
              <p className="text-sm font-bold text-[#5c403c] max-w-md mb-6">
                Для перехода в раздел управления меню и ценами необходимо ввести 4-значный PIN-код администратора.
              </p>
              <button
                type="button"
                onClick={() => setIsPinPromptOpen(true)}
                className="px-8 py-3.5 rounded-full bg-[#dc2626] hover:bg-[#b70011] text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">key</span>
                <span>Ввести PIN-код</span>
              </button>
            </div>
          )
        )}
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        order={currentOrder}
        table={currentTable}
        onClose={() => setIsPaymentOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />

      {(() => {
        const modalTableId = newOrderDefaultTable || selectedTableId || 1;
        const modalTable = tables.find((t) => t.id === modalTableId) || tables[0] || null;
        const modalOrder = modalTable?.currentOrderId ? orders[modalTable.currentOrderId] || null : null;

        return (
          <NewOrderModal
            isOpen={isNewOrderOpen}
            table={modalTable}
            existingOrder={modalOrder}
            menuItems={menuItems}
            onClose={() => setIsNewOrderOpen(false)}
            onSaveOrder={handleSaveOrder}
          />
        );
      })()}

      <TransferModal
        isOpen={isTransferOpen}
        order={currentOrder}
        currentTable={currentTable}
        tables={tables}
        onClose={() => setIsTransferOpen(false)}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <ConfirmFreeTableModal
        isOpen={!!confirmFreeTable}
        table={confirmFreeTable?.table || null}
        order={confirmFreeTable?.order || null}
        onClose={() => setConfirmFreeTable(null)}
        onConfirm={handleExecuteFreeTable}
        onOpenPayment={(order) => {
          setConfirmFreeTable(null);
          handleAcceptPayment(order);
        }}
      />

      {/* PIN Verification Modal for Menu Settings Access */}
      <PinModal
        isOpen={isPinPromptOpen}
        expectedPin={adminPin}
        mode="verify"
        title="Вход в настройки меню"
        subtitle="Введите 4-значный PIN-код администратора (по умолчанию 2841)"
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setIsPinPromptOpen(false);
          setActiveTab('menu-settings');
          addToast('success', 'Авторизовано', 'Доступ к настройкам меню открыт');
        }}
        onClose={() => {
          setIsPinPromptOpen(false);
          if (!isAdminUnlocked && activeTab === 'menu-settings') {
            setActiveTab('orders');
          }
        }}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
