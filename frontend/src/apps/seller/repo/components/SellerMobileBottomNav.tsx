import React from 'react'
import { Home, ShoppingBag, CreditCard, LayoutGrid } from '@/constants/icons'
import '../../../../apps/admin/components/AdminMobileNav.css'
import { ActiveTab } from '../types'

interface SellerMobileBottomNavProps {
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
  onToggleMore: () => void
  isSheetOpen: boolean
}

export const SellerMobileBottomNav: React.FC<SellerMobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onToggleMore,
  isSheetOpen,
}) => {
  const isHomeActive = activeTab === 'menu-utama'
  const isOrdersActive = activeTab === 'pesanan'
  const isPosActive = activeTab === 'toko-offline'

  return (
    <nav className="admin-mobile-bottom-nav" aria-label="Navigasi Mobile Seller">
      {/* 1. Home */}
      <button
        type="button"
        className={`admin-nav-tab ${isHomeActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={() => onSelectTab('menu-utama')}
      >
        <div className="admin-nav-tab-icon">
          <Home size={20} />
        </div>
        <span className="admin-nav-tab-label">Home</span>
      </button>

      {/* 2. Pesanan */}
      <button
        type="button"
        className={`admin-nav-tab ${isOrdersActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={() => onSelectTab('pesanan')}
      >
        <div className="admin-nav-tab-icon">
          <ShoppingBag size={20} />
        </div>
        <span className="admin-nav-tab-label">Pesanan</span>
      </button>

      {/* 3. Kasir POS */}
      <button
        type="button"
        className={`admin-nav-tab ${isPosActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={() => onSelectTab('toko-offline')}
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
        title="Semua Modul Seller"
      >
        <div className="admin-nav-tab-icon">
          <LayoutGrid size={20} />
        </div>
        <span className="admin-nav-tab-label">More</span>
      </button>
    </nav>
  )
}
