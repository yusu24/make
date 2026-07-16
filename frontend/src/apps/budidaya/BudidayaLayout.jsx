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
  const { user } = useAuth()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (user === undefined) return null

  if (user?.role !== 'tenant' && user?.role !== 'worker' && user?.role !== 'super_admin' && user?.role !== 'customer') {
    return <div style={{padding: 24}}>Unauthorized module access.</div>
  }

  return (
    <div className="budidaya-scope h-screen overflow-hidden bg-[#F8FAF9] flex flex-col">
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
