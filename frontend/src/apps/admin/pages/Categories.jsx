import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import Modal from '../../../components/Modal'
import './Shared.css'

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16']
const ICONS  = ['🛒','🐟','🔧','🏭','🍱','🏥','🏗️','📦']

// Map kategori bisnis → URL sistem yang bersangkutan
const SYSTEM_ROUTES = {
  'Toko Retail':      '/retail/dashboard',
  'Budidaya Ikan':    '/budidaya/dashboard',
  'Budidaya Tanaman': '/budidaya/dashboard',
  'Jasa':             '/coming-soon',
  'Manufaktur':       '/coming-soon',
  'Kuliner':          '/kuliner/admin',
}

const DUMMY_CATS = [
  { id:1, name:'Toko Retail',   description:'Manajemen stok dan penjualan toko fisik',   tenant_count:142, active:true,  icon:'🛒', color:'#3b82f6' },
  { id:2, name:'Budidaya Ikan', description:'Pemantauan kolam ikan dan siklus panen',    tenant_count:89,  active:true,  icon:'🐟', color:'#10b981' },
  { id:3, name:'Jasa',          description:'Manajemen booking dan layanan jasa',         tenant_count:76,  active:true,  icon:'🔧', color:'#8b5cf6' },
  { id:4, name:'Manufaktur',    description:'Kontrol produksi dan manajemen bahan baku',  tenant_count:41,  active:true,  icon:'🏭', color:'#f59e0b' },
  { id:5, name:'Kuliner',       description:'Manajemen restoran, cafe, dan pesanan online', tenant_count:56, active:true,  icon:'🍱', color:'#ec4899' },
]

export default function Categories() {
  const navigate = useNavigate()
  const { impersonateDemoSandbox } = useAuth()
  const [demoLoading, setDemoLoading] = useState(false)

  const handleEnterDemo = async (catName) => {
    const slugMap = {
      'Toko Retail': 'toko-retail',
      'Budidaya Ikan': 'budidaya-ikan',
      'Budidaya Tanaman': 'budidaya-tanaman',
      'Kuliner': 'kuliner',
    }
    const slug = slugMap[catName]
    if (!slug) {
      navigate(SYSTEM_ROUTES[catName] || `/categories/${encodeURIComponent(catName)}`)
      return
    }
    setDemoLoading(true)
    try {
      const redirect = await impersonateDemoSandbox(slug)
      navigate(redirect)
    } catch (err) {
      alert('Gagal memproses impersonate demo sandbox: ' + (err.response?.data?.message || err.message))
    } finally {
      setDemoLoading(false)
    }
  }

  const [cats, setCats]    = useState([])
  const [show, setShow]    = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]    = useState({ name:'', description:'', icon:'🛒', color:'#3b82f6', active:true, promo_text:'', discount_pct:0, promo_active:false, features_input:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]      = useState('')
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/categories')
      .then(r => setCats(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name:'', description:'', icon:'🛒', color:'#3b82f6', active:true, promo_text:'', discount_pct:0, promo_active:false, features_input:'' })
    setMsg('')
    setShow(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon || '🛒',
      color: cat.color || '#3b82f6',
      active: cat.active,
      promo_text: cat.promo_text || '',
      discount_pct: cat.discount_pct || 0,
      promo_active: cat.promo_active || false,
      features_input: cat.features_list ? cat.features_list.join(', ') : ''
    })
    setMsg('')
    setShow(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    
    const parsedFeatures = form.features_input 
      ? form.features_input.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const payload = {
      ...form,
      features_list: parsedFeatures
    }

    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload)
        setCats(v => v.map(c => c.id === editing.id ? { ...c, ...payload } : c))
      } else {
        const r = await api.post('/categories', payload)
        const newCat = r.data?.data || { ...payload, id: Date.now(), tenant_count: 0 }
        setCats(v => [...v, newCat])
      }
      setMsg('Tersimpan!')
      setTimeout(() => { setShow(false); setMsg('') }, 800)
    } catch {
      setCats(v => editing ? v.map(c => c.id === editing.id ? { ...c, ...payload } : c) : [...v, { ...payload, id: Date.now(), tenant_count: 0 }])
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
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></span>
              <span style={{ fontSize: 16 }}>Memuat data kategori...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Tidak ada kategori ditemukan
          </div>
        ) : filtered.map(cat => (
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
            {cat.promo_active && cat.discount_pct > 0 && (
              <div className="cat-card__promo-badge" style={{
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 8,
                alignSelf: 'flex-start'
              }}>
                <span>🔥 PROMO {cat.discount_pct}% OFF</span>
              </div>
            )}
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
                onClick={() => handleEnterDemo(cat.name)}
                disabled={demoLoading}
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
      <Modal isOpen={show} onClose={() => setShow(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori Baru'} maxWidth="580px">
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
          <div className="form-group">
            <label className="form-label">Fitur Utama (Pills) — Pisahkan dengan koma</label>
            <input className="form-input" placeholder="cth. Kasir POS, Stok Realtime, Laporan Penjualan" 
              value={form.features_input} onChange={e => setForm({...form, features_input: e.target.value})} />
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

          {/* Category Promo Section */}
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16, marginTop: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paket Promo Kategori</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Teks Deskripsi Promo</label>
                <input className="form-input" placeholder="cth. Launching Promo 30%!" value={form.promo_text}
                  onChange={e => setForm({...form, promo_text: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label className="form-label">Diskon (%)</label>
                <input type="number" min="0" max="100" className="form-input" placeholder="cth. 30" value={form.discount_pct}
                  onChange={e => setForm({...form, discount_pct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>Aktifkan Promo Paket</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Terapkan potongan harga saat tenant kategori ini upgrade</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${form.promo_active ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                onClick={() => setForm({...form, promo_active: !form.promo_active})}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
          <div className="modal__actions">
            <button id="btn-cancel-cat" type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Batal</button>
            <button id="btn-save-cat" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}}/> Menyimpan...</> : (editing ? 'Simpan Perubahan' : 'Tambah Kategori')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
