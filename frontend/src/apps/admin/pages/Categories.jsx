import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import './Shared.css'

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16']
const ICONS  = ['🛒','🐟','🔧','🏭','🍱','🏥','🏗️','📦']

// Map kategori bisnis → URL sistem yang bersangkutan
const SYSTEM_ROUTES = {
  'Toko Retail':   '/retail/dashboard',
  'Budidaya Ikan': '/budidaya/dashboard',
  'Jasa':          '/coming-soon',
  'Manufaktur':    '/coming-soon',
}

const DUMMY_CATS = [
  { id:1, name:'Toko Retail',   description:'Manajemen stok dan penjualan toko fisik',   tenant_count:142, active:true,  icon:'🛒', color:'#3b82f6' },
  { id:2, name:'Budidaya Ikan', description:'Pemantauan kolam ikan dan siklus panen',    tenant_count:89,  active:true,  icon:'🐟', color:'#10b981' },
  { id:3, name:'Jasa',          description:'Manajemen booking dan layanan jasa',         tenant_count:76,  active:true,  icon:'🔧', color:'#8b5cf6' },
  { id:4, name:'Manufaktur',    description:'Kontrol produksi dan manajemen bahan baku',  tenant_count:41,  active:true,  icon:'🏭', color:'#f59e0b' },
]

export default function Categories() {
  const navigate = useNavigate()
  const [cats, setCats]    = useState(DUMMY_CATS)
  const [show, setShow]    = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]    = useState({ name:'', description:'', icon:'🛒', color:'#3b82f6', active:true })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]      = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/categories').then(r => setCats(r.data?.data || DUMMY_CATS)).catch(() => {})
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name:'', description:'', icon:'🛒', color:'#3b82f6', active:true })
    setMsg('')
    setShow(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name:cat.name, description:cat.description, icon:cat.icon||'🛒', color:cat.color||'#3b82f6', active:cat.active })
    setMsg('')
    setShow(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form)
        setCats(v => v.map(c => c.id === editing.id ? { ...c, ...form } : c))
      } else {
        const r = await api.post('/categories', form)
        const newCat = r.data?.data || { ...form, id: Date.now(), tenant_count: 0 }
        setCats(v => [...v, newCat])
      }
      setMsg('Tersimpan!')
      setTimeout(() => { setShow(false); setMsg('') }, 800)
    } catch {
      setCats(v => editing ? v.map(c => c.id === editing.id ? { ...c, ...form } : c) : [...v, { ...form, id: Date.now(), tenant_count: 0 }])
      setShow(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kategori ini?')) return
    setCats(v => v.filter(c => c.id !== id))
    try { await api.delete(`/categories/${id}`) } catch {}
  }

  const toggleActive = async (id, cur) => {
    setCats(v => v.map(c => c.id === id ? { ...c, active: !cur } : c))
    try { await api.patch(`/categories/${id}/toggle`) } catch {}
  }

  const filtered = cats.filter(c => {
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  })

  return (
    <>
      <div className="animate-fade-in">
        <div className="page-header">
        <div>
          <h2 className="page-title">Kategori Bisnis</h2>
          <p className="page-sub">{cats.length} kategori tersedia</p>
        </div>
        <button id="btn-add-category" className="btn btn-primary" onClick={openAdd}>+ Tambah Kategori</button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            id="input-search-categories"
            className="form-input search-input"
            placeholder="Cari kategori..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-auto stagger">
        {filtered.map(cat => (
          <div key={cat.id} id={`cat-card-${cat.id}`} className="cat-card card card-pad animate-fade-in">
            <div className="cat-card__top">
              <div className="cat-card__icon" style={{ background: (cat.color||'#3b82f6') + '20' }}>
                <span>{cat.icon || '🏢'}</span>
              </div>
              <div className="cat-card__actions">
                <button
                  className={`toggle-btn ${cat.active ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                  onClick={() => toggleActive(cat.id, cat.active)}
                  title={cat.active ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
            <h3 className="cat-card__name">{cat.name}</h3>
            <p className="cat-card__desc">{cat.description}</p>
            <div className="cat-card__footer">
              <div className="cat-card__stat">
                <span className="cat-card__stat-num" style={{ color: cat.color||'#3b82f6' }}>
                  {cat.tenant_count}
                </span>
                <span className="cat-card__stat-lbl">Tenant</span>
              </div>
              <span className={`badge ${cat.active ? 'badge-green' : 'badge-gray'}`}>
                {cat.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <div className="cat-card__btns">
              <button
                id={`btn-view-cat-${cat.id}`}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => navigate(SYSTEM_ROUTES[cat.name] || `/categories/${encodeURIComponent(cat.name)}`)}
              >
                👁 Masuk Sistem
              </button>
              <button id={`btn-edit-cat-${cat.id}`} className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>✏</button>
              <button id={`btn-del-cat-${cat.id}`} className="btn btn-ghost btn-sm" style={{color:'var(--danger-400)'}} onClick={() => handleDelete(cat.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      </div>

      {/* Add/Edit Modal */}
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">{editing ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
            {msg && <div className="auth-alert auth-alert--success" style={{marginBottom:12}}><span>✓</span> {msg}</div>}
            <form id="form-category" onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Nama Kategori *</label>
                <input className="form-input" placeholder="cth. Toko Retail" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={3} placeholder="Deskripsi singkat kategori..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  style={{resize:'vertical'}} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    {ICONS.map(ic => (
                      <button key={ic} type="button"
                        style={{
                          width:36, height:36, borderRadius:8, border:'1.5px solid',
                          borderColor: form.icon===ic ? 'var(--primary-500)' : 'var(--border-default)',
                          background: form.icon===ic ? 'rgba(59,130,246,0.15)' : 'var(--bg-elevated)',
                          fontSize:18, cursor:'pointer', transition:'all 0.2s'
                        }}
                        onClick={() => setForm({...form, icon: ic})}
                      >{ic}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Warna</label>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                    {COLORS.map(c => (
                      <button key={c} type="button"
                        style={{
                          width:28, height:28, borderRadius:6, border:'2.5px solid',
                          borderColor: form.color===c ? '#fff' : 'transparent',
                          background: c, cursor:'pointer', transition:'transform 0.2s',
                          transform: form.color===c ? 'scale(1.2)' : 'scale(1)'
                        }}
                        onClick={() => setForm({...form, color: c})}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal__actions">
                <button id="btn-cancel-cat" type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Batal</button>
                <button id="btn-save-cat" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Menyimpan...</> : (editing ? 'Simpan Perubahan' : 'Tambah Kategori')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
