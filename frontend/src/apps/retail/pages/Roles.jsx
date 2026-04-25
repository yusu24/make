import { useState, useEffect } from 'react'
import { api } from "../../../lib/api";
import Modal from "../../../components/Modal";
import { Edit3, Trash2 } from 'lucide-react';


const MODULE_PERMISSIONS = [
  { id: 'pos', label: 'Kasir (POS)' },
  { id: 'catalog', label: 'Katalog Produk' },
  { id: 'inventory', label: 'Manajemen Stok & Logistik' },
  { id: 'master', label: 'Data Master (Kategori, Satuan, Supplier, Pelanggan)' },
  { id: 'staff', label: 'Data Pegawai' },
  { id: 'roles', label: 'Manajemen Hak Akses' },
  { id: 'reports', label: 'Laporan Analitik' },
  { id: 'finance', label: 'Keuangan' },
]

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/retail/roles')
      setRoles(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleEdit = (role) => {
    setEditingRole(role)
    setShowModal(true)
    setErrorMsg('')
  }

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jabatan ini?')) {
      try {
        await api.delete(`/retail/roles/${id}`)
        fetchRoles()
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus role')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    const formData = new FormData(e.target)
    
    // Kumpulkan permissions dari checkbox
    const permissions = []
    MODULE_PERMISSIONS.forEach(perm => {
      if (formData.get(`perm_${perm.id}`) === 'on') {
        permissions.push(perm.id)
      }
    })

    const payload = {
      name: formData.get('name'),
      permissions,
    }

    try {
      if (editingRole) {
        await api.put(`/retail/roles/${editingRole.id}`, payload)
      } else {
        await api.post('/retail/roles', payload)
      }
      setShowModal(false)
      fetchRoles()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Manajemen Jabatan (Hak Akses)</h2>
          <p className="page-sub">Atur kasta dan izin akses fitur untuk berbagai posisi karyawan Anda.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { setEditingRole(null); setShowModal(true); setErrorMsg(''); }}
        >
          + Jabatan Baru
        </button>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Struktur Jabatan & Hak Akses</h3>
          </div>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-800 text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
             {roles.length} Roles Defined
          </span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6" style={{ width: '25%' }}>Nama Jabatan</th>
              <th style={{ width: '55%' }}>Izin Akses Fitur</th>
              <th style={{ width: '20%', textAlign: 'right' }} className="pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="3" className="py-20 text-center text-slate-400 font-800">Menyinkronkan Jabatan...</td></tr>
            ) : roles.length === 0 ? (
               <tr><td colSpan="3" style={{ textAlign: 'center', padding: 20 }}>Belum ada kustomisasi jabatan.</td></tr>
            ) : (
              roles.map(r => (
                <tr key={r.id}>
                  <td className="pl-6">
                    <span className="text-slate-800">{r.name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(!r.permissions || r.permissions.length === 0) && <span style={{ color: 'var(--text-muted)' }}>Tidak ada akses</span>}
                      {r.permissions?.map(p => {
                        const m = MODULE_PERMISSIONS.find(x => x.id === p)
                        return <span key={p} className="badge badge-gray" style={{ fontSize: 10 }}>{m ? m.label : p}</span>
                      })}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(r)}><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-600)' }} onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRole ? "Edit Jabatan" : "Tambah Jabatan Baru"} maxWidth="600px">
        {errorMsg && <div style={{ color: 'red', marginBottom: 16 }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Jabatan</label>
            <input name="name" className="form-input" defaultValue={editingRole?.name} required placeholder="Contoh: Manajer Gudang, Kasir Shift Pagi"/>
          </div>
          
          <div className="form-group">
            <label className="form-label">Izin Akses Fitur</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              {MODULE_PERMISSIONS.map(perm => (
                <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name={`perm_${perm.id}`} 
                    defaultChecked={editingRole && editingRole.permissions?.includes(perm.id)} 
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>Centang modul apa saja yang boleh dibuka oleh jabatan ini.</small>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingRole ? "Simpan Perubahan" : "Buat Jabatan"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
