import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../../lib/api'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import '../budidaya.css'
import '../budidaya-print.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import usePagination from '../../../hooks/usePagination'
import BudidayaPagination from '../components/BudidayaPagination'
import {
  BudidayaPrintHeader,
  BudidayaPrintSectionHeader,
  BudidayaPrintAppendixHeader,
  BudidayaPrintExplanationBox,
  BudidayaPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/BudidayaPrintLayout'

const fmt = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID')
const fmtNum = (n, dec = 0) => (n || 0).toFixed(dec)

export default function Reports() {
  const navigate = useNavigate()
  const terms = useBudidayaTerms()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState(null)
  const [fcrData, setFcrData] = useState([])
  const [harvestData, setHarvestData] = useState([])
  const [harvestSummary, setHarvestSummary] = useState(null)
  const [error, setError] = useState(null)
  const printRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Produksi-Panen-Budidaya-${new Date().toISOString().split('T')[0]}`,
  })

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

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(harvestData)

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

  const totalRevenue = harvestData.reduce((acc, r) => acc + Number(r.total_revenue || 0), 0)
  const totalCost = harvestData.reduce((acc, r) => acc + (Number(r.total_revenue || 0) - Number(r.net_profit || 0)), 0)
  const totalNetProfit = harvestData.reduce((acc, r) => acc + Number(r.net_profit || 0), 0)
  const totalWeight = harvestData.reduce((acc, r) => acc + Number(r.weight_kg || 0), 0)

  return (
    <div className="aq-container">

      {/* Top Action Bar with Print Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1B4332', color: 'white', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }} 
          onClick={handlePrint} 
          disabled={loading}
        >
          <Printer size={16} /> Cetak / Export PDF
        </button>
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
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>{terms.isTanaman ? 'Konversi nutrisi (FCR) — siklus aktif' : 'Konversi pakan (FCR) — siklus aktif'}</h3>
            <p className="aq-kpi-label" style={{ marginTop: 4 }}>{`Feed Conversion Ratio per ${terms.unitLower} yang sedang berjalan`}</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', borderRadius: 8, padding: '4px 10px' }}>
            {fcrData.length} {terms.unitLower} aktif
          </span>
        </div>

        {fcrData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #E2E8F0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#CBD5E1' }}>monitoring</span>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 12 }}>Belum ada data FCR untuk siklus yang sedang aktif.</p>
            <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Data akan terisi otomatis setelah Anda mencatat pemberian pakan dan sampling.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow isHoverable={false}>
                <TableHeaderCell>{terms.unitName}</TableHeaderCell>
                <TableHeaderCell>Komoditas</TableHeaderCell>
                <TableHeaderCell>Umur Siklus (Hari)</TableHeaderCell>
                <TableHeaderCell>Total Pakan (KG)</TableHeaderCell>
                <TableHeaderCell>Estimasi Biomassa (KG)</TableHeaderCell>
                <TableHeaderCell>FCR Berjalan</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fcrData.map((row, i) => {
                const badge = fcrBadge(row.status)
                return (
                  <TableRow key={i}>
                    <TableCell style={{ color: '#0f172a', fontWeight: 500 }}>{row.pond_name}</TableCell>
                    <TableCell style={{ color: '#0f172a', textTransform: 'capitalize' }}>{row.fish_type}</TableCell>
                    <TableCell style={{ color: '#0f172a' }}>{row.age_days} hari</TableCell>
                    <TableCell>{fmtNum(row.total_feed_kg, 1)} kg</TableCell>
                    <TableCell>{fmtNum(row.est_biomass_kg, 1)} kg</TableCell>
                    <TableCell>
                      <span style={{ fontSize: 13, color: badge.color, fontWeight: 500 }}>
                        {row.fcr != null ? fmtNum(row.fcr, 2) : '—'}
                      </span>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <span className="badge-pill" style={{ background: badge.bg, color: badge.color, textTransform: 'capitalize' }}>
                        {row.status}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #E9F0EC', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1B4332', margin: 0 }}>Riwayat Panen</h3>
            <p className="aq-kpi-label" style={{ marginTop: 4 }}>Semua siklus yang telah selesai dipanen</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', borderRadius: 8, padding: '4px 10px' }}>
            {harvestData.length} catatan
          </span>
        </div>

        {harvestData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#CBD5E1' }}>agriculture</span>
            <p style={{ color: '#64748B', fontSize: 14, marginTop: 12 }}>Belum ada data panen yang tercatat.</p>
            <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Catatan panen akan muncul setelah Anda menyelesaikan satu siklus budidaya.</p>
          </div>
        ) : (
          <>
            <Table>
            <TableHeader>
              <TableRow isHoverable={false}>
                <TableHeaderCell>{terms.unit}</TableHeaderCell>
                <TableHeaderCell>{terms.isTanaman ? 'Jenis Tanaman' : `Jenis ${terms.populationUnit || 'Komoditas'}`}</TableHeaderCell>
                <TableHeaderCell>Tgl. Panen</TableHeaderCell>
                <TableHeaderCell>Berat (KG)</TableHeaderCell>
                <TableHeaderCell>Harga/KG</TableHeaderCell>
                <TableHeaderCell>Pendapatan</TableHeaderCell>
                <TableHeaderCell>Keuntungan</TableHeaderCell>
                <TableHeaderCell>FCR</TableHeaderCell>
                <TableHeaderCell>Survival</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, i) => {
                const isProfit = row.net_profit >= 0
                return (
                  <TableRow key={i}>
                    <TableCell style={{ color: '#0f172a', fontWeight: 500 }}>{row.pond_name}</TableCell>
                    <TableCell style={{ color: '#0f172a', textTransform: 'capitalize' }}>{row.fish_type}</TableCell>
                    <TableCell style={{ color: '#0f172a' }}>{row.harvest_date ? new Date(row.harvest_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                    <TableCell>{fmtNum(row.weight_kg, 1)}</TableCell>
                    <TableCell style={{ color: '#0f172a' }}>Rp {(row.price_per_kg || 0).toLocaleString('id-ID')}</TableCell>
                    <TableCell style={{ color: '#1B4332', fontWeight: 500 }}>
                      {fmt(row.total_revenue)}
                    </TableCell>
                    <TableCell style={{ color: isProfit ? '#059669' : '#EF4444', fontWeight: 500 }}>
                      {isProfit ? '+' : ''}{fmt(row.net_profit)}
                    </TableCell>
                    <TableCell>
                      {row.fcr != null ? (
                        <span className="badge-pill" style={{
                          background: row.fcr <= 1.3 ? '#D1FAE5' : row.fcr <= 1.6 ? '#FEF3C7' : '#FEE2E2',
                          color: row.fcr <= 1.3 ? '#059669' : row.fcr <= 1.6 ? '#D97706' : '#EF4444'
                        }}>
                          {fmtNum(row.fcr, 2)}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell style={{ color: '#0f172a' }}>
                      {row.survival_rate != null ? `${fmtNum(row.survival_rate, 1)}%` : '—'}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/budidaya/cycles/${row.cycle_id}`)}
                        title="Lihat detail siklus"
                        className="btn-table-action"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <BudidayaPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE PRODUCTION & HARVEST REPORT                      */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Laporan Resmi Budidaya */}
          <BudidayaPrintHeader
            user={user}
            title={`Laporan Produksi & Panen ${terms.isTanaman ? 'Pertanian' : 'Budidaya'}`}
            subtitle={`Rekapitulasi Hasil Panen, Efisiensi FCR & Keuntungan Bersih — ${user?.tenant_name || 'Budidaya'}`}
            periodText="Semua Riwayat Siklus Panen Selesai"
            terms={terms}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <BudidayaPrintSectionHeader title="I. Ringkasan Akumulasi Produksi & Performa Panen" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI HASIL PANEN & NILAI EKONOMI
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Akumulasi Berat Hasil Panen</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>{fmtNum(totalWeight, 1)} Kg</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Omzet Penjualan Panen (Gross Revenue)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(totalRevenue)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Estimasi Beban Pokok & Modal Siklus</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalCost)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    TOTAL KEUNTUNGAN BERSIH PANEN (NET HARVEST PROFIT)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Margin: {totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100).toFixed(1) : 0}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalNetProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <BudidayaPrintSectionHeader 
              title="II. Buku Register Riwayat Panen Komoditas (Harvest Ledger)" 
              rightText={`Total ${harvestData.length} catatan panen`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 30, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 90, fontWeight: 600 }}>{terms.unitName}</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 90, fontWeight: 600 }}>Komoditas</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 80, fontWeight: 600 }}>Tgl. Panen</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 75, fontWeight: 600, whiteSpace: 'nowrap' }}>Berat (Kg)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>Harga/Kg</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Pendapatan (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Keuntungan (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 50, fontWeight: 600 }}>FCR</th>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 55, fontWeight: 600 }}>SR (%)</th>
                </tr>
              </thead>
              <tbody>
                {harvestData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 4px', fontWeight: 500, color: '#000000' }}>{row.pond_name}</td>
                    <td style={{ padding: '5px 4px', textTransform: 'capitalize', color: '#000000' }}>{row.fish_type}</td>
                    <td style={{ padding: '5px 4px', color: '#000000', whiteSpace: 'nowrap' }}>
                      {row.harvest_date ? new Date(row.harvest_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {fmtNum(row.weight_kg, 1)}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {formatRp(row.price_per_kg)}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(row.total_revenue)}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                      {row.net_profit >= 0 ? `+${formatRp(row.net_profit)}` : `(${formatRp(Math.abs(row.net_profit))})`}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>
                      {row.fcr != null ? fmtNum(row.fcr, 2) : '—'}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>
                      {row.survival_rate != null ? `${fmtNum(row.survival_rate, 1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {fmtNum(totalWeight, 1)} Kg
                  </td>
                  <td></td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalRevenue)}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {totalNetProfit >= 0 ? `+${formatRp(totalNetProfit)}` : `(${formatRp(Math.abs(totalNetProfit))})`}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <BudidayaPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN METODOLOGI & INDIKATOR PRODUKSI BUDIDAYA */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <BudidayaPrintAppendixHeader 
              title="Lampiran: Metodologi & Indikator Kinerja Produksi Farm"
              subtitle={`Parameter Evaluasi FCR, Survival Rate & Efisiensi Pakan — ${user?.tenant_name || 'Budidaya'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <BudidayaPrintExplanationBox
                number="1"
                title="Feed Conversion Ratio (FCR) / Rasio Konversi Pakan"
                desc="Indikator utama efisiensi budidaya yang mengukur jumlah pakan yang dibutuhkan untuk menghasilkan 1 kilogram bobot panen daging. Semakin rendah nilai FCR, semakin tinggi profitabilitas farm."
                formula="Standar Ideal FCR: ≤ 1.20 - 1.30 (Ikan Air Tawar & Udang)"
                variant="emerald"
              />

              <BudidayaPrintExplanationBox
                number="2"
                title="Survival Rate (SR) / Tingkat Kelulushidupan"
                desc="Persentase jumlah biota yang hidup sampai waktu panen. Nilai SR dipengaruhi oleh kualitas benih/bibit, pengelolaan parameter kualitas air (DO, pH, Suhu), dan biosecurity farm."
                formula="Target SR: ≥ 85% - 90% per siklus produksi"
                variant="indigo"
              />

              <BudidayaPrintExplanationBox
                number="3"
                title="Average Daily Gain (ADG) / Laju Pertumbuhan Harian"
                desc="Kecepatan penambahan berat harian biota selama siklus berjalan. ADG digunakan untuk menentukan estimasi tanggal panen optimal."
                formula="Rumus: ADG = (Bobot Akhir - Bobot Awal) ÷ Jumlah Hari Pemeliharaan"
                variant="default"
              />

              <BudidayaPrintExplanationBox
                number="4"
                title="Struktur Harga Pokok Produksi (HPP per Kg)"
                desc="Total akumulasi biaya bibit, pakan, obat/probiotik, listrik, dan upah tenaga kerja dibagi dengan total kilogram panen yang diperoleh."
                formula="Rumus: HPP/Kg = Total Biaya Siklus ÷ Total Kg Panen"
                variant="rose"
              />

              <BudidayaPrintExplanationBox
                number="5"
                title="Standar Tata Kelola Pascapanen (Post-Harvest Handling)"
                desc="Penanganan sortir ukuran (grading), penimbangan tara timbangan kalibrasi, dan pencatatan nota serah terima panen bersama bakul/pembeli."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
