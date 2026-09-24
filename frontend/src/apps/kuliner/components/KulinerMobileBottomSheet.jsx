import React, { useState, useMemo, useEffect } from 'react'
import {
  NavLink,
  useLocation } from 'react-router-dom'
import {
  X,
  Search,
  Home,
  ClipboardList,
  ChefHat,
  Clock,
  Grid3X3,
  Utensils,
  Package,
  SlidersHorizontal,
  PlusCircle,
  BookOpen,
  Boxes,
  ShoppingCart,
  ClipboardCheck,
  Trash2,
  Building2,
  BadgePercent,
  Star,
  TrendingUp,
  Wallet,
  Receipt,
  Tag,
  BarChart2,
  FileText,
  LineChart,
  Users,
  ShieldCheck,
  Store,
  HardDriveDownload,
  Plug,
  CreditCard,
  HelpCircle,
  Sparkles
} from '@/constants/icons'
import '../../admin/components/AdminMobileNav.css'

export const KULINER_MODULE_SECTIONS = [
  {
    group: 'MENU UTAMA',
    items: [
      { path: '/kuliner/admin', icon: <Home size={20} />, label: 'Dashboard Resto', code: 'R01' },
      { path: '/kuliner/admin/orders', icon: <ClipboardList size={20} />, label: 'Pesanan Masuk & Kasir', code: 'R02' },
    ]
  },
  {
    group: 'OPERASIONAL KASIR & DAPUR',
    items: [
      { path: '/kuliner/admin/kitchen-queue', icon: <ChefHat size={20} />, label: 'Antrean Dapur (KDS)', code: 'O01' },
      { path: '/kuliner/admin/shift', icon: <Clock size={20} />, label: 'Manajemen Shift Kasir', code: 'O02' },
      { path: '/kuliner/admin/tables', icon: <Grid3X3 size={20} />, label: 'Manajemen Meja Dine-In', code: 'O03' },
    ]
  },
  {
    group: 'MENU & RESEP (HPP)',
    items: [
      { path: '/kuliner/admin/categories', icon: <Utensils size={20} />, label: 'Kategori & Menu Makanan', code: 'M01' },
      { path: '/kuliner/admin/bundles', icon: <Package size={20} />, label: 'Paket Menu & Bundling', code: 'M02' },
      { path: '/kuliner/admin/modifiers', icon: <SlidersHorizontal size={20} />, label: 'Modifier & Varian', code: 'M03' },
      { path: '/kuliner/admin/addons', icon: <PlusCircle size={20} />, label: 'Add-on & Tambahan', code: 'M04' },
      { path: '/kuliner/admin/recipes', icon: <BookOpen size={20} />, label: 'Resep & BOM Hidangan', code: 'M05' },
    ]
  },
  {
    group: 'INVENTORY DAPUR & BAHAN',
    items: [
      { path: '/kuliner/admin/ingredients', icon: <Boxes size={20} />, label: 'Daftar Bahan Baku', code: 'I01' },
      { path: '/kuliner/admin/purchases', icon: <ShoppingCart size={20} />, label: 'Pembelian Bahan (PO)', code: 'I02' },
      { path: '/kuliner/admin/stock-opname', icon: <ClipboardCheck size={20} />, label: 'Stock Opname Bahan', code: 'I03' },
      { path: '/kuliner/admin/waste', icon: <Trash2 size={20} />, label: 'Pencatatan Waste & Basi', code: 'I04' },
      { path: '/kuliner/admin/suppliers', icon: <Building2 size={20} />, label: 'Master Supplier Bahan', code: 'I05' },
    ]
  },
  {
    group: 'PEMASARAN & LOYALITAS',
    items: [
      { path: '/kuliner/admin/promos', icon: <BadgePercent size={20} />, label: 'Promo & Diskon', code: 'P01' },
      { path: '/kuliner/admin/reviews', icon: <Star size={20} />, label: 'Ulasan & Rating', code: 'P02' },
    ]
  },
  {
    group: 'KEUANGAN & LAPORAN',
    items: [
      { path: '/kuliner/admin/finance-summary', icon: <TrendingUp size={20} />, label: 'Laporan Laba Rugi', code: 'F01' },
      { path: '/kuliner/admin/expenses', icon: <Wallet size={20} />, label: 'Pencatatan Kas & Beban', code: 'F02' },
      { path: '/kuliner/admin/transactions', icon: <Receipt size={20} />, label: 'Jurnal Transaksi Kas', code: 'F03' },
      { path: '/kuliner/admin/finance-categories', icon: <Tag size={20} />, label: 'Kategori Keuangan Kas', code: 'F04' },
      { path: '/kuliner/admin/reports', icon: <BarChart2 size={20} />, label: 'Laba & Margin Menu', code: 'F05' },
      { path: '/kuliner/admin/reports-advanced', icon: <FileText size={20} />, label: 'Laporan Lengkap Resto', code: 'F06' },
      { path: '/kuliner/admin/analytics', icon: <LineChart size={20} />, label: 'Analitik Penjualan', code: 'F07' },
    ]
  },
  {
    group: 'KARYAWAN & SISTEM',
    items: [
      { path: '/kuliner/admin/staff', icon: <Users size={20} />, label: 'Manajemen Staf', code: 'S01' },
      { path: '/kuliner/admin/roles', icon: <ShieldCheck size={20} />, label: 'Hak Akses & Role', code: 'S02' },
      { path: '/kuliner/admin/settings', icon: <Store size={20} />, label: 'Pengaturan Toko', code: 'S03' },
      { path: '/kuliner/admin/backup', icon: <HardDriveDownload size={20} />, label: 'Backup Data Toko', code: 'S04' },
      { path: '/kuliner/admin/developer-api', icon: <Plug size={20} />, label: 'Integrasi API & Webhook', code: 'S05' },
      { path: '/kuliner/admin/guide', icon: <BookOpen size={20} />, label: 'Buku Panduan & SOP', code: 'S06' },
      { path: '/kuliner/subscription', icon: <CreditCard size={20} />, label: 'Paket Langganan', code: 'S07' },
      { path: '/kuliner/admin/support', icon: <HelpCircle size={20} />, label: 'Pusat Bantuan', code: 'S08' },
    ]
  }
]

export default function KulinerMobileBottomSheet({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { pathname } = useLocation()

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setSearchQuery('')
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return KULINER_MODULE_SECTIONS
    const q = searchQuery.toLowerCase()
    return KULINER_MODULE_SECTIONS.map(sec => ({
      ...sec,
      items: sec.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
      )
    })).filter(sec => sec.items.length > 0)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="admin-sheet-backdrop" onClick={onClose} />

      {/* Slide-Up Bottom Sheet */}
      <div className="admin-sheet-container" role="dialog" aria-modal="true">
        <div className="admin-sheet-drag-handle" />

        {/* Header */}
        <div className="admin-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 className="admin-sheet-title">All modules</h3>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#fdf8ec', color: '#b48c36', padding: '2px 8px', borderRadius: 9999 }}>
              Kuliner & Resto
            </span>
          </div>
          <button
            type="button"
            className="admin-sheet-close-btn"
            onClick={onClose}
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Search */}
        <div className="admin-sheet-search-wrap">
          <div className="admin-sheet-search-box">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              className="admin-sheet-search-input"
              placeholder="Cari menu, resep, transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} color="#94a3b8" />
              </button>
            )}
          </div>
        </div>

        {/* Modules List */}
        <div className="admin-sheet-body">
          {filteredSections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', fontSize: 13 }}>
              Tidak ada modul yang cocok dengan "<strong>{searchQuery}</strong>"
            </div>
          ) : (
            filteredSections.map(section => (
              <div key={section.group} className="admin-sheet-group">
                <div className="admin-sheet-group-label">{section.group}</div>
                {section.items.map(item => {
                  const isActive = pathname === item.path
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`admin-sheet-item ${isActive ? 'admin-sheet-item--active' : ''}`}
                    >
                      <div className="admin-sheet-item-left">
                        <span className="admin-sheet-item-icon">
                          {item.icon}
                        </span>
                        <span className="admin-sheet-item-label">
                          {item.label}
                        </span>
                      </div>
                      <span className="admin-sheet-item-code">
                        {item.code}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer / Quick AI Trigger */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#fafafa', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('bizora:open-kuliner-ai'));
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-amber-800 font-semibold text-xs active:bg-amber-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600" />
              <span>Buka Culinary AI Advisor</span>
            </div>
            <span className="text-[10px] bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-900 font-bold">PRO</span>
          </button>
        </div>
      </div>
    </>
  )
}
