import React from 'react'
import '../budidaya.css'

export default function Reports() {
  const cardStyle = {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #E9F0EC'
  }

  const badge = (bg, color) => ({
    padding: '4px 12px',
    borderRadius: '40px',
    fontSize: '11px',
    fontWeight: '800',
    background: bg,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  })

  return (
    <div style={{ padding: '32px', background: '#F4F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '850', color: '#1B4332', margin: 0, letterSpacing: '-0.03em' }}>Laporan & Analisa</h1>
          <p style={{ fontSize: '15px', color: '#64748B', marginTop: '8px', maxWidth: '500px', lineHeight: '1.5' }}>
            Visualisasi mendalam untuk performa kolam dan tren kualitas air untuk mendukung keputusan operasional harian.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
            borderRadius: '12px', border: '1.5px solid #1B4332', background: '#fff', 
            color: '#1B4332', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
            Ekspor PDF
          </button>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', 
            borderRadius: '12px', border: 'none', background: '#1B4332', 
            color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' 
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
            30 Hari Terakhir
          </button>
        </div>
      </div>

      {/* ── Top Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
        
        {/* Tren Kualitas Air */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Tren Kualitas Air</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' }}>PARAMETER: OKSIGEN TERLARUT (DO)</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={badge('#D1FAE5', '#059669')}>● Kolam A</span>
              <span style={badge('#F1F5F9', '#64748B')}>● Kolam B</span>
            </div>
          </div>
          
          {/* Simulated Chart with SVG */}
          <div style={{ height: '240px', position: 'relative', marginTop: '40px' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 240" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="240" x2="800" y2="240" stroke="#E9F0EC" strokeWidth="1" />
              
              {/* Area Gradient */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B4332" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Kolam A Path */}
              <path 
                d="M0,180 C100,180 150,150 200,150 C250,150 300,100 400,100 C500,100 550,210 600,210 C650,210 700,120 800,120 L800,240 L0,240 Z" 
                fill="url(#chartGradient)" 
              />
              <path 
                d="M0,180 C100,180 150,150 200,150 C250,150 300,100 400,100 C500,100 550,210 600,210 C650,210 700,120 800,120" 
                fill="none" stroke="#1B4332" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              />
              
              {/* Kolam B Path (Dashed) */}
              <path 
                d="M0,210 C100,210 150,200 200,200 C250,200 300,160 400,160 C500,160 550,230 600,230 C650,230 700,180 800,180" 
                fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray="6,6" strokeLinecap="round"
              />
            </svg>
            
            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
                <span key={day} style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Rata-rata FCR */}
        <div style={{ ...cardStyle, background: '#1B4332', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>monitoring</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8, letterSpacing: '0.05em' }}>TARGET: 1.2</span>
            </div>
            
            <div style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', margin: 0, opacity: 0.9 }}>Rata-rata FCR</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '850', margin: 0 }}>1.42</h2>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6EE7B7' }}>+0.05 vs bln lalu</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginTop: '40px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '16px', opacity: 0.8 }}>Efisiensi Pakan Per Kolam</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Kolam A</span>
                  <span>1.28</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '82%', height: '100%', background: '#6EE7B7', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Kolam B</span>
                  <span>1.56</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ width: '65%', height: '100%', background: '#EF4444', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* Estimasi Hasil Panen */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Estimasi Hasil Panen (Ton)</h3>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              background: '#F1F5F9', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#64748B' 
            }}>
              Semua Kolam
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>expand_more</span>
            </div>
          </div>
          
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 20px' }}>
            {[
              { label: 'K-01', val: 0.8, color: '#F1F5F9' },
              { label: 'K-02', val: 0.8, color: '#F1F5F9' },
              { label: 'K-03', val: 0.8, color: '#F1F5F9' },
              { label: 'K-04', val: 0.8, color: '#F1F5F9' },
              { label: 'K-05', val: 0.8, color: '#F1F5F9' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '48px' }}>
                <div style={{ width: '100%', height: '8px', background: item.color, borderRadius: '4px' }}></div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Konversi Pakan */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 32px' }}>Ringkasan Konversi Pakan (FCR)</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1.5px solid #F1F5F9' }}>
                <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>KOLAM</th>
                <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>PAKAN (KG)</th>
                <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>BIOMAS (KG)</th>
                <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>FCR</th>
                <th style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Kolam A-01', pakan: '1,250', biomas: '980', fcr: '1.28', status: 'SEHAT', bg: '#D1FAE5', color: '#059669' },
                { name: 'Kolam B-04', pakan: '2,400', biomas: '1,530', fcr: '1.56', status: 'KRITIS', bg: '#FEE2E2', color: '#EF4444' },
                { name: 'Kolam C-02', pakan: '1,800', biomas: '1,350', fcr: '1.33', status: 'MODERAT', bg: '#F1F5F9', color: '#64748B' },
                { name: 'Kolam D-01', pakan: '3,100', biomas: '2,600', fcr: '1.19', status: 'SEHAT', bg: '#D1FAE5', color: '#059669' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid #F1F5F9' }}>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: '800', color: '#1B4332' }}>{row.name}</td>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: '600', color: '#475569' }}>{row.pakan}</td>
                  <td style={{ padding: '20px 0', fontSize: '14px', fontWeight: '600', color: '#475569' }}>{row.biomas}</td>
                  <td style={{ padding: '20px 0', fontSize: '15px', fontWeight: '850', color: '#1A1C1A' }}>{row.fcr}</td>
                  <td style={{ padding: '20px 0' }}>
                    <span style={badge(row.bg, row.color)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
