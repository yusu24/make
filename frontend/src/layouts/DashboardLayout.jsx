import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SubscriptionLock from '../components/SubscriptionLock'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1200)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isImpersonating, exitImpersonate } = useAuth()
  const { theme } = useTheme()

  // Dark mode is removed — always force theme-light globally
  useEffect(() => {
    const body = document.body
    body.classList.remove('theme-dark')
    body.classList.add('theme-light')
  }, [pathname])

  // Responsive sidebar toggles
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Leaving the page restores whatever collapsed/header state the user had.
  const isPosPage = pathname === '/retail/pos'
  const effectiveCollapsed = isPosPage ? true : collapsed
  const sidebarOffset = effectiveCollapsed ? 68 : 260

  const handleExitImpersonate = () => {
    const redirectTo = exitImpersonate()
    navigate(redirectTo || '/tenants')
  }

  return (
    <div className={`app-layout ${mobileOpen ? 'app-layout--mobile-open' : ''}`}>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={effectiveCollapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(v => !v)}
      />

      <div
        className="main-content"
        style={{
          marginLeft: sidebarOffset,
          transition: 'margin-left var(--transition-base)',
        }}
      >
        {!isPosPage && (
          <Header
            onMenuToggle={() => {
              if (window.innerWidth < 768) setMobileOpen(v => !v)
              else setCollapsed(v => !v)
            }}
            collapsed={effectiveCollapsed}
          />
        )}
        <main className={`page-content ${pathname.startsWith('/retail') ? 'page-content--retail' : ''} ${isPosPage ? 'page-content--full' : ''}`}>
          <SubscriptionLock status={user?.subscription_status} daysLeft={user?.subscription_days_left} />
          <Outlet context={{ onMenuToggle: () => {
            if (window.innerWidth < 768) setMobileOpen(v => !v)
            else setCollapsed(v => !v)
          }}} />
        </main>
      </div>
    </div>
  )
}
