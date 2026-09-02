import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../contexts/I18nContext';
import { api } from '../../../lib/api';
import { CreditCard, LogOut } from 'lucide-react';
import '../pages/KulinerDashboard.css';

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
      '/kuliner/admin/analytics': 'Analitik Penjualan',
      '/kuliner/admin/transactions': 'Jurnal Transaksi Kas',
      '/kuliner/admin/promos': 'Manajemen Promo & Diskon',
      '/kuliner/admin/reviews': 'Ulasan & Rating',
      '/kuliner/admin/staff': 'Manajemen Staf',
      '/kuliner/admin/roles': 'Hak Akses & Role',
      '/kuliner/admin/settings': 'Pengaturan Toko',
      '/kuliner/admin/backup': 'Backup Data Toko',
      '/kuliner/admin/support': 'Pusat Bantuan',
      '/kuliner/admin/profile': 'Pengaturan Profil',
      '/kuliner/subscription': 'Paket Langganan'
    };
    return titles[path] || 'Admin Resto';
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const notifRef = useRef(null);

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

  const [openGroups, setOpenGroups] = useState({
    operational: false,
    inventory: false,
    masterData: false,
    finance: false,
    reports: false,
    marketing: false,
    settings: false
  });

  useEffect(() => {
    const path = location.pathname;
    setOpenGroups({
      operational: path === '/kuliner/admin/orders' || path === '/kuliner/admin/kitchen-queue' || path === '/kuliner/admin/shift',
      inventory: path === '/kuliner/admin/stock-opname' || path === '/kuliner/admin/waste' || path === '/kuliner/admin/purchases',
      masterData: path === '/kuliner/admin/categories' || path === '/kuliner/admin/modifiers' || path === '/kuliner/admin/addons' || path === '/kuliner/admin/bundles' || path === '/kuliner/admin/ingredients' || path === '/kuliner/admin/recipes' || path === '/kuliner/admin/suppliers' || path === '/kuliner/admin/finance-categories' || path === '/kuliner/admin/tables',
      finance: path === '/kuliner/admin/finance-summary' || path === '/kuliner/admin/expenses',
      reports: path === '/kuliner/admin/reports' || path === '/kuliner/admin/analytics' || path === '/kuliner/admin/transactions' || path === '/kuliner/admin/reports-advanced',
      marketing: path === '/kuliner/admin/promos' || path === '/kuliner/admin/reviews',
      settings: path === '/kuliner/admin/staff' || path === '/kuliner/admin/roles' || path === '/kuliner/admin/settings' || path === '/kuliner/admin/backup' || path === '/kuliner/admin/support'
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
    document.querySelector('.kd-main')?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="kd-body">

      <div className="kd-dashboard">
        {/* OVERLAY */}
        <div className={`kd-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

        {/* SIDEBAR */}
        <aside className={`kd-sidebar ${sidebarOpen ? 'active' : ''}`}>
          <Link 
            to="/kuliner/admin" 
            className="kd-logo" 
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            onClick={(e) => {
              if (location.pathname === '/kuliner/admin') {
                e.preventDefault();
                document.querySelector('.kd-main')?.scrollTo(0, 0);
              }
            }}
          >
            <h1>{storeName}</h1>
            <p>Admin Control Panel</p>
          </Link>
          <nav>
            {/* Dashboard + Storefront */}
            <div className="kd-nav-section" style={{ marginBottom: 12 }}>
              <Link 
                to="/kuliner/admin" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin' ? 'active' : ''}`}
              >
                <span className="kd-nav-icon">📊</span>
                <span>{t('sidebar.dashboard')}</span>
              </Link>
              {hasPermission('storefront') && isFeatureAllowed('storefront') && (
                <Link to={`/kuliner?tenant_id=${user?.tenant_id}`} target="_blank" className="kd-nav-item">
                  <span className="kd-nav-icon">🌐</span>
                  <span>{t('sidebar.viewStorefront')}</span>
                </Link>
              )}
            </div>

            {/* Operasional & Kasir */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div 
                className="kd-nav-group-header" 
                onClick={() => toggleGroup('operational')}
              >
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">🍽️</span>
                  <span className="kd-nav-group-title">{t('sidebar.operationalStore')}</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.operational ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.operational && (
                <div className="kd-nav-group-items">
                  {hasPermission('orders') && (
                    <Link to="/kuliner/admin/orders" className={`kd-nav-item ${location.pathname === '/kuliner/admin/orders' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">📋</span><span>{t('sidebar.ordersCashier')}</span>
                    </Link>
                  )}
                  {hasPermission('orders') && (
                    <Link to="/kuliner/admin/kitchen-queue" className={`kd-nav-item ${location.pathname === '/kuliner/admin/kitchen-queue' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">👨‍🍳</span><span>{t('sidebar.kitchenQueue')}</span>
                    </Link>
                  )}
                  {hasPermission('shift') && (
                    <Link to="/kuliner/admin/shift" className={`kd-nav-item ${location.pathname === '/kuliner/admin/shift' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🗄️</span><span>{t('sidebar.cashierShift')}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Master Data */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div className="kd-nav-group-header" onClick={() => toggleGroup('masterData')}>
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">🗃️</span>
                  <span className="kd-nav-group-title">Master Data</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.masterData ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.masterData && (
                <div className="kd-nav-group-items">
                  {hasPermission('menu') && (
                    <Link to="/kuliner/admin/categories" className={`kd-nav-item ${location.pathname === '/kuliner/admin/categories' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🍕</span><span>{t('sidebar.menuProducts')}</span>
                    </Link>
                  )}
                  {hasPermission('bundles') && (
                    <Link to="/kuliner/admin/bundles" className={`kd-nav-item ${location.pathname === '/kuliner/admin/bundles' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🎁</span><span>{t('sidebar.bundlePackage')}</span>
                    </Link>
                  )}
                  {hasPermission('modifiers') && (
                    <Link to="/kuliner/admin/modifiers" className={`kd-nav-item ${location.pathname === '/kuliner/admin/modifiers' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🎛️</span><span>{t('sidebar.menuModifiers')}</span>
                    </Link>
                  )}
                  {hasPermission('addons') && (
                    <Link to="/kuliner/admin/addons" className={`kd-nav-item ${location.pathname === '/kuliner/admin/addons' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">➕</span><span>{t('sidebar.addonTopping')}</span>
                    </Link>
                  )}
                  {hasPermission('ingredients') && (
                    <Link to="/kuliner/admin/ingredients" className={`kd-nav-item ${location.pathname === '/kuliner/admin/ingredients' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🧅</span><span>{t('sidebar.rawIngredients')}</span>
                    </Link>
                  )}
                  {hasPermission('recipes') && (
                    <Link to="/kuliner/admin/recipes" className={`kd-nav-item ${location.pathname === '/kuliner/admin/recipes' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">📝</span><span>{t('sidebar.recipesBom')}</span>
                    </Link>
                  )}
                  {hasPermission('ingredients') && (
                    <Link to="/kuliner/admin/suppliers" className={`kd-nav-item ${location.pathname === '/kuliner/admin/suppliers' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🏢</span><span>Supplier Bahan</span>
                    </Link>
                  )}
                  {hasPermission('orders') && (
                    <Link to="/kuliner/admin/tables" className={`kd-nav-item ${location.pathname === '/kuliner/admin/tables' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🪑</span><span>{t('sidebar.tableQrOrder')}</span>
                    </Link>
                  )}
                  {hasPermission('reports') && (
                    <Link 
                      to="/kuliner/admin/finance-categories" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/finance-categories' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">🏷️</span>
                      <span>Kategori Keuangan</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Manajemen Inventaris */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div className="kd-nav-group-header" onClick={() => toggleGroup('inventory')}>
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">📦</span>
                  <span className="kd-nav-group-title">{t('sidebar.inventoryManagement')}</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.inventory ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.inventory && (
                <div className="kd-nav-group-items">
                  {hasPermission('ingredients') && (
                    <Link to="/kuliner/admin/purchases" className={`kd-nav-item ${location.pathname === '/kuliner/admin/purchases' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🛒</span><span>Pembelian Bahan</span>
                    </Link>
                  )}
                  {hasPermission('ingredients') && (
                    <Link to="/kuliner/admin/stock-opname" className={`kd-nav-item ${location.pathname === '/kuliner/admin/stock-opname' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">📋</span><span>{t('sidebar.stockOpname')}</span>
                    </Link>
                  )}
                  {hasPermission('ingredients') && (
                    <Link to="/kuliner/admin/waste" className={`kd-nav-item ${location.pathname === '/kuliner/admin/waste' ? 'active' : ''}`}>
                      <span className="kd-nav-icon">🗑️</span><span>{t('sidebar.wasteManagement')}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Keuangan Bisnis */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div 
                className="kd-nav-group-header" 
                onClick={() => toggleGroup('finance')}
              >
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">💰</span>
                  <span className="kd-nav-group-title">Keuangan Bisnis</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.finance ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.finance && (
                <div className="kd-nav-group-items">
                  {hasPermission('reports') && (
                    <Link 
                      to="/kuliner/admin/finance-summary" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/finance-summary' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">📈</span>
                      <span>Laba Rugi</span>
                    </Link>
                  )}
                  {hasPermission('reports') && (
                    <Link 
                      to="/kuliner/admin/expenses" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/expenses' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">📉</span>
                      <span>Pencatatan Kas</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Laporan & Analitik */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div 
                className="kd-nav-group-header" 
                onClick={() => toggleGroup('reports')}
              >
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">📊</span>
                  <span className="kd-nav-group-title">Laporan & Analitik</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.reports ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.reports && (
                <div className="kd-nav-group-items">
                  {hasPermission('reports') && (
                    <Link 
                      to="/kuliner/admin/reports" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/reports' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">💵</span>
                      <span>{t('sidebar.salesReports')}</span>
                    </Link>
                  )}
                  {hasPermission('reports') && (
                    <Link
                      to="/kuliner/admin/reports-advanced"
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/reports-advanced' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">💰</span>
                      <span>Laba & Margin Menu</span>
                    </Link>
                  )}
                  {hasPermission('analytics') && (
                    <Link 
                      to="/kuliner/admin/analytics" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/analytics' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">📈</span>
                      <span>{t('sidebar.businessAnalytics')}</span>
                    </Link>
                  )}
                  {hasPermission('reports') && (
                    <Link
                      to="/kuliner/admin/transactions"
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/transactions' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">🧾</span>
                      <span>{t('sidebar.transactionList')}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Pemasaran & Pelanggan */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div 
                className="kd-nav-group-header" 
                onClick={() => toggleGroup('marketing')}
              >
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">🎁</span>
                  <span className="kd-nav-group-title">Pemasaran & Loyalitas</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.marketing ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.marketing && (
                <div className="kd-nav-group-items">
                  {hasPermission('reports') && (
                    <Link
                      to="/kuliner/admin/promos"
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/promos' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">🏷️</span>
                      <span>Kelola Promo</span>
                    </Link>
                  )}
                  {hasPermission('reports') && (
                    <Link
                      to="/kuliner/admin/reviews"
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/reviews' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">⭐</span>
                      <span>Moderasi Testimoni</span>
                    </Link>
                  )}
                </div>
              )}
            </div>



            {/* Pengaturan & Akun */}
            <div className="kd-nav-section" style={{ marginBottom: 8 }}>
              <div 
                className="kd-nav-group-header" 
                onClick={() => toggleGroup('settings')}
              >
                <div className="kd-nav-group-title-container">
                  <span className="kd-nav-icon">⚙️</span>
                  <span className="kd-nav-group-title">{t('sidebar.storeSettings')}</span>
                </div>
                <span className={`kd-nav-group-arrow ${openGroups.settings ? 'open' : ''}`}>▶</span>
              </div>
              {openGroups.settings && (
                <div className="kd-nav-group-items">
                  {hasPermission('staff') && (
                    <Link 
                      to="/kuliner/admin/staff" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/staff' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">👥</span>
                      <span>{t('sidebar.manageStaff')}</span>
                    </Link>
                  )}
                  {hasPermission('staff') && (
                    <Link 
                      to="/kuliner/admin/roles" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/roles' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">🛡️</span>
                      <span>Kelola Role</span>
                    </Link>
                  )}
                  {hasPermission('settings') && (
                    <Link 
                      to="/kuliner/admin/settings" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/settings' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">🏢</span>
                      <span>{t('sidebar.storeConfig')}</span>
                    </Link>
                  )}
                  {hasPermission('settings') && (
                    <Link 
                      to="/kuliner/admin/backup" 
                      className={`kd-nav-item ${location.pathname === '/kuliner/admin/backup' ? 'active' : ''}`}
                    >
                      <span className="kd-nav-icon">🛡️</span>
                      <span>Backup Data Toko</span>
                    </Link>
                  )}
                  <Link 
                    to="/kuliner/subscription" 
                    className={`kd-nav-item ${location.pathname === '/kuliner/subscription' ? 'active' : ''}`}
                  >
                    <span className="kd-nav-icon">💳</span>
                    <span>Paket Langganan</span>
                  </Link>
                  <Link 
                    to="/kuliner/admin/support" 
                    className={`kd-nav-item ${location.pathname === '/kuliner/admin/support' ? 'active' : ''}`}
                  >
                    <span className="kd-nav-icon">❓</span>
                    <span>{t('sidebar.helpCenter')}</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </aside>

        <main className="kd-main">
          {/* STICKY TOPBAR HEADER */}
          <header className="kd-mobile-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button 
                className="kd-hamburger" 
                onClick={() => setSidebarOpen(true)}
                title="Buka Menu Sidebar"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              <h1 className="kd-navtop-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                {getPageTitle()}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                style={{
                  width: 36, height: 36,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12, fontWeight: 'bold', color: '#64748b',
                  transition: 'all 0.2s',
                }}
                title="Ganti Bahasa / Change Language"
              >
                {language === 'id' ? 'ID' : 'EN'}
              </button>

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
                  cursor: 'pointer', fontSize: 17,
                  transition: 'all 0.2s',
                }}
                title="Notifikasi"
              >
                🔔
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
        </main>
      </div>


    </div>
  );
};

export default KulinerAdminLayout;
