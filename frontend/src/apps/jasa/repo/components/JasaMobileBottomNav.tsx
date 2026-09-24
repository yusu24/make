import React from 'react'
import { Home, Wrench, CreditCard, LayoutGrid } from '@/constants/icons'
import '../../../../apps/admin/components/AdminMobileNav.css'

interface JasaMobileBottomNavProps {
  activeTab: string
  onSelectTab: (tab: string) => void
  onToggleMore: () => void
  isSheetOpen: boolean
}

export const JasaMobileBottomNav: React.FC<JasaMobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onToggleMore,
  isSheetOpen,
}) => {
  const isHomeActive = activeTab === 'overview'
  const isSpkActive = activeTab === 'work-orders'
  const isPosActive = activeTab === 'pos'

  return (
    <nav className="admin-mobile-bottom-nav" aria-label="Navigasi Mobile Jasa">
      {/* 1. Home */}
      <button
        type="button"
        className={`admin-nav-tab ${isHomeActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={() => onSelectTab('overview')}
      >
        <div className="admin-nav-tab-icon">
          <Home size={20} />
        </div>
        <span className="admin-nav-tab-label">Home</span>
      </button>

      {/* 2. SPK / Servis */}
      <button
        type="button"
        className={`admin-nav-tab ${isSpkActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={() => onSelectTab('work-orders')}
      >
        <div className="admin-nav-tab-icon">
          <Wrench size={20} />
        </div>
        <span className="admin-nav-tab-label">SPK Servis</span>
      </button>

      {/* 3. Kasir POS */}
      <button
        type="button"
        className={`admin-nav-tab ${isPosActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={() => onSelectTab('pos')}
      >
        <div className="admin-nav-tab-icon">
          <CreditCard size={20} />
        </div>
        <span className="admin-nav-tab-label">Kasir</span>
      </button>

      {/* 4. More */}
      <button
        type="button"
        className={`admin-nav-tab ${isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={onToggleMore}
        title="Semua Modul Jasa"
      >
        <div className="admin-nav-tab-icon">
          <LayoutGrid size={20} />
        </div>
        <span className="admin-nav-tab-label">More</span>
      </button>
    </nav>
  )
}
