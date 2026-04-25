import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { 
  History, Plus, Search, Calendar, 
  ArrowRight, Activity, TrendingUp, Info,
  Waves, MapPin, Hash, Target
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../../components/Modal'

export default function Cycles() {
  const navigate = useNavigate()
  const [cycles, setCycles] = useState([])
  const [ponds, setPonds] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    pond_id: '',
    seed_type: '',
    seed_count: '',
    seed_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [cycleRes, pondRes] = await Promise.all([
        api.get('/budidaya/cycles'),
        api.get('/budidaya/ponds', { params: { status: 'kosong' } })
      ])
      setCycles(cycleRes.data.data)
      setPonds(pondRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/budidaya/cycles', formData)
      setModalOpen(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memulai siklus')
    }
  }

  const calculateDOC = (startDate) => {
    const diffTime = Math.abs(new Date() - new Date(startDate))
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="animate-fade-in premium-cycles page-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Section */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="title-icon-wrapper" style={{ padding: 12, borderRadius: 18, color: 'white', background: 'linear-gradient(135deg, var(--accent-500), var(--primary-600))' }}>
            <Waves size={28} />
          </div>
          <div>
            <h2 className="page-title">Pemantauan Siklus Aktif</h2>
            <p className="page-sub">Monitor pertumbuhan, kesehatan, dan efisiensi unit produksi berjalan</p>
          </div>
        </div>
        
        <button className="btn btn-primary btn-lg" onClick={() => setModalOpen(true)} style={{ borderRadius: 16 }}>
          <Plus size={20} />
          <span>Mulai Siklus (Tebar)</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
           <div className="spinner" style={{ width: 44, height: 44, borderTopColor: 'var(--accent-500)' }}></div>
           <p className="mt-4 font-bold text-secondary">Menganalisis data siklus...</p>
        </div>
      ) : cycles.length === 0 ? (
        <div className="premium-card p-12 text-center" style={{ borderRadius: 32 }}>
           <Activity size={48} style={{ marginBottom: 20, opacity: 0.2, color: 'var(--accent-500)' }} />
           <h3 className="premium-title-900" style={{ fontSize: 20, marginBottom: 8 }}>Belum ada siklus berjalan</h3>
           <p className="text-secondary">Tebar benih di kolam yang kosong untuk memulai monitoring</p>
        </div>
      ) : (
        <div className="cycles-grid stagger">
          {cycles.map((cycle) => (
            <div key={cycle.id} className="premium-cycle-card animate-fade-in" onClick={() => navigate(`/budidaya/cycles/${cycle.id}`)}>
              <div className="card-top">
                <div className="pond-meta">
                   <h3 className="p-name">{cycle.pond?.name}</h3>
                   <span className="p-area"><MapPin size={12} /> {cycle.pond?.area || 'Area Utama'}</span>
                </div>
                <div className="doc-glimmer">
                   <span className="doc-num">{calculateDOC(cycle.seed_date)}</span>
                   <span className="doc-txt">DOC</span>
                </div>
              </div>
              
              <div className="card-middle">
                <div className="stats-row">
                   <div className="s-item">
                      <span className="s-label">Komoditas</span>
                      <span className="s-val" style={{ fontWeight: 900 }}>{cycle.seed_type}</span>
                   </div>
                   <div className="s-item">
                      <span className="s-label">Tebar</span>
                      <span className="s-val" style={{ fontWeight: 900 }}>{cycle.seed_count.toLocaleString()} <small>Ekor</small></span>
                   </div>
                </div>
                
                <div className="progress-section">
                   <div className="p-info">
                      <span>Perkiraan Panen</span>
                      <span>{cycle.expected_harvest_date ? new Date(cycle.expected_harvest_date).toLocaleDateString('id-ID') : '-'}</span>
                   </div>
                   <div className="p-rail">
                      <div className="p-track" style={{ width: '45%', background: 'linear-gradient(90deg, var(--accent-500), var(--accent-300))' }}></div>
                   </div>
                </div>
              </div>
              
              <div className="card-bottom">
                 <div className="status-indicator">
                    <div className="pulse-dot"></div>
                    Budidaya Aktif
                 </div>
                 <button className="btn-detail-circle"><ArrowRight size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Cycle Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Inisialisasi Siklus Budidaya"
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit} className="premium-form-modern">
           <div className="form-group">
              <label>Pilih Unit Kolam (Tersedia)</label>
              <div className="input-field">
                 <select required value={formData.pond_id} onChange={e => setFormData({...formData, pond_id: e.target.value})}>
                    <option value="">-- Pilih Unit Kolam --</option>
                    {ponds.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.area || 'Tanpa Area'})</option>
                    ))}
                 </select>
              </div>
              {ponds.length === 0 && <p style={{ fontSize: '11px', color: 'var(--danger-500)', marginTop: 8, fontWeight: 900 }}>* Tidak ada unit kolam kosong tersedia saat ini.</p>}
           </div>
           
           <div className="field-row">
              <div className="form-group">
                 <label>Jenis / Varietas Benih</label>
                 <div className="input-field">
                    <input 
                       type="text" required placeholder="Misal: Nila Merah" 
                       value={formData.seed_type} onChange={e => setFormData({...formData, seed_type: e.target.value})}
                    />
                 </div>
              </div>
              <div className="form-group">
                 <label>Jumlah Tebar (Ekor)</label>
                 <div className="input-field">
                    <input 
                       type="number" required placeholder="0" 
                       value={formData.seed_count} onChange={e => setFormData({...formData, seed_count: e.target.value})}
                    />
                 </div>
              </div>
           </div>
           
           <div className="field-row">
              <div className="form-group">
                 <label>Tanggal Tebar</label>
                 <div className="input-field">
                    <input 
                       type="date" required 
                       value={formData.seed_date} onChange={e => setFormData({...formData, seed_date: e.target.value})}
                    />
                 </div>
              </div>
              <div className="form-group">
                 <label>Estimasi Panen</label>
                 <div className="input-field">
                    <input 
                       type="date"
                       value={formData.expected_harvest_date} onChange={e => setFormData({...formData, expected_harvest_date: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           <div className="modal-footer">
              <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: 14 }} onClick={() => setModalOpen(false)}>Kembali</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: 14 }}>Mulai Budidaya</button>
           </div>
        </form>
      </Modal>

      <style>{`
        .premium-cycles { padding-bottom: 60px; }
        
        .cycles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
        .premium-cycle-card {
           background: var(--bg-card); padding: 32px; border-radius: 32px; border: 1px solid var(--border-subtle); cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
        }
        .premium-cycle-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--accent-500); }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .p-name { margin: 0; font-size: 24px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.02em; }
        .p-area { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); font-weight: 800; }
        
        .doc-glimmer {
           background: var(--accent-50); padding: 10px 16px; border-radius: 16px; text-align: center; border: 1px solid var(--accent-100);
        }
        .doc-num { display: block; font-size: 26px; font-weight: 950; color: var(--accent-600); line-height: 1; font-family: var(--font-heading); }
        .doc-txt { font-size: 11px; font-weight: 900; color: var(--accent-500); text-transform: uppercase; letter-spacing: 0.1em; }

        .stats-row { display: flex; gap: 24px; margin-bottom: 32px; }
        .s-item { flex: 1; }
        .s-label { display: block; font-size: 11px; font-weight: 900; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
        .s-val { font-size: 16px; font-weight: 900; color: var(--text-primary); }
        .s-val small { font-size: 12px; color: var(--text-muted); font-weight: 700; }

        .progress-section { margin-bottom: 32px; }
        .p-info { display: flex; justify-content: space-between; font-size: 13px; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px; }
        .p-rail { height: 10px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; }
        
        .card-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 24px; }
        .status-indicator {
           display: flex; align-items: center; gap: 10px; background: var(--success-50); color: var(--success-600); padding: 8px 18px; border-radius: 40px; font-size: 13px; font-weight: 900;
        }
        .pulse-dot { width: 8px; height: 8px; background: var(--success-500); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse {
           0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
           70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
           100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .btn-detail-circle {
           width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; color: var(--text-muted); background: var(--bg-card); transition: 0.2s;
        }
        .premium-cycle-card:hover .btn-detail-circle {
           background: var(--text-primary); color: var(--bg-card); border-color: var(--text-primary); transform: scale(1.1);
        }

        .premium-form-modern .form-group { margin-bottom: 24px; }
        .premium-form-modern label { display: block; font-size: 13px; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.05em; }
        .input-field { position: relative; background: var(--bg-elevated); border: 2px solid var(--border-subtle); border-radius: 16px; padding: 12px 18px; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
        .input-field:focus-within { border-color: var(--accent-500); background: var(--bg-card); box-shadow: var(--shadow-sm); }
        .input-field input, .input-field select { width: 100%; border: none; background: transparent; outline: none; font-size: 15px; font-weight: 700; color: var(--text-primary); }
        
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      `}</style>
    </div>
  )
}
