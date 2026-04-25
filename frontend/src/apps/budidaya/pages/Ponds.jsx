import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { 
  Waves, LayoutGrid, List, Plus, Filter, 
  Search, MoreVertical, Edit2, Trash2, ArrowRight,
  Info, MapPin, Maximize2, Droplets
} from 'lucide-react'
import Modal from '../../../components/Modal'

const STATUS_COLORS = {
  kosong: { bg: '#f1f5f9', text: '#64748b', label: 'Kosong' },
  aktif: { bg: '#ecfdf5', text: '#059669', label: 'Aktif' },
  panen: { bg: '#eff6ff', text: '#2563eb', label: 'Siap Panen' },
  maintenance: { bg: '#fff7ed', text: '#ea580c', label: 'Perbaikan' }
}

export default function Ponds() {
  const [ponds, setPonds] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState('card')
  const [filters, setFilters] = useState({ status: '', area: '' })
  const [search, setSearch] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPond, setEditingPond] = useState(null)
  const [formData, setFormData] = useState({
    name: '', code: '', type: 'tanah', area: '',
    area_m2: '', depth_cm: '', max_fish_count: '',
    location: '', status: 'kosong'
  })

  useEffect(() => {
    fetchPonds()
  }, [filters])

  const fetchPonds = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/ponds', { params: filters })
      setPonds(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (pond = null) => {
    if (pond) {
      setEditingPond(pond)
      setFormData({ ...pond })
    } else {
      setEditingPond(null)
      setFormData({
        name: '', code: '', type: 'tanah', area: '',
        area_m2: '', depth_cm: '', max_fish_count: '',
        location: '', status: 'kosong'
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPond) {
        await api.put(`/budidaya/ponds/${editingPond.id}`, formData)
      } else {
        await api.post('/budidaya/ponds', formData)
      }
      setModalOpen(false)
      fetchPonds()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kolam ini?')) return
    try {
      await api.delete(`/budidaya/ponds/${id}`)
      fetchPonds()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus. Kemungkinan kolam memiliki riwayat budidaya.')
    }
  }

  const filteredPonds = ponds.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  const areas = [...new Set(ponds.map(p => p.area).filter(Boolean))]

  return (
    <div className="animate-fade-in premium-ponds page-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="title-icon-wrapper" style={{ padding: 12, background: 'var(--primary-600)', borderRadius: 16, color: 'white' }}>
            <Waves size={28} />
          </div>
          <div>
            <h2 className="page-title">Manajemen Unit Kolam</h2>
            <p className="page-sub">Kelola infrastruktur budidaya dan pantau kapasitas produksi secara real-time</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="modern-toggle">
            <button className={viewType === 'card' ? 'active' : ''} onClick={() => setViewType('card')}>
              <LayoutGrid size={18} />
            </button>
            <button className={viewType === 'table' ? 'active' : ''} onClick={() => setViewType('table')}>
              <List size={18} />
            </button>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => handleOpenModal()} style={{ borderRadius: 16 }}>
             <Plus size={20} />
             <span>Unit Kolam Baru</span>
          </button>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="premium-card flex flex-wrap gap-4" style={{ padding: '20px 32px', marginBottom: 32, borderRadius: 24, alignItems: 'center' }}>
        <div className="premium-search" style={{ flex: 1, minWidth: 260 }}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Cari Kolam (Nama atau Kode)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>
        
        <div className="flex gap-3">
          <div className="premium-select-wrapper">
            <Filter size={16} color="var(--primary-500)" />
            <select className="form-select" style={{ border: 'none', background: 'transparent' }} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="">Status: Semua</option>
              {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          
          <div className="premium-select-wrapper">
            <MapPin size={16} color="var(--primary-500)" />
            <select className="form-select" style={{ border: 'none', background: 'transparent' }} value={filters.area} onChange={(e) => setFilters({...filters, area: e.target.value})}>
              <option value="">Area: Seluruh</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {(filters.status !== '' || filters.area !== '' || search !== '') && (
            <button 
              onClick={() => { setFilters({ status: '', area: '' }); setSearch(''); }}
              className="btn btn-ghost"
              style={{ color: 'var(--danger-500)', fontWeight: 800 }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
           <div className="spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--primary-500)' }}></div>
           <p className="mt-4 font-bold text-secondary">Sinkronisasi unit kolam...</p>
        </div>
      ) : filteredPonds.length === 0 ? (
        <div className="premium-card p-12 text-center">
           <Search size={48} className="text-muted" style={{ marginBottom: 20, opacity: 0.3 }} />
           <h3 className="premium-title-900" style={{ fontSize: 20, marginBottom: 8 }}>Tidak ada unit ditemukan</h3>
           <p className="text-secondary">Coba ubah filter atau kata kunci pencarian Anda</p>
        </div>
      ) : viewType === 'card' ? (
        <div className="ponds-grid stagger">
          {filteredPonds.map((pond) => {
            const status = STATUS_COLORS[pond.status] || STATUS_COLORS.kosong;
            return (
              <div key={pond.id} className="premium-pond-card animate-fade-in">
                <div className="status-accent" style={{ backgroundColor: status.text }}></div>
                <div className="card-body">
                  <div className="pond-head">
                    <div>
                      <span className="pond-uid">{pond.code || 'KL-UNSET'}</span>
                      <h3 className="pond-title">{pond.name}</h3>
                    </div>
                    <div className="dropdown">
                       <button className="btn-more"><MoreVertical size={18} /></button>
                       <div className="dropdown-content">
                          <button onClick={(e) => { e.stopPropagation(); handleOpenModal(pond); }}><Edit2 size={14} /> Ubah Data</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(pond.id); }} className="delete-action"><Trash2 size={14} /> Hapus UNIT</button>
                       </div>
                    </div>
                  </div>

                  <div className="metrics-island">
                    <div className="m-item">
                      <span className="m-label">Areal Kolam</span>
                      <span className="m-val"><Maximize2 size={14} /> {pond.area_m2 || 0} m²</span>
                    </div>
                    <div className="m-item">
                      <span className="m-label">Konstruksi</span>
                      <span className="m-val" style={{ textTransform: 'capitalize' }}><Droplets size={14} /> {pond.type}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <div className="status-tag" style={{ backgroundColor: `${status.bg}`, color: status.text }}>
                      <div className={`dot ${pond.status === 'aktif' ? 'pulse' : ''}`} style={{ backgroundColor: status.text }}></div>
                      {status.label}
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ borderRadius: 12, fontWeight: 900 }} onClick={() => alert('Detail Kolam segera hadir!')}>
                       Manajemen <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>IDENTITAS UNIT</th>
                <th>AREA / GRUP</th>
                <th>UKURAN ($m^2$)</th>
                <th>KAPASITAS</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredPonds.map(pond => (
                <tr key={pond.id}>
                  <td>
                    <div className="pond-identity">
                      <span className="code">{pond.code || 'KL-UNSET'}</span>
                      <span className="name">{pond.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>{pond.area || 'General'}</span></td>
                  <td><span style={{ fontWeight: 900, color: 'var(--success-500)' }}>{pond.area_m2} m²</span></td>
                  <td><span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{pond.max_fish_count?.toLocaleString()} ekor</span></td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: `${STATUS_COLORS[pond.status]?.bg}`, 
                      color: STATUS_COLORS[pond.status]?.text,
                      padding: '6px 12px'
                    }}>
                      {STATUS_COLORS[pond.status]?.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                       <button className="btn btn-sm btn-secondary" onClick={() => alert('Detail Kolam segera hadir!')}>
                         Buka
                       </button>
                       <div className="dropdown">
                          <button className="btn-more" style={{ width: 32, height: 32 }}><MoreVertical size={16} /></button>
                          <div className="dropdown-content">
                             <button onClick={() => handleOpenModal(pond)}><Edit2 size={14} /> Edit</button>
                             <button onClick={() => handleDelete(pond.id)} className="delete-action"><Trash2 size={14} /> Hapus</button>
                          </div>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fluid Form Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingPond ? 'Konfigurasi Unit Kolam' : 'Pendaftaran Unit Kolam'}
        maxWidth="700px"
      >
        <form onSubmit={handleSubmit} className="premium-form-modern">
          <div className="form-section">
            <h4 className="sec-title">Identitas Dasar</h4>
            <div className="field-row">
              <div className="field-group">
                <label>Nama Unit Kolam</label>
                <div className="premium-input-box">
                  <input 
                    type="text" required value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Misal: Kolam Pembesaran A1"
                  />
                </div>
              </div>
              <div className="field-group">
                <label>ID / Kode Referensi</label>
                <div className="premium-input-box">
                  <input 
                    type="text" value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    placeholder="E.g KL-001"
                  />
                </div>
              </div>
            </div>
            
            <div className="field-row">
              <div className="field-group">
                <label>Grup / Area Lokasi</label>
                <div className="premium-input-box">
                  <MapPin size={16} color="#94a3b8" />
                  <input 
                    type="text" value={formData.area} 
                    onChange={e => setFormData({...formData, area: e.target.value})}
                    placeholder="Misal: Blok Utara"
                  />
                </div>
              </div>
              <div className="field-group">
                <label>Jenis Material Konstruksi</label>
                <div className="premium-input-box">
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="tanah">Kolam Tanah</option>
                    <option value="beton">Kolam Beton</option>
                    <option value="terpal">Kolam Terpal</option>
                    <option value="bioflok">Sistem Bioflok</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section" style={{ background: 'var(--primary-50)', padding: '24px', borderRadius: '24px', border: '1px solid var(--primary-100)' }}>
            <h4 className="sec-title" style={{ color: 'var(--primary-600)' }}>Spesifikasi Teknik</h4>
            <div className="field-row tri">
              <div className="field-group">
                <label>Luas ($m^2$)</label>
                <div className="premium-input-box">
                  <input type="number" step="any" value={formData.area_m2} onChange={e => setFormData({...formData, area_m2: e.target.value})} />
                  <span className="input-unit">M²</span>
                </div>
              </div>
              <div className="field-group">
                <label>Kedalaman ($cm$)</label>
                <div className="premium-input-box">
                   <input type="number" step="any" value={formData.depth_cm} onChange={e => setFormData({...formData, depth_cm: e.target.value})} />
                   <span className="input-unit">CM</span>
                </div>
              </div>
              <div className="field-group">
                <label>Kapasitas (Ekor)</label>
                <div className="premium-input-box">
                   <input type="number" step="any" value={formData.max_fish_count} onChange={e => setFormData({...formData, max_fish_count: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {editingPond && (
             <div className="form-section" style={{ marginTop: 24 }}>
               <h4 className="sec-title">Status Operasional</h4>
               <div className="field-group">
                 <div className="premium-input-box">
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option value="kosong">🟢 Kosong (Siap Pakai)</option>
                     <option value="aktif">🔵 Sedang Digunakan</option>
                     <option value="panen">🟠 Masa Panen</option>
                     <option value="maintenance">🛠️ Sedang Perbaikan</option>
                   </select>
                 </div>
               </div>
             </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setModalOpen(false)}>Batalkan</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: 14 }}>
              {editingPond ? 'Simpan Perubahan' : 'Daftarkan Kolam'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
        .premium-ponds { padding-bottom: 60px; }
        .header-context { display: flex; align-items: center; gap: 20px; }
        
        .modern-toggle {
          display: flex;
          background: var(--bg-elevated);
          padding: 6px;
          border-radius: 14px;
          gap: 6px;
        }
        .modern-toggle button {
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: 0.2s;
        }
        .modern-toggle button.active {
          background: var(--bg-card);
          color: var(--primary-500);
          box-shadow: var(--shadow-sm);
        }

        .premium-search { position: relative; display: flex; align-items: center; gap: 12px; background: var(--bg-elevated); padding: 8px 16px; border-radius: 14px; border: 1px solid var(--border-subtle); }
        .premium-select-wrapper { display: flex; align-items: center; gap: 12px; background: var(--bg-elevated); padding: 0 16px; border-radius: 14px; border: 1px solid var(--border-subtle); }
        .premium-select-wrapper select { border: none; background: transparent; padding: 12px 0; font-weight: 800; color: var(--text-secondary); outline: none; cursor: pointer; }

        .ponds-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        .premium-pond-card {
           background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-subtle); overflow: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative;
        }
        .premium-pond-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--primary-500); }
        
        .status-accent { height: 8px; width: 100%; transition: 0.3s; }
        .card-body { padding: 32px; }
        .pond-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .pond-uid { display: inline-block; padding: 4px 12px; background: var(--primary-50); color: var(--primary-600); font-size: 11px; font-weight: 900; border-radius: 8px; margin-bottom: 8px; letter-spacing: 0.05em; }
        .pond-title { margin: 0; font-size: 24px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.02em; }
        
        .status-tag { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 40px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .metrics-island { background: var(--bg-elevated); padding: 20px; border-radius: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .m-item .m-label { display: block; font-size: 11px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .m-item .m-val { font-size: 16px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
        .m-item .m-val svg { color: var(--primary-500); }

        .card-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 24px; }
        .btn-more { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border-subtle); background: var(--bg-elevated); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .premium-form-modern .form-section { margin-bottom: 40px; }
        .sec-title { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 900; color: var(--primary-500); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }
        .sec-title::after { content: ""; height: 2px; flex: 1; background: linear-gradient(90deg, var(--primary-500), transparent); opacity: 0.2; border-radius: 2px; }
        
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .field-row.tri { grid-template-columns: repeat(3, 1fr); }
        .field-group label { display: block; font-size: 13px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; }
        .premium-input-box { position: relative; background: var(--bg-elevated); border: 2px solid var(--border-subtle); border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .premium-input-box:focus-within { border-color: var(--primary-500); background: var(--bg-card); box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.1); }
        .premium-input-box input, .premium-input-box select { border: none; background: transparent; width: 100%; outline: none; font-weight: 700; color: var(--text-primary); }
        .input-unit { font-size: 11px; font-weight: 900; color: var(--text-muted); }
        
        .pond-identity { display: flex; flex-direction: column; }
        .pond-identity .code { font-size: 11px; color: var(--primary-500); font-weight: 800; text-transform: uppercase; }
        .pond-identity .name { font-size: 15px; color: var(--text-primary); font-weight: 900; }
      `}</style>
    </div>
  )
}
