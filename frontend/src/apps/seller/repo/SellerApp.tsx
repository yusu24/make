import React, { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Menu } from '@/constants/icons';
import { ActiveTab, Expense, Order, OrderStatus, Product, StoreChannel } from './types';
import '../seller.css';
import { useAuth } from '../../../contexts/AuthContext';
import { PageLoader } from '../../../routes/guards';
import {
  INITIAL_STORES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
} from './data/mockData';
import { api } from '../../../lib/api';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { PdfExportModal } from './components/modals/PdfExportModal';
import { AwbPrintModal } from './components/modals/AwbPrintModal';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { SellerAiFab } from './components/SellerAiFab';
import { SellerMobileBottomNav } from './components/SellerMobileBottomNav';
import { SellerMobileBottomSheet } from './components/SellerMobileBottomSheet';

// Pure, one-directional URL <-> tab mapping.
export const pathToTab = (p: string): ActiveTab => {
  // 1. Omnichannel Marketplace
  if (p.includes('/marketplace/connected')) return 'marketplace-connected';
  if (p.includes('/marketplace/mapping')) return 'marketplace-mapping';
  if (p.includes('/marketplace/sync')) return 'marketplace-sync';
  if (p.includes('/marketplace/history')) return 'marketplace-history';
  if (p.includes('/marketplace')) return 'marketplace-dashboard';

  // 2. Shipping & Notifikasi
  if (p.includes('/shipping/dashboard')) return 'shipping-dashboard';
  if (p.includes('/shipping/management')) return 'shipping-management';
  if (p.includes('/shipping/packing')) return 'shipping-packing';
  if (p.includes('/notifications')) return 'notification-center';

  // 3. POS & Pesanan
  if (p.includes('/pos')) return 'toko-offline';
  if (p.includes('/orders')) return 'pesanan';

  // 4. Laporan Bisnis (Harus diperiksa sebelum /products, /customers, /shifts)
  if (p.includes('/reports/products')) return 'laporan-produk';
  if (p.includes('/reports/margins')) return 'laporan-margin';
  if (p.includes('/reports/customers')) return 'laporan-pelanggan';
  if (p.includes('/reports/consignment')) return 'laporan-konsinyasi';
  if (p.includes('/reports/shifts')) return 'laporan-shift';
  if (p.includes('/reports/payments')) return 'laporan-pembayaran';
  if (p.includes('/reports/sales') || p.includes('/sales-report')) return 'keuangan-laporan';
  if (p.includes('/reports')) return 'keuangan-laporan';

  // 5. Katalog & Harga
  if (p.includes('/categories')) return 'katalog-kategori';
  if (p.includes('/units')) return 'katalog-satuan';
  if (p.includes('/batches')) return 'katalog-batch';
  if (p.includes('/serials')) return 'katalog-serial';
  if (p.includes('/print-labels')) return 'katalog-label';
  if (p.includes('/discounts')) return 'katalog-diskon';
  if (p.includes('/pricelists')) return 'katalog-harga';
  if (p.includes('/products')) return 'katalog';

  // 6. Inventori & Gudang
  if (p.includes('/warehouses')) return 'gudang-multi';
  if (p.includes('/purchase-orders') || p.includes('/purchases')) return 'gudang-po';
  if (p.includes('/stock-movements')) return 'gudang-mutasi';
  if (p.includes('/stock-transfers')) return 'gudang-transfer';
  if (p.includes('/supplier-returns')) return 'gudang-retur-supplier';
  if (p.includes('/stock-opname')) return 'stock-opname';
  if (p.includes('/stock')) return 'penerimaan-barang';
  if (p.includes('/inventory')) return 'gudang';

  // 7. Transaksi & Kasir
  if (p.includes('/transactions')) return 'transaksi-riwayat';
  if (p.includes('/shifts')) return 'transaksi-shift';
  if (p.includes('/customer-returns')) return 'transaksi-retur-pelanggan';

  // 8. Pelanggan & Mitra (CRM)
  if (p.includes('/customers')) return 'pelanggan';
  if (p.includes('/suppliers')) return 'crm-supplier';
  if (p.includes('/outlets')) return 'crm-cabang';

  // 9. Keuangan (/finance/cash-flow harus sebelum /finance/cash)
  if (p.includes('/finance/cash-flow')) return 'keuangan-arus-kas';
  if (p.includes('/finance/cash') || p.includes('/incomes') || p.includes('/expenses')) return 'keuangan-kas';
  if (p.includes('/finance/payables')) return 'keuangan-hutang';
  if (p.includes('/finance/receivables')) return 'keuangan-piutang';
  if (p.includes('/finance/transfers')) return 'keuangan-mutasi';
  if (p.includes('/finance/tax-report')) return 'keuangan-pajak';
  if (p.includes('/finance-categories')) return 'keuangan-kategori';
  if (p.includes('/finance/summary') || p.includes('/finance')) return 'keuangan-laba-rugi';

  // 10. Pengaturan & Akses
  if (p.includes('/staff') || p.includes('/settings/users')) return 'setting-staff';
  if (p.includes('/roles') || p.includes('/settings/roles')) return 'setting-roles';
  if (p.includes('/settings/app')) return 'settings-app';
  if (p.includes('/settings/account')) return 'settings-account';
  if (p.includes('/settings')) return 'setting-store';

  // 11. Sistem & Langganan
  if (p.includes('/subscription') || p.includes('/langganan')) return 'langganan';
  if (p.includes('/support')) return 'support';
  if (p.includes('/developer-api') || p.includes('/api')) return 'developer-api';
  if (p.includes('/guide') || p.includes('/panduan')) return 'panduan';
  if (p.includes('/backup')) return 'backup';

  return 'menu-utama';
};

export const tabToPath = (tab: ActiveTab): string => {
  switch (tab) {
    case 'pesanan': return '/seller/orders';
    case 'toko-offline': return '/seller/pos';
    case 'katalog': return '/seller/products';
    case 'katalog-kategori': return '/seller/categories';
    case 'katalog-satuan': return '/seller/units';
    case 'katalog-batch': return '/seller/batches';
    case 'katalog-serial': return '/seller/serials';
    case 'katalog-label': return '/seller/print-labels';
    case 'katalog-diskon': return '/seller/discounts';
    case 'katalog-harga': return '/seller/pricelists';
    case 'gudang': return '/seller/inventory';
    case 'gudang-multi': return '/seller/warehouses';
    case 'penerimaan-barang': return '/seller/stock';
    case 'gudang-po': return '/seller/purchase-orders';
    case 'gudang-mutasi': return '/seller/stock-movements';
    case 'gudang-transfer': return '/seller/stock-transfers';
    case 'gudang-retur-supplier': return '/seller/supplier-returns';
    case 'stock-opname': return '/seller/stock-opname';
    case 'transaksi-riwayat': return '/seller/transactions';
    case 'transaksi-shift': return '/seller/shifts';
    case 'transaksi-retur-pelanggan': return '/seller/customer-returns';
    case 'pelanggan': return '/seller/customers';
    case 'crm-supplier': return '/seller/suppliers';
    case 'crm-cabang': return '/seller/outlets';
    case 'keuangan-kas': return '/seller/finance/cash';
    case 'keuangan-hutang': return '/seller/finance/payables';
    case 'keuangan-piutang': return '/seller/finance/receivables';
    case 'keuangan-mutasi': return '/seller/finance/transfers';
    case 'keuangan-arus-kas': return '/seller/finance/cash-flow';
    case 'keuangan-pajak': return '/seller/finance/tax-report';
    case 'keuangan-kategori': return '/seller/finance-categories';
    case 'keuangan-laba-rugi': return '/seller/finance/summary';
    case 'keuangan-laporan': return '/seller/reports/sales';
    case 'laporan-produk': return '/seller/reports/products';
    case 'laporan-margin': return '/seller/reports/margins';
    case 'laporan-pelanggan': return '/seller/reports/customers';
    case 'laporan-konsinyasi': return '/seller/reports/consignment';
    case 'laporan-shift': return '/seller/reports/shifts';
    case 'laporan-pembayaran': return '/seller/reports/payments';
    case 'setting-staff': return '/seller/staff';
    case 'setting-roles': return '/seller/roles';
    case 'setting-store': return '/seller/settings';
    case 'settings-app': return '/seller/settings/app';
    case 'settings-account': return '/seller/settings/account';
    case 'settings-roles': return '/seller/roles';
    case 'settings-users': return '/seller/staff';
    case 'marketplace-dashboard': return '/seller/marketplace';
    case 'marketplace-connected': return '/seller/marketplace/connected';
    case 'marketplace-mapping': return '/seller/marketplace/mapping';
    case 'marketplace-sync': return '/seller/marketplace/sync';
    case 'marketplace-history': return '/seller/marketplace/history';
    case 'shipping-dashboard': return '/seller/shipping/dashboard';
    case 'shipping-management': return '/seller/shipping/management';
    case 'shipping-packing': return '/seller/shipping/packing';
    case 'notification-center': return '/seller/notifications';
    case 'langganan': return '/seller/subscription';
    case 'support': return '/seller/support';
    case 'developer-api': return '/seller/developer-api';
    case 'panduan': return '/seller/guide';
    case 'backup': return '/seller/backup';
    default: return '/seller/dashboard';
  }
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derived directly from the URL — see pathToTab/tabToPath above.
  const activeTab = pathToTab(location.pathname);
  const setActiveTab = (tab: ActiveTab) => {
    const targetPath = tabToPath(tab);
    if (!location.pathname.startsWith(targetPath)) {
      navigate(targetPath, { replace: true });
    }
  };
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setIsBottomSheetOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Kasir/POS is meant to be an immersive full-screen register: collapse the
  // sidebar to icons-only the moment the tab is entered so the cart has more
  // room, and hide the top header entirely (see render below). The user can
  // still expand the sidebar via the floating hamburger button rendered only
  // on this tab. Keyed on activeTab so it only fires on entry, not on every
  // manual re-expand while already on the tab.
  useEffect(() => {
    if (activeTab === 'toko-offline') {
      setCollapsed(true);
    }
  }, [activeTab]);

  // Dynamic Document Title for Seller Module
  useEffect(() => {
    const SELLER_TAB_TITLES: Record<ActiveTab, string> = {
      'menu-utama': 'Dashboard Seller Marketplace',
      'pesanan': 'Pesanan Masuk Marketplace',
      'katalog': 'Katalog Produk & Stok',
      'katalog-kategori': 'Kategori Produk',
      'katalog-satuan': 'Satuan Barang',
      'katalog-batch': 'Batch & Kadaluwarsa',
      'katalog-serial': 'Serial Number & IMEI',
      'katalog-label': 'Cetak Label Barcode',
      'katalog-diskon': 'Kode Diskon & Promo',
      'katalog-harga': 'Harga Grosir & Member',
      'gudang': 'Stok Gudang Multi-Channel',
      'gudang-multi': 'Multi-Gudang Seller',
      'penerimaan-barang': 'Penerimaan Barang Masuk',
      'gudang-po': 'Purchase Order (PO)',
      'gudang-mutasi': 'Riwayat Mutasi Stok',
      'gudang-transfer': 'Transfer Antar Gudang',
      'gudang-retur-supplier': 'Retur ke Supplier',
      'stock-opname': 'Stock Opname Fisik',
      'toko-offline': 'Kasir POS Toko Offline',
      'transaksi-riwayat': 'Riwayat Transaksi POS',
      'transaksi-shift': 'Shift & Laci Kasir',
      'transaksi-retur-pelanggan': 'Retur dari Pelanggan',
      'crm-supplier': 'Data Supplier',
      'crm-cabang': 'Daftar Cabang & Gerai Toko',
      'pelanggan': 'Data Pelanggan CRM',
      'keuangan-pemasukan': 'Pemasukan Lainnya',
      'keuangan-pengeluaran': 'Biaya Operasional',
      'keuangan-kas': 'Buku Kas & Saldo',
      'keuangan-laporan': 'Laporan Penjualan',
      'keuangan-laba-rugi': 'Ringkasan Laba Rugi',
      'keuangan-hutang': 'Hutang ke Supplier',
      'keuangan-piutang': 'Piutang Pelanggan',
      'keuangan-mutasi': 'Mutasi Antar Kas',
      'keuangan-arus-kas': 'Laporan Arus Kas',
      'keuangan-pajak': 'Laporan Pajak PPN',
      'keuangan-kategori': 'Kategori Keuangan',
      'laporan-penjualan': 'Laporan Penjualan Detail',
      'laporan-produk': 'Laporan Produk Terlaris',
      'laporan-margin': 'Laporan Margin Keuntungan',
      'laporan-pelanggan': 'Laporan Analitik Pelanggan',
      'laporan-konsinyasi': 'Laporan Konsinyasi Titip Jual',
      'laporan-shift': 'Laporan Kasir & Shift',
      'laporan-pembayaran': 'Laporan Metode Pembayaran',
      'master-data': 'Data Supplier & Master Data',
      'settings-app': 'Pengaturan Aplikasi',
      'settings-account': 'Pengaturan Akun & Toko',
      'settings-roles': 'Hak Akses & Role',
      'settings-users': 'Manajemen Tim & Staf',
      'setting-staff': 'Data Pegawai & Staf',
      'setting-roles': 'Hak Akses & Peran',
      'setting-store': 'Pengaturan Toko',
      'marketplace-dashboard': 'Dashboard Multi-Channel',
      'marketplace-connected': 'Akun Marketplace Terhubung',
      'marketplace-mapping': 'Mapping Master SKU',
      'marketplace-sync': 'Pusat Sinkronisasi Stok',
      'marketplace-history': 'Riwayat Sinkronisasi',
      'shipping-dashboard': 'Dashboard Pengiriman',
      'shipping-management': 'Manajemen Ekspedisi & Kurir',
      'shipping-packing': 'Peningkatan Quality Packing',
      'notification-center': 'Pusat Notifikasi Toko',
      'panduan': 'Buku Panduan Seller',
      'developer-api': 'Integrasi API & Webhook',
      'langganan': 'Paket Langganan Seller',
      'support': 'Pusat Bantuan Tenant',
      'backup': 'Backup Data Toko',
    };
    const title = SELLER_TAB_TITLES[activeTab] || 'Dashboard Seller';
    document.title = `Bizora - ${title}`;
  }, [activeTab]);

  // App Master Data States - initialized with rich dummy data ONLY for demo sandbox accounts
  const { user } = useAuth();
  const DEMO_EMAILS = ['seller@demo.com', 'ahmad@retail.com', 'retail@demo.com', 'siti@ikan.com', 'budidaya@demo.com', 'dewi@kuliner.com', 'kuliner@demo.com', 'jasa@demo.com'];
  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-') || DEMO_EMAILS.includes(user?.email || '');

  const [stores, setStores] = useState<StoreChannel[]>(isDemo ? INITIAL_STORES : []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>(isDemo ? INITIAL_ORDERS : []);
  const [products, setProducts] = useState<Product[]>(isDemo ? INITIAL_PRODUCTS : []);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [isAwbPrintOpen, setIsAwbPrintOpen] = useState(false);
  const [selectedOrderForAwb, setSelectedOrderForAwb] = useState<Order | null>(null);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);

  // Field names match RetailProduct DB columns (price_sell/price_buy/stock/stock_min)
  const mapProduct = (p: any): Product => {
    const stock = parseFloat(p.stock) || 0;
    const stockMin = parseFloat(p.stock_min || p.min_stock) || 0;
    const priceSell = parseFloat(p.price_sell || p.price) || 0;
    return {
      id: p.id?.toString(),
      sku: p.sku || `SKU-${p.id}`,
      name: p.name,
      category: p.category?.name || p.category || 'Umum',
      categoryId: p.category_id?.toString() || '',
      unit: p.unit || 'Pcs',
      image: p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      rawImageUrl: p.image_url || null,
      hpp: parseFloat(p.price_buy || p.cost_price) || 0,
      priceOffline: priceSell,
      priceShopee: parseFloat(p.price_shopee) || priceSell,
      priceTokopedia: parseFloat(p.price_tokopedia) || priceSell,
      priceTiktok: parseFloat(p.price_tiktok) || priceSell,
      priceLazada: parseFloat(p.price_lazada) || priceSell,
      totalStock: stock,
      stockMin,
      warehouseStock: {},
      status: stock <= 0 ? 'Habis' : stock <= stockMin ? 'Stok Menipis' : 'Aktif',
      connectedChannels: ['Shopee', 'Tokopedia', 'TikTok Shop'],
    };
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch initial data from Laravel backend (Seller API + fallback to Retail)
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const [sellerProdRes, sellerOrderRes, sellerChannelRes] = await Promise.all([
          api.get('/seller/products').catch(() => ({ data: { data: [] } })),
          api.get('/seller/orders').catch(() => ({ data: { data: [] } })),
          api.get('/seller/channels').catch(() => ({ data: { data: [] } })),
        ]);

        // 1. Products (Omnichannel or fallback to Retail products)
        let rawProds = sellerProdRes.data?.data || sellerProdRes.data || [];
        if (!Array.isArray(rawProds) || rawProds.length === 0) {
          try {
            const retailProdRes = await api.get('/retail/products');
            rawProds = retailProdRes.data?.data || retailProdRes.data || [];
          } catch (e) {
            // fallback
          }
        }
        if (Array.isArray(rawProds) && rawProds.length > 0) {
          setProducts(rawProds.map(mapProduct));
        }

        // 2. Orders
        const rawOrders = sellerOrderRes.data?.data || [];
        let mappedOrders: Order[] = [];
        if (Array.isArray(rawOrders) && rawOrders.length > 0) {
          mappedOrders = rawOrders.map((o: any) => ({
            id: o.id?.toString(),
            orderNumber: o.order_no || `ORD-${o.id}`,
            platform: o.platform === 'shopee' ? 'Shopee' : o.platform === 'tokopedia' ? 'Tokopedia' : o.platform === 'tiktok' ? 'TikTok Shop' : o.platform === 'lazada' ? 'Lazada' : 'Manual/Offline',
            storeName: o.platform,
            customerName: o.customer_name || 'Pelanggan',
            customerPhone: o.customer_phone || '-',
            address: o.customer_address || '-',
            orderDate: o.order_date?.replace('T', ' ').substring(0, 16) || new Date().toISOString().substring(0, 16),
            status: o.status === 'Perlu Dikirim' ? 'Perlu Diproses' : o.status === 'Dikirim' ? 'Dalam Pengiriman' : o.status === 'Selesai' ? 'Selesai' : o.status,
            items: (o.items || []).map((it: any) => ({
              productId: it.sku,
              sku: it.sku,
              productName: it.name,
              quantity: parseFloat(it.qty) || 1,
              price: parseFloat(it.price) || 0,
            })),
            subtotal: parseFloat(o.total_amount) || 0,
            shippingFee: parseFloat(o.shipping_cost) || 0,
            discounts: 0,
            platformFee: 0,
            totalAmount: parseFloat(o.total_amount) || 0,
            courier: o.courier || 'J&T Express',
            trackingNumber: o.tracking_no || `TRK-${o.id}`,
            paymentMethod: o.payment_method || 'Transfer',
            isPrintedAWB: false,
          }));
          setOrders(mappedOrders);
        }

        // 3. Channels
        const rawChannels = sellerChannelRes.data?.data || [];
        if (Array.isArray(rawChannels) && rawChannels.length > 0) {
          const todayDateStr = new Date().toISOString().substring(0, 10);
          const mappedChannels: StoreChannel[] = rawChannels.map((c: any) => {
            const platformName = c.platform === 'shopee' ? 'Shopee' : c.platform === 'tokopedia' ? 'Tokopedia' : c.platform === 'tiktok' ? 'TikTok Shop' : c.platform === 'lazada' ? 'Lazada' : (c.platform || 'Shopee');
            const chOrders = mappedOrders.filter((o) => o.platform?.toLowerCase() === platformName.toLowerCase());
            const chOrdersToday = chOrders.filter((o) => (o.orderDate || '').substring(0, 10) === todayDateStr);
            const chRevToday = chOrdersToday.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const chPendingEscrow = c.pending_escrow !== undefined && c.pending_escrow !== null
              ? Number(c.pending_escrow) || 0
              : chOrders.filter((o) => o.status === 'Perlu Diproses' || o.status === 'Dalam Pengiriman').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            return {
              id: c.id?.toString(),
              name: c.store_name,
              platform: platformName,
              storeName: c.store_name,
              accountName: c.account_id || c.store_name,
              storeCode: c.store_code || `STR-${c.id}`,
              connected: c.status === 'connected',
              status: c.status === 'connected' ? 'Connected' : 'Disconnected',
              autoSync: !!c.auto_sync,
              lastSync: c.last_sync_at ? new Date(c.last_sync_at).toLocaleString('id-ID') : 'Belum sync',
              lastSyncAt: c.last_sync_at ? new Date(c.last_sync_at).toLocaleString('id-ID') : 'Belum sync',
              revenueToday: chRevToday,
              totalOrdersToday: chOrdersToday.length,
              pendingEscrow: chPendingEscrow,
            };
          });
          setStores(mappedChannels);
        }
      } catch (err) {
        console.error('Failed to fetch backend data for seller:', err);
      }
    };
    fetchSellerData();
  }, []);

  // Lazy load expenses only when PDF export or AI advisor is opened
  const fetchExpensesIfNeeded = async () => {
    if (expenses.length === 0) {
      try {
        const expRes = await api.get('/retail/finance/expenses').catch(() => ({ data: [] }));
        if (Array.isArray(expRes.data) && expRes.data.length > 0) {
          setExpenses(expRes.data.map((e: any) => ({
            id: e.id?.toString(),
            date: e.tanggal || new Date().toISOString().substring(0, 10),
            category: e.category?.name || 'Lain-lain',
            amount: parseFloat(e.nominal) || 0,
            description: e.keterangan || '',
            storeId: 'all',
            paymentMethod: '-',
            createdByName: e.user?.name || '-',
          })));
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const handleOpenPdfExport = async () => {
    await fetchExpensesIfNeeded();
    setIsPdfExportOpen(true);
  };

  const handleOpenAiAdvisor = async () => {
    await fetchExpensesIfNeeded();
    setIsAiAdvisorOpen(true);
  };

  // Handlers for Orders & Shipping
  const handlePrintAwb = (order: Order) => {
    setSelectedOrderForAwb(order);
    setIsAwbPrintOpen(true);
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, isPrintedAWB: true } : o))
    );
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const contextValue = {
    orders,
    setOrders,
    products,
    setProducts,
    stores,
    setStores,
    selectedStoreId,
    setSelectedStoreId,
    onPrintAwb: handlePrintAwb,
    onUpdateOrderStatus: handleUpdateOrderStatus,
    onMenuToggle: () => {
      if (window.innerWidth < 768) {
        setIsBottomSheetOpen(prev => !prev);
      } else {
        setCollapsed(prev => !prev);
      }
    },
    onOpenPdfExport: handleOpenPdfExport,
    onOpenAiAdvisor: handleOpenAiAdvisor,
  };

  // Handler for Sync Marketplace
  return (
    <div className="seller-scope min-h-screen max-w-full overflow-x-hidden bg-[#F2F4F7] dark:bg-[#0B0F19] text-[#101828] dark:text-slate-100 antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        openAiAdvisor={() => setIsAiAdvisorOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        stores={stores}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 ${
          collapsed ? 'md:pl-[68px]' : 'md:pl-64'
        } pl-0`}
      >
        {/* Top Header — hidden on Kasir/POS so the register gets full-height, immersive space */}
        {activeTab !== 'toko-offline' && (
          <Header
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            selectedStoreId={selectedStoreId}
            setSelectedStoreId={setSelectedStoreId}
            stores={stores}
            products={products}
            onOpenPdfExport={() => setIsPdfExportOpen(true)}
            activeTab={activeTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            mobileMenuOpen={isBottomSheetOpen}
            setMobileMenuOpen={() => setIsBottomSheetOpen(prev => !prev)}
          />
        )}

        {/* Dynamic View Body */}
        <main className={`flex-1 w-full min-w-0 ${activeTab === 'toko-offline' ? 'p-0 h-[100dvh] overflow-hidden relative' : 'px-2.5 pb-4 sm:px-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8 pt-20 md:pt-24'}`}>
          <Suspense fallback={<PageLoader />}>
            <Outlet context={contextValue} />
          </Suspense>

          {/* Mobile Bottom Clearance Spacer so bottom-most content is never covered by bottom nav */}
          {activeTab !== 'toko-offline' && (
            <div
              className="md:hidden"
              style={{
                height: 'calc(110px + env(safe-area-inset-bottom, 16px))',
                width: '100%',
                pointerEvents: 'none',
                flexShrink: 0
              }}
              aria-hidden="true"
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <PdfExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        expenses={expenses}
        orders={orders}
        storeCount={stores.length}
      />

      <AwbPrintModal
        isOpen={isAwbPrintOpen}
        onClose={() => setIsAwbPrintOpen(false)}
        order={selectedOrderForAwb}
      />

      <AiAdvisorDrawer
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        expenses={expenses}
        orders={orders}
        products={products}
      />

      <SellerAiFab
        onOpen={handleOpenAiAdvisor}
        isPosView={activeTab === 'toko-offline'}
      />

      {/* Mobile Bottom Navigation & Slide-up Sheet */}
      <>
        {activeTab !== 'toko-offline' && (
          <SellerMobileBottomNav
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onToggleMore={() => setIsBottomSheetOpen(prev => !prev)}
            isSheetOpen={isBottomSheetOpen}
          />
        )}
        <SellerMobileBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      </>
    </div>
  );
}
