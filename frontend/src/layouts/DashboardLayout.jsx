import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SubscriptionLock from '../components/SubscriptionLock'
import AnnouncementModal from '../components/AnnouncementModal'
import CommandPalette from '../components/CommandPalette'
import RetailAiFab from '../apps/retail/components/RetailAiFab'
import AdminMobileBottomNav from '../apps/admin/components/AdminMobileBottomNav'
import AdminMobileBottomSheet from '../apps/admin/components/AdminMobileBottomSheet'
import RetailMobileBottomNav from '../apps/retail/components/RetailMobileBottomNav'
import RetailMobileBottomSheet from '../apps/retail/components/RetailMobileBottomSheet'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1200)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isImpersonating, exitImpersonate, isSuperAdmin } = useAuth()
  const { theme } = useTheme()

  const isRetail = pathname.startsWith('/retail') || pathname.startsWith('/seller') || pathname.startsWith('/budidaya') || pathname.startsWith('/kuliner')
  const isActualRetail = pathname.startsWith('/retail')
  const isSaasAdmin = !isRetail && (isSuperAdmin?.() || user?.role === 'admin' || user?.role === 'super_admin')

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
    setMobileSheetOpen(false)
    if (pathname === '/retail/pos' || pathname === '/seller/pos') {
      setCollapsed(true)
    }
  }, [pathname])

  // Leaving the page restores whatever collapsed/header state the user had.
  const isPosPage = pathname === '/retail/pos' || pathname === '/seller/pos'
  const isMobile = window.innerWidth < 768
  const effectiveCollapsed = collapsed
  const sidebarOffset = isMobile ? 0 : (effectiveCollapsed ? 68 : 260)

  const handleMenuToggle = () => {
    if (window.innerWidth < 768) {
      if (isSaasAdmin || isActualRetail) {
        setMobileSheetOpen(v => !v)
      } else {
        setMobileOpen(v => !v)
      }
    } else {
      setCollapsed(v => !v)
    }
  }

  const handleExitImpersonate = () => {
    const redirectTo = exitImpersonate()
    navigate(redirectTo || '/tenants')
  }

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
            onMenuToggle={handleMenuToggle}
            collapsed={effectiveCollapsed}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />
        )}
        <main className={`page-content ${pathname.startsWith('/retail') || isPosPage ? 'page-content--retail' : ''} ${isPosPage ? 'page-content--full' : ''} ${isSaasAdmin ? 'page-content--admin' : ''}`}>
          <SubscriptionLock status={user?.subscription_status} daysLeft={user?.subscription_days_left} />
          <AnnouncementModal />
          <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
          <Outlet context={{ onMenuToggle: handleMenuToggle }} />

          {/* Mobile Bottom Clearance Spacer so bottom-most content is never covered by bottom nav */}
          {!isPosPage && (
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
          )}
        </main>
      </div>

      {/* Floating AI Bubble for Retail */}
      <RetailAiFab />

      {/* Responsive Mobile Bottom Nav & Sheet for SaaS Admin */}
      {isSaasAdmin && (
        <>
          <AdminMobileBottomNav
            onOpenSearch={() => setCommandPaletteOpen(true)}
            onToggleMore={() => setMobileSheetOpen(v => !v)}
            isSheetOpen={mobileSheetOpen}
          />
          <AdminMobileBottomSheet
            isOpen={mobileSheetOpen}
            onClose={() => setMobileSheetOpen(false)}
          />
        </>
      )}

      {/* Responsive Mobile Bottom Nav & Sheet for Retail */}
      {isActualRetail && (
        <>
          {!isPosPage && (
            <RetailMobileBottomNav
              onToggleMore={() => setMobileSheetOpen(v => !v)}
              isSheetOpen={mobileSheetOpen}
            />
          )}
          <RetailMobileBottomSheet
            isOpen={mobileSheetOpen}
            onClose={() => setMobileSheetOpen(false)}
          />
        </>
      )}
    </div>
  )
}
