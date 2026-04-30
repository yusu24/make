import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useNavigate } from 'react-router-dom'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'

const fmt = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID')
const fmtNum = (n, dec = 0) => (n || 0).toFixed(dec)

export default function Reports() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState(null)
  const [fcrData, setFcrData] = useState([])
  const [harvestData, setHarvestData] = useState([])
  const [harvestSummary, setHarvestSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [dashRes, pondRes, harvestRes] = await Promise.all([
          api.get('/budidaya/dashboard/stats'),
          api.get('/budidaya/reports/ponds'),
          api.get('/budidaya/reports/harvest'),
        ])
        setKpi(dashRes.data.data)
        setFcrData(pondRes.data.data.fcr || [])
        setHarvestData(harvestRes.data.data.records || [])
        setHarvestSummary(harvestRes.data.data.summary || null)
      } catch (e) {
        console.error(e)
        setError('Gagal memuat data laporan.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cardStyle = {
    background: '#fff', borderRadius: '20px', padding: '20px',
    border: '1px solid #E9F0EC',
    boxSizing: 'border-box', width: '100%', minWidth: 0,
  }

  const fcrBadge = (status) => {
    const map = {
      sehat:   { bg: '#D1FAE5', color: '#059669' },
      moderat: { bg: '#FEF3C7', color: '#D97706' },
      kritis:  { bg: '#FEE2E2', color: '#EF4444' },
      kosong:  { bg: '#F1F5F9', color: '#64748B' },
    }
    return map[status] || map.kosong
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Menganalisis data laporan...</p>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#EF4444' }}>error</span>
      <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
    </div>
  )

  const kpiCards = [
    {
      label: 'Total pendapatan',
      value: fmt(harvestSummary?.total_revenue),
      icon: 'payments', bg: '#E8F5ED', color: '#1B4332',
      sub: `${harvestSummary?.total_harvests || 0} siklus panen`
    },
    {
      label: 'Keuntungan bersih',
      value: fmt(harvestSummary?.total_profit),
      icon: 'trending_up',
      bg: harvestSummary?.total_profit >= 0 ? '#D1FAE5' : '#FEE2E2',
      color: harvestSummary?.total_profit >= 0 ? '#059669' : '#EF4444',
      sub: `Modal: ${fmt(harvestSummary?.total_cost)}`
    },
    {
      label: 'Rata-rata FCR',
      value: harvestSummary?.avg_fcr != null ? fmtNum(harvestSummary.avg_fcr, 2) : '-',
      icon: 'monitoring', bg: '#FEF3C7', color: '#D97706',
      sub: harvestSummary?.avg_fcr != null ? (harvestSummary.avg_fcr <= 1.3 ? '✓ Efisiensi tinggi' : 'Target: ≤ 1.30') : 'Belum ada data'
    },
    {
      label: 'Total berat panen',
      value: `${fmtNum(harvestSummary?.total_weight_kg, 1)} kg`,
      icon: 'scale', bg: '#E0E7FF', color: '#4F46E5',
      sub: `${harvestSummary?.total_harvests || 0} catatan panen`
    },
  ]

  return (
    <div className="aq-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="aq-page-title">Laporan & analisa</h1>
          <p className="aq-kpi-label" style={{ marginTop: 4 }}>Ringkasan kinerja budidaya dari seluruh data tersimpan</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="aq-grid-4">
        {kpiCards.map((card, i) => (
          <div key={i} style={{ ...cardStyle, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: card.color }}>{card.icon}</span>
              </div>
              <p className="aq-kpi-label">{card.label}</p>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1C1A', lineHeight: 1.2 }}>{card.value}</div>
            <p style={{ fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: 500 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* FCR Table — Active Cycles */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>Konversi pakan (FCR) — siklus aktif</h3>
            <p className="aq-kpi-label" style={{ marginTop: 4 }}>Feed Conversion Ratio per kolam yang sedang berjalan</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', borderRadius: 8, padding: '4px 10px' }}>
            {fcrData.length} kolam aktif
          </span>
        </div>

        {fcrData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #E2E8F0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#CBD5E1' }}>monitoring</span>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 12 }}>Belum ada siklus aktif dengan data pakan.</p>
          </div>
        ) : (
          <div className="aq-table-container">
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell>Nama kolam</TableHeaderCell>
                  <TableHeaderCell>Total pakan (kg)</TableHeaderCell>
                  <TableHeaderCell>Biomassa (kg)</TableHeaderCell>
                  <TableHeaderCell>FCR</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fcrData.map((row, i) => {
                  const badge = fcrBadge(row.status)
                  return (
                    <TableRow key={i}>
                      <TableCell style={{ fontWeight: 700, color: '#1B4332' }}>{row.pond_name}</TableCell>
                      <TableCell isSecondary>{fmtNum(row.total_feed, 1)}</TableCell>
                      <TableCell isSecondary>{fmtNum(row.biomass_kg, 1)}</TableCell>
                      <TableCell style={{ fontWeight: 800, color: '#1A1C1A' }}>
                        {row.fcr != null ? fmtNum(row.fcr, 2) : '—'}
                      </TableCell>
                      <TableCell>
                        <span style={{ padding: '4px 10px', borderRadius: 30, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, textTransform: 'capitalize' }}>
                          {row.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Harvest History Table */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>Riwayat panen</h3>
            <p className="aq-kpi-label" style={{ marginTop: 4 }}>Semua siklus yang telah selesai dipanen</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', borderRadius: 8, padding: '4px 10px' }}>
            {harvestData.length} catatan
          </span>
        </div>

        {harvestData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #E2E8F0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#CBD5E1' }}>agriculture</span>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 12 }}>Belum ada data panen yang tercatat.</p>
            <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Catatan panen akan muncul setelah Anda menyelesaikan satu siklus budidaya.</p>
          </div>
        ) : (
          <div className="aq-table-container">
            <Table>
              <TableHeader>
                <TableRow isHoverable={false}>
                  <TableHeaderCell>Kolam</TableHeaderCell>
                  <TableHeaderCell>Jenis ikan</TableHeaderCell>
                  <TableHeaderCell>Tgl. Panen</TableHeaderCell>
                  <TableHeaderCell>Berat (kg)</TableHeaderCell>
                  <TableHeaderCell>Harga/kg</TableHeaderCell>
                  <TableHeaderCell>Pendapatan</TableHeaderCell>
                  <TableHeaderCell>Keuntungan</TableHeaderCell>
                  <TableHeaderCell>FCR</TableHeaderCell>
                  <TableHeaderCell>Survival</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right' }}>Detail</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {harvestData.map((row, i) => {
                  const isProfit = row.net_profit >= 0
                  return (
                    <TableRow key={i}>
                      <TableCell style={{ fontWeight: 700, color: '#1B4332' }}>{row.pond_name}</TableCell>
                      <TableCell isSecondary style={{ textTransform: 'capitalize' }}>{row.fish_type}</TableCell>
                      <TableCell isSecondary>{row.harvest_date ? new Date(row.harvest_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                      <TableCell>{fmtNum(row.weight_kg, 1)}</TableCell>
                      <TableCell isSecondary>Rp {(row.price_per_kg || 0).toLocaleString('id-ID')}</TableCell>
                      <TableCell style={{ fontWeight: 700, color: '#1B4332' }}>
                        {fmt(row.total_revenue)}
                      </TableCell>
                      <TableCell style={{ fontWeight: 700, color: isProfit ? '#059669' : '#EF4444' }}>
                        {isProfit ? '+' : ''}{fmt(row.net_profit)}
                      </TableCell>
                      <TableCell>
                        {row.fcr != null ? (
                          <span style={{
                            padding: '3px 8px', borderRadius: 30, fontSize: 11, fontWeight: 700,
                            background: row.fcr <= 1.3 ? '#D1FAE5' : row.fcr <= 1.6 ? '#FEF3C7' : '#FEE2E2',
                            color: row.fcr <= 1.3 ? '#059669' : row.fcr <= 1.6 ? '#D97706' : '#EF4444'
                          }}>
                            {fmtNum(row.fcr, 2)}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell isSecondary>
                        {row.survival_rate != null ? `${fmtNum(row.survival_rate, 1)}%` : '—'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => navigate(`/budidaya/cycles/${row.cycle_id}`)}
                          title="Lihat detail siklus"
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: '1.5px solid #E9F0EC', background: '#fff',
                            color: '#1B4332', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

    </div>
  )
}
