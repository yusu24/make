import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useBudidayaTerms } from './hooks/useBudidayaTerms'
import { useAuth } from '../../contexts/AuthContext'
import './budidaya.css'

const getNavItems = (terms) => [
  {
    type: 'link',
    label: 'Dashboard',
    icon: 'grid_view',
    path: '/budidaya/dashboard',
  },
  {
    type: 'dropdown',
    id: 'operasional',
    label: 'Operasional',
    icon: 'storefront',
    children: [
      { label: `Manajemen ${terms.unit}`, icon: terms.iconMain, path: '/budidaya/ponds' },
      { label: 'Siklus Budidaya', icon: 'cycle', path: '/budidaya/cycles' },
      { label: 'Gudang & Pakan', icon: 'inventory_2', path: '/budidaya/inventory' },
    ],
  },
  {
    type: 'dropdown',
    id: 'keuangan',
    label: 'Keuangan & Laporan',
    icon: 'analytics',
    children: [
      { label: 'Laba Rugi', icon: 'trending_up', path: '/budidaya/finance-summary' },
      { label: 'Buku Kas & Transaksi', icon: 'payments', path: '/budidaya/expenses' },
      { label: 'Laporan & Analisa', icon: 'bar_chart', path: '/budidaya/reports' },
    ],
  },
  {
    type: 'dropdown',
    id: 'master-data',
    label: 'Master Data',
    icon: 'dataset',
    children: [
      { label: 'Kategori Keuangan', icon: 'sell', path: '/budidaya/master-data?tab=finance', tab: 'finance' },
      { label: 'Satuan Dasar', icon: 'straighten', path: '/budidaya/master-data?tab=units', tab: 'units' },
      { label: 'Kategori Pakan', icon: 'package_2', path: '/budidaya/master-data?tab=feeds', tab: 'feeds' },
    ],
  },
  {
    type: 'dropdown',
    id: 'pengaturan',
    label: 'Pengaturan & Tim',
    icon: 'tune',
    children: [
      { label: 'Manajemen Pengguna', icon: 'group',       path: '/budidaya/users' },
      { label: 'Peran & Izin',       icon: 'verified_user', path: '/budidaya/roles' },
      { label: 'Paket Langganan',    icon: 'credit_card',   path: '/budidaya/subscription' },
      { label: 'Pengaturan Profil',  icon: 'settings',      path: '/budidaya/settings' },
      { label: 'Pusat Bantuan',      icon: 'help',          path: '/budidaya/support' },
      { label: 'Backup Data',        icon: 'backup',        path: '/budidaya/backup' },
    ],
  },
]

export default function BudidayaSidebar({ mobileOpen, onToggle }) {
  const { pathname, search } = useLocation()
  const { user } = useAuth()
  const terms = useBudidayaTerms()
  const navItems = getNavItems(terms)
  const currentTab = new URLSearchParams(search).get('tab') || 'finance'

  // Identify which group contains the current active route
  const activeGroupId = navItems.find(item => 
    item.type === 'dropdown' && item.children.some(child => 
      child.tab ? (pathname === '/budidaya/master-data' && currentTab === child.tab) : (pathname === child.path || pathname.startsWith(child.path + '/'))
    )
  )?.id

  // Track manually collapsed active group & expanded non-active group
  const [collapsedActive, setCollapsedActive] = useState(false)
  const [expandedNonActive, setExpandedNonActive] = useState(null)

  // Reset manual overrides whenever route changes (active group auto-opens, others auto-close)
  useEffect(() => {
    setCollapsedActive(false)
    setExpandedNonActive(null)
  }, [pathname, search])

  const toggleGroup = (id) => {
    if (id === activeGroupId) {
      // Toggle the active group only when user clicks its header/arrow
      setCollapsedActive(prev => !prev)
    } else {
      // Toggle non-active group (auto-closing other non-active groups)
      setExpandedNonActive(prev => (prev === id ? null : id))
    }
  }

  const isGroupOpen = (id) => {
    if (id === activeGroupId) {
      return !collapsedActive
    }
    return expandedNonActive === id
  }

  return (
    <>
      {/* ─── Sidebar ─── */}
      <aside
        className={`aq-sidebar ${mobileOpen ? 'aq-sidebar--open' : ''}`}
        style={{
          width: 240,
          background: '#FFFFFF',
          borderRight: '1px solid #E9F0EC',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        {/* ── Brand / Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 18px 20px', flexShrink: 0 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#1B4332',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: "'FILL' 1, 'wght' 500",
                fontSize: 20,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {terms.brandIcon || (terms.isTanaman ? 'eco' : 'water_drop')}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: '#1B4332',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              {terms.brandName || 'AquaGrow'}
            </span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9.5,
                fontWeight: 600,
                color: '#475569',
                letterSpacing: '0.02em',
                textTransform: 'none',
              }}
            >
              {terms.brandSub || (terms.isTanaman ? 'Pertanian Pintar' : 'Budidaya Pintar')}
            </span>
          </div>
        </div>

        {/* ── Navigation Items ── */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            padding: '14px 10px 24px',
            overflowY: 'auto',
            flex: 1,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {navItems.map((item) => {
            if (item.type === 'link') {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '5.5px 14px 5.5px 5.5px',
                    borderRadius: 9999,
                    textDecoration: 'none',
                    background: isActive ? '#E8F5ED' : 'transparent',
                    color: isActive ? '#1B4332' : '#475569',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.18s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F0F7F2'
                      e.currentTarget.style.color = '#1B4332'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#475569'
                    }
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isActive ? '#1B4332' : 'transparent',
                      color: isActive ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 2px 6px rgba(27, 67, 50, 0.35)' : 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                </NavLink>
              )
            }

            if (item.type === 'dropdown') {
              const isExpanded = isGroupOpen(item.id)
              const hasActiveChild = item.children.some(child => pathname === child.path || pathname.startsWith(child.path + '/'))

              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Parent Accordion Button */}
                  <button
                    onClick={() => toggleGroup(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '5.5px 14px 5.5px 5.5px',
                      borderRadius: 9999,
                      border: 'none',
                      outline: 'none',
                      background: hasActiveChild && !isExpanded ? '#E8F5ED' : 'transparent',
                      color: hasActiveChild ? '#1B4332' : '#475569',
                      fontSize: 13,
                      fontWeight: hasActiveChild ? 700 : 500,
                      transition: 'all 0.18s ease',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      if (!(hasActiveChild && !isExpanded)) {
                        e.currentTarget.style.background = '#F0F7F2'
                        e.currentTarget.style.color = '#1B4332'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!(hasActiveChild && !isExpanded)) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = hasActiveChild ? '#1B4332' : '#475569'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: hasActiveChild ? '#E8F5ED' : 'transparent',
                          color: hasActiveChild ? '#1B4332' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                        >
                          {item.icon}
                        </span>
                      </div>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 18,
                        color: hasActiveChild ? '#1B4332' : '#94A3B8',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Submenu Children */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, paddingLeft: 8, borderLeft: '1.5px solid #D8ECE0', marginLeft: 18, marginTop: 2, marginBottom: 4 }}>
                      {item.children.map((child) => {
                        const isChildActive = child.tab 
                          ? (pathname === '/budidaya/master-data' && currentTab === child.tab)
                          : (pathname === child.path || pathname.startsWith(child.path + '/'))

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '5px 12px 5px 5px',
                              borderRadius: 9999,
                              textDecoration: 'none',
                              background: isChildActive ? '#E8F5ED' : 'transparent',
                              color: isChildActive ? '#1B4332' : '#64748B',
                              fontSize: 12.5,
                              fontWeight: isChildActive ? 700 : 500,
                              transition: 'all 0.18s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                              if (!isChildActive) {
                                e.currentTarget.style.background = '#F0F7F2'
                                e.currentTarget.style.color = '#1B4332'
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isChildActive) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#64748B'
                              }
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: isChildActive ? '#1B4332' : 'transparent',
                                color: isChildActive ? '#ffffff' : '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: isChildActive ? '0 2px 5px rgba(27, 67, 50, 0.35)' : 'none',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  fontSize: 15,
                                  lineHeight: 1,
                                }}
                              >
                                {child.icon}
                              </span>
                            </div>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {child.label}
                            </span>
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return null
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="aq-sidebar-overlay lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
