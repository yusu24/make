import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import '../pages/KulinerDashboard.css';

const KulinerAdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isImpersonating, exitImpersonate, logout, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  // Prioritize user data from context for instant display
  const [storeName, setStoreName] = useState(user?.tenant_name || user?.name || 'Toko Kuliner');

  const notifications = [
    { id: 1, type: 'warning', title: 'Stok Menipis', message: 'Menu "Rendang Padang" sisa 3 porsi.', time: '2 menit yang lalu' },
    { id: 2, type: 'success', title: 'Pesanan Baru', message: 'Meja 05 memesan 4 item baru.', time: '10 menit yang lalu' },
    { id: 3, type: 'info', title: 'Update Sistem', message: 'Fitur Laporan Bulanan sudah tersedia.', time: '1 jam yang lalu' }
  ];

  // Sync storeName with user context whenever it changes
  useEffect(() => {
    if (user?.tenant_name) {
      setStoreName(user.tenant_name);
    }
  }, [user?.tenant_name]);

  const handleExitImpersonate = () => {
    const redirectPath = exitImpersonate();
    navigate(redirectPath);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  // Close sidebar and scroll to top on route change
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="kd-body">
      {/* IMPERSONATION BANNER */}
      {isImpersonating && isImpersonating() && (
        <div style={{ 
          background: 'linear-gradient(90deg, #ef4444, #f97316)', 
          color: 'white', 
          padding: '10px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️ Anda sedang dalam mode penyamaran (Impersonate)</span>
          </div>
          <button 
            onClick={handleExitImpersonate}
            style={{ 
              background: 'white', 
              color: '#ef4444', 
              border: 'none', 
              padding: '4px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            Kembali ke Admin SaaS
          </button>
        </div>
      )}

      <div className="kd-dashboard">
        {/* MOBILE HEADER */}
        <div className="kd-mobile-header">
          <button className="kd-hamburger" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link 
            to="/kuliner/admin" 
            className="kd-logo" 
            style={{ padding: 0, border: 'none', marginBottom: 0, textDecoration: 'none', color: 'inherit' }}
            onClick={(e) => {
              if (location.pathname === '/kuliner/admin') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <h1 style={{ fontSize: 16 }}>{storeName}</h1>
          </Link>
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <h1>{storeName}</h1>
            <p>Admin Control Panel</p>
          </Link>
          <nav>
            <div className="kd-nav-section">
              <div className="kd-nav-label">Menu Utama</div>
              <Link 
                to="/kuliner/admin" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/kuliner/admin/orders" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/orders' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/orders') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">📋</span>
                <span>Pesanan & Kasir</span>
              </Link>
              <Link 
                to="/kuliner/admin/categories" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/categories' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/categories') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">🍽️</span>
                <span>Menu & Produk</span>
              </Link>
              <Link 
                to="/kuliner/admin/marketing" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/marketing' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/marketing') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">🎨</span>
                <span>Desain & Flyer</span>
              </Link>
            </div>

            <div className="kd-nav-section">
              <div className="kd-nav-label">Keuangan</div>
              <Link 
                to="/kuliner/admin/reports" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/reports' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/reports') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">💰</span>
                <span>Laporan Penjualan</span>
              </Link>
              <Link 
                to="/kuliner/admin/analytics" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/analytics' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/analytics') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">📈</span>
                <span>Analitik</span>
              </Link>
              <Link 
                to="/kuliner/admin/transactions" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/transactions' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/transactions') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">🧾</span>
                <span>Transaksi</span>
              </Link>
            </div>

            <div className="kd-nav-section">
              <div className="kd-nav-label">Konten</div>
              <Link 
                to="/kuliner/admin/promos" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/promos' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/promos') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">🎁</span>
                <span>Promo & Diskon</span>
              </Link>
              <Link 
                to="/kuliner/admin/reviews" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/reviews' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/reviews') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">⭐</span>
                <span>Review</span>
              </Link>
            </div>

            <div className="kd-nav-section">
              <div className="kd-nav-label">Pengaturan</div>
              <Link 
                to="/kuliner/admin/profile" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/profile' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/profile') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">👤</span>
                <span>Profil Saya</span>
              </Link>
              <Link 
                to="/kuliner/admin/staff" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/staff' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/staff') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">👥</span>
                <span>Kelola Staff</span>
              </Link>
              <Link 
                to="/kuliner/admin/settings" 
                className={`kd-nav-item ${location.pathname === '/kuliner/admin/settings' ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/kuliner/admin/settings') {
                    e.preventDefault();
                    window.scrollTo(0, 0);
                  }
                }}
              >
                <span className="kd-nav-icon">⚙️</span>
                <span>Pengaturan Toko</span>
              </Link>
            </div>
            
            <div className="kd-nav-section" style={{ marginTop: 'auto' }}>
              <div className="kd-nav-item" onClick={() => setShowNotif(true)} style={{ cursor: 'pointer' }}>
                <span className="kd-nav-icon">🔔</span>
                <span>Notifikasi</span>
                <span className="kd-nav-badge">3</span>
              </div>
              <Link to={`/kuliner?tenant_id=${user?.tenant_id}`} target="_blank" className="kd-nav-item">
                <span className="kd-nav-icon">🌐</span>
                <span className="kd-nav-text">Lihat Storefront</span>
              </Link>
              <div className="kd-nav-item text-red-500" onClick={handleLogout} style={{ cursor: 'pointer', marginTop: 10 }}>
                <span className="kd-nav-icon">🚪</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Keluar Akun</span>
              </div>
            </div>
          </nav>
        </aside>

        <main className="kd-main">
          {children}
        </main>
      </div>

      {/* NOTIFICATION MODAL */}
      {showNotif && (
        <div className="kd-modal-overlay visible" onClick={() => setShowNotif(false)}>
          <div className="kd-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="kd-modal-header" style={{ padding: '20px 24px' }}>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                🔔 Notifikasi Terbaru
              </h2>
              <button className="kd-close-btn" onClick={() => setShowNotif(false)}>×</button>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className="p-4 hover:bg-slate-50 rounded-xl cursor-default transition-all border-b border-slate-50 last:border-none">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold tracking-wider ${
                      n.type === 'warning' ? 'text-orange-500' : n.type === 'success' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-b-[24px] text-center">
              <button className="text-xs font-bold text-[#b48c36] hover:underline" onClick={() => setShowNotif(false)}>
                Tandai Semua Sudah Dibaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KulinerAdminLayout;
