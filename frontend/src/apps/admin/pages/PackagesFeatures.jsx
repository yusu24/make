import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../../lib/api'
import './Shared.css'

// ─── Per-category feature definitions ────────────────────────────────────────
const FEATURES_BY_CATEGORY = {
  'toko-retail': {
    pos:             { label: 'Kasir (POS)',          icon: '🧾' },
    inventory:       { label: 'Manajemen Stok',       icon: '📦' },
    suppliers:       { label: 'Data Supplier',        icon: '🚚' },
    customers:       { label: 'Data Pelanggan',       icon: '👥' },
    discounts:       { label: 'Diskon & Promo',       icon: '🏷️' },
    reports:         { label: 'Laporan Lengkap',      icon: '📊' },
    multiUser:       { label: 'Multi-User / Kasir',   icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    apiAccess:       { label: 'Akses API',            icon: '🔌' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'budidaya-ikan': {
    ponds:           { label: 'Manajemen Kolam',      icon: '🏊' },
    cycles:          { label: 'Siklus Budidaya',      icon: '🔄' },
    feeding:         { label: 'Jadwal Pakan',         icon: '🐟' },
    harvest:         { label: 'Pencatatan Panen',     icon: '🎣' },
    reports:         { label: 'Laporan Budidaya',     icon: '📊' },
    multiUser:       { label: 'Multi-User',           icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'budidaya-tanaman': {
    land:            { label: 'Manajemen Lahan',      icon: '🌾' },
    cycles:          { label: 'Siklus Tanam',         icon: '🔄' },
    fertilizer:      { label: 'Jadwal Pupuk',         icon: '🌿' },
    harvest:         { label: 'Pencatatan Panen',     icon: '🌽' },
    reports:         { label: 'Laporan Pertanian',    icon: '📊' },
    multiUser:       { label: 'Multi-User',           icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
  'kuliner': {
    menu:            { label: 'Manajemen Menu',       icon: '🍽️' },
    orders:          { label: 'Manajemen Pesanan',    icon: '📋' },
    tables:          { label: 'Manajemen Meja',       icon: '🪑' },
    delivery:        { label: 'Layanan Delivery',     icon: '🛵' },
    reports:         { label: 'Laporan Penjualan',    icon: '📊' },
    multiUser:       { label: 'Multi-User / Kasir',   icon: '👨‍💼' },
    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
  },
}

// ─── Presentation per plan tier ───────────────────────────────────────────────
const PRESENTATION = {
  free:  { badge: 'badge-gray',   color: '#6b7280', gradient: 'linear-gradient(135deg,#6b7280,#374151)', icon: '🎁', tagline: 'Coba tanpa biaya' },
  basic: { badge: 'badge-blue',   color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: '⭐', tagline: 'Ideal untuk bisnis kecil', popular: true },
  pro:   { badge: 'badge-violet', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: '🚀', tagline: 'Untuk bisnis yang berkembang' },
}

const fmt      = v => (v === null || v === undefined) ? 'Unlimited' : Number(v).toLocaleString('id-ID')
const fmtPrice = v => (!v || v === 0) ? 'Gratis' : `Rp ${Number(v).toLocaleString('id-ID')}`

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditPlanModal({ plan, categorySlug, onClose, onSave, saving }) {
  const [form, setForm] = useState({ ...plan })
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']
  const pres = PRESENTATION[plan.plan_key] || PRESENTATION.free

  const set    = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setFeat = (key, val) => setForm(f => ({ ...f, features: { ...f.features, [key]: val } }))

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        {/* Header */}
        <div style={{
          background: pres.gradient, padding: '20px 24px', borderRadius: '12px 12px 0 0',
          color: '#fff', display: 'flex', alignItems: 'center', gap: 12, margin: '-24px -24px 24px'
        }}>
          <span style={{ fontSize: 28 }}>{pres.icon}</span>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Edit Paket — {plan.name}</h3>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>{pres.tagline}</p>
          </div>
        </div>

        {/* Harga & Batas */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>
          HARGA &amp; BATAS PENGGUNAAN
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label className="form-label">Nama Paket</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Harga (Rp / bulan)</label>
            <input
              className="form-input"
              type="number"
              placeholder="0 = Gratis"
              value={form.price ?? ''}
              onChange={e => set('price', e.target.value === '' ? null : Number(e.target.value))}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Kosongkan = pakai harga Landing Settings.</p>
          </div>
          <div>
            <label className="form-label">Maks. Pegawai</label>
            <input
              className="form-input" type="number" min={0} placeholder="Unlimited"
              value={form.max_staff ?? ''}
              onChange={e => set('max_staff', e.target.value === '' ? null : Number(e.target.value))}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Kosongkan = Unlimited</p>
          </div>
          <div>
            <label className="form-label">Maks. Produk / Item</label>
            <input
              className="form-input" type="number" min={0} placeholder="Unlimited"
              value={form.max_products ?? ''}
              onChange={e => set('max_products', e.target.value === '' ? null : Number(e.target.value))}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Kosongkan = Unlimited</p>
          </div>
        </div>

        {/* Status */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, marginBottom: 20,
          padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)'
        }}>
          <input type="checkbox" checked={!!form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16 }} />
          <span>Paket aktif — ditampilkan ke tenant kategori ini</span>
        </label>

        {/* Fitur */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>
          FITUR YANG TERSEDIA
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {Object.entries(featureLabels).map(([key, { label, icon }]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13,
              padding: '8px 12px', borderRadius: 8,
              background: form.features?.[key] ? `${pres.color}12` : 'var(--bg-elevated)',
              border: `1px solid ${form.features?.[key] ? pres.color + '40' : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={!!form.features?.[key]}
                onChange={e => setFeat(key, e.target.checked)}
                style={{ accentColor: pres.color, width: 15, height: 15 }}
              />
              <span>{icon} {label}</span>
            </label>
          ))}
        </div>

        <div className="modal__actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Batal</button>
          <button
            className="btn btn-primary"
            style={{ background: pres.gradient, border: 'none' }}
            onClick={() => onSave(form)}
            disabled={saving}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, categorySlug, onEdit }) {
  const pres = PRESENTATION[plan.plan_key] || PRESENTATION.free
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']

  return (
    <div className="card" style={{
      padding: 0, overflow: 'hidden', position: 'relative',
      border: pres.popular ? `2px solid ${pres.color}` : '1px solid var(--border-subtle)',
      opacity: plan.is_active ? 1 : 0.55,
      transition: 'transform 0.18s, box-shadow 0.18s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      {pres.popular && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: pres.gradient, color: '#fff',
          fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99, letterSpacing: 0.5
        }}>POPULER</div>
      )}
      {!plan.is_active && (
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: '#6b728020', color: '#6b7280',
          fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99
        }}>⏸ NONAKTIF</div>
      )}

      {/* Header */}
      <div style={{ background: pres.gradient, padding: '24px 24px 20px', color: '#fff' }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>{pres.icon}</div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, margin: '0 0 4px' }}>{plan.name}</h3>
        <p style={{ fontSize: 12, opacity: 0.85, margin: '0 0 14px' }}>{pres.tagline}</p>
        <div>
          <span style={{ fontSize: 30, fontWeight: 600 }}>
            {plan.price === null ? 'Global' : fmtPrice(plan.price)}
          </span>
          {plan.price > 0 && <span style={{ fontSize: 13, opacity: 0.8 }}> / bulan</span>}
        </div>
      </div>

      {/* Limits */}
      <div style={{ padding: '18px 20px 0' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>BATAS PENGGUNAAN</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {[
            { label: 'Pegawai', value: fmt(plan.max_staff), icon: '👤' },
            { label: 'Produk/Item', value: fmt(plan.max_products), icon: '📦' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-elevated)', borderRadius: 10,
              padding: '10px 12px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: pres.color }}>{item.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>FITUR</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
          {Object.entries(featureLabels).map(([key, { label, icon }]) => {
            const active = plan.features?.[key]
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: active ? 1 : 0.35, fontSize: 12 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: active ? `${pres.color}20` : 'var(--bg-elevated)',
                  color: active ? pres.color : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, flexShrink: 0
                }}>
                  {active ? '✓' : '✕'}
                </span>
                <span>{icon} {label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action */}
      <div style={{ padding: '0 20px 18px' }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', fontWeight: 600 }}
          onClick={() => onEdit(plan)}
        >
          ✏️ Edit Paket
        </button>
      </div>
    </div>
  )
}

// ─── Matrix View ──────────────────────────────────────────────────────────────
function MatrixView({ plans, categorySlug, onEdit }) {
  const featureLabels = FEATURES_BY_CATEGORY[categorySlug] || FEATURES_BY_CATEGORY['toko-retail']

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ marginBottom: 0, minWidth: 500 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 200, position: 'sticky', left: 0, background: 'var(--bg-surface)', zIndex: 1 }}>Fitur / Limit</th>
              {plans.map(plan => {
                const pres = PRESENTATION[plan.plan_key] || PRESENTATION.free
                return (
                  <th key={plan.id} style={{ textAlign: 'center', minWidth: 150 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: pres.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18
                      }}>{pres.icon}</div>
                      <span style={{ fontWeight: 600 }}>{plan.name}</span>
                      <span style={{ fontSize: 11, color: pres.color, fontWeight: 600 }}>
                        {plan.price === null ? 'Global' : fmtPrice(plan.price)}/bln
                      </span>
                      {!plan.is_active && <span style={{ fontSize: 10, color: '#6b7280', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>⏸ Nonaktif</span>}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* Limits */}
            <tr style={{ background: 'var(--bg-elevated)' }}>
              <td colSpan={plans.length + 1} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1 }}>
                BATAS PENGGUNAAN
              </td>
            </tr>
            {[
              { key: 'max_staff',    label: '👤 Maks. Pegawai' },
              { key: 'max_products', label: '📦 Maks. Produk/Item' },
            ].map(({ key, label }) => (
              <tr key={key}>
                <td style={{ fontWeight: 500, fontSize: 13, position: 'sticky', left: 0, background: 'var(--bg-surface)' }}>{label}</td>
                {plans.map(plan => {
                  const pres = PRESENTATION[plan.plan_key] || PRESENTATION.free
                  return (
                    <td key={plan.id} style={{ textAlign: 'center', fontWeight: 600, color: pres.color }}>
                      {fmt(plan[key])}
                    </td>
                  )
                })}
              </tr>
            ))}

            {/* Features */}
            <tr style={{ background: 'var(--bg-elevated)' }}>
              <td colSpan={plans.length + 1} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1 }}>
                FITUR
              </td>
            </tr>
            {Object.entries(featureLabels).map(([key, { label, icon }]) => (
              <tr key={key}>
                <td style={{ fontSize: 13, position: 'sticky', left: 0, background: 'var(--bg-surface)' }}>{icon} {label}</td>
                {plans.map(plan => (
                  <td key={plan.id} style={{ textAlign: 'center' }}>
                    {plan.features?.[key]
                      ? <span style={{ color: (PRESENTATION[plan.plan_key] || PRESENTATION.free).color, fontSize: 18, fontWeight: 600 }}>✓</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 16, opacity: 0.4 }}>—</span>
                    }
                  </td>
                ))}
              </tr>
            ))}

            {/* Edit row */}
            <tr style={{ background: 'var(--bg-elevated)' }}>
              <td style={{ fontWeight: 600, fontSize: 13, position: 'sticky', left: 0, background: 'var(--bg-elevated)' }}>⚙️ Aksi</td>
              {plans.map(plan => (
                <td key={plan.id} style={{ textAlign: 'center', padding: '12px 8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11 }}
                    onClick={() => onEdit(plan)}
                    title="Edit Paket"
                  >✏️</button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'toko-retail',      name: 'Toko Retail',       icon: '🛒', color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { slug: 'budidaya-ikan',    name: 'Budidaya Ikan',     icon: '🐟', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  { slug: 'budidaya-tanaman', name: 'Budidaya Tanaman',  icon: '🌱', color: '#84cc16', gradient: 'linear-gradient(135deg,#84cc16,#4d7c0f)' },
  { slug: 'kuliner',          name: 'Kuliner',           icon: '🍽️', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)' },
]

export default function PackagesFeatures() {
  const [activeCategory, setActiveCategory] = useState('toko-retail')
  const [plansByCategory, setPlansByCategory] = useState({}) // cache per slug
  const [loading, setLoading] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeView, setActiveView] = useState('cards')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPlans = async (slug) => {
    if (plansByCategory[slug]) return // already cached
    setLoading(true)
    try {
      const res = await api.get('/admin/subscription-plans', { params: { category: slug } })
      setPlansByCategory(prev => ({ ...prev, [slug]: res.data }))
    } catch (e) {
      console.error(e)
      showToast('Gagal memuat data paket', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load on mount and on category switch
  useEffect(() => { fetchPlans(activeCategory) }, [activeCategory])

  const handleCategorySwitch = (slug) => {
    setActiveCategory(slug)
    setEditPlan(null)
  }

  const handleSave = async (updated) => {
    setSaving(true)
    try {
      const res = await api.put(`/admin/subscription-plans/${updated.id}`, {
        name:         updated.name,
        price:        updated.price,
        max_staff:    updated.max_staff,
        max_products: updated.max_products,
        features:     updated.features,
        is_active:    updated.is_active,
      })
      // Update cache
      setPlansByCategory(prev => ({
        ...prev,
        [activeCategory]: prev[activeCategory].map(p => p.id === updated.id ? res.data : p)
      }))
      setEditPlan(null)
      showToast('Paket berhasil disimpan ✓')
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menyimpan perubahan paket', 'error')
    } finally {
      setSaving(false)
    }
  }

  const plans = plansByCategory[activeCategory] || []
  const activeCat = CATEGORIES.find(c => c.slug === activeCategory) || CATEGORIES[0]

  return (
    <div className="animate-fade-in">
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          animation: 'slideFadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2 className="page-title">Packages &amp; Features</h2>
          <p className="page-sub">Kelola paket langganan, harga, dan fitur per kategori bisnis.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${activeView === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('cards')}
          >📦 Kartu Paket</button>
          <button
            className={`btn btn-sm ${activeView === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('matrix')}
          >📋 Matriks Fitur</button>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategorySwitch(cat.slug)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                transition: 'all 0.18s',
                background: isActive ? cat.gradient : 'var(--bg-elevated)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                boxShadow: isActive ? `0 4px 14px ${cat.color}40` : 'none',
                transform: isActive ? 'translateY(-1px)' : 'none',
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span>{cat.name}</span>
              {plansByCategory[cat.slug] && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  borderRadius: 99, fontSize: 11, fontWeight: 600,
                  padding: '1px 7px', minWidth: 20, textAlign: 'center'
                }}>
                  {plansByCategory[cat.slug].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Category Banner ── */}
      <div style={{
        background: activeCat.gradient, borderRadius: 14, padding: '16px 20px',
        color: '#fff', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 36 }}>{activeCat.icon}</span>
        <div>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, opacity: 0.75, letterSpacing: 1 }}>KATEGORI AKTIF</p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{activeCat.name}</p>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8, marginTop: 2 }}>
            {plans.length} paket dikonfigurasi &nbsp;·&nbsp; Fitur disesuaikan per kategori
          </p>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14 }}>Memuat paket untuk {activeCat.name}...</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && plans.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          background: 'var(--bg-elevated)', borderRadius: 14,
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>Belum ada paket untuk {activeCat.name}</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Seed data paket terlebih dahulu via artisan atau database seeder.</p>
        </div>
      )}

      {/* ── CARDS VIEW ── */}
      {!loading && plans.length > 0 && activeView === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              categorySlug={activeCategory}
              onEdit={setEditPlan}
            />
          ))}
        </div>
      )}

      {/* ── MATRIX VIEW ── */}
      {!loading && plans.length > 0 && activeView === 'matrix' && (
        <MatrixView
          plans={plans}
          categorySlug={activeCategory}
          onEdit={setEditPlan}
        />
      )}

      {/* ── Edit Modal ── */}
      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          categorySlug={activeCategory}
          onClose={() => !saving && setEditPlan(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  )
}
