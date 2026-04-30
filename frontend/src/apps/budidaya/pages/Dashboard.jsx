import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import '../budidaya.css'

const CHART_DATA = {
  '1B': [32, 41, 48, 53, 61, 70],
  '3B': [20, 33, 44, 55, 65, 78],
  '6B': [15, 28, 38, 50, 60, 72],
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartRange, setChartRange] = useState('3B')

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/budidaya/dashboard/stats')
      setStats(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat data farm...</p>
    </div>
  )

  const chartValues = CHART_DATA[chartRange]
  const maxVal = Math.max(...chartValues)

  return (
    <div className="aq-container">

      {/* ── Welcome Row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="aq-page-title">
            Halo, Bpk. {user?.name?.split(' ')[0] || 'Wijaya'}
          </h1>

        </div>

      </div>

      {/* ── KPI Cards ── */}
      <div className="aq-grid-4">

        {/* Total Kolam */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={iconBox('#D1FAE5', '#059669')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>waves</span>
            </div>
            <span style={badge('#D1FAE5', '#059669')}>Aktif</span>
          </div>
          <p className="aq-kpi-label">Total kolam</p>
          <p className="aq-kpi-value">{stats?.total_ponds || 12}</p>
          <p style={{ fontSize: 12, color: '#059669', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
            2 Kolam baru bulan ini
          </p>
        </div>

        {/* Butuh Perhatian */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={iconBox('#FFE4E6', '#E11D48')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
            </div>
            <span style={badge('#FFE4E6', '#E11D48')}>Peringatan</span>
          </div>
          <p className="aq-kpi-label">Butuh perhatian</p>
          <p className="aq-kpi-value">02</p>
          <p style={{ fontSize: 12, color: '#E11D48', marginTop: 6 }}>
            Kadar Oksigen Rendah (Kolam B3)
          </p>
        </div>

        {/* Jadwal Pakan */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={iconBox('#ECFDF5', '#10B981')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>restaurant</span>
            </div>
          </div>
          <p className="aq-kpi-label">Jadwal pakan berikutnya</p>
          <p className="aq-kpi-value">16:30</p>
          <p style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>
            Pakan Protein Tinggi – 45 Menit lagi
          </p>
        </div>

        {/* Suhu Air */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={iconBox('#E0F2FE', '#0EA5E9')}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>thermostat</span>
            </div>
          </div>
          <p className="aq-kpi-label">Suhu air rata-rata</p>
          <p className="aq-kpi-value">28.5°C</p>
          <p style={{ fontSize: 12, color: '#059669', marginTop: 6 }}>
            Kondisi Ideal untuk Nila
          </p>
        </div>
      </div>

      {/* ── Main Row: Chart + Notifikasi ── */}
      <div className="aq-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16 }}>
        <style>{`
          @media (max-width: 1024px) {
            .aq-grid-2 { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Chart Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p className="aq-section-title">Grafik pertumbuhan ikan</p>
              <p className="aq-small-text" style={{ marginTop: 3 }}>Kenaikan berat rata-rata (gram) per minggu</p>
            </div>
            {/* Toggle 1B / 3B / 6B */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 8, padding: 3, gap: 2 }}>
              {[['1B', '1B', '1B'], ['3B', '3B', '3B'], ['6B', '6B', '6B']].map(r => (
                <button
                  key={r[0]}
                  onClick={() => setChartRange(r[0])}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    background: chartRange === r[0] ? '#1B4332' : 'transparent',
                    color: chartRange === r[0] ? '#fff' : '#64748B',
                    transition: 'all 0.15s',
                  }}
                >
                  {r[2]}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 200, paddingBottom: 0 }}>
            {chartValues.map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    background: '#E9F0EC',
                    borderRadius: '6px 6px 0 0',
                    height: `${(val / maxVal) * 100}%`,
                    transition: 'height 0.4s ease',
                    cursor: 'pointer',
                    minHeight: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2D6A4F'}
                  onMouseLeave={e => e.currentTarget.style.background = '#E9F0EC'}
                />
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>MGG {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifikasi Card */}
        <div style={{ ...cardStyle, width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <p className="aq-section-title">Notifikasi cepat</p>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#2D6A4F', fontWeight: 600 }}>
              Lihat semua
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
            {/* Notif 1 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#059669' }}>water_drop</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1C1A', margin: 0 }}>Penggantian Air Selesai</p>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Kolam A1 telah mencapai level target.</p>
                <p style={{ fontSize: 10, color: '#64748B', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>10 Menit lalu</p>
              </div>
            </div>

            {/* Notif 2 – alert */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FFF8F8', borderRadius: 10, padding: '10px 12px', borderLeft: '3px solid #EF4444', margin: '0 -4px' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#EF4444' }}>bolt</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', margin: 0 }}>Gagal Pompa Udara</p>
                <p style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>Periksa sambungan listrik Kolam B3!</p>
                <p style={{ fontSize: 10, color: '#FCA5A5', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>2 Jam lalu</p>
              </div>
            </div>

            {/* Notif 3 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 17, color: '#10B981' }}>inventory_2</span>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1C1A', margin: 0 }}>Stok Pakan Menipis</p>
                <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Tersisa 5kg untuk Pakan Benih.</p>
                <p style={{ fontSize: 10, color: '#64748B', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>5 Jam lalu</p>
              </div>
            </div>
          </div>

          {/* Kelola Alert Button */}
          <button
            style={{
              marginTop: 24,
              width: '100%',
              padding: '11px 0',
              border: '1.5px solid #1B4332',
              borderRadius: 10,
              background: 'transparent',
              color: '#1B4332',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0F9F4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Kelola Pengaturan Alert
          </button>
        </div>
      </div>

      {/* ── Status Kolam Unggulan ── */}
      <div>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className="aq-section-title">Status kolam unggulan</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Sehat
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
              Kritis
            </span>
          </div>
        </div>

        {/* Pond Cards */}
        <div className="aq-grid-2">

          {/* Pond A1 – Sehat */}
          <div style={{ ...cardStyle, display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
            <div style={{ width: 110, flexShrink: 0, background: 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#059669', fontVariationSettings: "'FILL' 1" }}>water</span>
            </div>
            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>Kolam A1 - Pembesaran Nila</p>
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Usia: 45 Hari | Populasi: 2000 Ekor</p>
                </div>
                <span style={badge('#D1FAE5', '#059669')}>SEHAT</span>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
                {[['PH', '7.2', '#1A1C1A'], ['O2', '6.5 mg/L', '#1A1C1A'], ['AMONIAK', '0.01 ppm', '#1A1C1A']].map(([label, val, color]) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color, margin: '2px 0 0' }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pond B3 – Kritis */}
          <div style={{ ...cardStyle, display: 'flex', gap: 0, padding: 0, overflow: 'hidden', border: '1px solid #FECACA' }}>
            <div style={{ width: 110, flexShrink: 0, background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#EF4444', fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1C1A', margin: 0 }}>Kolam B3 - Pemijahan Gurame</p>
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Usia: 12 Hari | Populasi: 500 Ekor</p>
                </div>
                <span style={badge('#FEE2E2', '#EF4444')}>PERHATIAN</span>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid #FEF2F2' }}>
                {[['PH', '6.8', '#1A1C1A'], ['O2', '3.2 mg/L', '#EF4444'], ['AMONIAK', '0.05 ppm', '#1A1C1A']].map(([label, val, color]) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color, margin: '2px 0 0' }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

/* ── Style helpers ── */
const cardStyle = {
  background: '#FFFFFF',
  border: '1px solid #E9F0EC',
  borderRadius: 16,
  padding: '20px 22px',
}

const kpiLabel = {
  fontSize: 10,
  fontWeight: 700,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: 0,
}

const kpiValue = {
  fontSize: 32,
  fontWeight: 800,
  color: '#1A1C1A',
  margin: '4px 0 0',
  lineHeight: 1.1,
}

function iconBox(bg, color) {
  return {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

function badge(bg, color) {
  return {
    background: bg,
    color: color,
    fontSize: 9,
    fontWeight: 800,
    padding: '3px 8px',
    borderRadius: 999,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }
}
