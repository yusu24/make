import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
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

export default function Admins() {
  const [admins, setAdmins] = useState([])
  const [roles, setRoles] = useState([])
  const [show, setShow]     = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]     = useState({ name: '', email: '', password: '', saas_role_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [adminsRes, rolesRes] = await Promise.all([
        api.get('/admins'),
        api.get('/saas-roles')
      ])
      setAdmins(adminsRes.data?.data || [])
      setRoles(rolesRes.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (admin) => {
    setEditingId(admin.id)
    setForm({
      name: admin.name,
      email: admin.email,
      password: '',
      saas_role_id: admin.saas_role_id || ''
    })
    setError('')
    setShow(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || (!editingId && !form.password)) {
      setError('Lengkapi semua field')
      return
    }
    setSaving(true)
    setError('')

    const selectedRole = roles.find(r => r.id === parseInt(form.saas_role_id))

    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: 'admin',
          saas_role_id: form.saas_role_id ? parseInt(form.saas_role_id) : null,
          password: form.password || undefined
        })
        
        setAdmins(v => v.map(a => a.id === editingId ? {
          ...a,
          name: form.name,
          email: form.email,
          saas_role_id: form.saas_role_id ? parseInt(form.saas_role_id) : null,
          saas_role: selectedRole ? selectedRole.name : '-',
          permissions: selectedRole ? (selectedRole.permissions || []) : []
        } : a))
      } else {
        const r = await api.post('/admins', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'admin',
          saas_role_id: form.saas_role_id ? parseInt(form.saas_role_id) : null
        })
        const newAdmin = r.data?.data
        
        setAdmins(v => [...v, {
          id: newAdmin?.id || Date.now(),
          name: form.name,
          email: form.email,
          role: 'admin',
          status: 'active',
          joined: new Date().toISOString().slice(0, 10),
          saas_role_id: form.saas_role_id ? parseInt(form.saas_role_id) : null,
          saas_role: selectedRole ? selectedRole.name : '-',
          permissions: selectedRole ? (selectedRole.permissions || []) : []
        }])
      }
      setShow(false)
      setForm({ name: '', email: '', password: '', saas_role_id: '' })
      setEditingId(null)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal menyimpan admin')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus admin ini?')) return
    setAdmins(v => v.filter(a => a.id !== id))
    try {
      await api.delete(`/admins/${id}`)
    } catch (err) {
      fetchData() // refresh on error
    }
  }

  const filtered = admins.filter(a => {
    const q = search.toLowerCase()
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
  })

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered)

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Manajemen Admin</h2>
            <p className="page-sub">{admins.length} admin terdaftar</p>
          </div>
          <button
            id="btn-add-admin"
            className="btn btn-primary"
            onClick={() => {
              setShow(true)
              setEditingId(null)
              setError('')
              setForm({ name: '', email: '', password: '', saas_role_id: '' })
            }}
          >
            + Tambah Admin
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="input-search-admins"
              className="form-input search-input"
              placeholder="Cari nama atau email..."
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
                <th>Admin</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                      <span>Memuat data admin...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.map((admin, i) => (
                <tr key={admin.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{startIndex + i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{
                        background: admin.role === 'super_admin'
                          ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                          : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                        width: 32, height: 32, fontSize: 11
                      }}>
                        {admin.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{admin.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${admin.role === 'super_admin' ? 'badge-red' : 'badge-violet'}`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : (admin.saas_role || 'Admin')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>
                      {admin.role === 'super_admin' ? (
                        <span className="badge badge-red" style={{ fontSize: 10 }}>Semua Akses (Super Admin)</span>
                      ) : (admin.permissions && admin.permissions.length > 0) ? (
                        admin.permissions.map(p => {
                          const pm = ALL_PERMS.find(x => x.key === p)
                          return <span key={p} className="badge badge-violet" style={{ fontSize: 10 }}>{pm?.label || p}</span>
                        })
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tidak ada permission</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${admin.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        id={`btn-edit-admin-${admin.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleEdit(admin)}
                        disabled={admin.role === 'super_admin'}
                        style={{ color: admin.role === 'super_admin' ? 'var(--text-muted)' : 'var(--primary-500)', opacity: admin.role === 'super_admin' ? 0.5 : 1 }}
                        title={admin.role === 'super_admin' ? 'Super Admin tidak bisa diedit' : 'Edit Admin'}
                      >
                        ✏
                      </button>
                      <button
                        id={`btn-del-admin-${admin.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ color: admin.role === 'super_admin' ? 'var(--text-muted)' : 'var(--danger-400)', opacity: admin.role === 'super_admin' ? 0.5 : 1 }}
                        onClick={() => handleDelete(admin.id)}
                        disabled={admin.role === 'super_admin'}
                        title={admin.role === 'super_admin' ? 'Super Admin tidak bisa dihapus' : 'Hapus Admin'}
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
                    Tidak ada admin ditemukan
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

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">{editingId ? 'Edit Admin' : 'Tambah Admin Baru'}</h3>
            {error && <div className="auth-alert auth-alert--error" style={{ marginBottom: 12 }}><span>⚠</span> {error}</div>}
            <form id="form-add-admin" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    className="form-input"
                    placeholder="Nama admin"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="admin@bizora.id"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{editingId ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder={editingId ? 'Min. 8 karakter' : 'Min. 8 karakter'}
                  required={!editingId}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pilih Role SaaS</label>
                <select
                  className="form-select"
                  required
                  value={form.saas_role_id}
                  onChange={e => setForm({ ...form, saas_role_id: e.target.value })}
                >
                  <option value="">-- Pilih Role --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal__actions">
                <button
                  id="btn-cancel-admin"
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShow(false)}
                >
                  Batal
                </button>
                <button
                  id="btn-save-admin"
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</> : 'Simpan Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
