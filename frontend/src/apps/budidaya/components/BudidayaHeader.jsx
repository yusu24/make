import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import '../budidaya.css'

const NAV_ITEMS = [
  { label: 'Dashboard',           path: '/budidaya/dashboard' },
  { label: 'Manajemen Kolam',     path: '/budidaya/ponds'     },
  { label: 'Siklus Budidaya',     path: '/budidaya/cycles'    },
  { label: 'Pakan & Logistik',    path: '/budidaya/feeds'     },
  { label: 'Data Satuan',         path: '/budidaya/feed-units' },
  { label: 'Kategori Pakan',      path: '/budidaya/feed-categories' },
  { label: 'Gudang & Inventaris', path: '/budidaya/inventory' },
  { label: 'Laporan & Analisa',   path: '/budidaya/reports'   },
  { label: 'Manajemen Pengguna',  path: '/budidaya/users'     },
  { label: 'Peran & Izin',        path: '/budidaya/roles'     },
  { label: 'Paket Langganan',     path: '/budidaya/subscription' },
  { label: 'Pusat Bantuan',       path: '/budidaya/support'   },
  { label: 'Pengaturan Profil',   path: '/budidaya/settings'  },
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

  let pageTitle = 'Budidaya'
  const exactMatch = NAV_ITEMS.find(item => item.path === location.pathname)
  if (exactMatch) {
    pageTitle = exactMatch.label
  } else if (location.pathname.startsWith('/budidaya/ponds/')) {
    pageTitle = 'Detail Kolam'
  } else if (location.pathname.startsWith('/budidaya/cycles/')) {
    pageTitle = 'Detail Siklus'
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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = async () => {
    try {
      await api.post('/alerts/mark-all-read')
      setUnreadCount(0)
      setAlerts(alerts.map(a => ({ ...a, is_read: true })))
    } catch (err) {
      console.error('Failed to mark alerts as read:', err)
    }
  }

  const handleLogout = async () => {
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate()
      navigate(redirectPath || '/tenants')
    } else {
      try { await logout() } catch {}
      const isDemo = user?.email?.includes('demo-sandbox-')
      navigate(isDemo ? '/' : '/login')
    }
  }

  const logoutLabel = isImpersonating && isImpersonating()
    ? 'Keluar dari Impersonate'
    : user?.email?.includes('demo-sandbox-')
      ? 'Keluar dari Akun Demo'
      : 'Keluar'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        height: 64,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E9F0EC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        gap: 16,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: hamburger + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuToggle}
          style={{
            padding: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#1B4332',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="lg-hidden"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24, fontWeight: 700 }}>menu</span>
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1B4332', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right: search + notif + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Search Box — Hidden on small mobile */}
        <div className="hide-mobile" style={{ position: 'relative' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 18,
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Cari kolam atau data..."
            style={{
              paddingLeft: 38,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              background: '#F4F7F5',
              border: '1.5px solid #E9F0EC',
              borderRadius: 10,
              fontSize: 13,
              color: '#1A1C1A',
              outline: 'none',
              width: 180,
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.15s, box-shadow 0.15s, width 0.2s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#2D6A4F'
              e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)'
              e.target.style.width = '240px'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#E9F0EC'
              e.target.style.boxShadow = 'none'
              e.target.style.width = '180px'
            }}
          />
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: 10,
              background: showDropdown ? '#E9F0EC' : '#F4F7F5',
              border: '1.5px solid #E9F0EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 8,
                right: 8,
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
              top: 'calc(100% + 12px)',
              right: 0,
              width: 320,
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #E9F0EC',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'slideIn 0.2s ease-out'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1A1C1A' }}>Notifikasi</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#059669', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94A3B8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>notifications_off</span>
                    <p style={{ margin: 0, fontSize: 13 }}>Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #F8FAFC',
                      background: alert.is_read ? 'transparent' : '#F0F9F4',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ 
                          width: 8, height: 8, borderRadius: '50%', 
                          background: alert.status === 'critical' ? '#EF4444' : '#F59E0B', 
                          marginTop: 5, flexShrink: 0,
                          opacity: alert.is_read ? 0.3 : 1
                        }} />
                        <div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: alert.is_read ? 500 : 700, color: '#1A1C1A', lineHeight: '1.4' }}>
                            {alert.pond?.name || 'Kolam'}: {alert.parameter} {alert.status === 'critical' ? 'Kritis' : 'Peringatan'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748B' }}>
                            Nilai: {alert.value} • {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #F1F5F9', background: '#F8FAF9' }}>
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
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#1B4332',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              border: '1.5px solid #D8F3DC',
              letterSpacing: '0.02em',
            }}
          >
            {initials}
          </div>

          {showProfile && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 220,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #E9F0EC',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1A1C1A' }}>{user?.name || 'User'}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94A3B8' }}>{user?.email || ''}</p>
              </div>
              {/* Settings */}
              <button
                onClick={() => { setShowProfile(false); navigate('/budidaya/settings') }}
                style={{
                  width: '100%', padding: '11px 16px', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#374151',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAF9'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>manage_accounts</span>
                Setting Profil
              </button>
              <div style={{ height: 1, background: '#F1F5F9' }} />
              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '11px 16px', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#EF4444',
                  display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
                {logoutLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
