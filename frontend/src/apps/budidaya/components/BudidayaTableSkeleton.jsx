import React from 'react'

/**
 * BudidayaTableSkeleton
 * Non-blocking, beautiful shimmer rows designed specifically for Budidaya Hewan & Tanaman module.
 * Can be rendered directly inside a <tbody> without breaking HTML table structure,
 * or as a standalone card shimmer when standalone={true}.
 */
export function BudidayaTableSkeleton({
  rows = 5,
  cols = 5,
  standalone = false,
  message = null,
}) {
  if (standalone) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Header Shimmer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid #F1F5F9',
          marginBottom: '16px'
        }}>
          <div style={{
            height: '20px',
            width: '180px',
            background: '#E2E8F0',
            borderRadius: '6px',
            animation: 'aq-pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            height: '32px',
            width: '100px',
            background: '#F1F5F9',
            borderRadius: '10px',
            animation: 'aq-pulse 1.5s ease-in-out infinite'
          }} />
        </div>

        {/* Rows Shimmer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(rows)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '42px',
                background: '#F8FAFC',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: '16px',
                animation: 'aq-pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`
              }}
            >
              {[...Array(cols)].map((_, j) => (
                <div
                  key={j}
                  style={{
                    height: '14px',
                    borderRadius: '4px',
                    background: '#E2E8F0',
                    width: `${Math.max(25, 80 - j * 12)}%`,
                    opacity: 0.9 - j * 0.08
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {message && (
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#94A3B8',
            marginTop: '16px',
            marginBottom: 0
          }}>
            {message}
          </p>
        )}

        <style>{`
          @keyframes aq-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.45; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {[...Array(rows)].map((_, rIdx) => (
        <tr
          key={rIdx}
          style={{
            borderBottom: '1px solid #F1F5F9',
            animation: 'aq-pulse 1.5s ease-in-out infinite',
            animationDelay: `${rIdx * 0.08}s`
          }}
        >
          {[...Array(cols)].map((_, cIdx) => (
            <td
              key={cIdx}
              style={{
                padding: '14px 16px',
                verticalAlign: 'middle'
              }}
            >
              <div
                style={{
                  height: '14px',
                  background: '#E2E8F0',
                  borderRadius: '6px',
                  width: cIdx === 0 ? '60%' : cIdx === cols - 1 ? '45%' : '75%',
                  marginLeft: cIdx === cols - 1 ? 'auto' : 0
                }}
              />
            </td>
          ))}
        </tr>
      ))}
      <style>{`
        @keyframes aq-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </>
  )
}
