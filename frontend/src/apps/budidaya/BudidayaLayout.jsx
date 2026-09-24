import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BudidayaSidebar from './BudidayaSidebar'
import BudidayaHeader from './components/BudidayaHeader'
import BudidayaAiFab from './components/BudidayaAiFab'
import BudidayaMobileBottomNav from './components/BudidayaMobileBottomNav'
import BudidayaMobileBottomSheet from './components/BudidayaMobileBottomSheet'
import SubscriptionLock from '../../components/SubscriptionLock'
import { BudidayaProvider } from './contexts/BudidayaContext'

export default function BudidayaLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('budidaya_sidebar_collapsed')
      if (saved !== null) return saved === 'true'
    } catch {}
    return typeof window !== 'undefined' && window.innerWidth < 1200
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    try {
      localStorage.setItem('budidaya_sidebar_collapsed', String(collapsed))
    } catch {}
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
    setIsBottomSheetOpen(false)
  }, [pathname])

  if (user === undefined) return null

  if (user?.role !== 'tenant' && user?.role !== 'worker' && user?.role !== 'super_admin' && user?.role !== 'customer') {
    return <div style={{padding: 24}}>Unauthorized module access.</div>
  }

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setCollapsed(v => !v)
  }

  return (
    <BudidayaProvider>
      <div className="budidaya-scope h-screen overflow-hidden bg-[#F8FAF9] flex flex-col">
        <div className="flex flex-1 overflow-hidden relative">
          <BudidayaSidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onToggle={toggleSidebar}
            onCloseMobile={() => setMobileOpen(false)}
          />

          {/* Main Content */}
          <div className={`aq-main-content flex flex-col flex-1 overflow-hidden transition-all duration-300 ${!isMobile && collapsed ? 'aq-main-content--collapsed' : ''}`}>
            <BudidayaHeader
              collapsed={collapsed}
              onMenuToggle={() => {
                if (window.innerWidth < 768) setIsBottomSheetOpen(v => !v)
                else if (window.innerWidth < 1024) setMobileOpen(v => !v)
                else toggleSidebar()
              }}
            />
            <main className="flex-1 overflow-y-auto">
              <Outlet />
              {/* Mobile Bottom Clearance Spacer so bottom-most content is never covered by bottom nav */}
              <div
                className="md:hidden"
                style={{
                  height: 'calc(110px + env(safe-area-inset-bottom, 16px))',
                  width: '100%',
                  pointerEvents: 'none',
                  flexShrink: 0
                }}
                aria-hidden="true"
              />
            </main>
          </div>
        </div>

        <SubscriptionLock status={user?.subscription_status} daysLeft={user?.trial_days_left} />
        <BudidayaAiFab />

        {/* Mobile Bottom Navigation & Slide-up Sheet */}
        <BudidayaMobileBottomNav
          onToggleMore={() => setIsBottomSheetOpen(prev => !prev)}
          isSheetOpen={isBottomSheetOpen}
        />
        <BudidayaMobileBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
        />
      </div>
    </BudidayaProvider>
  )
}
