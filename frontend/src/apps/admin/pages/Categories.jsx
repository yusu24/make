import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  Plus,
  Search,
  Store,
  Users,
  CheckCircle2,
  Tag,
  Eye,
  CreditCard,
  Pencil,
  Trash2,
  ExternalLink
} from '@/constants/icons'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import Modal from '../../../components/Modal'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16']
const ICONS  = ['🛒','🐟','🔧','🏭','🍱','🏥','🏗️','📦']

// Map kategori bisnis → URL sistem yang bersangkutan
const SYSTEM_ROUTES = {
  'Toko Retail':        '/retail/dashboard',
  'toko-retail':        '/retail/dashboard',
  'Budidaya Hewan':      '/budidaya/dashboard',
  'budidaya-hewan':      '/budidaya/dashboard',
  'Budidaya Tanaman':   '/budidaya/dashboard',
  'budidaya-tanaman':   '/budidaya/dashboard',
  'Jasa':               '/jasa/dashboard',
  'jasa':               '/jasa/dashboard',
  'Jasa & Repair':      '/jasa/dashboard',
  'jasa-repair':        '/jasa/dashboard',
  'Seller':             '/seller/dashboard',
  'seller':             '/seller/dashboard',
  'Seller Marketplace': '/seller/dashboard',
  'seller-marketplace': '/seller/dashboard',
  'Kuliner':            '/kuliner/admin',
  'kuliner':            '/kuliner/admin',
}

export const resolveCategorySlug = (cat) => {
  if (typeof cat === 'object' && cat !== null) {
    if (cat.slug) return cat.slug
    if (cat.name) return resolveCategorySlug(cat.name)
  }
  const name = String(cat || '').trim()
  const lower = name.toLowerCase()

  if (lower.includes('retail') || lower.includes('toko')) return 'toko-retail'
  if (lower.includes('budi') || lower.includes('ternak') || lower.includes('hewan') || lower.includes('ikan')) return 'budidaya-hewan'
  if (lower.includes('tani') || lower.includes('tanaman')) return 'budidaya-tanaman'
  if (lower.includes('kuliner') || lower.includes('resto') || lower.includes('cafe')) return 'kuliner'
  if (lower.includes('seller') || lower.includes('commerce') || lower.includes('marketplace') || lower.includes('online')) return 'seller'
  if (lower.includes('jasa') || lower.includes('repair') || lower.includes('servis') || lower.includes('bengkel')) return 'jasa'

  return null
}

export default function Categories() {
  const navigate = useNavigate()
  const { impersonateDemoSandbox } = useAuth()
  const [demoLoading, setDemoLoading] = useState(false)

  const handleEnterDemo = async (cat) => {
    const slug = resolveCategorySlug(cat)
    const catName = typeof cat === 'object' && cat !== null ? (cat.name || '') : String(cat || '')

    if (!slug) {
      navigate(SYSTEM_ROUTES[catName] || `/categories/${encodeURIComponent(catName)}`)
      return
    }
    setDemoLoading(true)
    try {
      const redirect = await impersonateDemoSandbox(slug)
      navigate(redirect)
    } catch (err) {
      console.warn('Gagal impersonate demo sandbox, fallback ke navigasi langsung:', err)
      const directRoute = SYSTEM_ROUTES[catName] || SYSTEM_ROUTES[slug] || (slug === 'jasa' ? '/jasa/dashboard' : slug === 'seller' ? '/seller/dashboard' : '/dashboard')
      navigate(directRoute)
    } finally {
      setDemoLoading(false)
    }
  }

  const [cats, setCats]    = useState([])
  const [show, setShow]    = useState(false)
  const [editing, setEditing] = useState(null)
  const emptyStats = [{ value:'', label:'' }, { value:'', label:'' }]
  const [form, setForm]    = useState({ name:'', description:'', icon:'🛒', color:'#3b82f6', active:true, promo_text:'', discount_pct:0, promo_active:false, features_input:'', headline:'', badge:'', stats: emptyStats })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]      = useState('')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)

  const fetchCats = () => {
    setLoading(true)
    api.get('/categories')
      .then(r => setCats(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCats()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name:'', description:'', icon:'🛒', color:'#3b82f6', active:true, promo_text:'', discount_pct:0, promo_active:false, features_input:'', headline:'', badge:'', stats: emptyStats })
    setMsg('')
    setShow(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon || '🛒',
      color: cat.color || '#3b82f6',
      active: cat.active,
      promo_text: cat.promo_text || '',
      discount_pct: cat.discount_pct || 0,
      promo_active: cat.promo_active || false,
      features_input: cat.features_list ? cat.features_list.join(', ') : '',
      headline: cat.headline || '',
      badge: cat.badge || '',
      stats: cat.stats?.length === 2 ? cat.stats : emptyStats,
    })
    setMsg('')
    setShow(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    
    const parsedFeatures = form.features_input
      ? form.features_input.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const hasStats = form.stats.some(st => st.value.trim() || st.label.trim())

    const payload = {
      ...form,
      features_list: parsedFeatures,
      stats: hasStats ? form.stats : null,
    }

    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload)
        setCats(v => v.map(c => c.id === editing.id ? { ...c, ...payload } : c))
      } else {
        const r = await api.post('/categories', payload)
        const newCat = r.data?.data || { ...payload, id: Date.now(), tenant_count: 0 }
        setCats(v => [...v, newCat])
      }
      setMsg('Tersimpan!')
      setTimeout(() => { setShow(false); setMsg('') }, 800)
    } catch {
      setCats(v => editing ? v.map(c => c.id === editing.id ? { ...c, ...payload } : c) : [...v, { ...payload, id: Date.now(), tenant_count: 0 }])
      setShow(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kategori ini?')) return
    setCats(v => v.filter(c => c.id !== id))
    try { await api.delete(`/categories/${id}`) } catch {}
  }

  const toggleActive = async (id, cur) => {
    setCats(v => v.map(c => c.id === id ? { ...c, active: !cur } : c))
    try { await api.patch(`/categories/${id}/toggle`) } catch {}
  }

  const totalTenants = cats.reduce((sum, c) => sum + (c.tenant_count || 0), 0)
  const activeCount = cats.filter(c => c.active).length
  const promoCount = cats.filter(c => c.promo_active).length

  const filtered = cats.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
  })

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchCats}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang kategori"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
          <button
            id="btn-add-category"
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all"
            onClick={openAdd}
          >
            <Plus size={15} />
            <span>Tambah Kategori</span>
          </button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatScoreCard
          title="TOTAL SEKTOR BISNIS"
          value={cats.length}
          icon={Store}
          statusBadge={{ text: "Terdefinisi", color: "blue" }}
          subtitle="Vertikal industri platform"
          progressBar={{ value: 100, color: "bg-blue-500" }}
        />
        <StatScoreCard
          title="TENANT TERDISTRIBUSI"
          value={totalTenants}
          icon={Users}
          statusBadge={{ text: "Akumulasi", color: "emerald" }}
          subtitle="Populasi tenant di sektor"
          progressBar={{ value: 88, color: "bg-emerald-500" }}
        />
        <StatScoreCard
          title="KATEGORI AKTIF (LIVE)"
          value={activeCount}
          icon={CheckCircle2}
          statusBadge={{ text: activeCount === cats.length ? "100% Live" : "Sebagian", color: "violet" }}
          subtitle="Tampil di pendaftaran publik"
          progressBar={{ value: Math.min(100, Math.round((activeCount / (cats.length || 1)) * 100)), color: "bg-violet-500" }}
        />
        <StatScoreCard
          title="PROMOSI BERJALAN"
          value={`${promoCount} Sektor`}
          icon={Tag}
          statusBadge={{ text: promoCount > 0 ? "Diskon Aktif" : "Normal", color: promoCount > 0 ? "amber" : "slate" }}
          subtitle="Diskon upgrade paket usaha"
          progressBar={{ value: Math.min(100, promoCount * 25), color: "bg-amber-500" }}
        />
      </div>

      {/* ── Search Bar Filter ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="input-search-categories"
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
            placeholder="Cari kategori atau deskripsi sektor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> sektor bisnis
        </div>
      </div>

      {/* ── Category Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Memuat data kategori bisnis...
              </span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 shadow-sm">
            <Store size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Tidak ada kategori ditemukan</p>
          </div>
        ) : filtered.map(cat => (
          <div
            key={cat.id}
            id={`cat-card-${cat.id}`}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: (cat.color || '#3b82f6') + '20' }}
                >
                  <span>{cat.icon || '🏢'}</span>
                </div>
                <button
                  className={`toggle-btn ${cat.active ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                  onClick={() => toggleActive(cat.id, cat.active)}
                  title={cat.active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {cat.description || 'Tidak ada deskripsi kategori.'}
              </p>

              {cat.promo_active && cat.discount_pct > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs mb-3">
                  <span>🔥 PROMO {cat.discount_pct}% OFF</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold font-['Plus_Jakarta_Sans']" style={{ color: cat.color || '#3b82f6' }}>
                    {cat.tenant_count || 0}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Tenant</span>
                </div>
                <span className={`badge ${cat.active ? 'badge-green' : 'badge-gray'}`}>
                  {cat.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  id={`btn-view-cat-${cat.id}`}
                  onClick={() => handleEnterDemo(cat)}
                  disabled={demoLoading}
                  className="flex-1 h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Eye size={13} />
                  <span>Demo</span>
                </button>
                <button 
                  onClick={() => navigate('/packages-features')}
                  title="Kelola Paket & Fitur Kategori Ini" 
                  className="h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold shadow-xs transition-colors"
                >
                  <CreditCard size={13} />
                  <span>Paket</span>
                </button>
                <button
                  id={`btn-edit-cat-${cat.id}`}
                  onClick={() => openEdit(cat)}
                  title="Edit Kategori"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  id={`btn-del-cat-${cat.id}`}
                  onClick={() => handleDelete(cat.id)}
                  title="Hapus Kategori"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add/Edit Modal ── */}
      <Modal isOpen={show} onClose={() => setShow(false)} title={editing ? 'Edit Kategori Bisnis' : 'Tambah Kategori Bisnis Baru'} maxWidth="580px">
        {msg && <div className="p-3 mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"><span>✓</span> {msg}</div>}
        <form id="form-category" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Kategori *</label>
            <input
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
              placeholder="cth. Toko Retail"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi</label>
            <textarea
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 resize-y"
              rows={3}
              placeholder="Deskripsi singkat kategori..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Fitur Utama (Pills) — Pisahkan dengan koma</label>
            <input
              className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
              placeholder="cth. Kasir POS, Stok Realtime, Laporan Penjualan" 
              value={form.features_input}
              onChange={e => setForm({...form, features_input: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Icon Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${
                      form.icon === ic
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                    onClick={() => setForm({...form, icon: ic})}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Aksen Warna</label>
              <div className="flex gap-2 flex-wrap items-center">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`w-7 h-7 rounded-lg border-2 transition-transform ${
                      form.color === c ? 'scale-110 border-white ring-2 ring-slate-400' : 'border-transparent'
                    }`}
                    style={{ background: c }}
                    onClick={() => setForm({...form, color: c})}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sector Detail Panel Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Detail Panel Sektor (Landing Page)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Badge</label>
                <input
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="cth. Solusi Kasir & Stok"
                  value={form.badge}
                  onChange={e => setForm({...form, badge: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Headline</label>
                <input
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="cth. Kasir POS Cepat, Stok Terintegrasi, Bebas Selisih Barang"
                  value={form.headline}
                  onChange={e => setForm({...form, headline: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Category Promo Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Paket Promo Kategori
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Teks Promo</label>
                <input
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="cth. Launching Promo 30%!"
                  value={form.promo_text}
                  onChange={e => setForm({...form, promo_text: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Diskon (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="cth. 30"
                  value={form.discount_pct}
                  onChange={e => setForm({...form, discount_pct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Aktifkan Promo Paket</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Terapkan potongan harga saat tenant kategori ini upgrade</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${form.promo_active ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                onClick={() => setForm({...form, promo_active: !form.promo_active})}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              id="btn-cancel-cat"
              type="button"
              className="h-[38px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold"
              onClick={() => setShow(false)}
            >
              Batal
            </button>
            <button
              id="btn-save-cat"
              type="submit"
              className="h-[38px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Tambah Kategori')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
