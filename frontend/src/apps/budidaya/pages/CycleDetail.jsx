import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../lib/api'
import { 
  ArrowLeft, ShoppingCart, Heart, Scale, BarChart3, Clock, 
  Calendar, Thermometer, CloudRain, ShieldCheck, TrendingUp,
  Plus, CheckCircle2, AlertCircle, MoreVertical, Utensils
} from 'lucide-react'
import Modal from '../../../components/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton } from '../components/UXComponents'

export default function CycleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ikhtisar_performa')
  const [modalType, setModalType] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form States
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
    setSaving(true)
    try {
      await api.post(`/budidaya/cycles/${id}/feedings`, formFeed)
      setModalType(null)
      fetchDetail()
    } catch (err) { alert('Gagal menyimpan pakan') }
    finally { setSaving(false) }
  }

  const handleHarvest = async (e) => {
    e.preventDefault()
    if(!confirm("Yakin ingin memanen siklus ini?")) return
    setSaving(true)
    try {
       await api.post(`/budidaya/cycles/${id}/harvest`, formHarvest)
       setModalType(null)
       navigate('/budidaya/reports')
    } catch (err) { alert(err.response?.data?.message || "Gagal memproses panen") }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat detail siklus...</p>
    </div>
  )

  const cycle = data?.cycle
  const stats = data?.stats || { total_cost: 0, total_revenue: 0, profit: 0, current_population: 0, survival_rate: 0, total_feed_kg: 0, fcr: 0 }
  const doc = cycle ? Math.ceil(Math.abs(new Date() - new Date(cycle.seed_date)) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="animate-fade-in" style={{ padding: '20px 20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '10px' }}>
        <button onClick={() => navigate('/budidaya/reports')} className="btn-back-v2">
          <ArrowLeft size={16} /> <span>Kembali ke laporan</span>
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button className="btn-secondary-v2" onClick={() => window.print()}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
              Cetak laporan
           </button>
        </div>
      </div>

      {/* Top Header Card */}
      <div className="premium-card" style={{ padding: '32px', marginBottom: '24px', background: '#fff', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
               <span style={{ padding: '4px 8px', background: '#F1F5F9', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#64748B' }}>
                  #CYC-{cycle?.id || '---'}
               </span>
               <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }}></div>
               <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>{cycle?.pond?.area || 'Area tidak diketahui'}</span>
            </div>
            <h1 className="aq-page-title" style={{ margin: '0 0 12px', fontSize: '32px' }}>{cycle?.pond?.name || 'Pilih kolam'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: 500, fontSize: '14px' }}>
                  <Calendar size={16} style={{ color: '#1B4332' }} />
                  <span>Tebar: {cycle?.seed_date ? new Date(cycle.seed_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}</span>
               </div>
               <div style={{ width: 1, height: 16, background: '#E2E8F0' }}></div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: 500, fontSize: '14px' }}>
                  <Plus size={16} style={{ color: '#1B4332' }} />
                  <span>{(cycle?.seed_count || 0).toLocaleString('id-ID')} {cycle?.seed_type || 'Benur'}</span>
               </div>
            </div>
          </div>
          <div style={{ 
            padding: '8px 20px', borderRadius: '40px', 
            background: cycle?.status === 'panen' ? '#F1F5F9' : '#D1FAE5', 
            color: cycle?.status === 'panen' ? '#475569' : '#065F46', 
            fontSize: '12px', fontWeight: 800, 
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></div>
            {cycle?.status === 'panen' ? 'Siklus selesai' : 'Sedang berjalan'}
          </div>
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px' }}>
          <div className="kpi-card-v3">
            <p className="aq-kpi-label" style={{ fontSize: '10px', textTransform: 'none' }}>Masa budidaya</p>
            <h2 className="aq-kpi-value" style={{ fontSize: '28px' }}>{doc} <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 500 }}>Hari</span></h2>
            <div className="kpi-progress-v3"><div style={{ width: '65%', background: '#1B4332' }}></div></div>
          </div>
          <div className="kpi-card-v3">
            <p className="aq-kpi-label" style={{ fontSize: '10px', textTransform: 'none' }}>Estimasi populasi</p>
            <h2 className="aq-kpi-value" style={{ fontSize: '28px' }}>{(stats.current_population || 0).toLocaleString('id-ID')} <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 500 }}>Ekor</span></h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 12, color: '#059669', fontSize: '11px', fontWeight: 700 }}>
               <TrendingUp size={12} /> Status stabil
            </div>
          </div>
          <div className="kpi-card-v3">
            <p className="aq-kpi-label" style={{ fontSize: '10px', textTransform: 'none' }}>Survival rate</p>
            <h2 className="aq-kpi-value" style={{ fontSize: '28px' }}>{stats.survival_rate || 0}%</h2>
            <div style={{ display: 'flex', gap: '3px', marginTop: 12 }}>
               {[1,2,3,4,5,6].map(i => <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= 5 ? '#1B4332' : '#E2E8F0' }}></div>)}
            </div>
          </div>
          <div className="kpi-card-v3">
            <p className="aq-kpi-label" style={{ fontSize: '10px', textTransform: 'none' }}>Total pakan</p>
            <h2 className="aq-kpi-value" style={{ fontSize: '28px' }}>{(stats.total_feed_kg || 0).toLocaleString('id-ID')} <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 500 }}>KG</span></h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 12, color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
               <ShoppingCart size={12} /> {data?.feedings?.length || 0} Log terpantau
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Left Content Area */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px' }}>
            {[
               { id: 'ikhtisar_performa', label: 'Ikhtisar Performa', icon: BarChart3 },
               { id: 'log_pakan', label: 'Log Pakan', icon: ShoppingCart },
               { id: 'laporan_keuangan', label: 'Laporan Keuangan', icon: ShieldCheck }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 0', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? '#1B4332' : '#64748B',
                  position: 'relative', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
                {activeTab === tab.id && (
                  <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '3px', background: '#1B4332', borderRadius: '3px' }}></div>
                )}
              </button>
            ))}
          </div>

          <div style={{ minHeight: '500px' }}>
            {activeTab === 'laporan_keuangan' && (
              <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="premium-card" style={{ padding: '16px', background: '#fff' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#1B4332' }}>Analisa Profitabilitas Siklus</h4>
                      <div style={{ padding: '3px 8px', background: (stats.profit || 0) >= 0 ? '#DCFCE7' : '#FEE2E2', color: (stats.profit || 0) >= 0 ? '#166534' : '#991B1B', borderRadius: '5px', fontSize: '9px', fontWeight: 900 }}>
                         {(stats.profit || 0) >= 0 ? '+' : ''}{((stats.profit / (stats.total_cost || 1)) * 100).toFixed(1)}% Margin
                      </div>
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div className="finance-summary-box" style={{ padding: '10px', background: '#FEF2F2' }}>
                         <p className="aq-kpi-label" style={{ fontSize: '9px', textTransform: 'none', color: '#991B1B', opacity: 0.8, marginBottom: '2px' }}>Modal Produksi</p>
                         <h2 className="aq-kpi-value" style={{ color: '#E11D48', fontSize: '15px', fontWeight: 900, margin: 0 }}>
                            Rp {(Number(stats.total_cost) || 0).toLocaleString('id-ID')}
                         </h2>
                      </div>
                      <div className="finance-summary-box" style={{ background: '#F0FDF4', padding: '10px' }}>
                         <p className="aq-kpi-label" style={{ fontSize: '9px', textTransform: 'none', color: '#166534', opacity: 0.7, marginBottom: '2px' }}>Pendapatan Kotor</p>
                         <h2 className="aq-kpi-value" style={{ color: '#059669', fontSize: '15px', fontWeight: 900, margin: 0 }}>
                            Rp {(Number(stats.total_revenue) || 0).toLocaleString('id-ID')}
                         </h2>
                      </div>
                      <div className="finance-summary-box" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px' }}>
                         <p className="aq-kpi-label" style={{ fontSize: '9px', textTransform: 'none', color: '#475569', opacity: 0.7, marginBottom: '2px' }}>Hasil Bersih</p>
                         <h2 className="aq-kpi-value" style={{ color: (stats.profit || 0) >= 0 ? '#1B4332' : '#E11D48', fontSize: '15px', fontWeight: 900, margin: 0 }}>
                            Rp {(Number(stats.profit) || 0).toLocaleString('id-ID')}
                         </h2>
                      </div>
                   </div>
                </div>

                <div className="premium-card" style={{ padding: 0, overflow: 'hidden', background: '#fff' }}>
                   <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Rincian Struktur Biaya</h4>
                   </div>
                   <Table>
                      <TableHeader>
                         <TableRow isHoverable={false}>
                            <TableHeaderCell>Kategori Pengeluaran</TableHeaderCell>
                            <TableHeaderCell>Persentase</TableHeaderCell>
                            <TableHeaderCell style={{ textAlign: 'right' }}>Total Nominal</TableHeaderCell>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {(stats.expense_summary || []).length === 0 ? (
                            <TableRow><TableCell colSpan="3" style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>Tidak ada data biaya tercatat.</TableCell></TableRow>
                         ) : (stats.expense_summary || []).map((exp, i) => {
                            const pct = ((exp.total / (stats.total_cost || 1)) * 100).toFixed(1)
                            return (
                              <TableRow key={i}>
                                 <TableCell style={{ textTransform: 'capitalize', fontWeight: 700 }}>{exp.category}</TableCell>
                                 <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                       <div style={{ flex: 1, height: '4px', background: '#F1F5F9', borderRadius: '2px' }}><div style={{ height: '100%', width: `${pct}%`, background: '#1B4332', borderRadius: '2px' }}></div></div>
                                       <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', width: '40px' }}>{pct}%</span>
                                    </div>
                                 </TableCell>
                                 <TableCell style={{ textAlign: 'right', fontWeight: 800, color: '#1B4332' }}>Rp {parseFloat(exp.total).toLocaleString('id-ID')}</TableCell>
                              </TableRow>
                            )
                         })}
                      </TableBody>
                   </Table>
                </div>
              </div>
            )}

            {activeTab === 'ikhtisar_performa' && (
              <div className="animate-slide-up">
                <div className="premium-card" style={{ padding: '32px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1B4332' }}>Evolusi Parameter Utama</h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B4332' }}></div> DO (Oxygen)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D8F3DC' }}></div> Temperatur</div>
                      </div>
                  </div>

                  <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '24px', paddingBottom: '20px' }}>
                      {[
                        { label: 'MNG 1', h: 40 }, { label: 'MNG 2', h: 60 }, { label: 'MNG 3', h: 50 },
                        { label: 'MNG 4', h: 80 }, { label: 'MNG 5', h: 70 }, { label: 'MNG 6', h: 90 }, { label: 'HARI INI', h: 100, active: true }
                      ].map((bar, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div className="chart-bar-v2" style={{ height: `${bar.h}%`, background: bar.active ? '#D8F3DC' : '#F1F5F9' }}>
                             <div className="chart-dot-v2"></div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8' }}>{bar.label}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                  <div className="premium-card" style={{ padding: '24px', background: '#fff' }}>
                      <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 800 }}>Indikator Kesehatan</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                           { name: 'Cek Hepatopankreas', time: '2 jam yang lalu', status: 'NORMAL' },
                           { name: 'Visual Udang', time: 'Kemarin', status: 'AKTIF' }
                        ].map((h, i) => (
                           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '12px' }}>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <CheckCircle2 size={18} />
                                 </div>
                                 <div>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>{h.name}</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>{h.time}</p>
                                 </div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>{h.status}</span>
                           </div>
                        ))}
                      </div>
                  </div>

                  <div className="premium-card" style={{ padding: '24px', background: '#fff' }}>
                      <h4 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 800 }}>Efisiensi Pakan (FCR)</h4>
                      <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <h2 className="aq-kpi-value" style={{ fontSize: '48px', margin: 0, letterSpacing: '-0.05em' }}>{stats.fcr || '0,00'}</h2>
                        <p style={{ margin: '4px 0 24px', fontSize: '12px', fontWeight: 700, color: '#64748B' }}>TARGET IDEAL: 1.15</p>
                        <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: '#059669', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'log_pakan' && (
               <div className="animate-slide-up premium-card" style={{ padding: 0, overflow: 'hidden', background: '#fff' }}>
                  <Table>
                    <TableHeader>
                      <TableRow isHoverable={false}>
                        <TableHeaderCell>Tanggal Log</TableHeaderCell>
                        <TableHeaderCell>Jenis Pakan</TableHeaderCell>
                        <TableHeaderCell>Kuantitas (kg)</TableHeaderCell>
                        <TableHeaderCell style={{ textAlign: 'right' }}>Waktu Input</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.feedings || []).length === 0 ? (
                         <TableRow><TableCell colSpan="4" style={{ padding: '80px', textAlign: 'center', color: '#94A3B8' }}>Belum ada log pemberian pakan.</TableCell></TableRow>
                      ) : (data?.feedings || []).map((f, i) => (
                        <TableRow key={i}>
                          <TableCell style={{ fontWeight: 700 }}>{new Date(f.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                          <TableCell><span style={{ padding: '4px 8px', background: '#E0F2FE', color: '#0369A1', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{f.feed_name}</span></TableCell>
                          <TableCell style={{ fontWeight: 800 }}>{(parseFloat(f.amount_kg) || 0).toLocaleString('id-ID')} <span style={{ fontSize: '11px', opacity: 0.5 }}>KG</span></TableCell>
                          <TableCell style={{ textAlign: 'right', color: '#94A3B8', fontSize: '12px' }}>{new Date(f.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#1B4332', borderRadius: '28px', padding: '32px 24px', color: '#fff' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 800 }}>Log Operasional</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <button onClick={() => setModalType('feed')} className="sidebar-op-btn-v2" disabled={cycle?.status === 'panen'}>
                  <div className="op-icon-v2"><Utensils size={18} /></div>
                  <span>Input Pakan</span>
               </button>
               <button onClick={() => setModalType('sampling')} className="sidebar-op-btn-v2" disabled={cycle?.status === 'panen'}>
                  <div className="op-icon-v2"><Scale size={18} /></div>
                  <span>Sampling Baru</span>
               </button>
               <button onClick={() => setModalType('health')} className="sidebar-op-btn-v2" disabled={cycle?.status === 'panen'}>
                  <div className="op-icon-v2"><Heart size={18} /></div>
                  <span>Laporan Kesehatan</span>
               </button>
               
               {cycle?.status !== 'panen' && (
                  <button 
                    onClick={() => setModalType('harvest')}
                    style={{ 
                       marginTop: '12px', padding: '16px', borderRadius: '18px', border: 'none', 
                       background: '#D8F3DC', color: '#1B4332', fontWeight: 900, fontSize: '15px',
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                       cursor: 'pointer'
                    }}
                  >
                     <ShieldCheck size={20} />
                     <span>Finalisasi & Panen</span>
                  </button>
               )}
               {cycle?.status === 'panen' && (
                  <div style={{ marginTop: '12px', padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.1)', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
                     <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, opacity: 0.8 }}>Siklus ini telah selesai dan diarsipkan.</p>
                  </div>
               )}
            </div>
          </div>

          <div className="premium-card" style={{ padding: '24px', background: '#fff', border: '1px solid #E2E8F0' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748B', fontWeight: 800, fontSize: '11px', marginBottom: '16px', textTransform: 'uppercase' }}>
                <CloudRain size={16} /> CUACA LOKAL
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                   <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#1E293B' }}>28°C</h2>
                   <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Hujan Ringan</p>
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '8px', background: '#FEE2E2', color: '#E11D48', fontSize: '10px', fontWeight: 900 }}>
                   RISIKO PH
                </div>
             </div>
          </div>

          <div className="premium-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)' }}>
             <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: '#1B4332' }}>Bantuan & panduan</h4>
             <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: 400, lineHeight: '1.6' }}>
                Butuh bantuan dalam menganalisa data siklus? <br/>
                <a href="#" style={{ color: '#1B4332', fontWeight: 600, textDecoration: 'none' }}>Hubungi tenaga ahli →</a>
             </p>
          </div>

        </div>

      </div>

      <style>{`
        .btn-back-v2 { 
          display: flex; align-items: center; gap: 8px; border: none; background: none; 
          color: #64748B; font-weight: 800; font-size: 13px; cursor: pointer; padding: 8px 0;
          transition: color 0.2s;
        }
        .btn-back-v2:hover { color: #1B4332; }
        
        .btn-secondary-v2 {
          display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px;
          border: 1.5px solid #E2E8F0; background: #fff; color: #1E293B; font-size: 13px;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .btn-secondary-v2:hover { background: #F8FAFC; border-color: #CBD5E1; }

        .kpi-card-v3 { padding: 20px; background: #fff; border-radius: 20px; border: 1px solid #F1F5F9; box-shadow: 0 4px 10px -2px rgba(0,0,0,0.02); }
        .kpi-label-v3 { margin: 0 0 6px; font-size: 10px; font-weight: 900; color: #94A3B8; letter-spacing: 0.05em; }
        .kpi-value-v3 { margin: 0; font-size: 28px; font-weight: 950; color: #1B4332; letter-spacing: -0.03em; }
        .kpi-unit-v3 { font-size: 12px; color: #94A3B8; font-weight: 700; margin-left: 4px; }
        .kpi-progress-v3 { width: 100%; height: 4px; background: #F1F5F9; border-radius: 2px; margin-top: 14px; overflow: hidden; }
        .kpi-progress-v3 > div { height: 100%; border-radius: 2px; }

        .finance-summary-box { padding: 24px; border-radius: 20px; background: #FFF1F2; }
        .finance-label { margin: 0 0 8px; font-size: 11px; font-weight: 900; color: #94A3B8; letter-spacing: 0.05em; }
        .finance-value { margin: 0; font-size: 24px; font-weight: 950; letter-spacing: -0.02em; }

        .sidebar-op-btn-v2 { 
          display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 18px; 
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
        }
        .sidebar-op-btn-v2:hover:not(:disabled) { background: rgba(255,255,255,0.15); transform: translateX(4px); }
        .sidebar-op-btn-v2:disabled { opacity: 0.5; cursor: not-allowed; }
        .op-icon-v2 { 
          width: 36px; height: 36px; border-radius: 12px; background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center; color: #6EE7B7;
        }

        .chart-bar-v2 { width: 100%; border-radius: 8px 8px 4px 4px; position: relative; transition: height 0.3s; }
        .chart-dot-v2 { position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; border-radius: 50%; background: #1B4332; border: 2px solid #fff; }

        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
        @keyframes slideUp {
           from { opacity: 0; transform: translateY(20px); }
           to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Modals reuse same as before but styled consistent with V2 inputs */}


      {/* Modals */}
      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={
         modalType === 'feed' ? 'Catat Pemberian Pakan' :
         modalType === 'sampling' ? 'Data Sampling Unit' :
         modalType === 'health' ? 'Laporan Kesehatan' : 'Finalisasi Produksi'
      }>
         {modalType === 'feed' && (
            <form onSubmit={handleLogFeeding} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div>
                  <label className="aq-kpi-label">Pilih Pakan</label>
                  <select required className="form-input" value={formFeed.feed_stock_id} onChange={e => setFormFeed({...formFeed, feed_stock_id: e.target.value})}>
                     <option value="">-- Pilih Stok Pakan --</option>
                     {feedStocks.map(fs => <option key={fs.id} value={fs.id}>{fs.name} (Sisa: {fs.stock_kg}kg)</option>)}
                  </select>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                     <label className="aq-kpi-label">Berat (kg)</label>
                     <input required type="number" step="any" className="form-input" value={formFeed.amount_kg} onChange={e => setFormFeed({...formFeed, amount_kg: e.target.value})} />
                  </div>
                  <div>
                     <label className="aq-kpi-label">Tanggal</label>
                     <input required type="date" className="form-input" value={formFeed.date} onChange={e => setFormFeed({...formFeed, date: e.target.value})} />
                  </div>
               </div>
               <LoadingButton loading={saving} type="submit" className="btn btn-primary btn-full">Simpan Pakan</LoadingButton>
            </form>
         )}

         {modalType === 'harvest' && (
            <form onSubmit={handleHarvest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                     <label className="aq-kpi-label">Total Berat (kg)</label>
                     <input required type="number" step="any" className="form-input" value={formHarvest.total_weight_kg} onChange={e => setFormHarvest({...formHarvest, total_weight_kg: e.target.value})} />
                  </div>
                  <div>
                     <label className="aq-kpi-label">Harga per kg</label>
                     <input required type="number" className="form-input" value={formHarvest.sale_price_per_kg} onChange={e => setFormHarvest({...formHarvest, sale_price_per_kg: e.target.value})} />
                  </div>
               </div>
               <div>
                  <label className="aq-kpi-label">Tanggal Panen</label>
                  <input required type="date" className="form-input" value={formHarvest.harvest_date} onChange={e => setFormHarvest({...formHarvest, harvest_date: e.target.value})} />
               </div>
               <LoadingButton loading={saving} type="submit" className="btn btn-primary btn-full">Selesaikan & Panen</LoadingButton>
            </form>
         )}
      </Modal>

      <style>{`
        .kpi-card-v2 { padding: 20px; background: #F8FAFC; border-radius: 20px; border: 1px solid #F1F5F9; }
        .kpi-label-v2 { margin: 0 0 8px; font-size: 11px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
        .kpi-value-v2 { margin: 0 0 4px; font-size: 24px; font-weight: 900; color: #1B4332; }
        .kpi-unit-v2 { font-size: 13px; color: #94A3B8; font-weight: 700; margin-left: 4px; }
        .progress-bar-v2 { width: 100%; height: 6px; background: #F1F5F9; border-radius: 3px; margin-top: 12px; overflow: hidden; }
        .progress-fill-v2 { height: 100%; border-radius: 3px; }
        
        .sidebar-op-btn { 
          display: flex; align-items: center; gap: 14px; width: 100%; padding: 12px 16px; 
          background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 16px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
        }
        .sidebar-op-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .op-icon-wrapper { 
          width: 36px; height: 36px; border-radius: 12px; background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center; color: #6EE7B7;
        }
        
        .form-input { 
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #E2E8F0;
          font-size: 14px; font-weight: 600; outline: none; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #1B4332; }
      `}</style>
    </div>
  )
}
