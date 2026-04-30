import React from 'react'

/**
 * 1. LOADING BUTTON
 * Replaces standard buttons with loading state feedback.
 * Uses existing AquaGrow design system.
 */
export function LoadingButton({ 
  loading, 
  children, 
  disabled, 
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  style,
  ...props 
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    opacity: loading || disabled ? 0.7 : 1,
  }

  const variants = {
    primary: {
      background: '#1B4332',
      color: '#FFFFFF',
    },
    secondary: {
      background: '#F4F7F5',
      color: '#1B4332',
      border: '1.5px solid #E9F0EC',
    },
    outline: {
      background: '#FFFFFF',
      color: '#1B4332',
      border: '1.5px solid #1B4332',
    }
  }

  const currentVariant = variants[variant] || variants.primary

  return (
    <button
      disabled={loading || disabled}
      style={{ ...baseStyle, ...currentVariant, ...style }}
      {...props}
    >
      {loading && (
        <div className="aq-spinner" style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: variant === 'primary' ? '#FFFFFF' : '#1B4332',
          borderRadius: '50%',
          animation: 'aq-spin 0.8s linear infinite'
        }} />
      )}
      <span style={{ visibility: loading ? 'visible' : 'visible' }}>
        {children}
      </span>

      <style>{`
        @keyframes aq-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}

/**
 * 2. EMPTY STATE
 * Minimalist empty state for tables and lists.
 */
export function EmptyState({ 
  icon = 'database', 
  title = 'Belum ada data', 
  description = 'Data akan muncul di sini setelah Anda menambahkannya.',
  onAction,
  actionLabel = 'Tambah Data'
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      background: '#FFFFFF',
      borderRadius: '24px',
      border: '1px solid #E9F0EC',
      margin: '20px 0'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '20px',
        background: '#F4F7F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <span className="material-symbols-outlined" style={{ 
          fontSize: '32px', 
          color: '#94A3B8' 
        }}>
          {icon}
        </span>
      </div>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#1A1C1A',
        margin: '0 0 8px 0'
      }}>{title}</h3>
      <p style={{ 
        fontSize: '14px', 
        color: '#64748B', 
        margin: '0 0 24px 0',
        maxWidth: '300px',
        lineHeight: '1.5'
      }}>{description}</p>
      
      {onAction && (
        <LoadingButton onClick={onAction}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          {actionLabel}
        </LoadingButton>
      )}
    </div>
  )
}

/**
 * 3. BREADCRUMBS
 * Dynamic navigation helper.
 */
import { Link } from 'react-router-dom'

export function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      marginBottom: '16px' 
    }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <React.Fragment key={index}>
            {item.path && !isLast ? (
              <Link 
                to={item.path} 
                style={{ 
                  textDecoration: 'none', 
                  fontSize: '13px', 
                  color: '#94A3B8',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#1B4332'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ 
                fontSize: '13px', 
                color: isLast ? '#1B4332' : '#94A3B8',
                fontWeight: isLast ? '700' : '500'
              }}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="material-symbols-outlined" style={{ 
                fontSize: '16px', 
                color: '#CBD5E1' 
              }}>
                chevron_right
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
