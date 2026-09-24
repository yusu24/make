import React, { useState, useMemo, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  X, Search, Home, BarChart2, TrendingUp, Store, ClipboardList,
  Shield, Users, Layers, Package, CreditCard, Wallet, FileText, BellRing,
  HelpCircle, BookOpen, Globe, Sparkles, Sliders, UserCheck, ServerCog,
  Zap, Archive, User, LayoutDashboard, Type
} from '@/constants/icons'
import './AdminMobileNav.css'

export const ADMIN_MODULE_SECTIONS = [
  {
    group: 'DASHBOARD',
    items: [
      { path: '/dashboard', icon: <Home size={20} />, label: 'Home', code: 'H00' },
    ]
  },
  {
    group: 'LAPORAN & ANALITIK',
    items: [
      { path: '/reports-analytics', icon: <BarChart2 size={20} />, label: 'Laporan Overview', code: 'L01' },
      { path: '/reports-revenue', icon: <TrendingUp size={20} />, label: 'Laporan Pendapatan', code: 'L02' },
      { path: '/reports-tenants', icon: <Store size={20} />, label: 'Analitik Tenant', code: 'L03' },
      { path: '/logs', icon: <ClipboardList size={20} />, label: 'Log Aktivitas & Audit', code: 'L04' },
    ]
  },
  {
    group: 'MANAJEMEN TENANT',
    items: [
      { path: '/tenants', icon: <Store size={20} />, label: 'Daftar Tenant', code: 'T01' },
      { path: '/kyc', icon: <Shield size={20} />, label: 'Verifikasi KYC Tenant', code: 'T02' },
      { path: '/users', icon: <Users size={20} />, label: 'Pengguna Platform', code: 'T03' },
      { path: '/categories', icon: <Layers size={20} />, label: 'Kategori Bisnis', code: 'T04' },
    ]
  },
  {
    group: 'PAKET & LANGGANAN',
    items: [
      { path: '/packages-features', icon: <Package size={20} />, label: 'Paket & Fitur', code: 'P01' },
      { path: '/subscriptions', icon: <CreditCard size={20} />, label: 'Manajemen Langganan', code: 'P02' },
      { path: '/finance', icon: <Wallet size={20} />, label: 'Finansial & Faktur', code: 'P03' },
      { path: '/invoice-settings', icon: <FileText size={20} />, label: 'Pengaturan Invoice', code: 'P04' },
      { path: '/subscription-reminders', icon: <BellRing size={20} />, label: 'Pengingat & Otomasi', code: 'P05' },
    ]
  },
  {
    group: 'LAYANAN & PENGUMUMAN',
    items: [
      { path: '/content-announcement', icon: <FileText size={20} />, label: 'Pengumuman & Konten', code: 'A01' },
      { path: '/support-center', icon: <HelpCircle size={20} />, label: 'Pusat Bantuan (Tiket)', code: 'A02' },
    ]
  },
  {
    group: 'KONTEN & DOKUMENTASI',
    items: [
      { path: '/settings', icon: <Globe size={20} />, label: 'Pengaturan Landing Page', code: 'K01' },
      { path: '/doc-center', icon: <BookOpen size={20} />, label: 'Pusat Dokumentasi', code: 'K02' },
      { path: '/doc-dashboard', icon: <BookOpen size={20} />, label: 'Kelola Dokumentasi', code: 'K03' },
      { path: '/module-docs', icon: <Layers size={20} />, label: 'Arsitektur Modul', code: 'K04' },
      { path: '/admin/icon-dictionary', icon: <Sparkles size={20} />, label: 'Kamus Icon UI', code: 'K05' },
      { path: '/admin/card-dictionary', icon: <LayoutDashboard size={20} />, label: 'Kamus Card UI', code: 'K06' },
      { path: '/admin/font-dictionary', icon: <Type size={20} />, label: 'Kamus Font & Tipografi', code: 'K07' },
    ]
  },
  {
    group: 'PENGATURAN & KEAMANAN',
    items: [
      { path: '/admins', icon: <UserCheck size={20} />, label: 'Kelola Admin', code: 'S01' },
      { path: '/saas-roles', icon: <Shield size={20} />, label: 'Role & Hak Akses', code: 'S02' },
      { path: '/system-monitoring', icon: <ServerCog size={20} />, label: 'Monitoring Sistem', code: 'S03' },
      { path: '/developer-integrations', icon: <Zap size={20} />, label: 'Integrasi & Webhook', code: 'S04' },
      { path: '/backups', icon: <Archive size={20} />, label: 'Cadangan Data (Backup)', code: 'S05' },
      { path: '/profile', icon: <User size={20} />, label: 'Profil Saya', code: 'S06' },
    ]
  }
]

export default function AdminMobileBottomSheet({ isOpen, onClose }) {
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
    if (!searchQuery.trim()) return ADMIN_MODULE_SECTIONS
    const q = searchQuery.toLowerCase()
    return ADMIN_MODULE_SECTIONS.map(sec => ({
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
            <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 9999 }}>
              Admin SaaS
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
              placeholder="Cari modul atau menu..."
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
                  const isActive = pathname === item.path || pathname === `/admin${item.path}`
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
      </div>
    </>
  )
}
