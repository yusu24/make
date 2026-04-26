import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import './budidaya.css'

const NAV_ITEMS = [
  { label: 'Dashboard',           icon: 'grid_view',     path: '/budidaya/dashboard' },
  { label: 'Manajemen Kolam',     icon: 'water_drop',    path: '/budidaya/ponds'     },
  { label: 'Gudang',              icon: 'inventory_2',   path: '/budidaya/inventory' },
  { label: 'Manajemen Pengguna',  icon: 'group',         path: '/budidaya/users'     },
  { label: 'Peran & Izin',        icon: 'verified_user', path: '/budidaya/roles'     },
  { label: 'Laporan & Analisa',   icon: 'bar_chart',     path: '/budidaya/reports'   },
  { label: 'Pengaturan Profil',   icon: 'settings',      path: '/budidaya/settings'  },
]

export default function BudidayaSidebar({ mobileOpen, onToggle }) {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    logout()
    navigate('/login')
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
              water_drop
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
                fontWeight: 500,
                color: '#94A3B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Budidaya Pintar
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
                  color: isActive ? '#1B4332' : '#94A3B8',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 500,
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
                    e.currentTarget.style.color = '#94A3B8'
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

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Logout ── */}
        <div style={{ padding: '12px 12px 28px', borderTop: '1px solid #E9F0EC' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              width: '100%',
              borderRadius: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 500,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#FEF2F2'
              e.currentTarget.style.color = '#EF4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: "'FILL' 0, 'wght' 300",
                fontSize: 20,
                flexShrink: 0,
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              logout
            </span>
            <span>Keluar</span>
          </button>
        </div>
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
