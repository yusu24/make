import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'
import '../budidaya.css'
import { LoadingButton } from '../components/UXComponents'

const getPermissions = (terms) => {
  const opCategory = terms.isTanaman ? 'Operasi Kebun' : (terms.category === 'aquaculture' ? 'Operasi Tambak' : 'Operasi Peternakan')
  const opIcon = terms.iconUnitDefault || (terms.isTanaman ? 'grass' : (terms.category === 'aquaculture' ? 'water_drop' : 'home_work'))

  return {
    lihat_laporan:    { label: 'Lihat Laporan',    desc: 'Akses semua bagan kinerja & hasil', category: 'Data & Analitik', icon: 'analytics' },
    ekspor_data:      { label: 'Ekspor Data',       desc: 'Unduh laporan CSV/PDF',             category: 'Data & Analitik', icon: 'download' },
    bagikan_analitik: { label: 'Bagikan Analitik',  desc: 'Kirim laporan ke email eksternal',  category: 'Data & Analitik', icon: 'share' },
    kelola_kolam:     { label: `Kelola ${terms.unit || 'Unit'}`, desc: `Buat dan edit data ${terms.unitLower || 'unit'}`, category: opCategory, icon: opIcon },
    hapus_kolam:      { label: `Hapus ${terms.unit || 'Unit'}`,  desc: `Hapus catatan ${terms.unitLower || 'unit'} secara permanen`, category: opCategory, icon: 'delete' },
    ganti_alarm:      { label: 'Ganti Alarm & Sensor', desc: 'Abaikan peringatan kondisi lingkungan kritis', category: opCategory, icon: 'notifications_active' },
    tambah_pengguna:  { label: 'Tambah Pengguna',   desc: `Undang staf operator baru ke sistem`, category: 'Manajemen Tim', icon: 'person_add' },
    edit_peran:       { label: 'Edit Peran Pengguna',desc: 'Ubah tingkat izin staf',            category: 'Manajemen Tim', icon: 'manage_accounts' },
    hapus_pengguna:   { label: 'Hapus Pengguna',    desc: 'Cabut semua akses staf segera',     category: 'Manajemen Tim', icon: 'person_remove' },
  }
}

export default function RolesPermissions() {
  const terms = useBudidayaTerms()
  const DEFAULT_PERMISSIONS = getPermissions(terms)
  const [roles, setRoles]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [saving, setSaving]         = useState(false)
  
  const [editingRole, setEditingRole] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: {}
  })

  useEffect(() => { fetchRoles() }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/roles')
      setRoles(data.data ?? [])
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    
    // Merge stored perms with defaults so all keys exist
    const merged = {}
    Object.keys(DEFAULT_PERMISSIONS).forEach(key => {
      merged[key] = role.permissions?.[key] ?? false
    })
    
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: merged
    })
    setShowModal(true)
  }

  const handleCreateNew = () => {
    setEditingRole(null)
    const emptyPerms = {}
    Object.keys(DEFAULT_PERMISSIONS).forEach(key => {
      emptyPerms[key] = false
    })
    setForm({
      name: '',
      description: '',
      permissions: emptyPerms
    })
    setShowModal(true)
  }

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingRole) {
        await api.put(`/budidaya/roles/${editingRole.id}`, form)
        alert('Peran berhasil diperbarui')
      } else {
        await api.post('/budidaya/roles', form)
        alert('Peran baru berhasil dibuat')
      }
      setShowModal(false)
      fetchRoles()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan peran')
    } finally { setSaving(false) }
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

  return (
    <div className="aq-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_moderator</span>
          Buat Peran Baru
        </button>
      </div>

      {/* Table Section */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '0', border: '1px solid #E9F0EC', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>Nama Peran</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>Deskripsi</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>Hak Akses Aktif</th>
              <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1E293B', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Memuat data peran...</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Belum ada peran terdaftar.</td></tr>
            ) : (
              roles.map(role => {
                // Count active permissions
                const activePermsCount = Object.values(role.permissions || {}).filter(Boolean).length
                return (
                  <tr key={role.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E8F5ED', color: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                          {role.name ? role.name.charAt(0).toUpperCase() : 'R'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '700', color: '#1A1C1A', fontSize: '14px' }}>{role.name}</p>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{role.is_system ? 'Bawaan Sistem' : 'Kustom Tenant'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 24px', fontSize: '13px', color: '#64748B' }}>
                      {role.description || '-'}
                    </td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#E8F5ED', color: '#2D6A4F' }}>
                        {activePermsCount} Izin Aktif
                      </span>
                    </td>
                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(role)}
                          style={{ border: 'none', background: '#F1F5F9', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                          Edit
                        </button>
                        {!role.is_system && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            style={{ border: 'none', background: '#FEE2E2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#EF4444' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E9F0EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: '#2D6A4F' }}>verified_user</span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1C1A', margin: 0 }}>
                  {editingRole ? 'Edit Peran & Izin' : 'Buat Peran Baru'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <form id="roleForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Nama Peran</label>
                    <input
                      required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder={terms.isTanaman ? "Contoh: Pengelola Lahan" : `Contoh: Pengelola ${terms.unit}`}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Deskripsi (Opsional)</label>
                    <input
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      placeholder={`Contoh: Mengurus ${terms.unitLower} harian`}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E9F0EC', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '12px' }}>Pilih Hak Akses</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {Object.entries(DEFAULT_PERMISSIONS).map(([key, meta]) => {
                      const isActive = form.permissions[key]
                      return (
                        <div 
                          key={key}
                          onClick={() => togglePermission(key)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                            border: isActive ? '1.5px solid #2D6A4F' : '1.5px solid #E9F0EC',
                            background: isActive ? '#F0FDF4' : '#fff'
                          }}
                        >
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isActive ? '#1B4332' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : '#64748B' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{meta.icon}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: isActive ? '#1B4332' : '#334155' }}>{meta.label}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '10px', color: isActive ? '#2D6A4F' : '#64748B' }}>{meta.category}</p>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                             <div style={{
                                width: '32px', height: '18px', borderRadius: '12px',
                                background: isActive ? '#1B4332' : '#E2E8F0',
                                position: 'relative', transition: '0.2s'
                              }}>
                                <div style={{
                                  width: '12px', height: '12px', borderRadius: '50%', background: '#fff',
                                  position: 'absolute', top: '3px', left: isActive ? '17px' : '3px',
                                  transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }} />
                              </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </form>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E9F0EC', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#F8FAFC', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', fontSize: '13px' }}>Batal</button>
              <LoadingButton loading={saving} type="submit" form="roleForm" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                {editingRole ? 'Simpan Perubahan' : 'Buat Peran'}
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
