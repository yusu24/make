import React, { useState, useMemo, useEffect } from 'react'
import {
  NavLink,
  useLocation } from 'react-router-dom'
import {
  X,
  Search,
  Home,
  Layers,
  RefreshCw,
  Package,
  TrendingUp,
  Wallet,
  BarChart2,
  Tag,
  Users,
  ShieldCheck,
  Settings,
  Database,
  Plug,
  BookOpen,
  CreditCard,
  HelpCircle,
  Sparkles
} from '@/constants/icons'
import '../../../apps/admin/components/AdminMobileNav.css'

export const BUDIDAYA_MODULE_SECTIONS = [
  {
    group: 'MENU UTAMA',
    items: [
      { path: '/budidaya/dashboard', icon: <Home size={20} />, label: 'Dashboard Budidaya', code: 'B01' },
      { path: '/budidaya/ponds', icon: <Layers size={20} />, label: 'Manajemen Kolam / Lahan', code: 'B02' },
      { path: '/budidaya/cycles', icon: <RefreshCw size={20} />, label: 'Siklus Budidaya', code: 'B03' },
    ]
  },
  {
    group: 'OPERASIONAL & PAKAN',
    items: [
      { path: '/budidaya/inventory', icon: <Package size={20} />, label: 'Gudang & Pakan', code: 'O01' },
      { path: '/budidaya/master-data?tab=feeds', icon: <Package size={20} />, label: 'Kategori Pakan', code: 'O02' },
      { path: '/budidaya/master-data?tab=units', icon: <Tag size={20} />, label: 'Satuan Dasar', code: 'O03' },
    ]
  },
  {
    group: 'KEUANGAN & LAPORAN',
    items: [
      { path: '/budidaya/finance-summary', icon: <TrendingUp size={20} />, label: 'Laba Rugi', code: 'F01' },
      { path: '/budidaya/expenses', icon: <Wallet size={20} />, label: 'Buku Kas & Transaksi', code: 'F02' },
      { path: '/budidaya/reports', icon: <BarChart2 size={20} />, label: 'Laporan & Analisa Panen', code: 'F03' },
      { path: '/budidaya/master-data?tab=finance', icon: <Tag size={20} />, label: 'Kategori Keuangan', code: 'F04' },
    ]
  },
  {
    group: 'KARYAWAN & SISTEM',
    items: [
      { path: '/budidaya/users', icon: <Users size={20} />, label: 'Manajemen Pengguna', code: 'S01' },
      { path: '/budidaya/roles', icon: <ShieldCheck size={20} />, label: 'Peran & Izin Akses', code: 'S02' },
      { path: '/budidaya/settings', icon: <Settings size={20} />, label: 'Pengaturan Profil', code: 'S03' },
      { path: '/budidaya/backup', icon: <Database size={20} />, label: 'Backup Data', code: 'S04' },
      { path: '/budidaya/developer-api', icon: <Plug size={20} />, label: 'Integrasi API & Webhook', code: 'S05' },
      { path: '/budidaya/guide', icon: <BookOpen size={20} />, label: 'Buku Panduan & SOP', code: 'S06' },
      { path: '/budidaya/subscription', icon: <CreditCard size={20} />, label: 'Paket Langganan', code: 'S07' },
    ]
  }
]

export default function BudidayaMobileBottomSheet({ isOpen, onClose }) {
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
    if (!searchQuery.trim()) return BUDIDAYA_MODULE_SECTIONS
    const q = searchQuery.toLowerCase()
    return BUDIDAYA_MODULE_SECTIONS.map(sec => ({
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
            <span style={{ fontSize: 11, fontWeight: 700, background: '#e8f5ed', color: '#1b4332', padding: '2px 8px', borderRadius: 9999 }}>
              Budidaya Ternak / Tani
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
              placeholder="Cari kolam, siklus, pakan..."
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
              window.dispatchEvent(new CustomEvent('bizora:open-budidaya-ai'));
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/60 text-cyan-800 font-semibold text-xs active:bg-cyan-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-600" />
              <span>Buka Budidaya AI Advisor</span>
            </div>
            <span className="text-[10px] bg-cyan-200/70 px-1.5 py-0.5 rounded text-cyan-900 font-bold">PRO</span>
          </button>
        </div>
      </div>
    </>
  )
}
