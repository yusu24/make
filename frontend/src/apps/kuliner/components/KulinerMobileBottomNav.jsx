import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Utensils, LayoutGrid } from '@/constants/icons'
import '../../admin/components/AdminMobileNav.css'

export default function KulinerMobileBottomNav({ onToggleMore, isSheetOpen }) {
  const { pathname } = useLocation()

  const isHomeActive = pathname === '/kuliner/admin'
  const isOrdersActive = pathname === '/kuliner/admin/orders' || pathname.startsWith('/kuliner/admin/kitchen')
  const isMenuActive = pathname === '/kuliner/admin/categories' || pathname.startsWith('/kuliner/admin/bundles') || pathname.startsWith('/kuliner/admin/modifiers') || pathname.startsWith('/kuliner/admin/recipes')

  return (
    <nav className="admin-mobile-bottom-nav" aria-label="Navigasi Mobile Kuliner">
      {/* 1. Home */}
      <NavLink
        to="/kuliner/admin"
        className={`admin-nav-tab ${isHomeActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Home size={20} />
        </div>
        <span className="admin-nav-tab-label">Home</span>
      </NavLink>

      {/* 2. Pesanan & Kasir */}
      <NavLink
        to="/kuliner/admin/orders"
        className={`admin-nav-tab ${isOrdersActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <ClipboardList size={20} />
        </div>
        <span className="admin-nav-tab-label">Pesanan</span>
      </NavLink>

      {/* 3. Menu Hidangan */}
      <NavLink
        to="/kuliner/admin/categories"
        className={`admin-nav-tab ${isMenuActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Utensils size={20} />
        </div>
        <span className="admin-nav-tab-label">Menu</span>
      </NavLink>

      {/* 4. More */}
      <button
        type="button"
        className={`admin-nav-tab ${isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={onToggleMore}
        title="Semua Modul Kuliner"
      >
        <div className="admin-nav-tab-icon">
          <LayoutGrid size={20} />
        </div>
        <span className="admin-nav-tab-label">More</span>
      </button>
    </nav>
  )
}
