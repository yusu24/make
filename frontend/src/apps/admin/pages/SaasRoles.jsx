import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import Modal from '../../../components/Modal'
import {
  Pencil,
  Trash2,
  Search,
  Plus,
  Shield,
  Users,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Lock
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus role ini?')) return
    try {
      await api.delete(`/saas-roles/${id}`)
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus role')
    }
  }

  const totalAssignedAdmins = roles.reduce((s, r) => s + (r.users_count || 0), 0)
  const avgPerms = roles.length > 0
    ? Math.round(roles.reduce((s, r) => s + (r.permissions?.length || 0), 0) / roles.length)
    : 0

  const filtered = roles.filter(r => {
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
  })

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
          onClick={fetchRoles}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang data role"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
          <button
            id="btn-add-role"
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all"
            onClick={() => {
              setShow(true)
              setEditingId(null)
              setError('')
              setForm({ name: '', description: '', permissions: [] })
            }}
          >
            <Plus size={15} />
            <span>Tambah Role</span>
          </button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatScoreCard
          title="TOTAL PERAN SAAS"
          value={roles.length}
          icon={Shield}
          statusBadge={{ text: "Terdefinisi", color: "blue" }}
          subtitle="Profil peran hak akses"
          progressBar={{ value: 100, color: "bg-blue-500" }}
        />
        <StatScoreCard
          title="ADMIN TERALOKASI"
          value={totalAssignedAdmins}
          icon={Users}
          statusBadge={{ text: "Aktif Bertugas", color: "emerald" }}
          subtitle="Admin dengan role terikat"
          progressBar={{ value: 85, color: "bg-emerald-500" }}
        />
        <StatScoreCard
          title="MODUL GRANULAR"
          value={ALL_PERMS.length}
          icon={Lock}
          statusBadge={{ text: "Akses Tersedia", color: "violet" }}
          subtitle="Cakupan modul sistem admin"
          progressBar={{ value: 100, color: "bg-violet-500" }}
        />
        <StatScoreCard
          title="RATA-RATA IZIN/ROLE"
          value={`${avgPerms} Izin`}
          icon={KeyRound}
          statusBadge={{ text: "Optimal", color: "amber" }}
          subtitle="Distribusi wewenang rata-rata"
          progressBar={{ value: Math.min(100, avgPerms * 15), color: "bg-amber-500" }}
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="input-search-roles"
              className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
              placeholder="Cari nama role atau deskripsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> role
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Role</th>
                <th>Deskripsi</th>
                <th>Permissions</th>
                <th>Jumlah Admin</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Memuat data peran SaaS...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield size={32} className="opacity-40" />
                      <span className="text-xs">Tidak ada role ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((role, i) => (
                  <tr key={role.id}>
                    <td className="text-slate-400 font-medium text-xs">{startIndex + i + 1}</td>
                    <td>
                      <span className="badge badge-violet text-xs font-semibold px-2.5 py-1">
                        {role.name}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{role.description || '—'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[420px]">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map(p => {
                            const pm = ALL_PERMS.find(x => x.key === p)
                            return <span key={p} className="badge badge-gray text-[10px]">{pm?.label || p}</span>
                          })
                        ) : (
                          <span className="text-[11px] text-slate-400">Tidak ada permission</span>
                        )}
                      </div>
                    </td>
                    <td className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {role.users_count || 0} Admin
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-edit-role-${role.id}`}
                          onClick={() => handleEdit(role)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
                          title="Edit Role"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          id={`btn-del-role-${role.id}`}
                          onClick={() => handleDelete(role.id)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-xs transition-colors"
                          title="Hapus Role"
                        >
                          <Trash2 size={13} />
                        </button>
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
          title={editingId ? 'Edit Role SaaS' : 'Tambah Role SaaS Baru'}
          maxWidth="540px"
        >
          {error && <div className="p-3 mb-4 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold"><span>⚠</span> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Role</label>
              <input
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                placeholder="Misal: Finance Admin, Support Staff"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Deskripsi</label>
              <input
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                placeholder="Penjelasan singkat mengenai fungsi peran role ini"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hak Akses Modul (Permissions)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 max-h-56 overflow-y-auto">
                {ALL_PERMS.map(p => (
                  <label key={p.key} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      id={`perm-${p.key}`}
                      checked={form.permissions.includes(p.key)}
                      onChange={() => togglePerm(p.key)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                type="button"
                className="h-[38px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold"
                onClick={() => setShow(false)}
              >
                Batal
              </button>
              <button
                type="submit"
                className="h-[38px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Role'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
