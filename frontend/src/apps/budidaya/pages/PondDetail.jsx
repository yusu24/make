import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { 
  ArrowLeft, Droplets, Activity, 
  TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, Info, Plus, ChevronRight,
  ShoppingCart, Heart, Scale, Trash2,
  Play, CheckSquare, BarChart3, Clock, DollarSign,
  CloudRain, Wind, Thermometer, Waves
} from 'lucide-react'
import Modal from '../../../components/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'

// Helper for card styles to match high-fidelity UI
const cardStyle = {
  background: '#fff',
  borderRadius: '24px',
  border: '1px solid #E9F0EC',
  padding: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#F8FAFC',
  border: '1.5px solid #E9F0EC',
  borderRadius: 12,
  fontSize: 14,
  color: '#1A1C1A',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: '#64748B',
  display: 'block',
  marginBottom: 6,
}

export default function PondDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [pond, setPond] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ringkasan')
  const [modalType, setModalType] = useState(null)
  
  const [inventories, setInventories] = useState([])
  const feedItems = inventories.filter(i => i.category.toLowerCase() === 'pakan')
  const seedItems = inventories.filter(i => i.category.toLowerCase() === 'bibit')

  const [formStart, setFormStart] = useState({ inventory_id: '', seed_count: '', seed_date: new Date().toISOString().split('T')[0], expected_harvest_date: '' })
  const [formFeed, setFormFeed] = useState({ inventory_id: '', amount_kg: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [formHarvest, setFormHarvest] = useState({ weight_kg: '', price_per_kg: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [formHealth, setFormHealth] = useState({ mortality_count: 0, disease_note: '', treatment_note: '', date: new Date().toISOString().split('T')[0] })
  const [formExpense, setFormExpense] = useState({ category: 'gaji', amount: '', notes: '', date: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    fetchPondData()
    fetchInventories()
  }, [id])

  const fetchPondData = async () => {
    try {
      setLoading(true)
      const pondRes = await api.get(`/budidaya/ponds/${id}`)
      setPond(pondRes.data.data)
      const cycleRes = await api.get(`/budidaya/ponds/${id}/cycle`)
      setData(cycleRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventories = async () => {
    try {
      const res = await api.get('/budidaya/inventory')
      setInventories(res.data.data)
    } catch (err) {}
  }

  const handleStartCycle = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/budidaya/ponds/${id}/cycles/start`, formStart)
      setModalType(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal memulai") }
  }

  const handleLogFeeding = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/budidaya/cycles/${data.cycle.id}/feedings`, formFeed)
      setModalType(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal") }
  }

  const handleLogHealth = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/budidaya/cycles/${data.cycle.id}/health`, formHealth)
      setModalType(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat kesehatan") }
  }

  const handleLogExpense = async (e) => {
    e.preventDefault()
    try {
      await api.post('/budidaya/finance', { ...formExpense, cycle_id: data.cycle.id })
      setModalType(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat biaya") }
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}><div className="spinner"></div></div>

  const cycle = data?.cycle
  const metrics = data?.metrics
  const age_days = data?.age_days

  return (
    <div className="aq-container">
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 className="aq-page-title" style={{ fontSize: 32 }}>{pond?.name || 'Kolam Utama A1'}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ padding: '6px 14px', background: '#D1FAE5', color: '#065F46', borderRadius: '40px', fontSize: 12, fontWeight: 600 }}>Sehat</span>
            <span className="aq-small-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} /> {pond?.location || 'Sektor Utara, Farm 2'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', fontWeight: 600, color: '#1A1C1A', cursor: 'pointer' }}>
            <Clock size={18} /> Lihat Laporan Akhir
          </button>
          <button onClick={() => setModalType(cycle ? 'harvest' : 'start')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#1B4332', border: 'none', borderRadius: '14px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            <Plus size={18} /> {cycle ? 'Panen Siklus' : 'Mulai Siklus Baru'}
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="aq-grid-3">
        {/* Fish Info Card */}
        <div style={{ ...cardStyle, display: 'flex', gap: 20 }}>
          <div style={{ width: 120, height: 120, borderRadius: '20px', overflow: 'hidden' }}>
            <img src={cycle ? "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?q=80&w=200&h=200&auto=format&fit=crop" : "https://images.unsplash.com/photo-1550985543-4919864fef85?q=80&w=200&h=200&auto=format&fit=crop"} alt="Fish" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: cycle ? 'none' : 'grayscale(1)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="aq-kpi-label" style={{ marginBottom: 4 }}>Ikan aktif</span>
            <h3 className="aq-section-title" style={{ fontSize: 24, marginBottom: 12 }}>{cycle?.seed_type || 'Belum ada ikan'}</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <span className="aq-small-text">Umur</span>
                <p className="aq-body-text" style={{ margin: 0, fontWeight: 600 }}>{age_days || 0} hari</p>
              </div>
              <div>
                <span className="aq-small-text">Populasi</span>
                <p className="aq-body-text" style={{ margin: 0, fontWeight: 600 }}>{cycle?.seed_count?.toLocaleString() || 0} ekor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Water Quality Card */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="aq-kpi-label">Kualitas air</span>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' }}>
              <Waves size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span className="aq-small-text">pH level</span>
              <h3 className="aq-kpi-value">7.2</h3>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>Optimal</span>
          </div>
          <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, marginTop: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '70%', background: '#10B981', borderRadius: 3 }} />
          </div>
        </div>

        {/* Temp & DO Card */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="aq-kpi-label">Suhu & DO</span>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' }}>
              <Thermometer size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, marginBottom: 12 }}>
            <div>
              <span className="aq-small-text">Suhu</span>
              <p className="aq-kpi-value" style={{ fontSize: 20 }}>28.5°C</p>
            </div>
            <div>
              <span className="aq-small-text">DO (O2)</span>
              <p className="aq-kpi-value" style={{ fontSize: 20 }}>6.4 mg/L</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981', fontWeight: 600 }}>
             <TrendingUp size={14} /> Stabil 24 jam terakhir
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: 40, borderBottom: '2px solid #E2E8F0', marginBottom: 32 }}>
        {[
          { id: 'ringkasan', label: 'Ringkasan' },
          { id: 'siklus-budidaya', label: 'Siklus Budidaya' },
          { id: 'riwayat-aktivitas', label: 'Riwayat Aktivitas' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '12px 0', border: 'none', background: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab.id ? '#1B4332' : '#94A3B8',
              borderBottom: activeTab === tab.id ? '4px solid #1B4332' : '4px solid transparent',
              marginBottom: -2,
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT RENDERING */}
      {activeTab === 'ringkasan' && (
        <div className="aq-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 32 }}>
          <style>{`
            @media (max-width: 1024px) {
              .aq-grid-2 { grid-template-columns: 1fr !important; }
            }
          `}</style>
          {/* Left Side: Charts & Growth */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ ...cardStyle, minHeight: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h3 className="aq-section-title">Tren pertumbuhan ikan</h3>
                <select style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: 13, fontWeight: 600 }}>
                  <option>7 hari terakhir</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 240, padding: '0 10px', gap: 12 }}>
                {[120, 145, 180, 220, 280, 310, 420].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: '100%', maxWidth: 40, height: (h/420) * 240, background: i === 6 ? '#1B4332' : '#C1F2D8', borderRadius: '8px', transition: 'height 0.3s ease' }} />
                    <span className="aq-small-text" style={{ fontWeight: 600 }}>{['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ color: '#1B4332' }}><ShoppingCart size={18} /></div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1C1A' }}>Prediksi Pakan</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#64748B', fontSize: 14 }}>Kebutuhan Harian</span>
                  <span style={{ fontWeight: 600, color: '#1A1C1A' }}>25.5 Kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ color: '#64748B', fontSize: 14 }}>Stok di Gudang</span>
                  <span style={{ fontWeight: 600, color: '#1A1C1A' }}>450 Kg</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                  "Cukup untuk 17 hari ke depan dengan asumsi pertumbuhan normal."
                </p>
              </div>
              <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ color: '#1B4332' }}><BarChart3 size={18} /></div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1C1A' }}>Target Panen</h4>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>ESTIMASI TANGGAL</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A' }}>15 November 2024</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1B4332' }}>75%</span>
                  <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Menuju Ukuran Konsumsi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Activity & Weather */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ ...cardStyle }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1C1A', margin: '0 0 24px 0' }}>Aktivitas Terbaru</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { title: 'Pemberian Pakan Siang', desc: '8.5 Kg • 2 jam yang lalu', color: '#10B981' },
                  { title: 'Cek Kualitas Air Rutin', desc: 'Semua parameter normal • 5 jam yang lalu', color: '#10B981' },
                  { title: 'Penambahan Aerasi', desc: 'Meningkatkan level DO • Kemarin', color: '#F59E0B' },
                ].map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: act.color, marginTop: 6 }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A1C1A' }}>{act.title}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#94A3B8' }}>{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: 32, padding: '12px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#1B4332', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Lihat Semua Riwayat
              </button>
            </div>
            <div style={{ padding: '32px', background: '#1A3326', borderRadius: '24px', color: '#fff' }}>
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CUACA SEKTOR UTARA</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
                <CloudRain size={48} />
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0 }}>24°C</h2>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Hujan Ringan Sore ini</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, opacity: 0.8 }}>
                Peringatan: Matikan pompa pakan otomatis jika hujan lebat untuk mencegah overfeeding.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'siklus-budidaya' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           <div style={{ ...cardStyle }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>Detail Siklus Produksi</h3>
                {cycle && (
                  <button onClick={() => setModalType('harvest')} style={{ padding: '10px 20px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    Selesaikan Panen
                  </button>
                )}
              </div>
              
              {!cycle ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, background: '#F1F5F9', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94A3B8' }}>
                    <Calendar size={32} />
                  </div>
                  <p style={{ fontSize: 14, color: '#94A3B8' }}>Belum ada siklus yang berjalan di kolam ini.</p>
                  <button onClick={() => setModalType('start')} style={{ marginTop: 16, padding: '12px 24px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Mulai Siklus Baru</button>
                </div>
              ) : (
              {/* Cycle Detail Grid */}
              <div className="aq-grid-2" style={{ gap: 40 }}>
                   <div>
                      <h4 style={{ fontSize: 14, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>DATA UTAMA</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Jenis Bibit</span> <span style={{ fontWeight: 600 }}>{cycle.seed_type}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Jumlah Tebar</span> <span style={{ fontWeight: 600 }}>{cycle.seed_count.toLocaleString()} Ekor</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Tanggal Tebar</span> <span style={{ fontWeight: 600 }}>{new Date(cycle.seed_date).toLocaleDateString('id-ID')}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Status Saat Ini</span> <span style={{ fontWeight: 600, color: '#1B4332' }}>{cycle.status.toUpperCase()}</span></div>
                      </div>
                   </div>
                   <div>
                      <h4 style={{ fontSize: 14, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>ANALISA BIAYA (HPP)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Biaya Bibit</span> <span style={{ fontWeight: 600 }}>Rp {metrics?.total_seed_cost.toLocaleString()}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B' }}>Biaya Pakan</span> <span style={{ fontWeight: 600 }}>Rp {metrics?.total_feed_cost.toLocaleString()}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E2E8F0' }}><span style={{ fontWeight: 700 }}>Total Modal Keluar</span> <span style={{ fontWeight: 700, color: '#EF4444' }}>Rp {metrics?.total_cost.toLocaleString()}</span></div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'riwayat-aktivitas' && (
        <div style={{ ...cardStyle }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>Log Riwayat Operasional</h3>
              {cycle && (
               <div style={{ display: 'flex', gap: 10 }}>
                 <button onClick={() => setModalType('expense')} style={{ padding: '10px 20px', background: '#fff', color: '#1B4332', border: '1.5px solid #1B4332', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={16} /> Gaji & Panen
                 </button>
                 <button onClick={() => setModalType('health')} style={{ padding: '10px 20px', background: '#fff', color: '#EF4444', border: '1.5px solid #EF4444', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} /> Catat Kematian
                 </button>
                 <button onClick={() => setModalType('feed')} style={{ padding: '10px 20px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={16} /> Catat Pakan
                 </button>
               </div>
              )}
           </div>
               <div className="aq-table-container">
                 <Table>
                   <TableHeader>
                      <TableRow isHoverable={false}>
                         <TableHeaderCell>Tanggal</TableHeaderCell>
                         <TableHeaderCell>Jenis aktivitas</TableHeaderCell>
                         <TableHeaderCell>Keterangan detail</TableHeaderCell>
                         <TableHeaderCell>Status</TableHeaderCell>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {cycle?.feedings?.map((f, i) => (
                         <TableRow key={`feed-${i}`}>
                            <TableCell style={{ fontWeight: 600 }}>{new Date(f.date).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>Pemberian pakan</TableCell>
                            <TableCell isSecondary>{f.inventory?.name} - {f.amount_kg} kg</TableCell>
                            <TableCell><span style={{ fontSize: 12, padding: '4px 10px', background: '#D1FAE5', color: '#065F46', borderRadius: 20, fontWeight: 600 }}>SELESAI</span></TableCell>
                         </TableRow>
                      ))}
                      {cycle?.healths?.map((h, i) => (
                         <TableRow key={`health-${i}`}>
                            <TableCell style={{ fontWeight: 600 }}>{new Date(h.date).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell style={{ color: '#EF4444', fontWeight: 700 }}>Kesehatan / Kematian</TableCell>
                            <TableCell isSecondary>
                              {h.mortality_count > 0 && <span style={{ color: '#EF4444', fontWeight: 600 }}>Mati: {h.mortality_count} ekor. </span>}
                              {h.disease_note && `Ket: ${h.disease_note}`}
                            </TableCell>
                            <TableCell><span style={{ fontSize: 12, padding: '4px 10px', background: '#FEE2E2', color: '#991B1B', borderRadius: 20, fontWeight: 600 }}>TERCATAT</span></TableCell>
                         </TableRow>
                      ))}
                      {cycle?.expenses?.filter(ex => !['pakan', 'benih'].includes(ex.category)).map((ex, i) => (
                         <TableRow key={`expense-${i}`}>
                            <TableCell style={{ fontWeight: 600 }}>{new Date(ex.date).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell style={{ color: '#1B4332', fontWeight: 700 }}>Biaya Operasional</TableCell>
                            <TableCell isSecondary>
                              {ex.category.toUpperCase()}: Rp {Number(ex.amount).toLocaleString()} - {ex.notes}
                            </TableCell>
                            <TableCell><span style={{ fontSize: 12, padding: '4px 10px', background: '#DBEAFE', color: '#1E40AF', borderRadius: 20, fontWeight: 600 }}>DIBAYAR</span></TableCell>
                         </TableRow>
                      ))}
                      {(!cycle || (!cycle.feedings?.length && !cycle.healths?.length && !cycle.expenses?.length)) && (
                        <TableRow><TableCell colSpan="4" style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8' }}>Belum ada riwayat aktivitas untuk siklus ini.</TableCell></TableRow>
                      )}
                   </TableBody>
                 </Table>
               </div>
        </div>
      )}

      {/* MODALS */}
      {modalType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 20px', borderBottom: '1px solid #E9F0EC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B4332' }}>{modalType === 'start' ? 'rocket_launch' : 'restaurant'}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>{modalType === 'start' ? 'Mulai Siklus Baru' : 'Catat Aktivitas'}</h3>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, marginTop: 2 }}>Lengkapi detail informasi di bawah ini</p>
                </div>
              </div>
              <button onClick={() => setModalType(null)} style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F7F5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* Modal Body */}
            {modalType === 'start' ? (
              <form onSubmit={handleStartCycle} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Pilih bibit</label>
                  <select required value={formStart.inventory_id} onChange={e => setFormStart({...formStart, inventory_id: e.target.value})} style={inputStyle}>
                    <option value="">-- Pilih Bibit --</option>
                    {seedItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jumlah tebar (ekor)</label>
                  <input type="number" required value={formStart.seed_count} onChange={e => setFormStart({...formStart, seed_count: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => setModalType(null)} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Mulai Siklus</button>
                </div>
              </form>
            ) : modalType === 'feed' ? (
              <form onSubmit={handleLogFeeding} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Pilih pakan</label>
                  <select required value={formFeed.inventory_id} onChange={e => setFormFeed({...formFeed, inventory_id: e.target.value})} style={inputStyle}>
                    <option value="">-- Pilih Pakan --</option>
                    {feedItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jumlah (kg)</label>
                  <input type="number" step="any" required value={formFeed.amount_kg} onChange={e => setFormFeed({...formFeed, amount_kg: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => setModalType(null)} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Simpan Aktivitas</button>
                </div>
              </form>
            ) : modalType === 'health' ? (
              <form onSubmit={handleLogHealth} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Jumlah kematian (ekor)</label>
                  <input type="number" required value={formHealth.mortality_count} onChange={e => setFormHealth({...formHealth, mortality_count: e.target.value})} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Catatan penyakit / gejala</label>
                  <textarea value={formHealth.disease_note} onChange={e => setFormHealth({...formHealth, disease_note: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder="Contoh: Ikan terlihat lemas, bintik putih..." />
                </div>
                <div>
                  <label style={labelStyle}>Tindakan yang dilakukan</label>
                  <textarea value={formHealth.treatment_note} onChange={e => setFormHealth({...formHealth, treatment_note: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder="Contoh: Pemberian obat A, ganti air 30%..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => setModalType(null)} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Catat Kesehatan</button>
                </div>
              </form>
            ) : modalType === 'expense' ? (
              <form onSubmit={handleLogExpense} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Kategori biaya</label>
                  <select required value={formExpense.category} onChange={e => setFormExpense({...formExpense, category: e.target.value})} style={inputStyle}>
                    <option value="gaji">Gaji Karyawan</option>
                    <option value="panen">Biaya Panen (Buruh/Logistik)</option>
                    <option value="listrik">Listrik & Air</option>
                    <option value="lainnya">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jumlah biaya (Rp)</label>
                  <input type="number" required value={formExpense.amount} onChange={e => setFormExpense({...formExpense, amount: e.target.value})} style={inputStyle} placeholder="Contoh: 500000" />
                </div>
                <div>
                  <label style={labelStyle}>Catatan tambahan</label>
                  <textarea value={formExpense.notes} onChange={e => setFormExpense({...formExpense, notes: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder="Contoh: Gaji bulan Mei untuk 2 orang..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => setModalType(null)} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Simpan Biaya</button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
