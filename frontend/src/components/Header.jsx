import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import ThemeToggle from './ThemeToggle'
import './Header.css'

const PAGE_TITLES = {
  '/dashboard':   { title: 'Dashboard', sub: 'Ringkasan statistik platform' },
  '/users':       { title: 'Users', sub: 'Kelola semua pengguna terdaftar' },
  '/tenants':     { title: 'Tenant Management', sub: 'Kelola tenant dan pelanggan bisnis' },
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
  '/categories':  { title: 'Business Categories', sub: 'Kelola master kategori UMKM' },
  '/profile':     { title: 'Profil Saya', sub: 'Pengaturan akun Anda' },
  
  // Retail Module
  '/retail/dashboard':          { title: 'Dashboard Retail' },
  '/retail/pos':                { title: 'Kasir (POS)' },
  '/retail/products':           { title: 'Daftar Barang' },
  '/retail/inventory':          { title: 'Stok Barang' },
  '/retail/stock':              { title: 'Penerimaan Barang' },
  '/retail/categories':         { title: 'Kategori Produk' },
  '/retail/units':              { title: 'Satuan Barang' },
  '/retail/suppliers':          { title: 'Daftar Supplier' },
  '/retail/customers':          { title: 'Daftar Pelanggan' },
  '/retail/expense-categories': { title: 'Kategori Pengeluaran' },
  '/retail/staff':              { title: 'Data Pegawai' },
  '/retail/roles':              { title: 'Jabatan & Akses' },
  '/retail/subscription':       { title: 'Paket Langganan' },
  '/subscriptions':             { title: 'Langganan', sub: 'Kelola paket dan permintaan langganan pelanggan' },
  '/retail/reports/sales':      { title: 'Laporan Penjualan' },
  '/retail/reports/products':   { title: 'Laporan Produk' },
  '/retail/reports/customers':  { title: 'Laporan Pelanggan' },
  '/retail/finance/summary':    { title: 'Laporan Laba Rugi' },
  '/retail/finance/expenses':   { title: 'Laporan Pengeluaran' },
}

export default function Header({ onMenuToggle, collapsed }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const isRetail = pathname.startsWith('/retail')
  const page = PAGE_TITLES[pathname] || { title: 'UMKM SaaS', sub: '' }
  const hideAdminPageTitle = [
    '/dashboard', '/users', '/tenants', '/subscriptions', '/packages-features', '/finance',
    '/support-center', '/system-monitoring', '/content-announcement', '/reports-analytics',
    '/admins', '/categories', '/logs', '/settings', '/landing-settings', '/profile',
    '/developer-integrations'
  ].includes(pathname)

  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const notifRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data || [])
    } catch (err) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {}
  }

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all')
      fetchNotifications()
    } catch (err) {}
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  const now = new Date()
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className={`header ${collapsed ? 'header--collapsed' : ''}`}>
      <div className="header__left">
        <button
          id="btn-menu-toggle"
          className="header__toggle btn btn-icon btn-ghost"
          onClick={onMenuToggle}
          title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        {!hideAdminPageTitle && (
          <div className="header__title">
            <h1 className="header__page-title">{page.title}</h1>
            {!isRetail && page.sub && <p className="header__sub">{page.sub}</p>}
          </div>
        )}
      </div>

      <div className="header__right">
        <ThemeToggle />
        <div className="header__date">{dateStr}</div>

        <div className="header__divider" />

        <div className="header__user">
          <div className="header__notifications" ref={notifRef}>
            <button id="btn-notif" className="btn btn-icon btn-ghost header__notif-btn" onClick={() => setShowNotif(!showNotif)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && <span className="header__notif-dot" />}
            </button>
            {showNotif && (
              <div className="header__notif-dropdown">
                <div className="header__notif-header">
                  <h4>Notifikasi ({unreadCount})</h4>
                  <button className="btn-mark-read" onClick={handleMarkAllRead}>Tandai dibaca</button>
                </div>
                <div className="header__notif-body">
                  {notifications.map(n => (
                    <div key={n.id} className={`header__notif-item ${!n.read_at ? 'unread' : ''}`} onClick={() => handleMarkRead(n.id)}>
                      <div className="notif-content">
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                      </div>
                      <span className="notif-time">{new Date(n.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada notifikasi.</div>
                  )}
                </div>
                <div className="header__notif-footer">
                  <button className="btn-view-all">Lihat Semua</button>
                </div>
              </div>
            )}
          </div>
          <div className="header__user-info">
            <span className="header__user-name">{user?.name || 'User'}</span>
            <span className="header__user-role badge badge-blue">
              {user?.role === 'super_admin' ? 'Super Admin'
                : user?.role === 'admin' ? 'Admin'
                : (user?.business_category || 'Customer')}
            </span>
          </div>
          <div className="header__avatar avatar" style={{
            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-600))',
            width: 36, height: 36, fontSize: 13
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
