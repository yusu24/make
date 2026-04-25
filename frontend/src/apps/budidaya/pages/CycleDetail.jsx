import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { 
  ArrowLeft, Droplets, Activity, 
  TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, Info, Plus, ChevronRight,
  ShoppingCart, Heart, Scale, Trash2,
  Play, CheckSquare, BarChart3, Clock
} from 'lucide-react'
import Modal from '../../../components/Modal'

export default function CycleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [modalType, setModalType] = useState(null) // 'feed', 'sampling', 'health', 'harvest'
  
  // Form States
  const [feedLogs, setFeedLogs] = useState([])
  const [feedStocks, setFeedStocks] = useState([])
  const [formFeed, setFormFeed] = useState({ feed_stock_id: '', amount_kg: '', date: new Date().toISOString().split('T')[0] })
  const [formSampling, setFormSampling] = useState({ average_weight_gram: '', estimated_biomass_kg: '', date: new Date().toISOString().split('T')[0] })
  const [formHealth, setFormHealth] = useState({ mortality_count: 0, disease_note: '', treatment_note: '', date: new Date().toISOString().split('T')[0] })
  const [formHarvest, setFormHarvest] = useState({ total_weight_kg: '', sale_price_per_kg: '', harvest_date: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => {
    fetchDetail()
    fetchFeedStocks()
  }, [id])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/budidaya/cycles/${id}`)
      setData(res.data.data)
    } catch (err) {
      console.error(err)
      alert("Gagal memuat detail siklus")
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedStocks = async () => {
    try {
      const res = await api.get('/budidaya/feeds')
      setFeedStocks(res.data.data)
    } catch (err) {}
  }

  const handleLogFeeding = async (e) => {
    e.preventDefault()
    try {
      await api.post('/budidaya/feedings', { ...formFeed, cycle_id: id })
      setModalType(null)
      fetchDetail()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat pakan") }
  }

  const handleLogSampling = async (e) => {
    e.preventDefault()
    try {
       await api.post('/budidaya/samplings', { ...formSampling, cycle_id: id })
       setModalType(null)
       fetchDetail()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat sampling") }
  }

  const handleLogHealth = async (e) => {
    e.preventDefault()
    try {
       await api.post('/budidaya/health', { ...formHealth, cycle_id: id })
       setModalType(null)
       fetchDetail()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat kesehatan") }
  }

  const handleHarvest = async (e) => {
    e.preventDefault()
    if(!confirm("Yakin ingin memanen siklus ini? Status kolam akan kembali kosong.")) return
    try {
       await api.post(`/budidaya/cycles/${id}/harvest`, formHarvest)
       setModalType(null)
       navigate('/budidaya/cycles')
    } catch (err) { alert(err.response?.data?.message || "Gagal memproses panen") }
  }

  if (loading) return (
    <div className="loading-state-full">
      <div className="spinner-blue"></div>
      <p>Menganalisis performa siklus...</p>
    </div>
  )

  const cycle = data?.cycle
  const stats = data?.stats
  const doc = cycle ? Math.ceil(Math.abs(new Date() - new Date(cycle.seed_date)) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="animate-fade-in page-content">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/budidaya/cycles')} className="btn btn-ghost" style={{ paddingLeft: 0, fontWeight: 900 }}>
          <ArrowLeft size={18} /> <span>Kembali ke Overview</span>
        </button>
        <div className={`status-pill ${cycle?.status === 'panen' ? 'gray' : 'success'}`}>
           <div className={`pulse-dot ${cycle?.status === 'panen' ? 'static' : ''}`}></div>
           <span>Siklus {cycle?.status === 'panen' ? 'Selesai / Terpanen' : 'Sedang Berjalan'}</span>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="premium-card stagger" style={{ padding: 40, background: 'var(--bg-card)', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-8">
           <div className="premium-icon-badge" style={{ padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))', color: 'white', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)' }}>
              <Droplets size={32} />
           </div>
           <div>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary-500)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Siklus Produksi Budidaya</span>
              <h1 className="page-title" style={{ fontSize: 42, margin: 0 }}>{cycle?.pond?.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted" style={{ fontWeight: 800 }}>
                 <span className="flex items-center gap-2"><Calendar size={14} /> Dimulai: {new Date(cycle?.seed_date).toLocaleDateString('id-ID')}</span>
                 <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--text-muted)' }}></div>
                 <span className="flex items-center gap-2"><Activity size={14} /> {cycle?.seed_type}</span>
              </div>
           </div>
        </div>
        
        <div className="flex gap-4">
           <div className="premium-card" style={{ padding: '16px 24px', background: 'var(--bg-elevated)', border: 'none', borderRadius: 20, textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Umur Hidup (DOC)</span>
              <span style={{ fontSize: 24, fontWeight: 950 }}>{doc} <small style={{ fontSize: 12, opacity: 0.6 }}>HARI</small></span>
           </div>
           <div className="premium-card" style={{ padding: '16px 24px', background: 'var(--bg-elevated)', border: 'none', borderRadius: 20, textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Estimasi Populasi</span>
              <span style={{ fontSize: 24, fontWeight: 950 }}>{stats?.current_population.toLocaleString()} <small style={{ fontSize: 12, opacity: 0.6 }}>EKOR</small></span>
           </div>
           <div className="premium-card" style={{ padding: '16px 24px', background: stats?.survival_rate < 80 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: 'none', borderRadius: 20, textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Survival Rate</span>
              <span style={{ fontSize: 24, fontWeight: 950, color: stats?.survival_rate < 80 ? 'var(--danger-500)' : 'var(--success-500)' }}>{stats?.survival_rate}%</span>
           </div>
        </div>
      </div>

      {/* Advanced Navigation Tabs */}
      <div className="flex gap-10 mb-10 border-b-2" style={{ borderColor: 'var(--border-subtle)' }}>
         {[
            { id: 'overview', label: 'Ikhtisar Performa', icon: BarChart3 },
            { id: 'feed', label: 'Log Pakan', icon: ShoppingCart },
            { id: 'sampling', label: 'Data Sampling', icon: Scale },
            { id: 'health', label: 'Kesehatan Unit', icon: Heart }
         ].map(tab => (
            <button 
              key={tab.id}
              className={`flex items-center gap-3 py-4 transition-all duration-300 border-b-4 ${activeTab === tab.id ? 'border-primary-500 text-primary-500' : 'border-transparent text-muted'}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ background: 'none', fontWeight: 900, outline: 'none' }}
            >
               <tab.icon size={20} />
               <span>{tab.label}</span>
            </button>
         ))}
      </div>

      {/* Dynamic Content Segments */}
      <div className="detail-render-area stagger">
         {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-8">
               <div className="col-span-8 flex flex-col gap-6">
                  <div className="premium-kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                     <div className="premium-card flex items-center gap-6" style={{ padding: 32 }}>
                        <div className="kpi-icon-wrapper" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', width: 64, height: 64, borderRadius: 20 }}>
                           <TrendingUp size={28} />
                        </div>
                        <div>
                           <span className="text-muted text-xs font-black uppercase mb-1 block">Total Konsumsi Pakan</span>
                           <h3 style={{ fontSize: 32, fontWeight: 950, margin: 0 }}>{stats?.total_feed_kg.toLocaleString()} <small style={{ fontSize: 14 }}>KG</small></h3>
                        </div>
                     </div>
                     <div className="premium-card flex items-center gap-6" style={{ padding: 32 }}>
                        <div className="kpi-icon-wrapper" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)', width: 64, height: 64, borderRadius: 20 }}>
                           <AlertTriangle size={28} />
                        </div>
                        <div>
                           <span className="text-muted text-xs font-black uppercase mb-1 block">Akumulasi Mortalitas</span>
                           <h3 style={{ fontSize: 32, fontWeight: 950, margin: 0 }}>{stats?.total_mortality.toLocaleString()} <small style={{ fontSize: 14 }}>EKOR</small></h3>
                        </div>
                     </div>
                  </div>
                  
                  <div className="premium-card" style={{ padding: 40, minHeight: 400 }}>
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="premium-title-900" style={{ fontSize: 20, margin: 0 }}>Evolusi Parameter Utama</h3>
                        <div className="badge badge-blue">Visualisasi Data</div>
                     </div>
                     <div className="flex items-center justify-center p-20 text-muted" style={{ background: 'var(--bg-elevated)', borderRadius: 24, border: '1px dashed var(--border-default)' }}>
                        Grafik Analitik Siklus akan ditampilkan di sini.
                     </div>
                  </div>
               </div>
               
               <div className="col-span-4">
                  <div className="premium-card" style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', padding: 32 }}>
                     <h3 className="section-title mb-8" style={{ color: 'var(--text-primary)', fontSize: 18 }}>Log Operations</h3>
                     <div className="flex flex-col gap-4">
                        {[
                           { type: 'feed', color: 'primary', label: 'Input Pemberian Pakan', desc: 'Catat harian pakan pekati' },
                           { type: 'sampling', color: 'success', label: 'Data Sampling Terbaru', desc: 'Berat & estimasi biomassa' },
                           { type: 'health', color: 'danger', label: 'Laporan Kesehatan', desc: 'Mortalitas & diagnosa' }
                        ].map(act => (
                           <button key={act.type} onClick={() => setModalType(act.type)} className="btn btn-secondary flex items-start gap-4 p-5 text-left" style={{ borderRadius: 24, border: '1.5px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                              <div className={`kpi-icon-wrapper bg-${act.color}-50 text-${act.color}-600`} style={{ width: 44, height: 44, borderRadius: 14, background: act.color === 'primary' ? 'var(--primary-50)' : act.color === 'success' ? 'var(--success-50)' : 'var(--danger-50)', color: act.color === 'primary' ? 'var(--primary-600)' : act.color === 'success' ? 'var(--success-600)' : 'var(--danger-600)' }}>
                                 <Plus size={20} />
                              </div>
                              <div>
                                 <span style={{ display: 'block', fontSize: 15, fontWeight: 900 }}>{act.label}</span>
                                 <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{act.desc}</span>
                              </div>
                           </button>
                        ))}
                        
                        {cycle?.status !== 'panen' && (
                           <button className="btn btn-primary btn-lg mt-6" onClick={() => setModalType('harvest')} style={{ borderRadius: 24, padding: 24 }}>
                              <CheckSquare size={20} />
                              <span style={{ fontWeight: 950, fontSize: 16 }}>Finalisasi & Panen</span>
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'feed' && (
            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
               <div className="board-header" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 className="premium-title-900" style={{ fontSize: 18, margin: 0 }}>Riwayat Log Pemberian Pakan</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setModalType('feed')}><Plus size={16} /> Tambah Log</button>
               </div>
               <div className="table-responsive">
                  <table className="premium-table">
                     <thead>
                        <tr>
                           <th>TANGGAL OPERASIONAL</th>
                           <th>VARIAN PAKAN</th>
                           <th>KUANTITAS</th>
                           <th className="text-right">INPUT TIME</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data?.feedings.map((f, i) => (
                           <tr key={i} className="animate-slide-in">
                              <td><span style={{ fontWeight: 800 }}>{new Date(f.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></td>
                              <td><span className="badge badge-blue">{f.feed_name}</span></td>
                              <td><span style={{ fontWeight: 950, color: 'var(--primary-600)', fontSize: 16 }}>{f.amount_kg} <small>KG</small></span></td>
                              <td className="text-right"><div className="flex items-center gap-2 justify-end text-muted font-bold"><Clock size={12} /> {new Date(f.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div></td>
                           </tr>
                        ))}
                        {data?.feedings.length === 0 && <tr><td colSpan="4" style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800 }}>Belum ada riwayat pakan untuk siklus ini.</td></tr>}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'sampling' && (
            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
               <div className="board-header" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 className="premium-title-900" style={{ fontSize: 18, margin: 0 }}>Data Pertumbuhan & Sampling</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setModalType('sampling')} style={{ background: 'var(--success-500)' }}><Plus size={16} /> Data Sampling</button>
               </div>
               <div className="table-responsive">
                  <table className="premium-table">
                     <thead>
                        <tr>
                           <th>ID SAMPLING</th>
                           <th>TANGGAL</th>
                           <th>AVG WEIGHT (ABW)</th>
                           <th>BIOMASSA ESTIMASI</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data?.samplings.map((s, i) => (
                           <tr key={i} className="animate-slide-in">
                              <td><span style={{ fontFamily: 'monospace', fontWeight: 800 }}>SMP-{s.id}</span></td>
                              <td><span style={{ fontWeight: 800 }}>{new Date(s.date).toLocaleDateString('id-ID')}</span></td>
                              <td><span style={{ fontWeight: 950, color: 'var(--text-primary)', fontSize: 16 }}>{s.average_weight_gram} <small>gram</small></span></td>
                              <td><span className="badge badge-green" style={{ fontSize: 14 }}>{s.estimated_biomass_kg} KG</span></td>
                           </tr>
                        ))}
                        {data?.samplings.length === 0 && <tr><td colSpan="4" style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800 }}>Belum ada data pertumbuhan.</td></tr>}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'health' && (
            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
               <div className="board-header" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 className="premium-title-900" style={{ fontSize: 18, margin: 0 }}>Monitor Kesehatan Unit</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setModalType('health')} style={{ background: 'var(--danger-500)' }}><AlertCircle size={16} /> Lapor Kondisi</button>
               </div>
               <div className="table-responsive">
                  <table className="premium-table">
                     <thead>
                        <tr>
                           <th>TANGGAL LAPORAN</th>
                           <th>MORTALITAS</th>
                           <th>DIAGNOSA / GEJALA</th>
                           <th className="text-right">TINDAKAN MEDIS</th>
                        </tr>
                     </thead>
                     <tbody>
                        {data?.health_logs.map((h, i) => (
                           <tr key={i} className="animate-slide-in">
                              <td><span style={{ fontWeight: 800 }}>{new Date(h.date).toLocaleDateString('id-ID')}</span></td>
                              <td><span className="badge badge-red" style={{ fontSize: 14 }}>{h.mortality_count} Ekor</span></td>
                              <td><span style={{ fontWeight: 700 }}>{h.disease_note || '-'}</span></td>
                              <td className="text-right"><span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>{h.treatment_note || '-'}</span></td>
                           </tr>
                        ))}
                        {data?.health_logs.length === 0 && <tr><td colSpan="4" style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 800 }}>Unit dalam kondisi sehat optimal.</td></tr>}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>

      {/* REFACTORED MODALS */}
      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={
         modalType === 'feed' ? 'Catat Pemberian Pakan' :
         modalType === 'sampling' ? 'Data Sampling Unit' :
         modalType === 'health' ? 'Laporan Kesehatan' : 'Finalisasi Produksi'
      }>
         {modalType === 'feed' && (
            <form onSubmit={handleLogFeeding} className="premium-form-fluid">
               <div className="form-group mb-4">
                  <label className="premium-label">JENIS PAKAN GUDANG</label>
                  <select className="form-select" required value={formFeed.feed_stock_id} onChange={e => setFormFeed({...formFeed, feed_stock_id: e.target.value})} style={{ fontWeight: 800 }}>
                     <option value="">-- Pilih Stok Pakan --</option>
                     {feedStocks.map(fs => <option key={fs.id} value={fs.id}>{fs.name} (Sisa: {fs.stock_kg}kg)</option>)}
                  </select>
               </div>
               <div className="grid-2 gap-4 mb-8">
                  <div className="form-group">
                     <label className="premium-label">BERAT (KG)</label>
                     <input className="form-input" type="number" step="any" required value={formFeed.amount_kg} onChange={e => setFormFeed({...formFeed, amount_kg: e.target.value})} style={{ fontWeight: 900 }} />
                  </div>
                  <div className="form-group">
                     <label className="premium-label">TANGGAL</label>
                     <input className="form-input" type="date" required value={formFeed.date} onChange={e => setFormFeed({...formFeed, date: e.target.value})} style={{ fontWeight: 900 }} />
                  </div>
               </div>
               <button type="submit" className="btn btn-primary btn-full btn-lg">Simpan Log Pakan</button>
            </form>
         )}

         {modalType === 'sampling' && (
            <form onSubmit={handleLogSampling} className="premium-form-fluid">
               <div className="grid-2 gap-4 mb-4">
                  <div className="form-group">
                     <label className="premium-label">AVG WEIGHT (GRAM)</label>
                     <input className="form-input" type="number" step="any" required value={formSampling.average_weight_gram} onChange={e => setFormSampling({...formSampling, average_weight_gram: e.target.value})} />
                  </div>
                  <div className="form-group">
                     <label className="premium-label">BIOMASSA (KG)</label>
                     <input className="form-input" type="number" step="any" value={formSampling.estimated_biomass_kg} onChange={e => setFormSampling({...formSampling, estimated_biomass_kg: e.target.value})} />
                  </div>
               </div>
               <div className="form-group mb-8">
                  <label className="premium-label">TANGGAL SAMPLING</label>
                  <input className="form-input" type="date" required value={formSampling.date} onChange={e => setFormSampling({...formSampling, date: e.target.value})} />
               </div>
               <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ background: 'var(--success-500)' }}>Submit Data Sampling</button>
            </form>
         )}

         {modalType === 'health' && (
            <form onSubmit={handleLogHealth} className="premium-form-fluid">
               <div className="grid-2 gap-4 mb-4">
                  <div className="form-group">
                     <label className="premium-label">MORTALITAS (EKOR)</label>
                     <input className="form-input" type="number" required value={formHealth.mortality_count} onChange={e => setFormHealth({...formHealth, mortality_count: e.target.value})} />
                  </div>
                  <div className="form-group">
                     <label className="premium-label">TANGGAL</label>
                     <input className="form-input" type="date" required value={formHealth.date} onChange={e => setFormHealth({...formHealth, date: e.target.value})} />
                  </div>
               </div>
               <div className="form-group mb-4">
                  <label className="premium-label">GEJALA PENYAKIT</label>
                  <textarea className="form-input" rows="2" value={formHealth.disease_note} onChange={e => setFormHealth({...formHealth, disease_note: e.target.value})} placeholder="Masukkan info gejala..."></textarea>
               </div>
               <div className="form-group mb-8">
                  <label className="premium-label">TINDAKAN</label>
                  <textarea className="form-input" rows="2" value={formHealth.treatment_note} onChange={e => setFormHealth({...formHealth, treatment_note: e.target.value})} placeholder="Penanganan yang dilakukan..."></textarea>
               </div>
               <button type="submit" className="btn btn-danger btn-full btn-lg">Kirim Laporan Kesehatan</button>
            </form>
         )}

         {modalType === 'harvest' && (
            <form onSubmit={handleHarvest} className="premium-form-fluid">
               <div className="grid-2 gap-4 mb-4">
                  <div className="form-group">
                     <label className="premium-label">TOTAL BERAT (KG)</label>
                     <input className="form-input" type="number" step="any" required value={formHarvest.total_weight_kg} onChange={e => setFormHarvest({...formHarvest, total_weight_kg: e.target.value})} />
                  </div>
                  <div className="form-group">
                     <label className="premium-label">HARGA JUAL / KG</label>
                     <input className="form-input" type="number" value={formHarvest.sale_price_per_kg} onChange={e => setFormHarvest({...formHarvest, sale_price_per_kg: e.target.value})} />
                  </div>
               </div>
               <div className="form-group mb-4">
                  <label className="premium-label">TANGGAL PANEN</label>
                  <input className="form-input" type="date" required value={formHarvest.harvest_date} onChange={e => setFormHarvest({...formHarvest, harvest_date: e.target.value})} />
               </div>
               <div className="form-group mb-8">
                  <label className="premium-label">CATATAN AKHIR</label>
                  <textarea className="form-input" rows="2" value={formHarvest.notes} onChange={e => setFormHarvest({...formHarvest, notes: e.target.value})}></textarea>
               </div>
               <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ background: 'var(--success-500)' }}>Selesaikan & Finalisasi Siklus</button>
            </form>
         )}
      </Modal>

      <style>{`
         .premium-icon-badge { width: 56px; height: 56px; border-radius: 18px; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
         .status-pill { display: flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 40px; font-size: 13px; font-weight: 800; background: var(--success-50); color: var(--success-600); }
         .status-pill.gray { background: var(--bg-elevated); color: var(--text-muted); }
         .pulse-dot { width: 10px; height: 10px; border-radius: 5px; background: currentColor; animation: pulse 2s infinite; }
         .pulse-dot.static { animation: none; }
         .kpi-icon-wrapper { display: flex; align-items: center; justify-content: center; }
         .premium-label { font-size: 11px; font-weight: 900; color: var(--text-muted); letter-spacing: 0.05em; display: block; margin-bottom: 8px; }
      `}</style>
    </div>
  )
}
