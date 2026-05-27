import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'

const ALL_PERMS = [
  { key: 'users',        label: 'Kelola Pengguna' },
  { key: 'categories',   label: 'Kelola Kategori' },
  { key: 'tenants',      label: 'Kelola Tenant' },
  { key: 'logs',         label: 'Lihat Log Aktivitas' },
  { key: 'admins',       label: 'Kelola Admin' },
  { key: 'subscriptions', label: 'Subscription & Billing' },
  { key: 'packages',     label: 'Packages & Features' },
  { key: 'finance',      label: 'Keuangan Platform' },
  { key: 'support',      label: 'Support Tickets' },
]

export default function SaasRoles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', permissions: [] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = () => {
    setLoading(true)
    api.get('/saas-roles')
      .then(r => setRoles(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const togglePerm = (key) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key]
    }))
  }

  const handleEdit = (role) => {
    setEditingId(role.id)
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    })
    setError('')
    setShow(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { setError('Nama Role harus diisi'); return }
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await api.put(`/saas-roles/${editingId}`, form)
      } else {
        await api.post('/saas-roles', form)
      }
      fetchRoles()
      setShow(false)
      setForm({ name: '', description: '', permissions: [] })
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Gagal menyimpan role')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus role ini?')) return
    try {
      await api.delete(`/saas-roles/${id}`)
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus role')
    }
  }

  const filtered = roles.filter(r => {
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
  })

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">SaaS Roles & Permissions</h2>
            <p className="page-sub">{roles.length} role terdaftar</p>
          </div>
          <button
            id="btn-add-role"
            className="btn btn-primary"
            onClick={() => {
              setShow(true)
              setEditingId(null)
              setError('')
              setForm({ name: '', description: '', permissions: [] })
            }}
          >
            + Tambah Role
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="input-search-roles"
              className="form-input search-input"
              placeholder="Cari nama role atau deskripsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Role</th>
                <th>Deskripsi</th>
                <th>Permissions</th>
                <th>Jumlah Admin</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                      <span>Memuat data role...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((role, i) => (
                <tr key={role.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                  <td>
                    <span className="badge badge-violet" style={{ fontSize: 13, fontWeight: 600, padding: '4px 10px' }}>
                      {role.name}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{role.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 450 }}>
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.map(p => {
                          const pm = ALL_PERMS.find(x => x.key === p)
                          return <span key={p} className="badge badge-gray" style={{ fontSize: 10 }}>{pm?.label || p}</span>
                        })
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tidak ada permission</span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {role.users_count || 0} Admin
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        id={`btn-edit-role-${role.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEdit(role)}
                        style={{ color: 'var(--primary-500)' }}
                        title="Edit Role"
                      >
                        ✏
                      </button>
                      <button
                        id={`btn-del-role-${role.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger-400)' }}
                        onClick={() => handleDelete(role.id)}
                        title="Hapus Role"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    Tidak ada role ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">{editingId ? 'Edit Role' : 'Tambah Role Baru'}</h3>
            {error && <div className="auth-alert auth-alert--error" style={{ marginBottom: 12 }}><span>⚠</span> {error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Nama Role</label>
                <input
                  className="form-input"
                  placeholder="Misal: Finance Admin, Support Staff"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <input
                  className="form-input"
                  placeholder="Penjelasan singkat mengenai peran role ini"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Permissions</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 10,
                  maxHeight: 250,
                  overflowY: 'auto'
                }}>
                  {ALL_PERMS.map(p => (
                    <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="checkbox"
                        id={`perm-${p.key}`}
                        checked={form.permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        style={{ width: 16, height: 16, accentColor: 'var(--primary-500)', cursor: 'pointer' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal__actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShow(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</> : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
