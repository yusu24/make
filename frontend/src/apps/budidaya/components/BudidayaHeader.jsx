import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import { CreditCard, LogOut } from 'lucide-react'
import '../budidaya.css'

import { useBudidayaTerms } from '../hooks/useBudidayaTerms'

const getNavItems = (terms) => [
  { label: 'Dashboard',           path: '/budidaya/dashboard' },
  { label: `Manajemen ${terms.unit}`, path: '/budidaya/ponds' },
  { label: 'Siklus Budidaya',     path: '/budidaya/cycles'    },
  { label: 'Gudang & Inventaris', path: '/budidaya/inventory' },
  { label: 'Laba Rugi',           path: '/budidaya/finance-summary' },
  { label: 'Buku Kas & Transaksi', path: '/budidaya/expenses' },
  { label: 'Laporan & Analisa',   path: '/budidaya/reports'   },
  { label: 'Manajemen Pengguna',  path: '/budidaya/users'     },
  { label: 'Peran & Izin',        path: '/budidaya/roles'     },
  { label: 'Paket Langganan',     path: '/budidaya/subscription' },
  { label: 'Pusat Bantuan',       path: '/budidaya/support'   },
  { label: 'Master Data & Satuan', path: '/budidaya/master-data' },
  { label: 'Pengaturan Profil',   path: '/budidaya/settings'  },
  { label: 'Backup Data',         path: '/budidaya/backup'    },
  { label: 'Pakan & Logistik',    path: '/budidaya/feeds'     },
  { label: 'Data Satuan',         path: '/budidaya/feed-units' },
  { label: 'Kategori Pakan',      path: '/budidaya/feed-categories' },
]

export default function BudidayaHeader({ onMenuToggle }) {
  const { user, isImpersonating, exitImpersonate, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const dropdownRef = useRef(null)
  const profileRef = useRef(null)

  const terms = useBudidayaTerms()
  const NAV_ITEMS = getNavItems(terms)
  
  let pageTitle = terms.brandName || 'Dashboard'
  const tabParam = new URLSearchParams(location.search).get('tab')
  if (location.pathname === '/budidaya/master-data') {
    if (tabParam === 'units') pageTitle = 'Satuan Dasar'
    else if (tabParam === 'feeds') pageTitle = 'Kategori Pakan'
    else pageTitle = 'Kategori Keuangan'
  } else {
    const exactMatch = NAV_ITEMS.find(item => item.path === location.pathname)
    if (exactMatch) {
      pageTitle = exactMatch.label
    } else if (location.pathname.startsWith('/budidaya/ponds/')) {
      pageTitle = `Detail ${terms.unit}`
    } else if (location.pathname.startsWith('/budidaya/cycles/')) {
      pageTitle = 'Detail Siklus'
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'WI'

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts')
      if (res.data.success) {
        setAlerts(res.data.data)
        setUnreadCount(res.data.unread_count)
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!showDropdown) return
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    if (!showProfile) return
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfile])

  const markAllAsRead = async () => {
    try {
      await api.post('/alerts/mark-all-read')
      setUnreadCount(0)
      setAlerts(alerts.map(a => ({ ...a, is_read: true })))
    } catch (err) {
      console.error('Failed to mark alerts as read:', err)
    }
  }

  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'));

  const handleLogout = async () => {
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate()
      window.location.href = redirectPath || '/tenants'
    } else {
      try { logout() } catch {}
      window.location.href = isDemo ? '/' : '/login'
    }
  }

  const logoutLabel = isImpersonating && isImpersonating()
    ? 'Keluar dari Impersonate'
    : isDemo
      ? 'Keluar dari Akun Demo'
      : 'Keluar'

  return (
    <header className="aq-header-container">
      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <button
          onClick={onMenuToggle}
          style={{
            padding: '5px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#1B4332',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          className="lg-hidden"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22, fontWeight: 700 }}>menu</span>
        </button>
        <h1 className="aq-header-title">
          {pageTitle}
        </h1>
      </div>

      {/* Right: notif + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="aq-header-btn-bell"
            style={{
              background: showDropdown ? '#E9F0EC' : '#F4F7F5',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                background: '#EF4444',
                borderRadius: '50%',
                border: '1.5px solid white',
              }} />
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 300,
              maxWidth: '90vw',
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #E9F0EC',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'slideIn 0.2s ease-out'
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: '#1A1C1A' }}>Notifikasi</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#059669', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: '#94A3B8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, marginBottom: 6, opacity: 0.5 }}>notifications_off</span>
                    <p style={{ margin: 0, fontSize: 12.5 }}>Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #F8FAFC',
                      background: alert.is_read ? 'transparent' : '#F0F9F4',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ 
                          width: 8, height: 8, borderRadius: '50%', 
                          background: alert.status === 'critical' ? '#EF4444' : '#F59E0B', 
                          marginTop: 5, flexShrink: 0,
                          opacity: alert.is_read ? 0.3 : 1
                        }} />
                        <div>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: alert.is_read ? 500 : 700, color: '#1A1C1A', lineHeight: '1.4' }}>
                            {alert.pond?.name || terms.unit}: {alert.parameter} {alert.status === 'critical' ? 'Kritis' : 'Peringatan'}
                          </p>
                          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748B' }}>
                            Nilai: {alert.value} • {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #F1F5F9', background: '#F8FAF9' }}>
                <button style={{ background: 'none', border: 'none', color: '#1B4332', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Lihat Semua Riwayat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            onClick={() => setShowProfile(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 6px',
              borderRadius: 10,
              background: showProfile ? '#E8F5ED' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            title="Menu Akun"
          >
            <div className="aq-header-avatar">
              {(user?.tenant_name || user?.business_name || user?.name || 'BD')
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'BD'}
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 8,
                  height: 8,
                  background: '#22c55e',
                  borderRadius: '50%',
                  border: '1.5px solid #ffffff',
                }}
              />
            </div>
            <div className="aq-header-user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1C1A', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.tenant_name || user?.business_name || user?.name || terms?.brandName || 'Budidaya'}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 9999,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: user?.subscription_plan === 'pro'
                      ? 'linear-gradient(135deg, #8b5cf6, #d946ef)'
                      : user?.subscription_plan === 'basic'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : '#475569',
                    color: '#ffffff',
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {user?.subscription_plan === 'pro' ? 'PRO' : user?.subscription_plan === 'basic' ? 'BASIC' : 'FREE'}
                </span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#64748B', marginTop: 1 }}>
                {user?.business_category || 'Budidaya'}
              </span>
            </div>
          </div>

          {showProfile && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: 290,
                background: '#fff',
                borderRadius: 20,
                padding: '16px 18px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
                border: '1px solid #E9F0EC',
                zIndex: 100,
                fontSize: 12.5,
              }}
            >
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(27, 67, 50, 0.3)',
                  }}
                >
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'Pengguna'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || 'user@bizora.id'}
                  </div>
                </div>
              </div>

              {/* Info Details */}
              <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>Toko / Tambak:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right', fontSize: 12.5 }}>
                    {user?.tenant_name || user?.business_name || terms?.brandName || '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>Status Paket:</span>
                  <span style={{ fontWeight: 700, color: '#059669', textTransform: 'capitalize', fontSize: 12.5 }}>
                    {user?.subscription_plan || 'Free'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>Kategori Bisnis:</span>
                  <span style={{ fontWeight: 700, color: '#059669', fontSize: 12.5 }}>
                    {user?.business_category || 'Budidaya'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6, borderTop: '1px solid #F1F5F9' }}>
                <button
                  onClick={() => {
                    setShowProfile(false)
                    navigate('/budidaya/subscription')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #1B4332, #2D6A4F)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 2px 8px rgba(27, 67, 50, 0.25)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <CreditCard size={15} />
                  <span>Upgrade & Paket Langganan</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfile(false)
                    navigate('/budidaya/settings')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#F0FDF4',
                    color: '#1B4332',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: '1px solid #DCFCE7',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#DCFCE7'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F0FDF4'}
                >
                  <span>Pengaturan Akun</span>
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#fef2f2',
                    color: '#e11d48',
                    fontWeight: 700,
                    fontSize: 12.5,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                >
                  <LogOut size={15} />
                  <span>{logoutLabel}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
