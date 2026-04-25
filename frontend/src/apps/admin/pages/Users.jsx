import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'

const DUMMY = [
  { id: 1, name: 'Ahmad Suharto',  email: 'ahmad@retail.com',  role: 'customer', category: 'Toko Retail',   status: 'active',  joined: '2026-04-09' },
  { id: 2, name: 'Siti Rahayu',    email: 'siti@ikan.com',    role: 'customer', category: 'Budidaya Ikan', status: 'active',  joined: '2026-04-08' },
  { id: 3, name: 'Budi Santoso',   email: 'budi@jasa.com',    role: 'customer', category: 'Jasa',          status: 'pending', joined: '2026-04-08' },
  { id: 4, name: 'Dewi Lestari',   email: 'dewi@mftr.com',    role: 'customer', category: 'Manufaktur',    status: 'active',  joined: '2026-04-07' },
  { id: 5, name: 'Rizka Admin',    email: 'rizka@saas.com',   role: 'admin',    category: '-',             status: 'active',  joined: '2026-04-05' },
  { id: 6, name: 'Teguh Prasetyo', email: 'teguh@retail.com', role: 'customer', category: 'Toko Retail',   status: 'active',  joined: '2026-04-04' },
  { id: 7, name: 'Nurul Hidayah',  email: 'nurul@ikan.com',   role: 'customer', category: 'Budidaya Ikan', status: 'inactive',joined: '2026-04-03' },
  { id: 8, name: 'Hendra Wijaya',  email: 'hendra@jasa.com',  role: 'customer', category: 'Jasa',          status: 'active',  joined: '2026-04-01' },
]

const STATUS_BADGE = { active: 'badge-green', pending: 'badge-yellow', inactive: 'badge-gray' }
const ROLE_BADGE   = { admin: 'badge-violet', super_admin: 'badge-red', customer: 'badge-blue' }

export default function Users() {
  const [users, setUsers]       = useState(DUMMY)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [delId, setDelId]       = useState(null)

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data?.data || DUMMY)).catch(() => {})
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || u.role === filter || u.status === filter
    return matchSearch && matchFilter
  })

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
    const fd = new FormData(e.target)
    const newUser = {
      id: Date.now(),
      name: fd.get('name'),
      email: fd.get('email'),
      role: fd.get('role'),
      category: '-',
      status: 'active',
      joined: new Date().toISOString().slice(0, 10)
    }
    setUsers(v => [...v, newUser])
    setShowModal(false)
    try { await api.post('/users', newUser) } catch {}
  }

  return (
    <>
      <div className="animate-fade-in">
        {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Manajemen Pengguna</h2>
          <p className="page-sub">{users.length} total pengguna terdaftar</p>
        </div>
        <button id="btn-add-user" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Tambah Pengguna
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="input-search-users"
            className="form-input search-input"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['all','customer','admin','active','pending','inactive'].map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pengguna</th>
              <th>Role</th>
              <th>Kategori Bisnis</th>
              <th>Status</th>
              <th>Bergabung</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id}>
                <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{
                      background: u.role === 'admin' || u.role === 'super_admin'
                        ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                        : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                      width: 32, height: 32, fontSize: 11
                    }}>
                      {u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{u.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role}</span></td>
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
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.joined}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button id={`btn-edit-user-${u.id}`} className="btn btn-ghost btn-sm" title="Edit">✏</button>
                    <button
                      id={`btn-del-user-${u.id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger-400)' }}
                      onClick={() => setDelId(u.id)}
                      title="Hapus"
                    >🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                  Tidak ada pengguna ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Tambah Pengguna Baru</h3>
            <form onSubmit={handleAddUser} style={{ display:'flex', flexDirection:'column', gap:16, marginTop:16 }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input name="name" className="form-input" required placeholder="Nama Pengguna" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" className="form-input" required type="email" placeholder="email@contoh.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select name="role" className="form-select" required>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="modal__actions mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
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
