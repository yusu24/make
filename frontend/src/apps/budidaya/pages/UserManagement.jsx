import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import '../budidaya.css'

export default function UserManagement() {
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E9F0EC'
  }
  const badge = (bg, color) => ({
    padding: '4px 12px', borderRadius: '40px', fontSize: '11px', fontWeight: '800',
    background: bg, color, textTransform: 'uppercase', letterSpacing: '0.04em'
  })

  const totalPages = Math.ceil(total / PER_PAGE) || 1

  return (
    <div style={{ padding: '32px', background: '#F4F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '850', color: '#1B4332', margin: 0, letterSpacing: '-0.02em' }}>Manajemen Pengguna</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Kelola tingkat akses personel dan pantau sesi aktif di seluruh fasilitas.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
          borderRadius: '12px', border: 'none', background: '#1B4332', color: '#fff',
          fontWeight: '700', cursor: 'pointer', fontSize: '14px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL STAF',        val: stats.total,    sub: '+4 bulan ini',       subColor: '#059669', icon: 'groups',             iconBg: '#D1FAE5', iconColor: '#059669' },
          { label: 'AKTIF SEKARANG',    val: stats.active,   sub: 'Di 12 tambak',       subColor: '#64748B', icon: 'sensors',            iconBg: '#D1FAE5', iconColor: '#059669' },
          { label: 'MANAJER',           val: stats.managers, sub: 'Administrator Sistem',subColor: '#64748B', icon: 'admin_panel_settings',iconBg: '#F1F5F9', iconColor: '#64748B' },
          { label: 'KESEHATAN KEAMANAN',val: `${stats.security}%`, sub: 'MFA diaktifkan', subColor: '#059669', icon: 'check_circle', iconBg: '#D1FAE5', iconColor: '#059669' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.08em' }}>{s.label}</p>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{s.icon}</span>
              </div>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '850', color: '#1A1C1A', margin: 0 }}>{s.val}</h2>
            <p style={{ fontSize: '12px', fontWeight: '600', color: s.subColor, marginTop: '4px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ position: 'relative', width: '400px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '12px', color: '#94A3B8', fontSize: '20px' }}>search</span>
            <input
              placeholder="Cari berdasarkan nama, email atau peran..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ width: '100%', padding: '12px 16px 12px 48px', background: '#F1F5F9', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1.5px solid #E9F0EC', background: '#fff', color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>Filter
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1.5px solid #E9F0EC', background: '#fff', color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>Ekspor
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1.5px solid #F1F5F9' }}>
                {['Nama Staf', 'Email', 'Peran', 'Status', 'Posisi', ''].map(h => (
                  <th key={h} style={{ padding: '0 0 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>Belum ada staf terdaftar</td></tr>
              ) : staff.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i === staff.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700' }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '800', color: '#1B4332', margin: 0 }}>{u.name}</p>
                        <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{u.position ?? 'Staf Budidaya'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', fontSize: '13px', color: '#64748B' }}>{u.email ?? '-'}</td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={badge('#D1FAE5', '#059669')}>{u.role?.name ?? getRoleLabel(u.budidaya_role_id) ?? 'Pekerja'}</span>
                  </td>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'aktif' ? '#059669' : '#94A3B8' }}></span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: u.status === 'aktif' ? '#059669' : '#94A3B8' }}>
                        {u.status === 'aktif' ? 'AKTIF' : 'TIDAK AKTIF'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', fontSize: '13px', color: '#64748B' }}>{u.position ?? '-'}</td>
                  <td style={{ padding: '16px 0' }}>
                    <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1.5px solid #F1F5F9' }}>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Menampilkan {staff.length} dari {total} pengguna</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E9F0EC', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                background: page === p ? '#1B4332' : 'transparent',
                color: page === p ? '#fff' : '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
              }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E9F0EC', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Ikhtisar Kebijakan Akses</h3>
            <button style={{ background: 'none', border: 'none', color: '#059669', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Pengaturan Kebijakan<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { icon: 'security', title: 'Autentikasi Multi-Faktor', desc: 'Diterapkan untuk semua peran Manajer dan Admin. Direkomendasikan bagi Pekerja yang mengakses data tambak kritis.' },
              { icon: 'history', title: 'Sesi Berakhir Otomatis', desc: 'Sesi aktif secara otomatis dihentikan setelah 45 menit ketidakaktifan untuk memastikan keamanan.' },
            ].map(p => (
              <div key={p.title} style={{ padding: '24px', background: '#F8FAF9', borderRadius: '20px', border: '1px solid #E9F0EC' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{p.icon}</span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 8px' }}>{p.title}</h4>
                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, background: '#1B4332', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '850', color: '#fff', margin: '0 0 16px', lineHeight: '1.3' }}>Butuh Impor pengguna massal?</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>Unggah file CSV untuk menambahkan beberapa staf sekaligus ke kluster fasilitas tertentu.</p>
          </div>
          <button style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '12px', border: 'none', background: '#059669', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload_file</span>Unggah CSV Pengguna
          </button>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '500px', maxWidth: '90vw' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 24px' }}>Tambah Staf Baru</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[['Nama Lengkap*', 'name', 'text'], ['Email', 'email', 'email'], ['No. Telepon', 'phone', 'text'], ['Posisi / Jabatan', 'position', 'text']].map(([lbl, key, type]) => (
                <div key={key}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{lbl}</label>
                  <input type={type} required={key === 'name'} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Peran</label>
                <select value={formData.budidaya_role_id} onChange={e => setFormData({ ...formData, budidaya_role_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '14px', outline: 'none' }}>
                  <option value="">-- Pilih Peran --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '10px', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#64748B' }}>Batal</button>
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
