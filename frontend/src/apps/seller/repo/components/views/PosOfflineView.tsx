import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  QrCode,
  Banknote,
  Receipt,
  Store,
  DollarSign,
  TrendingUp,
  ScanLine,
  Filter,
  Share2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Product, Order, OrderItem, OrderStatus } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { ThermalReceiptModal } from '../modals/ThermalReceiptModal';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface PosOfflineViewProps {
  products: Product[];
  orders: Order[];
  onAddNewOfflineOrder: (newOrder: Order) => void;
  onDeductStock: (sku: string, qty: number) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export const PosOfflineView: React.FC<PosOfflineViewProps> = ({
  products,
  orders,
  onAddNewOfflineOrder,
  onDeductStock,
}) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  // Navigation tab state inside Offline POS view
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'history'>('register');

  // Real store branding for the printed receipt (replaces hardcoded fake
  // "Bizora Boutique" name/address that used to appear on every printout).
  const [storeSettings, setStoreSettings] = useState<{ name: string; address: string; phone: string; qrisUrl: string | null }>({
    name: 'Toko Saya',
    address: '',
    phone: '',
    qrisUrl: null,
  });
  useEffect(() => {
    api.get('/retail/settings')
      .then((res) => {
        const s = res.data || {};
        setStoreSettings({
          name: s.store_name || 'Toko Saya',
          address: s.store_address || '',
          phone: s.store_phone || '',
          qrisUrl: s.qris_image_url || null,
        });
      })
      .catch((err) => console.error('Failed to fetch store settings for receipt', err));
  }, []);

  // POS Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Customer & Payment Details
  const [customerName, setCustomerName] = useState('Pelanggan Walk-In');
  const [customerPhone, setCustomerPhone] = useState('081299887766');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS' | 'Transfer'>('Tunai');
  const [cashAmountInput, setCashAmountInput] = useState<number>(0);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [includePpn, setIncludePpn] = useState(false);

  // History Tab Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState<string>('Semua');

  // Modal receipt
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filter products by category & search
  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Add item to cart
  const addToCart = (product: Product) => {
    if (product.totalStock <= 0) {
      alert('⚠️ Stok produk habis di gudang!');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.totalStock) {
          alert('⚠️ Jumlah di keranjang melebihi sisa stok gudang!');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1, discount: 0 }];
    });
  };

  // Update Cart Qty
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.totalStock) {
              alert('⚠️ Melebihi stok yang tersedia!');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.product.id !== productId));
  };

  // Barcode Scanner Simulator
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const found = products.find(
      (p) => p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );
    if (found) {
      addToCart(found);
      setBarcodeInput('');
    } else {
      alert(`SKU Barcode "${barcodeInput}" tidak ditemukan!`);
    }
  };

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.product.hpp * 1.5 * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const finalDiscount = cartDiscount;
  const taxableSubtotal = Math.max(0, rawSubtotal - finalDiscount);
  const ppnAmount = includePpn ? Math.round(taxableSubtotal * 0.11) : 0;
  const grandTotal = taxableSubtotal + ppnAmount;

  const cashChange = paymentMethod === 'Tunai' ? Math.max(0, cashAmountInput - grandTotal) : 0;

  // Process Transaction Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang kasir masih kosong!');
      return;
    }

    if (paymentMethod === 'Tunai' && cashAmountInput < grandTotal) {
      alert(`Uang tunai kurang! Diperlukan minimal ${formatIDR(grandTotal)}.`);
      return;
    }

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      sku: item.product.sku,
      productName: item.product.name,
      quantity: item.quantity,
      price: Math.round(item.product.hpp * 1.5),
      image: item.product.image,
    }));

    const newOrder: Order = {
      id: `ORD-OFF-${Date.now()}`,
      orderNumber: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      platform: 'Manual/Offline',
      storeName: 'Toko Offline Boutique (Grand Indonesia)',
      customerName: customerName.trim() || 'Pelanggan Walk-In',
      customerPhone: customerPhone.trim() || '081200000000',
      address: 'Transaksi Langsung di Kasir Store',
      orderDate: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Selesai' as OrderStatus,
      items: orderItems,
      subtotal: rawSubtotal,
      shippingFee: 0,
      discounts: finalDiscount,
      platformFee: 0,
      totalAmount: grandTotal,
      courier: 'Bawa Sendiri / Kasir',
      paymentMethod: paymentMethod,
      isPrintedAWB: true,
    };

    // Deduct stock for each item
    cart.forEach((item) => {
      onDeductStock(item.product.sku, item.quantity);
    });

    // Save order
    onAddNewOfflineOrder(newOrder);

    // Set modal receipt
    setLastCompletedOrder(newOrder);
    setIsReceiptModalOpen(true);

    // Reset cart
    setCart([]);
    setCashAmountInput(0);
    setCartDiscount(0);
  };

  // Recent Offline Orders Filter & Metrics
  const offlineOrdersAll = orders.filter((o) => o.platform === 'Manual/Offline');
  const offlineRevenueTotal = offlineOrdersAll.reduce((sum, o) => sum + o.totalAmount, 0);

  const filteredHistoryOrders = offlineOrdersAll.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(historySearch.toLowerCase()));
    const matchPay = historyPaymentFilter === 'Semua' || o.paymentMethod === historyPaymentFilter;
    return matchSearch && matchPay;
  });

  const {
    paginatedItems: paginatedHistoryOrders,
    currentPage: historyPage,
    totalPages: historyTotalPages,
    totalItems: historyTotalItems,
    pageSize: historyPageSize,
    setPageSize: setHistoryPageSize,
    setCurrentPage: setHistoryPage,
  } = usePagination(filteredHistoryOrders);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar + View Tabs Switcher */}
      <div className="bg-white dark:bg-[#101828] p-5 md:p-6 rounded-[32px] border border-gray-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#101828] dark:text-white">
                {storeSettings.name}
              </h2>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ● {i18n?.language === 'en' ? 'Cashier Active' : 'Kasir Aktif'}
              </span>
            </div>
            {storeSettings.address && (
              <p className="text-xs text-[#667085]">
                {storeSettings.address}
              </p>
            )}
          </div>
        </div>

        {/* View Switcher Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#F2F4F7] dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'register'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{i18n?.language === 'en' ? 'POS Register' : 'Mesin Kasir (POS)'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{i18n?.language === 'en' ? `Receipt History (${offlineOrdersAll.length})` : `Riwayat Nota (${offlineOrdersAll.length})`}</span>
          </button>
        </div>
      </div>

      {/* ================= MODE 1: MESIN KASIR (REGISTER) ================= */}
      {activeSubTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Product Catalog & Barcode Search (8 cols — wider, cart narrowed to 4) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white dark:bg-[#101828] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs space-y-4">
              {/* Search & Barcode Scan Input Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Product Search */}
                <div className="sm:col-span-7 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama barang atau SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F2F4F7] dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Barcode Scanner Form */}
                <form onSubmit={handleBarcodeSubmit} className="sm:col-span-5 relative">
                  <ScanLine className="w-4 h-4 absolute left-3 top-3 text-indigo-600" />
                  <input
                    type="text"
                    placeholder="Scan SKU Barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800 text-xs font-mono font-semibold text-indigo-900 dark:text-indigo-200 placeholder:text-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </form>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-[#F2F4F7] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] lg:max-h-[68vh] overflow-y-auto pr-1 custom-scrollbar pt-1">
                {filteredProducts.map((prod) => {
                  const retailPrice = Math.round(prod.hpp * 1.5);
                  const isOutOfStock = prod.totalStock <= 0;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => !isOutOfStock && addToCart(prod)}
                      className={`bg-white dark:bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer group ${
                        isOutOfStock
                          ? 'opacity-50 border-gray-200 dark:border-slate-800 cursor-not-allowed'
                          : 'border-gray-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="relative mb-2 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                            {prod.sku}
                          </span>
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-semibold">
                              STOK HABIS
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-[#101828] dark:text-white line-clamp-2 leading-snug">
                          {prod.name}
                        </h4>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                            {formatIDR(retailPrice)}
                          </div>
                          <div className="text-[10px] text-slate-400">Stok: {prod.totalStock}</div>
                        </div>
                        <button
                          disabled={isOutOfStock}
                          className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: POS Cart & Checkout Panel (4 cols — narrowed so the catalog gets more room) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#101828] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-full min-h-[580px] lg:min-h-[80vh]">
              <div>
                {/* Cart Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-sm text-[#101828] dark:text-white">
                      Keranjang Kasir ({totalItemsCount} Barang)
                    </h3>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>

                {/* Cart Items Scroll Area */}
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                    <p className="text-xs font-semibold">Keranjang Kasir Masih Kosong</p>
                    <p className="text-[10px]">Klik produk di samping atau scan SKU barcode untuk menambah barang.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {cart.map((item) => {
                      const itemPrice = Math.round(item.product.hpp * 1.5);
                      return (
                        <div
                          key={item.product.id}
                          className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-xs text-[#101828] dark:text-white truncate">
                                {item.product.name}
                              </h5>
                              <p className="text-[10px] text-slate-400">
                                {formatIDR(itemPrice)} / unit
                              </p>
                            </div>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-semibold w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Item Total & Remove */}
                          <div className="text-right shrink-0 min-w-20">
                            <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                              {formatIDR(itemPrice * item.quantity)}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-[10px] text-slate-400 hover:text-rose-600"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer & Payment Form */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-slate-800 mt-3">
                {/* Customer Info Inputs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">Nama Pembeli</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F2F4F7] dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">No. WhatsApp</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#F2F4F7] dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Payment Method Selector Pills */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1.5">Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Tunai', 'QRIS', 'Transfer'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex flex-row items-center justify-center gap-1 ${
                          paymentMethod === method
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-[#F2F4F7] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200'
                        }`}
                      >
                        {method === 'Tunai' && <Banknote className="w-3 h-3 shrink-0" />}
                        {method === 'QRIS' && <QrCode className="w-3 h-3 shrink-0" />}
                        {method === 'Transfer' && <DollarSign className="w-3 h-3 shrink-0" />}
                        <span className="truncate">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tunai Cash Calculator Inputs */}
                {paymentMethod === 'Tunai' && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-900 dark:text-indigo-200">Jumlah Uang Tunai Dibayar:</span>
                      <span className="text-[10px] text-indigo-600">Total: {formatIDR(grandTotal)}</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={cashAmountInput || ''}
                        onChange={(e) => setCashAmountInput(Number(e.target.value))}
                        placeholder="Contoh: 100000"
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-indigo-300 dark:border-indigo-700 font-mono font-semibold text-xs"
                      />
                      <button
                        onClick={() => setCashAmountInput(grandTotal)}
                        className="px-2.5 py-1.5 bg-indigo-600 text-white text-[10px] font-semibold rounded-lg hover:bg-indigo-500"
                      >
                        Uang Pas
                      </button>
                      <button
                        onClick={() => setCashAmountInput(100000)}
                        className="px-2.5 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-semibold rounded-lg hover:bg-indigo-200"
                      >
                        100rb
                      </button>
                    </div>
                    {cashAmountInput > 0 && (
                      <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-indigo-200 dark:border-indigo-800">
                        <span className="text-slate-600 dark:text-slate-300">Kembalian:</span>
                        <span className={cashChange >= 0 ? 'text-emerald-600 font-extrabold text-sm' : 'text-rose-600'}>
                          {formatIDR(cashChange)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* QRIS Code Display */}
                {paymentMethod === 'QRIS' && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-800 flex flex-col items-center gap-2 text-center">
                    {storeSettings.qrisUrl ? (
                      <>
                        <img src={storeSettings.qrisUrl} alt="QRIS Toko" className="w-40 h-40 object-contain bg-white rounded-lg p-1.5 border border-indigo-200 dark:border-indigo-800" />
                        <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Total: {formatIDR(grandTotal)}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Minta pembeli scan kode di atas.</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                        Belum ada QRIS diunggah. Upload di menu Pengaturan Aplikasi.
                      </span>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-1 text-xs pt-1 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal ({totalItemsCount} barang):</span>
                    <span>{formatIDR(rawSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Pajak PPN 11%:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePpn}
                        onChange={(e) => setIncludePpn(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-[11px] font-semibold">{formatIDR(ppnAmount)}</span>
                    </label>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#101828] dark:text-white pt-1">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-base">
                      {formatIDR(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-2xl text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>BAYAR & CETAK STRUK KASIR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 2: RIWAYAT TRANSAKSI KASIR OFFLINE ================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#101828] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Omzet Store Offline</span>
                <div className="text-xl font-extrabold text-[#101828] dark:text-white mt-1">
                  {formatIDR(offlineRevenueTotal)}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> Relevan dengan shift kasir
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#101828] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Struk Transaksi</span>
                <div className="text-xl font-extrabold text-[#101828] dark:text-white mt-1">
                  {offlineOrdersAll.length} Nota
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-1">Toko Offline Grand Indonesia</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#101828] p-5 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Rata-Rata Basket (AOV)</span>
                <div className="text-xl font-extrabold text-[#101828] dark:text-white mt-1">
                  {offlineOrdersAll.length > 0
                    ? formatIDR(Math.round(offlineRevenueTotal / offlineOrdersAll.length))
                    : 'Rp 0'}
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold mt-1">Nilai Rata-rata per Nota</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* History Search & Filters Bar */}
          <div className="bg-white dark:bg-[#101828] rounded-[32px] border border-gray-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-sm text-[#101828] dark:text-white">
                  Daftar Riwayat Transaksi Kasir Store ({filteredHistoryOrders.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari No Nota, Pembeli, Produk..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[#F2F4F7] dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-medium w-60"
                  />
                </div>

                <select
                  value={historyPaymentFilter}
                  onChange={(e) => setHistoryPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F2F4F7] dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="Semua">Semua Metode Pembayaran</option>
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                    <th className="pb-3 pr-4">NO NOTA POS</th>
                    <th className="pb-3 px-4">TANGGAL & WAKTU</th>
                    <th className="pb-3 px-4">PEMBELI</th>
                    <th className="pb-3 px-4">BARANG TERJUAL</th>
                    <th className="pb-3 px-4">METODE BAYAR</th>
                    <th className="pb-3 px-4">TOTAL</th>
                    <th className="pb-3 pl-4 text-center">AKSI STRUK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                  {filteredHistoryOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Tidak ada riwayat transaksi kasir offline yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    paginatedHistoryOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-3.5 pr-4 font-mono font-extrabold text-[#101828] dark:text-slate-200">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {ord.orderDate}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {ord.customerName}
                          <div className="text-[10px] font-normal text-slate-400">{ord.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="line-clamp-2 text-slate-700 dark:text-slate-300">
                            {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-[#101828] dark:text-white text-sm">
                          {formatIDR(ord.totalAmount)}
                        </td>
                        <td className="py-3.5 pl-4 text-center">
                          <button
                            onClick={() => {
                              setLastCompletedOrder(ord);
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1.5 mx-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Struk</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredHistoryOrders.length > 0 && (
              <div className="border-t border-gray-100 dark:border-slate-800">
                <Pagination
                  bare
                  currentPage={historyPage}
                  totalPages={historyTotalPages}
                  totalItems={historyTotalItems}
                  pageSize={historyPageSize}
                  setPageSize={setHistoryPageSize}
                  setCurrentPage={setHistoryPage}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Modal */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={lastCompletedOrder}
        cashReceived={cashAmountInput}
        cashChange={cashChange}
        storeName={storeSettings.name}
        storeAddress={storeSettings.address}
        storePhone={storeSettings.phone}
      />
    </div>
  );
};
