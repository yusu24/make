import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { ActiveTab, Expense, Income, Order, Product, Warehouse, StockMovement, CashSummaryItem, StoreChannel } from './types';
import {
  INITIAL_WAREHOUSES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_CASH_SUMMARIES,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_STORES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
} from './data/mockData';
import { api } from '../../../lib/api';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { MainDashboardView } from './components/views/MainDashboardView';
import { ExpensesView } from './components/views/ExpensesView';
import { OrdersView } from './components/views/OrdersView';
import { CatalogView } from './components/views/CatalogView';
import { WarehouseView } from './components/views/WarehouseView';
import { PurchaseHistoryView } from './components/views/PurchaseHistoryView';
import { StockOpnameView } from './components/views/StockOpnameView';
import { PosOfflineView } from './components/views/PosOfflineView';
import { OtherIncomeView } from './components/views/OtherIncomeView';
import { CashSummaryView } from './components/views/CashSummaryView';
import { SalesReportView } from './components/views/SalesReportView';
import { MasterDataView } from './components/views/MasterDataView';
import { CustomerView } from './components/views/CustomerView';
import { AppSettingsView } from './components/views/AppSettingsView';
import { AccountSettingsView } from './components/views/AccountSettingsView';
import { RolesPermissionsView } from './components/views/RolesPermissionsView';
import { UserManagementView } from './components/views/UserManagementView';

import { MarketplaceDashboardView } from './components/omnichannel/MarketplaceDashboardView';
import { ConnectedAccountsView } from './components/omnichannel/ConnectedAccountsView';
import { ProductMappingView } from './components/omnichannel/ProductMappingView';
import { SyncCenterView } from './components/omnichannel/SyncCenterView';
import { SyncHistoryView } from './components/omnichannel/SyncHistoryView';
import { ShippingDashboardView } from './components/omnichannel/ShippingDashboardView';
import { ShippingManagementView } from './components/omnichannel/ShippingManagementView';
import { PackingImprovementView } from './components/omnichannel/PackingImprovementView';
import { NotificationCenterView } from './components/omnichannel/NotificationCenterView';
import { GuideView } from './components/views/GuideView';

import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddIncomeModal } from './components/modals/AddIncomeModal';
import { AddWarehouseModal } from './components/modals/AddWarehouseModal';
import { PdfExportModal } from './components/modals/PdfExportModal';
import { AwbPrintModal } from './components/modals/AwbPrintModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { ImportProductsModal } from './components/modals/ImportProductsModal';
import { AddStockModal } from './components/modals/AddStockModal';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';

// Pure, one-directional URL <-> tab mapping. activeTab is derived FROM the
// URL on every render (see below) instead of being separate React state kept
// in sync via two competing effects — that older two-effect setup could
// navigate() in response to a tab change, which changed the URL, which
// re-ran the path-watching effect, which could set the tab again, bouncing
// between whatever tab was clicked and the default 'menu-utama' before it
// settled. Deriving the tab straight from the URL each render makes that
// class of bug impossible: there's only one source of truth.
const pathToTab = (p: string): ActiveTab => {
  if (p.includes('/pos')) return 'toko-offline';
  if (p.includes('/orders')) return 'pesanan';
  if (p.includes('/marketplace/connected')) return 'marketplace-connected';
  if (p.includes('/marketplace/mapping')) return 'marketplace-mapping';
  if (p.includes('/marketplace/sync')) return 'marketplace-sync';
  if (p.includes('/marketplace/history')) return 'marketplace-history';
  if (p.includes('/marketplace')) return 'marketplace-dashboard';
  if (p.includes('/shipping/dashboard')) return 'shipping-dashboard';
  if (p.includes('/shipping/management')) return 'shipping-management';
  if (p.includes('/shipping/packing')) return 'shipping-packing';
  if (p.includes('/notifications')) return 'notification-center';
  if (p.includes('/products')) return 'katalog';
  if (p.includes('/purchases')) return 'penerimaan-barang';
  if (p.includes('/stock-opname')) return 'stock-opname';
  if (p.includes('/inventory') || p.includes('/stock')) return 'gudang';
  if (p.includes('/incomes')) return 'keuangan-pemasukan';
  if (p.includes('/expenses')) return 'keuangan-pengeluaran';
  if (p.includes('/finance')) return 'keuangan-kas';
  if (p.includes('/sales-report')) return 'keuangan-laporan';
  if (p.includes('/suppliers')) return 'master-data';
  if (p.includes('/customers')) return 'pelanggan';
  if (p.includes('/settings/app')) return 'settings-app';
  if (p.includes('/settings/account')) return 'settings-account';
  if (p.includes('/settings/roles')) return 'settings-roles';
  if (p.includes('/settings/users')) return 'settings-users';
  if (p.includes('/guide') || p.includes('/panduan')) return 'panduan';
  return 'menu-utama';
};

const tabToPath = (tab: ActiveTab): string => {
  switch (tab) {
    case 'pesanan': return '/seller/orders';
    case 'katalog': return '/seller/products';
    case 'gudang': return '/seller/inventory';
    case 'penerimaan-barang': return '/seller/purchases';
    case 'stock-opname': return '/seller/stock-opname';
    case 'toko-offline': return '/seller/pos';
    case 'keuangan-pemasukan': return '/seller/incomes';
    case 'keuangan-pengeluaran': return '/seller/expenses';
    case 'keuangan-kas': return '/seller/finance';
    case 'keuangan-laporan': return '/seller/sales-report';
    case 'master-data': return '/seller/suppliers';
    case 'pelanggan': return '/seller/customers';
    case 'settings-app': return '/seller/settings/app';
    case 'settings-account': return '/seller/settings/account';
    case 'settings-roles': return '/seller/settings/roles';
    case 'settings-users': return '/seller/settings/users';
    case 'marketplace-dashboard': return '/seller/marketplace/dashboard';
    case 'marketplace-connected': return '/seller/marketplace/connected';
    case 'marketplace-mapping': return '/seller/marketplace/mapping';
    case 'marketplace-sync': return '/seller/marketplace/sync';
    case 'marketplace-history': return '/seller/marketplace/history';
    case 'shipping-dashboard': return '/seller/shipping/dashboard';
    case 'shipping-management': return '/seller/shipping/management';
    case 'shipping-packing': return '/seller/shipping/packing';
    case 'notification-center': return '/seller/notifications';
    case 'panduan': return '/seller/guide';
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
  const [selectedStoreId, setSelectedStoreId] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

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

  // App Master Data States - initialized with full rich dummy data for all processes
  const [stores, setStores] = useState<StoreChannel[]>(INITIAL_STORES);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cashSummaries, setCashSummaries] = useState<CashSummaryItem[]>(INITIAL_CASH_SUMMARIES);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseToEdit, setWarehouseToEdit] = useState<Warehouse | null>(null);

  // Backend rows are snake_case and don't track per-warehouse stock counts yet
  // (no stock-by-warehouse table exists) — map to the camelCase shape the
  // views expect and default the not-yet-tracked stock fields to 0.
  const mapWarehouse = (w: any): Warehouse => ({
    id: w.id?.toString(),
    name: w.name,
    code: w.code || '',
    city: w.city || '',
    address: w.address || '',
    picName: w.pic_name || '',
    picPhone: w.pic_phone || '',
    totalSKUs: w.totalSKUs ?? 0,
    totalItems: w.totalItems ?? 0,
    isDefault: !!w.is_default,
  });

  // Field names below match RetailProduct's real DB columns
  // (price_sell/price_buy/stock/stock_min), not the Product type's
  // per-marketplace fields, since Retail has no marketplace integration:
  // every marketplace price is set to the one real selling price rather
  // than fabricating distinct values. Shared by the initial catalog fetch
  // and the create/update product handlers below.
  const mapProduct = (p: any): Product => {
    const stock = parseFloat(p.stock) || 0;
    const stockMin = parseFloat(p.stock_min) || 0;
    const priceSell = parseFloat(p.price_sell) || 0;
    return {
      id: p.id?.toString(),
      sku: p.sku || `SKU-${p.id}`,
      name: p.name,
      category: p.category?.name || 'Uncategorized',
      categoryId: p.category_id?.toString() || '',
      unit: p.unit || 'Pcs',
      image: p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      rawImageUrl: p.image_url || null,
      hpp: parseFloat(p.price_buy) || 0,
      priceOffline: priceSell,
      priceShopee: parseFloat(p.price_shopee) || priceSell,
      priceTokopedia: parseFloat(p.price_tokopedia) || priceSell,
      priceTiktok: parseFloat(p.price_tiktok) || priceSell,
      priceLazada: parseFloat(p.price_lazada) || priceSell,
      totalStock: stock,
      stockMin,
      warehouseStock: {},
      status: stock <= 0 ? 'Habis' : stock <= stockMin ? 'Stok Menipis' : 'Aktif',
      connectedChannels: [],
    };
  };

  // Fetch real warehouses from backend
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/seller/warehouses');
        if (response.data.success) {
          setWarehouses(response.data.data.length > 0 ? response.data.data.map(mapWarehouse) : INITIAL_WAREHOUSES);
        }
      } catch (error) {
        console.error("Failed to fetch warehouses", error);
      }
    };

    fetchWarehouses();
  }, []);

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gudang ini?')) return;
    try {
      await api.delete(`/seller/warehouses/${id}`);
      setWarehouses((prev) => {
        const remaining = prev.filter((w) => w.id !== id);
        // Mirror the backend's auto-promote-next-as-default behavior locally
        // so the UI doesn't show zero defaults until the next full refetch.
        if (!remaining.some((w) => w.isDefault) && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true };
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete warehouse', err);
      alert('Gagal menghapus gudang.');
    }
  };

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);

  // Modals & Drawers States
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [isAwbPrintOpen, setIsAwbPrintOpen] = useState(false);
  const [selectedOrderForAwb, setSelectedOrderForAwb] = useState<Order | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportProductsOpen, setIsImportProductsOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [productToRestock, setProductToRestock] = useState<Product | null>(null);
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch initial data from Laravel backend
  useEffect(() => {
    const fetchRetailData = async () => {
      try {
        const [prodRes, expRes, incRes, transRes] = await Promise.all([
          api.get('/retail/products').catch(() => ({ data: [] })),
          api.get('/retail/finance/expenses').catch(() => ({ data: [] })),
          api.get('/retail/finance/incomes').catch(() => ({ data: [] })),
          api.get('/retail/transactions', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } }))
        ]);

        // Unlike /retail/transactions (paginated, body wrapped in {data:[...]}),
        // /retail/products responds with a bare array — checking `.data.data`
        // here would always be undefined and silently skip setProducts.
        const productsById: Record<string, any> = {};
        let mappedProducts: Product[] = [];
        if (Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          mappedProducts = prodRes.data.map((p: any) => {
            const mapped = mapProduct(p);
            productsById[String(p.id)] = mapped;
            return mapped;
          });
          setProducts(mappedProducts);
        }

        if (Array.isArray(expRes.data) && expRes.data.length > 0) {
          const mappedExpenses = expRes.data.map((e: any) => ({
            id: e.id?.toString(),
            date: e.tanggal || new Date().toISOString().substring(0, 10),
            category: e.category?.name || 'Lain-lain',
            amount: parseFloat(e.nominal) || 0,
            description: e.keterangan || '',
            storeId: 'all',
            paymentMethod: '-',
            createdByName: e.user?.name || '-',
          }));
          setExpenses(mappedExpenses);
        }

        if (Array.isArray(incRes.data) && incRes.data.length > 0) {
          const mappedIncomes = incRes.data.map((inc: any) => ({
            id: inc.id?.toString(),
            date: inc.tanggal || new Date().toISOString().substring(0, 10),
            category: inc.category?.name || 'Lain-lain',
            amount: parseFloat(inc.nominal) || 0,
            description: inc.keterangan || '',
            storeName: 'Toko Offline',
          }));
          setIncomes(mappedIncomes);
        }

        if (transRes.data?.data && transRes.data.data.length > 0) {
          const mappedOrders: Order[] = transRes.data.data.map((t: any) => ({
            id: t.id?.toString(),
            orderNumber: t.invoice_no || `TRX-${t.id}`,
            platform: 'Manual/Offline',
            storeName: 'Toko Offline',
            customerName: t.customer?.name || 'Pelanggan Offline',
            customerPhone: t.customer?.phone || '-',
            address: '-',
            orderDate: t.created_at?.replace('T', ' ').substring(0, 16) || new Date().toISOString().substring(0, 16),
            status: 'Selesai',
            items: (t.items || []).map((it: any) => ({
              productId: it.product_id?.toString(),
              sku: productsById[String(it.product_id)]?.sku || `SKU-${it.product_id}`,
              productName: productsById[String(it.product_id)]?.name || `Produk #${it.product_id}`,
              quantity: parseFloat(it.qty) || 0,
              price: parseFloat(it.price) || 0,
            })),
            subtotal: parseFloat(t.total_amount) || 0,
            shippingFee: 0,
            discounts: parseFloat(t.discount_amount) || 0,
            platformFee: 0,
            totalAmount: parseFloat(t.total_amount) || 0,
            courier: '-',
            trackingNumber: `TRX-${t.id}`,
            paymentMethod: t.payment_method || '-',
            isPrintedAWB: false,
          }));
          setOrders(mappedOrders);

          const todayStr = new Date().toISOString().substring(0, 10);
          const todaysOrders = mappedOrders.filter((o) => o.orderDate.startsWith(todayStr));
          if (todaysOrders.length > 0) {
            const todaysRevenue = todaysOrders.reduce((sum, o) => sum + o.totalAmount, 0);
            setStores((prev) => prev.map((st) =>
              st.platform === 'Manual/Offline'
                ? { ...st, revenueToday: todaysRevenue, totalOrdersToday: todaysOrders.length }
                : st
            ));
          }
        }

      } catch (err) {
        console.error('Failed to fetch backend data for seller:', err);
      }
    };
    fetchRetailData();
  }, []);


  // Fetch real stock movement history — WarehouseView labels this section
  // "Real-Time" but it was reading purely from mock data until now. There's
  // no warehouse_id on retail_products/retail_stock_movements (stock isn't
  // tracked per-warehouse at all), so warehouseName is left honestly blank
  // rather than attributed to a specific warehouse that isn't actually known.
  // Pulled out as a function (not inline in the effect) so a successful
  // restock can re-trigger it and show up immediately, not just on load.
  const fetchStockMovements = () => {
    api.get('/retail/stock/movements')
      .then((res) => {
        const rows = res.data?.data;
        if (!Array.isArray(rows)) return;
        const mappedMovements: StockMovement[] = rows.map((m: any) => {
          const qty = parseFloat(m.quantity) || 0;
          return {
            id: m.id?.toString(),
            date: m.created_at?.replace('T', ' ').substring(0, 16) || '-',
            sku: m.product?.sku || '-',
            productName: m.product?.name || `Produk #${m.product_id}`,
            warehouseName: '-',
            type: m.type === 'adjustment' ? 'Opname Adjust' : (qty >= 0 ? 'Masuk' : 'Keluar'),
            qty,
            notes: m.note || '-',
            user: m.user?.name || '-',
          };
        });
        setStockMovements(mappedMovements);
      })
      .catch((err) => console.error('Failed to fetch stock movements', err));
  };

  useEffect(() => { fetchStockMovements(); }, []);

  // Handlers for Expenses (Create, Edit, Delete)
  // RetailExpense's real columns/validation require tanggal/keterangan/nominal
  // (not amount/expense_date/description) — sending the wrong names made
  // every save fail validation (422) with no expense ever actually persisted.
  // finance_category_id is left null: the modal's category field is a fixed
  // display label, not a real retail_finance_categories id, so passing one
  // here would either fail validation or silently attach the wrong tenant's
  // category. The backend then stores kategori as 'Lainnya' until this
  // dropdown is backed by real category ids.
  const handleSaveExpense = async (newExpenseData: Omit<Expense, 'id'>, idToEdit?: string) => {
    try {
      const payload = {
        tanggal: newExpenseData.date,
        keterangan: newExpenseData.description,
        nominal: newExpenseData.amount,
        finance_category_id: null,
      };
      if (idToEdit) {
        await api.put(`/retail/finance/expenses/${idToEdit}`, payload);
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === idToEdit ? { ...exp, ...newExpenseData } : exp))
        );
      } else {
        const res = await api.post('/retail/finance/expenses', payload);
        const createdExpense: Expense = {
          id: res.data?.data?.id?.toString() || `EXP-${Date.now()}`,
          ...newExpenseData,
        };
        setExpenses((prev) => [createdExpense, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save expense', e);
      alert('Gagal menyimpan pengeluaran ke server');
    }
  };

  // Handlers for Other Incomes (Create, Edit, Delete)
  const handleSaveIncome = async (newIncomeData: Omit<Income, 'id'>, financeCategoryId: string | null, idToEdit?: string) => {
    try {
      const payload = {
        tanggal: newIncomeData.date,
        keterangan: newIncomeData.description,
        nominal: newIncomeData.amount,
        finance_category_id: financeCategoryId ? Number(financeCategoryId) : null,
      };
      if (idToEdit) {
        await api.put(`/retail/finance/incomes/${idToEdit}`, payload);
        setIncomes((prev) =>
          prev.map((inc) => (inc.id === idToEdit ? { ...inc, ...newIncomeData } : inc))
        );
      } else {
        const res = await api.post('/retail/finance/incomes', payload);
        const createdIncome: Income = {
          id: res.data?.data?.id?.toString() || `INC-${Date.now()}`,
          ...newIncomeData,
        };
        setIncomes((prev) => [createdIncome, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save income', e);
      alert('Gagal menyimpan pemasukan ke server');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan pemasukan ini?')) return;
    try {
      await api.delete(`/retail/finance/incomes/${id}`);
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    } catch (e) {
      console.error('Failed to delete income', e);
      alert('Gagal menghapus pemasukan.');
    }
  };

  const handleEditIncomeClick = (inc: Income) => {
    setIncomeToEdit(inc);
    setIsAddIncomeModalOpen(true);
  };

  const handleAddNewOfflineOrder = async (newOrder: Order) => {
    try {
      const payload = {
        customer_id: null,
        payment_method: newOrder.paymentMethod,
        payment_amount: newOrder.totalAmount,
        discount_code: null,
        note: 'Offline POS Transaction (Omnichannel)',
        items: newOrder.items.map((item) => ({
          product_id: item.productId || item.sku,
          qty: item.quantity
        }))
      };

      await api.post('/retail/transactions', payload);
      
      setOrders((prev) => [newOrder, ...prev]);
      setStores((prev) =>
        prev.map((st) =>
          st.platform === 'Manual/Offline'
            ? {
                ...st,
                revenueToday: st.revenueToday + newOrder.totalAmount,
                totalOrdersToday: st.totalOrdersToday + 1,
              }
            : st
        )
      );
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan transaksi kasir ke server.");
    }
  };

  const handleDeductStock = (sku: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          const newStock = Math.max(0, p.totalStock - qty);
          return {
            ...p,
            totalStock: newStock,
            status: newStock <= 0 ? 'Habis' : newStock <= p.stockMin ? 'Stok Menipis' : 'Aktif',
          };
        }
        return p;
      })
    );
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan pengeluaran ini?')) {
      try {
        await api.delete(`/retail/finance/expenses/${id}`);
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      } catch (e) {
        console.error('Failed to delete expense', e);
      }
    }
  };

  const handleEditExpenseClick = (exp: Expense) => {
    setExpenseToEdit(exp);
    setIsAddExpenseModalOpen(true);
  };

  // Handlers for Orders
  const handlePrintAwb = (order: Order) => {
    setSelectedOrderForAwb(order);
    setIsAwbPrintOpen(true);
    // Mark AWB as printed
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, isPrintedAWB: true } : o))
    );
  };


  // Handlers for Product Catalog (Create, Edit, Delete)
  // RetailProduct's real columns are name/sku/unit/category_id/price_buy/
  // price_sell/stock/stock_min — the old version sent sell_price/stock/
  // category_id:1/unit_id (none of which the backend reads), so every
  // product ever added here saved with a null price and null stock.
  const handleSaveProduct = async (
    data: { sku: string; name: string; unit: string; categoryId: string; hpp: number; priceOffline: number; priceShopee: number; priceTokopedia: number; priceTiktok: number; stockMin: number; totalStock?: number },
    idToEdit?: string
  ) => {
    try {
      const payload: any = {
        name: data.name,
        sku: data.sku,
        unit: data.unit,
        category_id: data.categoryId || null,
        price_buy: data.hpp,
        price_sell: data.priceOffline, // Currently acts as the master offline price
        price_shopee: data.priceShopee,
        price_tokopedia: data.priceTokopedia,
        price_tiktok: data.priceTiktok,
        stock_min: data.stockMin,
      };
      if (idToEdit) {
        const res = await api.put(`/retail/products/${idToEdit}`, payload);
        const updated = mapProduct(res.data);
        setProducts((prev) => prev.map((p) => (p.id === idToEdit ? updated : p)));
      } else {
        const res = await api.post('/retail/products', { ...payload, stock: data.totalStock ?? 0 });
        const created = mapProduct(res.data);
        setProducts((prev) => [created, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save product', e);
      alert('Gagal menyimpan produk ke server');
    }
  };

  const handleEditProductClick = (prod: Product) => {
    setProductToEdit(prod);
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Hapus produk "${prod.name}"?`)) return;
    try {
      await api.delete(`/retail/products/${prod.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
    } catch (e) {
      console.error('Failed to delete product', e);
      alert('Gagal menghapus produk. Produk mungkin masih terpakai di transaksi.');
    }
  };

  const handleProductImageUploaded = (productId: string, imageUrl: string) => {
    const fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
    const patch = { image: imageUrl || fallback, rawImageUrl: imageUrl || null };
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...patch } : p)));
    setProductToEdit((prev) => (prev && prev.id === productId ? { ...prev, ...patch } : prev));
  };

  // Called after AddStockModal successfully records a purchase (see its own
  // comment for why a Purchase, not a direct stock edit, is used — it's the
  // one write path that keeps retail_stock_movements as an honest audit trail).
  const handleStockAdded = (productId: string, qtyAdded: number) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id !== productId) return p;
      const newStock = p.totalStock + qtyAdded;
      return {
        ...p,
        totalStock: newStock,
        status: newStock <= 0 ? 'Habis' : newStock <= p.stockMin ? 'Stok Menipis' : 'Aktif',
      };
    }));
    fetchStockMovements();
  };

  // Handler for Sync Marketplace
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#F2F4F7] dark:bg-[#0B0F19] text-[#101828] dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
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
          collapsed ? 'md:pl-20' : 'md:pl-64'
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
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}

        {/* Floating sidebar toggle — replaces the Header's hamburger while it's hidden on Kasir/POS */}
        {activeTab === 'toko-offline' && (
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            title="Tampilkan/Sembunyikan Menu"
            className={`fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer ${
              collapsed ? 'md:left-24' : 'md:left-[17rem]'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Dynamic View Body */}
        <main className={`flex-1 px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8 w-full min-w-0 ${activeTab === 'toko-offline' ? 'pt-4 md:pt-6' : 'pt-20 md:pt-24'}`}>
          {activeTab === 'menu-utama' && (
            <MainDashboardView
              orders={orders}
              products={products}
              stores={stores}
              setActiveTab={setActiveTab}
              onPrintAwb={handlePrintAwb}
            />
          )}

          {activeTab === 'pesanan' && (
            <OrdersView
              orders={orders}
              onPrintAwb={handlePrintAwb}
              selectedStoreId={selectedStoreId}
            />
          )}

          {activeTab === 'katalog' && (
            <CatalogView
              products={products}
              onAddProductClick={() => {
                setProductToEdit(null);
                setIsAddProductOpen(true);
              }}
              onOpenImportModal={() => setIsImportProductsOpen(true)}
              onEditProduct={handleEditProductClick}
              onDeleteProduct={handleDeleteProduct}
              onRestockClick={(prod) => {
                setProductToRestock(prod);
                setIsAddStockOpen(true);
              }}
            />
          )}

          {activeTab === 'gudang' && (
            <WarehouseView
              warehouses={warehouses}
              stockMovements={stockMovements}
              onAddWarehouse={() => {
                setWarehouseToEdit(null);
                setIsAddWarehouseModalOpen(true);
              }}
              onEditWarehouse={(wh) => {
                setWarehouseToEdit(wh);
                setIsAddWarehouseModalOpen(true);
              }}
              onDeleteWarehouse={handleDeleteWarehouse}
            />
          )}

          {activeTab === 'penerimaan-barang' && (
            <PurchaseHistoryView />
          )}

          {activeTab === 'stock-opname' && (
            <StockOpnameView />
          )}

          {activeTab === 'toko-offline' && (
            <PosOfflineView
              products={products}
              orders={orders}
              onAddNewOfflineOrder={handleAddNewOfflineOrder}
              onDeductStock={handleDeductStock}
            />
          )}

          {activeTab === 'keuangan-pengeluaran' && (
            <ExpensesView
              expenses={expenses}
              onAddExpenseClick={() => {
                setExpenseToEdit(null);
                setIsAddExpenseModalOpen(true);
              }}
              onEditExpense={handleEditExpenseClick}
              onDeleteExpense={handleDeleteExpense}
              stores={stores}
              selectedStoreId={selectedStoreId}
            />
          )}

          {activeTab === 'keuangan-pemasukan' && (
            <OtherIncomeView
              incomes={incomes}
              onAddIncomeClick={() => {
                setIncomeToEdit(null);
                setIsAddIncomeModalOpen(true);
              }}
              onEditIncome={handleEditIncomeClick}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeTab === 'keuangan-kas' && (
            <CashSummaryView cashSummaries={cashSummaries} />
          )}

          {activeTab === 'keuangan-laporan' && (
            <SalesReportView orders={orders} expenses={expenses} products={products} />
          )}

          {activeTab === 'master-data' && (
            <MasterDataView
              stores={stores}
            />
          )}

          {activeTab === 'pelanggan' && (
            <CustomerView />
          )}

          {activeTab === 'settings-app' && (
            <AppSettingsView />
          )}

          {activeTab === 'settings-account' && (
            <AccountSettingsView />
          )}

          {activeTab === 'settings-roles' && (
            <RolesPermissionsView />
          )}

          {activeTab === 'settings-users' && (
            <UserManagementView />
          )}

          {activeTab === 'marketplace-dashboard' && (
            <MarketplaceDashboardView onNavigateToConnected={() => setActiveTab('marketplace-connected')} />
          )}
          {activeTab === 'marketplace-connected' && <ConnectedAccountsView />}
          {activeTab === 'marketplace-mapping' && <ProductMappingView />}
          {activeTab === 'marketplace-sync' && <SyncCenterView />}
          {activeTab === 'marketplace-history' && <SyncHistoryView />}
          {activeTab === 'shipping-dashboard' && <ShippingDashboardView />}
          {activeTab === 'shipping-management' && <ShippingManagementView />}
          {activeTab === 'shipping-packing' && <PackingImprovementView />}
          {activeTab === 'notification-center' && <NotificationCenterView />}
          {activeTab === 'panduan' && <GuideView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSaveExpense={handleSaveExpense}
        expenseToEdit={expenseToEdit}
        stores={stores}
      />

      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => {
          setIsAddIncomeModalOpen(false);
          setIncomeToEdit(null);
        }}
        onSaveIncome={handleSaveIncome}
        incomeToEdit={incomeToEdit}
      />

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

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setProductToEdit(null);
        }}
        onSaveProduct={handleSaveProduct}
        productToEdit={productToEdit}
        onImageUploaded={handleProductImageUploaded}
      />

      <ImportProductsModal
        isOpen={isImportProductsOpen}
        onClose={() => setIsImportProductsOpen(false)}
        onImportSuccess={(newProducts) => {
          setProducts((prev) => [...newProducts, ...prev]);
        }}
      />

      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => {
          setIsAddStockOpen(false);
          setProductToRestock(null);
        }}
        product={productToRestock}
        onSaved={handleStockAdded}
      />

      {isAddWarehouseModalOpen && (
        <AddWarehouseModal
          warehouseToEdit={warehouseToEdit}
          onClose={() => {
            setIsAddWarehouseModalOpen(false);
            setWarehouseToEdit(null);
          }}
          onSuccess={(savedWarehouse) => {
            const mapped = mapWarehouse(savedWarehouse);
            setWarehouses(prev => {
              const isEdit = prev.some(w => w.id === mapped.id);
              const updated = isEdit
                ? prev.map(w => w.id === mapped.id ? mapped : w)
                : [...prev, mapped];
              return mapped.isDefault
                ? updated.map(w => w.id === mapped.id ? w : { ...w, isDefault: false })
                : updated;
            });
            setWarehouseToEdit(null);
          }}
        />
      )}

      <AiAdvisorDrawer
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        expenses={expenses}
        orders={orders}
        products={products}
      />
    </div>
  );
}
