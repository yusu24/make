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
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
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
            Belum ada data. Klik <strong>+ Tambah</strong> untuk menambahkan.
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
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{item.id}</td>
                  {fields.map(f => (
                    <td key={f.key} style={{ fontWeight: f.key === fields[0].key ? 600 : 400 }}>
                      {item[f.key] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>—</span>}
                    </td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>✏️ Edit</button>
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--danger-400)' }}
                        onClick={() => destroy(item.id)}
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
  'Toko Retail':   { emoji: '🛒', color: '#3b82f6', sections: RETAIL_SECTIONS },
  'Budidaya Ikan': { emoji: '🐟', color: '#10b981', sections: [] },
  'Jasa':          { emoji: '🔧', color: '#8b5cf6', sections: [] },
  'Manufaktur':    { emoji: '🏭', color: '#f59e0b', sections: [] },
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminRetailView() {
  const { categoryName } = useParams()   // URL-encoded category name
  const navigate = useNavigate()
  const decodedName = decodeURIComponent(categoryName)

  // For now, tenantId is the admin's own (dev context: TN-001)
  // To support selecting a specific tenant you could add a <select> here
  const [tenantId, setTenantId] = useState('TN-001')
  const [tenants, setTenants] = useState([])

  useEffect(() => {
    // Fetch tenants with this business_category so admin can switch
    api.get('/tenants').then(r => {
      const list = (r.data?.data || r.data || []).filter(t =>
        t.business_category === decodedName || !t.business_category
      )
      setTenants(list)
      if (list.length > 0 && !list.find(t => t.tenant_id === tenantId)) {
        setTenantId(list[0].tenant_id)
      }
    }).catch(() => {})
  }, [decodedName])

  const meta = CAT_META[decodedName] || { emoji: '🏢', color: '#6b7280', sections: [] }

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/categories')}
            style={{ padding: '8px 14px' }}
          >
            ← Kembali
          </button>
          <div
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: meta.color + '22',
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
            <p className="page-sub">Full akses data master kategori bisnis ini. Gunakan dengan bijak.</p>
          </div>
        </div>

        {/* Tenant selector */}
        {tenants.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
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
          Mode <strong style={{ color: '#f59e0b' }}>Developer / Super Admin</strong> — Semua perubahan langsung tersimpan ke database.
          {tenantId && <span> Data tenant: <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>{tenantId}</code></span>}
        </span>
      </div>

      {/* ── Sections ── */}
      {meta.sections.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🚧</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Developer view untuk kategori <strong>{decodedName}</strong> belum tersedia.
          </p>
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
