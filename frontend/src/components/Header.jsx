import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Search, Bell, User, LogOut, Shield, Calendar, CreditCard, Package, Store, Sparkles, AlertTriangle, ArrowRight, ExternalLink, CheckCircle2, Clock, X } from '@/constants/icons'
import Modal from './Modal'
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
  const isBudidaya = pathname.startsWith('/budidaya')
  const isJasa = pathname.startsWith('/jasa')
  const isSeller = pathname.startsWith('/seller')
  const isSaasAdmin = Boolean(isSuperAdmin?.() || user?.role === 'admin' || user?.role === 'super_admin')
  const isSaasAdminPage = !isRetail && !isKuliner && !isBudidaya && !isJasa && !isSeller && isSaasAdmin

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

  const [selectedNotif, setSelectedNotif] = useState(null)

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getNotifIcon = (n) => {
    const type = String(n.type || '').toLowerCase();
    const title = String(n.title || '').toLowerCase();
    const msg = String(n.message || '').toLowerCase();
    const text = type + ' ' + title + ' ' + msg;

    if (text.includes('stok') || text.includes('barang') || text.includes('produk') || text.includes('inventory')) {
      return <Package size={16} className="text-amber-500" />;
    }
    if (text.includes('langganan') || text.includes('paket') || text.includes('invoice') || text.includes('tagihan') || text.includes('bayar')) {
      return <CreditCard size={16} className="text-indigo-500" />;
    }
    if (text.includes('tenant') || text.includes('toko') || text.includes('usaha')) {
      return <Store size={16} className="text-blue-500" />;
    }
    if (text.includes('trial') || text.includes('selamat') || text.includes('sukses')) {
      return <Sparkles size={16} className="text-emerald-500" />;
    }
    if (text.includes('kyc') || text.includes('keamanan') || text.includes('verifikasi')) {
      return <Shield size={16} className="text-rose-500" />;
    }
    if (type === 'danger' || type === 'critical' || text.includes('peringatan') || text.includes('kritis') || text.includes('overdue')) {
      return <AlertTriangle size={16} className="text-rose-500" />;
    }
    return <Bell size={16} className="text-indigo-500" />;
  };

  const getNotificationLink = (n) => {
    if (n.data?.link) return n.data.link;
    if (n.data?.url) return n.data.url;
    if (n.link) return n.link;

    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    const text = title + ' ' + msg;

    if (isSaasAdmin) {
      if (text.includes('tenant') || text.includes('trial') || text.includes('daftar')) return '/tenants';
      if (text.includes('langganan') || text.includes('paket') || text.includes('invoice') || text.includes('upgrade') || text.includes('tagihan') || text.includes('overdue')) return '/subscriptions';
      if (text.includes('kyc') || text.includes('verifikasi')) return '/kyc';
      if (text.includes('tiket') || text.includes('bantuan') || text.includes('support')) return '/support-center';
      if (text.includes('backup')) return '/backups';
      if (text.includes('pengguna') || text.includes('user')) return '/users';
      return null;
    }

    const cat = String(user?.business_category || '').toLowerCase();
    const isKulinerTenant = cat.includes('kuliner') || isKuliner;
    const isBudidayaTenant = cat.includes('budi') || isBudidaya;
    const isJasaTenant = cat.includes('jasa') || isJasa;

    if (text.includes('langganan') || text.includes('paket') || text.includes('invoice') || text.includes('upgrade') || text.includes('tagihan') || text.includes('expired')) {
      if (isKulinerTenant) return '/kuliner/subscription';
      if (isBudidayaTenant) return '/budidaya/subscription';
      if (isJasaTenant) return '/jasa/subscription';
      return '/seller/subscription';
    }

    if (text.includes('stok') || text.includes('barang') || text.includes('produk') || text.includes('inventory')) {
      if (isKulinerTenant) return '/kuliner/products';
      if (isBudidayaTenant) return '/budidaya/inventory';
      return '/seller/inventory';
    }

    if (text.includes('pesanan') || text.includes('order') || text.includes('transaksi') || text.includes('kasir')) {
      if (isKulinerTenant) return '/kuliner/orders';
      return '/seller/orders';
    }

    if (text.includes('bantuan') || text.includes('tiket') || text.includes('support')) {
      return '/support';
    }

    return null;
  };

  const handleNotificationClick = async (n) => {
    if (!n.read_at) {
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item));
      handleMarkRead(n.id);
    }
    setShowNotif(false);

    const targetLink = getNotificationLink(n);
    if (targetLink) {
      if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
        window.open(targetLink, '_blank');
      } else {
        navigate(targetLink);
      }
    } else {
      setSelectedNotif(n);
    }
  };

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
      </div>

      <div className="header__right">
        {/* Desktop Search Trigger (Rata Kanan) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="header__search-trigger hidden sm:flex items-center gap-2.5 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-slate-700/80 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 text-xs font-medium transition-all shadow-2xs cursor-pointer mr-1"
          title="Buka Pintasan Cepat (Ctrl + K)"
        >
          <Search size={14} className="text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300">{isSaasAdminPage ? 'Cari tenant, menu, aksi...' : 'Cari menu, pintasan, produk...'}</span>
          <kbd className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Buka Pintasan Cepat (Ctrl + K)"
        >
          <Search size={16} />
        </button>

        <div className="header__date">
          <Calendar size={13} />
          <span>{dateStr}</span>
        </div>

        <div className="header__notifications" ref={notifRef}>
          <button
            id="btn-notif"
            className="header__notif-btn"
            onClick={() => setShowNotif(!showNotif)}
            title="Notifikasi Masuk"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="header__notif-badge" />}
          </button>
          
          {showNotif && (
            <div className="header__dropdown" style={{ width: 350, maxWidth: '92vw', right: 0, padding: 0, boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)', borderRadius: 16, overflow: 'hidden' }}>
              <div className="header__dropdown-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                    Notifikasi
                  </h4>
                  {unreadCount > 0 ? (
                    <span style={{ fontSize: 10.5, background: '#e0e7ff', color: '#4338ca', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                      {unreadCount} Baru
                    </span>
                  ) : (
                    <span style={{ fontSize: 10.5, background: '#f1f5f9', color: '#64748b', fontWeight: 600, padding: '2px 8px', borderRadius: 99 }}>
                      Semua Terbaca
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12.5 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#cbd5e1' }}>
                      <Bell size={22} />
                    </div>
                    Belum ada notifikasi baru saat ini.
                  </div>
                ) : (
                  notifications.map(n => {
                    const targetLink = getNotificationLink(n);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #f8fafc',
                          cursor: 'pointer',
                          background: !n.read_at ? '#f8faff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = !n.read_at ? '#f8faff' : '#ffffff'}
                        title={targetLink ? 'Klik untuk membuka halaman terkait' : 'Klik untuk melihat rincian notifikasi'}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: !n.read_at ? '#e0e7ff' : '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2
                        }}>
                          {getNotifIcon(n)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <strong style={{
                              fontSize: 12.5,
                              color: !n.read_at ? '#0f172a' : '#475569',
                              fontWeight: !n.read_at ? 700 : 600,
                              lineHeight: 1.3
                            }}>
                              {n.title}
                            </strong>
                            {!n.read_at && (
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                            )}
                          </div>

                          <p style={{ margin: '3px 0 6px 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>
                            {n.message}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#94a3b8' }}>
                            <span>{formatNotifTime(n.created_at)}</span>
                            <span style={{ color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span>{targetLink ? 'Buka Halaman' : 'Lihat Detail'}</span>
                              <ArrowRight size={11} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    💡 Klik pada notifikasi untuk membuka halaman atau aksi terkait
                  </span>
                </div>
              )}
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

      {/* Selected Notification Detail Modal */}
      {selectedNotif && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedNotif(null)}
          title="Detail Notifikasi"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getNotifIcon(selectedNotif)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  {selectedNotif.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: '#64748b' }}>
                  <Clock size={13} />
                  <span>{formatNotifTime(selectedNotif.created_at)}</span>
                  {selectedNotif.read_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#16a34a', marginLeft: 6 }}>
                      <CheckCircle2 size={13} /> Sudah dibaca
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              fontSize: 13.5,
              lineHeight: 1.6,
              color: '#334155',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {selectedNotif.message}
            </div>

            {selectedNotif.data && typeof selectedNotif.data === 'object' && Object.keys(selectedNotif.data).length > 0 && (
              <div style={{ fontSize: 12, color: '#64748b', background: '#ffffff', borderRadius: 8, border: '1px solid #f1f5f9', padding: 12 }}>
                <span style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: '#475569' }}>Informasi Tambahan:</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {Object.entries(selectedNotif.data).map(([key, val]) => (
                    typeof val !== 'object' && (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{String(val)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              {(() => {
                const targetLink = getNotificationLink(selectedNotif);
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedNotif(null)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Tutup
                    </button>
                    {targetLink && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNotif(null);
                          if (targetLink.startsWith('http')) {
                            window.open(targetLink, '_blank');
                          } else {
                            navigate(targetLink);
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#4f46e5',
                          color: '#ffffff',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span>Buka Halaman</span>
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </header>
  )
}
