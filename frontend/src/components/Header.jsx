import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Search, Bell, User, LogOut, Shield, Calendar, Sparkles } from 'lucide-react'
import './Header.css'

const PAGE_TITLES = {
  '/dashboard':   { title: 'Dashboard', sub: 'Ringkasan statistik platform' },
  '/users':       { title: 'Users', sub: 'Kelola semua pengguna terdaftar' },
  '/tenants':     { title: 'Tenant Management', sub: 'Kelola tenant dan pelanggan bisnis' },
  '/kyc':         { title: 'Verifikasi KYC', sub: 'Verifikasi identitas dan dokumen legalitas tenant' },
  '/subscriptions': { title: 'Subscription & Billing', sub: 'Kelola paket langganan dan faktur' },
  '/packages-features': { title: 'Packages & Features', sub: 'Atur paket dan fitur yang tersedia' },
  '/finance':     { title: 'Finance', sub: 'Kelola transaksi dan laporan keuangan' },
  '/support-center': { title: 'Support Center', sub: 'Layanan pelanggan dan tiket dukungan' },
  '/system-monitoring': { title: 'System Monitoring', sub: 'Pantau performa dan kesehatan sistem' },
  '/content-announcement': { title: 'Content & Announcement', sub: 'Kelola konten dan pengumuman platform' },
  '/reports-analytics': { title: 'Reports & Analytics', sub: 'Lihat laporan dan data analitik' },
  '/logs':        { title: 'Security & Audit', sub: 'Riwayat aktivitas sistem' },
  '/settings':    { title: 'Settings', sub: 'Konfigurasi platform dan portal' },
  '/landing-settings': { title: 'Settings', sub: 'Konfigurasi platform dan portal' },
  '/developer-integrations':  { title: 'Developer & Integrations', sub: 'Atur integrasi dan akses developer' },
  '/admins':      { title: 'Admins', sub: 'Kelola administrator' },
  '/saas-roles':  { title: 'SaaS Roles', sub: 'Kelola peran dan izin akses administrator' },
  '/categories':  { title: 'Business Categories', sub: 'Kelola master kategori bisnis' },
  '/module-docs': { title: 'Dokumentasi Modul', sub: 'Arsitektur, visual ERD & spesifikasi modul sistem' },
  '/profile':     { title: 'Profil Saya', sub: 'Pengaturan akun Anda' },
  
  // Retail Module
  '/retail/dashboard':          { title: 'Dashboard Retail' },
  '/retail/pos':                { title: 'Kasir (POS)' },
  '/retail/products':           { title: 'Daftar Barang' },
  '/retail/inventory':          { title: 'Stok Barang' },
  '/retail/stock':              { title: 'Penerimaan Barang' },
  '/retail/categories':         { title: 'Kategori Produk' },
  '/retail/units':              { title: 'Satuan Dasar' },
  '/retail/customers':          { title: 'Data Pelanggan' },
  '/retail/suppliers':          { title: 'Data Supplier' },
  '/retail/outlets':            { title: 'Daftar Cabang' },
  '/retail/stock-transfers':    { title: 'Transfer Stok' },
  '/retail/batches':            { title: 'Manajemen Batch & ED' },
  '/retail/serials':            { title: 'Manajemen Serial Number' },
  '/retail/setup-master-data':  { title: 'Setup Master Data' },
  '/retail/expense-categories': { title: 'Kategori Pengeluaran' },
  '/retail/staff':              { title: 'Data Pegawai' },
  '/retail/roles':              { title: 'Jabatan & Akses' },
  '/retail/subscription':       { title: 'Paket Langganan' },
  '/retail/profile':            { title: 'Profil Saya' },
  '/retail/shifts':             { title: 'Shift & Laci Kasir' },
  '/retail/print-labels':       { title: 'Cetak Barcode & Label' },
  '/retail/finance-categories': { title: 'Kategori Keuangan' },
  '/retail/reports/sales':      { title: 'Laporan Penjualan' },
  '/retail/reports/products':   { title: 'Laporan Produk' },
  '/retail/reports/customers':  { title: 'Laporan Pelanggan' },
  '/retail/reports/consignment': { title: 'Laporan Konsinyasi' },
  '/retail/reports/shifts':     { title: 'Laporan Kasir & Shift' },
  '/retail/reports/payments':   { title: 'Laporan Metode Pembayaran' },
  '/retail/finance/summary':    { title: 'Laporan Laba Rugi' },
  '/retail/finance/cash':       { title: 'Catatan Kas' },
  '/retail/finance/transfers':  { title: 'Mutasi Kas' },
  '/retail/finance/cash-flow':  { title: 'Arus Kas' },
  '/retail/finance/tax-report': { title: 'Laporan Pajak' },
  '/retail/finance/payables':   { title: 'Hutang Supplier' },
  '/retail/finance/receivables': { title: 'Piutang Pelanggan' },
  '/retail/stock-movements':    { title: 'Riwayat Stok' },
  '/retail/stock-opname':       { title: 'Stock Opname' },
  '/retail/transactions':       { title: 'Riwayat Transaksi' },
  '/retail/supplier-returns':   { title: 'Retur ke Supplier' },
  '/retail/customer-returns':   { title: 'Retur Pelanggan' },
  '/retail/discounts':          { title: 'Kode Diskon' },
  '/retail/pricelists':         { title: 'Pricelist' },
  '/retail/settings':           { title: 'Pengaturan Toko' },
  '/retail/support':            { title: 'Pusat Bantuan' },

  // Kuliner Module
  '/kuliner/dashboard':         { title: 'Dashboard Resto' },
  '/kuliner/pos':               { title: 'Kasir Restoran' },
  '/kuliner/tables':            { title: 'Denah & Meja Resto' },
  '/kuliner/kitchen':           { title: 'Kitchen Display (KDS)' },
  '/kuliner/orders':            { title: 'Pesanan & Meja' },
  '/kuliner/recipes':           { title: 'Resep & BOM Hidangan' },
  '/kuliner/ingredients':       { title: 'Bahan Baku Dapur' },
  '/kuliner/modifiers':         { title: 'Grup Varian & Topping' },
  '/kuliner/waste':             { title: 'Limbah Sisa & Waste' },
  '/kuliner/shifts':            { title: 'Shift Kasir Resto' },
  '/kuliner/analytics':         { title: 'Menu Engineering Analytics' },
}

export default function Header({ onMenuToggle, collapsed }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isImpersonating, exitImpersonate, logout, isSuperAdmin } = useAuth()
  const isRetail = pathname.startsWith('/retail')
  const isKuliner = pathname.startsWith('/kuliner')
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const page = PAGE_TITLES[normalizedPath] || { title: '', sub: '' }

  const isSaasAdminPage = !isRetail && !isKuliner && (isSuperAdmin?.() || user?.role === 'admin')

  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data || [])
    } catch {
      // Safe
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showProfile) return
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showProfile])

  useEffect(() => {
    if (!showNotif) return
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotif])

  const handleLogout = async () => {
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate()
      window.location.href = redirectPath || '/tenants'
    } else {
      const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'))
      try { logout() } catch {}
      window.location.href = isDemo ? '/' : '/login'
    }
  }

  const handleGoProfile = () => {
    setShowProfile(false)
    navigate(isRetail ? '/retail/profile' : isKuliner ? '/kuliner/profile' : '/profile')
  }

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`)
      fetchNotifications()
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all')
      fetchNotifications()
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <header className={`header ${collapsed ? 'header--collapsed' : ''}`}>
      <div className="header__left">
        <button
          id="btn-menu-toggle"
          className="header__toggle"
          onClick={onMenuToggle}
          title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {!isSaasAdminPage && (
          <div className="header__title">
            <h1 className="header__page-title" style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#32475c' }}>
              {page.title || 'Bizora'}
            </h1>
          </div>
        )}
      </div>

      <div className="header__right">
        <div className="header__date">
          <Calendar size={13} />
          <span>{dateStr}</span>
        </div>

        <div className="header__notifications" ref={notifRef}>
          <button
            id="btn-notif"
            className="header__notif-btn"
            onClick={() => setShowNotif(!showNotif)}
            title="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="header__notif-badge" />}
          </button>
          
          {showNotif && (
            <div className="header__dropdown" style={{ width: 300 }}>
              <div className="header__dropdown-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#32475c' }}>
                  Notifikasi ({unreadCount})
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: '#696cff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8592a3', fontSize: 12.5 }}>
                    Belum ada notifikasi baru.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: !n.read_at ? '#fafbfe' : '#ffffff'
                      }}
                    >
                      <strong style={{ fontSize: 12.5, color: '#32475c', display: 'block' }}>{n.title}</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: '#566a7f' }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="header__profile-wrap" ref={profileRef} style={{ position: 'relative' }}>
          <div
            className="header__user"
            onClick={() => setShowProfile(v => !v)}
            title="Menu Akun"
          >
            <div className="header__avatar">
              {user?.name?.slice(0, 2).toUpperCase() || 'SA'}
              <span className="header__online-dot" />
            </div>
            <div className="header__user-info" style={{ display: window.innerWidth < 640 ? 'none' : 'flex' }}>
              <span className="header__user-name">{user?.name || 'Super Admin'}</span>
              <span className="header__user-role">
                {user?.role === 'super_admin' ? '⭐ Super Admin'
                  : user?.role === 'admin' ? '🔧 Admin'
                  : (user?.business_category || 'Customer')}
              </span>
            </div>
          </div>

          {showProfile && (
            <div className="header__dropdown" style={{ minWidth: 220 }}>
              <div className="header__dropdown-header">
                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#32475c' }}>{user?.name || 'Admin'}</div>
                <div style={{ fontSize: 11.5, color: '#8592a3', marginTop: 2 }}>{user?.email || 'admin@bizora.id'}</div>
              </div>
              <div style={{ padding: '6px 0' }}>
                <button className="header__dropdown-item" onClick={handleGoProfile}>
                  <User size={15} />
                  <span>Pengaturan Profil</span>
                </button>
                <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                <button className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>
                    {isImpersonating && isImpersonating() 
                      ? 'Keluar dari Impersonate' 
                      : 'Keluar (Logout)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
