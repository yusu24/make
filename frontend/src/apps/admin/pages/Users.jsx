import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  Plus,
  KeyRound,
  Pencil,
  Trash2,
  Store,
  ShieldCheck,
  Package,
  Layers,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Inbox
} from '@/constants/icons'
import './Shared.css'

const STATUS_BADGE = {
  active: 'badge-green',
  pending: 'badge-yellow',
  inactive: 'badge-gray',
}

const ROLE_CONFIG = {
  customer: { label: 'Owner / Pelanggan', badge: 'badge-blue' },
  admin: { label: 'Admin SaaS', badge: 'badge-violet' },
  super_admin: { label: 'Super Admin', badge: 'badge-red' },
  retail_cashier: { label: 'Kasir Retail', badge: 'badge-teal' },
  retail_warehouse: { label: 'Gudang Retail', badge: 'badge-yellow' },
  culinary_waiter: { label: 'Staff Kuliner', badge: 'badge-teal' },
  budidaya_operator: { label: 'Operator Farm', badge: 'badge-teal' },
}

export default function Users() {
  const { impersonate, impersonateUser } = useAuth()
  const navigate = useNavigate()
  
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [delUser, setDelUser] = useState(null)
  const [impersonating, setImpersonating] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    api.get('/users?role=all')
      .then(r => setUsers(r.data?.data || []))
      .catch(err => console.error('Failed to fetch users:', err))
      .finally(() => setLoading(false))
  }

  const fetchCategories = () => {
    api.get('/categories/public')
      .then(r => setCategories(r.data?.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchUsers()
    fetchCategories()
  }, [])

  const handleImpersonate = async (user) => {
    setImpersonating(user.id)
    try {
      const redirect = await impersonateUser(user.id)
      navigate(redirect || '/dashboard')
    } catch (err) {
      alert('Gagal impersonate: ' + (err.response?.data?.message || err.message))
    } finally {
      setImpersonating(null)
    }
  }

  const handleToggleStatus = async (user) => {
    const next = user.status === 'active' ? 'inactive' : 'active'
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: next } : u))
    try {
      await api.patch(`/users/${user.id}/status`, { status: next })
    } catch (err) {
      alert('Gagal mengubah status: ' + (err.response?.data?.message || err.message))
      fetchUsers()
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setFormError('')
    const fd = new FormData(e.target)
    
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      password: fd.get('password'),
      role: fd.get('role') || 'customer',
      business_name: fd.get('business_name'),
      business_category_id: fd.get('business_category_id') || null,
      plan: fd.get('plan') || 'free',
      phone: fd.get('phone') || null,
    }

    setSaving(true)
    try {
      await api.post('/users', payload)
      setShowAddModal(false)
      fetchUsers()
      alert('Pengguna & Tenant berhasil dibuat dan disinkronkan!')
    } catch (err) {
      setFormError(
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : (err.response?.data?.message || 'Gagal membuat pengguna')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!editUser) return
    setFormError('')
    const fd = new FormData(e.target)
    
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      role: fd.get('role'),
      status: fd.get('status'),
      business_name: fd.get('business_name'),
      business_category_id: fd.get('business_category_id') || null,
      plan: fd.get('plan'),
      phone: fd.get('phone') || null,
    }

    if (fd.get('password')) {
      payload.password = fd.get('password')
    }

    setSaving(true)
    try {
      await api.put(`/users/${editUser.id}`, payload)
      setEditUser(null)
      fetchUsers()
      alert('Data pengguna dan tenant berhasil diperbarui!')
    } catch (err) {
      setFormError(
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : (err.response?.data?.message || 'Gagal memperbarui pengguna')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!delUser) return
    try {
      await api.delete(`/users/${delUser.id}`)
      setDelUser(null)
      fetchUsers()
      alert('Pengguna dan data terkait berhasil dihapus.')
    } catch (err) {
      alert('Gagal menghapus pengguna: ' + (err.response?.data?.message || err.message))
    }
  }

  // Filtered List
  const filtered = users.filter(u => {
    const q = search.toLowerCase().trim()
    const matchSearch = !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.tenant_id && u.tenant_id.toLowerCase().includes(q)) ||
      (u.tenant_name && u.tenant_name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q))

    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    const matchCategory = categoryFilter === 'all' || 
      (u.category && u.category.toLowerCase() === categoryFilter.toLowerCase()) ||
      String(u.business_category_id) === String(categoryFilter)

    return matchSearch && matchRole && matchStatus && matchCategory
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
  } = usePagination(filtered, 20)

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── Page Header ── */}
      <div className="page-header mb-2">
        <h2 className="page-title">Manajemen Pengguna</h2>
      </div>

      {/* ── Action Bar below title ── */}
      <div className="flex justify-end gap-2.5 mb-4">
        <button
          className="btn btn-secondary flex items-center gap-1.5"
          onClick={fetchUsers}
          disabled={loading}
          title="Muat ulang data"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
        <button
          className="btn btn-primary flex items-center gap-1.5"
          onClick={() => { setFormError(''); setShowAddModal(true) }}
        >
          <Plus size={16} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="card card-pad" style={{ marginBottom: 16, padding: '16px 20px', borderRadius: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div className="search-wrap" style={{ minWidth: 240, flex: '1 1 260px' }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Cari nama, email, Tenant ID, usaha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 38 }}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              className="form-input"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 140, height: 38, padding: '0 32px 0 12px', fontSize: 13, flex: '1 1 auto' }}
            >
              <option value="all">Semua Peran</option>
              <option value="customer">Owner / Pelanggan</option>
              <option value="admin">Admin SaaS</option>
              <option value="super_admin">Super Admin</option>
              <option value="retail_cashier">Kasir / Staff</option>
            </select>

            <select
              className="form-input"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 130, height: 38, padding: '0 32px 0 12px', fontSize: 13, flex: '1 1 auto' }}
            >
              <option value="all">Semua Status</option>
              <option value="active">🟢 Active</option>
              <option value="pending">🟡 Pending</option>
              <option value="inactive">⚪ Inactive</option>
            </select>

            <select
              className="form-input"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ width: 'auto', minWidth: 140, height: 38, padding: '0 32px 0 12px', fontSize: 13, flex: '1 1 auto' }}
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {(search || roleFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setCategoryFilter('all') }}
                style={{ color: 'var(--primary-600)', fontSize: 12, height: 38, padding: '0 12px', whiteSpace: 'nowrap' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none' }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>#</th>
                <th>Pengguna &amp; Kontak</th>
                <th>Tenant / Usaha Terkait</th>
                <th>Kategori Sektor</th>
                <th>Peran / Role</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Bergabung</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span>Memuat data pengguna &amp; sinkronisasi tenant...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                    <Inbox size={36} className="text-slate-400 mx-auto mb-2" />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Tidak ada pengguna ditemukan</p>
                    <p style={{ fontSize: 13, marginBottom: 12 }}>Coba ubah kata kunci pencarian atau reset filter.</p>
                    {(search || roleFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all') && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setCategoryFilter('all') }}
                      >
                        Reset Filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((u, i) => {
                  const roleMeta = ROLE_CONFIG[u.role] || { label: u.role, badge: 'badge-gray' }
                  const isCustomer = u.role === 'customer'

                  return (
                    <tr key={u.id}>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>
                        {startIndex + i + 1}
                      </td>

                      {/* User & Contact */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={getAvatarStyle(u.name || u.email, 36)}>
                            {getInitials(u.name || u.email)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                              {u.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Mail size={12} /> {u.email}
                              </span>
                              {u.phone && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Phone size={12} /> {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Connected Tenant */}
                      <td>
                        {u.tenant_id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                className="font-mono"
                                style={{
                                  fontSize: 11,
                                  padding: '2px 7px',
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  color: 'var(--primary-700)',
                                  borderRadius: 5,
                                  fontWeight: 600,
                                  letterSpacing: '0.02em'
                                }}
                              >
                                {u.tenant_id}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {u.tenant_name || u.name}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                              <span style={{ textTransform: 'capitalize' }}>Paket: <strong>{u.plan}</strong></span>
                              <button
                                onClick={() => navigate(`/admin/tenants?search=${encodeURIComponent(u.tenant_id)}`)}
                                className="text-indigo-600 hover:text-indigo-800"
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11 }}
                                title="Lihat di Manajemen Tenant"
                              >
                                <span>Kelola Tenant</span>
                                <ExternalLink size={10} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {u.role === 'super_admin' || u.role === 'admin' ? 'Akun Sistem SaaS' : 'Belum terhubung tenant'}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                          {u.category || '-'}
                        </span>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`badge ${roleMeta.badge}`} style={{ fontSize: 11.5, fontWeight: 600 }}>
                          {roleMeta.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`badge ${STATUS_BADGE[u.status] || 'badge-gray'}`}
                          style={{ cursor: 'pointer', border: 'none', fontWeight: 600, fontSize: 11.5 }}
                          onClick={() => handleToggleStatus(u)}
                          title="Klik untuk ubah status aktif/nonaktif"
                        >
                          {u.status === 'active' ? 'Aktif' : u.status === 'pending' ? 'Pending' : 'Nonaktif'}
                        </button>
                      </td>

                      {/* Joined */}
                      <td style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        {u.joined}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Impersonate (Masuk sebagai Pengguna / Tenant ini)"
                            onClick={() => handleImpersonate(u)}
                            disabled={impersonating === u.id}
                            style={{ color: 'var(--primary-600)', height: 32, padding: '0 8px' }}
                          >
                            {impersonating === u.id ? <RefreshCw size={13} className="animate-spin" /> : <KeyRound size={13} />}
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Pengguna &amp; Data Bisnis"
                            onClick={() => { setFormError(''); setEditUser(u) }}
                            style={{ height: 32, padding: '0 8px' }}
                          >
                            <Pencil size={13} />
                          </button>

                          {u.role !== 'super_admin' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Hapus Pengguna &amp; Tenant"
                              onClick={() => setDelUser(u)}
                              style={{ color: 'var(--danger-500)', height: 32, padding: '0 8px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

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

      {/* ── Modal Tambah Pengguna Baru ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: 560, borderRadius: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', padding: 8, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)' }}>
                <Plus size={20} />
              </span>
              <div>
                <h3 className="modal__title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Tambah Pengguna Baru</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Akun pengguna dan entitas tenant bisnis akan dibuat dan terhubung secara otomatis.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Nama Lengkap *</label>
                  <input name="name" className="form-input" required placeholder="Contoh: Budi Pratama" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Email Akun *</label>
                  <input name="email" className="form-input" required type="email" placeholder="budi@usaha.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Password *</label>
                  <input name="password" className="form-input" required type="password" minLength={8} placeholder="Min. 8 karakter" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>No. WhatsApp / HP</label>
                  <input name="phone" className="form-input" placeholder="08123456789" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Peran / Role</label>
                  <select name="role" className="form-input" defaultValue="customer">
                    <option value="customer">Owner / Pelanggan Tenant</option>
                    <option value="admin">Admin SaaS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Paket Langganan</label>
                  <select name="plan" className="form-input" defaultValue="free">
                    <option value="free">Free Trial (3 Hari)</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro (Semua Fitur)</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Nama Toko / Bisnis (Tenant)</label>
                <input name="business_name" className="form-input" placeholder="Nama Bisnis (Opsional, default sama dengan Nama)" />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Kategori Sektor Bisnis</label>
                <select name="business_category_id" className="form-input" defaultValue="">
                  <option value="">— Pilih Kategori Bisnis —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal__actions" style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan & Menghubungkan...' : 'Simpan & Hubungkan Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Edit Pengguna ── */}
      {editUser && (
        <div className="modal-overlay" onClick={() => !saving && setEditUser(null)}>
          <div className="modal" style={{ maxWidth: 560, borderRadius: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ display: 'inline-flex', padding: 8, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-600)' }}>
                <Pencil size={20} />
              </span>
              <div>
                <h3 className="modal__title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Edit Data Pengguna &amp; Tenant</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Perubahan akan disinkronkan langsung ke akun login dan entitas tenant.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Nama Lengkap *</label>
                  <input name="name" defaultValue={editUser.name} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Email Akun *</label>
                  <input name="email" defaultValue={editUser.email} className="form-input" required type="email" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Ganti Password (Opsional)</label>
                  <input name="password" className="form-input" type="password" minLength={8} placeholder="Kosongkan jika tidak diubah" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>No. WhatsApp / HP</label>
                  <input name="phone" defaultValue={editUser.phone || ''} className="form-input" placeholder="08123456789" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Peran / Role</label>
                  <select name="role" className="form-input" defaultValue={editUser.role}>
                    <option value="customer">Owner / Pelanggan Tenant</option>
                    <option value="admin">Admin SaaS</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Status Akun</label>
                  <select name="status" className="form-input" defaultValue={editUser.status}>
                    <option value="active">Active (Aktif)</option>
                    <option value="pending">Pending (Menunggu)</option>
                    <option value="inactive">Inactive (Nonaktif)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Nama Bisnis (Tenant)</label>
                  <input name="business_name" defaultValue={editUser.tenant_name || editUser.name} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Paket Langganan</label>
                  <select name="plan" className="form-input" defaultValue={editUser.plan !== '-' ? editUser.plan : 'free'}>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: 12.5 }}>Kategori Sektor Bisnis</label>
                <select name="business_category_id" className="form-input" defaultValue={editUser.business_category_id || ''}>
                  <option value="">— Tidak ada / belum ditentukan —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal__actions" style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)} disabled={saving}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus Pengguna ── */}
      {delUser && (
        <div className="modal-overlay" onClick={() => setDelUser(null)}>
          <div className="modal" style={{ maxWidth: 440, borderRadius: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
              <span style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', marginBottom: 12 }}>
                <Trash2 size={28} />
              </span>
              <h3 className="modal__title" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Hapus Pengguna &amp; Tenant?</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Anda akan menghapus akun <strong>{delUser.name}</strong> ({delUser.email}).
                {delUser.tenant_id && (
                  <span style={{ display: 'block', marginTop: 8, color: '#dc2626', fontSize: 12.5, fontWeight: 500 }}>
                    ⚠️ Tenant terkait (<strong>{delUser.tenant_id}</strong>) beserta seluruh data transaksinya juga akan dihapus.
                  </span>
                )}
              </p>
            </div>

            <div className="modal__actions" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDelUser(null)} style={{ flex: 1 }}>
                Batal
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser} style={{ flex: 1 }}>
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}