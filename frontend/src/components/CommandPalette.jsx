import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Search,
  Store,
  Users,
  CreditCard,
  Radio,
  FileText,
  Shield,
  Settings,
  Database,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
  KeyRound,
  Eye,
  AlertTriangle,
  Zap,
  Activity,
  Package,
  Layers,
  HelpCircle,
  X
} from '@/constants/icons'

const STATIC_COMMANDS = [
  // Navigations
  { id: 'nav-dash', category: 'Navigasi Menu', title: 'Dashboard Executive SaaS', subtitle: 'MRR, ARR, Churn, Tenant Health', icon: Activity, path: '/dashboard', color: '#4f46e5' },
  { id: 'nav-tenants', category: 'Navigasi Menu', title: 'Manajemen Tenant', subtitle: 'Daftar semua merchant & toko', icon: Store, path: '/tenants', color: '#0284c7' },
  { id: 'nav-subs', category: 'Navigasi Menu', title: 'Langganan & Billing', subtitle: 'Siklus langganan, invoice & paket', icon: CreditCard, path: '/subscriptions', color: '#10b981' },
  { id: 'nav-broadcast', category: 'Navigasi Menu', title: 'Broadcast & Push Notification', subtitle: 'Siaran pengumuman ke dashboard merchant', icon: Radio, path: '/content-announcement', color: '#f59e0b' },
  { id: 'nav-kyc', category: 'Navigasi Menu', title: 'Verifikasi KYC Merchant', subtitle: 'Validasi dokumen & identitas bisnis', icon: Shield, path: '/kyc', color: '#8b5cf6' },
  { id: 'nav-finance', category: 'Navigasi Menu', title: 'Laporan Keuangan SaaS', subtitle: 'Cash flow, laba rugi & transaksi', icon: FileText, path: '/finance', color: '#10b981' },
  { id: 'nav-packages', category: 'Navigasi Menu', title: 'Paket & Fitur Modul', subtitle: 'Konfigurasi paket Free, Pro, Enterprise', icon: Package, path: '/packages-features', color: '#6366f1' },
  { id: 'nav-backup', category: 'Navigasi Menu', title: 'Database Backup & Restore', subtitle: 'Pencadangan database otomatis & manual', icon: Database, path: '/backups', color: '#64748b' },
  { id: 'nav-dev', category: 'Navigasi Menu', title: 'Developer & Webhook API', subtitle: 'API keys, webhook events, logging', icon: Zap, path: '/developer-integrations', color: '#06b6d4' },
  { id: 'nav-settings', category: 'Navigasi Menu', title: 'Pengaturan Landing & Hero', subtitle: 'Konfigurasi landing page publik', icon: Settings, path: '/landing-settings', color: '#64748b' },

  // Quick Action Shortcuts
  { id: 'act-add-tenant', category: 'Aksi Cepat', title: 'Tambah Tenant Baru', subtitle: 'Daftarkan bisnis baru ke sistem', icon: Plus, path: '/tenants', color: '#4f46e5' },
  { id: 'act-new-broadcast', category: 'Aksi Cepat', title: 'Kirim Siaran Broadcast Baru', subtitle: 'Buat notifikasi modal / banner untuk merchant', icon: Radio, path: '/content-announcement', color: '#f59e0b' },
  { id: 'act-filter-risk', category: 'Aksi Cepat', title: 'Filter Tenant Berisiko Churn', subtitle: 'Lihat tenant dengan health score < 40', icon: AlertTriangle, path: '/tenants?health_status=at_risk', color: '#ef4444' },
  { id: 'act-filter-warning', category: 'Aksi Cepat', title: 'Filter Tenant Butuh Perhatian', subtitle: 'Lihat tenant dengan health score 40-69', icon: Activity, path: '/tenants?health_status=warning', color: '#f59e0b' },
]

export default function CommandPalette({ isOpen, onClose, onSelectTenant }) {
  const navigate = useNavigate()
  const { impersonate } = useAuth()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tenantResults, setTenantResults] = useState([])
  const [searchingTenants, setSearchingTenants] = useState(false)
  const inputRef = useRef(null)

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Search live tenants when query length >= 2
  useEffect(() => {
    if (!isOpen || !query.trim() || query.trim().length < 2) {
      setTenantResults([])
      setSearchingTenants(false)
      return
    }

    let isMounted = true
    setSearchingTenants(true)

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/admin/tenants')
        if (!isMounted) return
        const all = res.data?.data || []
        const q = query.toLowerCase()
        const matches = all.filter(t => 
          (t.name || '').toLowerCase().includes(q) ||
          (t.tenant_id || '').toLowerCase().includes(q) ||
          (t.email || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q)
        ).slice(0, 5)
        setTenantResults(matches)
      } catch (err) {
        console.error('Tenant search error:', err)
      } finally {
        if (isMounted) setSearchingTenants(false)
      }
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [query, isOpen])

  // Filter static items
  const filteredCommands = STATIC_COMMANDS.filter(cmd => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return cmd.title.toLowerCase().includes(q) || 
           cmd.subtitle.toLowerCase().includes(q) ||
           cmd.category.toLowerCase().includes(q)
  })

  // Group all visible items for keyboard navigation
  const allItems = [
    ...tenantResults.map(t => ({ type: 'tenant', data: t })),
    ...filteredCommands.map(c => ({ type: 'command', data: c })),
  ]

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (allItems.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (allItems[selectedIndex]) {
          handleExecute(allItems[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, allItems])

  const handleExecute = (item) => {
    if (!item) return
    onClose()

    if (item.type === 'tenant') {
      const t = item.data
      if (onSelectTenant) {
        onSelectTenant(t)
      } else {
        navigate(`/tenants?search=${t.tenant_id}`)
      }
    } else if (item.type === 'command') {
      const cmd = item.data
      if (cmd.path) {
        navigate(cmd.path)
      }
    }
  }

  const handleImpersonateTenant = async (e, tenant) => {
    e.stopPropagation()
    onClose()
    try {
      const redirect = await impersonate(tenant.tenant_id)
      navigate(redirect || '/retail/dashboard')
    } catch (err) {
      alert('Gagal login sebagai tenant: ' + (err.response?.data?.message || err.message))
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'scaleUp 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Cari tenant, halaman SaaS, fitur, aksi cepat... (Ketik atau pilih)"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 15,
              fontWeight: 500,
              color: '#1e293b',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            background: '#e2e8f0',
            color: '#64748b',
            padding: '2px 8px',
            borderRadius: 6,
            fontFamily: 'monospace'
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {/* Tenant Live Results */}
          {tenantResults.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ padding: '6px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                🏢 Hasil Pencarian Tenant
              </div>
              {tenantResults.map((t, idx) => {
                const isSelected = selectedIndex === idx
                return (
                  <div
                    key={t.tenant_id}
                    onClick={() => handleExecute({ type: 'tenant', data: t })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: isSelected ? '#f1f5f9' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: '#e0e7ff', color: '#4338ca',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12
                      }}>
                        {t.name ? t.name.slice(0, 2).toUpperCase() : 'TN'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>
                          <code>{t.tenant_id}</code> • {t.category || 'Retail'} • <span className="font-semibold">{t.subscription_plan || t.plan || 'Free'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={(e) => handleImpersonateTenant(e, t)}
                        style={{
                          background: '#eef2ff',
                          color: '#4f46e5',
                          border: '1px solid #c7d2fe',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                        title={`Login sebagai ${t.name}`}
                      >
                        <KeyRound size={11} /> Login
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Static Commands */}
          {filteredCommands.length > 0 && (
            <div>
              {['Navigasi Menu', 'Aksi Cepat'].map(cat => {
                const itemsInCat = filteredCommands.filter(c => c.category === cat)
                if (itemsInCat.length === 0) return null

                return (
                  <div key={cat} style={{ marginBottom: 6 }}>
                    <div style={{ padding: '6px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                      {cat === 'Navigasi Menu' ? '🧭 ' : '⚡ '}{cat}
                    </div>
                    {itemsInCat.map(cmd => {
                      const itemIdx = allItems.findIndex(i => i.type === 'command' && i.data.id === cmd.id)
                      const isSelected = selectedIndex === itemIdx
                      const IconComponent = cmd.icon

                      return (
                        <div
                          key={cmd.id}
                          onClick={() => handleExecute({ type: 'command', data: cmd })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 20px',
                            cursor: 'pointer',
                            background: isSelected ? '#f1f5f9' : 'transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: cmd.color + '15',
                              color: cmd.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <IconComponent size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                                {cmd.title}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                {cmd.subtitle}
                              </div>
                            </div>
                          </div>

                          <ArrowRight size={14} className={isSelected ? 'text-indigo-600' : 'text-slate-300'} />
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Tidak ada perintah atau tenant yang sesuai dengan kata kunci "<strong>{query}</strong>".
            </div>
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: 11.5,
          color: '#64748b',
        }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>↑</kbd> <kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>↓</kbd> Navigasi</span>
            <span><kbd style={{ background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>↵</kbd> Buka</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={12} className="text-indigo-600" />
            <span>Bizora Command Hub</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}