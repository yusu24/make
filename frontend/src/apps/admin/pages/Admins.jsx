import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import Modal from '../../../components/Modal'
import { useAuth } from '../../../contexts/AuthContext'
import { KeyRound, Edit3, Trash2 } from 'lucide-react'
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
  const { impersonateUser } = useAuth()
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

  const handleImpersonate = async (id) => {
    if (!confirm('Apakah Anda yakin ingin login sebagai administrator ini?')) return
    try {
      const redirect = await impersonateUser(id)
      window.location.href = redirect
    } catch (err) {
      alert('Gagal impersonate: ' + (err.response?.data?.message || err.message))
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

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus admin ini?')) return
    try {
      await api.delete(`/admins/${id}`)
      fetchData()
    } catch (err) {
      alert('Gagal menghapus admin: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          saas_role_id: form.saas_role_id || null
        }
        if (form.password) payload.password = form.password
        await api.put(`/admins/${editingId}`, payload)
      } else {
        await api.post('/admins', form)
      }
      setShow(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data admin')
    } finally {
      setSaving(false)
    }
  }

  const filtered = admins.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  )

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered)

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header mb-4">
          <h2 className="page-title">Manajemen Admin</h2>
        </div>

        {/* Table Card */}
        <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none', transform: 'none', transition: 'none' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div className="search-wrap" style={{ minWidth: 200, maxWidth: 280, flex: 1 }}>
                <span className="search-icon">🔍</span>
                <input
                  id="input-search-admins"
                  className="form-input search-input"
                  placeholder="Cari nama atau email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                id="btn-add-admin"
                className="btn btn-primary"
                style={{ height: 38, display: 'flex', alignItems: 'center', gap: 6 }}
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
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
                        <div style={getAvatarStyle(admin.name || admin.email, 32)}>
                          {getInitials(admin.name)}
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{admin.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{admin.email}</td>
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
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          id={`btn-impersonate-admin-${admin.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleImpersonate(admin.id)}
                          title="Login sebagai Admin ini"
                          style={{ height: 30, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '0 8px' }}
                        >
                          <KeyRound size={12} />
                          <span>Login</span>
                        </button>

                        <button
                          id={`btn-edit-admin-${admin.id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(admin)}
                          disabled={admin.role === 'super_admin'}
                          style={{ height: 30, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '0 8px', opacity: admin.role === 'super_admin' ? 0.5 : 1 }}
                          title={admin.role === 'super_admin' ? 'Super Admin tidak bisa diedit' : 'Edit Admin'}
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>

                        {admin.role !== 'super_admin' && (
                          <button
                            id={`btn-del-admin-${admin.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ height: 30, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '0 8px', color: '#dc2626' }}
                            onClick={() => handleDelete(admin.id)}
                            title="Hapus Admin"
                          >
                            <Trash2 size={12} />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
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
      </div>

      {show && (
        <Modal 
          isOpen={show} 
          onClose={() => setShow(false)} 
          title={editingId ? 'Edit Administrator' : 'Tambah Administrator Baru'}
          maxWidth="540px"
        >
          {error && <div className="auth-alert auth-alert--error" style={{ marginBottom: 16 }}><span>⚠</span> {error}</div>}
          <form id="form-add-admin" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Nama Lengkap</label>
                <input
                  className="form-input"
                  placeholder="Nama admin"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Email</label>
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
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>{editingId ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}</label>
              <input
                className="form-input"
                type="password"
                placeholder={editingId ? 'Min. 8 karakter (opsional)' : 'Min. 8 karakter'}
                required={!editingId}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, display: 'block' }}>Pilih Role SaaS</label>
              <select
                className="form-input"
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
            <div className="modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
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
                {saving ? 'Menyimpan...' : 'Simpan Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
