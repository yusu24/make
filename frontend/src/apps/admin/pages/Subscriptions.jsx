import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import './Shared.css'

const DUMMY_TENANTS = [
  { id:1, name:'Ahmad Suharto',  email:'ahmad@retail.com', category:'Toko Retail',   status:'active',   plan:'Pro',   tenant_id:'TN-001', joined:'2026-03-10' },
  { id:2, name:'Siti Rahayu',   email:'siti@ikan.com',    category:'Budidaya Ikan', status:'active',   plan:'Basic', tenant_id:'TN-002', joined:'2026-03-15' },
  { id:3, name:'Budi Santoso',  email:'budi@jasa.com',    category:'Jasa',          status:'pending',  plan:'-',     tenant_id:'TN-003', joined:'2026-04-01' },
  { id:4, name:'Dewi Lestari',  email:'dewi@mftr.com',    category:'Manufaktur',    status:'active',   plan:'Pro',   tenant_id:'TN-004', joined:'2026-03-28' },
  { id:5, name:'Teguh Prasetyo',email:'teguh@retail.com', category:'Toko Retail',   status:'inactive', plan:'Basic', tenant_id:'TN-005', joined:'2026-02-20' },
]

const PLAN_BADGE = { Pro:'badge-violet', Basic:'badge-blue', Free:'badge-gray', '-':'badge-gray' }
const STATUS_BADGE = { active:'badge-green', pending:'badge-yellow', inactive:'badge-gray' }

export default function Subscriptions() {
  const [tenants, setTenants] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('list')
  const [billingTenant, setBillingTenant] = useState(null)

  const [loading, setLoading] = useState(true)

  const fetchTenants = async () => {
    try {
      const res = await api.get('/admin/tenants')
      setTenants(res.data?.data || DUMMY_TENANTS)
    } catch (err) {
      setTenants(DUMMY_TENANTS)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/subscription/requests')
      setRequests(res.data.data || [])
    } catch (err) {
      setRequests([])
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTenants(), fetchRequests()]).finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    if (!window.confirm('Verifikasi pembayaran pelanggan ini sudah diterima dan aktifkan paket?')) return
    try {
      await api.post(`/admin/subscription/requests/${id}/approve`)
      alert('Langganan berhasil diaktifkan!')
      fetchRequests()
      fetchTenants()
    } catch (err) {
      alert('Gagal aktivasi langganan: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Alasan penolakan:')
    if (reason === null) return
    try {
      await api.post(`/admin/subscription/requests/${id}/reject`, { notes: reason })
      fetchRequests()
    } catch (err) {
      alert('Gagal menolak permintaan langganan')
    }
  }

  const handlePlanChange = async (tenant, newPlan) => {
    try {
      await api.put(`/admin/tenants/${tenant.tenant_id}/plan`, { plan: newPlan })
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, plan: newPlan } : t))
    } catch (err) {
      alert('Gagal merubah paket langganan: ' + (err.response?.data?.message || err.message))
    }
  }

  const filteredTenants = tenants.filter(t => {
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.tenant_id.toLowerCase().includes(q)
  })

  const {
    currentPage: tPage, setCurrentPage: setTPage,
    pageSize: tPageSize, setPageSize: setTPageSize,
    totalPages: tTotalPages, totalItems: tTotalItems,
    paginatedData: tPaginatedData, startIndex: tStart, endIndex: tEnd,
  } = usePagination(filteredTenants)

  const {
    currentPage: rPage, setCurrentPage: setRPage,
    pageSize: rPageSize, setPageSize: setRPageSize,
    totalPages: rTotalPages, totalItems: rTotalItems,
    paginatedData: rPaginatedData, startIndex: rStart, endIndex: rEnd,
  } = usePagination(requests)

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Manajemen Langganan</h2>
            <p className="page-sub">Kelola paket aktif dan permintaan langganan customer</p>
          </div>
        </div>

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
            Pelanggan Langganan
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
            Permintaan Langganan
            {requests.length > 0 && <span style={{ background: 'var(--danger-500)', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 99 }}>{requests.length}</span>}
          </button>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="filter-bar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="form-input search-input"
                  placeholder="Cari tenant atau email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tenant ID</th>
                    <th>Nama</th>
                    <th>Paket</th>
                    <th>Status</th>
                    <th>Bergabung</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && activeTab === 'list' ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                          <span>Memuat data langganan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        Tidak ada pelanggan ditemukan
                      </td>
                    </tr>
                  ) : tPaginatedData.map(t => (
                    <tr key={t.id}>
                      <td><code style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{t.tenant_id}</code></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', width: 32, height: 32, fontSize: 11 }}>
                            {t.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{t.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`form-input badge ${PLAN_BADGE[t.plan] || 'badge-gray'}`}
                          style={{ padding: '4px 8px', height: 'auto', border: 'none', cursor: 'pointer', appearance: 'none', background: 'var(--bg-elevated)', outline: 'none' }}
                          value={t.plan}
                          onChange={e => handlePlanChange(t, e.target.value)}
                        >
                          <option value="Free" className="badge-gray">Free</option>
                          <option value="Basic" className="badge-blue">Basic</option>
                          <option value="Pro" className="badge-violet">Pro</option>
                        </select>
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[t.status] || 'badge-gray'}`}>{t.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.joined}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setBillingTenant(t)} title="Riwayat Tagihan">👁</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && filteredTenants.length > 0 && (
                <SaasPagination
                  currentPage={tPage}
                  setCurrentPage={setTPage}
                  pageSize={tPageSize}
                  setPageSize={setTPageSize}
                  totalPages={tTotalPages}
                  totalItems={tTotalItems}
                  startIndex={tStart}
                  endIndex={tEnd}
                />
              )}
            </div>
          </>
        ) : (
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
                {loading && activeTab === 'requests' ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                        <span>Memuat data permintaan...</span>
                      </div>
                    </td>
                  </tr>
                ) : rPaginatedData.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.tenant?.business_name || req.tenant_id}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {req.tenant_id}</div>
                    </td>
                    <td><span className={`badge ${PLAN_BADGE[req.plan?.charAt(0).toUpperCase() + req.plan?.slice(1)] || 'badge-blue'}`}>{req.plan}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(req.created_at).toLocaleString('id-ID')}</td>
                    <td><span className="badge badge-yellow">PENDING</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id)} title="Aktifkan">✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleReject(req.id)} title="Tolak">✗</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && requests.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada permintaan langganan baru.</td></tr>
                )}
              </tbody>
            </table>
            {!loading && requests.length > 0 && (
              <SaasPagination
                currentPage={rPage}
                setCurrentPage={setRPage}
                pageSize={rPageSize}
                setPageSize={setRPageSize}
                totalPages={rTotalPages}
                totalItems={rTotalItems}
                startIndex={rStart}
                endIndex={rEnd}
              />
            )}
          </div>
        )}
      </div>

      {billingTenant && (
        <div className="modal-overlay" onClick={() => setBillingTenant(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3 className="modal__title">Riwayat Tagihan</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Menampilkan riwayat pembayaran untuk <strong>{billingTenant.name}</strong> ({billingTenant.tenant_id})
            </p>
            
            <div className="table-wrap table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Invoice</th>
                    <th>Tanggal</th>
                    <th>Nominal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code style={{fontSize:11}}>INV-202604-001</code></td>
                    <td>01 Apr 2026</td>
                    <td>Rp 150.000</td>
                    <td><span className="badge badge-green">Lunas</span></td>
                  </tr>
                  <tr>
                    <td><code style={{fontSize:11}}>INV-202603-042</code></td>
                    <td>01 Mar 2026</td>
                    <td>Rp 150.000</td>
                    <td><span className="badge badge-green">Lunas</span></td>
                  </tr>
                  <tr>
                    <td><code style={{fontSize:11}}>INV-202602-088</code></td>
                    <td>01 Feb 2026</td>
                    <td>Rp 150.000</td>
                    <td><span className="badge badge-green">Lunas</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal__actions mt-6">
              <button type="button" className="btn btn-secondary" onClick={() => setBillingTenant(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
