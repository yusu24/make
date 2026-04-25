import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import '../budidaya.css'

// ── Colour helpers ──────────────────────────────────────────────────────────
const STATUS = {
  healthy: { label: 'SEHAT', bg: '#1B4332',  text: '#fff' },
  warning: { label: 'PERINGATAN', bg: '#EF4444',  text: '#fff' },
  kosong:  { label: 'KOSONG',   bg: '#94A3B8',  text: '#fff' },
}

// ── Demo / fallback pond data ─────────────────────────────────────────────
const DEMO_PONDS = [
  {
    id: 'd1', code: 'KOLAM A-01', name: 'Budidaya Lele', status_key: 'healthy',
    age_days: 45, population: 2500,
    temp: 27.8, ph: 7.1, ph_ok: true,
    thumb_gradient: 'linear-gradient(145deg,#134e2a 0%,#1B4332 60%,#2D6A4F 100%)',
    thumb_icon: 'water',
  },
  {
    id: 'd2', code: 'KOLAM B-12', name: 'Budidaya Nila', status_key: 'warning',
    age_days: 12, population: 5000,
    temp: 31.2, ph: 8.4, ph_ok: false,
    thumb_gradient: 'linear-gradient(145deg,#1e3a5f 0%,#1d4ed8 60%,#3b82f6 100%)',
    thumb_icon: 'waves',
  },
  {
    id: 'd3', code: 'KOLAM C-04', name: 'Budidaya Gurame', status_key: 'healthy',
    age_days: 82, population: 1200,
    temp: 26.5, ph: 6.9, ph_ok: true,
    thumb_gradient: 'linear-gradient(145deg,#451a03 0%,#92400e 60%,#d97706 100%)',
    thumb_icon: 'set_meal',
  },
]

// ── Stat Bar KPIs ──────────────────────────────────────────────────────────
const STATS = [
  { label: 'RATA-RATA PH', value: '7.2', sub: 'Optimal',   subColor: '#10B981', bar: 0.72, barColor: '#10B981' },
  { label: 'SUHU AIR',    value: '28.4°C', sub: '+0.2%',  subColor: '#10B981', bar: 0.60, barColor: '#10B981' },
  { label: 'OKSIGEN TERLARUT',  value: '6.5 mg/L', sub: '-2.1%',subColor: '#EF4444', bar: 0.45, barColor: '#EF4444' },
  { label: 'TOTAL PAKAN HARI INI', value: '124.5 kg', sub: '',  subColor: '#64748B', bar: 0.80, barColor: '#1B4332' },
]

// ── Card style ─────────────────────────────────────────────────────────────
const card = {
  background: '#fff',
  border: '1px solid #E9F0EC',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}

export default function Ponds() {
  const [ponds, setPonds]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState('grid')
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '', code: '', type: 'tanah', area: '',
    area_m2: '', depth_cm: '', max_fish_count: '', status: 'kosong',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchPonds() }, [])

  const fetchPonds = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/ponds')
      setPonds(data.data || [])
    } catch { setPonds([]) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/budidaya/ponds', formData)
      setModalOpen(false)
      fetchPonds()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  // Merge API ponds with demo for display
  const displayPonds = loading ? DEMO_PONDS : (ponds.length > 0 ? ponds.map((p, i) => ({
    ...DEMO_PONDS[i % DEMO_PONDS.length],
    ...p,
    id: p.id,
    code: p.code || DEMO_PONDS[i % DEMO_PONDS.length].code,
    name: p.name,
    status_key: p.status === 'aktif' ? 'healthy' : p.status === 'maintenance' ? 'warning' : 'kosong',
  })) : DEMO_PONDS)

  const filtered = displayPonds.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '28px 32px', background: '#F4F7F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1C1A', margin: 0, letterSpacing: '-0.5px' }}>Manajemen Kolam</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Memantau {filtered.length} lingkungan perairan aktif</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Grid / Table Toggle */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #E9F0EC', borderRadius: 10, padding: 3, gap: 2 }}>
            {[['grid', 'grid_view', 'Grid'], ['table', 'table_rows', 'Tabel']].map(([v, icon, lbl]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: view === v ? '#1B4332' : 'transparent',
                  color: view === v ? '#fff' : '#94A3B8',
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#1A1C1A', margin: '6px 0 2px' }}>
              {s.value}
              {s.sub && <span style={{ fontSize: 12, fontWeight: 600, color: s.subColor, marginLeft: 6 }}>{s.sub}</span>}
            </p>
            <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, marginTop: 8 }}>
              <div style={{ height: 4, width: `${s.bar * 100}%`, background: s.barColor, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Pond Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>

        {filtered.map((pond) => {
          const st = STATUS[pond.status_key] || STATUS.kosong
          return (
            <div key={pond.id} style={{ ...card, cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none' }}
            >
              {/* Thumbnail */}
              <div style={{
                height: 140,
                background: pond.thumb_gradient || 'linear-gradient(145deg,#1B4332,#2D6A4F)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'rgba(255,255,255,0.15)', fontVariationSettings: "'FILL' 1" }}>
                  {pond.thumb_icon || 'water'}
                </span>
                {/* Badges */}
                <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
                  <span style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                    {pond.code}
                  </span>
                  <span style={{ background: st.bg, color: st.text, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                    {st.label}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px 18px' }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>{pond.name}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                      Usia: {pond.age_days} Hari • Populasi: {(pond.population || 0).toLocaleString()} Ekor
                    </p>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
                  </button>
                </div>

                {/* Sensor boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background: '#F4F7F5', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#2D6A4F' }}>thermostat</span> SUHU
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#1A1C1A', margin: '4px 0 0' }}>{pond.temp}°C</p>
                  </div>
                  <div style={{ background: pond.ph_ok === false ? '#FFF5F5' : '#F4F7F5', border: pond.ph_ok === false ? '1px solid #FECACA' : 'none', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: pond.ph_ok === false ? '#EF4444' : '#94A3B8', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13, color: pond.ph_ok === false ? '#EF4444' : '#10B981' }}>science</span> TINGKAT PH
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: pond.ph_ok === false ? '#EF4444' : '#1A1C1A', margin: '4px 0 0' }}>{pond.ph}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button style={{
                    background: '#1B4332', color: '#fff',
                    border: 'none', borderRadius: 10,
                    padding: '10px 0', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restaurant</span>
                    Pakan
                  </button>
                  <button style={{
                    background: '#F4F7F5', color: '#1B4332',
                    border: '1.5px solid #E9F0EC', borderRadius: 10,
                    padding: '10px 0', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>health_and_safety</span>
                    Kesehatan
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* ── New Pond Card ── */}
        <div
          onClick={() => setModalOpen(true)}
          style={{
            ...card,
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            border: '2px dashed #D8F3DC',
            background: '#F9FDF9',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B4332'; e.currentTarget.style.background = '#F0FAF4' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#D8F3DC'; e.currentTarget.style.background = '#F9FDF9' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#1B4332' }}>add</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1B4332', margin: 0 }}>Kolam Baru</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Tambah kolam baru</p>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 52, height: 52, borderRadius: '50%',
          background: '#1B4332', color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(27,67,50,0.35)',
          zIndex: 100,
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26 }}>add</span>
      </button>

      {/* ── Add Pond Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Kolam Baru" maxWidth="620px">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Nama Kolam', 'name', 'text', 'Budidaya Lele A1'],
            ['Kode', 'code', 'text', 'KOLAM-A01'],
            ['Area (m²)', 'area_m2', 'number', '0'],
            ['Kedalaman (cm)', 'depth_cm', 'number', '0'],
            ['Kapasitas (ekor)', 'max_fish_count', 'number', '0'],
          ].map(([label, key, type, ph]) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={formData[key]}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #E9F0EC', borderRadius: 10,
                  fontSize: 14, color: '#1A1C1A',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = '#1B4332'}
                onBlur={e => e.target.style.borderColor = '#E9F0EC'}
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => setModalOpen(false)}
              style={{ padding: '12px 0', border: '1.5px solid #E9F0EC', borderRadius: 10, background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
              Batal
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '12px 0', border: 'none', borderRadius: 10, background: '#1B4332', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Menyimpan...' : 'Daftarkan Kolam'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
