import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, CreditCard, Package, LayoutGrid } from '@/constants/icons'
import '../../admin/components/AdminMobileNav.css'

export default function RetailMobileBottomNav({ onToggleMore, isSheetOpen }) {
  const { pathname } = useLocation()

  const isHomeActive = pathname === '/retail/dashboard'
  const isPosActive = pathname === '/retail/pos'
  const isStokActive = pathname.startsWith('/retail/inventory') || pathname.startsWith('/retail/products')

  return (
    <nav className="admin-mobile-bottom-nav" aria-label="Navigasi Mobile Toko Retail">
      {/* 1. Home */}
      <NavLink
        to="/retail/dashboard"
        className={`admin-nav-tab ${isHomeActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Home size={20} />
        </div>
        <span className="admin-nav-tab-label">Home</span>
      </NavLink>

      {/* 2. Kasir POS */}
      <NavLink
        to="/retail/pos"
        className={`admin-nav-tab ${isPosActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <CreditCard size={20} />
        </div>
        <span className="admin-nav-tab-label">Kasir</span>
      </NavLink>

      {/* 3. Stok Barang */}
      <NavLink
        to="/retail/inventory"
        className={`admin-nav-tab ${isStokActive && !isSheetOpen ? 'admin-nav-tab--active' : ''}`}
      >
        <div className="admin-nav-tab-icon">
          <Package size={20} />
        </div>
        <span className="admin-nav-tab-label">Stok</span>
      </NavLink>

      {/* 4. More */}
      <button
        type="button"
        className={`admin-nav-tab ${isSheetOpen ? 'admin-nav-tab--active' : ''}`}
        onClick={onToggleMore}
        title="Semua Modul Retail"
      >
        <div className="admin-nav-tab-icon">
          <LayoutGrid size={20} />
        </div>
        <span className="admin-nav-tab-label">More</span>
      </button>
    </nav>
  )
}
