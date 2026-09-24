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

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header mb-4">
          <div>
            <h2 className="page-title">Siklus &amp; Manajemen Langganan</h2>
          </div>
        </div>

        {/* ── Lifecycle Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Langganan Aktif Aman</p>
              <p className="text-2xl font-extrabold text-emerald-600 tracking-tight font-['Plus_Jakarta_Sans']">
                {tenants.filter(t => t.lifecycle_status === 'active').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Segera Jatuh Tempo (&le;7 Hari)</p>
              <p className="text-2xl font-extrabold text-amber-600 tracking-tight font-['Plus_Jakarta_Sans']">
                {tenants.filter(t => t.lifecycle_status === 'expiring_soon').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Masa Tenggang (Grace Period)</p>
              <p className="text-2xl font-extrabold text-orange-600 tracking-tight font-['Plus_Jakarta_Sans']">
                {tenants.filter(t => t.lifecycle_status === 'grace_period').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <X size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overdue / Kadaluarsa</p>
              <p className="text-2xl font-extrabold text-rose-600 tracking-tight font-['Plus_Jakarta_Sans']">
                {tenants.filter(t => t.lifecycle_status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none' }}>
          {/* Card header toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              {activeTab === 'list' ? (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                  <div className="search-wrap" style={{ minWidth: 200, maxWidth: 280, flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      className="form-input search-input"
                      style={{ paddingLeft: 34 }}
                      placeholder="Cari tenant, ID, email..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    id="select-filter-subscription-lifecycle"
                    className="form-input"
                    style={{ width: 'auto', minWidth: 170, height: 38, padding: '0 32px 0 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}
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
              ) : <div style={{ flex: 1 }} />}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="filter-tabs">
                  <button
                    className={`filter-tab ${activeTab === 'list' ? 'filter-tab--active' : ''}`}
                    onClick={() => setActiveTab('list')}
                  >
                    Pelanggan Aktif ({tenants.length})
                  </button>
                  <button
                    className={`filter-tab ${activeTab === 'requests' ? 'filter-tab--active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                  >
                    Permintaan Langganan
                    {requests.length > 0 && (
                      <span style={{
                        marginLeft: 6, background: '#ef4444', color: '#fff',
                        borderRadius: 10, fontSize: 10, fontWeight: 700,
                        padding: '1px 6px', lineHeight: '16px', display: 'inline-block',
                      }}>{requests.length}</span>
                    )}
                  </button>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ height: 38, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    setLoading(true)
                    Promise.all([fetchTenants(), fetchRequests()]).finally(() => setLoading(false))
                  }}
                  disabled={loading}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
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
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenBilling(t)}
                            title="Lihat Riwayat Tagihan / Invoice"
                          >
                            <FileText size={13} />
                            <span>Invoice</span>
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setExtendTarget(t)
                                setExtendDays(7)
                              }}
                              title="Beri Grace Period / Perpanjang Masa Aktif"
                              style={{ color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                            >
                              <Sparkles size={13} />
                              <span>+ Perpanjang / Grace</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
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