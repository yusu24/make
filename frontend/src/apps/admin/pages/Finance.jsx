import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import './Shared.css'

import {
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  Search,
  RefreshCw,
  Eye,
  Download,
  Check,
  Inbox
} from '@/constants/icons'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const STATUS_BADGE = {
  paid: 'badge-green',
  unpaid: 'badge-yellow',
  overdue: 'badge-red',
}
const STATUS_LABEL = { paid: 'Lunas', unpaid: 'Belum Bayar', overdue: 'Jatuh Tempo' }

const fmtRp = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`

// ─── Recharts bar chart ────────────────────────────────────────────────────────
function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Belum ada data pendapatan untuk ditampilkan.
      </div>
    )
  }
  const formatYAxis = (tickItem) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(tickItem)
  }
  const formatTooltip = (value) => {
    return ['Rp ' + new Intl.NumberFormat('id-ID').format(value), 'Revenue']
  }
  return (
    <div className="chart-responsive-box" style={{ height: 240, minHeight: 240, marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95}/>
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.55}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
            interval="preserveStartEnd"
            minTickGap={5}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            width={58} 
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              background: 'var(--bg-elevated)', 
              borderColor: 'var(--border-default)',
              borderRadius: '10px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="revenue" name="Revenue" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
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
  const [activeTab, setActiveTab]       = useState('faktur')
  const [invoiceSettings, setInvoiceSettings] = useState(null)
  const [savingSettings, setSavingSettings]   = useState(false)

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

  const fetchInvoiceSettings = async () => {
    try {
      const res = await api.get('/admin/finance/settings')
      setInvoiceSettings(res.data?.data || {})
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await api.post('/admin/finance/settings', invoiceSettings)
      alert(res.data.message || 'Pengaturan invoice berhasil disimpan!')
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingSettings(false)
    }
  }

  const handleDownloadPdf = async (invId) => {
    try {
      const response = await api.get(`/admin/finance/invoices/${invId}/download-pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice_${invId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert('Gagal mengunduh PDF Invoice')
    }
  }

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

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered)

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ── */}
      <div className="page-header mb-2">
        <h2 className="page-title">Finansial &amp; Faktur</h2>
      </div>

      {/* ── Action Bar below title ── */}
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-secondary flex items-center gap-1.5"
          onClick={fetchData}
          disabled={loading}
          title="Muat ulang data faktur"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 500 }}>
              Memuat data faktur &amp; laporan keuangan...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {[
              { label: 'Total Pendapatan', value: fmtRp(statsData.total_revenue), icon: DollarSign, color: '#10b981', bg: 'bg-emerald-50 text-emerald-600', sub: 'Semua invoice lunas' },
              { label: 'Invoice Lunas',    value: statsData.paid_count,           icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-50 text-emerald-600', sub: `Dari ${invoices.length} invoice` },
              { label: 'Belum / Jatuh Tempo', value: statsData.unpaid_count,     icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-50 text-amber-600', sub: 'Perlu tindakan segera' },
            ].map(card => {
              const IconComp = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                    <IconComp size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
                    <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Revenue Chart ── */}
          <div className="card card-pad chart-card-wrapper min-w-0" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <TrendingUp size={18} className="text-indigo-600" />
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 m-0">
                Tren Pendapatan Bulanan (6 Bulan Terakhir)
              </h3>
            </div>
            <RevenueChart data={months} />
          </div>

          {/* Card tabel transaksi */}
          <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none', transform: 'none', transition: 'none' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} className="text-primary" />
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, margin: 0 }}>Daftar Invoice</h3>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="search-wrap" style={{ minWidth: 180, maxWidth: 240, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="form-input search-input" style={{ paddingLeft: 34 }} placeholder="Cari tenant / invoice..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <div style={{ minWidth: 150 }}>
                    <select
                      id="select-filter-invoice-status"
                      className="form-input"
                      value={filter}
                      onChange={e => setFilter(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        outline: 'none',
                        height: 38,
                        width: 'auto',
                        minWidth: 150
                      }}
                    >
                      <option value="all">Semua Status</option>
                      <option value="paid">Lunas</option>
                      <option value="unpaid">Belum Bayar</option>
                      <option value="overdue">Jatuh Tempo</option>
                    </select>
                  </div>
                  <button className="btn btn-secondary" onClick={fetchData} disabled={loading} style={{ height: 38, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={14} /> Refresh
                  </button>
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
                  {paginatedData.map(inv => (
                    <tr key={inv.id}>
                      <td><code style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{inv.id}</code></td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{inv.tenant}</td>
                      <td><span className={`badge ${inv.plan === 'Pro' ? 'badge-violet' : 'badge-blue'}`}>{inv.plan}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmtRp(inv.amount)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-primary)' }}>{inv.date}</td>
                      <td style={{ fontSize: 12, color: inv.status === 'overdue' ? 'var(--danger-400)' : 'var(--text-primary)' }}>{inv.due}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[inv.status]}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {inv.status === 'paid' && <CheckCircle2 size={11} />}
                          {inv.status === 'unpaid' && <Clock size={11} />}
                          {inv.status === 'overdue' && <AlertTriangle size={11} />}
                          {STATUS_LABEL[inv.status]}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleViewInvoice(inv)} title="Lihat Detail">
                            <Eye size={13} />
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadPdf(inv.id)} title="Unduh PDF Invoice">
                            <Download size={13} />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              disabled={markingPaid === inv.id}
                              onClick={() => handleMarkAsPaid(inv.id)}
                              title="Tandai Lunas"
                            >
                              {markingPaid === inv.id ? '...' : <Check size={12} />}
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
                          <Inbox size={32} className="text-slate-400" />
                          <span>Belum ada invoice.</span>
                          <span style={{ fontSize: 12 }}>Invoice akan muncul otomatis ketika tenant berlangganan.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <SaasPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            )}
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
                <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--primary-500)', letterSpacing: '0.5px' }}>
                  BIZORA <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>SaaS</span>
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
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, margin: '0 0 2px' }}>{selectedInvoice.tenant}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Plan: <span className={`badge ${selectedInvoice.plan === 'Pro' ? 'badge-violet' : 'badge-blue'}`} style={{ fontSize: 10 }}>{selectedInvoice.plan} Plan</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Informasi Pembayaran:</p>
                <p style={{ margin: '0 0 4px', color: 'var(--text-muted)' }}>Tanggal Invoice: <strong style={{ fontWeight: 600 }}>{selectedInvoice.date}</strong></p>
                <p style={{ margin: '0 0 4px', color: 'var(--text-muted)' }}>Jatuh Tempo: <strong style={{ fontWeight: 600, color: selectedInvoice.status === 'overdue' ? 'var(--danger-400)' : 'inherit' }}>{selectedInvoice.due}</strong></p>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Metode: <strong style={{ fontWeight: 600 }}>Transfer Bank / VA</strong></p>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 10, fontWeight: 600, fontSize: 15, color: 'var(--primary-500)' }}>
                    <span>Total Tagihan:</span>
                    <span>{fmtRp(selectedInvoice.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => handleDownloadPdf(selectedInvoice.id)}>📥 Unduh PDF</button>
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
