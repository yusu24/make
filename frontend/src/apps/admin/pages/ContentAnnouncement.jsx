import { useState, useEffect } from 'react'
import Modal from '../../../components/Modal'
import { api } from '../../../lib/api'
import './Shared.css'

const TYPE_ICON  = { maintenance: '🔧', feature: '🚀', promo: '🎉', security: '🔒' }
const TYPE_BADGE = { maintenance: 'badge-yellow', feature: 'badge-blue', promo: 'badge-violet', security: 'badge-red' }
const TYPE_LABEL = { maintenance: 'Maintenance', feature: 'Fitur Baru', promo: 'Promo', security: 'Keamanan' }
const TARGET_LABEL = { all: 'Semua Tenant', free: 'Free', basic: 'Basic', pro: 'Pro' }

const EMPTY_FORM = { title: '', type: 'feature', target: 'all', content: '', status: 'draft' }

export default function ContentAnnouncement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null) // null | 'add' | item
  const [form, setForm] = useState(EMPTY_FORM)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements')
      setItems(res.data?.data || [])
    } catch (e) {
      console.error('Gagal memuat pengumuman:', e)
      showToast('Gagal memuat data pengumuman', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (item) => {
    setForm({ ...item, date: item.date?.slice(0, 10) ?? '' })
    setModal(item)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return showToast('Judul wajib diisi.', 'error')
    setSaving(true)
    try {
      if (modal === 'add') {
        const res = await api.post('/admin/announcements', form)
        setItems(prev => [res.data.data, ...prev])
        showToast('Pengumuman berhasil dibuat!')
      } else {
        const res = await api.put(`/admin/announcements/${form.id}`, form)
        setItems(prev => prev.map(i => i.id === form.id ? res.data.data : i))
        showToast('Pengumuman berhasil diperbarui!')
      }
      setModal(null)
    } catch (e) {
      showToast('Gagal menyimpan pengumuman', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pengumuman ini?')) return
    try {
      await api.delete(`/admin/announcements/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      showToast('Pengumuman dihapus')
    } catch (e) {
      showToast('Gagal menghapus pengumuman', 'error')
    }
  }

  const handlePublish = async (id) => {
    try {
      const res = await api.patch(`/admin/announcements/${id}/toggle-publish`)
      setItems(prev => prev.map(i => i.id === id ? res.data.data : i))
      const newStatus = res.data.data?.status
      showToast(newStatus === 'published' ? 'Pengumuman dipublikasikan!' : 'Pengumuman ditarik ke Draft')
    } catch (e) {
      showToast('Gagal memperbarui status', 'error')
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  return (
    <div className="animate-fade-in">
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Content &amp; Announcement</h2>
          <p className="page-sub">Kelola pengumuman, notifikasi, dan konten yang dikirim ke tenant.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Buat Pengumuman</button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', value: items.length, icon: '📢', color: '#3b82f6', desc: 'Semua pengumuman dibuat' },
          { label: 'Dipublikasi', value: items.filter(i => i.status === 'published').length, icon: '✅', color: '#10b981', desc: 'Dapat dilihat oleh merchant' },
          { label: 'Draft', value: items.filter(i => i.status === 'draft').length, icon: '📝', color: '#f59e0b', desc: 'Masih dalam tahap edit' },
          { label: 'Ke Semua Tenant', value: items.filter(i => i.target === 'all').length, icon: '📡', color: '#8b5cf6', desc: 'Pengumuman siaran global' },
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

      {/* ── Filter Tabs ── */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-tabs">
          {['all', 'maintenance', 'feature', 'promo', 'security'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Semua' : `${TYPE_ICON[f]} ${TYPE_LABEL[f]}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--primary-500)',
                animation: 'spin 0.7s linear infinite'
              }} />
              <span>Memuat pengumuman...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Belum ada pengumuman untuk kategori ini.
          </div>
        ) : filtered.map(item => (
          <div key={item.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{TYPE_ICON[item.type]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span className={`badge ${TYPE_BADGE[item.type]}`}>{TYPE_LABEL[item.type]}</span>
                    <span className="badge badge-gray">{TARGET_LABEL[item.target]}</span>
                    <span className={`badge ${item.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                      {item.status === 'published' ? '✓ Published' : '📝 Draft'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.date}</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.content}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  className={`btn btn-sm ${item.status === 'published' ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ fontSize: 11 }}
                  onClick={() => handlePublish(item.id)}
                  title={item.status === 'published' ? 'Tarik Pengumuman' : 'Publikasikan'}
                >
                  {item.status === 'published' ? '📥' : '📡'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)} title="Edit">✏️</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-400)' }} onClick={() => handleDelete(item.id)} title="Hapus">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add/Edit Modal ── */}
      {modal !== null && (
        <Modal
          isOpen={modal !== null}
          onClose={() => setModal(null)}
          title={modal === 'add' ? '+ Buat Pengumuman' : '✏️ Edit Pengumuman'}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '10px 0 20px' }}>
            <div>
              <label className="form-label">Judul <span style={{ color: 'var(--danger-400)' }}>*</span></label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Judul pengumuman..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Tipe</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{TYPE_ICON[k]} {v}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Target</label>
                <select className="form-input" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                  {Object.entries(TARGET_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Isi Pengumuman</label>
              <textarea
                className="form-input"
                rows={5}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Tulis isi pengumuman di sini..."
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
          <div className="modal__actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
