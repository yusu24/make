import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import Modal from '../../../components/Modal'
import { 
  Store, Users, Shield, KeyRound, Eye, Edit3, Trash2, 
  RefreshCw, Plus, CheckCircle2, AlertTriangle, 
  Sparkles, Box, CreditCard, Package, Calendar, Mail, FileText, ShoppingBag
} from 'lucide-react'
import './Shared.css'

export default function Tenants() {
  const { impersonate } = useAuth()
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [search, setSearch]   = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTenant, setEditTenant] = useState(null)
  const [viewTenant, setViewTenant] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [impersonatingId, setImpersonatingId] = useState(null)
  const [moduleModal, setModuleModal] = useState(null)
  const [tenantModules, setTenantModules] = useState([])
  const [savingModules, setSavingModules] = useState(false)
  const [showDemoInfo, setShowDemoInfo] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchTenants = () => {
    setLoading(true)
    api.get('/admin/tenants')
      .then(r => setTenants(r.data?.data || []))
      .catch(e => console.error('Failed to fetch tenants:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const handleImpersonate = async (tenant) => {
    setImpersonatingId(tenant.tenant_id)
    try {
      const redirect = await impersonate(tenant.tenant_id)
      navigate(redirect || '/retail/dashboard')
    } catch (err) {
      alert('Gagal login sebagai tenant: ' + (err.response?.data?.message || err.message))
    } finally {
      setImpersonatingId(null)
    }
  }

  const openModuleModal = async (tenant_id) => {
    setModuleModal(tenant_id)
    setTenantModules([])
    try {
      const res = await api.get(`/admin/tenants/${tenant_id}/modules`)
      setTenantModules(res.data.data || [])
    } catch (err) {
      alert('Gagal memuat modul tenant')
    }
  }

  const handleToggleModule = (id) => {
    setTenantModules(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m))
  }

  const saveModules = async () => {
    setSavingModules(true)
    try {
      const activeIds = tenantModules.filter(m => m.is_active).map(m => m.id)
      await api.post(`/admin/tenants/${moduleModal}/modules`, { module_ids: activeIds })
      alert('Modul tenant berhasil diperbarui!')
      setModuleModal(null)
      // Refresh current open detail modal if open
      if (viewTenant && viewTenant.tenant_id === moduleModal) {
        handleOpenDetail(viewTenant)
      }
    } catch (err) {
      alert('Gagal menyimpan modul: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingModules(false)
    }
  }

  const handleAddTenant = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const newTenant = {
      name: fd.get('name'),
      email: fd.get('email'),
      category: fd.get('category'),
      plan: fd.get('plan'),
      tenant_id: `TN-${Math.floor(Math.random() * 9000 + 1000)}`,
    }
    try { 
      await api.post('/admin/tenants', newTenant)
      setShowAddModal(false)
      fetchTenants()
      alert('Tenant baru berhasil dibuat!')
    } catch (err) {
      alert('Gagal membuat tenant: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleUpdateTenant = async (e) => {
    e.preventDefault()
    if (!editTenant) return
    const fd = new FormData(e.target)
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      category: fd.get('category'),
      subscription_plan: fd.get('subscription_plan'),
      status: fd.get('status'),
    }
    try {
      await api.put(`/admin/tenants/${editTenant.tenant_id}`, payload)
      setEditTenant(null)
      fetchTenants()
      alert('Data tenant berhasil diperbarui!')
    } catch (err) {
      alert('Gagal menyimpan perubahan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteTenant = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/admin/tenants/${deleteTarget.tenant_id}`)
      setDeleteTarget(null)
      fetchTenants()
      alert('Tenant berhasil dihapus dari sistem.')
    } catch (err) {
      alert('Gagal menghapus tenant: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleOpenDetail = async (t) => {
    try {
      const res = await api.get(`/admin/tenants/${t.tenant_id}`)
      setViewTenant(res.data?.data || t)
    } catch (e) {
      setViewTenant(t)
    }
  }

  const uniqueCategories = Array.from(new Set(tenants.map(t => t.category).filter(Boolean))).sort()

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase()
    const matchesSearch = (t.name || '').toLowerCase().includes(q) || 
                          (t.email || '').toLowerCase().includes(q) || 
                          (t.tenant_id || '').toLowerCase().includes(q) ||
                          (t.category || '').toLowerCase().includes(q)
    
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
    
    let matchesStatus = true
    if (statusFilter === 'active') matchesStatus = t.status === 'active'
    else if (statusFilter === 'pending') matchesStatus = t.status === 'pending'
    else if (statusFilter === 'inactive') matchesStatus = t.status === 'inactive'
    else if (statusFilter === 'demo') matchesStatus = !!t.is_demo

    return matchesSearch && matchesCategory && matchesStatus
  })

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered)

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ── */}
      <div className="page-header mb-4">
        <h2 className="page-title">Manajemen Tenant</h2>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Store size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Tenant</p>
            <p className="text-xl font-bold text-slate-800">{tenants.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tenant Aktif</p>
            <p className="text-xl font-bold text-emerald-600">{tenants.filter(t => t.status === 'active' && !t.is_demo).length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Akun Demo Sandbox</p>
            <p className="text-xl font-bold text-amber-600">{tenants.filter(t => t.is_demo).length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Nonaktif / Kadaluarsa</p>
            <p className="text-xl font-bold text-rose-600">{tenants.filter(t => t.status === 'inactive').length}</p>
          </div>
        </div>
      </div>

      <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="search-wrap" style={{ minWidth: 200, maxWidth: 280, flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input
                id="input-search-tenants"
                className="form-input search-input"
                placeholder="Cari ID, nama bisnis, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 140 }}>
                <select
                  id="select-filter-status"
                  className="form-input"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    height: 38
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">✓ Aktif</option>
                  <option value="pending">⏳ Trial / Pending</option>
                  <option value="inactive">✗ Nonaktif</option>
                  <option value="demo">✨ Demo Sandbox</option>
                </select>
              </div>

              <div style={{ minWidth: 150 }}>
                <select
                  id="select-filter-category"
                  className="form-input"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    height: 38
                  }}
                >
                  <option value="all">Semua Kategori</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={fetchTenants} 
                className="btn btn-secondary" 
                style={{ height: 38, width: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                title="Segarkan Data"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => setShowDemoInfo(true)}
                style={{ height: 38, display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 500 }}
                title="Pelajari Sistem Akun Demo"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Info Demo (24h)</span>
              </button>

              <button 
                id="btn-add-tenant" 
                className="btn btn-primary" 
                onClick={() => setShowAddModal(true)} 
                style={{ height: 38, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                + Tambah Tenant
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>Nama Bisnis</th>
                <th>Email Owner</th>
                <th>Kategori Sektor</th>
                <th>Paket</th>
                <th>Status Akun</th>
                <th>Tgl Dibuat</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                      <span>Menyinkronkan data tenant...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Tidak ada tenant yang cocok dengan filter.
                  </td>
                </tr>
              ) : paginatedData.map(t => (
                <tr key={t.id}>
                  <td>
                    <code style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
                      {t.tenant_id}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={getAvatarStyle(t.name || t.tenant_id, 32)}>
                        {getInitials(t.name || t.tenant_id)}
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, display: 'block' }}>{t.name}</span>
                        {t.is_demo && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5">
                            ⚡ DEMO SANDBOX (24h)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.email}</td>
                  <td><span className="badge badge-secondary">{t.category}</span></td>
                  <td>
                    <span className={`badge ${
                      (t.plan || '').toLowerCase() === 'pro' ? 'badge-violet' : 
                      (t.plan || '').toLowerCase() === 'basic' ? 'badge-blue' : 'badge-secondary'
                    }`}>
                      {t.plan ? (t.plan.charAt(0).toUpperCase() + t.plan.slice(1)) : 'Free'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.status === 'active' ? 'badge-green' : 
                      t.status === 'pending' ? 'badge-yellow' : 'badge-red'
                    }`}>
                      {t.status === 'active' ? 'Aktif' : t.status === 'pending' ? 'Trial/Pending' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.joined}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetail(t)}
                        title="Buka Detail Tenant"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleImpersonate(t)}
                        disabled={impersonatingId === t.tenant_id}
                        title={`Login Langsung sebagai ${t.name}`}
                        style={{ color: 'var(--primary-500)' }}
                      >
                        <KeyRound size={13} />
                      </button>

                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => openModuleModal(t.tenant_id)}
                        title="Atur Modul Ekstra Tenant"
                      >
                        <Box size={13} />
                      </button>

                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setEditTenant(t)}
                        title="Edit Data Tenant"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger-500)' }}
                        onClick={() => setDeleteTarget(t)}
                        title="Hapus Tenant"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* ── Modal Detail Tenant (Super Lengkap & Rinci) ── */}
      {viewTenant && (
        <Modal isOpen={!!viewTenant} onClose={() => setViewTenant(null)} title={`Detail Profil Tenant: ${viewTenant.name || viewTenant.tenant_id}`} maxWidth="720px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {viewTenant.is_demo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-semibold mb-0.5">Akun Demo Sandbox (Uji Coba Publik)</strong>
                  Akun ini dibuat untuk demonstrasi fitur aplikasi secara langsung. Sistem akan secara otomatis membersihkan seluruh data sandbox ini dalam 24 jam.
                </div>
              </div>
            )}

            {/* Profile Header Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm">
              <div className="flex items-center gap-3.5">
                <div style={getAvatarStyle(viewTenant.name || viewTenant.tenant_id, 48)}>
                  {getInitials(viewTenant.name || viewTenant.tenant_id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white m-0">{viewTenant.name || viewTenant.business_name}</h3>
                    <code className="text-[11px] bg-white/20 px-2 py-0.5 rounded text-indigo-200 font-mono">{viewTenant.tenant_id}</code>
                  </div>
                  <p className="text-xs text-slate-300 m-0 mt-1 flex items-center gap-1.5">
                    <Mail size={12} className="text-indigo-300" />
                    <span>{viewTenant.email}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`badge ${viewTenant.status === 'active' ? 'badge-green' : viewTenant.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                  {viewTenant.status === 'active' ? '✓ Aktif' : viewTenant.status === 'pending' ? '⏳ Pending' : '✗ Nonaktif'}
                </span>
                <span className="text-[11px] text-slate-400">Terdaftar: {viewTenant.joined}</span>
              </div>
            </div>

            {/* Operational Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                <Users size={16} className="text-indigo-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-800 m-0">{viewTenant.stats?.total_users ?? 1}</p>
                <p className="text-[11px] text-slate-500 m-0 font-medium">Staf / Akun</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                <Package size={16} className="text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-800 m-0">{viewTenant.stats?.total_products ?? 0}</p>
                <p className="text-[11px] text-slate-500 m-0 font-medium">Katalog Produk</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                <ShoppingBag size={16} className="text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-800 m-0">{viewTenant.stats?.total_transactions ?? 0}</p>
                <p className="text-[11px] text-slate-500 m-0 font-medium">Transaksi</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-center">
                <FileText size={16} className="text-amber-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-800 m-0">{viewTenant.stats?.total_invoices ?? 0}</p>
                <p className="text-[11px] text-slate-500 m-0 font-medium">Tagihan SaaS</p>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Box 1: Langganan & Kuota */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <CreditCard size={15} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">Langganan &amp; Kuota</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Paket Aktif</span>
                    <span className="font-bold text-indigo-600 uppercase">{viewTenant.plan || viewTenant.subscription_plan || 'FREE'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Harga Paket</span>
                    <span className="font-semibold text-slate-800">
                      {viewTenant.stats?.plan_price ? `Rp ${Number(viewTenant.stats.plan_price).toLocaleString('id-ID')}/bln` : 'Gratis'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Masa Aktif Hingga</span>
                    <span className="font-semibold text-slate-800">{viewTenant.expires_at}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Batas Maks. Pegawai</span>
                    <span className="font-semibold text-slate-800">{viewTenant.stats?.max_staff}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Batas Maks. Produk</span>
                    <span className="font-semibold text-slate-800">{viewTenant.stats?.max_products}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Sektor & Modul Aktif */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <Box size={15} className="text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider m-0">Sektor &amp; Modul Ekstra</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Sektor Bisnis Utama</span>
                    <span className="font-semibold text-slate-800">{viewTenant.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1.5">Modul Sistem Aktif:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {viewTenant.stats?.active_modules?.length > 0 ? (
                        viewTenant.stats.active_modules.map(modName => (
                          <span key={modName} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            ✓ {modName}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum ada modul ekstra khusus yang aktif</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button 
                className="btn btn-secondary text-xs flex items-center gap-1.5"
                onClick={() => {
                  const t = viewTenant;
                  setViewTenant(null);
                  openModuleModal(t.tenant_id);
                }}
              >
                <Box size={13} />
                <span>Atur Modul Ekstra</span>
              </button>

              <div className="flex gap-2">
                <button className="btn btn-secondary text-xs" onClick={() => setViewTenant(null)}>Tutup</button>
                <button 
                  className="btn btn-secondary text-xs flex items-center gap-1"
                  onClick={() => {
                    const t = viewTenant;
                    setViewTenant(null);
                    setEditTenant(t);
                  }}
                >
                  <Edit3 size={13} />
                  <span>Edit Data</span>
                </button>
                <button 
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                  onClick={() => {
                    const t = viewTenant;
                    setViewTenant(null);
                    handleImpersonate(t);
                  }}
                >
                  <KeyRound size={13} />
                  <span>Login Sebagai Tenant</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Edit Tenant ── */}
      {editTenant && (
        <Modal isOpen={!!editTenant} onClose={() => setEditTenant(null)} title={`Edit Tenant: ${editTenant.tenant_id}`}>
          <form onSubmit={handleUpdateTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label font-semibold">Nama Bisnis / Toko</label>
              <input name="name" className="form-input" defaultValue={editTenant.name} required />
            </div>

            <div className="form-group">
              <label className="form-label font-semibold">Email Pemilik Akun</label>
              <input name="email" type="email" className="form-input" defaultValue={editTenant.email} required />
            </div>

            <div className="form-group">
              <label className="form-label font-semibold">Kategori Sektor Bisnis</label>
              <select name="category" className="form-input" defaultValue={editTenant.category} required>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label font-semibold">Paket Langganan</label>
                <select name="subscription_plan" className="form-input" defaultValue={(editTenant.plan || 'free').toLowerCase()}>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label font-semibold">Status Akun</label>
                <select name="status" className="form-input" defaultValue={editTenant.status}>
                  <option value="active">Aktif</option>
                  <option value="pending">Trial / Pending</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="modal__actions mt-3">
              <button type="button" className="btn btn-secondary" onClick={() => setEditTenant(null)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Tambah Tenant ── */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Tenant Baru">
          <form onSubmit={handleAddTenant} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label className="form-label font-semibold">Nama Bisnis / Toko</label>
              <input name="name" className="form-input" required placeholder="Contoh: Toko Berkah Mandiri" />
            </div>
            <div className="form-group">
              <label className="form-label font-semibold">Alamat Email Pemilik</label>
              <input name="email" type="email" className="form-input" required placeholder="owner@tokoberkah.com" />
            </div>
            <div className="form-group">
              <label className="form-label font-semibold">Kategori Sektor</label>
              <select name="category" className="form-input" required>
                <option value="Toko Retail">Toko Retail</option>
                <option value="Budidaya Hewan">Budidaya Hewan</option>
                <option value="Budidaya Tanaman">Budidaya Tanaman</option>
                <option value="Kuliner">Kuliner</option>
                <option value="Jasa">Jasa</option>
                <option value="Seller">Seller</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label font-semibold">Paket Awal</label>
              <select name="plan" className="form-input" required>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div className="modal__actions mt-3">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Buat Tenant Baru</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Konfirmasi Hapus Tenant ── */}
      {deleteTarget && (
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Konfirmasi Hapus Tenant" maxWidth="480px">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#dc2626' }}>Hapus Tenant {deleteTarget.name}?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
              Tindakan ini akan menghapus akun tenant <strong>{deleteTarget.tenant_id}</strong> beserta data login pegawainya. Pastikan Anda sudah mengecek transaksi aktif sebelum menghapus.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button className="btn btn-primary" style={{ background: '#dc2626', border: 'none' }} onClick={handleDeleteTenant}>
                Ya, Hapus Tenant
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Info Akun Demo ── */}
      {showDemoInfo && (
        <Modal isOpen={showDemoInfo} onClose={() => setShowDemoInfo(false)} title="ℹ️ Manajemen Akun Demo Sandbox" maxWidth="520px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
            <p>
              Akun <strong>Demo Sandbox</strong> adalah akun instan yang dibuat saat pengunjung mencoba modul via halaman utama/landing page.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-semibold text-slate-800 text-sm mb-1">Kebijakan Masa Aktif (TTL):</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>Akun demo memiliki masa aktif maksimal <strong>24 Jam (1 Hari)</strong>.</li>
                <li>Sistem otomatis membersihkan seluruh data demo sandbox yang berumur lebih dari 24 jam agar database tetap bersih.</li>
                <li>Akun demo ditandai dengan badge khusus <strong>DEMO SANDBOX</strong> pada tabel untuk membedakannya dari tenant real.</li>
              </ul>
            </div>
            <div className="modal__actions">
              <button className="btn btn-primary" onClick={() => setShowDemoInfo(false)}>Saya Mengerti</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Atur Modul Ekstra Tenant ── */}
      {moduleModal && (
        <Modal isOpen={!!moduleModal} onClose={() => setModuleModal(null)} title="Atur Modul &amp; Add-on Ekstra Tenant">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
              <Box size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Modul Add-on Tambahan:</strong> Di luar paket bawaan sektor bisnis, Anda dapat mengaktifkan modul tambahan ekstra (seperti Kasir POS, Logistik Gudang, Keuangan Lanjutan, dll.) khusus untuk tenant ini.
              </div>
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pilih Modul yang Diizinkan:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
              {tenantModules.map(m => (
                <label key={m.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', 
                  background: m.is_active ? 'var(--primary-50, #eef2ff)' : 'var(--bg-elevated)', 
                  border: `1px solid ${m.is_active ? '#c7d2fe' : 'transparent'}`,
                  borderRadius: 10, cursor: 'pointer', fontSize: 13 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={m.is_active} onChange={() => handleToggleModule(m.id)} style={{ width: 16, height: 16, accentColor: '#4f46e5' }} />
                    <span style={{ fontWeight: 600, color: m.is_active ? '#4338ca' : 'inherit' }}>{m.name}</span>
                  </div>
                  <span className={`badge ${m.is_active ? 'badge-green' : 'badge-secondary'}`} style={{ fontSize: 10 }}>
                    {m.is_active ? 'Aktif' : 'Terkunci'}
                  </span>
                </label>
              ))}
            </div>
            <div className="modal__actions mt-2">
              <button className="btn btn-secondary" onClick={() => setModuleModal(null)}>Batal</button>
              <button className="btn btn-primary" onClick={saveModules} disabled={savingModules}>
                {savingModules ? 'Menyimpan...' : 'Simpan Hak Akses Modul'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
