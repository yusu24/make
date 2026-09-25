import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import Modal from '../../../components/Modal'
import { useAuth } from '../../../contexts/AuthContext'
import {
  KeyRound,
  Pencil,
  Trash2,
  Search,
  Plus,
  Shield,
  Users,
  CheckCircle2,
  RefreshCw,
  UserCheck
} from '@/constants/icons'
import StatScoreCard from '@/components/ui/StatScoreCard'
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

  const superAdminCount = admins.filter(a => a.role === 'super_admin').length
  const operationalAdminCount = admins.filter(a => a.role !== 'super_admin').length
  const activeCount = admins.filter(a => a.status === 'active').length

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
    <div className="animate-fade-in space-y-6">
      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchData}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang data admin"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
          <button
            id="btn-add-admin"
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all"
            onClick={() => {
              setShow(true)
              setEditingId(null)
              setError('')
              setForm({ name: '', email: '', password: '', saas_role_id: '' })
            }}
          >
            <Plus size={15} />
            <span>Tambah Admin</span>
          </button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatScoreCard
          title="TOTAL ADMINISTRATOR"
          value={admins.length}
          icon={Users}
          statusBadge={{ text: "Terdaftar", color: "blue" }}
          subtitle="Populasi admin sistem"
          progressBar={{ value: 100, color: "bg-blue-500" }}
        />
        <StatScoreCard
          title="SUPER ADMIN"
          value={superAdminCount}
          icon={Shield}
          statusBadge={{ text: "Root Access", color: "red" }}
          subtitle="Akses kontrol tanpa batas"
          progressBar={{ value: Math.min(100, Math.round((superAdminCount / (admins.length || 1)) * 100)), color: "bg-red-500" }}
        />
        <StatScoreCard
          title="ADMIN OPERASIONAL"
          value={operationalAdminCount}
          icon={UserCheck}
          statusBadge={{ text: "Scoped Roles", color: "violet" }}
          subtitle="Akses berbasis peran SaaS"
          progressBar={{ value: Math.min(100, Math.round((operationalAdminCount / (admins.length || 1)) * 100)), color: "bg-violet-500" }}
        />
        <StatScoreCard
          title="STATUS AKTIF"
          value={activeCount}
          icon={CheckCircle2}
          statusBadge={{ text: activeCount === admins.length ? "100% Aktif" : "Sebagian", color: "emerald" }}
          subtitle="Kredensial siap login"
          progressBar={{ value: Math.min(100, Math.round((activeCount / (admins.length || 1)) * 100)), color: "bg-emerald-500" }}
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="input-search-admins"
              className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> administrator
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
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Memuat data administrator...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="opacity-40" />
                      <span className="text-xs">Tidak ada administrator ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((admin, i) => (
                  <tr key={admin.id}>
                    <td className="text-slate-400 font-medium text-xs">{startIndex + i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div style={getAvatarStyle(admin.name || admin.email, 30)} className="rounded-lg font-bold text-xs shrink-0 flex items-center justify-center">
                          {getInitials(admin.name)}
                        </div>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{admin.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-600 dark:text-slate-400">{admin.email}</td>
                    <td>
                      <span className={`badge ${admin.role === 'super_admin' ? 'badge-red' : 'badge-violet'}`}>
                        {admin.role === 'super_admin' ? 'Super Admin' : (admin.saas_role || 'Admin')}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {admin.role === 'super_admin' ? (
                          <span className="badge badge-red text-[10px]">Semua Akses (Super Admin)</span>
                        ) : (admin.permissions && admin.permissions.length > 0) ? (
                          admin.permissions.map(p => {
                            const pm = ALL_PERMS.find(x => x.key === p)
                            return <span key={p} className="badge badge-violet text-[10px]">{pm?.label || p}</span>
                          })
                        ) : (
                          <span className="text-[11px] text-slate-400">Tidak ada permission</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${admin.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-impersonate-admin-${admin.id}`}
                          onClick={() => handleImpersonate(admin.id)}
                          title="Login sebagai Admin ini"
                          className="h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold shadow-xs transition-colors"
                        >
                          <KeyRound size={12} />
                          <span>Login</span>
                        </button>

                        <button
                          id={`btn-edit-admin-${admin.id}`}
                          onClick={() => handleEdit(admin)}
                          disabled={admin.role === 'super_admin'}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors disabled:opacity-40"
                          title={admin.role === 'super_admin' ? 'Super Admin tidak bisa diedit' : 'Edit Admin'}
                        >
                          <Pencil size={13} />
                        </button>

                        {admin.role !== 'super_admin' && (
                          <button
                            id={`btn-del-admin-${admin.id}`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors"
                            onClick={() => handleDelete(admin.id)}
                            title="Hapus Admin"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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

      {show && (
        <Modal 
          isOpen={show} 
          onClose={() => setShow(false)} 
          title={editingId ? 'Edit Administrator' : 'Tambah Administrator Baru'}
          maxWidth="540px"
        >
          {error && <div className="p-3 mb-4 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold"><span>⚠</span> {error}</div>}
          <form id="form-add-admin" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                  placeholder="Nama admin"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                  type="email"
                  placeholder="admin@bizora.id"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {editingId ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}
              </label>
              <input
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                type="password"
                placeholder={editingId ? 'Min. 8 karakter (opsional)' : 'Min. 8 karakter'}
                required={!editingId}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pilih Role SaaS</label>
              <select
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                id="btn-cancel-admin"
                type="button"
                className="h-[38px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold"
                onClick={() => setShow(false)}
              >
                Batal
              </button>
              <button
                id="btn-save-admin"
                type="submit"
                className="h-[38px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
