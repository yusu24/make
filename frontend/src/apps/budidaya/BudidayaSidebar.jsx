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
      { label: 'Pengeluaran', icon: 'payments', path: '/budidaya/expenses' },
      { label: 'Laporan & Analisa', icon: 'bar_chart', path: '/budidaya/reports' },
    ],
  },
  {
    type: 'dropdown',
    id: 'pengaturan',
    label: 'Pengaturan & Tim',
    icon: 'tune',
    children: [
      { label: 'Manajemen Pengguna', icon: 'group', path: '/budidaya/users' },
      { label: 'Peran & Izin', icon: 'verified_user', path: '/budidaya/roles' },
      { label: 'Paket Langganan', icon: 'credit_card', path: '/budidaya/subscription' },
      { label: 'Pengaturan Profil', icon: 'settings', path: '/budidaya/settings' },
      { label: 'Pusat Bantuan', icon: 'help', path: '/budidaya/support' },
    ],
  },
]

export default function BudidayaSidebar({ mobileOpen, onToggle }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const terms = useBudidayaTerms()
  const navItems = getNavItems(terms)

  // Track open state of dropdown groups
  const [openGroups, setOpenGroups] = useState({
    operasional: true,
    keuangan: false,
    pengaturan: false,
  })

  // Automatically open dropdown group if active route is inside it
  useEffect(() => {
    navItems.forEach(item => {
      if (item.type === 'dropdown') {
        const hasActive = item.children.some(child => pathname === child.path || pathname.startsWith(child.path + '/'))
        if (hasActive) {
          setOpenGroups(prev => ({ ...prev, [item.id]: true }))
        }
      }
    })
  }, [pathname])

  const toggleGroup = (id) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))
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
            gap: 4,
            padding: '4px 12px 24px',
            overflowY: 'auto',
            flex: 1,
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
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    background: isActive ? '#E8F5ED' : 'transparent',
                    color: isActive ? '#1B4332' : '#1A1C1A',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    transition: 'background 0.15s, color 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F0F4F2'
                      e.currentTarget.style.color = '#2D6A4F'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#1A1C1A'
                    }
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontVariationSettings: isActive
                        ? "'FILL' 0, 'wght' 500"
                        : "'FILL' 0, 'wght' 300",
                      fontSize: 20,
                      flexShrink: 0,
                      color: isActive ? '#1B4332' : '#475569',
                      lineHeight: 1,
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                </NavLink>
              )
            }

            if (item.type === 'dropdown') {
              const isExpanded = openGroups[item.id]
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
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: 'none',
                      outline: 'none',
                      background: hasActiveChild && !isExpanded ? '#E8F5ED' : 'transparent',
                      color: hasActiveChild ? '#1B4332' : '#1A1C1A',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      fontWeight: hasActiveChild ? 700 : 500,
                      transition: 'background 0.15s, color 0.15s',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      if (!(hasActiveChild && !isExpanded)) {
                        e.currentTarget.style.background = '#F0F4F2'
                        e.currentTarget.style.color = '#2D6A4F'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!(hasActiveChild && !isExpanded)) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = hasActiveChild ? '#1B4332' : '#1A1C1A'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 20,
                          flexShrink: 0,
                          color: hasActiveChild ? '#1B4332' : '#475569',
                          lineHeight: 1,
                        }}
                      >
                        {item.icon}
                      </span>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 12, borderLeft: '2px solid #E2E8F0', marginLeft: 20, marginTop: 2, marginBottom: 4 }}>
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.path || pathname.startsWith(child.path + '/')

                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8.5px 12px',
                              borderRadius: 8,
                              textDecoration: 'none',
                              background: isChildActive ? '#E8F5ED' : 'transparent',
                              color: isChildActive ? '#1B4332' : '#334155',
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13.5,
                              fontWeight: isChildActive ? 700 : 500,
                              transition: 'background 0.15s, color 0.15s',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                              if (!isChildActive) {
                                e.currentTarget.style.background = '#F0F4F2'
                                e.currentTarget.style.color = '#2D6A4F'
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isChildActive) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#334155'
                              }
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                fontVariationSettings: isChildActive
                                  ? "'FILL' 0, 'wght' 500"
                                  : "'FILL' 0, 'wght' 300",
                                fontSize: 18,
                                flexShrink: 0,
                                color: isChildActive ? '#1B4332' : '#64748B',
                                lineHeight: 1,
                              }}
                            >
                              {child.icon}
                            </span>
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
