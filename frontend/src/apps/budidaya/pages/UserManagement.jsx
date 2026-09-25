import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { UserPlus, Trash2, Search, Filter, Download } from '@/constants/icons'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton } from '../components/UXComponents'
import { BudidayaTableSkeleton } from '../components/BudidayaTableSkeleton'
import { BudidayaPageSkeleton } from '../components/BudidayaPageSkeleton'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'
import BudidayaPagination from '../components/BudidayaPagination'

export default function UserManagement() {
  const terms = useBudidayaTerms()
  const [staff, setStaff]     = useState([])
  const [stats, setStats]     = useState({ total: 124, active: 48, managers: 12, security: 98 })
  const [roles, setRoles]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData]   = useState({ name: '', email: '', phone: '', position: '', budidaya_role_id: '', status: 'aktif' })
  const [saving, setSaving]   = useState(false)
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const PER_PAGE = 10

  useEffect(() => { fetchData() }, [search, page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [staffRes, rolesRes] = await Promise.all([
        api.get('/budidaya/staff', { params: { search, page } }),
        api.get('/budidaya/roles'),
      ])
      const staffData = staffRes.data.data
      // Handle both paginated and plain array responses
      if (staffData?.data) {
        setStaff(staffData.data)
        setTotal(staffData.total ?? staffData.data.length)
      } else {
        setStaff(Array.isArray(staffData) ? staffData : [])
        setTotal(Array.isArray(staffData) ? staffData.length : 0)
      }
      if (staffRes.data.stats) setStats(staffRes.data.stats)
      setRoles(rolesRes.data.data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/budidaya/staff', formData)
      setShowModal(false)
      setFormData({ name: '', email: '', phone: '', position: '', budidaya_role_id: '', status: 'aktif' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus staf ini?')) return
    await api.delete(`/budidaya/staff/${id}`)
    fetchData()
  }

  const getRoleLabel = (roleId) => roles.find(r => r.id === roleId)?.name ?? '-'

  const cardStyle = {
    background: '#fff', borderRadius: '24px', padding: '28px',
    border: '1px solid #E9F0EC'
  }
  const badge = (bg, color) => ({
    padding: '4px 12px', borderRadius: '40px', fontSize: '11px', fontWeight: '700',
    background: bg, color
  })

  const totalPages = Math.ceil(total / PER_PAGE) || 1

  if (loading && staff.length === 0) {
    return <BudidayaPageSkeleton variant="table" kpiCount={4} cols={6} message="Memuat manajemen tim & staf..." />
  }

  return (
    <div className="aq-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>

        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
        >
          <UserPlus size={16} />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Standard KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Staf', val: stats.total, sub: 'Pengguna terdaftar', icon: 'groups', iconBg: '#D1FAE5', iconColor: '#059669' },
          { label: 'Aktif Sekarang', val: stats.active, sub: `Di unit ${terms.unitLower}`, icon: 'sensors', iconBg: '#D1FAE5', iconColor: '#059669' },
          { label: 'Manajer / Admin', val: stats.managers, sub: 'Hak akses penuh', icon: 'admin_panel_settings', iconBg: '#F1F5F9', iconColor: '#475569' },
          { label: 'Keamanan Akun', val: `${stats.security}%`, sub: 'Tingkat keamanan', icon: 'check_circle', iconBg: '#D1FAE5', iconColor: '#059669' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-['Inter']">{s.label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
            </div>
            <div>
              <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">{s.val}</div>
              <p className="text-xs text-slate-400 font-medium mt-1 font-['Inter']">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #E9F0EC', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748B' }} />
            <input
              placeholder="Cari berdasarkan nama, email atau peran..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ width: '100%', height: '38px', padding: '0 14px 0 36px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 14px', borderRadius: '12px', fontSize: '13px' }}>
              <Filter size={15} />Filter
            </button>
            <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 14px', borderRadius: '12px', fontSize: '13px' }}>
              <Download size={15} />Ekspor
            </button>
          </div>
        </div>

          <Table>
            <TableHeader>
              <TableRow isHoverable={false}>
                {['Nama Staf', 'Email', 'Peran', 'Status', 'Posisi', 'Aksi'].map((h, idx) => (
                  <TableHeaderCell key={h} style={idx === 0 ? { paddingLeft: '24px' } : idx === 5 ? { paddingRight: '24px', textAlign: 'right' } : {}}>{h}</TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <BudidayaTableSkeleton rows={5} cols={6} />
              ) : staff.length === 0 ? (
                <TableRow><TableCell colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Belum ada staf terdaftar</TableCell></TableRow>
              ) : staff.map((u, i) => (
                <TableRow key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell style={{ paddingLeft: '24px' }}>
                    <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 500 }}>{u.name}</span>
                  </TableCell>
                  <TableCell isSecondary>{u.email ?? '-'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {u.role?.name ?? getRoleLabel(u.budidaya_role_id) ?? 'Pekerja'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: u.status === 'aktif' ? '#10b981' : '#94a3b8' }}></span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: u.status === 'aktif' ? '#059669' : '#64748B' }}>
                        {u.status === 'aktif' ? 'Aktif' : 'Tidak aktif'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell isSecondary>{u.position ?? '-'}</TableCell>
                  <TableCell style={{ textAlign: 'right', paddingRight: '24px' }}>
                    <div className="flex items-center justify-end">
                      <button
                        className="w-7 h-7 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100 flex items-center justify-center text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        onClick={() => handleDelete(u.id)}
                        title="Hapus Staf"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        {/* Pagination */}
        <BudidayaPagination
          currentPage={page}
          setCurrentPage={setPage}
          pageSize={PER_PAGE}
          totalPages={totalPages}
          totalItems={total}
        />
      </div>

      {/* Bottom */}
      <div className="aq-grid-2" style={{ gridTemplateColumns: 'minmax(0, 2fr) 1fr' }}>
        <style>{`
          @media (max-width: 1024px) {
            .aq-grid-2 { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="aq-section-title" style={{ fontSize: '18px' }}>Ikhtisar kebijakan akses</h3>
            <button style={{ background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Pengaturan kebijakan<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: 'security', title: 'Autentikasi multi-faktor', desc: 'Diterapkan untuk semua peran Manajer dan Admin. Direkomendasikan bagi Pekerja yang mengakses data operasional kritis.' },
              { icon: 'history', title: 'Sesi berakhir otomatis', desc: 'Sesi aktif secara otomatis dihentikan setelah 45 menit ketidakaktifan untuk memastikan keamanan.' },
            ].map(p => (
              <div key={p.title} style={{ padding: '24px', background: '#F8FAF9', borderRadius: '20px', border: '1px solid #E9F0EC' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{p.icon}</span>
                </div>
                <h4 className="aq-body-text" style={{ fontWeight: '800', color: '#1A1C1A', margin: '0 0 8px' }}>{p.title}</h4>
                <p className="aq-small-text" style={{ color: '#475569', lineHeight: '1.6', margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, background: '#1B4332', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="aq-section-title aq-text-white" style={{ fontSize: '18px', margin: '0 0 16px' }}>Butuh impor pengguna massal?</h3>
            <p className="aq-body-text aq-text-white-muted" style={{ lineHeight: '1.6', margin: 0 }}>Unggah file CSV untuk menambahkan beberapa staf sekaligus ke kluster fasilitas tertentu.</p>
          </div>
          <button style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '12px', border: 'none', background: '#059669', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>Unggah CSV pengguna
          </button>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '500px', maxWidth: '90vw', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 28px 20px',
              borderBottom: '1px solid #E9F0EC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#D8F3DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B4332' }}>person_add</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>Tambah Staf Baru</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0, marginTop: 2 }}>Daftarkan personel baru ke dalam sistem</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#F4F7F5', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['Nama Lengkap*', 'name', 'text'], ['Email', 'email', 'email'], ['No. Telepon', 'phone', 'text'], ['Posisi / Jabatan', 'position', 'text']].map(([lbl, key, type]) => (
                <div key={key}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>{lbl}</label>
                  <input type={type} required={key === 'name'} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: '6px' }}>Peran</label>
                <select value={formData.budidaya_role_id} onChange={e => setFormData({ ...formData, budidaya_role_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '14px', outline: 'none' }}>
                  <option value="">-- Pilih Peran --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '10px', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Batal</button>
                <button type="submit" disabled={saving} style={{ padding: '12px', border: 'none', borderRadius: '10px', background: '#1B4332', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Menyimpan...' : 'Tambah Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
