import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SubscriptionLock from '../components/SubscriptionLock'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1200)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()

  // Handle window resize to auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) setCollapsed(true)
      else setCollapsed(false)
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Sidebar offset follows collapsed state for all pages (retail now supports expand/collapse too)
  const sidebarOffset = collapsed ? 68 : 260

  return (
    <div className={`app-layout ${mobileOpen ? 'app-layout--mobile-open' : ''}`}>
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
        style={{ marginLeft: sidebarOffset, transition: 'margin-left var(--transition-base)' }}
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
