import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import '../budidaya.css'
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table'
import { LoadingButton, EmptyState, Breadcrumbs } from '../components/UXComponents'

// ── Colour helpers ──────────────────────────────────────────────────────────
const STATUS = {
  healthy: { label: 'SEHAT', bg: '#1B4332',  text: '#fff' },
  warning: { label: 'PERINGATAN', bg: '#EF4444',  text: '#fff' },
  kosong:  { label: 'KOSONG',   bg: '#64748B',  text: '#fff' },
}


// ── Stat Bar KPIs ──────────────────────────────────────────────────────────
const STATS = [
  { label: 'RATA-RATA PH', value: '7.2', sub: 'Optimal',   subColor: '#10B981', bar: 0.72, barColor: '#10B981' },
  { label: 'SUHU AIR',    value: '28.4°C', sub: '+0.2%',  subColor: '#10B981', bar: 0.60, barColor: '#10B981' },
  { label: 'OKSIGEN TERLARUT',  value: '6.5 mg/L', sub: '-2.1%',subColor: '#EF4444', bar: 0.45, barColor: '#EF4444' },
  { label: 'TOTAL PAKAN HARI INI', value: '124.5 kg', sub: '',  subColor: '#475569', bar: 0.80, barColor: '#1B4332' },
]

// ── Card style ─────────────────────────────────────────────────────────────
const card = {
  background: '#fff',
  border: '1px solid #E9F0EC',
  borderRadius: 16,
  overflow: 'hidden',
}

import { useNavigate } from 'react-router-dom'

export default function Ponds() {
  const navigate = useNavigate()
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

  // Reset form when modal opens
  useEffect(() => {
    if (modalOpen) {
      setFormData({
        name: '', code: '', type: 'tanah', area: '',
        area_m2: '', depth_cm: '', max_fish_count: '', status: 'kosong',
      })
    }
  }, [modalOpen])

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

  const calculateAge = (dateStr) => {
    if (!dateStr) return 0;
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  }

  const displayPonds = ponds.map((p, i) => {
    const isAktif = p.active_cycle != null;
    return {
      id: p.id,
      code: p.code || `KOLAM-${p.id}`,
      name: p.name,
      status_key: isAktif ? 'healthy' : (p.status === 'maintenance' ? 'warning' : 'kosong'),
      age_days: isAktif ? calculateAge(p.active_cycle.seed_date) : 0,
      population: isAktif ? p.active_cycle.seed_count : 0,
      temp: 28.5, ph: 7.2, ph_ok: true, // Mock sensor data for visual
      thumb_gradient: i % 3 === 0 ? 'linear-gradient(145deg,#134e2a 0%,#1B4332 60%,#2D6A4F 100%)' : 
                      i % 3 === 1 ? 'linear-gradient(145deg,#1e3a5f 0%,#1d4ed8 60%,#3b82f6 100%)' :
                      'linear-gradient(145deg,#451a03 0%,#92400e 60%,#d97706 100%)',
      thumb_icon: i % 3 === 0 ? 'water' : i % 3 === 1 ? 'waves' : 'set_meal',
      active_cycle: p.active_cycle,
      type: p.type
    }
  })

  const filtered = displayPonds.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  const renderGridView = () => (
    <div className="aq-grid-3">
      {filtered.map((pond) => {
        const st = STATUS[pond.status_key] || STATUS.kosong
        return (
          <div key={pond.id} style={{ ...card, cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
            onClick={() => navigate(`/budidaya/ponds/${pond.id}`)}
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
                  <p className="aq-section-title" style={{ fontSize: 15 }}>{pond.name}</p>
                  <p className="aq-small-text" style={{ marginTop: 2 }}>
                    Usia: {pond.age_days} hari • Populasi: {(pond.population || 0).toLocaleString()} ekor
                  </p>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
                </button>
              </div>

              {/* Sensor boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: '#F4F7F5', borderRadius: 10, padding: '10px 12px' }}>
                  <p className="aq-kpi-label" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#2D6A4F' }}>thermostat</span> Suhu
                  </p>
                  <p className="aq-kpi-value" style={{ fontSize: 18 }}>{pond.temp}°C</p>
                </div>
                <div style={{ background: pond.ph_ok === false ? '#FFF5F5' : '#F4F7F5', border: pond.ph_ok === false ? '1px solid #FECACA' : 'none', borderRadius: 10, padding: '10px 12px' }}>
                  <p className="aq-kpi-label" style={{ fontSize: 10, color: pond.ph_ok === false ? '#EF4444' : 'var(--aq-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: pond.ph_ok === false ? '#EF4444' : '#10B981' }}>science</span> Tingkat pH
                  </p>
                  <p className="aq-kpi-value" style={{ fontSize: 18, color: pond.ph_ok === false ? '#EF4444' : 'var(--aq-text-primary)' }}>{pond.ph}</p>
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
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>restaurant</span> Pakan
                </button>
                <button style={{
                  background: '#F4F7F5', color: '#1B4332',
                  border: '1.5px solid #E9F0EC', borderRadius: 10,
                  padding: '10px 0', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>health_and_safety</span> Kesehatan
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
        <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Tambah kolam baru</p>
      </div>
    </div>
  )

  const renderTableView = () => (
    <div className="aq-table-container">
      <Table>
        <TableHeader>
          <TableRow isHoverable={false}>
            <TableHeaderCell>Kode kolam</TableHeaderCell>
            <TableHeaderCell>Nama kolam</TableHeaderCell>
            <TableHeaderCell>Jenis</TableHeaderCell>
            <TableHeaderCell>Usia (hari)</TableHeaderCell>
            <TableHeaderCell>Populasi</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((pond) => {
            const st = STATUS[pond.status_key] || STATUS.kosong
            return (
              <TableRow key={pond.id} onClick={() => navigate(`/budidaya/ponds/${pond.id}`)} style={{ cursor: 'pointer' }}>
                <TableCell>{pond.code}</TableCell>
                <TableCell>{pond.name}</TableCell>
                <TableCell isSecondary>{pond.type}</TableCell>
                <TableCell>{pond.age_days}</TableCell>
                <TableCell>{(pond.population || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '40px', fontSize: '11px', fontWeight: '700',
                    background: st.bg, color: st.text, display: 'inline-block'
                  }}>
                    {st.label}
                  </span>
                </TableCell>
                <TableCell>
                  <button style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_vert</span>
                  </button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="aq-container">


      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="aq-page-title">Manajemen kolam</h1>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'space-between' }}>
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
                  color: view === v ? '#fff' : '#64748B',
                  transition: 'all 0.15s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                <span className="hide-mobile">{lbl}</span>
              </button>
            ))}
          </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          Tambah Kolam
        </button>
      </div>
    </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat data kolam...</p>
        </div>
      ) : ponds.length === 0 ? (
        <EmptyState 
          icon="water_drop"
          title="Belum ada kolam"
          description="Daftarkan kolam pertama Anda untuk mulai memantau siklus budidaya."
          onAction={() => setModalOpen(true)}
          actionLabel="Tambah Kolam Sekarang"
        />
      ) : (
        <>
          <div className="aq-grid-4">
            {STATS.map(s => (
              <div key={s.label} style={{ ...card, padding: '16px 20px' }}>
                <p className="aq-kpi-label">{s.label.toLowerCase()}</p>
                <p className="aq-kpi-value" style={{ fontSize: 24 }}>
                  {s.value}
                  {s.sub && <span className="aq-small-text" style={{ fontWeight: 600, color: s.subColor, marginLeft: 6 }}>{s.sub}</span>}
                </p>
                <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, marginTop: 8 }}>
                  <div style={{ height: 4, width: `${s.bar * 100}%`, background: s.barColor, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            {view === 'grid' ? renderGridView() : renderTableView()}
          </div>
        </>
      )}

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

      {/* ── Add Pond Modal (custom inline — always light) ── */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 580,
              background: '#ffffff',
              borderRadius: 24,
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 28px 20px',
              borderBottom: '1px solid #E9F0EC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: '#D8F3DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B4332' }}>water_drop</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1C1A', margin: 0 }}>Tambah Kolam Baru</h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0, marginTop: 2 }}>Isi data kolam untuk mulai memantau</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#F4F7F5', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#475569',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}
              style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Adaptive grid for fields */}
              <div className="aq-grid-2">
                {[
                  ['Nama Kolam', 'name', 'text', 'Budidaya Lele A1', true],
                  ['Kode Kolam', 'code', 'text', 'KOLAM-A01', false],
                  ['Luas Area (m²)', 'area_m2', 'number', '0', false],
                  ['Kedalaman (cm)', 'depth_cm', 'number', '100', false],
                  ['Kapasitas (ekor)', 'max_fish_count', 'number', '1000', false],
                ].map(([label, key, type, ph, required]) => (
                  <div key={key} style={key === 'name' ? { gridColumn: '1 / -1' } : {}}>
                    <label style={{
                      fontSize: 12, fontWeight: 700,
                      color: '#475569',
                      textTransform: 'capitalize',
                      display: 'block', marginBottom: 6,
                    }}>
                      {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
                    </label>
                    <input
                      type={type}
                      required={required}
                      placeholder={ph}
                      value={formData[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      style={{
                        width: '100%', padding: '11px 14px',
                        background: '#F8FAFC',
                        border: '1.5px solid #E9F0EC',
                        borderRadius: 12,
                        fontSize: 14, color: '#1A1C1A',
                        outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#1B4332'
                        e.target.style.boxShadow = '0 0 0 3px rgba(27,67,50,0.1)'
                        e.target.style.background = '#fff'
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#E9F0EC'
                        e.target.style.boxShadow = 'none'
                        e.target.style.background = '#F8FAFC'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Tipe Kolam */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'capitalize', display: 'block', marginBottom: 6 }}>Jenis kolam</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['tanah', 'Tanah'], ['beton', 'Beton'], ['terpal', 'Terpal']].map(([val, lbl]) => (
                    <button
                      key={val} type="button"
                      onClick={() => setFormData({ ...formData, type: val })}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 12,
                        border: formData.type === val ? '2px solid #1B4332' : '1.5px solid #E9F0EC',
                        background: formData.type === val ? '#D8F3DC' : '#F8FAFC',
                        color: formData.type === val ? '#1B4332' : '#475569',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >{lbl}</button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#E9F0EC', margin: '4px 0' }} />

              {/* Footer Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '13px 0', border: '1.5px solid #E9F0EC',
                    borderRadius: 12, background: '#fff',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569',
                  }}
                >
                  Batal
                </button>
                <LoadingButton
                  type="submit"
                  loading={saving}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>water_drop</span>
                  Daftarkan Kolam
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
