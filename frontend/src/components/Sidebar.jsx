import React, { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, Package, Layers, Ruler, Users, Truck,
  BarChart2, ShoppingCart, UserCheck,
  LogOut, Inbox, ClipboardList, Database, Wallet
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Modal from './Modal'
import './Sidebar.css'

// ─── Admin nav items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { path: '/dashboard', icon: '◈', label: 'Dashboard' },
    ]
  },
  {
    section: 'Manajemen',
    adminOnly: true,
    items: [
      { path: '/users',      icon: '◉', label: 'Pengguna' },
      { path: '/tenants',    icon: '⬡', label: 'Tenant' },
      { path: '/admins',     icon: '◆', label: 'Admin' },
      { path: '/categories', icon: '⊞', label: 'Kategori Bisnis' },
    ]
  },
  {
    section: 'Sistem',
    adminOnly: true,
    items: [
      { path: '/logs', icon: '≡', label: 'Activity Log' },
    ]
  },
  {
    section: 'Akun',
    items: [
      { path: '/profile', icon: '⊙', label: 'Profil Saya' },
    ]
  }
]

const CATEGORY_COLORS = {
  'Budidaya Ikan': '#10b981',
  'Toko Retail':   '#3b82f6',
  'Jasa':          '#8b5cf6',
  'Manufaktur':    '#f59e0b',
}

// ─── Retail nav items ─────────────────────────────────────────────────────────
const RETAIL_NAV_ITEMS = [
  {
    section: 'Menu Utama',
    icon: <LayoutDashboard size={20} />,
    items: [
      { path: '/retail/dashboard', icon: <LayoutDashboard size={24} />, label: 'Dashboard' },
      { path: '/retail/pos',       icon: <CreditCard size={24} />,      label: 'Kasir (POS)' },
    ]
  },
  {
    section: 'Logistik & Stok',
    icon: <Truck size={20} />,
    items: [
      { path: '/retail/stock',     icon: <Inbox size={24} />,        label: 'Penerimaan Barang' },
      { path: '/retail/inventory', icon: <ClipboardList size={24} />, label: 'Stok Barang' },
    ]
  },
  {
    section: 'Data Master',
    icon: <Database size={20} />,
    items: [
      { path: '/retail/products',           icon: <Package size={24} />, label: 'Daftar Barang' },
      { path: '/retail/categories',         icon: <Layers size={24} />,  label: 'Kategori' },
      { path: '/retail/units',              icon: <Ruler size={24} />,   label: 'Satuan' },
      { path: '/retail/customers',          icon: <Users size={24} />,   label: 'Pelanggan' },
      { path: '/retail/suppliers',          icon: <Truck size={24} />,   label: 'Supplier' },
      { path: '/retail/expense-categories', icon: <Wallet size={24} />,  label: 'Kategori Pengeluaran' },
    ]
  },
  {
    section: 'Karyawan & Akses',
    icon: <Users size={20} />,
    items: [
      { path: '/retail/staff', icon: <Users size={24} />,     label: 'Data Pegawai' },
      { path: '/retail/roles', icon: <UserCheck size={24} />, label: 'Jabatan & Akses' },
    ]
  },
  {
    section: 'Laporan',
    icon: <BarChart2 size={20} />,
    items: [
      { path: '/retail/reports/sales',     icon: <BarChart2 size={24} />,    label: 'Laporan Penjualan' },
      { path: '/retail/reports/products',  icon: <ShoppingCart size={24} />, label: 'Laporan Produk' },
      { path: '/retail/reports/customers', icon: <UserCheck size={24} />,    label: 'Laporan Pelanggan' },
    ]
  },
  {
    section: 'Keuangan',
    icon: <Wallet size={20} />,
    items: [
      { path: '/retail/finance/summary',  icon: <BarChart2 size={24} />, label: 'Laba Rugi' },
      { path: '/retail/finance/expenses', icon: <Wallet size={24} />,    label: 'Pengeluaran' },
    ]
  },
  {
    section: 'Sistem & Paket',
    icon: <Database size={20} />,
    items: [
      { path: '/retail/subscription', icon: <CreditCard size={24} />, label: 'Paket Langganan' },
    ]
  }
]

// ─── Flyout Popover (Collapsed Mode) ─────────────────────────────────────────
function RetailPopover({ section, anchorY, sidebarWidth = 68, onClose, onPaywall, pathname }) {
  const ref = useRef(null)

  useEffect(() => {
    // Delay adding listener so the click that opened this popover doesn't close it immediately
    const timer = setTimeout(() => {
      const handler = (e) => {
        if (!ref.current) return
        // Don't close if click is inside popover
        if (ref.current.contains(e.target)) return
        // Don't close if click is inside the sidebar rail (allow switching sections)
        const rail = document.querySelector('.sidebar--retail')
        if (rail && rail.contains(e.target)) return
        onClose()
      }
      document.addEventListener('mousedown', handler)
      // Store cleanup on ref so we can remove it
      ref.current._removeHandler = () => document.removeEventListener('mousedown', handler)
    }, 50)

    return () => {
      clearTimeout(timer)
      if (ref.current?._removeHandler) ref.current._removeHandler()
    }
  }, [onClose])

  // Position: 8px gap after sidebar rail (68px wide)
  const style = {
    position: 'fixed',
    left: sidebarWidth + 8,
    top: Math.max(8, Math.min(anchorY, window.innerHeight - 400)),
    zIndex: 200,
    animation: 'slideFadeIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards',
  }

  return (
    <div ref={ref} style={style}>
      <div className="sidebar__popover">
        <div className="sidebar__popover-header">
          <h3 className="sidebar__popover-title">{section.section}</h3>
        </div>
        <div className="sidebar__popover-grid">
          {section.items.map(item => {
            const isActive =
              pathname === item.path ||
              (item.path === '/retail/dashboard' && pathname === '/retail')
            return (
              <NavLink
                key={item.path}
                to={section.isLocked ? '#' : item.path}
                className={`sidebar__popover-item ${isActive ? 'sidebar__popover-item--active' : ''}`}
                onClick={(e) => {
                  if (section.isLocked) { e.preventDefault(); onPaywall() }
                  else { onClose() }
                }}
                style={section.isLocked ? { opacity: 0.55 } : {}}
              >
                <span className="sidebar__popover-item-icon">
                  {item.icon && React.cloneElement(item.icon, { size: 24 })}
                </span>
                <span className="sidebar__popover-item-label">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, mobileOpen, onToggle }) {
  const { user, logout, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [openSection, setOpenSection] = useState(null)
  const [popoverAnchorY, setPopoverAnchorY] = useState(60)
  const [paywallOpen, setPaywallOpen] = useState(false)

  // Close popover on route change
  useEffect(() => { setOpenSection(null) }, [pathname])

  const isRetail = pathname.startsWith('/retail')

  // ── Retail: icon rail when collapsed, full sidebar when expanded ──
  // Admin: standard collapse behaviour
  const isMini = isRetail ? collapsed : (collapsed && !mobileOpen)

  // ── Build nav items ───────────────────────────────────────────────
  let currentNavItems = isRetail ? [...RETAIL_NAV_ITEMS] : [...NAV_ITEMS]

  if (isRetail) {
    // Admin & super_admin get full access — no RBAC, no paywall, no lock
    const isAdminUser = isSuperAdmin() || user?.role === 'admin'
    const isFree = isAdminUser ? false : user?.subscription_plan === 'free'
    const perms  = isAdminUser ? 'all' : (user?.permissions || [])

    currentNavItems = currentNavItems.filter(section => {
      if (perms === 'all') return true
      if (section.section === 'Logistik & Stok')   return perms.includes('inventory')
      if (section.section === 'Laporan')            return perms.includes('reports')
      if (section.section === 'Keuangan')           return perms.includes('finance')
      if (section.section === 'Data Master') {
        const allowed = section.items.filter(i =>
          i.path === '/retail/products' ? perms.includes('catalog') : perms.includes('master')
        )
        if (!allowed.length) return false
        section.items = allowed
        return true
      }
      if (section.section === 'Karyawan & Akses') {
        const allowed = section.items.filter(i =>
          i.path === '/retail/staff' ? perms.includes('staff')
          : i.path === '/retail/roles' ? perms.includes('roles')
          : false
        )
        if (!allowed.length) return false
        section.items = allowed
        return true
      }
      if (section.section === 'Menu Utama') {
        section.items = section.items.filter(i =>
          i.path === '/retail/dashboard' ? true : perms.includes('pos')
        )
        return true
      }
      if (section.section === 'Sistem & Paket') return perms === 'all'
      return true
    }).map(section => {
      const name = section.section.replace(' 🔒', '')
      if (isFree && ['Laporan', 'Keuangan'].includes(name)) {
        return { ...section, section: name + ' 🔒', isLocked: true }
      }
      return section
    })
  }

  if (isRetail && (isSuperAdmin() || user?.role === 'admin')) {
    currentNavItems = [
      {
        section: 'Mode Admin',
        items: [{ path: '/dashboard', icon: <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>➜</span>, label: 'Kembali ke Admin' }]
      },
      ...currentNavItems
    ]
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const catColor = CATEGORY_COLORS[user?.business_category] || 'var(--primary-500)'

  // ── Toggle section flyout (collapsed retail mode) ─────────────────
  const handleSectionIconClick = useCallback((sectionName, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPopoverAnchorY(rect.top)
    setOpenSection(prev => prev === sectionName ? null : sectionName)
  }, [])

  const activePopoverSection = openSection
    ? currentNavItems.find(s => s.section === openSection)
    : null

  return (
    <>
      <aside
        className={[
          'sidebar',
          isMini           ? 'sidebar--collapsed'    : '',
          mobileOpen       ? 'sidebar--mobile-open'  : '',
          isRetail         ? 'sidebar--retail'       : '',
        ].join(' ')}
      >
        {/* ── Logo ── */}
        <div
          className="sidebar__logo"
          style={{
            padding: isMini ? '20px 0' : '20px 16px',
            justifyContent: isMini ? 'center' : 'flex-start',
          }}
        >
          <div className="sidebar__logo-icon"><span>U</span></div>
          {!isMini && (
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-brand">UMKM</span>
              <span className="sidebar__logo-sub">SaaS Platform</span>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar__nav">
          {currentNavItems.map(section => {
            if (section.adminOnly && !isSuperAdmin() && user?.role !== 'admin') return null

            // ============================================================
            // RETAIL + COLLAPSED → Icon rail: click opens flyout popover
            // ============================================================
            if (isRetail && isMini && section.section !== 'Mode Admin') {
              const isOpen    = openSection === section.section
              const hasActive = section.items.some(i =>
                pathname === i.path ||
                (i.path === '/retail/dashboard' && pathname === '/retail')
              )
              return (
                <div key={section.section} className="sidebar__section" style={{ margin: 0 }}>
                  <div
                    role="button"
                    className={`sidebar__item ${isOpen || hasActive ? 'sidebar__item--active' : ''}`}
                    onClick={(e) => handleSectionIconClick(section.section, e)}
                    title={section.section}
                    style={{ cursor: 'pointer', paddingLeft: 0, justifyContent: 'center', position: 'relative' }}
                  >
                    <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {section.icon || <Database size={20} />}
                    </span>
                    {/* Active dot */}
                    {hasActive && (
                      <span style={{
                        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                        width: 5, height: 5, borderRadius: '50%', background: catColor,
                      }} />
                    )}
                  </div>
                </div>
              )
            }

            // ============================================================
            // RETAIL + EXPANDED → Same icon buttons but with label text
            // ============================================================
            if (isRetail && !isMini && section.section !== 'Mode Admin') {
              const isOpen    = openSection === section.section
              const hasActive = section.items.some(i =>
                pathname === i.path ||
                (i.path === '/retail/dashboard' && pathname === '/retail')
              )
              return (
                <div key={section.section} className="sidebar__section" style={{ margin: 0 }}>
                  <div
                    role="button"
                    className={`sidebar__item ${isOpen || hasActive ? 'sidebar__item--active' : ''}`}
                    onClick={(e) => handleSectionIconClick(section.section, e)}
                    title={section.section}
                    style={{ cursor: 'pointer', paddingLeft: 12, justifyContent: 'flex-start', position: 'relative' }}
                  >
                    <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {section.icon || <Database size={20} />}
                    </span>
                    <span className="sidebar__item-label" style={{ flex: 1 }}>{section.section}</span>
                    {/* Active dot */}
                    {hasActive && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: catColor, flexShrink: 0,
                      }} />
                    )}
                  </div>
                </div>
              )
            }

            // ============================================================
            // RETAIL Mode Admin button (back link)
            // ============================================================
            if (isRetail && section.section === 'Mode Admin') {
              return (
                <div key="mode-admin" className="sidebar__section" style={{ marginBottom: 8 }}>
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="sidebar__item"
                      title="Kembali ke Admin"
                      style={{ paddingLeft: isMini ? 0 : 12, justifyContent: isMini ? 'center' : 'flex-start' }}
                    >
                      <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </span>
                      {!isMini && <span className="sidebar__item-label">{item.label}</span>}
                    </NavLink>
                  ))}
                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 6px 8px' }} />
                </div>
              )
            }

            // ============================================================
            // ADMIN → Classic flat list (unchanged)
            // ============================================================
            return (
              <div key={section.section} className="sidebar__section">
                {!isMini && (
                  <span className="sidebar__section-label">{section.section}</span>
                )}
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={section.isLocked ? '#' : item.path}
                    className={({ isActive }) =>
                      `sidebar__item ${isActive && !section.isLocked ? 'sidebar__item--active' : ''}`
                    }
                    title={isMini ? item.label : undefined}
                    onClick={(e) => {
                      if (section.isLocked) { e.preventDefault(); setPaywallOpen(true) }
                    }}
                  >
                    <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </span>
                    {!isMini && <span className="sidebar__item-label">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="sidebar__footer">
          {!isMini && (
            <div className="sidebar__user">
              <div className="avatar" style={{ background: catColor, width: 36, height: 36, fontSize: 13 }}>
                {initials}
              </div>
              <div className="sidebar__user-info">
                <p className="sidebar__user-name truncate">{user?.name || 'User'}</p>
                <p className="sidebar__user-role">
                  {user?.role === 'super_admin' ? '⭐ Super Admin'
                    : user?.role === 'admin' ? '🔧 Admin'
                    : user?.business_category || 'Customer'}
                </p>
              </div>
            </div>
          )}
          <button
            id="btn-logout"
            onClick={handleLogout}
            className={`sidebar__logout ${isMini ? 'sidebar__logout--icon' : ''}`}
            title="Keluar"
          >
            <span>⇥</span>
            {!isMini && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Retail Flyout Popover (both collapsed & expanded) ── */}
      {isRetail && activePopoverSection && (
        <RetailPopover
          key={openSection}
          section={activePopoverSection}
          anchorY={popoverAnchorY}
          sidebarWidth={isMini ? 68 : 260}
          onClose={() => setOpenSection(null)}
          onPaywall={() => { setOpenSection(null); setPaywallOpen(true) }}
          pathname={pathname}
        />
      )}

      {/* ── Paywall Modal ── */}
      <Modal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} title="🌟 Fitur Premium" maxWidth="450px">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Fitur Dibatasi</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
            Akses ke modul analitik canggih (Laporan Penjualan, Laba Rugi, dll) hanya tersedia pada langganan <strong>Basic / Pro</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setPaywallOpen(false)}>Batal</button>
            <button
              className="btn btn-primary"
              onClick={() => alert('Simulasi Upgrade...')}
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none' }}
            >
              Upgrade Sekarang
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
