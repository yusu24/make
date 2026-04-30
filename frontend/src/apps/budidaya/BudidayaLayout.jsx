import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BudidayaSidebar from './BudidayaSidebar'
import BudidayaHeader from './components/BudidayaHeader'
import SubscriptionLock from '../../components/SubscriptionLock'

export default function BudidayaLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isImpersonating, exitImpersonate } = useAuth()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (user === undefined) return null

  if (user?.role !== 'tenant' && user?.role !== 'worker' && user?.role !== 'super_admin' && user?.role !== 'customer') {
    return <div style={{padding: 24}}>Unauthorized module access.</div>
  }

  const handleExitImpersonate = () => {
    const redirectTo = exitImpersonate()
    navigate(redirectTo || '/tenants')
  }

  return (
    <div className="budidaya-scope min-h-screen bg-[#F8FAF9]">
      {/* Impersonation Banner */}
      {isImpersonating() && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#D97706', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          padding: '8px 20px', fontSize: 13, fontWeight: 600,
        }}>
          <span>⚠️ Mode Impersonasi: <strong>{user?.name}</strong> — {user?.business_category}</span>
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

      <BudidayaSidebar
        mobileOpen={mobileOpen}
        onToggle={() => setMobileOpen(v => !v)}
      />

      {/* Main Content — offset by sidebar width 240px on desktop via CSS class */}
      <div
        className="aq-main-content flex flex-col min-h-screen transition-all duration-300"
        style={{ paddingTop: isImpersonating() ? 40 : 0 }}
      >
        <BudidayaHeader
          onMenuToggle={() => setMobileOpen(v => !v)}
        />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <SubscriptionLock status={user?.subscription_status} daysLeft={user?.trial_days_left} />
    </div>
  )
}
