import React, { useState, useEffect, useRef } from 'react';
import {
  Link,
  useLocation,
  useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../contexts/I18nContext';
import { 
  CreditCard,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Globe,
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  Clock,
  Database,
  Utensils,
  Package,
  SlidersHorizontal,
  PlusCircle,
  Boxes,
  BookOpen,
  Building2,
  Grid3X3,
  Tag,
  ShoppingCart,
  ClipboardCheck,
  Trash2,
  Wallet,
  TrendingUp,
  Receipt,
  BarChart2,
  FileText,
  DollarSign,
  LineChart,
  BadgePercent,
  Star,
  Settings,
  Users,
  ShieldCheck,
  Store,
  HardDriveDownload,
  Plug,
  HelpCircle,
  Bell,
  ChevronRight,
  Search,
  X,
  ArrowRight
} from '@/constants/icons';
import { api } from '../../../lib/api';
import bizoraLogo from '../../../assets/bizora-logo.png';
import KulinerAiFab from './KulinerAiFab';
import KulinerMobileBottomNav from './KulinerMobileBottomNav';
import KulinerMobileBottomSheet from './KulinerMobileBottomSheet';
import '../pages/KulinerDashboard.css';

const KULINER_SEARCH_ITEMS = [
  // Operasional & Kasir
  { id: 'pos', title: 'Kasir Restoran (POS)', subtitle: 'Point of Sales, meja & kasir langsung', path: '/kuliner/pos', category: 'Operasional', icon: ShoppingCart },
  { id: 'orders', title: 'Pesanan & Meja', subtitle: 'Monitoring pesanan aktif & dine-in', path: '/kuliner/admin/orders', category: 'Operasional', icon: ClipboardList },
  { id: 'kitchen', title: 'Kitchen Display (KDS)', subtitle: 'Antrean pesanan dapur secara realtime', path: '/kuliner/kitchen', category: 'Operasional', icon: ChefHat },
  { id: 'shift', title: 'Shift Kasir Resto', subtitle: 'Buka tutup shift & kas masuk kasir', path: '/kuliner/admin/shift', category: 'Operasional', icon: Clock },
  { id: 'tables', title: 'Denah & Meja', subtitle: 'Visual denah lantai & ketersediaan meja', path: '/kuliner/admin/tables', category: 'Operasional', icon: Grid3X3 },

  // Menu & Resep
  { id: 'categories', title: 'Kategori Hidangan', subtitle: 'Kategori menu makanan & minuman', path: '/kuliner/admin/categories', category: 'Menu & Resep', icon: Utensils },
  { id: 'bundles', title: 'Paket & Bundling', subtitle: 'Menu kombo & hemat', path: '/kuliner/admin/bundles', category: 'Menu & Resep', icon: Package },
  { id: 'modifiers', title: 'Grup Varian & Topping', subtitle: 'Varian level pedas, ukuran, topping', path: '/kuliner/admin/modifiers', category: 'Menu & Resep', icon: SlidersHorizontal },
  { id: 'addons', title: 'Addons Tambahan', subtitle: 'Item ekstra tambahan hidangan', path: '/kuliner/admin/addons', category: 'Menu & Resep', icon: PlusCircle },
  { id: 'recipes', title: 'Resep & BOM Hidangan', subtitle: 'Kalkulasi HPP & takaran bahan baku', path: '/kuliner/admin/recipes', category: 'Menu & Resep', icon: BookOpen },

  // Inventory Dapur
  { id: 'ingredients', title: 'Bahan Baku Dapur', subtitle: 'Stok bahan baku mentah & bumbu', path: '/kuliner/admin/ingredients', category: 'Inventory Dapur', icon: Boxes },
  { id: 'purchases', title: 'Pembelian Bahan (PO)', subtitle: 'Restock bahan baku & belanja pasar', path: '/kuliner/admin/purchases', category: 'Inventory Dapur', icon: ShoppingCart },
  { id: 'stock-opname', title: 'Stock Opname Bahan', subtitle: 'Audit fisik vs sistem bahan baku', path: '/kuliner/admin/stock-opname', category: 'Inventory Dapur', icon: ClipboardCheck },
  { id: 'waste', title: 'Limbah Sisa & Waste', subtitle: 'Pencatatan bahan rusak / kedaluwarsa', path: '/kuliner/admin/waste', category: 'Inventory Dapur', icon: Trash2 },
  { id: 'suppliers', title: 'Supplier Bahan Baku', subtitle: 'Daftar vendor & distributor resto', path: '/kuliner/admin/suppliers', category: 'Inventory Dapur', icon: Building2 },

  // Pemasaran & Pelanggan
  { id: 'promos', title: 'Promo & Diskon', subtitle: 'Voucher diskon & cashback pelanggan', path: '/kuliner/admin/promos', category: 'Marketing', icon: BadgePercent },
  { id: 'reviews', title: 'Ulasan & Feedback', subtitle: 'Rating & saran pelanggan restoran', path: '/kuliner/admin/reviews', category: 'Marketing', icon: Star },

  // Keuangan & Laporan
  { id: 'finance-summary', title: 'Laba Rugi Restoran', subtitle: 'Ringkasan omzet, HPP & profit bersih', path: '/kuliner/admin/finance-summary', category: 'Keuangan', icon: TrendingUp },
  { id: 'expenses', title: 'Buku Kas & Pengeluaran', subtitle: 'Catatan operasional & biaya dapur', path: '/kuliner/admin/expenses', category: 'Keuangan', icon: Wallet },
  { id: 'transactions', title: 'Riwayat Transaksi', subtitle: 'Log detail struk & transaksi kasir', path: '/kuliner/admin/transactions', category: 'Keuangan', icon: Receipt },
  { id: 'reports', title: 'Laporan Penjualan', subtitle: 'Statistik menu terlaris & grafik omzet', path: '/kuliner/admin/reports', category: 'Keuangan', icon: BarChart2 },
  { id: 'analytics', title: 'Menu Engineering Analytics', subtitle: 'Analisis profitabilitas matrix (Stars, Dogs)', path: '/kuliner/admin/analytics', category: 'Keuangan', icon: LineChart },

  // Pengaturan & Bantuan
  { id: 'staff', title: 'Pegawai & Staf Dapur', subtitle: 'Manajemen akun kasir, koki, waiter', path: '/kuliner/admin/staff', category: 'Pengaturan', icon: Users },
  { id: 'roles', title: 'Jabatan & Hak Akses', subtitle: 'Kelola izin akses modul resto', path: '/kuliner/admin/roles', category: 'Pengaturan', icon: ShieldCheck },
  { id: 'settings', title: 'Pengaturan Restoran', subtitle: 'Profil outlet, printer struk, pajak', path: '/kuliner/admin/settings', category: 'Pengaturan', icon: Settings },
  { id: 'backup', title: 'Backup Data Resto', subtitle: 'Pencadangan database restoran', path: '/kuliner/admin/backup', category: 'Pengaturan', icon: HardDriveDownload },
  { id: 'guide', title: 'Buku Panduan & SOP Resto', subtitle: 'Manual penggunaan modul kuliner', path: '/kuliner/admin/guide', category: 'Bantuan', icon: BookOpen },
  { id: 'subscription', title: 'Paket Langganan', subtitle: 'Status paket & upgrade fitur', path: '/kuliner/subscription', category: 'Bantuan', icon: CreditCard },
];

function KulinerCommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = query.trim()
    ? KULINER_SEARCH_ITEMS.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : KULINER_SEARCH_ITEMS;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    navigate(item.path);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        animation: 'kd-fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'kd-fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu resto, aksi cepat, bahan baku... (Ketik atau pilih)"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: 500,
              color: '#1e293b',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            background: '#e2e8f0',
            color: '#64748b',
            padding: '2px 8px',
            borderRadius: 6,
            fontFamily: 'monospace'
          }}>
            ESC
          </span>
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13.5 }}>
              Tidak ada menu resto yang cocok dengan "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    background: isSelected ? '#fdf8ec' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: isSelected ? '#b48c36' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: isSelected ? 700 : 600, color: isSelected ? '#b48c36' : '#1e293b' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    background: isSelected ? '#faedd0' : '#f1f5f9',
                    color: isSelected ? '#936a1e' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: 11.5,
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span>↑↓ Navigasi</span>
            <span>↵ Buka</span>
          </div>
          <span>Modul Kuliner Bizora</span>
        </div>
      </div>
    </div>
  );
}

function CollapsedGroupFlyout({ section, anchorY, onClose, pathname }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  if (!section) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: 72,
        top: Math.max(8, Math.min(anchorY, window.innerHeight - 320)),
        zIndex: 1100,
        minWidth: 200,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: 6,
      }}
    >
      <div style={{ padding: '6px 12px 8px', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
        {section.title}
      </div>
      {section.items.map(item => {
        const isActive = pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`kd-nav-item ${isActive ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              textDecoration: 'none',
              color: isActive ? '#b48c36' : '#334155',
              background: isActive ? '#fefce8' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              transition: 'background 0.15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#b48c36' : '#64748b' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

const KulinerAdminLayout = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isImpersonating, exitImpersonate, logout, updateUser } = useAuth();
  const { t, language, toggleLanguage } = useTranslation();

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    const titles = {
      '/kuliner/admin': 'Dashboard Resto',
      '/kuliner/admin/orders': 'Pesanan Masuk',
      '/kuliner/admin/kitchen-queue': 'Antrean Dapur (KDS)',
      '/kuliner/admin/shift': 'Manajemen Shift Kasir',
      '/kuliner/admin/stock-opname': 'Stok Opname Bahan',
      '/kuliner/admin/waste': 'Pencatatan Waste & Basi',
      '/kuliner/admin/purchases': 'Pembelian Bahan Baku (PO)',
      '/kuliner/admin/categories': 'Kategori & Menu Makanan',
      '/kuliner/admin/modifiers': 'Modifier & Varian',
      '/kuliner/admin/addons': 'Add-on & Tambahan',
      '/kuliner/admin/bundles': 'Paket Menu / Bundling',
      '/kuliner/admin/ingredients': 'Daftar Bahan Baku',
      '/kuliner/admin/recipes': 'Resep & HPP Otomatis',
      '/kuliner/admin/suppliers': 'Master Supplier Bahan',
      '/kuliner/admin/finance-categories': 'Kategori Keuangan Kas',
      '/kuliner/admin/tables': 'Manajemen Meja Dine-In',
      '/kuliner/admin/finance-summary': 'Laporan Laba Rugi',
      '/kuliner/admin/expenses': 'Pencatatan Kas',
      '/kuliner/admin/reports': 'Laba & Margin Menu',
      '/kuliner/admin/reports-advanced': 'Laporan Lengkap Resto',
      '/kuliner/admin/analytics': 'Analitik Penjualan',
      '/kuliner/admin/transactions': 'Jurnal Transaksi Kas',
      '/kuliner/admin/promos': 'Manajemen Promo & Diskon',
      '/kuliner/admin/reviews': 'Ulasan & Rating',
      '/kuliner/admin/staff': 'Manajemen Staf',
      '/kuliner/admin/roles': 'Hak Akses & Role',
      '/kuliner/admin/settings': 'Pengaturan Toko',
      '/kuliner/admin/backup': 'Backup Data Toko',
      '/kuliner/admin/support': 'Pusat Bantuan',
      '/kuliner/admin/guide': 'Buku Panduan & SOP',
      '/kuliner/admin/profile': 'Pengaturan Profil',
      '/kuliner/subscription': 'Paket Langganan'
    };
    return titles[path] || 'Admin Resto';
  };
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('kuliner_sidebar_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {}
    return window.innerWidth < 1200;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [flyoutAnchorY, setFlyoutAnchorY] = useState(60);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Global Ctrl+K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  useEffect(() => {
    if (!showNotif) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);
  // Prioritize user data from context for instant display
  const [storeName, setStoreName] = useState(user?.tenant_name || user?.name || 'Toko Kuliner');

  useEffect(() => {
    if (user?.tenant_name || user?.name) {
      setStoreName(user.tenant_name || user.name);
    }
  }, [user]);

  const [openGroups, setOpenGroups] = useState({
    operational: false,
    menuResep: false,
    inventory: false,
    marketing: false,
    financeReports: false,
    staff: false,
    settings: false,
    support: false
  });

  useEffect(() => {
    const path = location.pathname;
    const isMatch = (paths) => paths.some(p => path === p || (p !== '/kuliner/admin' && path.startsWith(p + '/')));
    setOpenGroups({
      operational: isMatch(['/kuliner/admin/orders', '/kuliner/admin/kitchen-queue', '/kuliner/admin/shift', '/kuliner/admin/tables']),
      menuResep: isMatch(['/kuliner/admin/categories', '/kuliner/admin/bundles', '/kuliner/admin/modifiers', '/kuliner/admin/addons', '/kuliner/admin/recipes']),
      inventory: isMatch(['/kuliner/admin/ingredients', '/kuliner/admin/purchases', '/kuliner/admin/stock-opname', '/kuliner/admin/waste', '/kuliner/admin/suppliers']),
      marketing: isMatch(['/kuliner/admin/promos', '/kuliner/admin/reviews']),
      financeReports: isMatch(['/kuliner/admin/finance-summary', '/kuliner/admin/expenses', '/kuliner/admin/transactions', '/kuliner/admin/reports', '/kuliner/admin/reports-advanced', '/kuliner/admin/analytics', '/kuliner/admin/finance-categories']),
      staff: isMatch(['/kuliner/admin/staff', '/kuliner/admin/roles']),
      settings: isMatch(['/kuliner/admin/settings', '/kuliner/admin/backup', '/kuliner/admin/developer-api']),
      support: isMatch(['/kuliner/admin/guide', '/kuliner/subscription', '/kuliner/admin/support'])
    });
  }, [location.pathname]);

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Sync storeName with user context whenever it changes
  useEffect(() => {
    if (user?.tenant_name) {
      setStoreName(user.tenant_name);
    }
  }, [user?.tenant_name]);

  const [planFeatures, setPlanFeatures] = useState(null);

  useEffect(() => {
    api.get('/subscription/current')
      .then(res => {
        if (res.data?.features) {
          setPlanFeatures(res.data.features);
        }
      })
      .catch(() => {});
  }, []);

  const handleExitImpersonate = () => {
    const redirectPath = exitImpersonate();
    navigate(redirectPath);
  };

  const hasPermission = (permId) => {
    // Owners and Super Admins have all permissions
    if (user?.role === 'customer' || user?.role === 'super_admin' || user?.permissions === 'all') {
      return true;
    }
    const perms = user?.kulinerRole?.permissions || [];
    return perms.some(p => p === permId || p === `${permId}.*` || p.startsWith(`${permId}.`));
  };

  const isFeatureAllowed = (featureKey) => {
    if (!planFeatures) return true;
    if (planFeatures[featureKey] !== undefined) {
      return Boolean(planFeatures[featureKey]);
    }
    return true;
  };

  const DEMO_EMAILS = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','seller@demo.com']
  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || user?.email?.startsWith('demo-kuliner-') || DEMO_EMAILS.includes(user?.email) || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'));

  const handleLogout = () => {
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate();
      window.location.href = redirectPath || '/tenants';
    } else {
      try { logout(); } catch {}
      window.location.href = isDemo ? '/' : '/login';
    }
  };

  // Close sidebar and reset scroll of main container instantly on route change
  useEffect(() => {
    setSidebarOpen(false);
    setIsBottomSheetOpen(false);
    setOpenSection(null);
    document.querySelector('.kd-main')?.scrollTo(0, 0);
  }, [location.pathname]);

  const handleGroupIconClick = (sectionId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutAnchorY(rect.top);
    setOpenSection(prev => prev === sectionId ? null : sectionId);
  };

  const navSections = [
    {
      id: 'operational',
      title: 'Operasional Kasir & Dapur',
      icon: <UtensilsCrossed size={16} />,
      items: [
        hasPermission('orders') && { path: '/kuliner/admin/orders', icon: <ClipboardList size={15} />, label: t('sidebar.ordersCashier') },
        hasPermission('orders') && { path: '/kuliner/admin/kitchen-queue', icon: <ChefHat size={15} />, label: t('sidebar.kitchenQueue') },
        hasPermission('shift') && { path: '/kuliner/admin/shift', icon: <Clock size={15} />, label: t('sidebar.cashierShift') },
        hasPermission('orders') && { path: '/kuliner/admin/tables', icon: <Grid3X3 size={15} />, label: t('sidebar.tableQrOrder') },
      ].filter(Boolean)
    },
    {
      id: 'menuResep',
      title: 'Menu & Resep (HPP)',
      icon: <Utensils size={16} />,
      items: [
        hasPermission('menu') && { path: '/kuliner/admin/categories', icon: <Utensils size={15} />, label: t('sidebar.menuProducts') },
        hasPermission('bundles') && { path: '/kuliner/admin/bundles', icon: <Package size={15} />, label: t('sidebar.bundlePackage') },
        hasPermission('modifiers') && { path: '/kuliner/admin/modifiers', icon: <SlidersHorizontal size={15} />, label: t('sidebar.menuModifiers') },
        hasPermission('addons') && { path: '/kuliner/admin/addons', icon: <PlusCircle size={15} />, label: t('sidebar.addonTopping') },
        hasPermission('recipes') && { path: '/kuliner/admin/recipes', icon: <BookOpen size={15} />, label: t('sidebar.recipesBom') },
      ].filter(Boolean)
    },
    {
      id: 'inventory',
      title: 'Bahan Baku & Stok',
      icon: <Boxes size={16} />,
      items: [
        hasPermission('ingredients') && { path: '/kuliner/admin/ingredients', icon: <Boxes size={15} />, label: t('sidebar.rawIngredients') },
        hasPermission('ingredients') && { path: '/kuliner/admin/purchases', icon: <ShoppingCart size={15} />, label: 'Pembelian Bahan (PO)' },
        hasPermission('ingredients') && { path: '/kuliner/admin/stock-opname', icon: <ClipboardCheck size={15} />, label: t('sidebar.stockOpname') },
        hasPermission('ingredients') && { path: '/kuliner/admin/waste', icon: <Trash2 size={15} />, label: t('sidebar.wasteManagement') },
        hasPermission('ingredients') && { path: '/kuliner/admin/suppliers', icon: <Building2 size={15} />, label: 'Supplier Bahan' },
      ].filter(Boolean)
    },
    {
      id: 'marketing',
      title: 'Pemasaran & Loyalitas',
      icon: <Sparkles size={16} />,
      items: [
        hasPermission('reports') && { path: '/kuliner/admin/promos', icon: <BadgePercent size={15} />, label: 'Promo & Diskon' },
        hasPermission('reports') && { path: '/kuliner/admin/reviews', icon: <Star size={15} />, label: 'Ulasan & Rating' },
      ].filter(Boolean)
    },
    {
      id: 'financeReports',
      title: 'Keuangan & Laporan',
      icon: <Wallet size={16} />,
      items: [
        hasPermission('reports') && { path: '/kuliner/admin/finance-summary', icon: <TrendingUp size={15} />, label: 'Laporan Laba Rugi' },
        hasPermission('reports') && { path: '/kuliner/admin/expenses', icon: <Wallet size={15} />, label: 'Pencatatan Kas' },
        hasPermission('reports') && { path: '/kuliner/admin/transactions', icon: <Receipt size={15} />, label: 'Jurnal Transaksi Kas' },
        hasPermission('reports') && { path: '/kuliner/admin/finance-categories', icon: <Tag size={15} />, label: 'Kategori Keuangan Kas' },
        hasPermission('reports') && { path: '/kuliner/admin/reports', icon: <BarChart2 size={15} />, label: 'Laba & Margin Menu' },
        hasPermission('reports') && { path: '/kuliner/admin/reports-advanced', icon: <FileText size={15} />, label: 'Laporan Lengkap Resto' },
        hasPermission('reports') && { path: '/kuliner/admin/analytics', icon: <LineChart size={15} />, label: 'Analitik Penjualan' },
      ].filter(Boolean)
    },
    {
      id: 'staff',
      title: 'Karyawan & Akses',
      icon: <Users size={16} />,
      items: [
        hasPermission('staff') && { path: '/kuliner/admin/staff', icon: <Users size={15} />, label: 'Manajemen Staf' },
        hasPermission('staff') && { path: '/kuliner/admin/roles', icon: <ShieldCheck size={15} />, label: 'Kelola Role' },
      ].filter(Boolean)
    },
    {
      id: 'settings',
      title: 'Pengaturan & Sistem',
      icon: <Settings size={16} />,
      items: [
        hasPermission('settings') && { path: '/kuliner/admin/settings', icon: <Store size={15} />, label: t('sidebar.storeConfig') },
        hasPermission('settings') && { path: '/kuliner/admin/backup', icon: <HardDriveDownload size={15} />, label: 'Backup Data Toko' },
        { path: '/kuliner/admin/developer-api', icon: <Plug size={15} />, label: 'Integrasi API & Webhook' },
      ].filter(Boolean)
    },
    {
      id: 'support',
      title: 'Bantuan & Langganan',
      icon: <HelpCircle size={16} />,
      items: [
        { path: '/kuliner/admin/guide', icon: <BookOpen size={15} />, label: 'Buku Panduan & SOP' },
        { path: '/kuliner/subscription', icon: <CreditCard size={15} />, label: 'Paket Langganan' },
        { path: '/kuliner/admin/support', icon: <HelpCircle size={15} />, label: t('sidebar.helpCenter') },
      ].filter(Boolean)
    }
  ].filter(sec => sec.items.length > 0);

  return (
    <div className="kd-body">

      <div className={`kd-dashboard ${collapsed ? 'kd-dashboard--collapsed' : ''}`}>
        {/* OVERLAY */}
        <div className={`kd-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        {/* SIDEBAR */}
        <aside className={`kd-sidebar ${collapsed ? 'kd-sidebar--collapsed' : ''} ${sidebarOpen ? 'active' : ''}`}>
          <Link 
            to="/kuliner/admin" 
            className="kd-brand" 
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', width: '100%', minHeight: 68, borderBottom: '1px solid var(--border-default, #e2e8f0)' }}
            onClick={(e) => {
              if (location.pathname === '/kuliner/admin') {
                e.preventDefault();
                document.querySelector('.kd-main')?.scrollTo(0, 0);
              }
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <img 
                src={user?.store_icon_url || bizoraLogo} 
                alt="Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
          </Link>
          <nav>
            {/* Dashboard + Storefront */}
            <div className="kd-nav-section" style={{ marginBottom: 10 }}>
              <Link 
                to="/kuliner/admin" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin' ? 'active' : ''}`}
                title={collapsed ? t('sidebar.dashboard') : undefined}
                style={{ justifyContent: collapsed ? 'center' : undefined, paddingLeft: collapsed ? 0 : undefined }}
              >
                <span className="kd-nav-icon"><LayoutDashboard size={16} /></span>
                {!collapsed && <span>{t('sidebar.dashboard')}</span>}
              </Link>
              {hasPermission('storefront') && isFeatureAllowed('storefront') && (
                <Link 
                  to={`/kuliner?tenant_id=${user?.tenant_id}`} 
                  target="_blank" 
                  className="kd-nav-item"
                  title={collapsed ? t('sidebar.viewStorefront') : undefined}
                  style={{ justifyContent: collapsed ? 'center' : undefined, paddingLeft: collapsed ? 0 : undefined }}
                >
                  <span className="kd-nav-icon"><Globe size={16} /></span>
                  {!collapsed && <span>{t('sidebar.viewStorefront')}</span>}
                </Link>
              )}
            </div>

            {navSections.map(section => {
              const hasActive = section.items.some(i => location.pathname === i.path || (i.path !== '/kuliner/admin' && location.pathname.startsWith(i.path + '/')));
              const isExpanded = openGroups[section.id];

              if (collapsed && !sidebarOpen) {
                return (
                  <div key={section.id} className="kd-nav-section" style={{ marginBottom: 4 }}>
                    <div
                      className={`kd-nav-group-header ${openSection === section.id || hasActive ? 'active' : ''}`}
                      onClick={(e) => handleGroupIconClick(section.id, e)}
                      title={section.title}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="kd-nav-icon">
                        {section.icon}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={section.id} className="kd-nav-section" style={{ marginBottom: 8 }}>
                  <div 
                    className={`kd-nav-group-header ${hasActive ? 'active' : ''}`} 
                    onClick={() => toggleGroup(section.id)}
                  >
                    <div className="kd-nav-group-title-container">
                      <span className="kd-nav-icon">{section.icon}</span>
                      <span className="kd-nav-group-title">{section.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {hasActive && !isExpanded && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b48c36', display: 'inline-block' }} title="Menu aktif" />
                      )}
                      <ChevronRight size={13} className={`kd-nav-group-arrow ${isExpanded ? 'open' : ''}`} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="kd-nav-group-items">
                      {section.items.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`kd-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                          onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}
                        >
                          <span className="kd-nav-icon">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* FLYOUT MENU FOR COLLAPSED SIDEBAR */}
        {collapsed && !sidebarOpen && openSection && (() => {
          const sec = navSections.find(s => s.id === openSection);
          if (!sec) return null;
          return (
            <div 
              className="kd-sidebar-flyout"
              style={{
                position: 'fixed',
                left: 72,
                top: Math.min(Math.max(flyoutAnchorY, 60), window.innerHeight - 350),
                width: 220,
                background: '#ffffff',
                borderRadius: '0 12px 12px 0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                borderLeft: 'none',
                zIndex: 1000,
                padding: '8px 0',
                animation: 'kd-fadeIn 0.15s ease-out'
              }}
              onMouseLeave={() => setOpenSection(null)}
            >
              <div style={{ padding: '6px 16px 8px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                {sec.title}
              </div>
              {sec.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpenSection(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: location.pathname === item.path ? '#b48c36' : '#334155',
                    background: location.pathname === item.path ? '#fdf8ec' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: location.pathname === item.path ? 600 : 500
                  }}
                >
                  <span style={{ color: location.pathname === item.path ? '#b48c36' : '#64748b', display: 'flex' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          );
        })()}

        <main className="kd-main">
          {/* STICKY TOPBAR HEADER */}
          <header className="kd-mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
              <button 
                className="kd-hamburger" 
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsBottomSheetOpen(v => !v);
                  } else if (window.innerWidth < 1025) {
                    setSidebarOpen(v => !v);
                  } else {
                    setCollapsed(v => {
                      const next = !v;
                      try {
                        localStorage.setItem('kuliner_sidebar_collapsed', String(next));
                      } catch (e) {}
                      return next;
                    });
                  }
                }}
                title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              <div style={{ flex: 'none', maxWidth: 280, minWidth: 0 }}>
                <h1 className="kd-navtop-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getPageTitle()}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-1.5 rounded-xl text-slate-500 text-xs font-medium transition-all shadow-2xs ml-1 cursor-pointer"
                title="Buka Pencarian Menu (Ctrl + K)"
              >
                <Search size={14} className="text-slate-400" />
                <span className="text-slate-600">Cari menu resto, aksi, data...</span>
                <kbd className="bg-white border border-slate-300 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-slate-500 font-mono shadow-2xs">
                  Ctrl K
                </kbd>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Notification Bell — dropdown panel */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotif(v => !v)}
                style={{
                  position: 'relative',
                  width: 38, height: 38,
                  borderRadius: 10,
                  background: showNotif ? '#f1f5f9' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Notifikasi"
              >
                <Bell size={18} color="#64748b" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#ef4444', border: '1.5px solid white',
                  }} />
                )}
              </button>

              {/* Dropdown notification panel */}
              {showNotif && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 320,
                  maxWidth: 'calc(100vw - 24px)',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                  zIndex: 300,
                  overflow: 'hidden',
                  animation: 'kd-fadeIn 0.15s ease',
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px 12px',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Notifikasi</h4>
                    <button
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#b48c36', fontWeight: 600 }}
                    >
                      Tandai dibaca
                    </button>
                  </div>
                  {/* Items */}
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                        Belum ada notifikasi.
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f8fafc',
                        cursor: 'default',
                        transition: 'background 0.15s',
                        background: n.read_at ? 'transparent' : '#fffbeb',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background=n.read_at ? 'transparent' : '#fffbeb'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                            color: n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#10b981' : '#3b82f6',
                          }}>{n.title}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(n.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.4 }}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                  {/* Footer */}
                  <div style={{ padding: '10px 16px', background: '#f8fafc', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowNotif(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#b48c36' }}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '4px 6px 4px 10px',
                  borderRadius: 10,
                  background: showProfileMenu ? '#fdf8ec' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#b48c36',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  flexShrink: 0,
                  position: 'relative',
                  boxShadow: '0 2px 6px rgba(180, 140, 54, 0.35)',
                }}>
                  {(storeName || user?.tenant_name || user?.name || 'DK')
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'DK'}
                  <span 
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      background: '#22c55e',
                      borderRadius: '50%',
                      border: '2px solid #ffffff'
                    }} 
                  />
                </div>
                <div className="kd-profile-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {storeName || user?.tenant_name || user?.name || 'Toko Kuliner'}
                    </span>
                    <span style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: user?.subscription_plan === 'pro' 
                        ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' 
                        : user?.subscription_plan === 'basic' 
                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                        : '#475569',
                      color: '#ffffff',
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {user?.subscription_plan === 'pro' ? 'PRO' : user?.subscription_plan === 'basic' ? 'BASIC' : 'FREE'}
                    </span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: '#8592a3', marginTop: 1, display: 'block' }}>
                    {user?.business_category || 'Toko Kuliner'}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 290,
                    maxWidth: 'calc(100vw - 24px)',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 20,
                    padding: '16px 18px',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
                    zIndex: 200,
                    animation: 'kd-fadeIn 0.15s ease',
                    fontSize: 12.5,
                  }}
                >
                  {/* User Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #b48c36, #d4a853)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(180, 140, 54, 0.3)',
                      }}
                    >
                      {(user?.name || 'DK')
                        .split(' ')
                        .filter(Boolean)
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'DK'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name || 'Pengguna Kuliner'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email || 'kuliner@bizora.id'}
                      </div>
                    </div>
                  </div>

                  {/* Info Details */}
                  <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Toko:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right', fontSize: 12.5 }}>
                        {storeName || user?.tenant_name || '-'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Status Paket:</span>
                      <span style={{ fontWeight: 700, color: '#b48c36', textTransform: 'capitalize', fontSize: 12.5 }}>
                        {user?.subscription_plan || 'Free'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Kategori Bisnis:</span>
                      <span style={{ fontWeight: 700, color: '#b48c36', fontSize: 12.5 }}>
                        {user?.business_category || 'Kuliner / Resto'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/kuliner/subscription');
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #b48c36, #9c772d)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 2px 8px rgba(180, 140, 54, 0.25)',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <CreditCard size={15} />
                      <span>Upgrade & Paket Langganan</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/kuliner/admin/profile');
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: '#fffbeb',
                        color: '#b48c36',
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: '1px solid #fef3c7',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fffbeb'}
                    >
                      <span>Pengaturan Akun</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: '#fef2f2',
                        color: '#e11d48',
                        fontWeight: 700,
                        fontSize: 12.5,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                    >
                      <LogOut size={15} />
                      <span>
                        {isImpersonating && isImpersonating()
                          ? 'Keluar dari Impersonate'
                          : isDemo
                          ? 'Keluar dari Akun Demo'
                          : 'Keluar'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </header>

          {children}

          {/* Mobile Bottom Clearance Spacer so bottom-most content is never covered by bottom nav */}
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
        </main>
      </div>

      <KulinerCommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
      <KulinerAiFab />

      {/* Mobile Bottom Navigation & Slide-up Sheet */}
      <KulinerMobileBottomNav
        onToggleMore={() => setIsBottomSheetOpen(prev => !prev)}
        isSheetOpen={isBottomSheetOpen}
      />
      <KulinerMobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      />
    </div>
  );
};

export default KulinerAdminLayout;
