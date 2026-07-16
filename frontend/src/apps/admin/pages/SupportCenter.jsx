import { useState, useEffect, useCallback } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import './Shared.css'

const PRIORITY_BADGE = { high: 'badge-red', medium: 'badge-yellow', low: 'badge-gray' }
const PRIORITY_LABEL = { high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }
const STATUS_BADGE = { open: 'badge-blue', in_progress: 'badge-yellow', resolved: 'badge-green' }
const STATUS_LABEL = { open: 'Baru', in_progress: 'Diproses', resolved: 'Selesai' }
const CAT_ICON = { bug: '🐛', question: '❓', feature: '💡', billing: '💳' }
const CAT_LABEL = { bug: 'Bug', question: 'Pertanyaan', feature: 'Feature', billing: 'Billing' }

export default function SupportCenter() {
  const [tickets, setTickets] = useState([])
  const [tenants, setTenants] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  
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
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Support Center</h2>
          <p className="page-sub">Kelola tiket dukungan pelanggan dan permintaan bantuan.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + Buat Tiket
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            <span>Memuat tiket dukungan...</span>
          </div>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Tiket Baru', value: openCount, icon: '📬', color: '#3b82f6', desc: 'Menunggu respons admin' },
              { label: 'Diproses', value: inProgressCount, icon: '⚙️', color: '#f59e0b', desc: 'Sedang ditangani staf' },
              { label: 'Selesai', value: resolvedCount, icon: '✅', color: '#10b981', desc: 'Tiket berhasil ditutup' },
              { label: 'Prioritas Tinggi', value: highPriorityCount, icon: '🔴', color: '#ef4444', desc: 'Butuh tindakan segera' },
            ].map(card => (
              <div key={card.label} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: card.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, color: card.color, flexShrink: 0
                  }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{card.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>{card.desc}</div>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Filters + Table ── */}
          <div className="card card-pad" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>🎫 Daftar Tiket</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-wrap" style={{ minWidth: 200, maxWidth: 280 }}>
                  <span className="search-icon">🔍</span>
                  <input className="form-input search-input" placeholder="Cari tiket..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-tabs">
                  {['all', 'open', 'in_progress', 'resolved'].map(s => (
                    <button key={s} className={`filter-tab ${filter === s ? 'filter-tab--active' : ''}`} onClick={() => setFilter(s)}>
                      {s === 'all' ? 'Semua' : STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
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
                  {paginatedData.map(t => (
                    <tr key={t.id}>
                      <td><code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{t.id}</code></td>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{t.tenant}</td>
                      <td style={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                      <td><span style={{ fontSize: 12 }}>{CAT_ICON[t.category]} {CAT_LABEL[t.category]}</span></td>
                      <td><span className={`badge ${PRIORITY_BADGE[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span></td>
                      <td><span className={`badge ${STATUS_BADGE[t.status]}`}>{STATUS_LABEL[t.status]}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.date}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelected(t)} title="Lihat Detail">👁</button>
                          {t.status === 'open' && (
                            <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={() => handleUpdateStatus(t.id, 'in_progress')} title="Proses Tiket">⚙️</button>
                          )}
                          {t.status === 'in_progress' && (
                            <button className="btn btn-primary btn-sm" style={{ fontSize: 11, background: 'var(--success-500)', border: 'none' }} onClick={() => handleUpdateStatus(t.id, 'resolved')} title="Tandai Selesai">✓</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 36 }}>🎫</span>
                          <span>Tidak ada tiket ditemukan.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
          </div>
        </>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Detail Tiket: ${selected.id}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>{CAT_ICON[selected.category]}</span>
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
              { label: 'Kategori', value: `${CAT_ICON[selected.category]} ${CAT_LABEL[selected.category]}` },
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
              >
                ⚙️ Proses Tiket
              </button>
            )}
            {selected.status === 'in_progress' && (
              <button
                className="btn btn-primary"
                style={{ background: 'var(--success-500)', border: 'none' }}
                onClick={() => handleUpdateStatus(selected.id, 'resolved')}
              >
                ✓ Tandai Selesai
              </button>
            )}
          </div>
        </Modal>
      )}

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
                  <option value="bug">🐛 Bug / Error</option>
                  <option value="question">❓ Pertanyaan</option>
                  <option value="feature">💡 Request Fitur</option>
                  <option value="billing">💳 Billing / Pembayaran</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <select
                  className="form-select"
                  value={createForm.priority}
                  onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                >
                  <option value="low">🔘 Rendah</option>
                  <option value="medium">🟡 Sedang</option>
                  <option value="high">🔴 Tinggi</option>
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
