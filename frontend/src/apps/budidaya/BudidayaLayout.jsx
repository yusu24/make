import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BudidayaSidebar from './BudidayaSidebar'
import BudidayaHeader from './components/BudidayaHeader'
import SubscriptionLock from '../../components/SubscriptionLock'

export default function BudidayaLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Wait for context to hydrate
  if (user === undefined) return null

  // Ensure only authorized users access this 
  if (user?.role !== 'tenant' && user?.role !== 'worker' && user?.role !== 'super_admin' && user?.role !== 'customer') {
    return <div style={{padding: 24}}>Unauthorized module access.</div>
  }

  return (
    <div className="budidaya-scope min-h-screen bg-[#F8FAF9]">
      <BudidayaSidebar 
        mobileOpen={mobileOpen}
        onToggle={() => setMobileOpen(v => !v)} 
      />
      
      {/* Main Content — offset by sidebar width 240px */}
      <div className="flex flex-col min-h-screen" style={{ marginLeft: '240px' }}>
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





