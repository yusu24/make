import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import './budidaya.css'

const NAV_ITEMS = [
  { label: 'Dashboard',           icon: 'grid_view',     path: '/budidaya'         },
  { label: 'Pond Management',     icon: 'water_drop',    path: '/budidaya/ponds'   },
  { label: 'Reports & Analytics', icon: 'bar_chart',     path: '/budidaya/reports' },
  { label: 'User Settings',       icon: 'settings',      path: '/budidaya/settings'},
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
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white z-50
          flex flex-col
          transition-transform duration-300
          border-r border-slate-100
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 pt-8 pb-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: '#1B4332' }}
          >
            <span
              className="material-symbols-outlined text-white text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              water_drop
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[19px] font-extrabold leading-tight" style={{ color: '#1B4332' }}>
              AquaGrow
            </span>
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-slate-400">
              Smart Aquaculture
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/budidaya'
                ? pathname === '/budidaya' || pathname === '/budidaya/'
                : pathname.startsWith(item.path)

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150"
                style={({ isActive: linkActive }) => {
                  const active = isActive || linkActive
                  return {
                    backgroundColor: active ? '#DCF0E2' : 'transparent',
                    color: active ? '#1B4332' : '#94A3B8',
                    fontWeight: active ? '600' : '400',
                  }
                }}
              >
                {/* Left border indicator for active */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style={{ width: 4, height: 28, background: '#1B4332' }}
                  />
                )}

                <span
                  className="material-symbols-outlined text-[22px] shrink-0"
                  style={{
                    fontVariationSettings: "'FILL' 0, 'wght' 400",
                    color: isActive ? '#1B4332' : '#94A3B8',
                  }}
                >
                  {item.icon}
                </span>

                <span className="text-[14px] leading-snug">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-8 pt-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
            <span className="text-[14px] font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/25 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
