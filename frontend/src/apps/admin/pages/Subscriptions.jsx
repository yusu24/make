import { useState, useEffect } from 'react'
import {
  Search,
  RefreshCw,
  Eye,
  Mail,
  Check,
  X,
  Camera,
  Users,
  Inbox,
  FileText,
  Download,
  Calendar,
  Clock,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowRight,
  Shield,
  CreditCard,
  CheckCircle2
} from '@/constants/icons'
import { api } from '../../../lib/api'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import Modal from '../../../components/Modal'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

export default function Subscriptions({ defaultTab = 'list' }) {
  const [tenants, setTenants] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [lifecycleFilter, setLifecycleFilter] = useState('all')
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const [billingTenant, setBillingTenant] = useState(null)
  const [tenantInvoices, setTenantInvoices] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [selectedProof, setSelectedProof] = useState(null)
  const [extendTarget, setExtendTarget] = useState(null)
  const [extendDays, setExtendDays] = useState(7)
  const [isExtending, setIsExtending] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTenants = async () => {
    try {
      const res = await api.get('/admin/tenants')
      setTenants(res.data?.data || [])
    } catch (err) {
      setTenants([])
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/subscription/requests')
      setRequests(res.data.data || [])
    } catch (err) {
      setRequests([])
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTenants(), fetchRequests()]).finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    if (!window.confirm('Verifikasi pembayaran pelanggan ini sudah diterima dan aktifkan paket?')) return
    try {
      await api.post(`/admin/subscription/requests/${id}/approve`)
      alert('Langganan berhasil diaktifkan!')
      fetchRequests()
      fetchTenants()
    } catch (err) {
      alert('Gagal aktivasi langganan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Alasan penolakan:')
    if (reason === null) return
    try {
      await api.post(`/admin/subscription/requests/${id}/reject`, { notes: reason })
      fetchRequests()
    } catch (err) {
      alert('Gagal menolak permintaan langganan')
    }
  }

  const handlePlanChange = async (tenant, newPlan) => {
    try {
      await api.put(`/admin/tenants/${tenant.tenant_id}/plan`, { plan: newPlan })
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, plan: newPlan } : t))
    } catch (err) {
      alert('Gagal merubah paket langganan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleResendInvoice = async (tenant) => {
    if (!window.confirm(`Kirim invoice ke ${tenant.email}?`)) return
    try {
      const res = await api.post(`/admin/tenants/${tenant.tenant_id}/resend-invoice`)
      alert(res.data.message || 'Invoice berhasil dikirim')
    } catch (err) {
      alert('Gagal mengirim invoice: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleOpenBilling = async (tenant) => {
    setBillingTenant(tenant)
    setLoadingInvoices(true)
    try {
      const res = await api.get(`/admin/finance/invoices?search=${tenant.tenant_id}`)
      setTenantInvoices(res.data.data || [])
    } catch (err) {
      setTenantInvoices([])
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleExtendSubscription = async (e) => {
    if (e) e.preventDefault()
    if (!extendTarget) return
    setIsExtending(true)
    try {
      const res = await api.post(`/admin/tenants/${extendTarget.tenant_id}/extend-subscription`, {
        days: extendDays
      })
      alert(res.data.message || 'Masa aktif langganan berhasil diperpanjang.')
      setExtendTarget(null)
      fetchTenants()
    } catch (err) {
      alert('Gagal memperpanjang masa aktif: ' + (err.response?.data?.message || err.message))
    } finally {
      setIsExtending(false)
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

  const filteredTenants = tenants.filter(t => {
    const q = search.toLowerCase()
    const matchesSearch = (t.name || '').toLowerCase().includes(q) || 
                          (t.email || '').toLowerCase().includes(q) || 
                          (t.category || '').toLowerCase().includes(q) || 
                          (t.tenant_id || '').toLowerCase().includes(q)
    
    let matchesLifecycle = true
    if (lifecycleFilter === 'expiring_soon') {
      matchesLifecycle = t.lifecycle_status === 'expiring_soon'
    } else if (lifecycleFilter === 'grace_period') {
      matchesLifecycle = t.lifecycle_status === 'grace_period'
    } else if (lifecycleFilter === 'overdue') {
      matchesLifecycle = t.lifecycle_status === 'overdue'
    } else if (lifecycleFilter === 'active') {
      matchesLifecycle = t.lifecycle_status === 'active'
    }

    return matchesSearch && matchesLifecycle
  })

  const {
    currentPage: tPage, setCurrentPage: setTPage,
    pageSize: tPageSize, setPageSize: setTPageSize,
    totalPages: tTotalPages, totalItems: tTotalItems,
    paginatedData: tPaginatedData, startIndex: tStart, endIndex: tEnd,
  } = usePagination(filteredTenants)

  const {
    currentPage: rPage, setCurrentPage: setRPage,
    pageSize: rPageSize, setPageSize: setRPageSize,
    totalPages: rTotalPages, totalItems: rTotalItems,
    paginatedData: rPaginatedData, startIndex: rStart, endIndex: rEnd,
  } = usePagination(requests)

  const totalTenantsCount = tenants.length
  const activeSafeCount = tenants.filter(t => t.lifecycle_status === 'active').length
  const activePercent = totalTenantsCount > 0 ? Math.round((activeSafeCount / totalTenantsCount) * 100) : 0
  const expiringCount = tenants.filter(t => t.lifecycle_status === 'expiring_soon').length
  const expiringPercent = totalTenantsCount > 0 ? Math.round((expiringCount / totalTenantsCount) * 100) : 0
  const graceCount = tenants.filter(t => t.lifecycle_status === 'grace_period').length
  const gracePercent = totalTenantsCount > 0 ? Math.round((graceCount / totalTenantsCount) * 100) : 0
  const overdueCount = tenants.filter(t => t.lifecycle_status === 'overdue').length
  const overduePercent = totalTenantsCount > 0 ? Math.round((overdueCount / totalTenantsCount) * 100) : 0

  return (
    <>
      <div className="animate-fade-in">
        {/* ── Lifecycle Metric Cards with StatScoreCard ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatScoreCard
            title="Langganan Aktif Aman"
            value={activeSafeCount}
            status={`${activePercent}% Aman`}
            statusVariant="emerald"
            icon={CheckCircle2}
            desc="Masa aktif lebih dari 7 hari ke depan"
            progress={activePercent}
            progressVariant="emerald"
            onClick={() => setLifecycleFilter('active')}
          />

          <StatScoreCard
            title="Segera Jatuh Tempo"
            value={expiringCount}
            status={expiringCount > 0 ? `${expiringPercent}% Segera Expire` : 'Nihil'}
            statusVariant={expiringCount > 0 ? 'amber' : 'slate'}
            icon={Clock}
            desc="Masa aktif tersisa kurang dari 7 hari"
            progress={expiringPercent}
            progressVariant="amber"
            onClick={() => setLifecycleFilter('expiring_soon')}
          />

          <StatScoreCard
            title="Masa Tenggang (Grace)"
            value={graceCount}
            status={graceCount > 0 ? `${graceCount} Tenant` : 'Nihil'}
            statusVariant={graceCount > 0 ? 'amber' : 'slate'}
            icon={AlertTriangle}
            desc="Toleransi pembayaran &le;3 hari grace period"
            progress={gracePercent}
            progressVariant="amber"
            onClick={() => setLifecycleFilter('grace_period')}
          />

          <StatScoreCard
            title="Overdue / Kadaluarsa"
            value={overdueCount}
            status={overdueCount > 0 ? `${overduePercent}% Terkunci` : 'Nihil'}
            statusVariant={overdueCount > 0 ? 'rose' : 'slate'}
            icon={X}
            desc="Masa aktif habis, akses fitur ditangguhkan"
            progress={overduePercent}
            progressVariant="rose"
            onClick={() => setLifecycleFilter('overdue')}
          />
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Card header toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {activeTab === 'list' ? (
                <div className="flex gap-2.5 items-center flex-wrap flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      placeholder="Cari tenant, ID, email..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    id="select-filter-subscription-lifecycle"
                    className="h-[38px] rounded-xl px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={lifecycleFilter}
                    onChange={e => setLifecycleFilter(e.target.value)}
                  >
                    <option value="all">Semua Siklus Langganan</option>
                    <option value="active">🟢 Aktif Aman (&gt;7 Hari)</option>
                    <option value="expiring_soon">🟡 Segera Jatuh Tempo (&le;7 Hari)</option>
                    <option value="grace_period">🟠 Masa Tenggang Grace Period (&le;3 Hari)</option>
                    <option value="overdue">🔴 Overdue / Kadaluarsa</option>
                  </select>
                </div>
              ) : <div className="flex-1" />}

              <div className="flex gap-2.5 items-center flex-wrap">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                    onClick={() => setActiveTab('list')}
                  >
                    Pelanggan Aktif ({tenants.length})
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'requests' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                    onClick={() => setActiveTab('requests')}
                  >
                    Permintaan Langganan
                    {requests.length > 0 && (
                      <span className="bg-rose-500 text-white rounded-full text-[10px] font-bold px-1.5 py-0.2">
                        {requests.length}
                      </span>
                    )}
                  </button>
                </div>
                <button
                  className="h-[38px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    setLoading(true)
                    Promise.all([fetchTenants(), fetchRequests()]).finally(() => setLoading(false))
                  }}
                  disabled={loading}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table content */}
          {activeTab === 'list' ? (
            <>
              <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tenant / Bisnis</th>
                    <th>Paket Aktif</th>
                    <th>Status Siklus Langganan</th>
                    <th>Masa Berlaku &amp; Sisa Hari</th>
                    <th>Faktur</th>
                    <th style={{ textAlign: 'right' }}>Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <RefreshCw size={24} className="animate-spin text-indigo-600" />
                          <span>Memuat data pelanggan langganan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : tPaginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <Inbox size={32} className="text-slate-400 mx-auto mb-2" />
                        <span>Tidak ada pelanggan langganan yang cocok.</span>
                      </td>
                    </tr>
                  ) : tPaginatedData.map(t => {
                    const isExpiring = t.lifecycle_status === 'expiring_soon'
                    const isGrace = t.lifecycle_status === 'grace_period'
                    const isOverdue = t.lifecycle_status === 'overdue'

                    return (
                      <tr key={t.tenant_id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={getAvatarStyle(t.name || t.tenant_id, 38)}>
                              {getInitials(t.name || t.tenant_id)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {t.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                                <code>{t.tenant_id}</code> • {t.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${t.plan === 'Pro' || t.plan === 'pro' ? 'badge-violet' : 'badge-blue'} font-bold`}>
                            {t.plan || 'Free Starter'}
                          </span>
                        </td>
                        <td>
                          {isOverdue ? (
                            <span className="badge badge-red inline-flex items-center gap-1 text-[11px]">
                              <X size={11} /> Overdue / Expired
                            </span>
                          ) : isGrace ? (
                            <span className="badge badge-yellow inline-flex items-center gap-1 text-[11px]" style={{ background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' }}>
                              <AlertTriangle size={11} /> Masa Tenggang (Grace)
                            </span>
                          ) : isExpiring ? (
                            <span className="badge badge-yellow inline-flex items-center gap-1 text-[11px]">
                              <Clock size={11} /> Segera Jatuh Tempo
                            </span>
                          ) : (
                            <span className="badge badge-green inline-flex items-center gap-1 text-[11px]">
                              <CheckCircle2 size={11} /> Aktif Aman
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="font-semibold text-slate-700">
                              {t.expires_at || 'Selamanya (Free)'}
                            </span>
                            {t.days_left !== null && (
                              <span className={`text-[11px] font-bold ${
                                t.days_left < 0 ? 'text-rose-600' : t.days_left <= 3 ? 'text-orange-600' : t.days_left <= 7 ? 'text-amber-600' : 'text-slate-500'
                              }`}>
                                {t.days_left < 0 ? `Lewat ${Math.abs(t.days_left)} hari` : `Tersisa ${t.days_left} hari`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            onClick={() => handleOpenBilling(t)}
                            title="Lihat Riwayat Tagihan / Invoice"
                          >
                            <FileText size={13} />
                            <span>Invoice</span>
                          </button>
                        </td>
                        <td>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              className="h-8 px-3 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                              onClick={() => {
                                setExtendTarget(t)
                                setExtendDays(7)
                              }}
                              title="Beri Grace Period / Perpanjang Masa Aktif"
                            >
                              <Sparkles size={13} />
                              <span>+ Perpanjang / Grace</span>
                            </button>

                            <button
                              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              onClick={() => handleResendInvoice(t)}
                              title="Kirim Ulang Email Tagihan"
                            >
                              <Mail size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {!loading && filteredTenants.length > 0 && (
              <SaasPagination
                currentPage={tPage}
                setCurrentPage={setTPage}
                pageSize={tPageSize}
                setPageSize={setTPageSize}
                totalPages={tTotalPages}
                totalItems={tTotalItems}
                startIndex={tStart}
                endIndex={tEnd}
              />
            )}
          </>
          ) : (
            <>
              <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Paket Diminta</th>
                    <th>Metode &amp; Bukti</th>
                    <th>Tanggal Request</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        Memuat data permintaan langganan...
                      </td>
                    </tr>
                  ) : rPaginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <Inbox size={32} className="text-slate-400 mx-auto mb-2" />
                        <span>Tidak ada permintaan langganan yang pending.</span>
                      </td>
                    </tr>
                  ) : rPaginatedData.map(req => (
                    <tr key={req.id}>
                      <td>
                        <div className="font-semibold text-slate-800">{req.tenant?.business_name || req.tenant_id}</div>
                        <div className="text-xs text-slate-500">{req.tenant?.email || req.tenant_id}</div>
                      </td>
                      <td>
                        <span className="badge badge-violet uppercase font-bold">{req.requested_plan || req.plan_key}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{req.payment_method || 'Transfer Bank'}</span>
                          {req.payment_proof_path && (
                            <button
                              className="btn btn-secondary btn-xs flex items-center gap-1"
                              onClick={() => setSelectedProof(req.payment_proof_path)}
                            >
                              <Camera size={11} /> Bukti Transfer
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600">{req.created_at?.slice(0, 10)}</span>
                      </td>
                      <td>
                        <span className={`badge ${req.status === 'approved' ? 'badge-green' : req.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                          {req.status === 'approved' ? 'Disetujui' : req.status === 'rejected' ? 'Ditolak' : 'Menunggu Approval'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {req.status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => handleApprove(req.id)}>
                                <Check size={13} /> Setujui
                              </button>
                              <button className="btn btn-danger btn-sm flex items-center gap-1" onClick={() => handleReject(req.id)}>
                                <X size={13} /> Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && requests.length > 0 && (
              <SaasPagination
                currentPage={rPage}
                setCurrentPage={setRPage}
                pageSize={rPageSize}
                setPageSize={setRPageSize}
                totalPages={rTotalPages}
                totalItems={rTotalItems}
                startIndex={rStart}
                endIndex={rEnd}
              />
            )}
          </>
          )}
        </div>
      </div>

      {/* ── Modal Extend Subscription & Grace Period (Pillar 5) ── */}
      {extendTarget && (
        <Modal
          isOpen={!!extendTarget}
          onClose={() => setExtendTarget(null)}
          title={`⏱️ Perpanjangan & Grace Period: ${extendTarget.name}`}
          maxWidth="460px"
        >
          <form onSubmit={handleExtendSubscription} className="space-y-4 text-slate-700">
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
              <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-indigo-950 font-bold mb-0.5">Otomasi Siklus Langganan</strong>
                Perpanjang masa aktif tenant secara instan atau berikan masa tenggang (Grace Period) tambahan agar operasional kasir tetap berjalan.
              </div>
            </div>

            <div>
              <label className="form-label font-semibold">Pilih Durasi Perpanjangan / Grace Period</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { label: '+3 Hari (Grace)', val: 3 },
                  { label: '+7 Hari (1 Mgg)', val: 7 },
                  { label: '+30 Hari (1 Bln)', val: 30 },
                  { label: '+90 Hari (3 Bln)', val: 90 },
                  { label: '+180 Hari (6 Bln)', val: 180 },
                  { label: '+365 Hari (1 Thn)', val: 365 },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setExtendDays(opt.val)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      extendDays === opt.val
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label font-semibold">Atau Masukkan Hari Kustom</label>
              <input
                type="number"
                min="1"
                max="3650"
                className="form-input"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                required
              />
            </div>

            <div className="modal__actions pt-3 border-t border-slate-200">
              <button type="button" className="btn btn-secondary" onClick={() => setExtendTarget(null)} disabled={isExtending}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={isExtending}>
                {isExtending ? 'Menyimpan...' : `Simpan (+${extendDays} Hari)`}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Billing & Invoices ── */}
      {billingTenant && (
        <Modal
          isOpen={!!billingTenant}
          onClose={() => setBillingTenant(null)}
          title={`Faktur Tagihan: ${billingTenant.name}`}
          maxWidth="680px"
        >
          <div className="space-y-4">
            {loadingInvoices ? (
              <div className="py-8 text-center text-slate-500">Memuat riwayat faktur...</div>
            ) : tenantInvoices.length === 0 ? (
              <div className="py-8 text-center text-slate-400">Belum ada faktur tagihan yang diterbitkan untuk tenant ini.</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tenantInvoices.map(inv => (
                  <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{inv.invoice_number}</div>
                      <div className="text-xs text-slate-500">
                        {inv.period_label || 'Langganan'} • Rp {Number(inv.total_amount || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${inv.status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                        {inv.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadPdf(inv.id)}>
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="modal__actions">
              <button className="btn btn-secondary" onClick={() => setBillingTenant(null)}>Tutup</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Bukti Pembayaran ── */}
      {selectedProof && (
        <Modal isOpen={!!selectedProof} onClose={() => setSelectedProof(null)} title="Bukti Transfer Pelanggan" maxWidth="520px">
          <div className="p-2 text-center">
            <img src={selectedProof} alt="Bukti Transfer" className="max-h-96 max-w-full rounded-xl mx-auto shadow-sm" />
          </div>
          <div className="modal__actions">
            <button className="btn btn-secondary" onClick={() => setSelectedProof(null)}>Tutup</button>
          </div>
        </Modal>
      )}
    </>
  )
}