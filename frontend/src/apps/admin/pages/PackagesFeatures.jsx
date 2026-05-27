import { useState } from 'react'
import { createPortal } from 'react-dom'
import './Shared.css'

// ─── Static plan config (can be fetched from API in the future) ───────────────
const INITIAL_PLANS = [
  {
    id: 'free',
    label: 'Free',
    badge: 'badge-gray',
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280, #374151)',
    icon: '🎁',
    price: 0,
    billingCycle: 'bulan',
    tagline: 'Coba tanpa biaya',
    maxUsers: 2,
    maxProducts: 50,
    maxTransactions: 100,
    storageGB: 1,
    features: {
      pos: true,
      inventory: true,
      suppliers: false,
      customers: false,
      reports: false,
      multiUser: false,
      apiAccess: false,
      prioritySupport: false,
      customDomain: false,
      exportExcel: false,
    },
  },
  {
    id: 'basic',
    label: 'Basic',
    badge: 'badge-blue',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    icon: '⭐',
    price: 149000,
    billingCycle: 'bulan',
    tagline: 'Ideal untuk UMKM kecil',
    maxUsers: 5,
    maxProducts: 500,
    maxTransactions: 1000,
    storageGB: 5,
    popular: true,
    features: {
      pos: true,
      inventory: true,
      suppliers: true,
      customers: true,
      reports: true,
      multiUser: false,
      apiAccess: false,
      prioritySupport: false,
      customDomain: false,
      exportExcel: true,
    },
  },
  {
    id: 'pro',
    label: 'Pro',
    badge: 'badge-violet',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    icon: '🚀',
    price: 299000,
    billingCycle: 'bulan',
    tagline: 'Untuk bisnis yang berkembang',
    maxUsers: 20,
    maxProducts: -1, // unlimited
    maxTransactions: -1,
    storageGB: 20,
    features: {
      pos: true,
      inventory: true,
      suppliers: true,
      customers: true,
      reports: true,
      multiUser: true,
      apiAccess: true,
      prioritySupport: true,
      customDomain: true,
      exportExcel: true,
    },
  },
]

const FEATURE_LABELS = {
  pos: { label: 'Kasir (POS)', icon: '🧾' },
  inventory: { label: 'Manajemen Stok', icon: '📦' },
  suppliers: { label: 'Data Supplier', icon: '🚚' },
  customers: { label: 'Data Pelanggan', icon: '👥' },
  reports: { label: 'Laporan Lengkap', icon: '📊' },
  multiUser: { label: 'Multi-User / Kasir', icon: '👨‍💼' },
  apiAccess: { label: 'Akses API', icon: '🔌' },
  prioritySupport: { label: 'Priority Support', icon: '🎧' },
  customDomain: { label: 'Custom Domain', icon: '🌐' },
  exportExcel: { label: 'Export Excel/PDF', icon: '📁' },
}

const fmt = (v) => v === -1 ? 'Unlimited' : v.toLocaleString('id-ID')
const fmtPrice = (v) => v === 0 ? 'Gratis' : `Rp ${v.toLocaleString('id-ID')}`

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditPlanModal({ plan, onClose, onSave }) {
  const [form, setForm] = useState({ ...plan })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setFeat = (key, val) => setForm(f => ({ ...f, features: { ...f.features, [key]: val } }))

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <h3 className="modal__title">✏️ Edit Paket — {plan.label}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Konfigurasi harga, limitasi, dan fitur untuk paket ini.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label className="form-label">Nama Paket</label>
            <input className="form-input" value={form.label} onChange={e => set('label', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Harga (Rp / bulan)</label>
            <input className="form-input" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Maks. Pengguna</label>
            <input className="form-input" type="number" min={-1} value={form.maxUsers} onChange={e => set('maxUsers', Number(e.target.value))} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>-1 = Unlimited</p>
          </div>
          <div>
            <label className="form-label">Maks. Produk</label>
            <input className="form-input" type="number" min={-1} value={form.maxProducts} onChange={e => set('maxProducts', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Maks. Transaksi/bulan</label>
            <input className="form-input" type="number" min={-1} value={form.maxTransactions} onChange={e => set('maxTransactions', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Storage (GB)</label>
            <input className="form-input" type="number" min={0} value={form.storageGB} onChange={e => set('storageGB', Number(e.target.value))} />
          </div>
        </div>

        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text-primary)' }}>Fitur yang Tersedia</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {Object.entries(FEATURE_LABELS).map(([key, { label, icon }]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={!!form.features[key]}
                onChange={e => setFeat(key, e.target.checked)}
                style={{ accentColor: plan.color, width: 16, height: 16 }}
              />
              <span>{icon} {label}</span>
            </label>
          ))}
        </div>

        <div className="modal__actions">
          <button className="btn btn-secondary" onClick={onClose}>Batal</button>
          <button
            className="btn btn-primary"
            style={{ background: plan.gradient, border: 'none' }}
            onClick={() => { onSave(form); onClose() }}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PackagesFeatures() {
  const [plans, setPlans] = useState(INITIAL_PLANS)
  const [editPlan, setEditPlan] = useState(null)
  const [activeView, setActiveView] = useState('cards') // 'cards' | 'matrix'

  const handleSave = (updated) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  // Dummy tenant counts per plan
  const tenantCounts = { free: 12, basic: 38, pro: 14 }

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Packages & Features</h2>
          <p className="page-sub">Konfigurasi paket langganan, harga, dan fitur untuk setiap tier.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${activeView === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('cards')}
          >
            📦 Kartu Paket
          </button>
          <button
            className={`btn btn-sm ${activeView === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveView('matrix')}
          >
            📋 Matriks Fitur
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {plans.map(plan => (
          <div key={plan.id} className="card card-pad" style={{
            background: `linear-gradient(135deg, ${plan.color}18, ${plan.color}08)`,
            border: `1px solid ${plan.color}30`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: plan.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0
              }}>
                {plan.icon}
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Paket {plan.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: plan.color, lineHeight: 1 }}>
                  {tenantCounts[plan.id] ?? 0}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>tenant aktif</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CARDS VIEW ── */}
      {activeView === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} className="card" style={{
              padding: 0, overflow: 'hidden', position: 'relative',
              border: plan.popular ? `2px solid ${plan.color}` : undefined,
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: plan.gradient, color: '#fff',
                  fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 99
                }}>
                  POPULER
                </div>
              )}
              {/* Plan header */}
              <div style={{ background: plan.gradient, padding: '24px 24px 20px', color: '#fff' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{plan.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                  {plan.label}
                </h3>
                <p style={{ fontSize: 12, opacity: 0.85 }}>{plan.tagline}</p>
                <div style={{ marginTop: 16 }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>{fmtPrice(plan.price)}</span>
                  {plan.price > 0 && <span style={{ fontSize: 13, opacity: 0.8 }}> / bulan</span>}
                </div>
              </div>

              {/* Limits */}
              <div style={{ padding: '20px 24px 0' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>
                  BATAS PENGGUNAAN
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Pengguna', value: fmt(plan.maxUsers), icon: '👤' },
                    { label: 'Produk', value: fmt(plan.maxProducts), icon: '📦' },
                    { label: 'Transaksi/bln', value: fmt(plan.maxTransactions), icon: '🧾' },
                    { label: 'Storage', value: `${plan.storageGB} GB`, icon: '💾' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'var(--bg-elevated)', borderRadius: 10,
                      padding: '10px 12px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: plan.color }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 12 }}>
                  FITUR
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {Object.entries(FEATURE_LABELS).map(([key, { label, icon }]) => {
                    const active = plan.features[key]
                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        opacity: active ? 1 : 0.4,
                        fontSize: 13
                      }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: active ? `${plan.color}20` : 'var(--bg-elevated)',
                          color: active ? plan.color : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, flexShrink: 0
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
              <div style={{ padding: '0 24px 20px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => setEditPlan(plan)}
                >
                  ✏️ Edit Paket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MATRIX VIEW ── */}
      {activeView === 'matrix' && (
        <div className="table-wrap table-responsive card card-pad" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 200 }}>Fitur</th>
                {plans.map(plan => (
                  <th key={plan.id} style={{ textAlign: 'center', minWidth: 140 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: plan.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18
                      }}>{plan.icon}</div>
                      <span style={{ fontWeight: 800 }}>{plan.label}</span>
                      <span style={{ fontSize: 11, color: plan.color, fontWeight: 600 }}>{fmtPrice(plan.price)}/bln</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Limits section */}
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <td colSpan={plans.length + 1} style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1 }}>
                  BATAS PENGGUNAAN
                </td>
              </tr>
              {[
                { key: 'maxUsers', label: '👤 Maks. Pengguna' },
                { key: 'maxProducts', label: '📦 Maks. Produk' },
                { key: 'maxTransactions', label: '🧾 Maks. Transaksi/bln' },
                { key: 'storageGB', label: '💾 Storage', suffix: ' GB' },
              ].map(({ key, label, suffix }) => (
                <tr key={key}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{label}</td>
                  {plans.map(plan => (
                    <td key={plan.id} style={{ textAlign: 'center', fontWeight: 700, color: plan.color }}>
                      {key === 'storageGB' ? `${plan[key]}${suffix}` : fmt(plan[key])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Features section */}
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <td colSpan={plans.length + 1} style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1 }}>
                  FITUR
                </td>
              </tr>
              {Object.entries(FEATURE_LABELS).map(([key, { label, icon }]) => (
                <tr key={key}>
                  <td style={{ fontSize: 13 }}>{icon} {label}</td>
                  {plans.map(plan => (
                    <td key={plan.id} style={{ textAlign: 'center' }}>
                      {plan.features[key]
                        ? <span style={{ color: plan.color, fontSize: 18, fontWeight: 900 }}>✓</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 16, opacity: 0.4 }}>—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}

              {/* Edit buttons row */}
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <td style={{ fontWeight: 600, fontSize: 13 }}>⚙️ Konfigurasi</td>
                {plans.map(plan => (
                  <td key={plan.id} style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11 }}
                      onClick={() => setEditPlan(plan)}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
