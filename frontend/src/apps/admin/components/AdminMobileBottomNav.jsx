import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Store, LayoutGrid } from '@/constants/icons'
import './AdminMobileNav.css'

export default function AdminMobileBottomNav({ onOpenSearch, onToggleMore, isSheetOpen }) {
  const { pathname } = useLocation()

  const isHomeActive = pathname === '/dashboard' || pathname === '/admin/dashboard'
  const isTenantsActive = pathname === '/tenants' || pathname === '/admin/tenants'

  return (
    <nav className="admin-mobile-bottom-nav" aria-label="Navigasi Mobile Admin SaaS">
      {/* 1. Home */}
      <NavLink
        to="/dashboard"
        className={`admin-nav-tab ${isHomeActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Home size={20} />
        </div>
        <span className="admin-nav-tab-label">Home</span>
      </NavLink>

      {/* 2. Search */}
      <button
        type="button"
        className="admin-nav-tab"
        onClick={onOpenSearch}
        title="Cari menu & aksi"
      >
        <div className="admin-nav-tab-icon">
          <Search size={20} />
        </div>
        <span className="admin-nav-tab-label">Search</span>
      </button>

      {/* 3. Tenants */}
      <NavLink
        to="/tenants"
        className={`admin-nav-tab ${isTenantsActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Store size={20} />
        </div>
        <span className="admin-nav-tab-label">Tenants</span>
      </NavLink>

      {/* 4. More */}
      <button
        type="button"
        className={`admin-nav-tab ${isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={onToggleMore}
        title="Semua Modul"
      >
        <div className="admin-nav-tab-icon">
          <LayoutGrid size={20} />
        </div>
        <span className="admin-nav-tab-label">More</span>
      </button>
    </nav>
  )
}
