import { useState, useEffect, useCallback } from 'react'
import { 
  Ticket, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  RotateCcw, 
  Eye, 
  Key, 
  Check, 
  Bug, 
  HelpCircle, 
  Lightbulb, 
  CreditCard, 
  LifeBuoy,
  RefreshCw 
} from '@/constants/icons'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

const PRIORITY_BADGE = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-gray' }
const PRIORITY_LABEL = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }
const STATUS_BADGE = { open: 'badge-blue', in_progress: 'badge-yellow', resolved: 'badge-green' }
const STATUS_LABEL = { open: 'Baru', in_progress: 'Diproses', resolved: 'Selesai' }

const CATEGORY_MAP = {
  bug: { label: 'Bug', icon: Bug, color: '#ef4444' },
  question: { label: 'Pertanyaan', icon: HelpCircle, color: '#3b82f6' },
  feature: { label: 'Feature', icon: Lightbulb, color: '#8b5cf6' },
  billing: { label: 'Billing', icon: CreditCard, color: '#10b981' },
}

export default function SupportCenter() {
  const [tickets, setTickets] = useState([])
  const [tenants, setTenants] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  
  const { impersonate } = useAuth()
  const navigate = useNavigate()
  const [impersonating, setImpersonating] = useState(null)

  const handleImpersonate = async (tenantId) => {
    if (!tenantId) return
    setImpersonating(tenantId)
    try {
      const redirect = await impersonate(tenantId)
      navigate(redirect)
    } catch (err) {
      alert('Gagal impersonate: ' + (err.response?.data?.message || err.message))
    } finally {
      setImpersonating(null)
    }
  }
  
  // Create ticket states
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    tenant_id: '',
    name: '',
    subject: '',
    description: '',
    category: 'bug',
    priority: 'low',
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [ticketsRes, tenantsRes] = await Promise.all([
        api.get('/admin/support/tickets'),
        api.get('/admin/tenants'),
      ])
      setTickets(ticketsRes.data?.data || [])
      setTenants(tenantsRes.data?.data || [])
    } catch {
      // Safe empty state on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = tickets.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      t.tenant.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered)

  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length
  const highPriorityCount = tickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(`/admin/support/tickets/${ticketId}/status`, { status: newStatus })
      // Update local state optimistically
      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          const updated = { ...t, status: newStatus }
          if (newStatus === 'in_progress') updated.assigned = 'Admin'
          return updated
        }
        return t
      }))
      if (selected?.id === ticketId) {
        setSelected(prev => {
          const updated = { ...prev, status: newStatus }
          if (newStatus === 'in_progress') updated.assigned = 'Admin'
          return updated
        })
      }
    } catch {
      fetchData()
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...createForm }
      if (payload.tenant_id) {
        delete payload.name // Avoid validation conflict
      }
      await api.post('/admin/support/tickets', payload)
      setCreateOpen(false)
      setCreateForm({
        tenant_id: '',
        name: '',
        subject: '',
        description: '',
        category: 'bug',
        priority: 'low',
      })
      fetchData()
    } catch {
      // Error handling - keep modal open
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Memuat tiket dukungan &amp; layanan bantuan...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ── Stats with StatScoreCard ── */}
          {(() => {
            const totalTickets = tickets.length
            const openPercent = totalTickets > 0 ? Math.round((openCount / totalTickets) * 100) : 0
            const inProgPercent = totalTickets > 0 ? Math.round((inProgressCount / totalTickets) * 100) : 0
            const resolvedPercent = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0
            const highPercent = totalTickets > 0 ? Math.round((highPriorityCount / totalTickets) * 100) : 0

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
                <StatScoreCard
                  title="Total Tiket"
                  value={totalTickets}
                  status="Semua"
                  statusVariant="indigo"
                  icon={Ticket}
                  desc="Seluruh aduan tenant masuk"
                  progress={100}
                  progressVariant="indigo"
                  onClick={() => setFilter('all')}
                />

                <StatScoreCard
                  title="Tiket Baru"
                  value={openCount}
                  status={openCount > 0 ? `${openPercent}% Baru` : "Nihil"}
                  statusVariant={openCount > 0 ? "indigo" : "slate"}
                  icon={Mail}
                  desc="Menunggu respon tim CS"
                  progress={openPercent}
                  progressVariant="indigo"
                  onClick={() => setFilter('open')}
                />

                <StatScoreCard
                  title="Diproses"
                  value={inProgressCount}
                  status={inProgressCount > 0 ? `${inProgPercent}% Aktif` : "Nihil"}
                  statusVariant={inProgressCount > 0 ? "amber" : "slate"}
                  icon={Clock}
                  desc="Ditangani teknisi / staf"
                  progress={inProgPercent}
                  progressVariant="amber"
                  onClick={() => setFilter('in_progress')}
                />

                <StatScoreCard
                  title="Selesai"
                  value={resolvedCount}
                  status={`${resolvedPercent}% Selesai`}
                  statusVariant="emerald"
                  icon={CheckCircle2}
                  desc="Kendala teratasi penuh"
                  progress={resolvedPercent}
                  progressVariant="emerald"
                  onClick={() => setFilter('resolved')}
                />

                <StatScoreCard
                  title="Prioritas Tinggi"
                  value={highPriorityCount}
                  status={highPriorityCount > 0 ? "Urgent" : "Aman"}
                  statusVariant={highPriorityCount > 0 ? "rose" : "slate"}
                  icon={AlertTriangle}
                  desc="Butuh eskalasi darurat"
                  progress={highPercent}
                  progressVariant="rose"
                />
              </div>
            )
          })()}

          {/* ── Filters + Table Card ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2.5 items-center flex-wrap flex-1 min-w-[260px]">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    placeholder="Cari tiket, tenant, subjek..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select
                  id="select-filter-ticket-status"
                  className="h-[38px] rounded-xl px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="open">🔵 Baru / Belum Ditangani</option>
                  <option value="in_progress">🟡 Sedang Diproses</option>
                  <option value="resolved">🟢 Selesai / Ditutup</option>
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  className="h-[38px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={fetchData}
                  disabled={loading}
                  title="Muat ulang tiket bantuan"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  className="h-[38px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus size={15} />
                  <span>Buat Tiket Baru</span>
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tenant / Pelapor</th>
                    <th>Subjek</th>
                    <th>Kategori</th>
                    <th>Prioritas</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(t => {
                    const cat = CATEGORY_MAP[t.category] || { label: t.category, icon: HelpCircle, color: '#64748b' };
                    const CatIcon = cat.icon;
                    return (
                      <tr key={t.id}>
                        <td><code style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{t.id}</code></td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{t.tenant}</td>
                        <td style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                        <td>
                          <span style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CatIcon size={14} style={{ color: cat.color }} />
                            <span>{cat.label}</span>
                          </span>
                        </td>
                        <td><span className={`badge ${PRIORITY_BADGE[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span></td>
                        <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{STATUS_LABEL[t.status]}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-primary)' }}>{t.date}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelected(t)}
                              title="Lihat Detail Tiket"
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
                            >
                              <Eye size={14} />
                            </button>
                            {t.tenant_id && (
                              <button
                                onClick={() => handleImpersonate(t.tenant_id)}
                                disabled={impersonating === t.tenant_id}
                                title="Login Sebagai Tenant Ini (Impersonate)"
                                className="h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-xs font-semibold shadow-xs disabled:opacity-50"
                              >
                                {impersonating === t.tenant_id ? <Clock size={13} className="animate-spin" /> : <Key size={13} />}
                                <span>Masuk</span>
                              </button>
                            )}
                            {t.status === 'open' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                                title="Proses Tiket"
                                className="h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-xs font-semibold shadow-xs"
                              >
                                <Clock size={13} />
                                <span>Proses</span>
                              </button>
                            )}
                            {t.status === 'in_progress' && (
                              <button
                                onClick={() => handleUpdateStatus(t.id, 'resolved')}
                                title="Tandai Selesai"
                                className="h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors text-xs font-semibold shadow-xs"
                              >
                                <Check size={13} />
                                <span>Selesai</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <LifeBuoy size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                          <span>Tidak ada tiket ditemukan.</span>
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

      {/* ── Detail Modal ── */}
      {selected && (() => {
        const cat = CATEGORY_MAP[selected.category] || { label: selected.category, icon: HelpCircle, color: '#64748b' };
        const CatIcon = cat.icon;
        return (
          <Modal
            isOpen={!!selected}
            onClose={() => setSelected(null)}
            title={`Detail Tiket: ${selected.id}`}
            maxWidth="520px"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                <CatIcon size={24} />
              </div>
              <div>
                <h3 className="modal__title" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.subject}</h3>
                <span className={`badge ${STATUS_BADGE[selected.status]}`} style={{ marginTop: 4, display: 'inline-block' }}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              {[
                { label: 'Tenant / Pelapor', value: selected.tenant },
                { label: 'Kategori', value: cat.label },
                { label: 'Prioritas', value: PRIORITY_LABEL[selected.priority] },
                { label: 'Status', value: STATUS_LABEL[selected.status] },
                { label: 'Tanggal', value: selected.date },
                { label: 'Ditugaskan ke', value: selected.assigned },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Deskripsi / Pesan Pelanggan</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selected.description || 'Tidak ada deskripsi tambahan.'}
              </p>
            </div>
            <div className="modal__actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Tutup</button>
              {selected.status === 'open' && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateStatus(selected.id, 'in_progress')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Clock size={14} />
                  <span>Proses Tiket</span>
                </button>
              )}
              {selected.status === 'in_progress' && (
                <button
                  className="btn btn-primary"
                  style={{ background: 'var(--success-500)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => handleUpdateStatus(selected.id, 'resolved')}
                >
                  <Check size={14} />
                  <span>Tandai Selesai</span>
                </button>
              )}
            </div>
          </Modal>
        );
      })()}

      {/* ── Create Ticket Modal ── */}
      {createOpen && (
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Buat Tiket Dukungan Baru"
          maxWidth="560px"
        >
          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Asosiasi Tenant</label>
              <select
                className="form-select"
                value={createForm.tenant_id}
                onChange={e => setCreateForm({ ...createForm, tenant_id: e.target.value })}
              >
                <option value="">-- Tidak ada / Umum (Manual) --</option>
                {tenants.map(t => (
                  <option key={t.tenant_id} value={t.tenant_id}>
                    {t.business_name} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            {!createForm.tenant_id && (
              <div className="form-group">
                <label className="form-label">Nama Pelapor *</label>
                <input
                  className="form-input"
                  placeholder="cth. Ahmad Suharto"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Subjek Masalah *</label>
              <input
                className="form-input"
                placeholder="cth. Printer thermal tidak mencetak struk"
                value={createForm.subject}
                onChange={e => setCreateForm({ ...createForm, subject: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-select"
                  value={createForm.category}
                  onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
                >
                  <option value="bug">Bug / Error</option>
                  <option value="question">Pertanyaan</option>
                  <option value="feature">Request Fitur</option>
                  <option value="billing">Billing / Pembayaran</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <select
                  className="form-select"
                  value={createForm.priority}
                  onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi / Detail Masalah</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Tulis detail keluhan atau pesan dari pelanggan..."
                value={createForm.description}
                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="modal__actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCreateOpen(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Tambah Tiket'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
