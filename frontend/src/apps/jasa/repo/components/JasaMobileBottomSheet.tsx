import React, { useState, useMemo, useEffect } from 'react'
import {
  X, Search, Home, ShoppingBag, ClipboardList, FileText,
  Users, BookOpen, Package, TrendingUp, Wallet, Receipt,
  CreditCard, Building2, ShieldCheck, Wrench, Database,
  Plug, HelpCircle, Sparkles
} from '@/constants/icons'
import '../../../../apps/admin/components/AdminMobileNav.css'

export interface JasaModuleItem {
  id: string
  label: string
  icon: React.ReactNode
  code: string
}

export interface JasaModuleSection {
  group: string
  items: JasaModuleItem[]
}

export const JASA_MODULE_SECTIONS: JasaModuleSection[] = [
  {
    group: 'MENU UTAMA',
    items: [
      { id: 'overview', icon: <Home size={20} />, label: 'Dashboard', code: 'J01' },
      { id: 'pos', icon: <ShoppingBag size={20} />, label: 'Kasir (POS)', code: 'J02' },
    ]
  },
  {
    group: 'OPERASIONAL SERVIS',
    items: [
      { id: 'work-orders', icon: <ClipboardList size={20} />, label: 'Daftar SPK', code: 'O01' },
      { id: 'contracts', icon: <FileText size={20} />, label: 'Jadwal & Kontrak', code: 'O02' },
      { id: 'technicians', icon: <Users size={20} />, label: 'Tim & Teknisi', code: 'O03' },
      { id: 'catalog', icon: <BookOpen size={20} />, label: 'Katalog Layanan', code: 'O04' },
      { id: 'inventory', icon: <Package size={20} />, label: 'Stok & Material', code: 'O05' },
    ]
  },
  {
    group: 'KEUANGAN & LAPORAN',
    items: [
      { id: 'finance-summary', icon: <TrendingUp size={20} />, label: 'Laba Rugi', code: 'F01' },
      { id: 'finance-expenses', icon: <Wallet size={20} />, label: 'Buku Kas', code: 'F02' },
      { id: 'finance-invoices', icon: <Receipt size={20} />, label: 'Tagihan & Piutang', code: 'F03' },
      { id: 'finance-payables', icon: <CreditCard size={20} />, label: 'Hutang Vendor', code: 'F04' },
      { id: 'finance-accounts', icon: <Building2 size={20} />, label: 'Rekening & Bank', code: 'F05' },
      { id: 'analytics', icon: <ShieldCheck size={20} />, label: 'Laporan & SLA', code: 'F06' },
    ]
  },
  {
    group: 'PENGATURAN & SISTEM',
    items: [
      { id: 'settings', icon: <Wrench size={20} />, label: 'Pengaturan Jasa', code: 'S01' },
      { id: 'roles', icon: <ShieldCheck size={20} />, label: 'Role & Hak Akses', code: 'S02' },
      { id: 'staff', icon: <Users size={20} />, label: 'Staf & Operator', code: 'S03' },
      { id: 'backup', icon: <Database size={20} />, label: 'Backup Data', code: 'S04' },
      { id: 'developer-api', icon: <Plug size={20} />, label: 'Integrasi API', code: 'S05' },
      { id: 'profile', icon: <Users size={20} />, label: 'Profil Pengguna', code: 'S06' },
      { id: 'guide', icon: <BookOpen size={20} />, label: 'Buku Panduan', code: 'S07' },
      { id: 'subscription', icon: <CreditCard size={20} />, label: 'Paket Langganan', code: 'S08' },
    ]
  }
]

interface JasaMobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  activeTab: string
  onSelectTab: (tab: string) => void
}

export const JasaMobileBottomSheet: React.FC<JasaMobileBottomSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
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
    if (!searchQuery.trim()) return JASA_MODULE_SECTIONS
    const q = searchQuery.toLowerCase()
    return JASA_MODULE_SECTIONS.map(sec => ({
      ...sec,
      items: sec.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
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
            <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 9999 }}>
              Bengkel & Jasa
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
              placeholder="Cari fitur, SPK, keuangan..."
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
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id)
                        onClose()
                      }}
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
                    </button>
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
              window.dispatchEvent(new CustomEvent('bizora:open-jasa-ai'));
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/60 text-blue-800 font-semibold text-xs active:bg-blue-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              <span>Buka Jasa AI Diagnostic</span>
            </div>
            <span className="text-[10px] bg-blue-200/70 px-1.5 py-0.5 rounded text-blue-900 font-bold">PRO</span>
          </button>
        </div>
      </div>
    </>
  )
}
