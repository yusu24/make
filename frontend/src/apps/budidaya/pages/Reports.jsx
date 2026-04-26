import React from 'react'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'


export default function Reports() {
  const cardStyle = {
    background: '#fff',
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #E9F0EC',
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
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

  const harvestBars = [
    { label: 'K-01', val: 0.72, color: '#C1F2D8' },
    { label: 'K-02', val: 0.55, color: '#C1F2D8' },
    { label: 'K-03', val: 0.88, color: '#1B4332' },
    { label: 'K-04', val: 0.40, color: '#C1F2D8' },
    { label: 'K-05', val: 0.65, color: '#C1F2D8' },
  ]

  return (
    <div className="aq-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="aq-page-title" style={{ fontSize: '28px' }}>Laporan &amp; analisa</h1>
          <p className="aq-body-text" style={{ marginTop: '8px', maxWidth: '500px', lineHeight: '1.5' }}>
            Visualisasi mendalam untuk performa kolam dan tren kualitas air untuk mendukung keputusan operasional harian.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            borderRadius: '12px', border: '1.5px solid #1B4332', background: '#fff',
            color: '#1B4332', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Ekspor PDF
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            borderRadius: '12px', border: 'none', background: '#1B4332',
            color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
            30 Hari Terakhir
          </button>
        </div>
      </div>

      {/* Top Row: SVG Chart + FCR KPI */}
      <div className="aq-reports-top">
        {/* Tren Kualitas Air */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 className="aq-section-title">Tren kualitas air</h3>
              <p className="aq-kpi-label" style={{ marginTop: '4px' }}>Parameter: Oksigen terlarut (DO)</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={badge('#D1FAE5', '#059669')}>● Kolam A</span>
              <span style={badge('#F1F5F9', '#64748B')}>● Kolam B</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <svg width="100%" height="180" viewBox="0 0 800 200" preserveAspectRatio="none">
              <line x1="0" y1="200" x2="800" y2="200" stroke="#E9F0EC" strokeWidth="1" />
              <line x1="0" y1="133" x2="800" y2="133" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="67" x2="800" y2="67" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B4332" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 C100,150 150,120 200,120 C250,120 300,70 400,70 C500,70 550,175 600,175 C650,175 700,90 800,90 L800,200 L0,200 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,150 C100,150 150,120 200,120 C250,120 300,70 400,70 C500,70 550,175 600,175 C650,175 700,90 800,90"
                fill="none" stroke="#1B4332" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M0,175 C100,175 150,165 200,165 C250,165 300,130 400,130 C500,130 550,190 600,190 C650,190 700,150 800,150"
                fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="6,6" strokeLinecap="round"
              />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
                <span key={day} style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8' }}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* FCR KPI Card */}
        <div style={{ ...cardStyle, background: '#1B4332', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>monitoring</span>
              </div>
              <span className="aq-kpi-label" style={{ color: '#fff', opacity: 0.8 }}>Target: 1.2</span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <p className="aq-body-text" style={{ color: '#fff', fontWeight: 700, opacity: 0.9 }}>Rata-rata fcr</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <h2 className="aq-kpi-value" style={{ fontSize: '44px', color: '#fff' }}>1.42</h2>
                <span className="aq-small-text" style={{ fontWeight: '600', color: '#6EE7B7' }}>+0.05 vs bln lalu</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginTop: '28px' }}>
            <p className="aq-kpi-label" style={{ color: '#fff', opacity: 0.8, marginBottom: '16px' }}>Efisiensi pakan per kolam</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Kolam A', val: '82%', color: '#6EE7B7' },
                { label: 'Kolam B', val: '65%', color: '#EF4444' },
              ].map(bar => (
                <div key={bar.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                    <span>{bar.label}</span><span>{bar.val}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: bar.val, height: '100%', background: bar.color, borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Bar Chart + FCR Table */}
      <div className="aq-reports-bottom">

        {/* Estimasi Hasil Panen */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Estimasi hasil panen (Ton)</h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
              background: '#F1F5F9', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#64748B', cursor: 'pointer'
            }}>
              Semua kolam
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>expand_more</span>
            </div>
          </div>

          {/* Bar chart with real heights */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '0 4px', boxSizing: 'border-box', overflow: 'hidden' }}>
            {harvestBars.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: item.color === '#1B4332' ? '#1B4332' : '#94A3B8', whiteSpace: 'nowrap' }}>
                  {(item.val * 2).toFixed(1)}T
                </span>
                <div style={{
                  width: '100%',
                  height: `${Math.round(item.val * 120)}px`,
                  background: item.color,
                  borderRadius: '6px 6px 3px 3px',
                  boxShadow: item.color === '#1B4332' ? '0 4px 12px rgba(27,67,50,0.3)' : 'none',
                  minHeight: '12px',
                }}></div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748B', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1B4332' }}></div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Tertinggi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#C1F2D8' }}></div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Lainnya</span>
            </div>
          </div>
        </div>

        {/* FCR Table */}
        <div style={cardStyle}>
          <h3 className="aq-section-title" style={{ fontSize: '17px', marginBottom: '20px' }}>Ringkasan konversi pakan (FCR)</h3>

          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #E9F0EC' }}>
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell>Nama kolam</TableHeaderCell>
                  <TableHeaderCell>Pakan (kg)</TableHeaderCell>
                  <TableHeaderCell>Biomassa (kg)</TableHeaderCell>
                  <TableHeaderCell>FCR</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Kolam A-01', pakan: '1,250', biomas: '980',   fcr: '1.28', status: 'Sehat',   bg: '#D1FAE5', color: '#059669' },
                  { name: 'Kolam B-04', pakan: '2,400', biomas: '1,530', fcr: '1.56', status: 'Kritis',  bg: '#FEE2E2', color: '#EF4444' },
                  { name: 'Kolam C-02', pakan: '1,800', biomas: '1,350', fcr: '1.33', status: 'Moderat', bg: '#F1F5F9', color: '#64748B' },
                  { name: 'Kolam D-01', pakan: '3,100', biomas: '2,600', fcr: '1.19', status: 'Sehat',   bg: '#D1FAE5', color: '#059669' }
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell style={{ fontWeight: '700', color: '#1B4332' }}>{row.name}</TableCell>
                    <TableCell isSecondary>{row.pakan}</TableCell>
                    <TableCell isSecondary>{row.biomas}</TableCell>
                    <TableCell style={{ fontWeight: '800', color: '#1A1C1A' }}>{row.fcr}</TableCell>
                    <TableCell>
                      <span style={badge(row.bg, row.color)}>{row.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>

    </div>
  )
}
