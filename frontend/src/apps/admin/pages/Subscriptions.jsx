import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { getAvatarStyle, getInitials } from '../../../lib/avatar'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import './Shared.css'

const DUMMY_TENANTS = [
  { id:1, name:'Ahmad Suharto',  email:'ahmad@retail.com', category:'Toko Retail',   status:'active',   plan:'Pro',   tenant_id:'TN-001', joined:'2026-03-10' },
  { id:2, name:'Siti Rahayu',   email:'siti@ikan.com',    category:'Budidaya Hewan', status:'active',   plan:'Basic', tenant_id:'TN-002', joined:'2026-03-15' },
  { id:3, name:'Budi Santoso',  email:'budi@jasa.com',    category:'Jasa',          status:'pending',  plan:'-',     tenant_id:'TN-003', joined:'2026-04-01' },
  { id:4, name:'Dewi Lestari',  email:'dewi@mftr.com',    category:'Manufaktur',    status:'active',   plan:'Pro',   tenant_id:'TN-004', joined:'2026-03-28' },
  { id:5, name:'Teguh Prasetyo',email:'teguh@retail.com', category:'Toko Retail',   status:'inactive', plan:'Basic', tenant_id:'TN-005', joined:'2026-02-20' },
]

const PLAN_BADGE = { Pro:'badge-violet', Basic:'badge-blue', Free:'badge-secondary', pro:'badge-violet', basic:'badge-blue', free:'badge-secondary', '-':'badge-secondary' }
const STATUS_BADGE = { active:'badge-green', pending:'badge-yellow', inactive:'badge-red', approved:'badge-green', rejected:'badge-red' }

const getPlanBadge = (plan) => {
  const p = (plan || '').toLowerCase()
  if (p === 'pro') return 'badge-violet'
  if (p === 'basic') return 'badge-blue'
  return 'badge-secondary'
}

const getStatusBadge = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'active' || s === 'approved') return 'badge-green'
  if (s === 'pending') return 'badge-yellow'
  if (s === 'rejected' || s === 'inactive') return 'badge-red'
  return 'badge-gray'
}

const getPlanStyle = (plan) => {
  const p = (plan || '').toLowerCase()
  if (p === 'pro') {
    return {
      background: '#f3e8ff',
      border: '1px solid #d8b4fe',
      color: '#111827',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: 500,
    }
  }
  if (p === 'basic') {
    return {
      background: '#dbeafe',
      border: '1px solid #93c5fd',
      color: '#111827',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: 500,
    }
  }
  return {
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#111827',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: 13,
    fontWeight: 500,
  }
}

const getStatusStyle = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'active' || s === 'approved') {
    return {
      background: '#dcfce7',
      border: '1px solid #86efac',
      color: '#111827',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: 500,
    }
  }
  if (s === 'pending') {
    return {
      background: '#fef3c7',
      border: '1px solid #fcd34d',
      color: '#111827',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: 500,
    }
  }
  if (s === 'rejected' || s === 'inactive') {
    return {
      background: '#ffe4e6',
      border: '1px solid #fda4af',
      color: '#111827',
      borderRadius: '6px',
      padding: '4px 10px',
      fontSize: 13,
      fontWeight: 500,
    }
  }
  return {
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#111827',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: 13,
    fontWeight: 500,
  }
}

export default function Subscriptions({ defaultTab = 'list' }) {
  const [tenants, setTenants] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])
  const [billingTenant, setBillingTenant] = useState(null)
  const [tenantInvoices, setTenantInvoices] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

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

  const handleResendInvoice = async (tenant) => {
    if (!window.confirm(`Kirim invoice ke ${tenant.email}?`)) return
    try {
      const res = await api.post(`/admin/tenants/${tenant.tenant_id}/resend-invoice`)
      alert(res.data.message || 'Invoice berhasil dikirim')
    } catch (err) {
      alert('Gagal mengirim invoice: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleOpenBilling = async (tenant) => {
    setBillingTenant(tenant)
    setLoadingInvoices(true)
    try {
      const res = await api.get(`/admin/finance/invoices?search=${tenant.tenant_id}`)
      setTenantInvoices(res.data.data || [])
    } catch (err) {
      setTenantInvoices([])
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleResendRequestInvoice = async (req) => {
    if (!window.confirm(`Kirim invoice tagihan untuk request berlangganan ini?`)) return
    try {
      const res = await api.post(`/admin/tenants/${req.tenant_id}/resend-invoice`)
      alert(res.data.message || 'Invoice berhasil dikirim')
    } catch (err) {
      alert('Gagal mengirim invoice: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDownloadPdf = async (invId) => {
    try {
      const response = await api.get(`/admin/finance/invoices/${invId}/download-pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice_${invId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert('Gagal mengunduh PDF Invoice')
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
            <h2 className="page-title">{activeTab === 'requests' ? 'Permintaan Langganan' : 'Pelanggan Langganan'}</h2>
            <p className="page-sub">{activeTab === 'requests' ? 'Verifikasi pembayaran dan aktivasi paket langganan customer' : 'Kelola data pelanggan yang sedang berlangganan aktif'}</p>
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="filter-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <div className="search-wrap" style={{ minWidth: 260, maxWidth: 320 }}>
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
                    <th>Email</th>
                    <th>Paket</th>
                    <th>Status</th>
                    <th>Bergabung</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && activeTab === 'list' ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                          <span>Memuat data langganan...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        Tidak ada pelanggan ditemukan
                      </td>
                    </tr>
                  ) : tPaginatedData.map(t => (
                    <tr key={t.id}>
                      <td><code style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{t.tenant_id}</code></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={getAvatarStyle(t.name || t.tenant_id, 32)}>
                            {getInitials(t.name)}
                          </div>
                          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{t.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.email}</td>
                      <td>
                        <select
                          style={{
                            ...getPlanStyle(t.plan),
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                          value={t.plan}
                          onChange={e => handlePlanChange(t, e.target.value)}
                        >
                          <option value="Free">Free</option>
                          <option value="Basic">Basic</option>
                          <option value="Pro">Pro</option>
                        </select>
                      </td>
                      <td><span style={getStatusStyle(t.status)}>{t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()) : 'Active'}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.joined}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenBilling(t)} title="Riwayat Invoice">👁</button>
                          <button className="btn btn-primary btn-sm" onClick={() => handleResendInvoice(t)} title="Kirim Invoice">✉</button>
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
                  <th>Tenant ID</th>
                  <th>Nama Tenant</th>
                  <th>Paket Dipilih</th>
                  <th>Waktu Request</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && activeTab === 'requests' ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                        <span>Memuat data permintaan...</span>
                      </div>
                    </td>
                  </tr>
                ) : rPaginatedData.map(req => (
                  <tr key={req.id}>
                    <td><code style={{ fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>{req.tenant_id}</code></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={getAvatarStyle(req.tenant?.business_name || req.tenant_id, 32)}>
                          {getInitials(req.tenant?.business_name || req.tenant_id)}
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                          {req.tenant?.business_name || req.tenant_id}
                        </span>
                      </div>
                    </td>
                    <td><span style={getPlanStyle(req.plan)}>{req.plan ? (req.plan.charAt(0).toUpperCase() + req.plan.slice(1).toLowerCase()) : 'Free'}</span></td>
                    <td style={{ fontSize: 13 }}>{new Date(req.created_at).toLocaleString('id-ID')}</td>
                    <td><span style={getStatusStyle(req.status || 'pending')}>{req.status ? (req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()) : 'Pending'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleResendRequestInvoice(req)} title="Kirim Tagihan">✉</button>
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(req.id)} title="Aktifkan">✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleReject(req.id)} title="Tolak">✗</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && requests.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada permintaan langganan baru.</td></tr>
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
            <h3 className="modal__title">Riwayat Invoice</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Menampilkan riwayat invoice untuk <strong style={{ fontWeight: 600 }}>{billingTenant.name}</strong> ({billingTenant.tenant_id})
            </p>
            
            <div className="table-wrap table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>No. Invoice</th>
                    <th>Tanggal</th>
                    <th>Nominal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>Memuat data invoice...</td>
                    </tr>
                  ) : tenantInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>Belum ada invoice</td>
                    </tr>
                  ) : (
                    tenantInvoices.map(inv => (
                      <tr key={inv.id}>
                        <td><code style={{fontSize:11}}>{inv.id}</code></td>
                        <td>{inv.date}</td>
                        <td>Rp {Number(inv.amount).toLocaleString('id-ID')}</td>
                        <td><span className={`badge ${inv.status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{inv.status === 'paid' ? 'Lunas' : 'Belum Lunas'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDownloadPdf(inv.id)} title="Unduh PDF Invoice">📥</button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleResendInvoice(billingTenant)} title="Kirim Invoice">✉</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
