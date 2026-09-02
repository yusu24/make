import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'
import '../budidaya.css'

export default function Dashboard() {
  const { user } = useAuth()
  const terms = useBudidayaTerms()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartRange, setChartRange] = useState('1B') // '1B' | '3B' | '6B'

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/budidaya/dashboard/stats')
      const statsData = res.data?.data || res.data || {}
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat data live farm...</p>
    </div>
  )

  const rawChartData = stats?.charts?.[chartRange] || []
  const chartItems = rawChartData.length > 0 ? rawChartData : [
    { label: 'Mgg 1', revenue: 0, weight_kg: 0 },
    { label: 'Mgg 2', revenue: 0, weight_kg: 0 },
    { label: 'Mgg 3', revenue: 0, weight_kg: 0 },
    { label: 'Mgg 4', revenue: 0, weight_kg: 0 },
  ]
  const maxVal = Math.max(...chartItems.map(item => Math.max(item.revenue || 0, item.weight_kg || 0)), 10)

  const featuredPonds = stats?.featured_ponds || []
  const recentAlerts = stats?.recent_alerts || []

  return (
    <div className="aq-container" style={{ animation: 'kd-fadeIn 0.3s ease' }}>

      {/* ── KPI Cards Row ── */}
      <div className="aq-grid-3" style={{ marginBottom: 18 }}>

        {/* Total Kolam / Lahan */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#E8F5ED', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{terms.iconMain}</span>
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>{terms.totalUnitsLabel}</span>
            </div>
            <span style={badge('#D1FAE5', '#059669')}>
              {stats?.active_ponds || 0} Aktif
            </span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>
              {stats?.total_ponds ?? 0}
            </div>
            <div style={{ fontSize: 11.5, color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cycle</span>
              {`${stats?.active_cycles || 0} Siklus Berjalan`}
            </div>
          </div>
        </div>

        {/* Butuh Perhatian / Peringatan */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: stats?.critical_count > 0 ? '#FFE4E6' : '#F1F5F9', color: stats?.critical_count > 0 ? '#E11D48' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {stats?.critical_count > 0 ? 'warning' : 'check_circle'}
                </span>
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Butuh Perhatian</span>
            </div>
            <span style={badge(stats?.critical_count > 0 ? '#FFE4E6' : '#ECFDF5', stats?.critical_count > 0 ? '#E11D48' : '#059669')}>
              {stats?.critical_count > 0 ? 'Perhatian' : 'Optimal'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stats?.critical_count > 0 ? '#E11D48' : '#0F172A' }}>
              {String(stats?.critical_count ?? 0).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 11.5, color: stats?.critical_count > 0 ? '#E11D48' : '#94A3B8', marginTop: 4 }}>
              {stats?.critical_count > 0 ? 'Terdapat unit dengan FCR / kondisi tinggi' : 'Semua parameter terpantau normal'}
            </div>
          </div>
        </div>

        {/* Jadwal Pakan / Pemupukan Terdekat */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{terms.iconFeed}</span>
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>{terms.nextFeedLabel}</span>
            </div>
            <span style={badge('#ECFDF5', '#10B981')}>Rutin</span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A' }}>
              {stats?.next_feed_time || '16:00'}
            </div>
            <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>
              {terms.nextFeedDetail}
            </div>
          </div>
        </div>
      </div>

      {/* ── Financial Summary Strip ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 20px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#E8F5ED', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>payments</span>
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Akumulasi Omzet Panen</span>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>
              Rp {(stats?.total_revenue || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div style={{ width: 1, height: 32, background: '#E2E8F0', display: 'inline-block' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>shopping_cart_checkout</span>
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Pengeluaran Kas</span>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', margin: '2px 0 0' }}>
              Rp {(stats?.total_expenses || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div style={{ width: 1, height: 32, background: '#E2E8F0', display: 'inline-block' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: (stats?.net_profit || 0) >= 0 ? '#ECFDF5' : '#FEF2F2', color: (stats?.net_profit || 0) >= 0 ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>trending_up</span>
          </div>
          <div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Laba Bersih Riil</span>
            <p style={{ fontSize: 18, fontWeight: 700, color: (stats?.net_profit || 0) >= 0 ? '#059669' : '#DC2626', margin: '2px 0 0' }}>
              Rp {(stats?.net_profit || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <Link to="/budidaya/finance-summary" style={{ textDecoration: 'none', background: '#F1F5F9', color: '#1B4332', fontSize: 12.5, fontWeight: 700, padding: '8px 16px', borderRadius: 8, transition: 'all 0.15s' }}>
          Buka Laba Rugi →
        </Link>
      </div>

      {/* ── Main Row: Live Chart + Notifikasi ── */}
      <div className="aq-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16, marginBottom: 20 }}>
        
        {/* Live Trend Chart Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p className="aq-section-title">Tren Penjualan & Panen Riil</p>
              <p className="aq-small-text" style={{ marginTop: 3 }}>
                Akumulasi omzet hasil panen berdasarkan periode waktu
              </p>
            </div>
            
            {/* Toggle 1B / 3B / 6B */}
            <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 8, padding: 3, gap: 2 }}>
              {[['1B', '1 Bulan Terakhir'], ['3B', '3 Bulan Terakhir'], ['6B', '6 Bulan Terakhir']].map(r => (
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
                  {r[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 190, paddingBottom: 0 }}>
            {chartItems.map((item, i) => {
              const val = Math.max(item.revenue || 0, item.weight_kg || 0)
              const barHeightPercent = maxVal > 0 ? Math.max((val / maxVal) * 100, 6) : 6

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`${item.label}: Rp ${(item.revenue || 0).toLocaleString('id-ID')} (${(item.weight_kg || 0).toLocaleString('id-ID')} kg)`}
                    style={{
                      width: '100%',
                      background: val > 0 ? '#1B4332' : '#E2E8F0',
                      borderRadius: '6px 6px 0 0',
                      height: `${barHeightPercent}%`,
                      transition: 'height 0.4s ease, background 0.15s',
                      cursor: 'pointer',
                      minHeight: 8,
                    }}
                    onMouseEnter={e => {
                      if (val > 0) e.currentTarget.style.background = '#2D6A4F'
                    }}
                    onMouseLeave={e => {
                      if (val > 0) e.currentTarget.style.background = '#1B4332'
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notifikasi & Aktivitas Card */}
        <div style={{ ...cardStyle, width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p className="aq-section-title">Aktivitas Terkini</p>
            <span style={{ fontSize: 11, color: '#64748B' }}>Realtime</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 10px', color: '#94A3B8', fontSize: 12.5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#CBD5E1', marginBottom: 6 }}>event_note</span>
                <p style={{ margin: 0 }}>Belum ada log pemberian pakan baru.</p>
              </div>
            ) : (
              recentAlerts.map(alert => (
                <div key={alert.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#10B981' }}>nutrition</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#1A1C1A', margin: 0 }}>
                      {alert.title}
                    </p>
                    <p style={{ fontSize: 11.5, color: '#475569', marginTop: 2, margin: 0 }}>
                      {alert.desc}
                    </p>
                    <p style={{ fontSize: 10.5, color: '#64748B', marginTop: 3, fontWeight: 500, margin: 0 }}>{alert.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/budidaya/cycles"
            style={{
              marginTop: 18,
              width: '100%',
              padding: '9px 0',
              border: '1.5px solid #1B4332',
              borderRadius: 8,
              background: 'transparent',
              color: '#1B4332',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'block',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0F9F4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Buka Manajemen Siklus
          </Link>
        </div>
      </div>

      {/* ── Status Kolam / Lahan Aktif Riil ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className="aq-section-title">{`Daftar ${terms.unit} Aktif Farm`}</p>
          <Link to="/budidaya/ponds" style={{ fontSize: 12.5, color: '#1B4332', fontWeight: 600, textDecoration: 'none' }}>
            Lihat Semua {terms.unit} →
          </Link>
        </div>

        {/* Real Pond Cards Grid */}
        {featuredPonds.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 32, textAlign: 'center', color: '#94A3B8' }}>
            <p style={{ margin: 0, fontSize: 13 }}>Belum ada {terms.unit} yang terdaftar.</p>
            <Link to="/budidaya/ponds" style={{ display: 'inline-block', marginTop: 8, color: '#1B4332', fontWeight: 600, fontSize: 12.5 }}>
              + Tambah {terms.unit} Sekarang
            </Link>
          </div>
        ) : (
          <div className="aq-grid-2" style={{ gap: 14 }}>
            {featuredPonds.map(pond => (
              <div key={pond.id} style={{ ...cardStyle, display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
                <div style={{
                  width: 90, flexShrink: 0,
                  background: pond.status === 'aktif' ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 36, color: pond.status === 'aktif' ? '#059669' : '#64748B' }}>
                    {terms.iconMain}
                  </span>
                </div>
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: 0 }}>{pond.name}</p>
                      <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 3, margin: 0 }}>
                        {pond.has_active_cycle 
                          ? `${pond.species} • ${(pond.seed_count || 0).toLocaleString('id-ID')} ekor • DOC ${pond.doc_days} hari` 
                          : `Status: ${pond.status === 'istirahat' ? 'Istirahat Kolam' : 'Kosong / Siap Isi'}`}
                      </p>
                    </div>
                    <span style={badge(pond.status === 'aktif' ? '#D1FAE5' : '#F1F5F9', pond.status === 'aktif' ? '#059669' : '#64748B')}>
                      {pond.health_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

/* ── Style helpers ── */
const cardStyle = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 14,
  padding: '18px 20px',
}

function iconBox(bg, color) {
  return {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 9px',
    borderRadius: 9999,
  }
}
