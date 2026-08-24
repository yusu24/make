import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import './Shared.css'

const DUMMY = [
  { id: 1, name: 'Ahmad Suharto',  email: 'ahmad@retail.com',  role: 'customer', category: 'Toko Retail',   status: 'active',  joined: '2026-04-09' },
  { id: 2, name: 'Siti Rahayu',    email: 'siti@ikan.com',    role: 'customer', category: 'Budidaya Hewan', status: 'active',  joined: '2026-04-08' },
  { id: 3, name: 'Budi Santoso',   email: 'budi@jasa.com',    role: 'customer', category: 'Jasa',          status: 'pending', joined: '2026-04-08' },
  { id: 4, name: 'Dewi Lestari',   email: 'dewi@mftr.com',    role: 'customer', category: 'Manufaktur',    status: 'active',  joined: '2026-04-07' },
  { id: 5, name: 'Rizka Admin',    email: 'rizka@saas.com',   role: 'admin',    category: '-',             status: 'active',  joined: '2026-04-05' },
  { id: 6, name: 'Teguh Prasetyo', email: 'teguh@retail.com', role: 'customer', category: 'Toko Retail',   status: 'active',  joined: '2026-04-04' },
  { id: 7, name: 'Nurul Hidayah',  email: 'nurul@ikan.com',   role: 'customer', category: 'Budidaya Hewan', status: 'inactive',joined: '2026-04-03' },
  { id: 8, name: 'Hendra Wijaya',  email: 'hendra@jasa.com',  role: 'customer', category: 'Jasa',          status: 'active',  joined: '2026-04-01' },
]

const STATUS_BADGE = { active: 'badge-green', pending: 'badge-yellow', inactive: 'badge-gray' }
const ROLE_BADGE   = { admin: 'badge-violet', super_admin: 'badge-red', customer: 'badge-blue' }

export default function Users() {
  const { impersonateUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers]       = useState([])
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [delId, setDelId]       = useState(null)
  const [impersonating, setImpersonating] = useState(null)
  const [categories, setCategories] = useState([])
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/users')
      .then(r => setUsers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    api.get('/categories/public')
      .then(r => setCategories(r.data?.data || []))
      .catch(() => {})
  }, [])

  const handleImpersonate = async (id) => {
    setImpersonating(id)
    try {
      const redirect = await impersonateUser(id)
      navigate(redirect)
    } catch (err) {
      alert('Gagal impersonate: ' + (err.response?.data?.message || err.message))
    } finally {
      setImpersonating(null)
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || u.role === filter || u.status === filter
    return matchSearch && matchFilter
  })

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex,
  } = usePagination(filtered)

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`)
      setUsers(v => v.filter(u => u.id !== id))
    } catch {
      setUsers(v => v.filter(u => u.id !== id)) // optimistic fallback
    }
    setDelId(null)
  }

  const handleToggleStatus = async (id, cur) => {
    const next = cur === 'active' ? 'inactive' : 'active'
    setUsers(v => v.map(u => u.id === id ? { ...u, status: next } : u))
    try { await api.patch(`/users/${id}/status`, { status: next }) } catch {}
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.target)
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      password: fd.get('password'),
      role: 'customer',
      business_category_id: fd.get('business_category_id') || null,
    }
    setSaving(true)
    try {
      const res = await api.post('/users', payload)
      const created = res.data?.data
      const category = categories.find(c => String(c.id) === String(payload.business_category_id))
      setUsers(v => [...v, {
        id: created?.id ?? Date.now(),
        name: payload.name,
        email: payload.email,
        role: 'customer',
        category: category?.name || '-',
        status: 'active',
        joined: new Date().toISOString().slice(0, 10),
      }])
      setShowModal(false)
      e.target.reset()
    } catch (err) {
      setFormError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : (err.response?.data?.message || 'Gagal membuat pengguna'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="page-header">
          <h2 className="page-title">Manajemen Pengguna</h2>
        </div>

      {/* Table Card */}
      <div className="card card-pad" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, margin: 0 }}>👥 Daftar Pengguna Platform</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-wrap" style={{ minWidth: 200, maxWidth: 260 }}>
                <span className="search-icon">🔍</span>
                <input
                  id="input-search-users"
                  className="form-input search-input"
                  placeholder="Cari nama atau email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div style={{ minWidth: 150 }}>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-input"
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button id="btn-add-user" className="btn btn-primary" onClick={() => setShowModal(true)} style={{ height: 38, display: 'flex', alignItems: 'center', gap: 6 }}>
                + Tambah Pengguna
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Kategori Bisnis</th>
                <th>Status</th>
                <th>Bergabung</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{startIndex + i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={getAvatarStyle(u.name || u.email, 32)}>
                        {getInitials(u.name)}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ fontSize: 13 }}>{u.category}</td>
                  <td>
                    <button
                      className={`badge ${STATUS_BADGE[u.status] || 'badge-gray'}`}
                      style={{ cursor: 'pointer', border: 'none', background: undefined }}
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      title="Klik untuk ubah status"
                    >
                      {u.status}
                    </button>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-primary)' }}>{u.joined}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        title="Impersonate (Login sebagai User)"
                        onClick={() => handleImpersonate(u.id)}
                        disabled={impersonating === u.id}
                        style={{ color: 'var(--primary-500)' }}
                      >
                        {impersonating === u.id ? '⏳' : '🔑'}
                      </button>
                      <button id={`btn-edit-user-${u.id}`} className="btn btn-secondary btn-sm" title="Edit">✏</button>
                      <button
                        id={`btn-del-user-${u.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger-400)' }}
                        onClick={() => setDelId(u.id)}
                        title="Hapus"
                      >🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    Tidak ada pengguna ditemukan
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

      {showModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Tambah Pengguna Baru</h3>
            <form onSubmit={handleAddUser} style={{ display:'flex', flexDirection:'column', gap:16, marginTop:16 }}>
              {formError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>
                  {formError}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input name="name" className="form-input" required placeholder="Nama Pengguna" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" className="form-input" required type="email" placeholder="email@contoh.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input name="password" className="form-input" required type="password" minLength={8} placeholder="Minimal 8 karakter" />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori Bisnis</label>
                <select name="business_category_id" className="form-input">
                  <option value="">— Tidak ada / belum ditentukan —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal__actions mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {delId && (
        <div className="modal-overlay" onClick={() => setDelId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Hapus Pengguna?</h3>
            <p className="modal__body">Aksi ini tidak dapat dibatalkan. Pengguna akan dihapus permanen.</p>
            <div className="modal__actions">
              <button id="btn-cancel-del" className="btn btn-secondary" onClick={() => setDelId(null)}>Batal</button>
              <button id="btn-confirm-del" className="btn btn-danger" onClick={() => handleDelete(delId)}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
