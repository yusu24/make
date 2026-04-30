import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import '../budidaya.css'
import { LoadingButton } from '../components/UXComponents'

const DEFAULT_PERMISSIONS = {
  lihat_laporan:    { label: 'Lihat Laporan',    desc: 'Akses semua bagan kinerja',         category: 'Data & Analitik' },
  ekspor_data:      { label: 'Ekspor Data',       desc: 'Unduh laporan CSV/PDF',             category: 'Data & Analitik' },
  bagikan_analitik: { label: 'Bagikan Analitik',  desc: 'Kirim laporan ke email eksternal',  category: 'Data & Analitik' },
  kelola_kolam:     { label: 'Kelola Kolam',      desc: 'Buat dan edit parameter kolam',     category: 'Operasi Tambak' },
  hapus_kolam:      { label: 'Hapus Kolam',       desc: 'Hapus catatan kolam secara permanen',category: 'Operasi Tambak' },
  ganti_alarm:      { label: 'Ganti Alarm',       desc: 'Abaikan peringatan kesehatan kritis',category: 'Operasi Tambak' },
  tambah_pengguna:  { label: 'Tambah Pengguna',   desc: 'Undang staf baru ke tambak',       category: 'Manajemen Tim' },
  edit_peran:       { label: 'Edit Peran Pengguna',desc: 'Ubah tingkat izin',                category: 'Manajemen Tim' },
  hapus_pengguna:   { label: 'Hapus Pengguna',    desc: 'Cabut semua akses segera',          category: 'Manajemen Tim' },
}

const CATEGORIES = ['Data & Analitik', 'Operasi Tambak', 'Manajemen Tim']
const CATEGORY_ICONS = { 'Data & Analitik': 'analytics', 'Operasi Tambak': 'water_drop', 'Manajemen Tim': 'groups' }

const sectionHeader = (icon, title) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </div>
    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1B4332', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
  </div>
)

export default function RolesPermissions() {
  const [roles, setRoles]           = useState([])
  const [activeRole, setActiveRole] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newRoleName, setNewRoleName]   = useState('')

  useEffect(() => { fetchRoles() }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/roles')
      const list = data.data ?? []
      setRoles(list)
      if (list.length > 0 && !activeRole) {
        selectRole(list[1] ?? list[0]) // default to 2nd role (Manajer)
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const selectRole = (role) => {
    setActiveRole(role)
    // Merge stored perms with defaults so all keys exist
    const merged = {}
    Object.keys(DEFAULT_PERMISSIONS).forEach(key => {
      merged[key] = role.permissions?.[key] ?? false
    })
    setPermissions(merged)
  }

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!activeRole) return
    setSaving(true)
    try {
      await api.put(`/budidaya/roles/${activeRole.id}`, {
        name: activeRole.name,
        description: activeRole.description,
        permissions,
      })
      alert('Matriks izin berhasil disimpan!')
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    if (!newRoleName.trim()) return
    try {
      await api.post('/budidaya/roles', { name: newRoleName })
      setNewRoleName('')
      setShowNewModal(false)
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat peran')
    }
  }

  const handleDeleteRole = async (role) => {
    if (role.is_system) return alert('Peran bawaan sistem tidak bisa dihapus.')
    if (!confirm(`Hapus peran "${role.name}"?`)) return
    try {
      await api.delete(`/budidaya/roles/${role.id}`)
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus')
    }
  }

  const cardStyle = {
    background: '#fff', borderRadius: '24px', padding: '28px',
    background: '#fff', borderRadius: '20px', padding: '20px',
    border: '1px solid #E9F0EC'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 13 }}>Memuat data peran...</p>
    </div>
  )

  return (
    <div className="aq-container">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="aq-page-title">Peran & izin</h1>

        </div>
        <button className="btn btn-primary" onClick={() => setShowNewModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_moderator</span>
          Buat Peran Baru
        </button>
      </div>

      {/* Role Selection */}
      <div style={{ display: 'flex', gap: '24px', overflowX: 'auto' }}>
        {roles.map(role => {
          const isActive = activeRole?.id === role.id
          return (
            <div key={role.id} onClick={() => selectRole(role)} style={{
              ...cardStyle,
              flex: '1', minWidth: '180px',
              cursor: 'pointer',
              border: isActive ? '2px solid #1B4332' : '1px solid #E9F0EC',
              transition: 'all 0.2s',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isActive ? '#1B4332' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : '#475569' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{role.is_system ? 'admin_panel_settings' : 'manage_accounts'}</span>
                </div>
                {role.is_system && (
                  <span style={{ fontSize: '9px', fontWeight: '700', background: '#D1FAE5', color: '#059669', padding: '3px 8px', borderRadius: '40px' }}>Bawaan sistem</span>
                )}
                {isActive && !role.is_system && (
                  <span style={{ fontSize: '9px', fontWeight: '700', background: '#1A1C1A', color: '#fff', padding: '3px 8px', borderRadius: '40px' }}>Mengedit</span>
                )}
              </div>
              <h3 className="aq-section-title" style={{ fontSize: '17px', marginBottom: '6px' }}>{role.name}</h3>
              <p className="aq-small-text" style={{ margin: '0 0 16px' }}>{role.description ?? 'Konfigurasi izin akses'}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1B4332', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isActive ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span> Sedang Dipilih</>
                  ) : (
                    <><span>Edit Izin</span><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span></>
                  )}
                </span>
                {!role.is_system && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteRole(role) }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {activeRole && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h3 className="aq-section-title" style={{ fontSize: '20px' }}>Matriks izin</h3>
              <p className="aq-body-text" style={{ marginTop: '4px' }}>
                Mengonfigurasi: <span style={{ color: '#1B4332', fontWeight: '700' }}>{activeRole.name}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => selectRole(activeRole)} style={{ background: 'none', border: 'none', color: '#475569', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                Batalkan perubahan
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '12px 28px', borderRadius: '12px', border: 'none', background: '#1B4332',
                color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1
              }}>
                {saving ? 'Menyimpan...' : 'Simpan matriks'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {CATEGORIES.map(cat => {
              const keys = Object.entries(DEFAULT_PERMISSIONS).filter(([, v]) => v.category === cat)
              return (
                <section key={cat}>
                  {sectionHeader(CATEGORY_ICONS[cat], cat)}
                  <div className="aq-grid-3" style={{ gap: '24px' }}>
                    {keys.map(([key, meta]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A1C1A', margin: 0 }}>{meta.label}</p>
                          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{meta.desc}</p>
                        </div>
                        <div
                          onClick={() => togglePermission(key)}
                          style={{
                            width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
                            background: permissions[key] ? '#1B4332' : '#E2E8F0',
                            position: 'relative', cursor: 'pointer', transition: '0.2s', marginLeft: '16px'
                          }}
                        >
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: '3px', left: permissions[key] ? '23px' : '3px',
                            transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', padding: '24px', background: '#D8F3DC', borderRadius: '20px', border: '1px solid #B7E4C7', alignItems: 'flex-start' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1B4332', margin: '0 0 6px' }}>Catatan penting</h4>
          <p style={{ fontSize: '13px', color: '#2D6A4F', lineHeight: '1.6', margin: 0 }}>
            Perubahan pada peran <strong>{activeRole?.name ?? 'yang dipilih'}</strong> akan memengaruhi semua staf yang memiliki peran ini. Semua pengguna yang terpengaruh akan menerima pemberitahuan tentang pembaruan hak akses mereka setelah disimpan.
          </p>
        </div>
      </div>

      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '420px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 24px' }}>Buat peran baru</h3>
            <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nama peran</label>
                <input
                  required value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                  placeholder="Contoh: Teknisi kolam"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewModal(false)}>Batal</button>
                <LoadingButton loading={loading} type="submit" className="btn btn-primary">Buat Peran</LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
