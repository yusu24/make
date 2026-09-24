import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Search, Bell, User, LogOut, Shield, Calendar, CreditCard } from '@/constants/icons'
import './Header.css'

const PAGE_TITLES = {
  // SaaS Admin Module
  '/admin':                     { title: 'Dashboard', sub: 'Ringkasan statistik platform' },
  '/dashboard':                 { title: 'Dashboard', sub: 'Ringkasan statistik platform' },
  '/reports-analytics':         { title: 'Laporan Overview', sub: 'Ringkasan performa platform SaaS' },
  '/reports-revenue':           { title: 'Laporan Pendapatan', sub: 'Tren omzet dan akumulasi pendapatan' },
  '/reports-tenants':           { title: 'Analitik Tenant', sub: 'Distribusi paket, kategori, dan top tenant' },
  '/logs':                      { title: 'Log Aktivitas & Audit', sub: 'Riwayat aktivitas sistem dan keamanan' },
  
  '/tenants':                   { title: 'Daftar Tenant', sub: 'Kelola tenant dan pelanggan bisnis' },
  '/kyc':                       { title: 'Verifikasi KYC Tenant', sub: 'Verifikasi identitas dan dokumen legalitas tenant' },
  '/users':                     { title: 'Pengguna Platform', sub: 'Kelola semua pengguna terdaftar platform' },
  '/categories':                { title: 'Kategori Bisnis', sub: 'Kelola master kategori bisnis' },
  
  '/packages-features':         { title: 'Paket & Fitur', sub: 'Atur paket dan fitur yang tersedia' },
  '/subscriptions':             { title: 'Manajemen Langganan', sub: 'Kelola data pelanggan yang sedang berlangganan aktif' },
  '/subscription-requests':     { title: 'Permintaan Langganan', sub: 'Verifikasi pembayaran dan aktivasi paket langganan customer' },
  '/finance':                   { title: 'Finansial & Faktur', sub: 'Kelola transaksi dan laporan keuangan' },
  '/invoice-settings':          { title: 'Pengaturan Invoice', sub: 'Pengaturan identitas faktur, rekening bank, dan templat email' },
  '/subscription-reminders':    { title: 'Pengingat & Otomasi', sub: 'Konfigurasi jadwal pengingat jatuh tempo & notifikasi' },
  
  '/content-announcement':      { title: 'Pengumuman & Konten', sub: 'Kelola konten dan pengumuman platform' },
  '/support-center':            { title: 'Pusat Bantuan (Tiket)', sub: 'Layanan pelanggan dan tiket dukungan' },
  
  '/settings':                  { title: 'Pengaturan Landing Page', sub: 'Edit teks hero, kampanye, dan konfigurasi umum landing page' },
  '/landing-settings':          { title: 'Pengaturan Landing Page', sub: 'Edit teks hero, kampanye, dan konfigurasi umum landing page' },
  '/landing-sectors':           { title: 'Sektor Bisnis', sub: 'Kelola tampilan dan konten section spesialisasi bisnis' },
  '/landing-features':          { title: 'Fitur Platform', sub: 'Atur daftar fitur unggulan yang ditampilkan di landing page' },
  '/landing-howitworks':        { title: 'Cara Kerja', sub: 'Kelola langkah-langkah cara kerja platform' },
  '/landing-faq':               { title: 'FAQ & Pertanyaan Umum', sub: 'Kelola pertanyaan dan jawaban yang sering ditanyakan' },
  '/landing-footer':            { title: 'Pengaturan Footer', sub: 'Kelola tautan dan informasi footer landing page' },
  '/landing-testimonials':      { title: 'Testimoni Pelanggan', sub: 'Kelola ulasan dan testimoni pelanggan' },
  '/landing-billing':           { title: 'Harga Paket & Rekening', sub: 'Atur harga paket langganan dan informasi rekening bank' },
  '/landing-logo':              { title: 'Logo & Branding', sub: 'Kelola identitas visual dan branding platform' },
  
  '/doc-center':                { title: 'Pusat Dokumentasi', sub: 'Dokumentasi lengkap panduan sistem dan modul Bizora' },
  '/doc-dashboard':             { title: 'Kelola Dokumentasi', sub: 'Manajemen artikel, dokumen panduan, dan konten bantuan' },
  '/module-docs':               { title: 'Arsitektur Modul', sub: 'Arsitektur, visual ERD & spesifikasi modul sistem' },
  '/icon-dictionary':           { title: 'Kamus Icon UI', sub: 'Kamus icon dan aset visual sistem' },
  '/admin/icon-dictionary':     { title: 'Kamus Icon UI', sub: 'Kamus icon dan aset visual sistem' },
  '/card-dictionary':           { title: 'Kamus Card UI', sub: 'Standarisasi komponen kartu, KPI metrik, dan container data' },
  '/admin/card-dictionary':     { title: 'Kamus Card UI', sub: 'Standarisasi komponen kartu, KPI metrik, dan container data' },
  '/font-dictionary':           { title: 'Kamus Font & Tipografi', sub: 'Standarisasi hirarki teks, skala ukuran font, dan styling' },
  '/admin/font-dictionary':     { title: 'Kamus Font & Tipografi', sub: 'Standarisasi hirarki teks, skala ukuran font, dan styling' },
  '/ui-consistency':            { title: 'Audit Konsistensi UI', sub: 'Laporan standarisasi komponen UI Bizora SaaS dan showcase sistem desain' },
  '/admin/ui-consistency':      { title: 'Audit Konsistensi UI', sub: 'Laporan standarisasi komponen UI Bizora SaaS dan showcase sistem desain' },
  
  '/admins':                    { title: 'Kelola Admin', sub: 'Kelola administrator dan hak akses pengguna admin' },
  '/saas-roles':                { title: 'Role & Hak Akses', sub: 'Kelola peran dan izin akses administrator' },
  '/system-monitoring':         { title: 'Monitoring Sistem', sub: 'Pantau performa dan kesehatan sistem' },
  '/developer-integrations':    { title: 'Integrasi & Webhook', sub: 'Atur integrasi API dan webhook developer' },
  '/backups':                   { title: 'Cadangan Data (Backup)', sub: 'Kelola pencadangan data sistem' },
  '/profile':                   { title: 'Profil Saya', sub: 'Pengaturan akun Anda' },
  '/customer-onboarding':       { title: 'Panduan Onboarding', sub: 'Petunjuk pengguna baru' },
  '/admin-documentation':       { title: 'Dokumentasi Sistem', sub: 'Arsitektur dan panduan platform' },
  
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
  '/retail/reports/margins':    { title: 'Laporan Margin Produk' },
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
  '/retail/pricelists':         { title: 'Harga Grosir & Member' },
  '/retail/guide':              { title: 'Buku Panduan & SOP' },
  '/retail/settings':           { title: 'Pengaturan Toko' },
  '/retail/developer-api':      { title: 'Integrasi API & Webhook' },
  '/retail/backup':             { title: 'Backup Data Toko' },
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

export default function Header({ onMenuToggle, collapsed, onOpenCommandPalette }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isImpersonating, exitImpersonate, logout, isSuperAdmin } = useAuth()
  const isRetail = pathname.startsWith('/retail')
  const isKuliner = pathname.startsWith('/kuliner')
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname
  const lookupPath = normalizedPath.startsWith('/admin/') ? normalizedPath.replace('/admin', '') : normalizedPath
  let page = PAGE_TITLES[lookupPath] || PAGE_TITLES[normalizedPath]
  if (!page) {
    if (lookupPath.startsWith('/categories/')) {
      const catName = decodeURIComponent(lookupPath.replace('/categories/', ''))
      page = { title: `Kategori: ${catName}`, sub: 'Detail dan konfigurasi kategori bisnis' }
    } else if (lookupPath.startsWith('/doc-center/')) {
      page = { title: 'Pusat Dokumentasi', sub: 'Dokumentasi lengkap panduan sistem dan modul Bizora' }
    }
  }
  if (!page) {
    page = { title: '', sub: '' }
  }

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

        <div className="header__title ml-1 sm:ml-2">
          <h1 className="header__page-title">
            {page.title || (isSaasAdminPage ? 'Bizora SaaS' : 'Bizora')}
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="header__search-trigger hidden sm:flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-1.5 rounded-xl text-slate-500 text-xs font-medium transition-all shadow-2xs ml-1"
          title="Buka Command Palette (Ctrl + K)"
        >
          <Search size={14} className="text-slate-400" />
          <span className="text-slate-600">{isSaasAdminPage ? 'Cari tenant, menu, aksi...' : 'Cari menu, aksi, data...'}</span>
          <kbd className="bg-white border border-slate-300 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-slate-500 font-mono shadow-2xs">
            Ctrl K
          </kbd>
        </button>
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
              {(user?.tenant_name || user?.business_name || user?.name || 'DE')
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'DE'}
              <span className="header__online-dot" />
            </div>
          </div>

          {showProfile && (
            <div
              className="header__dropdown"
              style={{
                width: 290,
                borderRadius: 20,
                padding: '16px 18px',
                background: '#ffffff',
                boxShadow: '0 12px 36px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
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
                    background: '#696cff',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(105, 108, 255, 0.35)',
                  }}
                >
                  {(user?.name || 'DS')
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'DS'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'Pengguna'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || 'user@bizora.id'}
                  </div>
                </div>
              </div>

              {/* Info Details */}
              <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>Toko:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b', maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right', fontSize: 12.5 }}>
                    {user?.tenant_name || user?.business_name || user?.name || '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>Status Paket:</span>
                  <span style={{ fontWeight: 700, color: '#696cff', textTransform: 'capitalize', fontSize: 12.5 }}>
                    {user?.subscription_plan || (user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Free')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>
                    {user?.business_category === 'Seller' ? 'Channel Terhubung:' : isRetail ? 'Kategori Bisnis:' : 'Kategori Bisnis:'}
                  </span>
                  <span style={{ fontWeight: 700, color: '#71dd37', fontSize: 12.5 }}>
                    {user?.business_category === 'Seller' ? '1' : (user?.business_category || 'Retail')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => {
                    setShowProfile(false)
                    const cat = String(user?.business_category || '').toLowerCase()
                    if (isRetail || cat.includes('retail') || cat.includes('toko')) navigate('/retail/subscription')
                    else if (isKuliner || cat.includes('kuliner') || cat.includes('resto') || cat.includes('cafe')) navigate('/kuliner/subscription')
                    else if (cat.includes('budi') || cat.includes('ternak') || cat.includes('tani') || pathname.startsWith('/budidaya')) navigate('/budidaya/subscription')
                    else if (cat.includes('seller') || cat.includes('online') || cat.includes('commerce') || pathname.startsWith('/seller')) navigate('/seller/subscription')
                    else if (cat.includes('jasa') || cat.includes('repair') || cat.includes('servis') || cat.includes('bengkel') || pathname.startsWith('/jasa')) navigate('/jasa/subscription')
                    else if (user?.role === 'super_admin' || user?.role === 'admin') navigate('/subscriptions')
                    else navigate('/retail/subscription')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#696cff',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(105, 108, 255, 0.25)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5f61e6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#696cff'}
                >
                  <CreditCard size={15} />
                  <span>Upgrade & Paket Langganan</span>
                </button>

                <button
                  onClick={handleGoProfile}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#f0f1ff',
                    color: '#696cff',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: '1px solid #e0e2ff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e4e6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f0f1ff'}
                >
                  <span>Pengaturan Akun</span>
                </button>

                <button
                  onClick={handleLogout}
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
                      : (user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com')))
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
  )
}
