import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import '../budidaya.css'

export default function BudidayaHeader({ onMenuToggle }) {
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'WI'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
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
            display: 'none', // hidden on desktop, shown via media query not available inline
            padding: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748B',
            borderRadius: 8,
          }}
          className="lg:hidden"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1C1A' }}>
          Dashboard Utama
        </span>
      </div>

      {/* Right: search + notif + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Search Box */}
        <div style={{ position: 'relative' }}>
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
              width: 240,
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#2D6A4F'
              e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#E9F0EC'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            borderRadius: 10,
            background: '#F4F7F5',
            border: '1.5px solid #E9F0EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E9F0EC'}
          onMouseLeave={e => e.currentTarget.style.background = '#F4F7F5'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
          {/* Red dot */}
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
        </button>

        {/* Avatar */}
        <div
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
      </div>
    </header>
  )
}
