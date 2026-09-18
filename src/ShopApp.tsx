import React, { useState } from 'react';
import { ScreenType, MenuItem, CartItem } from './types';
import { INITIAL_MENU_ITEMS } from './data/menuData';
import { MenuView } from './components/MenuView';
import { ProductDetailView } from './components/ProductDetailView';
import { OrdersView } from './components/OrdersView';
import { BottomNavBar } from './components/BottomNavBar';

export default function ShopApp() {
  // Navigation & View state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('menu');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem>(INITIAL_MENU_ITEMS[0]);
  const [tableNumber] = useState<string>('7');

  // Pending new items added to cart (waiting to be submitted to table order)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Confirmed placed order for Table 7 (matches design total of 109 000 сум: Tart x1, Croissant x1, Plombir x2)
  const [placedOrder, setPlacedOrder] = useState<CartItem[]>([
    { item: INITIAL_MENU_ITEMS[0], quantity: 1 }, // Фирменный клубничный тарт (34 000 сум)
    { item: INITIAL_MENU_ITEMS[3], quantity: 1 }, // Круассан с кремом (27 000 сум)
    { item: INITIAL_MENU_ITEMS[5], quantity: 2 }, // Пломбир с ягодами (2 x 24 000 = 48 000 сум)
  ]);

  const [orderNumber, setOrderNumber] = useState<number>(14);

  // Handle adding or updating quantity in cart
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    setCart((prevCart) => {
      if (newQty <= 0) {
        return prevCart.filter((c) => c.item.id !== itemId);
      }
      const existing = prevCart.find((c) => c.item.id === itemId);
      if (existing) {
        return prevCart.map((c) =>
          c.item.id === itemId ? { ...c, quantity: newQty } : c
        );
      }
      const menuItem = INITIAL_MENU_ITEMS.find((m) => m.id === itemId);
      if (!menuItem) return prevCart;
      return [...prevCart, { item: menuItem, quantity: newQty }];
    });
  };

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.item.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.item.id === item.id
            ? { ...c, quantity: c.quantity + quantity }
            : c
        );
      }
      return [...prevCart, { item, quantity }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((c) => c.item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Initial order submission (when table makes their first order)
  const handlePlaceInitialOrder = () => {
    if (cart.length > 0) {
      setPlacedOrder([...cart]);
      setCart([]);
      setOrderNumber((prev) => prev + 1);
    }
  };

  // Append new items to existing placed table order
  const handleAppendToOrder = () => {
    if (cart.length === 0) return;
    setPlacedOrder((prev) => {
      const updated = [...prev];
      cart.forEach((cItem) => {
        const idx = updated.findIndex((u) => u.item.id === cItem.item.id);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + cItem.quantity,
          };
        } else {
          updated.push(cItem);
        }
      });
      return updated;
    });
    setCart([]);
  };

  // Reset order for demo / testing flow
  const handleResetOrderForDemo = () => {
    setPlacedOrder([]);
    setCart([
      { item: INITIAL_MENU_ITEMS[0], quantity: 1 },
      { item: INITIAL_MENU_ITEMS[1], quantity: 1 },
    ]);
  };

  const handleSelectProduct = (item: MenuItem) => {
    setSelectedProduct(item);
    setCurrentScreen('product-detail');
  };

  // Compute active navigation tab
  const activeTab: 'menu' | 'orders' =
    currentScreen === 'menu' ? 'menu' : 'orders';

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#2a170f]">
      {/* Container sized naturally for phone and tablet screens */}
      <div className="w-full max-w-lg md:max-w-xl mx-auto min-h-screen flex flex-col relative bg-[#fff8f6]">
        {/* Render active screen */}
        <main id="app-main-container" className="flex-1 w-full flex flex-col">
          {currentScreen === 'menu' && (
            <MenuView
              items={INITIAL_MENU_ITEMS}
              cart={cart}
              onSelectProduct={handleSelectProduct}
              onUpdateQuantity={handleUpdateQuantity}
              onGoToCart={() => setCurrentScreen('orders')}
              tableNumber={tableNumber}
              hasActiveOrder={placedOrder.length > 0}
            />
          )}

          {currentScreen === 'product-detail' && (
            <ProductDetailView
              item={selectedProduct}
              onBack={() => setCurrentScreen('menu')}
              onAddToCart={handleAddToCart}
              tableNumber={tableNumber}
            />
          )}

          {(currentScreen === 'orders' || currentScreen === 'cart' || currentScreen === 'order-receipt') && (
            <OrdersView
              cart={cart}
              placedOrder={placedOrder}
              orderNumber={orderNumber}
              orderTime="17:50"
              onUpdateCartQuantity={handleUpdateQuantity}
              onRemoveCartItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onPlaceInitialOrder={handlePlaceInitialOrder}
              onAppendToOrder={handleAppendToOrder}
              onGoToMenu={() => setCurrentScreen('menu')}
              onResetOrderForDemo={handleResetOrderForDemo}
              tableNumber={tableNumber}
            />
          )}
        </main>

        {/* Bottom Navigation Bar (Visible on Menu and Orders screens) */}
        {(currentScreen === 'menu' || currentScreen === 'orders' || currentScreen === 'cart' || currentScreen === 'order-receipt') && (
          <BottomNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => setCurrentScreen(tab)}
            cartCount={cart.length}
            hasActiveOrder={placedOrder.length > 0}
          />
        )}
      </div>
    </div>
  );
}
