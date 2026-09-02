import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import './Shared.css'

// ─── Generic master-data section ──────────────────────────────────────────────
function MasterSection({ title, emoji, tenantId, endpoint, fields }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)   // null = form hidden, {} = new, {id,...} = edit
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/retail-admin/${endpoint}?tenant_id=${tenantId}`)
      setItems(res.data || [])
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [tenantId, endpoint])

  useEffect(() => { fetch() }, [fetch])

  const openNew = () => {
    const blank = {}
    fields.forEach(f => (blank[f.key] = ''))
    setForm(blank)
    setEditItem({})
  }

  const openEdit = (item) => {
    const f = {}
    fields.forEach(ff => (f[ff.key] = item[ff.key] ?? ''))
    setForm(f)
    setEditItem(item)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem?.id) {
        await api.put(`/retail-admin/${endpoint}/${editItem.id}?tenant_id=${tenantId}`, form)
      } else {
        await api.post(`/retail-admin/${endpoint}?tenant_id=${tenantId}`, form)
      }
      setEditItem(null)
      fetch()
    } catch (err) {
      alert('Gagal menyimpan: ' + (err?.response?.data?.message || err.message))
    } finally { setSaving(false) }
  }

  const destroy = async (id) => {
    if (!window.confirm('Hapus item ini?')) return
    try {
      await api.delete(`/retail-admin/${endpoint}/${id}?tenant_id=${tenantId}`)
      fetch()
    } catch { alert('Gagal menghapus.') }
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '12px 12px 0 0',
      }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{emoji}</span> {title}
          <span style={{
            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
            borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 600,
            color: 'var(--text-muted)', marginLeft: 4
          }}>{items.length}</span>
        </h3>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Tambah</button>
      </div>

      {/* Inline Add/Edit Form */}
      {editItem !== null && (
        <form onSubmit={save} style={{
          padding: '14px 20px',
          background: 'rgba(59,130,246,0.04)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap'
        }}>
          {fields.map(f => (
            <div key={f.key} style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                {f.label}
              </label>
              <input
                className="form-input"
                style={{ height: 36, fontSize: 13 }}
                placeholder={f.placeholder || f.label}
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.required !== false}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? '...' : editItem?.id ? 'Simpan' : 'Tambah'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditItem(null)}>Batal</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div style={{ padding: '0 20px 16px' }}>
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Memuat...</p>
        ) : items.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Belum ada data. Klik <strong style={{ fontWeight: 600 }}>+ Tambah</strong> untuk menambahkan.
          </p>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                {fields.map(f => <th key={f.key}>{f.label}</th>)}
                <th style={{ textAlign: 'right', width: 120 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-primary)', fontSize: 12 }}>#{item.id}</td>
                  {fields.map(f => (
                    <td key={f.key} style={{ fontWeight: f.key === fields[0].key ? 600 : 400 }}>
                      {item[f.key] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>—</span>}
                    </td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)} title="Edit">✏️</button>
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--danger-400)' }}
                        onClick={() => destroy(item.id)}
                        title="Hapus"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Master data config per business category ─────────────────────────────────
const RETAIL_SECTIONS = [
  {
    key: 'categories',
    title: 'Kategori Produk',
    emoji: '🏷️',
    endpoint: 'categories',
    fields: [{ key: 'name', label: 'Nama Kategori', placeholder: 'cth. Minuman', required: true }]
  },
  {
    key: 'units',
    title: 'Satuan',
    emoji: '📏',
    endpoint: 'units',
    fields: [{ key: 'name', label: 'Nama Satuan', placeholder: 'cth. Pcs, Kg, Liter', required: true }]
  },
  {
    key: 'expense-categories',
    title: 'Kategori Pengeluaran',
    emoji: '💸',
    endpoint: 'expense-categories',
    fields: [{ key: 'name', label: 'Nama Kategori', placeholder: 'cth. Listrik, Gaji', required: true }]
  },
]

const CAT_META = {
  'Toko Retail':      { emoji: '🛒', color: '#3b82f6', route: '/retail/dashboard', sections: RETAIL_SECTIONS },
  'Budidaya Hewan':    { emoji: '🐟', color: '#10b981', route: '/budidaya/dashboard', sections: [] },
  'Budidaya Tanaman': { emoji: '🌱', color: '#84cc16', route: '/budidaya/dashboard', sections: [] },
  'Jasa':             { emoji: '🔧', color: '#8b5cf6', route: '/jasa/dashboard', sections: [] },
  'Seller':           { emoji: '📦', color: '#6366f1', route: '/seller/dashboard', sections: [] },
  'Kuliner':          { emoji: '🍱', color: '#ec4899', route: '/kuliner/admin', sections: [] },
  'Manufaktur':       { emoji: '🏭', color: '#f59e0b', route: '/coming-soon', sections: [] },
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminRetailView() {
  const { categoryName } = useParams()   // URL-encoded category name
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(categoryName || '')
  const meta = CAT_META[decodedName] || { emoji: '🏢', color: '#64748b', sections: [] }

  const [tenants, setTenants] = useState([])
  const [tenantId, setTenantId] = useState('')

  useEffect(() => {
    api.get('/tenants')
      .then(res => {
        const list = (res.data?.data || res.data || []).filter(t => {
          if (!decodedName || decodedName === 'Toko Retail') {
            return !t.business_category || t.business_category?.name === decodedName || t.business_category?.slug === 'toko-retail'
          }
          return t.business_category?.name === decodedName || t.business_category?.slug === decodedName.toLowerCase()
        })
        setTenants(list)
        if (list.length > 0) setTenantId(list[0].tenant_id)
      })
      .catch(() => {})
  }, [decodedName])

  return (
    <div className="admin-content" style={{ maxWidth: 1100 }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/categories')}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Kembali
          </button>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${meta.color}18`, border: `1.5px solid ${meta.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}
          >
            {meta.emoji}
          </div>
          <div>
            <h2 className="page-title" style={{ marginBottom: 2 }}>
              Developer View — {decodedName}
            </h2>
            <p className="page-sub">Akses manajemen data dan sistem operasional kategori ini.</p>
          </div>
        </div>

        {/* Tenant selector */}
        {tenants.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Tenant:
            </label>
            <select
              className="form-input"
              style={{ height: 36, minWidth: 200, fontSize: 13 }}
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
            >
              {tenants.map(t => (
                <option key={t.tenant_id} value={t.tenant_id}>
                  {t.name || t.tenant_id} ({t.tenant_id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Dev badge ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', marginBottom: 24,
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 10, fontSize: 13,
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Mode <strong style={{ color: '#f59e0b' }}>Developer / Super Admin</strong> — Kelola data atau masuk ke dashboard aplikasi tenant.
          {tenantId && <span> Data tenant terpilih: <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>{tenantId}</code></span>}
        </span>
      </div>

      {/* ── Sections ── */}
      {meta.sections.length === 0 ? (
        <div className="card" style={{ padding: '48px 32px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: `${meta.color}15`, border: `2px solid ${meta.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px'
          }}>
            {meta.emoji}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Aplikasi Modul {decodedName}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Modul <strong>{decodedName}</strong> menggunakan sistem dashboard terpadu mandiri. Anda dapat langsung membuka dashboard operasional aplikasi ini di bawah:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {meta.route && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(meta.route)}
                style={{ padding: '10px 20px', fontWeight: 600, fontSize: 14 }}
              >
                🚀 Buka Dashboard {decodedName} ({meta.route})
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/categories')}
              style={{ padding: '10px 18px', fontSize: 14 }}
            >
              Kembali ke Kelola Kategori
            </button>
          </div>
        </div>
      ) : (
        meta.sections.map(sec => (
          <MasterSection
            key={`${sec.key}-${tenantId}`}
            title={sec.title}
            emoji={sec.emoji}
            tenantId={tenantId}
            endpoint={sec.endpoint}
            fields={sec.fields}
          />
        ))
      )}
    </div>
  )
}
