import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../types';
import { formatMoney, formatWithDots } from '../utils/format';
import { PinModal } from './PinModal';
import { DeleteConfirmPinModal } from './DeleteConfirmPinModal';

interface MenuSettingsProps {
  menuItems: MenuItem[];
  onToggleAvailability: (id: string) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onDeleteMenuItem: (id: string) => void;
  onUpdateMenuItem?: (item: MenuItem) => void;
  adminPin: string;
  onUpdatePin: (newPin: string) => void;
  onLockAdmin: () => void;
  onToast?: (type: 'success' | 'warning' | 'info', title: string, message?: string) => void;
}

export interface MenuCategoryItem {
  id: string;
  key: string;
  name: string;
}

const DEFAULT_CATEGORIES: MenuCategoryItem[] = [
  { id: 'cat-bakery', key: 'bakery', name: 'Круассаны' },
  { id: 'cat-coffee', key: 'coffee', name: 'Кофе' },
  { id: 'cat-gelato', key: 'gelato', name: 'Мороженое' },
];

export const MenuSettings: React.FC<MenuSettingsProps> = ({
  menuItems,
  onToggleAvailability,
  onUpdatePrice,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateMenuItem,
  adminPin,
  onUpdatePin,
  onLockAdmin,
  onToast,
}) => {
  // Categories state with persistence in localStorage
  const [categories, setCategories] = useState<MenuCategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_menu_categories');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // Save categories on change
  useEffect(() => {
    try {
      localStorage.setItem('pos_menu_categories', JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  // Inline editing state for category cards
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

  // Adding new category inline state
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Category filter: 'all' | category.key
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drawer state for Add / Edit
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('edit');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Drawer form fields
  const [formName, setFormName] = useState('');
  const [formCategoryKey, setFormCategoryKey] = useState<string>('bakery');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [formPrice, setFormPrice] = useState<number | ''>(24000);
  // Weight & Volume fields
  const [formWeightAmount, setFormWeightAmount] = useState<string>('95');
  const [formWeightUnit, setFormWeightUnit] = useState<'г' | 'мл' | 'л' | 'шт'>('г');
  const [formDesc, setFormDesc] = useState('');
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  // Image URL field
  const [formImageUrl, setFormImageUrl] = useState<string>('');

  // PIN change modal state
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

  // Protected deletion state (Category or Product) via PIN confirmation
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'category' | 'product';
    id: string;
    name: string;
    details?: string;
  } | null>(null);

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to count items per category
  const getItemCountForCategory = (catKey: string) => {
    return menuItems.filter((m) => {
      if (catKey === 'bakery') return m.category === 'bakery' || m.category === 'pastry';
      if (catKey === 'gelato') return m.category === 'gelato' || m.category === 'dessert';
      return m.category === catKey;
    }).length;
  };

  // Filtered items
  const filteredItems = menuItems.filter((item) => {
    // Category match
    if (activeCategory !== 'all') {
      if (activeCategory === 'bakery') {
        if (item.category !== 'bakery' && item.category !== 'pastry') return false;
      } else if (activeCategory === 'gelato') {
        if (item.category !== 'gelato' && item.category !== 'dessert') return false;
      } else if (item.category !== activeCategory) {
        return false;
      }
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.desc.toLowerCase().includes(q);
      const matchCat = item.categoryName.toLowerCase().includes(q);
      const matchWeight = item.weight?.toLowerCase().includes(q) || false;
      return matchName || matchDesc || matchCat || matchWeight;
    }

    return true;
  });

  // Helper to parse weight string into number & unit
  const parseWeightString = (weightStr?: string): { amount: string; unit: 'г' | 'мл' | 'л' | 'шт' } => {
    if (!weightStr) return { amount: '100', unit: 'г' };
    const trimmed = weightStr.trim();
    const digits = trimmed.replace(/\D/g, '');
    if (trimmed.includes('мл')) {
      return { amount: digits || '200', unit: 'мл' };
    }
    if (trimmed.includes('л') && !trimmed.includes('мл')) {
      return { amount: digits || '1', unit: 'л' };
    }
    if (trimmed.includes('шт')) {
      return { amount: digits || '1', unit: 'шт' };
    }
    return { amount: digits || '100', unit: 'г' };
  };

  // Open Drawer in Add mode
  const handleOpenAddDrawer = () => {
    setDrawerMode('add');
    setEditingItem(null);
    setFormName('');
    setFormCategoryKey(categories[0]?.key || 'bakery');
    setFormPrice(25000);
    setFormWeightAmount('95');
    setFormWeightUnit('г');
    setFormDesc('Свежеприготовленное блюдо по фирменному авторскому рецепту.');
    setFormIsAvailable(true);
    setFormImageUrl('');
    setIsCategoryDropdownOpen(false);
    setIsDrawerOpen(true);
  };

  // Open Drawer in Edit mode
  const handleOpenEditDrawer = (item: MenuItem) => {
    setDrawerMode('edit');
    setEditingItem(item);
    setFormName(item.name);

    // Map item category to our categories list
    const foundCat = categories.find(
      (c) =>
        c.key === item.category ||
        (c.key === 'bakery' && item.category === 'pastry') ||
        (c.key === 'gelato' && item.category === 'dessert'),
    );
    setFormCategoryKey(foundCat ? foundCat.key : item.category);

    setFormPrice(item.price);
    const parsed = parseWeightString(item.weight);
    setFormWeightAmount(parsed.amount);
    setFormWeightUnit(parsed.unit);
    setFormDesc(item.desc);
    setFormIsAvailable(item.isAvailable);
    setFormImageUrl(item.imageUrl || '');
    setIsCategoryDropdownOpen(false);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  // Save drawer changes
  const handleSaveDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const numericPrice = Number(formPrice) || 0;
    const currentCatObj = categories.find((c) => c.key === formCategoryKey);
    const categoryDisplayName = currentCatObj ? currentCatObj.name : 'Выпечка';
    const finalWeight = `${formatWithDots(formWeightAmount).trim()} ${formWeightUnit}`;

    // Default category photo fallback if user didn't specify one
    const defaultPhoto =
      formCategoryKey === 'coffee'
        ? 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80'
        : formCategoryKey === 'gelato'
        ? 'https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80';

    const chosenImageUrl = formImageUrl.trim() || defaultPhoto;

    if (drawerMode === 'add') {
      onAddMenuItem({
        name: formName.trim(),
        category: formCategoryKey,
        categoryName: categoryDisplayName,
        desc: formDesc.trim() || 'Свежеприготовленное блюдо по фирменному рецепту',
        weight: finalWeight,
        price: numericPrice,
        isAvailable: formIsAvailable,
        isFresh: formCategoryKey === 'bakery',
        imageUrl: chosenImageUrl,
      });
    } else if (editingItem) {
      if (onUpdateMenuItem) {
        onUpdateMenuItem({
          ...editingItem,
          name: formName.trim(),
          category: formCategoryKey,
          categoryName: categoryDisplayName,
          desc: formDesc.trim(),
          weight: finalWeight,
          price: numericPrice,
          isAvailable: formIsAvailable,
          imageUrl: formImageUrl.trim() || editingItem.imageUrl || defaultPhoto,
        });
      } else {
        onUpdatePrice(editingItem.id, numericPrice);
        if (editingItem.isAvailable !== formIsAvailable) {
          onToggleAvailability(editingItem.id);
        }
      }
    }

    setIsDrawerOpen(false);
  };

  // Inline Category Renaming Handlers
  const handleStartRenameCategory = (cat: MenuCategoryItem) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveCategoryName = (catId: string) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    const trimmed = editingCategoryName.trim();
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, name: trimmed } : c)),
    );
    setEditingCategoryId(null);
  };

  // Adding a new category
  const handleCreateNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    const newKey = `cat_${Date.now()}`;
    const newCat: MenuCategoryItem = {
      id: `cat-id-${Date.now()}`,
      key: newKey,
      name: trimmed,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  // Category Deletion with PIN Confirmation
  const handleRequestDeleteCategory = (catId: string, catName: string) => {
    if (categories.length <= 1) {
      if (onToast) {
        onToast(
          'warning',
          'Удаление невозможно',
          'В меню должна оставаться хотя бы одна категория товаров!',
        );
      }
      return;
    }
    const catObj = categories.find((c) => c.id === catId);
    const count = catObj ? getItemCountForCategory(catObj.key) : 0;
    const countLabel = `${count} ${count === 1 ? 'позиция' : count < 5 ? 'позиции' : 'позиций'}`;

    setPendingDelete({
      type: 'category',
      id: catId,
      name: catName,
      details: `${countLabel} в меню кассы`,
    });
  };

  // Product Deletion with PIN Confirmation
  const handleRequestDeleteProduct = (
    id: string,
    name: string,
    price?: number,
    catName?: string,
  ) => {
    const details =
      price !== undefined ? `${catName || 'Каталог'} • ${formatMoney(price)}` : undefined;
    setPendingDelete({
      type: 'product',
      id,
      name,
      details,
    });
  };

  // Execute deletion once correct PIN is verified
  const handleExecutePendingDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.type === 'category') {
      const catId = pendingDelete.id;
      const catName = pendingDelete.name;
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      if (activeCategory === catId) setActiveCategory('all');
      if (onToast) {
        onToast(
          'success',
          'Категория удалена',
          `Раздел «${catName}» успешно удален из каталога`,
        );
      }
    } else {
      const productId = pendingDelete.id;
      const productName = pendingDelete.name;
      onDeleteMenuItem(productId);
      if (isDrawerOpen && editingItem?.id === productId) {
        setIsDrawerOpen(false);
      }
      if (onToast) {
        onToast('info', 'Товар удален', `«${productName}» удален из меню кассы`);
      }
    }
    setPendingDelete(null);
  };

  const scrollToCategories = () => {
    const el = document.getElementById('categoryOrderSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentCategoryObj =
    categories.find((c) => c.key === formCategoryKey) || categories[0];

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#ffffff]">
      {/* Security Bar / PIN Status Banner */}
      <section
        id="securityBanner"
        className="w-full bg-[#fff1ec] py-2 px-4 sm:px-6 lg:px-10 flex flex-wrap items-center justify-between gap-2 shadow-xs border-b border-[#ffe2d8]"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#006e2d]/10 text-[#006e2d] px-3.5 py-1 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Режим доступа: Администратор авторизован</span>
          </div>
          <span className="text-[#5c403c] text-xs font-bold hidden sm:inline">
            Сессия активна • POS PIN #{adminPin}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btnPinSettings"
            type="button"
            onClick={() => setIsChangePinModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-white text-[#5c403c] hover:text-[#2a170f] text-xs font-bold transition-all flex items-center gap-1 shadow-xs hover:shadow-sm border border-[#ffe2d8]"
          >
            <span className="material-symbols-outlined text-[16px]">pin</span>
            <span>Сменить PIN-код</span>
          </button>

          <button
            id="btnLockAdmin"
            type="button"
            onClick={onLockAdmin}
            className="px-3.5 py-1.5 rounded-full bg-[#ffdbcd]/60 hover:bg-[#ffdbcd] text-[#b70011] text-xs font-bold transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Заблокировать</span>
          </button>
        </div>
      </section>

      {/* Main Management Workstation Container */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-7">
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[#dc2626] text-xs font-black uppercase tracking-wider">
              Каталог кассы & QR
            </span>
            <h1 className="text-3xl font-black text-[#2a170f] tracking-tight">
              Управление меню
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btnOpenCategories"
              type="button"
              onClick={scrollToCategories}
              className="px-4.5 py-2.5 rounded-full bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] text-sm font-black transition-all flex items-center gap-1.5 shadow-xs border border-[#ffe2d8]"
            >
              <span className="material-symbols-outlined text-[18px]">category</span>
              <span>Категории ({categories.length})</span>
            </button>

            <button
              id="btnAddNewProduct"
              type="button"
              onClick={handleOpenAddDrawer}
              className="px-6 py-2.5 rounded-full bg-[#dc2626] hover:bg-[#b70011] text-white text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Добавить товар</span>
            </button>
          </div>
        </div>

        {/* Search & Fast Category Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl shadow-xs border border-[#ffe2d8]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5c403c] text-[20px]">
              search
            </span>
            <input
              id="productSearchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или коду товара..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#fff1ec] text-[#2a170f] font-bold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#dc2626]/20 transition-all placeholder:text-[#5c403c]/70 placeholder:font-medium border border-transparent focus:border-[#ffe2d8]"
            />
          </div>

          {/* Quick Filter Pills (Dynamic from categories list) */}
          <div
            id="categoryFilterContainer"
            className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
          >
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`cat-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#dc2626] text-white shadow-xs'
                  : 'bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] hover:text-[#2a170f]'
              }`}
            >
              Все ({menuItems.length})
            </button>

            {categories.map((cat) => {
              const count = getItemCountForCategory(cat.key);
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`cat-filter-btn px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#dc2626] text-white shadow-xs'
                      : 'bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#5c403c] hover:text-[#2a170f]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Management Table / Desktop Cards */}
        <div className="w-full bg-white rounded-2xl shadow-xs border border-[#ffe2d8] overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#fff1ec]/70 text-xs font-black text-[#5c403c] uppercase tracking-wider border-b border-[#ffe2d8]">
            <div className="col-span-5">Товар и состав</div>
            <div className="col-span-2">Категория</div>
            <div className="col-span-2">Стоимость</div>
            <div className="col-span-2">Статус в меню</div>
            <div className="col-span-1 text-right">Действия</div>
          </div>

          {/* Product List / Rows */}
          <div id="productList" className="flex flex-col divide-y divide-[#ffe9e2]">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-[#5c403c] flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[36px] text-[#e6bdb8]">
                  search_off
                </span>
                <span className="font-bold text-sm">Позиций не найдено</span>
                <span className="text-xs text-[#916f6b] font-medium">
                  Попробуйте изменить поисковый запрос или фильтр
                </span>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isBakery = item.category === 'bakery' || item.category === 'pastry';
                const isCoffee = item.category === 'coffee';
                const isGelato = item.category === 'gelato' || item.category === 'dessert';

                const categoryBadgeClass = isBakery
                  ? 'bg-[#ffdbcd] text-[#5c403c]'
                  : isCoffee
                  ? 'bg-[#ffdcc3] text-[#6e3900]'
                  : isGelato
                  ? 'bg-[#7ffc97]/40 text-[#005320]'
                  : 'bg-[#ffe9e2] text-[#5c403c]';

                return (
                  <div
                    key={item.id}
                    className="product-row grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-4 items-center hover:bg-[#fff1ec]/40 transition-colors"
                  >
                    {/* Item Image + Title + Subtitle */}
                    <div className="col-span-5 flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#ffe9e2] border border-[#ffe2d8] shadow-inner">
                        <img
                          src={
                            item.imageUrl ||
                            (isCoffee
                              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2-gej6yLTLSvn_ig4Zm4vIgbfGn2XMFRFQmIbit3O-lsUOha3ktDM-G1aRiR8ftlSNnjwLen7HTT7ZgW24YL0tE0na7V4mX_CYo9XB1M1ryN27ZdCV1TyPr2Iga84go6Sl9w2ffHnvxB2gM3RKqe72Yf1HRK1iRmZB3aDDEaqsOnJ4Xn__StVo9OKpk2sNHQWX4Hu3chymu4zK_mXuhAL2OWDQ6G1-FAU3F3PPxghEvrikPpKgIqF9w'
                              : isGelato
                              ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOq1K-vBKi4_r-yusGR2f3E1kJ-H90DjP7EWEwBr9AJGDnSJ5USwg9QKq7i42f73PsL6GPOL0JN1UwyWakZ60nUx1VmYu3TK1cu2rvTFHJRuf4aZw5-0AgsbK_OQU7I_-mz4l6Et2Saa54U4zfXW6hgxr1gHtn0VFRlyuFv96bg4DyTIGUHU0CxzYbPpVJFoooyRgLCaXGSF8XQkSHLG_RHQU5F10AJOwrMZWnmYm8hdQoOH-ILVpySA'
                              : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuKCkHWrS5NsgUvTLTZ7P1UaQK5lbD-tgCusqaYGoBTqzgPE5muSHYO8WHdWgz7o8--_dS9Dob8_4irORH4iDxnYPBG-zCkh5x-_DgnQAo375c3bQEShDgAnh2S-4b4sSXglXDQHgfpIUIBbrqQ9ZwWotqFsL_tMSB87UlI_xIV3pt1Vm9VigXzL2po2NzyrHTaxWP4XtPKoKBzHd4b_7nPWSQge7CdZOFJvCMAW4bFeI4mzsPdgS-xw')
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base text-[#2a170f] truncate">
                          {item.name}
                        </span>
                        <span className="text-xs text-[#5c403c] font-medium truncate mt-0.5">
                          {item.desc}
                          {item.weight ? ` • ${item.weight}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${categoryBadgeClass}`}
                      >
                        {item.categoryName}
                      </span>
                    </div>

                    {/* Price in Sums (сум) with Edit Trigger */}
                    <div className="col-span-2 flex items-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDrawer(item)}
                        className="inline-flex items-center gap-1.5 group cursor-pointer bg-[#fff1ec] px-3.5 py-1.5 rounded-xl hover:bg-[#ffe9e2] transition-all border border-[#ffe2d8]"
                        title="Нажмите для изменения цены"
                      >
                        <span className="font-black text-base text-[#2a170f]">
                          {formatMoney(item.price)}
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-[#5c403c] group-hover:text-[#dc2626] transition-colors">
                          edit
                        </span>
                      </button>
                    </div>

                    {/* Availability Status Toggle */}
                    <div className="col-span-2 flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={() => onToggleAvailability(item.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#ffdbcd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006e2d] shadow-inner" />
                        <span
                          className={`ml-2.5 text-xs font-black transition-colors ${
                            item.isAvailable ? 'text-[#006e2d]' : 'text-[#5c403c]/70'
                          }`}
                        >
                          {item.isAvailable ? 'Активен' : 'В стоп-листе'}
                        </span>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDrawer(item)}
                        className="p-2 rounded-full hover:bg-[#fff1ec] text-[#5c403c] hover:text-[#2a170f] transition-all"
                        title="Редактировать карточку"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRequestDeleteProduct(
                            item.id,
                            item.name,
                            item.price,
                            item.categoryName,
                          )
                        }
                        className="p-2 rounded-full hover:bg-[#ffdad6] text-[#5c403c] hover:text-[#b70011] transition-all cursor-pointer"
                        title="Удалить товар (требуется PIN)"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Order & Structure Section */}
        <div
          id="categoryOrderSection"
          className="w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-[#ffe2d8] flex flex-col gap-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-[#2a170f]">
                Порядок категорий на кассе
              </h2>
              <p className="text-xs font-bold text-[#5c403c] mt-0.5">
                Нажмите на карандаш для быстрого переименования раздела прямо на месте
              </p>
            </div>

            <button
              id="btnAddCategoryInline"
              type="button"
              onClick={() => setIsAddingCategory((prev) => !prev)}
              className="self-start sm:self-center px-4.5 py-2 rounded-full bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#b70011] text-xs font-black transition-all flex items-center gap-1.5 border border-[#ffe2d8] shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>{isAddingCategory ? 'Закрыть ввод' : 'Новая категория'}</span>
            </button>
          </div>

          {/* Inline Add Category Form */}
          {isAddingCategory && (
            <div className="bg-[#fff1ec] p-4 rounded-xl border-2 border-[#dc2626]/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in shadow-xs">
              <div className="flex-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#dc2626] text-[22px]">
                  category
                </span>
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNewCategory();
                    if (e.key === 'Escape') setIsAddingCategory(false);
                  }}
                  placeholder="Введите название новой категории (напр. Завтраки)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-[#2a170f] font-bold text-sm border border-[#ffe2d8] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b70011] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Создать</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-4 py-2.5 rounded-xl bg-white text-[#5c403c] font-bold text-xs hover:bg-[#ffe9e2] transition-colors border border-[#ffe2d8]"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Category Cards Grid with Inline Renaming */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = getItemCountForCategory(cat.key);
              const isEditingThis = editingCategoryId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 bg-[#fff1ec] rounded-xl group hover:bg-[#ffe9e2] transition-all border border-[#ffe2d8] shadow-2xs"
                >
                  {isEditingThis ? (
                    /* Inline rename input right inside the category card! */
                    <div className="flex items-center gap-2 w-full animate-fade-in">
                      <input
                        type="text"
                        autoFocus
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCategoryName(cat.id);
                          if (e.key === 'Escape') setEditingCategoryId(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white text-[#2a170f] font-black text-sm border-2 border-[#dc2626] focus:outline-none w-full shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCategoryName(cat.id)}
                        className="p-1.5 rounded-lg bg-[#006e2d] text-white hover:bg-[#005320] transition-colors shadow-xs"
                        title="Сохранить название"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryId(null)}
                        className="p-1.5 rounded-lg bg-[#ffdad6] text-[#b70011] hover:bg-[#ffb4ab] transition-colors"
                        title="Отмена"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#5c403c] cursor-grab text-[20px]">
                          drag_indicator
                        </span>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-[#2a170f]">
                            {cat.name}
                          </span>
                          <span className="text-xs font-bold text-[#5c403c]">
                            {count} {count === 1 ? 'позиция' : count < 5 ? 'позиции' : 'позиций'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartRenameCategory(cat)}
                          className="p-1.5 rounded-lg hover:bg-white text-[#5c403c] hover:text-[#2a170f] transition-all border border-transparent hover:border-[#ffe2d8] shadow-2xs"
                          title="Редактировать название прямо здесь"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRequestDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#5c403c] hover:text-[#b70011] transition-all cursor-pointer"
                          title={
                            categories.length > 1
                              ? 'Удалить категорию (требуется PIN)'
                              : 'В меню должна оставаться хотя бы одна категория'
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer: Product Add / Edit - EXPANDED SIZE & BOLD TYPOGRAPHY */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#2a170f]/50 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          <div className="relative w-screen max-w-xl sm:max-w-2xl bg-white shadow-2xl flex flex-col z-10 border-l border-[#ffe2d8] transform transition-transform duration-300 ease-in-out">
            {/* Drawer Header */}
            <div className="p-6 sm:p-7 bg-[#fff1ec] flex items-center justify-between border-b border-[#ffe2d8]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[#dc2626] text-xs font-black uppercase tracking-wider">
                  Параметры карточки
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#2a170f] tracking-tight">
                  {drawerMode === 'add'
                    ? 'Добавление нового товара'
                    : `Редактирование: ${formName || 'товара'}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="p-2.5 rounded-full hover:bg-[#ffe9e2] text-[#5c403c] hover:text-[#2a170f] transition-colors"
              >
                <span className="material-symbols-outlined text-[26px]">close</span>
              </button>
            </div>

            {/* Drawer Body Form */}
            <form
              onSubmit={handleSaveDrawer}
              className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6"
            >
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-[#2a170f] uppercase tracking-wide">
                  Название товара *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="напр. Круассан с шоколадом"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#fff1ec] text-[#2a170f] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 border-2 border-[#ffe2d8] focus:bg-white transition-all"
                />
              </div>

              {/* BEAUTIFUL CUSTOM DROPDOWN for Categories */}
              <div className="flex flex-col gap-2 relative" ref={categoryDropdownRef}>
                <label className="text-sm font-black text-[#2a170f] uppercase tracking-wide">
                  Категория меню *
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] font-bold text-base border-2 border-[#ffe2d8] flex items-center justify-between shadow-xs transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#dc2626] text-[20px]">
                      category
                    </span>
                    <span className="font-bold text-[#2a170f]">
                      {currentCategoryObj.name}
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[#5c403c] transition-transform duration-200 ${
                      isCategoryDropdownOpen ? 'rotate-180 text-[#dc2626]' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {/* Dropdown Popover Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border-2 border-[#ffe2d8] p-2 flex flex-col gap-1 overflow-hidden animate-fade-in">
                    {categories.map((cat) => {
                      const isSelected = formCategoryKey === cat.key;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setFormCategoryKey(cat.key);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#dc2626] text-white shadow-xs'
                              : 'text-[#2a170f] hover:bg-[#fff1ec]'
                          }`}
                        >
                          <span className="font-bold">{cat.name}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-white text-[18px]">
                              check
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price & Weight/Volume Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Price in Sums (Auto-formatted with dots) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-[#2a170f] uppercase tracking-wide">
                    Цена (сум) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formPrice === '' ? '' : formatWithDots(formPrice)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setFormPrice(digits ? Number(digits) : '');
                      }}
                      placeholder="напр. 25.000"
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#fff1ec] text-[#2a170f] font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 border-2 border-[#ffe2d8] focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#5c403c] pointer-events-none">
                      сум
                    </span>
                  </div>
                </div>

                {/* Weight / Volume with Unit Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-[#2a170f] uppercase tracking-wide">
                    Вес / Объем *
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Amount Input with dots auto-formatting */}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formWeightAmount === '' ? '' : formatWithDots(formWeightAmount)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setFormWeightAmount(digits);
                      }}
                      placeholder="напр. 95"
                      className="w-28 px-3.5 py-3.5 rounded-2xl bg-[#fff1ec] text-[#2a170f] font-black text-lg focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 border-2 border-[#ffe2d8] focus:bg-white transition-all"
                    />

                    {/* Unit Selector Toggle Pills */}
                    <div className="flex-1 flex items-center bg-[#fff1ec] p-1 rounded-2xl border-2 border-[#ffe2d8] gap-1">
                      {(['г', 'мл', 'л', 'шт'] as const).map((unit) => {
                        const isSelected = formWeightUnit === unit;
                        return (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setFormWeightUnit(unit)}
                            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                              isSelected
                                ? 'bg-[#dc2626] text-white shadow-xs'
                                : 'text-[#5c403c] hover:text-[#2a170f] hover:bg-[#ffe9e2]'
                            }`}
                          >
                            {unit}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo / Image URL Input & Large Preview Frame */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-[#2a170f] uppercase tracking-wide">
                    Фотография блюда
                  </label>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="text-xs text-[#b70011] hover:underline font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>Удалить фото</span>
                    </button>
                  )}
                </div>

                {/* Large Photo Preview Frame */}
                <div className="w-full h-48 sm:h-56 rounded-2xl bg-[#fff1ec] border-2 border-[#ffe2d8] overflow-hidden relative flex items-center justify-center shadow-xs">
                  {formImageUrl ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={formImageUrl}
                        alt="Превью товара"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                        <span className="text-white text-xs font-bold bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                          Фото будет отображаться в карточке меню
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#006e2d] text-xs font-black px-2.5 py-1 rounded-full shadow-xs border border-[#ffe2d8] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Фото загружено</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 gap-2 text-[#916f6b]">
                      <div className="w-14 h-14 rounded-full bg-white/80 border border-[#ffe2d8] flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[#dc2626] text-[32px]">
                          add_photo_alternate
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-[#2a170f]">
                          Здесь отобразится фотография блюда
                        </span>
                        <span className="text-xs font-medium text-[#5c403c]">
                          Вставьте ссылку на изображение или выберите файл с устройства
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Controls: URL and File upload */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#916f6b] text-[18px]">
                      link
                    </span>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Вставьте ссылку на фото (https://...)"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#fff1ec] text-[#2a170f] font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 border-2 border-[#ffe2d8] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Local file picker */}
                  <label className="cursor-pointer px-4 py-3 rounded-2xl bg-white hover:bg-[#fff1ec] border-2 border-[#ffe2d8] text-[#2a170f] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[#dc2626] text-[18px]">
                      upload_file
                    </span>
                    <span>Выбрать файл</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setFormImageUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-[#2a170f] uppercase tracking-wide">
                  Описание для кассы и чека
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Состав, особенности подачи, информация об аллергенах..."
                  className="w-full p-4 rounded-2xl bg-[#fff1ec] text-[#2a170f] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/30 resize-none border-2 border-[#ffe2d8] focus:bg-white transition-all"
                />
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-5 bg-[#fff1ec] rounded-2xl border-2 border-[#ffe2d8]">
                <div className="flex flex-col">
                  <span className="font-black text-base text-[#2a170f]">
                    Доступен для заказа
                  </span>
                  <span className="text-xs font-bold text-[#5c403c]">
                    Показывать позицию на кассе и разрешать добавление в заказ
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-13 h-7 bg-[#ffdbcd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-[#006e2d] shadow-inner" />
                </label>
              </div>

              {/* Drawer Footer Buttons */}
              <div className="mt-auto pt-6 border-t border-[#ffe2d8] flex items-center justify-between gap-3.5">
                {drawerMode === 'edit' && editingItem ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleRequestDeleteProduct(
                        editingItem.id,
                        editingItem.name,
                        editingItem.price,
                        editingItem.categoryName,
                      )
                    }
                    className="px-4 py-3 rounded-full bg-[#ffdad6]/70 hover:bg-[#ffdad6] text-[#b70011] font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#ffb4ab]"
                    title="Удалить товар из меню (требуется PIN)"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    <span>Удалить товар</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-6 py-3.5 rounded-full bg-[#fff1ec] hover:bg-[#ffe9e2] text-[#2a170f] font-black text-sm transition-all border border-[#ffe2d8]"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-full bg-[#dc2626] hover:bg-[#b70011] text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    <span>Сохранить изменения</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Change Modal */}
      <PinModal
        isOpen={isChangePinModalOpen}
        expectedPin={adminPin}
        mode="change"
        title="Смена PIN-кода"
        subtitle="Задайте новый 4-значный PIN-код администратора для защиты меню"
        onSuccess={(newPin) => {
          if (newPin) {
            onUpdatePin(newPin);
            setIsChangePinModalOpen(false);
          }
        }}
        onClose={() => setIsChangePinModalOpen(false)}
      />

      {/* Protected Deletion Confirmation Modal via PIN */}
      <DeleteConfirmPinModal
        isOpen={!!pendingDelete}
        expectedPin={adminPin}
        itemType={pendingDelete?.type || 'category'}
        itemName={pendingDelete?.name || ''}
        itemDetails={pendingDelete?.details}
        warningText={
          pendingDelete?.type === 'category'
            ? `Вы собираетесь удалить категорию «${pendingDelete.name}». Для подтверждения введите 4-значный PIN-код администратора.`
            : `Вы собираетесь удалить товар «${pendingDelete?.name}» из кассового каталога. Для подтверждения введите 4-значный PIN-код администратора.`
        }
        onConfirm={handleExecutePendingDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};
