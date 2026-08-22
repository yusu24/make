import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../contexts/I18nContext';
import { api } from '../../../lib/api';
import '../pages/KulinerDashboard.css';

const KulinerAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isImpersonating, exitImpersonate, logout, updateUser } = useAuth();
  const { t, language, toggleLanguage } = useTranslation();
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
      settings: path === '/kuliner/admin/staff' || path === '/kuliner/admin/roles' || path === '/kuliner/admin/settings' || path === '/kuliner/admin/support'
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
        {/* MOBILE HEADER */}
        <div className="kd-mobile-header">
          <button className="kd-hamburger" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

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
                      <span className="kd-nav-icon">📑</span>
                      <span>{t('sidebar.advancedReports')}</span>
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
          {/* FIXED NAVBAR ACTIONS — sits inside every page's kd-topbar automatically */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            height: 70,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingRight: 24,
            zIndex: 100,
            pointerEvents: 'auto',
          }}>
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              style={{
                width: 38, height: 38,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 13, fontWeight: 'bold', color: '#64748b',
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
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: showProfileMenu ? '#f1f5f9' : 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #b48c36, #d4a853)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  flexShrink: 0,
                }}>
                  {(user?.name || 'T').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="kd-profile-text" style={{ textAlign: 'left', lineHeight: 1.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{user?.name || 'Pemilik Toko'}</div>
                    {user?.subscription_plan && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: 8,
                        background: user.subscription_plan === 'pro' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : user.subscription_plan === 'basic' ? 'linear-gradient(135deg, #10b981, #059669)' : '#64748b',
                        color: '#fff'
                      }}>
                        {user.subscription_plan === 'pro' ? '💎 PRO' : user.subscription_plan === 'basic' ? '⚡ BASIC' : 'FREE'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Admin Toko</div>
                </div>
                <span className="kd-profile-text" style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }}>▾</span>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 200,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  zIndex: 200,
                  animation: 'kd-fadeIn 0.15s ease',
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Masuk sebagai</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: '#b48c36', marginTop: 1 }}>{storeName}</div>
                  </div>
                  <Link
                    to="/kuliner/admin/profile"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px',
                      textDecoration: 'none',
                      color: '#374151',
                      fontSize: 13, fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <span>👤</span>
                    <span>Profil Saya</span>
                  </Link>
                  <div style={{ height: 1, background: '#f1f5f9' }} />
                  <button
                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                    style={{
                      width: '100%', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px',
                      background: 'none', border: 'none',
                      color: '#ef4444',
                      fontSize: 13, fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <span>🚪</span>
                    <span>{isDemo ? 'Keluar dari Akun Demo' : 'Keluar Akun'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {children}
        </main>
      </div>


    </div>
  );
};

export default KulinerAdminLayout;
