import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Layers, RefreshCw, LayoutGrid } from '@/constants/icons'
import '../../../apps/admin/components/AdminMobileNav.css'

export default function BudidayaMobileBottomNav({ onToggleMore, isSheetOpen }) {
  const { pathname } = useLocation()

  const isHomeActive = pathname === '/budidaya/dashboard'
  const isPondsActive = pathname.startsWith('/budidaya/ponds')
  const isCyclesActive = pathname.startsWith('/budidaya/cycles')

  return (
    <nav className="admin-mobile-bottom-nav" aria-label="Navigasi Mobile Budidaya">
      {/* 1. Home */}
      <NavLink
        to="/budidaya/dashboard"
        className={`admin-nav-tab ${isHomeActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Home size={20} />
        </div>
        <span className="admin-nav-tab-label">Home</span>
      </NavLink>

      {/* 2. Kolam / Lahan */}
      <NavLink
        to="/budidaya/ponds"
        className={`admin-nav-tab ${isPondsActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Layers size={20} />
        </div>
        <span className="admin-nav-tab-label">Kolam/Lahan</span>
      </NavLink>

      {/* 3. Siklus */}
      <NavLink
        to="/budidaya/cycles"
        className={`admin-nav-tab ${isCyclesActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <RefreshCw size={20} />
        </div>
        <span className="admin-nav-tab-label">Siklus</span>
      </NavLink>

      {/* 4. More */}
      <button
        type="button"
        className={`admin-nav-tab ${isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={onToggleMore}
        title="Semua Modul Budidaya"
      >
        <div className="admin-nav-tab-icon">
          <LayoutGrid size={20} />
        </div>
        <span className="admin-nav-tab-label">More</span>
      </button>
    </nav>
  )
}
