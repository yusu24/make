import { NavLink, useLocation } from 'react-router-dom'
import { useBudidayaTerms } from './hooks/useBudidayaTerms'
import { useAuth } from '../../contexts/AuthContext'
import './budidaya.css'

const getNavItems = (terms) => [
  { label: 'Dashboard',           icon: 'grid_view',     path: '/budidaya/dashboard' },
  { label: terms.isTanaman ? 'Manajemen Lahan' : 'Manajemen Kolam', icon: terms.isTanaman ? 'grass' : 'water_drop', path: '/budidaya/ponds' },
  { label: 'Siklus Budidaya',     icon: 'cycle',         path: '/budidaya/cycles'    },
  { label: 'Gudang',              icon: 'inventory_2',   path: '/budidaya/inventory' },
  { label: 'Manajemen Pengguna',  icon: 'group',         path: '/budidaya/users'     },
  { label: 'Peran & Izin',        icon: 'verified_user', path: '/budidaya/roles'     },
  { label: 'Laporan & Analisa',   icon: 'bar_chart',     path: '/budidaya/reports'   },
  { label: 'Paket Langganan',     icon: 'credit_card',   path: '/budidaya/subscription' },
  { label: 'Pusat Bantuan',       icon: 'help',          path: '/budidaya/support'   },
  { label: 'Pengaturan Profil',   icon: 'settings',      path: '/budidaya/settings'  },
]

export default function BudidayaSidebar({ mobileOpen, onToggle }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const terms = useBudidayaTerms()
  const NAV_ITEMS = getNavItems(terms)

  return (
    <>
      {/* ─── Sidebar ─── */}
      <aside
        className={`aq-sidebar ${mobileOpen ? 'aq-sidebar--open' : ''}`}
        style={{
          width: 240,
          background: '#FFFFFF',
          borderRight: '1px solid #E9F0EC',
        }}
      >
        {/* ── Brand / Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 20px 24px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
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
                fontSize: 22,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {terms.isTanaman ? 'eco' : 'water_drop'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: '#1B4332',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              AquaGrow
            </span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: '#475569',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {terms.isTanaman ? 'Pertanian Pintar' : 'Budidaya Pintar'}
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 12px', flex: 'none' }}>
          {NAV_ITEMS.map((item) => {
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
                    color: 'inherit',
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </NavLink>
            )
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
