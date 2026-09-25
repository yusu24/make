import React from 'react'
import { BudidayaTableSkeleton } from './BudidayaTableSkeleton'

/**
 * BudidayaPageSkeleton
 * Rendered during route transitions inside BudidayaLayout to prevent
 * white flash and maintain consistent layout.
 */
export function BudidayaPageSkeleton() {
  return (
    <div className="aq-container animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top action bar shimmer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          height: '38px',
          width: '280px',
          background: '#E2E8F0',
          borderRadius: '12px',
          animation: 'aq-pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          height: '38px',
          width: '140px',
          background: '#E2E8F0',
          borderRadius: '12px',
          animation: 'aq-pulse 1.5s ease-in-out infinite'
        }} />
      </div>

      {/* KPI Cards Shimmer */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ height: '12px', width: '80px', background: '#F1F5F9', borderRadius: '4px' }} />
              <div style={{ height: '32px', width: '32px', background: '#E8F5ED', borderRadius: '8px' }} />
            </div>
            <div style={{ height: '24px', width: '120px', background: '#E2E8F0', borderRadius: '6px' }} />
          </div>
        ))}
      </div>

      {/* Table Shimmer */}
      <BudidayaTableSkeleton standalone rows={6} cols={6} />

      <style>{`
        @keyframes aq-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}
