import React, { useState, useEffect, useRef, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, Package, Layers, Ruler, Users, Truck,
  BarChart2, ShoppingCart, UserCheck, RefreshCw,
  LogOut, Inbox, ClipboardList, Database, Wallet, Settings, User,
  HelpCircle, ServerCog, FileText, Zap, Shield, ChevronDown, ChevronRight,
  Receipt, Tag
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import Modal from './Modal'
import bizoraLogo from '../assets/bizora-logo.png'
import './Sidebar.css'

// ─── Admin nav items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    section: 'Overview',
    icon: <LayoutDashboard size={18} />,
    items: [
      { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    ]
  },
  {
    section: 'Tenant',
    icon: <Users size={18} />,
    adminOnly: true,
    items: [
      { path: '/tenants', icon: <Truck size={18} />,  label: 'Tenant Management' },
      { path: '/users',   icon: <Users size={18} />,  label: 'Users' },
    ]
  },
  {
    section: 'Admin Settings',
    icon: <Shield size={18} />,
    adminOnly: true,
    items: [
      { path: '/admins',     icon: <UserCheck size={18} />, label: 'Admins' },
      { path: '/saas-roles', icon: <Shield size={18} />,    label: 'SaaS Roles' },
      { path: '/categories', icon: <Layers size={18} />,    label: 'Business Categories' },
    ]
  },
  {
    section: 'Billing',
    icon: <CreditCard size={18} />,
    adminOnly: true,
    items: [
      { path: '/subscriptions',     icon: <CreditCard size={18} />, label: 'Subscriptions' },
      { path: '/packages-features', icon: <Package size={18} />,    label: 'Packages & Features' },
      { path: '/finance',           icon: <Wallet size={18} />,     label: 'Finance' },
    ]
  },
  {
    section: 'Operations',
    icon: <ServerCog size={18} />,
    adminOnly: true,
    items: [
      { path: '/support-center',       icon: <HelpCircle size={18} />,    label: 'Support Center' },
      { path: '/system-monitoring',    icon: <ServerCog size={18} />,     label: 'System Monitoring' },
      { path: '/content-announcement', icon: <FileText size={18} />,      label: 'Content & Announcement' },
    ]
  },
  {
    section: 'Reports',
    icon: <BarChart2 size={18} />,
    adminOnly: true,
    items: [
      { path: '/reports-analytics', icon: <BarChart2 size={18} />,    label: 'Reports & Analytics' },
      { path: '/logs',              icon: <ClipboardList size={18} />, label: 'Security & Audit' },
    ]
  },
  {
    section: 'Platform',
    icon: <Zap size={18} />,
    adminOnly: true,
    items: [
      { path: '/settings',               icon: <Settings size={18} />, label: 'Settings' },
      { path: '/developer-integrations', icon: <Zap size={18} />,     label: 'Developer & Integrations' },
    ]
  },
  {
    section: 'Akun',
    icon: <User size={18} />,
    items: [
      { path: '/profile', icon: <User size={18} />, label: 'Profil Saya' },
    ]
  }
]

// Maps retail nav paths to the permission module that gates them server-side
// (backend/routes/api.php `retail_permission:{module}` groups). Paths not listed
// are always visible (dashboard, subscription, support, profile).
const RETAIL_PATH_PERMISSIONS = {
  '/retail/products': 'catalog',
  '/retail/stock': 'purchasing',
  '/retail/inventory': 'inventory',
  '/retail/stock-movements': 'inventory',
  '/retail/stock-opname': 'inventory',
  '/retail/supplier-returns': 'purchasing',
  '/retail/transactions': 'pos',
  '/retail/customer-returns': 'pos',
  '/retail/discounts': 'discounts',
  '/retail/pricelists': 'discounts',
  '/retail/categories': 'master',
  '/retail/units': 'master',
  '/retail/suppliers': 'master',
  '/retail/customers': 'master',
  '/retail/expense-categories': 'master',
  '/retail/settings': 'master',
  '/retail/staff': 'staff',
  '/retail/roles': 'roles',
  '/retail/reports/sales': 'reports',
  '/retail/reports/products': 'reports',
  '/retail/reports/customers': 'reports',
  '/retail/finance/summary': 'finance',
  '/retail/finance/expenses': 'finance',
  '/retail/finance/payables': 'finance',
  '/retail/finance/receivables': 'finance',
}

function filterNavByPermission(sections, user) {
  const permissions = user?.permissions
  if (permissions === 'all' || !Array.isArray(permissions)) return sections // owner/super_admin or ungated

  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        const required = RETAIL_PATH_PERMISSIONS[item.path]
        return !required || permissions.includes(required)
      }),
    }))
    .filter(section => section.items.length > 0)
}

const CATEGORY_COLORS = {
  'Budidaya Ikan':    '#10b981',
  'Budidaya Tanaman': '#84cc16',
  'Toko Retail':      '#3b82f6',
  'Jasa':             '#8b5cf6',
  'Manufaktur':       '#f59e0b',
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
      { path: '/retail/stock',           icon: <Inbox size={24} />,          label: 'Penerimaan Barang' },
      { path: '/retail/inventory',       icon: <ClipboardList size={24} />, label: 'Stok Barang' },
      { path: '/retail/stock-movements', icon: <RefreshCw size={24} />,      label: 'Riwayat Stok' },
      { path: '/retail/stock-opname',    icon: <UserCheck size={24} />,      label: 'Stock Opname' },
      { path: '/retail/supplier-returns', icon: <Truck size={24} />,         label: 'Retur ke Supplier' },
    ]
  },
  {
    section: 'Penjualan',
    icon: <Receipt size={20} />,
    items: [
      { path: '/retail/transactions',     icon: <ClipboardList size={24} />, label: 'Riwayat Transaksi' },
      { path: '/retail/customer-returns', icon: <RefreshCw size={24} />,     label: 'Retur Pelanggan' },
      { path: '/retail/discounts',        icon: <Tag size={24} />,           label: 'Kode Diskon' },
      { path: '/retail/pricelists',       icon: <Layers size={24} />,        label: 'Pricelist' },
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
      { path: '/retail/finance/summary',     icon: <BarChart2 size={24} />, label: 'Laba Rugi' },
      { path: '/retail/finance/expenses',    icon: <Wallet size={24} />,    label: 'Pengeluaran' },
      { path: '/retail/finance/payables',    icon: <Wallet size={24} />,    label: 'Hutang Supplier' },
      { path: '/retail/finance/receivables', icon: <Wallet size={24} />,    label: 'Piutang Pelanggan' },
    ]
  },
  {
    section: 'Sistem & Paket',
    icon: <Settings size={20} />,
    items: [
      { path: '/retail/settings',     icon: <Settings size={24} />,   label: 'Pengaturan Toko' },
      { path: '/retail/subscription', icon: <CreditCard size={24} />, label: 'Paket Langganan' },
      { path: '/retail/support',      icon: <HelpCircle size={24} />, label: 'Pusat Bantuan' },
      { path: '/retail/profile',      icon: <UserCheck size={24} />,  label: 'Profil Saya' },
    ]
  }
]

// ─── Budidaya nav items ───────────────────────────────────────────────────────
const BUDIDAYA_NAV_ITEMS = [
  {
    section: 'Budidaya',
    module: 'budidaya_cycle',
    icon: <Layers size={20} />,
    items: [
      { path: '/budidaya/dashboard', icon: <LayoutDashboard size={24} />, label: 'Dashboard' },
      { path: '/budidaya/ponds',     icon: <Layers size={24} />,          label: 'Kolam' },
      { path: '/budidaya/cycles',    icon: <RefreshCw size={24} />,      label: 'Siklus' },
    ]
  },
  {
    section: 'Sistem & Paket',
    icon: <Database size={20} />,
    items: [
      { path: '/budidaya/subscription', icon: <CreditCard size={24} />, label: 'Paket Langganan' },
      { path: '/budidaya/support',      icon: <HelpCircle size={24} />, label: 'Pusat Bantuan' },
    ]
  }
]

// ─── Kuliner nav items ────────────────────────────────────────────────────────
const KULINER_NAV_ITEMS = [
  {
    section: 'Website Order',
    module: 'website_order',
    icon: <ShoppingCart size={20} />,
    items: [
      { path: '/kuliner/admin',          icon: <LayoutDashboard size={24} />, label: 'Dashboard' },
      { path: '/kuliner/admin/categories', icon: <Layers size={24} />,          label: 'Menu & Kategori' },
    ]
  },
  {
    section: 'Sistem & Paket',
    icon: <Database size={20} />,
    items: [
      { path: '/kuliner/subscription',   icon: <CreditCard size={24} />, label: 'Paket Langganan' },
      { path: '/kuliner/admin/support',  icon: <HelpCircle size={24} />, label: 'Pusat Bantuan' },
      { path: '/kuliner/admin/profile',  icon: <UserCheck size={24} />,  label: 'Profil Saya' },
    ]
  }
]

// ─── Collapsed-rail flyout: plain text list, shown on click, hidden by
// default. Needed because the collapsed rail has no room for labels and,
// on pages like POS, there's no way to expand the sidebar to see them.
function CollapsedGroupFlyout({ section, anchorY, sidebarWidth, onClose, pathname }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current?.contains(e.target)) return
      const rail = document.querySelector('.sidebar--retail')
      if (rail && rail.contains(e.target)) return
      onClose()
    }
    // Delay adding the listener so the click that opened this flyout doesn't close it immediately
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: sidebarWidth + 4,
        top: Math.max(8, Math.min(anchorY, window.innerHeight - 8)),
        zIndex: 200,
        minWidth: 190,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        padding: 6,
      }}
    >
      <div style={{ padding: '6px 10px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
        {section.section}
      </div>
      {section.items.map(item => {
        const isActive = pathname === item.path || (item.path === '/retail/dashboard' && pathname === '/retail')
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`sidebar__submenu-item ${isActive ? 'sidebar__submenu-item--active' : ''}`}
            style={{ padding: '8px 10px' }}
          >
            <span className="sidebar__submenu-icon">
              {item.icon && React.cloneElement(item.icon, { size: 16 })}
            </span>
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, mobileOpen, onToggle }) {
  const { user, isSuperAdmin, isImpersonating } = useAuth()
  const { pathname } = useLocation()
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [storeIconUrl, setStoreIconUrl] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [openSection, setOpenSection] = useState(null)
  const [flyoutAnchorY, setFlyoutAnchorY] = useState(60)

  const toggleGroup = useCallback((sectionName) => {
    setExpandedGroup(prev => prev === sectionName ? null : sectionName)
  }, [])

  const handleGroupIconClick = useCallback((sectionName, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setFlyoutAnchorY(rect.top)
    setOpenSection(prev => prev === sectionName ? null : sectionName)
  }, [])

  // Fetch logo dynamically
  useEffect(() => {
    api.get('/landing-settings')
      .then(r => {
        if (r.data?.data?.admin_logo_url) {
          setLogoUrl(r.data.data.admin_logo_url)
        }
      })
      .catch(e => console.error('Failed to fetch sidebar logo:', e))
  }, [])

  // Retail tenants can upload their own store icon to replace the BIZORA
  // mark in their own sidebar (Settings → Informasi Toko).
  useEffect(() => {
    if (!pathname.startsWith('/retail')) {
      setStoreIconUrl(null)
      return
    }
    api.get('/retail/settings')
      .then(r => setStoreIconUrl(r.data?.store_icon_url || null))
      .catch(() => {})
  }, [pathname.startsWith('/retail')])

  // Reset expanded group / open flyout on route change
  useEffect(() => {
    setExpandedGroup(null)
    setOpenSection(null)
  }, [pathname])

  const isRetail = pathname.startsWith('/retail')

  // ── Retail: icon rail when collapsed, full sidebar when expanded ──
  // Admin: standard collapse behaviour
  const isMini = isRetail ? collapsed : (collapsed && !mobileOpen)

  // ── Build nav items dynamically based on active_modules ──────────────────
  const activeModules = user?.active_modules || []
  const isSaasAdmin = !isRetail && (isSuperAdmin() || user?.role === 'admin')
  let currentNavItems = []

  if (isSaasAdmin) {
    currentNavItems = [...NAV_ITEMS]
  } else {
    // ── When on a specific category route, show ONLY that category's nav ──
    const isOnRetail   = pathname.startsWith('/retail')
    const isOnBudidaya = pathname.startsWith('/budidaya')
    const isOnKuliner  = pathname.startsWith('/kuliner')
    // Each category's own nav array already ships its own "Sistem & Paket"
    // section (support/subscription/profile) — track whether one was used so
    // the generic "Akun & Bantuan" fallback below isn't appended on top of it.
    let hasCategoryNav = isOnRetail || isOnBudidaya || isOnKuliner

    if (isOnRetail) {
      // Only retail nav items — no cross-category links, filtered by staff permission
      currentNavItems = filterNavByPermission(RETAIL_NAV_ITEMS, user)
    } else if (isOnBudidaya) {
      // Only budidaya nav items (mapped dynamically for Tanaman category)
      const isTanaman = user?.business_category === 'Budidaya Tanaman';
      currentNavItems = BUDIDAYA_NAV_ITEMS.map(sec => {
        if (isTanaman && sec.section === 'Budidaya') {
          return {
            ...sec,
            section: 'Pertanian',
            items: sec.items.map(item => {
              if (item.label === 'Kolam') return { ...item, label: 'Lahan' };
              return item;
            })
          };
        }
        return sec;
      });
    } else if (isOnKuliner) {
      // Only kuliner nav items
      currentNavItems = [...KULINER_NAV_ITEMS]
    } else {
      // Generic dashboard (not inside any category module)
      currentNavItems.push({
        section: 'Utama',
        items: [{ path: '/dashboard', icon: <LayoutDashboard size={24} />, label: 'Dashboard' }]
      })

      // Show category modules as nav sections only on the generic dashboard
      if (user?.business_category === 'Toko Retail' || activeModules.includes('retail_pos') || activeModules.includes('inventory')) {
        currentNavItems = [...currentNavItems, ...filterNavByPermission(RETAIL_NAV_ITEMS, user)]
        hasCategoryNav = true
      }
      if (user?.business_category === 'Budidaya Ikan' || user?.business_category === 'Budidaya Tanaman' || activeModules.includes('budidaya_cycle')) {
        const isTanaman = user?.business_category === 'Budidaya Tanaman';
        const navItems = BUDIDAYA_NAV_ITEMS.map(sec => {
          if (isTanaman && sec.section === 'Budidaya') {
            return {
              ...sec,
              section: 'Pertanian',
              items: sec.items.map(item => {
                if (item.label === 'Kolam') return { ...item, label: 'Lahan' };
                return item;
              })
            };
          }
          return sec;
        });
        currentNavItems = [...currentNavItems, ...navItems]
        hasCategoryNav = true
      }
      if (user?.business_category === 'Kuliner' || activeModules.includes('website_order')) {
        currentNavItems = [...currentNavItems, ...KULINER_NAV_ITEMS]
        hasCategoryNav = true
      }
    }

    // Only the true no-category dashboard needs this fallback — every
    // category nav array above already ships its own "Sistem & Paket"
    // section with support/subscription/profile links.
    if (!hasCategoryNav) {
      currentNavItems.push({
        section: 'Akun & Bantuan',
        icon: <User size={20} />,
        items: [
          { path: '/support', icon: <HelpCircle size={24} />, label: 'Pusat Bantuan' },
          { path: '/profile', icon: <UserCheck size={24} />, label: 'Profil Saya' }
        ]
      })
    }
  }

  const DEMO_EMAILS = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','manufaktur@demo.com']
  const isDemo = user?.email?.startsWith('demo-sandbox-') || user?.email?.startsWith('demo-kuliner-') || DEMO_EMAILS.includes(user?.email)




  const topOffset = '0px'

  return (
    <>
      <aside
        className={[
          'sidebar',
          isMini           ? 'sidebar--collapsed'    : '',
          mobileOpen       ? 'sidebar--mobile-open'  : '',
          isRetail         ? 'sidebar--retail'       : '',
        ].join(' ')}
        style={{ top: topOffset, height: `calc(100vh - ${topOffset})` }}
      >
        {/* ── Logo ── */}
        <div
          className="sidebar__logo"
          style={{
            padding: isMini ? '20px 0' : '20px 16px',
            justifyContent: isMini ? 'center' : 'flex-start',
          }}
        >
          <div className="sidebar__logo-icon" style={{ overflow: 'hidden' }}><img src={storeIconUrl || logoUrl || bizoraLogo} alt="BIZORA" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }} /></div>
          {!isMini && (
            <div className="sidebar__logo-text">
              <span className="sidebar__logo-brand">BIZORA</span>
              <span className="sidebar__logo-sub">SaaS Platform</span>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar__nav">
          {currentNavItems.map(section => {
            if (section.adminOnly && !isSuperAdmin() && user?.role !== 'admin') return null

            // ============================================================
            // RETAIL + COLLAPSED, "Menu Utama" → direct icon links, no
            // popover (it's just flat items, same treatment as expanded).
            // ============================================================
            if (isRetail && isMini && section.section === 'Menu Utama') {
              const isActiveItem = (i) =>
                pathname === i.path || (i.path === '/retail/dashboard' && pathname === '/retail')
              return (
                <div key={section.section} className="sidebar__section" style={{ margin: 0 }}>
                  {section.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      className={({ isActive }) =>
                        `sidebar__item ${isActive || isActiveItem(item) ? 'sidebar__item--active' : ''}`
                      }
                      style={{ justifyContent: 'center', paddingLeft: 0 }}
                    >
                      <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </span>
                    </NavLink>
                  ))}
                </div>
              )
            }

            // ============================================================
            // RETAIL + COLLAPSED → Icon rail, hidden labels by default.
            // Clicking opens a plain text-list flyout (not a fancy grid
            // popover) so pages like POS — which have no way to expand
            // the sidebar — can still reach these sections.
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
                    onClick={(e) => handleGroupIconClick(section.section, e)}
                    title={section.section}
                    style={{ cursor: 'pointer', paddingLeft: 0, justifyContent: 'center' }}
                  >
                    <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {section.icon || <Database size={20} />}
                    </span>
                  </div>
                </div>
              )
            }

            // ============================================================
            // RETAIL + EXPANDED → "Menu Utama" flat, everything else an
            // inline collapsible accordion (NeedPOS-style dark sidebar)
            // ============================================================
            if (isRetail && !isMini && section.section !== 'Mode Admin') {
              const isActiveItem = (i) =>
                pathname === i.path || (i.path === '/retail/dashboard' && pathname === '/retail')
              const hasActive = section.items.some(isActiveItem)

              if (section.section === 'Menu Utama') {
                return (
                  <div key={section.section} className="sidebar__section">
                    {section.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `sidebar__item ${isActive || isActiveItem(item) ? 'sidebar__item--active' : ''}`
                        }
                      >
                        <span className="sidebar__item-icon">{item.icon}</span>
                        <span className="sidebar__item-label">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )
              }

              const isExpanded = hasActive || expandedGroup === section.section
              return (
                <div key={section.section} className="sidebar__section" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`sidebar__item sidebar__item--group ${hasActive ? 'sidebar__item--group-active' : ''}`}
                    onClick={() => toggleGroup(section.section)}
                  >
                    <span className="sidebar__item-icon">{section.icon || <Database size={20} />}</span>
                    <span className="sidebar__item-label" style={{ flex: 1, textAlign: 'left' }}>{section.section}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {isExpanded && (
                    <div className="sidebar__submenu">
                      {section.items.map(item => {
                        const active = isActiveItem(item)
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            className={`sidebar__submenu-item ${active ? 'sidebar__submenu-item--active' : ''}`}
                          >
                            <span className="sidebar__submenu-icon">
                              {item.icon && React.cloneElement(item.icon, { size: 16 })}
                            </span>
                            <span>{item.label}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
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
            // ADMIN → Collapsible accordion (compact)
            // ============================================================
            const isAdminActiveItem = (i) => pathname === i.path
            const hasActive = section.items.some(isAdminActiveItem)

            // Dashboard (Overview) single item — render flat, no accordion
            if (section.items.length === 1) {
              const item = section.items[0]
              return (
                <div key={section.section} className="sidebar__section" style={{ margin: 0 }}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                    }
                    title={isMini ? item.label : undefined}
                  >
                    <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </span>
                    {!isMini && <span className="sidebar__item-label">{item.label}</span>}
                  </NavLink>
                </div>
              )
            }

            // Multi-item groups → accordion
            const isExpanded = isMini
              ? false
              : expandedGroup === section.section || (expandedGroup === null && hasActive)

            return (
              <div key={section.section} className="sidebar__section" style={{ margin: 0 }}>
                {isMini ? (
                  /* Collapsed admin: show group icon with tooltip */
                  <div
                    role="button"
                    className={`sidebar__item ${hasActive ? 'sidebar__item--active' : ''}`}
                    title={section.section}
                    style={{ cursor: 'default', paddingLeft: 0, justifyContent: 'center' }}
                  >
                    <span className="sidebar__item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {section.icon || <Database size={18} />}
                    </span>
                  </div>
                ) : (
                  /* Expanded admin: accordion header */
                  <>
                    <button
                      type="button"
                      className={`sidebar__item sidebar__item--group ${hasActive ? 'sidebar__item--group-active' : ''}`}
                      onClick={() => toggleGroup(section.section)}
                    >
                      <span className="sidebar__item-icon">
                        {section.icon || <Database size={18} />}
                      </span>
                      <span className="sidebar__item-label" style={{ flex: 1, textAlign: 'left' }}>
                        {section.section}
                      </span>
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </button>
                    {isExpanded && (
                      <div className="sidebar__submenu">
                        {section.items.map(item => {
                          const active = isAdminActiveItem(item)
                          return (
                            <NavLink
                              key={item.path}
                              to={section.isLocked ? '#' : item.path}
                              className={`sidebar__submenu-item ${active ? 'sidebar__submenu-item--active' : ''}`}
                              onClick={(e) => {
                                if (section.isLocked) { e.preventDefault(); setPaywallOpen(true) }
                              }}
                            >
                              <span className="sidebar__submenu-icon">
                                {item.icon && React.cloneElement(item.icon, { size: 14 })}
                              </span>
                              <span>{item.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </nav>

      </aside>

      {/* ── Collapsed-rail flyout (retail only, click-triggered, hidden by default) ── */}
      {isRetail && isMini && openSection && (
        <CollapsedGroupFlyout
          key={openSection}
          section={currentNavItems.find(s => s.section === openSection)}
          anchorY={flyoutAnchorY}
          sidebarWidth={68}
          onClose={() => setOpenSection(null)}
          pathname={pathname}
        />
      )}

      {/* ── Paywall Modal ── */}
      <Modal isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} title="🌟 Fitur Premium" maxWidth="450px">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Fitur Dibatasi</h3>
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
