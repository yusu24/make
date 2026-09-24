import React, { useState, useEffect } from 'react'
import {
  Megaphone,
  CheckCircle2,
  FileEdit,
  Globe,
  Radio,
  Wrench,
  Rocket,
  Gift,
  Shield,
  Pencil,
  Trash2,
  Plus,
  Send,
  AlertCircle,
  Layers,
  Inbox,
  Search,
  Users,
  Eye,
  ExternalLink,
  Clock,
  Sparkles,
  Smartphone,
  Sliders,
  Bell,
  RefreshCw
} from '@/constants/icons'
import Modal from '../../../components/Modal'
import { api } from '../../../lib/api'
import './Shared.css'

const TYPE_CONFIG = {
  feature:     { label: 'Fitur Baru',    icon: Rocket, badge: 'badge-blue',   color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  maintenance: { label: 'Maintenance',  icon: Wrench, badge: 'badge-yellow', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  promo:       { label: 'Promo Spesial', icon: Gift,   badge: 'badge-violet', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  security:    { label: 'Keamanan',      icon: Shield, badge: 'badge-red',    color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  urgent:      { label: 'Penting/Kritis',icon: AlertCircle, badge: 'badge-red', color: '#dc2626', bg: '#fff1f2', border: '#fecdd3' },
}

const TARGET_OPTIONS = [
  { value: 'all', label: '🌐 Semua Tenant (Global)', desc: 'Menjangkau seluruh merchant tanpa terkecuali' },
  { value: 'free', label: '📦 Paket Starter (Free)', desc: 'Pengguna free tier / trial' },
  { value: 'pro', label: '⭐ Paket Pro Business', desc: 'Pengguna paket berbayar Pro' },
  { value: 'enterprise', label: '👑 Paket Enterprise Unlimited', desc: 'Pelanggan tier tertinggi' },
  { value: 'retail', label: '🛒 Sektor Retail & Kasir POS', desc: 'Tenant bisnis toko & minimarket' },
  { value: 'kuliner', label: '🍽️ Sektor Kuliner & Resto F&B', desc: 'Tenant bisnis cafe, resto & kuliner' },
  { value: 'jasa', label: '💼 Sektor Jasa & Konsultasi', desc: 'Tenant jasa reparasi, salon, konsultan' },
  { value: 'budidaya', label: '🐟 Sektor Budidaya & Agribisnis', desc: 'Tenant tambak perikanan & tani' },
  { value: 'seller', label: '📦 Sektor Seller & Multichannel', desc: 'Tenant online shop & marketplace' },
]

const TARGET_LABEL = Object.fromEntries(TARGET_OPTIONS.map(o => [o.value, o.label]))

const EMPTY_FORM = {
  title: '',
  type: 'feature',
  display_type: 'modal',
  target: 'all',
  content: '',
  action_url: '',
  action_text: 'Pelajari Selengkapnya',
  expires_at: '',
  status: 'draft'
}

export default function ContentAnnouncement() {
  const [items, setItems] = useState([])
  const [totalTenants, setTotalTenants] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState(null) // null | 'add' | item
  const [previewModal, setPreviewModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/announcements')
      setItems(res.data?.data || [])
      if (res.data?.meta?.total_tenants) {
        setTotalTenants(res.data.meta.total_tenants)
      }
    } catch (e) {
      console.error('Gagal memuat pengumuman:', e)
      showToast('Gagal memuat data siaran pengumuman', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnnouncements() }, [])

  const openAdd = () => { 
    setForm(EMPTY_FORM)
    setModal('add') 
  }

  const openEdit = (item) => {
    setForm({
      ...item,
      display_type: item.display_type || 'modal',
      action_url: item.action_url || '',
      action_text: item.action_text || 'Pelajari Selengkapnya',
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : '',
    })
    setModal(item)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return showToast('Judul broadcast wajib diisi.', 'error')
    if (!form.content.trim()) return showToast('Isi pesan broadcast wajib diisi.', 'error')
    setSaving(true)
    try {
      if (modal === 'add') {
        const res = await api.post('/admin/announcements', form)
        showToast('Broadcast pengumuman berhasil dibuat!')
        fetchAnnouncements()
      } else {
        await api.put(`/admin/announcements/${form.id}`, form)
        showToast('Broadcast pengumuman berhasil diperbarui!')
        fetchAnnouncements()
      }
      setModal(null)
    } catch (e) {
      showToast('Gagal menyimpan broadcast: ' + (e.response?.data?.message || e.message), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus siaran pengumuman ini secara permanen?')) return
    try {
      await api.delete(`/admin/announcements/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      showToast('Pengumuman berhasil dihapus')
    } catch (e) {
      showToast('Gagal menghapus pengumuman', 'error')
    }
  }

  const handleTogglePublish = async (item) => {
    try {
      const res = await api.patch(`/admin/announcements/${item.id}/toggle-publish`)
      const updated = res.data?.data
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: updated.status } : i))
      showToast(updated.status === 'published' ? '🚀 Broadcast aktif & disiarkan ke tenant!' : '⏸️ Broadcast ditarik ke Draft')
    } catch (e) {
      showToast('Gagal mengubah status publikasi', 'error')
    }
  }

  const filtered = items.filter(i => {
    const matchCategory = filter === 'all' || i.type === filter || (filter === 'published' && i.status === 'published') || (filter === 'draft' && i.status === 'draft')
    const matchSearch = !search.trim() || 
      (i.title && i.title.toLowerCase().includes(search.toLowerCase())) ||
      (i.content && i.content.toLowerCase().includes(search.toLowerCase())) ||
      (i.target && i.target.toLowerCase().includes(search.toLowerCase()))
    return matchCategory && matchSearch
  })

  return (
    <div className="animate-fade-in">
      {/* ── Toast Alert ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontWeight: 600, fontSize: 13, boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn 0.2s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header mb-2">
        <h2 className="page-title">
          In-App Broadcast &amp; Push Notification Engine
        </h2>
      </div>

      {/* ── Action Bar below title ── */}
      <div className="flex justify-end gap-2.5 mb-4">
        <button
          className="btn btn-secondary flex items-center gap-1.5"
          onClick={fetchAnnouncements}
          disabled={loading}
          title="Muat ulang data siaran"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
        <button className="btn btn-primary flex items-center gap-1.5" onClick={openAdd}>
          <Plus size={16} />
          <span>Buat Broadcast Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span style={{ fontSize: 13.5, color: 'var(--text-muted)', fontWeight: 500 }}>
              Memuat data siaran pengumuman &amp; broadcast...
            </span>
          </div>
        </div>
      ) : (
        <>
      {/* ── Executive Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Megaphone size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Broadcast</p>
            <p className="text-xl font-bold text-slate-800">{items.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Siaran Aktif (Live)</p>
            <p className="text-xl font-bold text-emerald-600">{items.filter(i => i.status === 'published').length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <FileEdit size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Konsep / Draft</p>
            <p className="text-xl font-bold text-amber-600">{items.filter(i => i.status === 'draft').length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Jangkauan Tenant</p>
            <p className="text-xl font-bold text-purple-600">{totalTenants} Merchant</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Search + Filter ── */}
      <div className="card card-pad mb-4" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            <div className="search-wrap" style={{ minWidth: 240, maxWidth: 360, position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                className="form-input search-input"
                style={{ paddingLeft: 34 }}
                placeholder="Cari judul broadcast, pesan, atau target..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select 
              id="select-filter-announcement-type"
              className="form-input" 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 170, height: 38, padding: '0 32px 0 12px', fontSize: 13, cursor: 'pointer', outline: 'none' }}
            >
              <option value="all">Semua Tipe &amp; Status</option>
              <option value="published">🟢 Siaran Aktif (Published)</option>
              <option value="draft">🟡 Draft Saja</option>
              <option value="feature">🚀 Fitur Baru</option>
              <option value="maintenance">🛠️ Maintenance</option>
              <option value="promo">🎁 Promo</option>
              <option value="security">🛡️ Keamanan</option>
              <option value="urgent">🚨 Penting / Kritis</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={fetchAnnouncements} disabled={loading}>
            Muat Ulang
          </button>
        </div>
      </div>

      {/* ── Table Announcements List ── */}
      <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Pengumuman &amp; Pesan Siaran</th>
                <th>Tipe &amp; Format</th>
                <th>Target Audiens &amp; Estimasi Reach</th>
                <th>Status Siaran</th>
                <th>Masa Aktif</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Memuat daftar siaran pengumuman...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Inbox size={32} className="text-slate-400 mx-auto mb-2" />
                    <span>Tidak ada broadcast yang cocok dengan kriteria pencarian.</span>
                  </td>
                </tr>
              ) : filtered.map(item => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feature
                const TypeIcon = cfg.icon

                return (
                  <tr key={item.id}>
                    <td style={{ maxWidth: 380 }}>
                      <div className="flex items-start gap-3">
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: cfg.color, flexShrink: 0, marginTop: 2
                        }}>
                          <TypeIcon size={18} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-sm mb-0.5 flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.action_url && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
                                CTA <ExternalLink size={9} />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 m-0 leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5">
                        <span className={`badge ${cfg.badge} inline-flex items-center gap-1 w-fit text-[11px]`}>
                          <TypeIcon size={11} /> {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium capitalize">
                          Tampilan: <strong>{item.display_type === 'banner' ? 'Banner Top Bar' : item.display_type === 'toast' ? 'In-App Toast' : 'Modal Popup'}</strong>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-800">
                          {TARGET_LABEL[item.target] || item.target || 'Semua Tenant'}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>Estimasi Reach:</span>
                          <span className="font-bold text-indigo-600">
                            {item.estimated_reach ?? totalTenants} Toko ({item.reach_percentage ?? 100}%)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${item.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                          {item.status === 'published' ? '🟢 Live' : '🟡 Draft'}
                        </span>
                        <button
                          className={`btn btn-xs ${item.status === 'published' ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontSize: 11, padding: '3px 8px' }}
                          onClick={() => handleTogglePublish(item)}
                          title={item.status === 'published' ? 'Tarik siaran kembali ke draft' : 'Terbitkan siaran seketika'}
                        >
                          {item.status === 'published' ? 'Tarik' : '🚀 Siarkan'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-600 flex flex-col gap-0.5">
                        <span>Dibuat: {item.date || item.created_at?.slice(0, 10)}</span>
                        {item.expires_at && (
                          <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                            <Clock size={10} /> Exp: {item.expires_at.slice(0, 16)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPreviewModal(item)}
                          title="Preview Tampilan Broadcast Tenant"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(item)}
                          title="Edit Broadcast"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger-500)' }}
                          onClick={() => handleDelete(item.id)}
                          title="Hapus Broadcast"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* ── Add / Edit Broadcast Composer Modal ── */}
      {modal !== null && (
        <Modal
          isOpen={modal !== null}
          onClose={() => setModal(null)}
          title={modal === 'add' ? '📢 Buat Siaran In-App Broadcast Baru' : '✏️ Edit Siaran Broadcast'}
          maxWidth="640px"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 text-slate-700">
            <div>
              <label className="form-label font-semibold">Judul Broadcast <span className="text-rose-500">*</span></label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="contoh: 🎉 Update Fitur Baru: Integrasi Pengiriman Otomatis"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label font-semibold">Kategori Pesan</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label font-semibold">Format Tampilan</label>
                <select className="form-input" value={form.display_type} onChange={e => setForm(f => ({ ...f, display_type: e.target.value }))}>
                  <option value="modal">🪟 Popup Interstitial (Prioritas Tinggi)</option>
                  <option value="banner">📌 Sticky Top Banner (Header Dashboard)</option>
                  <option value="toast">🔔 In-App Toast Notification</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label font-semibold">Target Audiens Merchant</label>
              <select className="form-input" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                {TARGET_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {TARGET_OPTIONS.find(o => o.value === form.target)?.desc}
              </p>
            </div>

            <div>
              <label className="form-label font-semibold">Isi Pesan Broadcast <span className="text-rose-500">*</span></label>
              <textarea
                className="form-input"
                rows={5}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Tuliskan rincian pengumuman, panduan, atau informasi promo untuk tenant..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label font-semibold">Tombol Aksi / CTA Label (Opsional)</label>
                <input
                  className="form-input"
                  value={form.action_text}
                  onChange={e => setForm(f => ({ ...f, action_text: e.target.value }))}
                  placeholder="contoh: Coba Fitur Sekarang"
                />
              </div>

              <div>
                <label className="form-label font-semibold">Link Aksi / URL Tujuan (Opsional)</label>
                <input
                  className="form-input"
                  value={form.action_url}
                  onChange={e => setForm(f => ({ ...f, action_url: e.target.value }))}
                  placeholder="contoh: /retail/pos atau https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label font-semibold">Status Publikasi</label>
                <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">🟡 Simpan Sebagai Draft</option>
                  <option value="published">🟢 Langsung Siarkan (Published)</option>
                </select>
              </div>

              <div>
                <label className="form-label font-semibold">Batas Waktu Tayang (Opsional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal__actions pt-3 border-t border-slate-200">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : modal === 'add' ? '🚀 Buat Broadcast' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Live Tenant Preview Modal ── */}
      {previewModal && (
        <Modal
          isOpen={!!previewModal}
          onClose={() => setPreviewModal(null)}
          title="👁️ Preview Tampilan di Dashboard Tenant"
          maxWidth="560px"
        >
          <div className="p-2">
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-white">
              <div style={{
                background: TYPE_CONFIG[previewModal.type]?.color || '#4f46e5',
                padding: '20px 24px',
                color: '#fff'
              }}>
                <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {TYPE_CONFIG[previewModal.type]?.label || 'Pengumuman'}
                </span>
                <h3 className="text-lg font-bold mt-3 mb-1 text-white leading-snug">
                  {previewModal.title}
                </h3>
                <p className="text-xs text-white/80 m-0">
                  Target: {TARGET_LABEL[previewModal.target] || previewModal.target} • {previewModal.date || 'Hari ini'}
                </p>
              </div>

              <div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {previewModal.content}

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Pratinjau tampilan merchant</span>
                  <div className="flex gap-2">
                    {previewModal.action_url && (
                      <button className="btn btn-primary btn-sm flex items-center gap-1.5" type="button">
                        <span>{previewModal.action_text || 'Pelajari Selengkapnya'}</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => setPreviewModal(null)}>
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}