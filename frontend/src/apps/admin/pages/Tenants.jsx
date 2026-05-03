import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import './Shared.css'

const DUMMY = [
  { id:1, name:'Ahmad Suharto',  email:'ahmad@retail.com', category:'Toko Retail',   status:'active',   plan:'Pro',   tenant_id:'TN-001', joined:'2026-03-10' },
  { id:2, name:'Siti Rahayu',   email:'siti@ikan.com',    category:'Budidaya Ikan', status:'active',   plan:'Basic', tenant_id:'TN-002', joined:'2026-03-15' },
  { id:3, name:'Budi Santoso',  email:'budi@jasa.com',    category:'Jasa',          status:'pending',  plan:'-',     tenant_id:'TN-003', joined:'2026-04-01' },
  { id:4, name:'Dewi Lestari',  email:'dewi@mftr.com',    category:'Manufaktur',    status:'active',   plan:'Pro',   tenant_id:'TN-004', joined:'2026-03-28' },
  { id:5, name:'Teguh Prasetyo',email:'teguh@retail.com', category:'Toko Retail',   status:'inactive', plan:'Basic', tenant_id:'TN-005', joined:'2026-02-20' },
]

const PLAN_BADGE = { Pro:'badge-violet', Basic:'badge-blue', '-':'badge-gray' }
const STATUS_BADGE = { active:'badge-green', pending:'badge-yellow', inactive:'badge-gray' }

export default function Tenants() {
  const { impersonate, isImpersonating, exitImpersonate } = useAuth()
  const navigate = useNavigate()
  const [tenants, setTenants] = useState([])
  const [search, setSearch]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [impersonating, setImpersonating] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null) // tenant to confirm impersonation
  const [moduleModal, setModuleModal] = useState(null) // tenant_id for module modal
  const [tenantModules, setTenantModules] = useState([])
  const [savingModules, setSavingModules] = useState(false)

  const fetchTenants = () => {
    api.get('/admin/tenants').then(r => setTenants(r.data?.data || DUMMY)).catch(() => {})
  }

  const fetchRequests = async () => {
    setLoadingRequests(true)
    try {
      const res = await api.get('/admin/subscription/requests')
      setRequests(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchTenants()
    fetchRequests()
  }, [])

  const handleApprove = async (id) => {
    if (!window.confirm('Verifikasi pembayaran pelanggan ini sudah diterima dan aktifkan paket?')) return
    try {
      await api.post(`/admin/subscription/requests/${id}/approve`)
      alert('Paket berhasil diaktifkan!')
      fetchRequests()
      fetchTenants()
    } catch (err) {
      alert('Gagal menyetujui permintaan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Alasan penolakan:')
    if (reason === null) return
    try {
      await api.post(`/admin/subscription/requests/${id}/reject`, { notes: reason })
      fetchRequests()
    } catch (err) {
      alert('Gagal menolak permintaan')
    }
  }

  const handleImpersonate = async (tenant) => {
    setImpersonating(tenant.tenant_id)
    setConfirmTarget(null)
    try {
      const redirect = await impersonate(tenant.tenant_id)
      navigate(redirect)
    } catch (err) {
      alert('Gagal impersonate: ' + (err.response?.data?.message || err.message))
    } finally {
      setImpersonating(null)
    }
  }

  const openModuleModal = async (tenant_id) => {
    setModuleModal(tenant_id)
    setTenantModules([])
    try {
      const res = await api.get(`/admin/tenants/${tenant_id}/modules`)
      setTenantModules(res.data.data)
    } catch (err) {
      alert('Gagal memuat modul')
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
      alert('Modul berhasil diperbarui!')
      setModuleModal(null)
    } catch (err) {
      alert('Gagal menyimpan modul')
    } finally {
      setSavingModules(false)
    }
  }

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  })

  const handleAddTenant = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const newTenant = {
      id: Date.now(),
      name: fd.get('name'),
      email: fd.get('email'),
      category: fd.get('category'),
      plan: fd.get('plan'),
      status: 'active',
      tenant_id: `TN-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      joined: new Date().toISOString().slice(0, 10)
    }
    setTenants(v => [...v, newTenant])
    setShowModal(false)
    try { 
      const res = await api.post('/admin/tenants', newTenant)
      // Update local state with the real data from server if needed
      fetchTenants()
      alert('Tenant berhasil dibuat!')
    } catch (err) {
      alert('Gagal menyimpan tenant ke database: ' + (err.response?.data?.message || err.message))
      // Remove from local list if failed
      setTenants(prev => prev.filter(t => t.id !== newTenant.id))
    }
  }

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Manajemen Tenant</h2>
            <p className="page-sub">{tenants.length} tenant terdaftar di platform</p>
          </div>
          <div style={{display:'flex', gap:10}}>
            <button id="btn-export-tenants" className="btn btn-secondary">⬇ Export CSV</button>
            <button id="btn-add-tenant" className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah Tenant</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
           <button 
             onClick={() => setActiveTab('list')}
             style={{ 
               padding: '12px 0', background: 'none', border: 'none', 
               borderBottom: activeTab === 'list' ? '2px solid var(--primary-500)' : 'none', 
               color: activeTab === 'list' ? 'var(--primary-500)' : 'var(--text-muted)',
               fontWeight: 600, cursor: 'pointer'
             }}
           >
             Daftar Tenant
           </button>
           <button 
             onClick={() => setActiveTab('requests')}
             style={{ 
               padding: '12px 0', background: 'none', border: 'none', 
               borderBottom: activeTab === 'requests' ? '2px solid var(--primary-500)' : 'none', 
               color: activeTab === 'requests' ? 'var(--primary-500)' : 'var(--text-muted)',
               fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
             }}
           >
             Permintaan Langganan (Antrian)
             {requests.length > 0 && <span style={{ background: 'var(--danger-500)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 99 }}>{requests.length}</span>}
           </button>
        </div>

        {activeTab === 'list' ? (
        <>
        {/* Stats row */}
        <div className="grid-4 stagger" style={{marginBottom:24}}>
          {[
            { label:'Total Tenant', value: tenants.length, color:'#3b82f6', icon:'⬡' },
            { label:'Aktif',        value: tenants.filter(t=>t.status==='active').length,   color:'#10b981', icon:'✓' },
            { label:'Pending',      value: tenants.filter(t=>t.status==='pending').length,  color:'#f59e0b', icon:'⏳' },
            { label:'Nonaktif',     value: tenants.filter(t=>t.status==='inactive').length, color:'#ef4444', icon:'✗' },
          ].map((s,i) => (
            <div key={i} className="card card-pad animate-fade-in" style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{
                width:48, height:48, borderRadius:12,
                background: s.color + '20',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, color:s.color, flexShrink:0
              }}>{s.icon}</div>
              <div>
                <div style={{fontFamily:'var(--font-heading)',fontSize:28,fontWeight:800}}>{s.value}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input id="input-search-tenants" className="form-input search-input" placeholder="Cari tenant..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrap table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tenant ID</th><th>Nama</th><th>Kategori Bisnis</th>
                <th>Paket</th><th>Status</th><th>Bergabung</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><code style={{fontSize:11,color:'var(--text-muted)',background:'var(--bg-elevated)',padding:'2px 6px',borderRadius:4}}>{t.tenant_id}</code></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="avatar" style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',width:32,height:32,fontSize:11}}>
                        {t.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{fontWeight:600,color:'var(--text-primary)',fontSize:13}}>{t.name}</p>
                        <p style={{fontSize:11,color:'var(--text-muted)'}}>{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{t.category}</td>
                  <td>
                    <select 
                      className={`form-input badge ${PLAN_BADGE[t.plan] || 'badge-gray'}`}
                      style={{ padding: '4px 8px', height: 'auto', border: 'none', cursor: 'pointer', appearance: 'none', background: 'var(--bg-elevated)', outline: 'none' }}
                      value={t.plan}
                      onChange={async (e) => {
                        const newPlan = e.target.value
                        try {
                          await api.put(`/admin/tenants/${t.tenant_id}/plan`, { plan: newPlan })
                          setTenants(prev => prev.map(pt => pt.id === t.id ? { ...pt, plan: newPlan } : pt))
                        } catch (err) {
                          alert(`Gagal merubah paket langganan: ${err.response?.data?.message || err.message}`)
                        }
                      }}
                    >
                      <option value="free" className="badge-gray">Free</option>
                      <option value="basic" className="badge-blue">Basic</option>
                      <option value="pro" className="badge-violet">Pro</option>
                    </select>
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[t.status] || ''}`}>{t.status}</span></td>
                  <td style={{fontSize:12,color:'var(--text-muted)'}}>{t.joined}</td>
                  <td>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {(t.category === 'Toko Retail' || t.category === 'Budidaya Ikan' || t.category === 'Kuliner') && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleImpersonate(t)}
                          disabled={impersonating === t.tenant_id}
                          title={`Login sebagai ${t.name}`}
                        >
                          {impersonating === t.tenant_id ? '⏳...' : '🔑 Impersonate'}
                        </button>
                      )}
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => openModuleModal(t.tenant_id)}
                          title="Atur Modul Aktif"
                        >
                          📦 Modul
                        </button>
                        <button id={`btn-view-tenant-${t.id}`} className="btn btn-secondary btn-sm">👁 Lihat</button>
                        <button id={`btn-edit-tenant-${t.id}`} className="btn btn-ghost btn-sm">✏</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        ) : (
          /* Subscription Requests Tab */
          <div className="table-wrap table-responsive">
            <table className="table">
               <thead>
                 <tr>
                   <th>Tenant</th>
                   <th>Paket Dipilih</th>
                   <th>Waktu Request</th>
                   <th>Status</th>
                   <th style={{ textAlign: 'right' }}>Aksi</th>
                 </tr>
               </thead>
               <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td>
                         <div style={{ fontWeight: 600 }}>{req.tenant?.business_name || req.tenant_id}</div>
                         <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {req.tenant_id}</div>
                      </td>
                      <td><span className={`badge ${PLAN_BADGE[req.plan.charAt(0).toUpperCase() + req.plan.slice(1)] || 'badge-blue'}`}>{req.plan}</span></td>
                      <td style={{ fontSize: 13 }}>{new Date(req.created_at).toLocaleString('id-ID')}</td>
                      <td><span className="badge badge-yellow">PENDING</span></td>
                      <td style={{ textAlign: 'right' }}>
                         <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id)}>✓ Aktifkan</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleReject(req.id)}>Tolak</button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && !loadingRequests && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada permintaan aktif. Semuanya sudah beres! ✨</td></tr>
                  )}
               </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Tambah Tenant Baru</h3>
            <form onSubmit={handleAddTenant} style={{ display:'flex', flexDirection:'column', gap:16, marginTop:16 }}>
              <div className="form-group">
                <label className="form-label">Nama Tenant</label>
                <input name="name" className="form-input" required placeholder="Nama Bisnis / Toko" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Pemilik</label>
                <input name="email" className="form-input" required type="email" placeholder="email@contoh.com" />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <div className="form-group">
                  <label className="form-label">Kategori Bisnis</label>
                  <select name="category" className="form-select" required>
                    <option value="Toko Retail">Toko Retail</option>
                    <option value="Budidaya Ikan">Budidaya Ikan</option>
                    <option value="Kuliner">Kuliner</option>
                    <option value="Jasa">Jasa</option>
                    <option value="Manufaktur">Manufaktur</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Plan / Paket</label>
                  <select name="plan" className="form-select" required>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>
              </div>
              <div className="modal__actions mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {moduleModal && (
        <div className="modal-overlay" onClick={() => setModuleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 className="modal__title">Manajemen Modul Tenant</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>ID: {moduleModal}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tenantModules.length === 0 ? <p className="text-center py-4">Memuat modul...</p> : tenantModules.map(m => (
                <label key={m.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
                  background: 'var(--bg-elevated)', borderRadius: 12, cursor: 'pointer',
                  border: m.is_active ? '1px solid var(--primary-500)' : '1px solid transparent'
                }}>
                  <input 
                    type="checkbox" 
                    checked={m.is_active} 
                    onChange={() => handleToggleModule(m.id)}
                    style={{ width: 18, height: 18 }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{m.name.replace('_', ' ').toUpperCase()}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Aktifkan fitur ini untuk tenant</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="modal__actions mt-6">
              <button type="button" className="btn btn-secondary" onClick={() => setModuleModal(null)}>Batal</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={saveModules}
                disabled={savingModules}
              >
                {savingModules ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
