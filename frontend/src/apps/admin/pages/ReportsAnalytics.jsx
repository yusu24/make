import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'

// ─── Simple bar chart ─────────────────────────────────────────────────────────
function BarChart({ data, keyX, keyY, color = '#3b82f6', height = 140 }) {
  const max = Math.max(...data.map(d => d[keyY]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 4px' }}>
      {data.map((d, i) => {
        const pct = (d[keyY] / max) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {Number(d[keyY]).toLocaleString('id-ID')}
            </div>
            <div style={{
              width: '100%', borderRadius: '5px 5px 0 0',
              height: `${pct}%`, minHeight: 6,
              background: `linear-gradient(180deg, ${color}cc, ${color})`,
              transition: 'height 0.7s cubic-bezier(0.16,1,0.3,1)',
            }} />
            <div style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'center' }}>{d[keyX]}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ slices, size = 120 }) {
  const r = 42, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  let cumulative = 0
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {slices.map((sl, i) => {
        const pct = sl.value / total
        const dash = circumference * pct
        const offset = circumference * (1 - cumulative)
        cumulative += pct
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={sl.color} strokeWidth={16}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={28} fill="var(--bg-surface)" />
    </svg>
  )
}

export default function ReportsAnalytics() {
  const [stats, setStats] = useState(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [planDist, setPlanDist] = useState([])
  const [categoryDist, setCategoryDist] = useState([])
  const [topTenants, setTopTenants] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data?.data)).catch(() => {})
    api.get('/admin/analytics/monthly-revenue').then(r => setMonthlyRevenue(r.data?.data || [])).catch(() => {})
    api.get('/admin/analytics/plan-distribution').then(r => setPlanDist(r.data?.data || [])).catch(() => {})
    api.get('/admin/analytics/category-distribution').then(r => setCategoryDist(r.data?.data || [])).catch(() => {})
    api.get('/admin/analytics/top-tenants').then(r => setTopTenants(r.data?.data || [])).catch(() => {})
  }, [])

  const fmtRp = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + (Number(m.revenue) || 0), 0);
  const totalTenants = planDist.reduce((s, p) => s + (Number(p.value) || 0), 0);
  const avgRevPerTenant = totalTenants ? Math.round(totalRevenue / totalTenants) : 0;

  const tabs = ['overview', 'revenue', 'tenants']
  const tabLabel = { overview: '📊 Overview', revenue: '💰 Revenue', tenants: '🏢 Tenant' }

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-sub">Analitik pertumbuhan tenant, pendapatan, dan distribusi paket.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Export segera hadir!')}>📥 Export</button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === t ? '2px solid var(--primary-500)' : '2px solid transparent',
            color: activeTab === t ? 'var(--primary-500)' : 'var(--text-muted)',
            fontWeight: 600, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s'
          }}>
            {tabLabel[t]}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Tenant', value: stats?.total_tenants ?? totalTenants, icon: '🏢', color: '#3b82f6', sub: 'terdaftar' },
              { label: 'Total Revenue', value: fmtRp(totalRevenue), icon: '💰', color: '#10b981', sub: 'akumulasi' },
              { label: 'Avg Revenue/Tenant', value: fmtRp(avgRevPerTenant), icon: '📈', color: '#8b5cf6', sub: 'per bulan' },
              { label: 'Pengguna Aktif', value: stats?.total_users ?? 0, icon: '👥', color: '#f59e0b', sub: 'user terdaftar' },
            ].map(card => (
              <div key={card.label} className="card card-pad">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: card.color, lineHeight: 1, wordBreak: 'break-all' }}>{card.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{card.label} · {card.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Revenue bar chart */}
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>📈 Revenue Bulanan</h3>
              <BarChart data={monthlyRevenue} keyX="month" keyY="revenue" color="#3b82f6" height={130} />
            </div>
            {/* Plan distribution donut */}
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, alignSelf: 'flex-start' }}>🥧 Distribusi Paket</h3>
              <DonutChart slices={planDist} size={130} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {planDist.map(sl => (
                  <div key={sl.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: sl.color || '#ccc', display: 'inline-block' }} />
                      <span style={{ fontSize: 13 }}>{sl.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: sl.color || '#ccc' }}>{sl.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── REVENUE TAB ── */}
      {activeTab === 'revenue' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Revenue', value: fmtRp(totalRevenue), icon: '💰', color: '#10b981' },
              { label: 'Bulan Terbaik', value: monthlyRevenue.length > 0 ? monthlyRevenue.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyRevenue[0]).month : '—', icon: '🏆', color: '#f59e0b' },
              { label: 'Pertumbuhan MoM', value: (() => {
                  if (monthlyRevenue.length < 2) return '—';
                  const last = monthlyRevenue[monthlyRevenue.length - 1].revenue;
                  const prev = monthlyRevenue[monthlyRevenue.length - 2].revenue;
                  if (prev === 0) return '—';
                  const growth = ((last - prev) / prev * 100).toFixed(1);
                  return `${growth > 0 ? '+' : ''}${growth}%`;
              })(), icon: '📈', color: '#3b82f6' },
              { label: 'Proyeksi Bulan Depan', value: (() => {
                  if (monthlyRevenue.length === 0) return '—';
                  const avg = totalRevenue / monthlyRevenue.length;
                  return fmtRp(Math.round(avg * 1.1));
              })(), icon: '🔭', color: '#8b5cf6' },
            ].map(c => (
              <div key={c.label} className="card card-pad">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{c.label}</div>
              </div>
            ))}
          </div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>📊 Revenue Bulanan (Rp)</h3>
            <BarChart data={monthlyRevenue} keyX="month" keyY="revenue" color="#10b981" height={150} />
          </div>
          <div className="card card-pad">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>📋 Rincian per Bulan</h3>
            <table className="table">
              <thead><tr><th>Bulan</th><th>Revenue</th><th>Jumlah Tenant</th><th>Avg/Tenant</th><th>Growth</th></tr></thead>
              <tbody>
                {monthlyRevenue.map((m, i) => {
                  const prev = monthlyRevenue[i - 1]
                  const growth = prev ? (((m.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null
                  return (
                    <tr key={m.month}>
                      <td style={{ fontWeight: 600 }}>{m.month}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>{fmtRp(m.revenue)}</td>
                      <td>{m.tenants}</td>
                      <td>{fmtRp(Math.round(m.revenue / (m.tenants || 1)))}</td>
                      <td>{growth ? <span style={{ color: Number(growth) > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{growth > 0 ? '+' : ''}{growth}%</span> : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── TENANTS TAB ── */}
      {activeTab === 'tenants' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>📊 Pertumbuhan Tenant</h3>
              <BarChart data={monthlyRevenue} keyX="month" keyY="tenants" color="#8b5cf6" height={130} />
            </div>
            <div className="card card-pad">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🗂 Distribusi Kategori</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categoryDist.map(c => {
                  const pct = Math.round((c.value / (categoryDist.reduce((s, x) => s + Number(x.value), 0) || 1)) * 100)
                  return (
                    <div key={c.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{c.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.value} ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: c.color, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="card card-pad" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>🏆 Top Tenant berdasarkan Revenue</h3>
            </div>
            <table className="table">
              <thead><tr><th>#</th><th>Nama</th><th>Paket</th><th>Kategori</th><th>Revenue/bln</th><th>Bergabung</th></tr></thead>
              <tbody>
                {topTenants.map((t, i) => (
                  <tr key={t.name}>
                    <td style={{ fontWeight: 700, color: i < 3 ? '#f59e0b' : 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td><span className={`badge ${t.plan === 'Pro' ? 'badge-violet' : 'badge-blue'}`}>{t.plan}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.category}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{fmtRp(t.revenue)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
