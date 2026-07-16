import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { api } from '../../../lib/api'
import { 
  ArrowLeft, Droplets, Activity, 
  TrendingUp, AlertTriangle, CheckCircle2,
  Calendar, Info, Plus, ChevronRight,
  ShoppingCart, Heart, Scale, Trash2,
  Play, CheckSquare, BarChart3, Clock, DollarSign,
  CloudRain, Wind, Thermometer, Waves, Sprout
} from 'lucide-react'
import Modal from '../../../components/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'

// Helper for card styles to match high-fidelity UI
const cardStyle = {
  background: '#fff',
  borderRadius: '24px',
  border: '1px solid #E9F0EC',
  padding: '24px',
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
  color: '#475569',
  display: 'block',
  marginBottom: 6,
}

// ── Numeric Input Component ──
const NumericInput = ({ label, value, onChange, placeholder, suffix, required = false }) => {
  const formatIndo = (val) => {
    if (!val && val !== 0) return '';
    let [num, dec] = val.toString().split('.');
    num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return dec !== undefined ? `${num},${dec}` : num;
  };

  const [display, setDisplay] = React.useState(formatIndo(value));

  React.useEffect(() => {
    setDisplay(formatIndo(value));
  }, [value]);

  const onLocalChange = (e) => {
    let input = e.target.value.replace(/\./g, '').replace(',', '.');
    if (input === '' || /^\d*\.?\d*$/.test(input)) {
      onChange(input);
    }
  };

  return (
    <div>
      <label style={labelStyle}>{label} {required && <span style={{ color: '#EF4444' }}>*</span>}</label>
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={display} 
          onChange={onLocalChange} 
          placeholder={placeholder} 
          style={{ ...inputStyle, paddingRight: suffix ? '45px' : '14px' }}
          required={required}
        />
        {suffix && (
          <span style={{ 
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            fontSize: 12, fontWeight: 700, color: '#94A3B8', pointerEvents: 'none'
          }}>{suffix}</span>
        )}
      </div>
    </div>
  );
};

export default function PondDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const terms = useBudidayaTerms()
  const { setCustomTitle } = useOutletContext() || {}
  const [data, setData] = useState(null)
  const [pond, setPond] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ringkasan')
  const [modalType, setModalType] = useState(null)
  const [editingLog, setEditingLog] = useState(null)
  
  const [inventories, setInventories] = useState([])
  const feedItems = inventories.filter(i => {
    const cat = i.category.toLowerCase()
    return cat === 'pakan' || cat === 'pupuk'
  })
  const seedItems = inventories.filter(i => {
    const cat = i.category.toLowerCase()
    return cat === 'bibit' || cat === 'benih'
  })

  const [formStart, setFormStart] = useState({ 
    input_method: 'manual', 
    inventory_id: '', 
    seed_type: '', 
    seed_count: '', 
    total_seed_cost: '', 
    seed_date: new Date().toISOString().split('T')[0], 
    expected_harvest_date: '' 
  })
  const [formFeed, setFormFeed] = useState({ inventory_id: '', amount_kg: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [formHarvest, setFormHarvest] = useState({ weight_kg: '', price_per_kg: '', date: new Date().toISOString().split('T')[0], notes: '', harvest_type: 'total' })
  const [formHealth, setFormHealth] = useState({ mortality_count: 0, disease_note: '', treatment_note: '', date: new Date().toISOString().split('T')[0] })
  const [formExpense, setFormExpense] = useState({ category: 'gaji', amount: '', notes: '', date: new Date().toISOString().split('T')[0] })
  const [formMove, setFormMove] = useState({ new_pond_id: '' })
  const [formSampling, setFormSampling] = useState({ average_weight_gram: '', sample_count: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [emptyPonds, setEmptyPonds] = useState([])
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

  const fetchEmptyPonds = async () => {
    try {
      const res = await api.get('/budidaya/ponds?status=kosong')
      setEmptyPonds(res.data.data || res.data)
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
      if (editingLog) {
        await api.put(`/budidaya/feedings/${editingLog.id}`, formFeed)
      } else {
        await api.post(`/budidaya/cycles/${data.cycle.id}/feedings`, formFeed)
      }
      setModalType(null)
      setEditingLog(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal") }
  }

  const handleLogHealth = async (e) => {
    e.preventDefault()
    try {
      if (editingLog) {
        await api.put(`/budidaya/health/${editingLog.id}`, formHealth)
      } else {
        await api.post(`/budidaya/cycles/${data.cycle.id}/health`, formHealth)
      }
      setModalType(null)
      setEditingLog(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat kesehatan") }
  }

  const handleLogExpense = async (e) => {
    e.preventDefault()
    try {
      if (editingLog) {
        await api.put(`/budidaya/expenses/${editingLog.id}`, formExpense)
      } else {
        await api.post('/budidaya/expenses', { ...formExpense, cycle_id: data.cycle.id })
      }
      setModalType(null)
      setEditingLog(null)
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat biaya") }
  }

  const handleMovePond = async (e) => {
    e.preventDefault()
    if (!formMove.new_pond_id) return alert(`Pilih ${terms.unitLower} tujuan terlebih dahulu`)
    
    try {
      setLoading(true)
      await api.post(`/budidaya/cycles/${data.cycle.id}/move`, formMove)
      setModalType(null)
      alert("Siklus berhasil dipindahkan!")
      navigate(`/budidaya/ponds/${formMove.new_pond_id}`)
    } catch (err) {
      alert(err.response?.data?.message || `Gagal memindahkan ${terms.unitLower}`)
      setLoading(false)
    }
  }

  const handleLogSampling = async (e) => {
    e.preventDefault()
    try {
      if (editingLog) {
        await api.put(`/budidaya/samplings/${editingLog.id}`, {
          ...formSampling,
          average_weight_gram: Number(formSampling.average_weight_gram),
          sample_count: formSampling.sample_count ? Number(formSampling.sample_count) : undefined,
        })
      } else {
        await api.post('/budidaya/samplings', {
          ...formSampling,
          cycle_id: data.cycle.id,
          average_weight_gram: Number(formSampling.average_weight_gram),
          sample_count: formSampling.sample_count ? Number(formSampling.sample_count) : undefined,
        })
      }
      setModalType(null)
      setEditingLog(null)
      setFormSampling({ average_weight_gram: '', sample_count: '', date: new Date().toISOString().split('T')[0], notes: '' })
      fetchPondData()
    } catch (err) { alert(err.response?.data?.message || "Gagal mencatat sampling") }
  }

  const handleHarvest = async (e) => {
    if (e) e.preventDefault()
    
    const cycleId = data?.cycle?.id
    if (!cycleId) {
      alert("Tidak ada siklus aktif untuk dipanen.")
      return
    }

    if (!formHarvest.weight_kg || !formHarvest.price_per_kg) {
      alert("Mohon isi berat panen dan harga jual.")
      return
    }
    
    try {
      setLoading(true)
      let res;
      if (editingLog) {
        res = await api.put(`/budidaya/harvests/${editingLog.id}`, {
          weight_kg: Number(formHarvest.weight_kg),
          price_per_kg: Number(formHarvest.price_per_kg),
          date: formHarvest.date,
          notes: formHarvest.notes
        })
      } else {
        res = await api.post(`/budidaya/cycles/${cycleId}/harvest`, {
          ...formHarvest,
          weight_kg: Number(formHarvest.weight_kg),
          price_per_kg: Number(formHarvest.price_per_kg)
        })
      }
      
      alert(res.data.message || "Panen berhasil dicatat!")
      setModalType(null)
      setEditingLog(null)
      setFormHarvest({ weight_kg: '', price_per_kg: '', date: new Date().toISOString().split('T')[0], notes: '', harvest_type: 'total' })
      
      await fetchPondData()
    } catch (err) { 
      console.error("Harvest Error:", err)
      const msg = err.response?.data?.message || "Terjadi kesalahan sistem saat mencatat panen."
      alert("Gagal: " + msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLog = async (log) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus catatan ${log.type}?`)) return
    try {
      setLoading(true)
      let url = ''
      if (log.logType === 'feed') url = `/budidaya/feedings/${log.original.id}`
      else if (log.logType === 'health') url = `/budidaya/health/${log.original.id}`
      else if (log.logType === 'sampling') url = `/budidaya/samplings/${log.original.id}`
      else if (log.logType === 'expense') url = `/budidaya/expenses/${log.original.id}`
      else if (log.logType === 'harvest') url = `/budidaya/harvests/${log.original.id}`

      await api.delete(url)
      alert("Catatan berhasil dihapus")
      await fetchPondData()
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus catatan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (setCustomTitle && pond) {
      setCustomTitle(pond.name)
    }
    return () => {
      if (setCustomTitle) setCustomTitle('')
    }
  }, [pond, setCustomTitle])



  const cycle = data?.cycle
  const metrics = data?.metrics
  const age_days = data?.age_days
  const latestWeightGram = data?.latest_weight_gram

  const activityLogs = useMemo(() => {
    if (!cycle) return []
    const list = []

    if (cycle.feedings) {
      cycle.feedings.forEach(f => {
        list.push({
          id: `feed-${f.id}`,
          date: f.date,
          type: terms.isTanaman ? 'Pemberian pupuk' : 'Pemberian pakan',
          detail: `${f.inventory?.name || terms.feedLabelShort} - ${f.amount_kg} kg`,
          notes: f.notes || '-',
          statusText: 'Selesai',
          statusColor: { bg: '#D1FAE5', text: '#065F46' },
          original: f,
          logType: 'feed'
        })
      })
    }

    if (cycle.healths) {
      cycle.healths.forEach(h => {
        list.push({
          id: `health-${h.id}`,
          date: h.date,
          type: terms.isTanaman ? 'Kesehatan / Layu' : 'Kesehatan / Kematian',
          detail: `${h.mortality_count > 0 ? `Mati/Layu: ${h.mortality_count} ${terms.populationCount}. ` : ''}${h.disease_note || ''}`,
          notes: h.disease_note || '-',
          statusText: 'Tercatat',
          statusColor: { bg: '#FEE2E2', text: '#991B1B' },
          original: h,
          logType: 'health'
        })
      })
    }

    if (cycle.samplings) {
      cycle.samplings.forEach(s => {
        list.push({
          id: `sampling-${s.id}`,
          date: s.date,
          type: terms.isTanaman ? 'Sampling Tinggi/Berat' : 'Sampling Berat',
          detail: `Rata-rata: ${Number(s.average_weight_gram).toLocaleString('id-ID')} ` + (terms.isTanaman ? 'cm' : 'g') +
                  (s.estimated_biomass_kg ? ` • Biomassa: ${Number(s.estimated_biomass_kg).toLocaleString('id-ID')} kg` : '') +
                  (s.sample_count ? ` • Sampel: ${s.sample_count} ${terms.populationCount}` : ''),
          notes: s.notes || '-',
          statusText: 'Tercatat',
          statusColor: { bg: '#EDE9FE', text: '#5B21B6' },
          original: s,
          logType: 'sampling'
        })
      })
    }

    if (cycle.expenses) {
      cycle.expenses.filter(ex => !['pakan', 'benih', 'pupuk', 'bibit'].includes(ex.category)).forEach(ex => {
        list.push({
          id: `expense-${ex.id}`,
          date: ex.date,
          type: 'Biaya Operasional',
          detail: `${ex.category.charAt(0).toUpperCase() + ex.category.slice(1)}: Rp ${Number(ex.amount).toLocaleString()}`,
          notes: ex.notes || '-',
          statusText: 'Dibayar',
          statusColor: { bg: '#DBEAFE', text: '#1E40AF' },
          original: ex,
          logType: 'expense'
        })
      })
    }

    if (cycle.harvests) {
      cycle.harvests.forEach(hv => {
        list.push({
          id: `harvest-${hv.id}`,
          date: hv.harvest_date,
          type: 'Panen',
          detail: `Berat: ${Number(hv.total_weight_kg).toLocaleString('id-ID')} kg` +
                  (hv.sale_price_per_kg ? ` • Harga/kg: Rp ${Number(hv.sale_price_per_kg).toLocaleString()}` : '') +
                  (hv.total_revenue ? ` • Pendapatan: Rp ${Number(hv.total_revenue).toLocaleString()}` : ''),
          notes: hv.notes || '-',
          statusText: 'Panen',
          statusColor: { bg: '#FEF3C7', text: '#D97706' },
          original: hv,
          logType: 'harvest'
        })
      })
    }

    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [cycle, terms])

  const handleTriggerEdit = (log) => {
    setEditingLog(log.original)
    if (log.logType === 'feed') {
      setFormFeed({
        inventory_id: log.original.inventory_id || '',
        amount_kg: log.original.amount_kg || '',
        date: new Date(log.original.date).toISOString().split('T')[0],
        notes: log.original.notes || ''
      })
      setModalType('feed')
    } else if (log.logType === 'health') {
      setFormHealth({
        mortality_count: log.original.mortality_count || 0,
        disease_note: log.original.disease_note || '',
        treatment_note: log.original.treatment_note || '',
        date: new Date(log.original.date).toISOString().split('T')[0]
      })
      setModalType('health')
    } else if (log.logType === 'sampling') {
      setFormSampling({
        average_weight_gram: log.original.average_weight_gram || '',
        sample_count: log.original.sample_count || '',
        date: new Date(log.original.date).toISOString().split('T')[0],
        notes: log.original.notes || ''
      })
      setModalType('sampling')
    } else if (log.logType === 'expense') {
      setFormExpense({
        category: log.original.category || 'gaji',
        amount: log.original.amount || '',
        notes: log.original.notes || '',
        date: new Date(log.original.date).toISOString().split('T')[0]
      })
      setModalType('expense')
    } else if (log.logType === 'harvest') {
      setFormHarvest({
        weight_kg: log.original.total_weight_kg || '',
        price_per_kg: log.original.sale_price_per_kg || '',
        date: new Date(log.original.harvest_date).toISOString().split('T')[0],
        notes: log.original.notes || '',
        harvest_type: 'total'
      })
      setModalType('harvest')
    }
  }

  // Build chart data from real samplings
  const samplingList = cycle?.samplings || []
  const hasChartData = samplingList.length > 0

  // Normalize samplings to chart points: x=0..800, y based on weight
  const chartPoints = samplingList.map((s) => ({
    date: new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    weight: Number(s.average_weight_gram),
  }))
  const chartMax = hasChartData ? Math.max(...chartPoints.map(p => p.weight)) * 1.25 : 500
  const svgWidth = 800
  const svgHeight = 220
  const padLeft = 42   // room for Y-axis labels inside SVG
  const padRight = 10
  const padTop = 48    // room for weight label above each dot
  const padBottom = 36 // room for date label below
  const plotW = svgWidth - padLeft - padRight
  const plotH = svgHeight - padTop - padBottom

  const getX = (i) => padLeft + (chartPoints.length <= 1 ? plotW / 2 : i * plotW / (chartPoints.length - 1))
  const getY = (w) => padTop + plotH - (w / chartMax) * plotH

  // Fallback dummy data for illustration when no samplings
  const dummyPoints = [
    { weight: 50, date: 'Contoh' },
    { weight: 90, date: '' },
    { weight: 140, date: '' },
    { weight: 200, date: '' },
    { weight: 260, date: '' },
    { weight: 310, date: '' },
    { weight: 380, date: '' },
  ]
  const displayPoints = hasChartData ? chartPoints : dummyPoints
  const displayMax = hasChartData ? chartMax : 450
  const getXd = (i) => padLeft + (displayPoints.length <= 1 ? plotW / 2 : i * plotW / (displayPoints.length - 1))
  const getYd = (w) => padTop + plotH - (w / displayMax) * plotH

  // Dynamic Feed Prediction calculations
  const totalFeedStock = feedItems.reduce((acc, item) => acc + Number(item.stock), 0)
  const feedingLogs = cycle?.feedings || []
  const dailyFeedEst = feedingLogs.length > 0 
    ? (feedingLogs.reduce((acc, f) => acc + Number(f.amount_kg), 0) / feedingLogs.length)
    : (cycle ? (cycle.seed_count * 0.015) : 0) // fallback: 1.5% of population seed count as daily feed in kg
    
  const daysLeft = dailyFeedEst > 0 ? Math.floor(totalFeedStock / dailyFeedEst) : 0

  // Dynamic Harvest Target calculations
  const harvestTargetDateStr = cycle?.expected_harvest_date 
    ? new Date(cycle.expected_harvest_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : (cycle?.seed_date 
      ? new Date(new Date(cycle.seed_date).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Belum ditentukan')

  // Progress menuju ukuran konsumsi (target default 300 gram/ekor)
  const harvestTargetGram = 300
  const currentWeightGram = latestWeightGram || 0
  const harvestProgress = cycle
    ? Math.min(100, Math.round((currentWeightGram / harvestTargetGram) * 100))
    : 0

  // Siklus sudah selesai (panen total) — batasi aksi yang tersedia
  const isCycleDone = cycle?.status === 'panen'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>{`Memuat data ${terms.unitLower}...`}</p>
      </div>
    )
  }

  return (
    <div className="aq-container">
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ padding: '6px 14px', background: '#D1FAE5', color: '#065F46', borderRadius: '40px', fontSize: 12, fontWeight: 600 }}>Sehat</span>
            <span className="aq-small-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} /> {pond?.location || 'Sektor Utara, Lahan 2'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => navigate('/budidaya/reports')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', fontWeight: 600, color: '#1A1C1A', cursor: 'pointer' }}
          >
            <BarChart3 size={18} /> Lihat Laporan Akhir
          </button>
          {cycle && !isCycleDone && (
            <button 
              onClick={() => {
                fetchEmptyPonds()
                setModalType('move')
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#F59E0B', border: 'none', borderRadius: '14px', fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
            >
              <ArrowLeft size={18} /> {terms.isTanaman ? 'Pindah Lahan' : 'Pindah Kolam'}
            </button>
          )}
          {isCycleDone ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: '#D1FAE5', border: '1.5px solid #6EE7B7', borderRadius: '14px',
              fontWeight: 600, color: '#065F46', fontSize: 14
            }}>
              <CheckCircle2 size={18} /> Siklus Selesai
            </span>
          ) : (
            <button 
              onClick={() => setModalType(cycle ? 'harvest' : 'start')} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
                background: cycle ? '#EF4444' : '#1B4332', 
                border: 'none', borderRadius: '14px', fontWeight: 600, color: '#fff', cursor: 'pointer',
                boxShadow: cycle ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(27, 67, 50, 0.2)'
              }}
            >
              {cycle ? <CheckCircle2 size={18} /> : <Plus size={18} />} 
              {cycle ? 'Selesaikan Panen' : 'Mulai Siklus Baru'}
            </button>
          )}
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="aq-grid-3">
        {/* Fish Info Card */}
        <div style={{ ...cardStyle, display: 'flex', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="aq-kpi-label" style={{ marginBottom: 4 }}>{terms.isTanaman ? 'Tanaman aktif' : 'Ikan aktif'}</span>
            <h3 className="aq-section-title" style={{ fontSize: 24, marginBottom: 12 }}>{cycle?.seed_type || (terms.isTanaman ? 'Belum ada tanaman' : 'Belum ada ikan')}</h3>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <span className="aq-small-text">Umur</span>
                <p className="aq-body-text" style={{ margin: 0, fontWeight: 600 }}>{age_days || 0} hari</p>
              </div>
              <div>
                <span className="aq-small-text">Populasi</span>
                <p className="aq-body-text" style={{ margin: 0, fontWeight: 600 }}>{cycle?.seed_count?.toLocaleString() || 0} {terms.populationCount}</p>
              </div>
              {latestWeightGram && (
                <div>
                  <span className="aq-small-text">{terms.isTanaman ? 'Tinggi rata-rata' : 'Berat rata-rata'}</span>
                  <p className="aq-body-text" style={{ margin: 0, fontWeight: 600, color: '#1B4332' }}>{Number(latestWeightGram).toLocaleString('id-ID')} {terms.isTanaman ? 'cm' : 'g'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Water Quality Card */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="aq-kpi-label">{terms.isTanaman ? 'Kondisi Lahan' : 'Kualitas air'}</span>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' }}>
              {terms.isTanaman ? <Sprout size={20} /> : <Waves size={20} />}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span className="aq-small-text">{terms.phLabel}</span>
              <h3 className="aq-kpi-value">{terms.isTanaman ? '6.2' : '7.2'}</h3>
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
            <span className="aq-kpi-label">{terms.isTanaman ? 'Suhu & Kelembaban' : 'Suhu & DO'}</span>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B4332' }}>
              <Thermometer size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, marginBottom: 12 }}>
            <div>
              <span className="aq-small-text">{terms.isTanaman ? 'Suhu Udara' : 'Suhu'}</span>
              <p className="aq-kpi-value" style={{ fontSize: 20 }}>{terms.isTanaman ? '26.4°C' : '28.5°C'}</p>
            </div>
            <div>
              <span className="aq-small-text">{terms.isTanaman ? 'Kelembaban' : 'DO (O2)'}</span>
              <p className="aq-kpi-value" style={{ fontSize: 20 }}>{terms.isTanaman ? '65%' : '6.4 mg/L'}</p>
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
              color: activeTab === tab.id ? '#1B4332' : '#64748B',
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
            <div style={{ ...cardStyle, minHeight: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h3 className="aq-section-title">{terms.isTanaman ? 'Tren pertumbuhan tanaman' : 'Tren pertumbuhan ikan'}</h3>
                  {!hasChartData && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94A3B8' }}>{terms.isTanaman ? 'Belum ada data sampling. Catat tinggi tanaman untuk melihat grafik nyata.' : 'Belum ada data sampling. Catat sampling untuk melihat grafik nyata.'}</p>
                  )}
                </div>
                {cycle && !isCycleDone && (
                  <button
                    onClick={() => setModalType('sampling')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 18px', background: '#1B4332', border: 'none',
                      borderRadius: '12px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                    }}
                  >
                    <Scale size={15} /> Catat Sampling
                  </button>
                )}
              </div>
              {/* Chart — overflow:visible on both wrapper and SVG so labels never clip */}
              <div style={{ position: 'relative', width: '100%', overflow: 'visible', paddingBottom: 4 }}>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={hasChartData ? '#1B4332' : '#94A3B8'} stopOpacity="0.18" />
                      <stop offset="100%" stopColor={hasChartData ? '#1B4332' : '#94A3B8'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y-axis grid lines + labels — now inside SVG with padLeft=42 */}
                  {[0.25, 0.5, 0.75, 1.0].map((pct, gi) => {
                    const y = padTop + plotH * (1 - pct)
                    const label = Math.round(displayMax * pct)
                    return (
                      <g key={gi}>
                        <line x1={padLeft} y1={y} x2={svgWidth - padRight} y2={y}
                          stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
                        <text x={padLeft - 6} y={y + 4} textAnchor="end" fontSize="9"
                          fontWeight="600" fill="#94A3B8">{label}{terms.isTanaman ? 'cm' : 'g'}</text>
                      </g>
                    )
                  })}

                  {/* Gradient Area */}
                  {displayPoints.length > 0 && (
                    <path
                      d={
                        displayPoints.map((p, i) => {
                          const x = getXd(i)
                          const y = getYd(p.weight)
                          return i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
                        }).join('') +
                        ` L ${getXd(displayPoints.length - 1)} ${padTop + plotH}` +
                        ` L ${getXd(0)} ${padTop + plotH} Z`
                      }
                      fill="url(#chart-grad)"
                    />
                  )}

                  {/* Line */}
                  {displayPoints.length > 1 && (
                    <path
                      d={displayPoints.map((p, i) => {
                        const x = getXd(i)
                        const y = getYd(p.weight)
                        return i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
                      }).join('')}
                      fill="none"
                      stroke={hasChartData ? '#1B4332' : '#CBD5E1'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data Points + weight label (above) + date label (below) */}
                  {displayPoints.map((p, i) => {
                    const x = getXd(i)
                    const y = getYd(p.weight)
                    return (
                      <g key={i}>
                        {/* weight label — safely inside padTop space */}
                        <text x={x} y={y - 14} textAnchor="middle" fontSize="10"
                          fontWeight="700" fill={hasChartData ? '#1B4332' : '#94A3B8'}>
                          {p.weight}{terms.isTanaman ? 'cm' : 'g'}
                        </text>
                        {/* dot */}
                        <circle cx={x} cy={y} r="5" fill="#fff"
                          stroke={hasChartData ? '#1B4332' : '#CBD5E1'} strokeWidth="2.5" />
                        {/* date label */}
                        {p.date && (
                          <text x={x} y={padTop + plotH + 20} textAnchor="middle"
                            fontSize="9" fontWeight="600" fill="#64748B">
                            {p.date}
                          </text>
                        )}
                      </g>
                    )
                  })}

                  {/* Placeholder when no data */}
                  {!hasChartData && (
                    <text x={svgWidth / 2} y={svgHeight / 2 + 5} textAnchor="middle"
                      fontSize="13" fill="#CBD5E1" fontWeight="600">
                      Contoh grafik — belum ada data nyata
                    </text>
                  )}
                </svg>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ color: '#1B4332' }}><ShoppingCart size={18} /></div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1C1A' }}>{terms.isTanaman ? 'Prediksi Pupuk' : 'Prediksi Pakan'}</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#475569', fontSize: 14 }}>Kebutuhan Harian</span>
                  <span style={{ fontWeight: 600, color: '#1A1C1A' }}>{dailyFeedEst > 0 ? `${dailyFeedEst.toFixed(1)} Kg` : '0 Kg'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{ color: '#475569', fontSize: 14 }}>Stok di Gudang</span>
                  <span style={{ fontWeight: 600, color: '#1A1C1A' }}>{totalFeedStock.toLocaleString('id-ID')} Kg</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                  {dailyFeedEst > 0 && totalFeedStock > 0 
                    ? `"Cukup untuk ${daysLeft} hari ke depan dengan asumsi pertumbuhan normal."`
                    : cycle 
                      ? (terms.isTanaman ? '"Stok pupuk di gudang habis atau belum dicatat."' : '"Stok pakan di gudang habis atau belum dicatat."')
                      : '"Belum ada siklus berjalan."'}
                </p>
              </div>
              <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ color: '#1B4332' }}><BarChart3 size={18} /></div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A1C1A' }}>Target Panen</h4>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>ESTIMASI TANGGAL</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A' }}>{harvestTargetDateStr}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#1B4332' }}>{harvestProgress}%</span>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{terms.isTanaman ? 'Menuju Ukuran Panen' : 'Menuju Ukuran Konsumsi'}</span>
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
                  { title: terms.isTanaman ? 'Pemberian Nutrisi Siang' : 'Pemberian Pakan Siang', desc: '8.5 Kg • 2 jam yang lalu', color: '#10B981' },
                  { title: terms.isTanaman ? 'Cek Kondisi Lahan Rutin' : 'Cek Kualitas Air Rutin', desc: 'Semua parameter normal • 5 jam yang lalu', color: '#10B981' },
                  { title: terms.isTanaman ? 'Penyiraman Tambahan' : 'Penambahan Aerasi', desc: terms.isTanaman ? 'Meningkatkan kelembaban • Kemarin' : 'Meningkatkan level DO • Kemarin', color: '#F59E0B' },
                ].map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: act.color, marginTop: 6 }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1A1C1A' }}>{act.title}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748B' }}>{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab('riwayat-aktivitas')} style={{ width: '100%', marginTop: 32, padding: '12px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#1B4332', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Lihat Semua Riwayat
              </button>
            </div>
            <div style={{ padding: '32px', background: '#1A3326', borderRadius: '24px', color: '#fff' }}>
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{terms.isTanaman ? 'CUACA SEKTOR UTARA LAHAN' : 'CUACA SEKTOR UTARA'}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
                <CloudRain size={48} />
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: 40, fontWeight: 700, margin: 0 }}>24°C</h2>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>Hujan Ringan Sore ini</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, opacity: 0.8 }}>
                {terms.isTanaman ? 'Peringatan: Sesuaikan jadwal penyiraman otomatis jika curah hujan tinggi untuk mencegah kelembaban berlebih.' : 'Peringatan: Matikan pompa pakan otomatis jika hujan lebat untuk mencegah overfeeding.'}
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
                  <div style={{ width: 64, height: 64, background: '#F1F5F9', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#64748B' }}>
                    <Calendar size={32} />
                  </div>
                  <p style={{ fontSize: 14, color: '#64748B' }}>{`Belum ada siklus yang berjalan di ${terms.unitLower} ini.`}</p>
                  <button className="btn btn-primary" onClick={() => setModalType('start')} style={{ marginTop: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                    Mulai Siklus Baru
                  </button>
                </div>
              ) : (
              <div className="aq-grid-2" style={{ gap: 40 }}>
                    <div>
                      <h4 style={{ fontSize: 13, color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Data utama</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#475569' }}>{terms.isTanaman ? 'Varietas Benih' : 'Jenis Bibit'}</span> <span style={{ fontWeight: 600 }}>{cycle.seed_type}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#475569' }}>{terms.seedCountLabelShort}</span> <span style={{ fontWeight: 600 }}>{cycle.seed_count.toLocaleString()} {terms.populationCount}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#475569' }}>{terms.seedDateLabel}</span> <span style={{ fontWeight: 600 }}>{new Date(cycle.seed_date).toLocaleDateString('id-ID')}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#475569' }}>Status Saat Ini</span> <span style={{ fontWeight: 600, color: '#1B4332' }}>{cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}</span></div>
                      </div>
                   </div>
                   <div>
                      <h4 style={{ fontSize: 13, color: '#64748B', fontWeight: 700, marginBottom: 16 }}>Analisa biaya (HPP)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#475569' }}>{terms.isTanaman ? 'Biaya Benih/Bibit' : 'Biaya Bibit'}</span> <span style={{ fontWeight: 600 }}>Rp {metrics?.total_seed_cost.toLocaleString()}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#475569' }}>{terms.isTanaman ? 'Biaya Pupuk/Nutrisi' : 'Biaya Pakan'}</span> <span style={{ fontWeight: 600 }}>Rp {metrics?.total_feed_cost.toLocaleString()}</span></div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #E2E8F0' }}><span style={{ fontWeight: 700 }}>Total Modal Keluar</span> <span style={{ fontWeight: 700, color: '#EF4444' }}>Rp {metrics?.total_cost.toLocaleString()}</span></div>
                      </div>
                   </div>
                </div>
              )}
            </div>
         <div style={{ ...cardStyle }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>Log Riwayat Operasional</h3>
              {cycle && (
               <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {/* Tombol Catat ${terms.feedLabelShort}, Sampling, Kematian hanya saat siklus masih aktif */}
                  {!isCycleDone && (
                    <>
                      <button className="btn btn-secondary" onClick={() => setModalType('health')} style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                         <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#EF4444' }}>report_problem</span> Catat Kematian
                      </button>
                      <button className="btn btn-secondary" onClick={() => setModalType('sampling')} style={{ color: '#7C3AED', borderColor: '#7C3AED' }}>
                         <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#7C3AED' }}>scale</span> Catat Sampling
                      </button>
                      <button className="btn btn-primary" onClick={() => setModalType('feed')}>
                         <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> {terms.isTanaman ? 'Catat Pupuk' : 'Catat Pakan'}
                      </button>
                    </>
                  )}
                  {/* Pengeluaran (Gaji & Panen) tersedia di semua status */}
                  <button className="btn btn-secondary" onClick={() => setModalType('expense')}>
                     <span className="material-symbols-outlined" style={{ fontSize: 18 }}>payments</span>
                     {isCycleDone ? 'Tambah Pengeluaran' : 'Gaji & Pengeluaran'}
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
                          <TableHeaderCell>Keterangan</TableHeaderCell>
                          <TableHeaderCell>Status</TableHeaderCell>
                          <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {activityLogs.map((log) => {
                          const isEditable = cycle?.status !== 'panen' || log.logType === 'harvest';
                          return (
                            <TableRow key={log.id}>
                               <TableCell style={{ fontWeight: 600 }}>{new Date(log.date).toLocaleDateString('id-ID')}</TableCell>
                               <TableCell style={{ 
                                  color: log.logType === 'health' ? '#EF4444' : 
                                         log.logType === 'sampling' ? '#7C3AED' : 
                                         log.logType === 'expense' ? '#1B4332' : 
                                         log.logType === 'harvest' ? '#D97706' : 'inherit',
                                  fontWeight: 700 
                               }}>{log.type}</TableCell>
                               <TableCell isSecondary>{log.detail}</TableCell>
                               <TableCell isSecondary>{log.notes}</TableCell>
                               <TableCell>
                                  <span style={{ 
                                     fontSize: 12, 
                                     padding: '4px 10px', 
                                     background: log.statusColor.bg, 
                                     color: log.statusColor.text, 
                                     borderRadius: 20, 
                                     fontWeight: 600 
                                  }}>{log.statusText}</span>
                               </TableCell>
                               <TableCell style={{ textAlign: 'right' }}>
                                   {isEditable ? (
                                      <div style={{ display: 'inline-flex', gap: 8 }}>
                                         <button 
                                            onClick={() => handleTriggerEdit(log)}
                                            title="Edit Aktivitas"
                                            style={{ 
                                               background: '#F4F7F5', border: '1px solid #E9F0EC', color: '#1B4332', 
                                               cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px',
                                               display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                         >
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                         </button>
                                         <button 
                                            onClick={() => handleDeleteLog(log)}
                                            title="Hapus Aktivitas"
                                            style={{ 
                                               background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', 
                                               cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px',
                                               display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                         >
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                         </button>
                                      </div>
                                   ) : (
                                      <span title="Terkunci (Siklus Selesai)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', color: '#94A3B8' }}>
                                         <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                                      </span>
                                   )}
                                </TableCell>
                            </TableRow>
                          )
                       })}
                       {activityLogs.length === 0 && (
                         <TableRow><TableCell colSpan="6" style={{ padding: '40px 0', textAlign: 'center', color: '#64748B' }}>Belum ada riwayat aktivitas untuk siklus ini.</TableCell></TableRow>
                       )}
                    </TableBody>
                 </Table>
               </div>
         </div>
      </div>
        )}

      {/* MODALS */}
      {modalType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            {/* Modal Header */}
            {(() => {
              const modalMeta = {
                start:    { icon: 'rocket_launch', bg: '#D8F3DC', color: '#1B4332', title: 'Mulai Siklus Baru' },
                feed:     { icon: 'restaurant',    bg: '#D8F3DC', color: '#1B4332', title: editingLog ? `Edit Pemberian ${terms.feedLabelShort}` : `Catat Pemberian ${terms.feedLabelShort}` },
                health:   { icon: 'report_problem', bg: '#FEE2E2', color: '#EF4444', title: editingLog ? 'Edit Kesehatan / Kematian' : 'Catat Kesehatan / Kematian' },
                expense:  { icon: 'payments',       bg: '#DBEAFE', color: '#1E40AF', title: editingLog ? 'Edit Biaya Operasional' : 'Catat Biaya Operasional' },
                harvest:  { icon: 'agriculture',    bg: '#FEF3C7', color: '#D97706', title: editingLog ? 'Edit Catatan Panen' : 'Catat Panen' },
                move:     { icon: 'swap_horiz',     bg: '#FEF3C7', color: '#B45309', title: `Pindah ${terms.unit}` },
                sampling: { icon: 'scale',          bg: '#EDE9FE', color: '#7C3AED', title: editingLog ? 'Edit Sampling Berat' : 'Catat Sampling Berat' },
              }
              const m = modalMeta[modalType] || { icon: 'edit_note', bg: '#F1F5F9', color: '#475569', title: 'Catat Aktivitas' }
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 20px', borderBottom: '1px solid #E9F0EC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: m.color }}>{m.icon}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>{m.title}</h3>
                      <p style={{ fontSize: 12, color: '#64748B', margin: 0, marginTop: 2 }}>Lengkapi detail informasi di bawah ini</p>
                    </div>
                  </div>
                  <button onClick={() => { setModalType(null); setEditingLog(null); }} style={{ width: 36, height: 36, borderRadius: 10, background: '#F4F7F5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                  </button>
                </div>
              )
            })()}

            {/* Modal Body */}
            {modalType === 'start' ? (
              <form onSubmit={handleStartCycle} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Input Method Toggle */}
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Metode input bibit</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      type="button" 
                      onClick={() => setFormStart({...formStart, input_method: 'manual', inventory_id: ''})}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 12,
                        border: formStart.input_method === 'manual' ? '2px solid #1B4332' : '1.5px solid #E9F0EC',
                        background: formStart.input_method === 'manual' ? '#D8F3DC' : '#F8FAFC',
                        color: formStart.input_method === 'manual' ? '#1B4332' : '#475569',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer'
                      }}
                    >Manual</button>
                    <button 
                      type="button" 
                      onClick={() => setFormStart({...formStart, input_method: 'inventory'})}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 12,
                        border: formStart.input_method === 'inventory' ? '2px solid #1B4332' : '1.5px solid #E9F0EC',
                        background: formStart.input_method === 'inventory' ? '#D8F3DC' : '#F8FAFC',
                        color: formStart.input_method === 'inventory' ? '#1B4332' : '#475569',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer'
                      }}
                    >Gudang</button>
                  </div>
                </div>

                {formStart.input_method === 'inventory' ? (
                  <div>
                    <label style={labelStyle}>Pilih bibit dari gudang</label>
                    <select required value={formStart.inventory_id} onChange={e => setFormStart({...formStart, inventory_id: e.target.value})} style={inputStyle}>
                      <option value="">-- Pilih Bibit --</option>
                      {seedItems.map(item => <option key={item.id} value={item.id}>{item.name} (Stok: {item.stock})</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Nama / tipe bibit</label>
                    <input 
                      type="text" 
                      required 
                      placeholder={terms.isTanaman ? "Contoh: Cabai Rawit Merah" : "Contoh: Benur Vannamei"}
                      value={formStart.seed_type} 
                      onChange={e => setFormStart({...formStart, seed_type: e.target.value})} 
                      style={inputStyle} 
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>{terms.seedCountLabel}</label>
                    <input type="number" required value={formStart.seed_count} onChange={e => setFormStart({...formStart, seed_count: e.target.value})} style={inputStyle} />
                  </div>
                  {formStart.input_method === 'manual' && (
                    <NumericInput 
                      label="Total harga beli" 
                      value={formStart.total_seed_cost} 
                      onChange={v => setFormStart({...formStart, total_seed_cost: v})} 
                      placeholder="0" 
                      suffix="Rp"
                      required
                    />
                  )}
                </div>

                <div>
                  <label style={labelStyle}>{terms.seedDateLabel}</label>
                  <input type="date" required value={formStart.seed_date} onChange={e => setFormStart({...formStart, seed_date: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Mulai Siklus</button>
                </div>
              </form>
            ) : modalType === 'feed' ? (
              <form onSubmit={handleLogFeeding} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{terms.isTanaman ? 'Pilih pupuk/nutrisi' : 'Pilih pakan'}</label>
                  <select required value={formFeed.inventory_id} onChange={e => setFormFeed({...formFeed, inventory_id: e.target.value})} style={inputStyle}>
                    <option value="">{terms.isTanaman ? '-- Pilih Pupuk/Nutrisi --' : '-- Pilih Pakan --'}</option>
                    {feedItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jumlah (kg)</label>
                  <input type="number" step="any" required value={formFeed.amount_kg} onChange={e => setFormFeed({...formFeed, amount_kg: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal pemberian</label>
                  <input type="date" required value={formFeed.date} onChange={e => setFormFeed({...formFeed, date: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Catatan tambahan</label>
                  <textarea value={formFeed.notes} onChange={e => setFormFeed({...formFeed, notes: e.target.value})} style={{...inputStyle, height: 70, resize: 'none'}} placeholder={terms.isTanaman ? "Contoh: Pemupukan pagi, cuaca cerah..." : "Contoh: Pakan pagi hari, kondisi cuaca cerah..."} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{editingLog ? 'Perbarui Aktivitas' : 'Simpan Aktivitas'}</button>
                </div>
              </form>
            ) : modalType === 'health' ? (
              <form onSubmit={handleLogHealth} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>{terms.isTanaman ? 'Jumlah kematian (batang)' : 'Jumlah kematian (ekor)'}</label>
                  <input type="number" required value={formHealth.mortality_count} onChange={e => setFormHealth({...formHealth, mortality_count: e.target.value})} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>Catatan penyakit / gejala</label>
                  <textarea value={formHealth.disease_note} onChange={e => setFormHealth({...formHealth, disease_note: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder={terms.isTanaman ? "Contoh: Tanaman layu, daun menguning..." : "Contoh: Ikan terlihat lemas, bintik putih..."} />
                </div>
                <div>
                  <label style={labelStyle}>Tindakan yang dilakukan</label>
                  <textarea value={formHealth.treatment_note} onChange={e => setFormHealth({...formHealth, treatment_note: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder={terms.isTanaman ? "Contoh: Penyemprotan pestisida, pemangkasan daun..." : "Contoh: Pemberian obat A, ganti air 30%..."} />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal pencatatan</label>
                  <input type="date" required value={formHealth.date} onChange={e => setFormHealth({...formHealth, date: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#EF4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{editingLog ? 'Perbarui Kesehatan' : 'Catat Kesehatan'}</button>
                </div>
              </form>
            ) : modalType === 'expense' ? (
              <form onSubmit={handleLogExpense} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Kategori biaya</label>
                  <select required value={formExpense.category} onChange={e => setFormExpense({...formExpense, category: e.target.value})} style={inputStyle}>
                    <option value="gaji">Gaji Karyawan</option>
                    <option value="panen">Biaya Panen (Buruh/Logistik)</option>
                    {/* Kategori di bawah hanya tersedia saat siklus masih aktif */}
                    {!isCycleDone && (
                      <>
                        <option value="listrik">Listrik &amp; Air</option>
                        <option value="lainnya">Lain-lain</option>
                      </>
                    )}
                  </select>
                </div>
                <NumericInput 
                  label="Jumlah biaya" 
                  value={formExpense.amount} 
                  onChange={v => setFormExpense({...formExpense, amount: v})} 
                  placeholder="Contoh: 500.000" 
                  suffix="Rp"
                  required
                />
                <div>
                  <label style={labelStyle}>Catatan tambahan</label>
                  <textarea value={formExpense.notes} onChange={e => setFormExpense({...formExpense, notes: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder="Contoh: Gaji bulan Mei untuk 2 orang..." />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal pengeluaran</label>
                  <input type="date" required value={formExpense.date} onChange={e => setFormExpense({...formExpense, date: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{editingLog ? 'Perbarui Biaya' : 'Simpan Biaya'}</button>
                </div>
              </form>
            ) : modalType === 'harvest' ? (
              <form onSubmit={handleHarvest} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!editingLog && (
                  <div>
                    <label style={labelStyle}>Tipe Panen</label>
                    <select 
                      required 
                                         onChange={e => setFormHarvest({...formHarvest, harvest_type: e.target.value})} 
                      style={inputStyle}
                    >
                      <option value="total">{terms.isTanaman ? 'Panen Total (Tutup siklus & kosongkan lahan)' : 'Panen Total (Tutup siklus & kosongkan kolam)'}</option>
                      <option value="sebagian">Panen Sebagian (Siklus budidaya terus berlanjut)</option>
                    </select>
                  </div>
                )}
                
                <div style={{ padding: '12px', background: formHarvest.harvest_type === 'total' ? '#FEE2E2' : '#EFF6FF', borderRadius: '12px', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: formHarvest.harvest_type === 'total' ? '#991B1B' : '#1E40AF', fontWeight: 600 }}>
                    {formHarvest.harvest_type === 'total' 
                      ? `Peringatan: Tindakan ini akan menutup siklus budidaya saat ini secara permanen dan mengosongkan ${terms.unitLower}.`
                      : 'Info: Hasil panen akan tercatat, namun siklus budidaya akan tetap berlanjut.'
                    }
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <NumericInput 
                     label="Total Berat Panen" 
                     value={formHarvest.weight_kg} 
                     onChange={v => setFormHarvest({...formHarvest, weight_kg: v})} 
                     placeholder="0" 
                     suffix="Kg"
                     required
                  />
                  <NumericInput 
                     label="Harga per kg" 
                     value={formHarvest.price_per_kg} 
                     onChange={v => setFormHarvest({...formHarvest, price_per_kg: v})} 
                     placeholder="0" 
                     suffix="Rp"
                     required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tanggal panen</label>
                  <input type="date" required value={formHarvest.date} onChange={e => setFormHarvest({...formHarvest, date: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Catatan Panen</label>
                  <textarea value={formHarvest.notes} onChange={e => setFormHarvest({...formHarvest, notes: e.target.value})} style={{...inputStyle, height: 80, resize: 'none'}} placeholder="Contoh: Panen total, ukuran merata..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#D97706', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{editingLog ? 'Perbarui Panen' : 'Catat Panen'}</button>
                </div>
              </form>
            ) : modalType === 'move' ? (
              <form onSubmit={handleMovePond} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: '12px', background: '#FEF3C7', borderRadius: '12px', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#B45309', fontWeight: 600 }}>{`Info: Seluruh data siklus saat ini akan dipindahkan ke ${terms.unitLower} tujuan. ${terms.unit} saat ini akan menjadi kosong.`}</p>
                </div>
                <div>
                  <label style={labelStyle}>{`Pilih ${terms.unit} Tujuan`}</label>
                  <select required value={formMove.new_pond_id} onChange={e => setFormMove({...formMove, new_pond_id: e.target.value})} style={inputStyle}>
                    <option value="">{`-- Pilih ${terms.unit} Kosong --`}</option>
                    {emptyPonds.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                  {emptyPonds.length === 0 && (
                     <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>{`Tidak ada ${terms.unitLower} kosong yang tersedia.`}</p>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 12 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" disabled={emptyPonds.length === 0} style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: emptyPonds.length === 0 ? '#94A3B8' : '#F59E0B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: emptyPonds.length === 0 ? 'not-allowed' : 'pointer' }}>Pindahkan Siklus</button>
                </div>
              </form>
            ) : modalType === 'sampling' ? (
              <form onSubmit={handleLogSampling} style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: '12px 16px', background: '#F5F3FF', borderRadius: '12px', marginBottom: 4, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Scale size={16} style={{ color: '#7C3AED', marginTop: 1, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 12, color: '#5B21B6', fontWeight: 500, lineHeight: 1.5 }}>
                    {terms.isTanaman ? 'Sampling dilakukan dengan mengukur tinggi/berat sampel tanaman secara acak lalu menghitung rata-rata.' : 'Sampling dilakukan dengan menimbang sampel ikan secara acak lalu menghitung berat rata-rata. Sistem akan otomatis menghitung estimasi total biomassa.'}
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <NumericInput
                    label={terms.isTanaman ? 'Tinggi rata-rata sampel' : 'Berat rata-rata sampel'}
                    value={formSampling.average_weight_gram}
                    onChange={v => setFormSampling({...formSampling, average_weight_gram: v})}
                    placeholder="Contoh: 125"
                    suffix={terms.isTanaman ? 'cm' : 'gram'}
                    required
                  />
                  <div>
                    <label style={labelStyle}>{`Jumlah sampel (${terms.populationCount})`}</label>
                    <input
                      type="number"
                      min="1"
                      value={formSampling.sample_count}
                      onChange={e => setFormSampling({...formSampling, sample_count: e.target.value})}
                      placeholder="Contoh: 10"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Tanggal sampling</label>
                  <input type="date" required value={formSampling.date} onChange={e => setFormSampling({...formSampling, date: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Catatan tambahan</label>
                  <textarea
                    value={formSampling.notes}
                    onChange={e => setFormSampling({...formSampling, notes: e.target.value})}
                    style={{...inputStyle, height: 70, resize: 'none'}}
                    placeholder={terms.isTanaman ? 'Contoh: Kondisi tanaman sehat, tinggi merata...' : 'Contoh: Kondisi ikan sehat, pertumbuhan merata...'}
                  />
                </div>
                {formSampling.average_weight_gram && cycle?.seed_count && (
                  <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                    <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                      {terms.isTanaman ? `Estimasi rata-rata tinggi: ${formSampling.average_weight_gram} cm` : `Estimasi biomassa: ~${((Number(formSampling.average_weight_gram) / 1000) * cycle.seed_count).toLocaleString('id-ID', { maximumFractionDigits: 1 })} kg`}
                    </span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 4 }}>
                    <button type="button" onClick={() => { setModalType(null); setEditingLog(null); }} style={{ padding: '13px 0', border: '1.5px solid #E9F0EC', borderRadius: 12, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Batal</button>
                    <button type="submit" style={{ padding: '13px 0', border: 'none', borderRadius: 12, background: '#7C3AED', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>{editingLog ? 'Perbarui Sampling' : 'Simpan Sampling'}</button>
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
