import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import StatScoreCard from '@/components/ui/StatScoreCard'
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
      {/* ── Action Bar ── */}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Memuat data faktur &amp; laporan keuangan...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ── Summary Cards with StatScoreCard ── */}
          {(() => {
            const totalInvoices = invoices.length;
            const paidPercent = totalInvoices > 0 ? Math.round((statsData.paid_count / totalInvoices) * 100) : 0;
            const unpaidPercent = totalInvoices > 0 ? Math.round((statsData.unpaid_count / totalInvoices) * 100) : 0;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatScoreCard
                  title="Total Pendapatan"
                  value={fmtRp(statsData.total_revenue)}
                  status="Terbayar Lunas"
                  statusVariant="emerald"
                  icon={DollarSign}
                  desc="Akumulasi pendapatan riil dari invoice lunas"
                  progress={100}
                  progressVariant="emerald"
                />

                <StatScoreCard
                  title="Invoice Lunas"
                  value={statsData.paid_count}
                  status={`${paidPercent}% Sukses`}
                  statusVariant="emerald"
                  icon={CheckCircle2}
                  desc={`Dari total ${totalInvoices} invoice tercatat`}
                  progress={paidPercent}
                  progressVariant="emerald"
                  onClick={() => setFilter('paid')}
                />

                <StatScoreCard
                  title="Belum / Jatuh Tempo"
                  value={statsData.unpaid_count}
                  status={statsData.unpaid_count > 0 ? `${unpaidPercent}% Menunggu` : 'Nihil'}
                  statusVariant={statsData.unpaid_count > 0 ? 'amber' : 'slate'}
                  icon={AlertTriangle}
                  desc="Invoice pending atau lewat jatuh tempo"
                  progress={unpaidPercent}
                  progressVariant="amber"
                  onClick={() => setFilter('unpaid')}
                />
              </div>
            );
          })()}

          {/* ── Revenue Chart ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-6 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-800 dark:text-slate-100 m-0">
                Tren Pendapatan Bulanan (6 Bulan Terakhir)
              </h3>
            </div>
            <RevenueChart data={months} />
          </div>

          {/* Card tabel transaksi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-800 dark:text-slate-100 m-0">
                    Daftar Invoice
                  </h3>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="relative min-w-[200px] max-w-xs">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      placeholder="Cari tenant / invoice..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    id="select-filter-invoice-status"
                    className="h-[38px] rounded-xl px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="paid">Lunas</option>
                    <option value="unpaid">Belum Bayar</option>
                    <option value="overdue">Jatuh Tempo</option>
                  </select>
                  <button
                    className="h-[38px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={fetchData}
                    disabled={loading}
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
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
                        <div className="flex gap-1.5 justify-end">
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
                            onClick={() => handleViewInvoice(inv)}
                            title="Lihat Detail Invoice"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => handleDownloadPdf(inv.id)}
                            title="Unduh PDF Invoice"
                          >
                            <Download size={13} />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                              disabled={markingPaid === inv.id}
                              onClick={() => handleMarkAsPaid(inv.id)}
                              title="Tandai Lunas"
                            >
                              {markingPaid === inv.id ? '...' : <><Check size={12} /> Lunas</>}
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
