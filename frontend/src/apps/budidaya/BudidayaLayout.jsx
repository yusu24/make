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
    <div className="budidaya-scope h-screen overflow-hidden bg-[#F8FAF9] flex flex-col">
      {/* Impersonation Banner */}
      {isImpersonating() && (
        <div style={{ 
          background: 'linear-gradient(90deg, #ef4444, #f97316)', 
          color: 'white', 
          padding: '10px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️ Anda sedang dalam mode penyamaran (Impersonate): <strong>{user?.name}</strong> — {user?.business_category}</span>
          </div>
          <button 
            onClick={handleExitImpersonate}
            style={{ 
              background: 'white', 
              color: '#ef4444', 
              border: 'none', 
              padding: '4px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            Kembali ke Admin SaaS
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <BudidayaSidebar
          mobileOpen={mobileOpen}
          onToggle={() => setMobileOpen(v => !v)}
        />

        {/* Main Content — offset by sidebar width 240px on desktop via CSS class */}
        <div className="aq-main-content flex flex-col flex-1 overflow-hidden transition-all duration-300">
          <BudidayaHeader
            onMenuToggle={() => setMobileOpen(v => !v)}
          />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <SubscriptionLock status={user?.subscription_status} daysLeft={user?.trial_days_left} />
    </div>
  )
}
