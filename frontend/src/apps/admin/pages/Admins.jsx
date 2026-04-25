import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'

const DUMMY = [
  { id:1, name:'Rizka Amalia',  email:'rizka@saas.com',  permissions:['users','categories','tenants'], status:'active', created:'2026-03-01' },
  { id:2, name:'Farid Salim',   email:'farid@saas.com',  permissions:['users','tenants'],              status:'active', created:'2026-03-15' },
  { id:3, name:'Laras Dewi',    email:'laras@saas.com',  permissions:['categories'],                   status:'inactive', created:'2026-04-01' },
]

const ALL_PERMS = [
  { key:'users',       label:'Kelola Pengguna' },
  { key:'categories',  label:'Kelola Kategori' },
  { key:'tenants',     label:'Kelola Tenant' },
  { key:'logs',        label:'Lihat Log Aktivitas' },
  { key:'admins',      label:'Kelola Admin' },
]

export default function Admins() {
  const [admins, setAdmins] = useState(DUMMY)
  const [show, setShow]     = useState(false)
  const [form, setForm]     = useState({ name:'', email:'', password:'', permissions:[] })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admins').then(r => setAdmins(r.data?.data || DUMMY)).catch(() => {})
  }, [])

  const togglePerm = (key) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key]
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Lengkapi semua field'); return }
    setSaving(true)
    setError('')
    try {
      const r = await api.post('/admins', { ...form, role: 'admin' })
      setAdmins(v => [...v, r.data?.data || { ...form, id: Date.now(), status:'active', created: new Date().toISOString().slice(0,10) }])
      setShow(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat admin')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus admin ini?')) return
    setAdmins(v => v.filter(a => a.id !== id))
    try { await api.delete(`/admins/${id}`) } catch {}
  }

  const filtered = admins.filter(a => {
    const q = search.toLowerCase()
    return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
  })

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header">
        <div>
          <h2 className="page-title">Manajemen Admin</h2>
          <p className="page-sub">{admins.length} admin terdaftar</p>
        </div>
        <button id="btn-add-admin" className="btn btn-primary" onClick={() => { setShow(true); setError(''); setForm({name:'',email:'',password:'',permissions:[]}) }}>
          + Tambah Admin
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="input-search-admins"
            className="form-input search-input"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-3 stagger">
        {filtered.map(admin => (
          <div key={admin.id} id={`admin-card-${admin.id}`} className="card card-pad animate-fade-in">
            <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
              <div className="avatar" style={{
                background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                width:48, height:48, fontSize:16, flexShrink:0
              }}>
                {admin.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:700, fontSize:15, color:'var(--text-primary)'}} className="truncate">{admin.name}</p>
                <p style={{fontSize:12, color:'var(--text-muted)'}} className="truncate">{admin.email}</p>
              </div>
              <span className={`badge ${admin.status==='active' ? 'badge-green' : 'badge-gray'}`}>
                {admin.status}
              </span>
            </div>

            <div style={{marginBottom:16}}>
              <p style={{fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:8, fontWeight:700}}>
                Permissions
              </p>
              <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                {admin.permissions.length > 0
                  ? admin.permissions.map(p => {
                      const pm = ALL_PERMS.find(x => x.key === p)
                      return <span key={p} className="badge badge-violet" style={{fontSize:10}}>{pm?.label || p}</span>
                    })
                  : <span style={{fontSize:12, color:'var(--text-muted)'}}>Tidak ada permission</span>
                }
              </div>
            </div>

            <div style={{display:'flex', gap:8, paddingTop:12, borderTop:'1px solid var(--border-subtle)'}}>
              <button id={`btn-edit-admin-${admin.id}`} className="btn btn-secondary btn-sm" style={{flex:1}}>✏ Edit Permission</button>
              <button id={`btn-del-admin-${admin.id}`} className="btn btn-ghost btn-sm" style={{color:'var(--danger-400)'}} onClick={() => handleDelete(admin.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      </div>

      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Tambah Admin Baru</h3>
            {error && <div className="auth-alert auth-alert--error" style={{marginBottom:12}}><span>⚠</span> {error}</div>}
            <form id="form-add-admin" onSubmit={handleCreate} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input className="form-input" placeholder="Nama admin" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="admin@umkm.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 8 karakter" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Permissions</label>
                <div style={{display:'flex', flexDirection:'column', gap:10, padding:'12px 14px', background:'var(--bg-elevated)', borderRadius:10}}>
                  {ALL_PERMS.map(p => (
                    <label key={p.key} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:13}}>
                      <input type="checkbox" id={`perm-${p.key}`}
                        checked={form.permissions.includes(p.key)}
                        onChange={() => togglePerm(p.key)}
                        style={{width:16,height:16,accentColor:'var(--primary-500)',cursor:'pointer'}}
                      />
                      <span style={{color:'var(--text-secondary)'}}>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal__actions">
                <button id="btn-cancel-admin" type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Batal</button>
                <button id="btn-save-admin" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Menyimpan...</> : 'Buat Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
