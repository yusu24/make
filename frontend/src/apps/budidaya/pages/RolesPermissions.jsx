import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import '../budidaya.css'

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
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E9F0EC'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748B', fontSize: 13 }}>Memuat data peran...</p>
    </div>
  )

  return (
    <div style={{ padding: '32px', background: '#F4F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '850', color: '#1B4332', margin: 0, letterSpacing: '-0.02em' }}>Peran & Izin</h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px', maxWidth: '580px', lineHeight: '1.5' }}>
            Konfigurasi tingkat akses administratif dan tentukan izin fitur khusus untuk anggota tim Anda di seluruh ekosistem akuakultur.
          </p>
        </div>
        <button onClick={() => setShowNewModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
          borderRadius: '12px', border: 'none', background: '#1B4332', color: '#fff',
          fontWeight: '700', cursor: 'pointer', fontSize: '14px'
        }}>
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
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isActive ? '#1B4332' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : '#64748B' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{role.is_system ? 'admin_panel_settings' : 'manage_accounts'}</span>
                </div>
                {role.is_system && (
                  <span style={{ fontSize: '9px', fontWeight: '800', background: '#D1FAE5', color: '#059669', padding: '3px 8px', borderRadius: '40px', textTransform: 'uppercase' }}>BAWAAN SISTEM</span>
                )}
                {isActive && !role.is_system && (
                  <span style={{ fontSize: '9px', fontWeight: '800', background: '#1A1C1A', color: '#fff', padding: '3px 8px', borderRadius: '40px', textTransform: 'uppercase' }}>MENGEDIT</span>
                )}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 6px' }}>{role.name}</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 16px' }}>{role.description ?? 'Konfigurasi izin akses'}</p>
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

      {/* Permission Matrix */}
      {activeRole && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>Matriks Izin</h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                Mengonfigurasi: <span style={{ color: '#1B4332', fontWeight: '700' }}>{activeRole.name}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => selectRole(activeRole)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                Batalkan Perubahan
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '12px 28px', borderRadius: '12px', border: 'none', background: '#1B4332',
                color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1
              }}>
                {saving ? 'Menyimpan...' : 'Simpan Matriks'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {CATEGORIES.map(cat => {
              const keys = Object.entries(DEFAULT_PERMISSIONS).filter(([, v]) => v.category === cat)
              return (
                <section key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>{CATEGORY_ICONS[cat]}</span>
                    <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{cat}</h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
                    {keys.map(([key, meta]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A1C1A', margin: 0 }}>{meta.label}</p>
                          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{meta.desc}</p>
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

      {/* Important Note */}
      <div style={{ display: 'flex', gap: '16px', padding: '24px', background: '#D8F3DC', borderRadius: '20px', border: '1px solid #B7E4C7', alignItems: 'flex-start' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1B4332', margin: '0 0 6px' }}>Catatan Penting</h4>
          <p style={{ fontSize: '13px', color: '#2D6A4F', lineHeight: '1.6', margin: 0 }}>
            Perubahan pada peran <strong>{activeRole?.name ?? 'yang dipilih'}</strong> akan memengaruhi semua staf yang memiliki peran ini. Semua pengguna yang terpengaruh akan menerima pemberitahuan tentang pembaruan hak akses mereka setelah disimpan.
          </p>
        </div>
      </div>

      {/* New Role Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '420px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1A1C1A', margin: '0 0 24px' }}>Buat Peran Baru</h3>
            <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nama Peran</label>
                <input
                  required value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                  placeholder="Contoh: Teknisi Kolam"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} style={{ padding: '12px', border: '1.5px solid #E9F0EC', borderRadius: '10px', background: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#64748B' }}>Batal</button>
                <button type="submit" style={{ padding: '12px', border: 'none', borderRadius: '10px', background: '#1B4332', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Buat Peran</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
