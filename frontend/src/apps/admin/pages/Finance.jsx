import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import './Shared.css'

const STATUS_BADGE = {
  paid: 'badge-green',
  unpaid: 'badge-yellow',
  overdue: 'badge-red',
}
const STATUS_LABEL = { paid: 'Lunas', unpaid: 'Belum Bayar', overdue: 'Jatuh Tempo' }

const fmtRp = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`

// ─── Simple bar chart ─────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Belum ada data pendapatan untuk ditampilkan.
      </div>
    )
  }
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = (d.revenue / max) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
              {fmtRp(d.revenue).replace('Rp ', '')}
            </div>
            <div style={{
              width: '100%', borderRadius: '6px 6px 0 0',
              height: `${pct}%`, minHeight: 8,
              background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
              transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
            }} />
            <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{d.month}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function Finance() {
  const [invoices, setInvoices]         = useState([])
  const [months, setMonths]             = useState([])
  const [statsData, setStatsData]       = useState({ total_revenue: 0, paid_count: 0, unpaid_count: 0 })
  const [filter, setFilter]             = useState('all')
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [markingPaid, setMarkingPaid]   = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [invRes, statsRes] = await Promise.all([
        api.get('/admin/finance/invoices'),
        api.get('/admin/finance/stats'),
      ])
      setInvoices(invRes.data?.data || [])
      const s = statsRes.data?.data || {}
      setStatsData({
        total_revenue: s.total_revenue || 0,
        paid_count:    s.paid_count    || 0,
        unpaid_count:  s.unpaid_count  || 0,
      })
      setMonths(s.months || [])
    } catch {
      // API down or network error – keep state empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleViewInvoice = (inv) => {
    setSelectedInvoice(inv)
    setIsModalOpen(true)
  }

  const handleMarkAsPaid = async (invId) => {
    const inv = invoices.find(i => i.id === invId)
    if (!inv) return
    if (!window.confirm(`Tandai invoice ${inv.id} untuk ${inv.tenant} sebagai Lunas?`)) return

    setMarkingPaid(invId)
    try {
      await api.patch(`/admin/finance/invoices/${invId}/pay`)
      // Update local state optimistically
      setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status: 'paid' } : i))
      if (selectedInvoice?.id === invId) setSelectedInvoice(prev => ({ ...prev, status: 'paid' }))
      // Refresh stats
      const statsRes = await api.get('/admin/finance/stats')
      const s = statsRes.data?.data || {}
      setStatsData({
        total_revenue: s.total_revenue || 0,
        paid_count:    s.paid_count    || 0,
        unpaid_count:  s.unpaid_count  || 0,
      })
      setMonths(s.months || [])
    } catch {
      // Refetch fresh data on error
      fetchData()
    } finally {
      setMarkingPaid(null)
    }
  }

  const filtered = invoices.filter(inv => {
    const matchStatus = filter === 'all' || inv.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || inv.tenant.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Finance</h2>
          <p className="page-sub">Ringkasan pendapatan, invoice, dan rekonsiliasi pembayaran SaaS.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <span>Memuat data keuangan...</span>
          </div>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Pendapatan', value: fmtRp(statsData.total_revenue), icon: '💰', color: '#10b981', sub: 'semua invoice lunas' },
              { label: 'Invoice Lunas',    value: statsData.paid_count,           icon: '✅', color: '#10b981', sub: `dari ${invoices.length} invoice` },
              { label: 'Belum / Jatuh Tempo', value: statsData.unpaid_count,     icon: '⚠️', color: '#f59e0b', sub: 'perlu tindakan' },
            ].map(card => (
              <div key={card.label} className="card card-pad">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: card.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{card.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{card.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Revenue Chart ── */}
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 20, fontSize: 15 }}>
              📈 Tren Pendapatan Bulanan (6 Bulan Terakhir)
            </h3>
            <RevenueChart data={months} />
          </div>

          {/* ── Invoice Table ── */}
          <div className="card card-pad" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>📄 Daftar Invoice</h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="search-wrap" style={{ minWidth: 180, maxWidth: 240 }}>
                    <span className="search-icon">🔍</span>
                    <input className="form-input search-input" placeholder="Cari tenant / invoice..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <div className="filter-tabs">
                    {['all', 'paid', 'unpaid', 'overdue'].map(s => (
                      <button key={s} className={`filter-tab ${filter === s ? 'filter-tab--active' : ''}`} onClick={() => setFilter(s)}>
                        {s === 'all' ? 'Semua' : STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Invoice</th>
                    <th>Tenant</th>
                    <th>Paket</th>
                    <th>Jumlah</th>
                    <th>Tanggal</th>
                    <th>Jatuh Tempo</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id}>
                      <td><code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{inv.id}</code></td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{inv.tenant}</td>
                      <td><span className={`badge ${inv.plan === 'Pro' ? 'badge-violet' : 'badge-blue'}`}>{inv.plan}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmtRp(inv.amount)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.date}</td>
                      <td style={{ fontSize: 12, color: inv.status === 'overdue' ? 'var(--danger-400)' : 'var(--text-muted)' }}>{inv.due}</td>
                      <td><span className={`badge ${STATUS_BADGE[inv.status]}`}>{STATUS_LABEL[inv.status]}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleViewInvoice(inv)}>👁</button>
                          {inv.status !== 'paid' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11 }}
                              disabled={markingPaid === inv.id}
                              onClick={() => handleMarkAsPaid(inv.id)}
                            >
                              {markingPaid === inv.id ? '...' : '✓ Lunas'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 36 }}>📄</span>
                          <span>Belum ada invoice.</span>
                          <span style={{ fontSize: 12 }}>Invoice akan muncul otomatis ketika tenant berlangganan.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Invoice Langganan SaaS" maxWidth="600px">
          <div style={{ padding: '8px 4px' }}>
            {/* Header / Brand */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--primary-500)', letterSpacing: '0.5px' }}>
                  UMKM <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>SaaS</span>
                </h4>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>Sistem Manajemen Tenant Terintegrasi</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${STATUS_BADGE[selectedInvoice.status]}`} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6 }}>
                  {STATUS_LABEL[selectedInvoice.status]}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>No: <code>{selectedInvoice.id}</code></p>
              </div>
            </div>

            {/* Bill Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, fontSize: 13 }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ditagihkan Kepada:</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, margin: '0 0 2px' }}>{selectedInvoice.tenant}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Plan: <span className={`badge ${selectedInvoice.plan === 'Pro' ? 'badge-violet' : 'badge-blue'}`} style={{ fontSize: 10 }}>{selectedInvoice.plan} Plan</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Informasi Pembayaran:</p>
                <p style={{ margin: '0 0 4px', color: 'var(--text-muted)' }}>Tanggal Invoice: <strong>{selectedInvoice.date}</strong></p>
                <p style={{ margin: '0 0 4px', color: 'var(--text-muted)' }}>Jatuh Tempo: <strong style={{ color: selectedInvoice.status === 'overdue' ? 'var(--danger-400)' : 'inherit' }}>{selectedInvoice.due}</strong></p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Metode: <strong>Transfer Bank / VA</strong></p>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)' }}>Deskripsi Layanan</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', width: 120 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 12 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Paket Langganan SaaS ({selectedInvoice.plan})</strong>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>Akses penuh ke semua modul sistem.</p>
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{fmtRp(selectedInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: 220, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 10, fontWeight: 800, fontSize: 15, color: 'var(--primary-500)' }}>
                    <span>Total Tagihan:</span>
                    <span>{fmtRp(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Tutup</button>
              {selectedInvoice.status !== 'paid' && (
                <button className="btn btn-primary" onClick={() => handleMarkAsPaid(selectedInvoice.id)}>
                  ✓ Tandai Lunas
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
