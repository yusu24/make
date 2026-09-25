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
import StatScoreCard from '@/components/ui/StatScoreCard'
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

  const publishedCount = items.filter(i => i.status === 'published').length
  const draftCount = items.filter(i => i.status === 'draft').length

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Toast Alert ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-white ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchAnnouncements}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang siaran"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
          <button
            onClick={openAdd}
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Plus size={15} />
            <span>Buat Broadcast Baru</span>
          </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Memuat data siaran pengumuman &amp; broadcast...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ── KPI Metric Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatScoreCard
              title="TOTAL BROADCAST"
              value={items.length}
              icon={Megaphone}
              statusBadge={{ text: "Siaran", color: "blue" }}
              subtitle="Seluruh arsip pesan siaran"
              progressBar={{ value: 100, color: "bg-blue-500" }}
              onClick={() => setFilter('all')}
            />
            <StatScoreCard
              title="SIARAN AKTIF (LIVE)"
              value={publishedCount}
              icon={Radio}
              statusBadge={{ text: "On-Air", color: "emerald" }}
              subtitle="Sedang tampil di tenant"
              progressBar={{ value: Math.min(100, Math.round((publishedCount / (items.length || 1)) * 100)), color: "bg-emerald-500" }}
              onClick={() => setFilter('published')}
            />
            <StatScoreCard
              title="KONSEP & DRAFT"
              value={draftCount}
              icon={FileEdit}
              statusBadge={{ text: "Draft", color: "amber" }}
              subtitle="Belum disiarkan ke publik"
              progressBar={{ value: Math.min(100, Math.round((draftCount / (items.length || 1)) * 100)), color: "bg-amber-500" }}
              onClick={() => setFilter('draft')}
            />
            <StatScoreCard
              title="JANGKAUAN AUDIENS"
              value={`${totalTenants} Merchant`}
              icon={Users}
              statusBadge={{ text: "Potensi", color: "violet" }}
              subtitle="Total populasi merchant aktif"
              progressBar={{ value: 95, color: "bg-violet-500" }}
            />
          </div>

          {/* ── Table Card ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Toolbar Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2.5 items-center flex-wrap flex-1 min-w-[260px]">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    placeholder="Cari judul broadcast, pesan, atau target..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <select 
                  id="select-filter-announcement-type"
                  className="h-[38px] rounded-xl px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  value={filter} 
                  onChange={e => setFilter(e.target.value)}
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

              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> broadcast
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pengumuman &amp; Pesan Siaran</th>
                    <th>Tipe &amp; Format</th>
                    <th>Target Audiens &amp; Estimasi Reach</th>
                    <th>Status Siaran</th>
                    <th>Masa Aktif</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                        <Inbox size={32} className="opacity-40 mx-auto mb-2" />
                        <span className="text-xs">Tidak ada broadcast yang cocok dengan kriteria pencarian.</span>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(item => {
                      const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.feature
                      const TypeIcon = cfg.icon

                      return (
                        <tr key={item.id}>
                          <td style={{ maxWidth: 360 }}>
                            <div className="flex items-start gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                              >
                                <TypeIcon size={17} strokeWidth={2} />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-1 flex items-center gap-1.5">
                                  <span className="truncate">{item.title}</span>
                                  {item.action_url && (
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0 inline-flex items-center gap-0.5">
                                      CTA <ExternalLink size={8} />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {item.content}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              <span className={`badge ${cfg.badge} inline-flex items-center gap-1 w-fit text-[10px]`}>
                                <TypeIcon size={10} /> {cfg.label}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                {item.display_type === 'banner' ? 'Banner Top' : item.display_type === 'toast' ? 'In-App Toast' : 'Modal Popup'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {TARGET_LABEL[item.target] || item.target || 'Semua Tenant'}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>Reach:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  {item.estimated_reach ?? totalTenants} Toko ({item.reach_percentage ?? 100}%)
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <span className={`badge ${item.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                                {item.status === 'published' ? '🟢 Live' : '🟡 Draft'}
                              </span>
                              <button
                                onClick={() => handleTogglePublish(item)}
                                title={item.status === 'published' ? 'Tarik siaran kembali ke draft' : 'Terbitkan siaran seketika'}
                                className={`h-7 px-2 rounded-lg text-[11px] font-semibold transition-colors border ${
                                  item.status === 'published'
                                    ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                                    : 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                                }`}
                              >
                                {item.status === 'published' ? 'Tarik' : '🚀 Siarkan'}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-0.5">
                              <span>Dibuat: {item.date || item.created_at?.slice(0, 10)}</span>
                              {item.expires_at && (
                                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                  <Clock size={10} /> Exp: {item.expires_at.slice(0, 16)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewModal(item)}
                                title="Preview Tampilan Broadcast Tenant"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => openEdit(item)}
                                title="Edit Broadcast"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                title="Hapus Broadcast"
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
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
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Judul Broadcast <span className="text-rose-500">*</span></label>
              <input
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="contoh: 🎉 Update Fitur Baru: Integrasi Pengiriman Otomatis"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kategori Pesan</label>
                <select className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Format Tampilan</label>
                <select className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={form.display_type} onChange={e => setForm(f => ({ ...f, display_type: e.target.value }))}>
                  <option value="modal">🪟 Popup Interstitial (Prioritas Tinggi)</option>
                  <option value="banner">📌 Sticky Top Banner (Header Dashboard)</option>
                  <option value="toast">🔔 In-App Toast Notification</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Audiens Merchant</label>
              <select className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                {TARGET_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {TARGET_OPTIONS.find(o => o.value === form.target)?.desc}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Isi Pesan Broadcast <span className="text-rose-500">*</span></label>
              <textarea
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 resize-y"
                rows={5}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Tuliskan rincian pengumuman, panduan, atau informasi promo untuk tenant..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tombol Aksi / CTA Label (Opsional)</label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                  value={form.action_text}
                  onChange={e => setForm(f => ({ ...f, action_text: e.target.value }))}
                  placeholder="contoh: Coba Fitur Sekarang"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Link Aksi / URL Tujuan (Opsional)</label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                  value={form.action_url}
                  onChange={e => setForm(f => ({ ...f, action_url: e.target.value }))}
                  placeholder="contoh: /retail/pos atau https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status Publikasi</label>
                <select className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="draft">🟡 Simpan Sebagai Draft</option>
                  <option value="published">🟢 Langsung Siarkan (Published)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Batas Waktu Tayang (Opsional)</label>
                <input
                  type="datetime-local"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={form.expires_at}
                  onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button type="button" className="h-[38px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold" onClick={() => setModal(null)} disabled={saving}>
                Batal
              </button>
              <button type="submit" className="h-[38px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50" disabled={saving}>
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
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg bg-white dark:bg-slate-900">
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

              <div className="p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {previewModal.content}

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Pratinjau tampilan merchant</span>
                  <div className="flex gap-2">
                    {previewModal.action_url && (
                      <button className="h-8 px-3 rounded-lg bg-indigo-600 text-white font-semibold text-xs inline-flex items-center gap-1.5" type="button">
                        <span>{previewModal.action_text || 'Pelajari Selengkapnya'}</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                    <button className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold" type="button" onClick={() => setPreviewModal(null)}>
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