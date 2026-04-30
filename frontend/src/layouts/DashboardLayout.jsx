import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SubscriptionLock from '../components/SubscriptionLock'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1200)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isImpersonating, exitImpersonate } = useAuth()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) setCollapsed(true)
      else setCollapsed(false)
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const sidebarOffset = collapsed ? 68 : 260

  const handleExitImpersonate = () => {
    const redirectTo = exitImpersonate()
    navigate(redirectTo || '/tenants')
  }

  return (
    <div className={`app-layout ${mobileOpen ? 'app-layout--mobile-open' : ''}`}>
      {/* Impersonation Banner */}
      {isImpersonating() && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#D97706', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          padding: '8px 20px', fontSize: 13, fontWeight: 600,
        }}>
          <span>⚠️ Anda sedang dalam mode impersonasi sebagai: <strong>{user?.name}</strong> ({user?.business_category})</span>
          <button
            onClick={handleExitImpersonate}
            style={{
              background: '#fff', color: '#D97706', border: 'none',
              borderRadius: 8, padding: '4px 14px', fontWeight: 700,
              cursor: 'pointer', fontSize: 12,
            }}
          >
            ✕ Keluar Impersonasi
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(v => !v)}
      />

      <div
        className="main-content"
        style={{
          marginLeft: sidebarOffset,
          transition: 'margin-left var(--transition-base)',
          paddingTop: isImpersonating() ? 40 : 0,
        }}
      >
        <Header
          onMenuToggle={() => {
            if (window.innerWidth < 768) setMobileOpen(v => !v)
            else setCollapsed(v => !v)
          }}
          collapsed={collapsed}
        />
        <main className="page-content">
          <SubscriptionLock status={user?.subscription_status} daysLeft={user?.subscription_days_left} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
