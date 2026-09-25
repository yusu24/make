import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'
import StatScoreCard from '@/components/ui/StatScoreCard'
import {
  BarChart2,
  TrendingUp,
  Store,
  DollarSign,
  Users,
  Trophy,
  Target,
  PieChart as PieChartIcon,
  Download,
  FileSpreadsheet,
  Layers,
  Award
} from '@/constants/icons'

import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// ─── Recharts bar chart ────────────────────────────────────────────────────────
function BarChart({ data, keyX, keyY, color = '#3b82f6', height = 220, loading = false }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height, gap: 12 }}>
        <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: `${color}20`, borderTopColor: color }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Memuat grafik...</span>
      </div>
    )
  }
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: 'var(--text-muted)', fontSize: 13 }}>
        Tidak ada data.
      </div>
    )
  }
  const formatYAxis = (tickItem) => {
    if (keyY === 'revenue') {
      return 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(tickItem)
    }
    return tickItem
  }
  const formatTooltip = (value) => {
    if (keyY === 'revenue') {
      return ['Rp ' + new Intl.NumberFormat('id-ID').format(value), 'Revenue']
    }
    return [value, keyY === 'tenants' ? 'Tenants' : keyY]
  }
  return (
    <div className="chart-responsive-box" style={{ height: height, minHeight: height, marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height}>
        <RechartsBarChart data={data} margin={{ top: 15, right: 10, left: -10, bottom: 10 }}>
          <defs>
            <linearGradient id={`color-${keyY}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.55}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis 
            dataKey={keyX} 
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={5}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            width={58} 
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              background: 'var(--bg-elevated)', 
              borderColor: 'var(--border-default)',
              borderRadius: '8px',
              fontSize: '11px'
            }}
          />
          <Bar dataKey={keyY} fill={`url(#color-${keyY})`} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ slices, size = 130 }) {
  const r = 42, cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  let cumulative = 0
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
      <svg 
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, maxWidth: '100%', height: size, maxHeight: '100%', transform: 'rotate(-90deg)', display: 'block' }}
      >
        {slices.map((sl, i) => {
          const pct = total > 0 ? sl.value / total : 0
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
    </div>
  )
}

export default function ReportsAnalytics({ defaultTab = 'overview' }) {
  const [stats, setStats] = useState(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [planDist, setPlanDist] = useState([])
  const [categoryDist, setCategoryDist] = useState([])
  const [topTenants, setTopTenants] = useState([])
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/admin/stats').then(r => setStats(r.data?.data)).catch(() => {}),
      api.get('/admin/analytics/monthly-revenue').then(r => setMonthlyRevenue(r.data?.data || [])).catch(() => {}),
      api.get('/admin/analytics/plan-distribution').then(r => setPlanDist(r.data?.data || [])).catch(() => {}),
      api.get('/admin/analytics/category-distribution').then(r => setCategoryDist(r.data?.data || [])).catch(() => {}),
      api.get('/admin/analytics/top-tenants').then(r => setTopTenants(r.data?.data || [])).catch(() => {})
    ]).finally(() => {
      setLoading(false)
    })
  }, [])

  const fmtRp = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + (Number(m.revenue) || 0), 0);
  const totalTenants = planDist.reduce((s, p) => s + (Number(p.value) || 0), 0);
  const avgRevPerTenant = totalTenants ? Math.round(totalRevenue / totalTenants) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={() => alert('Export format Excel/CSV sedang diproses!')}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
        >
          <Download size={15} className="text-slate-500 dark:text-slate-400" />
          <span>Export Data</span>
        </button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI cards with StatScoreCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatScoreCard
              title="TOTAL TENANT"
              value={stats?.total_tenants ?? totalTenants}
              icon={Store}
              statusBadge={{ text: "Terdaftar", color: "blue" }}
              subtitle="Basis tenant platform aktif"
              progressBar={{ value: 88, color: "bg-blue-500" }}
            />
            <StatScoreCard
              title="TOTAL REVENUE"
              value={fmtRp(totalRevenue)}
              icon={DollarSign}
              statusBadge={{ text: "Akumulasi", color: "emerald" }}
              subtitle="Omzet agregat seluruh tenant"
              progressBar={{ value: 94, color: "bg-emerald-500" }}
            />
            <StatScoreCard
              title="AVG REVENUE/TENANT"
              value={fmtRp(avgRevPerTenant)}
              icon={TrendingUp}
              statusBadge={{ text: "Per Bulan", color: "violet" }}
              subtitle="ARPU rata-rata operasional"
              progressBar={{ value: 76, color: "bg-violet-500" }}
            />
            <StatScoreCard
              title="PENGGUNA TERDAFTAR"
              value={stats?.total_users ?? 0}
              icon={Users}
              statusBadge={{ text: "Aktif", color: "amber" }}
              subtitle="Pengguna & staff platform"
              progressBar={{ value: 92, color: "bg-amber-500" }}
            />
          </div>

          <div className="reports-overview-grid">
            {/* Revenue bar chart */}
            <div className="card card-pad chart-card-wrapper min-w-0">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={18} className="text-indigo-600" />
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 m-0">Revenue Bulanan</h3>
              </div>
              <BarChart data={monthlyRevenue} keyX="month" keyY="revenue" color="#3b82f6" height={220} loading={loading} />
            </div>
            {/* Plan distribution donut */}
            <div className="card card-pad chart-card-wrapper min-w-0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', width: '100%' }}>
                <PieChartIcon size={18} className="text-indigo-600" />
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 m-0">Distribusi Paket</h3>
              </div>
              <DonutChart slices={planDist} size={130} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {planDist.map(sl => (
                  <div key={sl.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: sl.color || '#ccc', display: 'inline-block' }} />
                      <span style={{ fontSize: 13 }}>{sl.label}</span>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: sl.color || '#ccc' }}>{sl.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── REVENUE TAB ── */}
      {activeTab === 'revenue' && (() => {
        const bestMonth = monthlyRevenue.length > 0 ? monthlyRevenue.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyRevenue[0]).month : '—';
        const momGrowth = (() => {
          if (monthlyRevenue.length < 2) return { text: '—', val: 50, positive: true };
          const last = monthlyRevenue[monthlyRevenue.length - 1].revenue;
          const prev = monthlyRevenue[monthlyRevenue.length - 2].revenue;
          if (prev === 0) return { text: '—', val: 50, positive: true };
          const growth = ((last - prev) / prev * 100);
          return {
            text: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
            val: Math.min(100, Math.max(15, Math.round(Math.abs(growth)))),
            positive: growth >= 0
          };
        })();
        const nextMonthProjection = (() => {
          if (monthlyRevenue.length === 0) return '—';
          const avg = totalRevenue / monthlyRevenue.length;
          return fmtRp(Math.round(avg * 1.1));
        })();

        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatScoreCard
                title="TOTAL REVENUE"
                value={fmtRp(totalRevenue)}
                icon={DollarSign}
                statusBadge={{ text: "YTD", color: "emerald" }}
                subtitle="Akumulasi omzet platform"
                progressBar={{ value: 94, color: "bg-emerald-500" }}
              />
              <StatScoreCard
                title="BULAN TERBAIK"
                value={bestMonth}
                icon={Trophy}
                statusBadge={{ text: "Puncak", color: "amber" }}
                subtitle="Rekor penerimaan tertinggi"
                progressBar={{ value: 100, color: "bg-amber-500" }}
              />
              <StatScoreCard
                title="PERTUMBUHAN MOM"
                value={momGrowth.text}
                icon={TrendingUp}
                statusBadge={{ text: momGrowth.positive ? "Naik" : "Defisit", color: momGrowth.positive ? "blue" : "red" }}
                subtitle="Dibandingkan bulan lalu"
                progressBar={{ value: momGrowth.val, color: momGrowth.positive ? "bg-blue-500" : "bg-red-500" }}
              />
              <StatScoreCard
                title="PROYEKSI BULAN DEPAN"
                value={nextMonthProjection}
                icon={Target}
                statusBadge={{ text: "Estimasi", color: "violet" }}
                subtitle="Target pertumbuhan +10%"
                progressBar={{ value: 85, color: "bg-violet-500" }}
              />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-emerald-500" />
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">Grafik Revenue Bulanan (Rp)</h3>
              </div>
              <BarChart data={monthlyRevenue} keyX="month" keyY="revenue" color="#10b981" height={240} loading={loading} />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">Rincian Finansial per Bulan</h3>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead><tr><th>Bulan</th><th>Revenue</th><th>Jumlah Tenant</th><th>Avg/Tenant</th><th>Growth</th></tr></thead>
                  <tbody>
                    {monthlyRevenue.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                          Belum ada data revenue bulanan.
                        </td>
                      </tr>
                    ) : (
                      monthlyRevenue.map((m, i) => {
                        const prev = monthlyRevenue[i - 1]
                        const growth = prev ? (((m.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null
                        return (
                          <tr key={m.month}>
                            <td style={{ fontWeight: 600 }}>{m.month}</td>
                            <td style={{ fontWeight: 600, color: '#10b981' }}>{fmtRp(m.revenue)}</td>
                            <td>{m.tenants}</td>
                            <td>{fmtRp(Math.round(m.revenue / (m.tenants || 1)))}</td>
                            <td>{growth ? <span style={{ color: Number(growth) > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{growth > 0 ? '+' : ''}{growth}%</span> : '—'}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── TENANTS TAB ── */}
      {activeTab === 'tenants' && (() => {
        const topCategory = categoryDist.length > 0 ? categoryDist.reduce((max, c) => c.value > max.value ? c : max, categoryDist[0]).label : '—';
        const topPlan = planDist.length > 0 ? planDist.reduce((max, p) => p.value > max.value ? p : max, planDist[0]).label : '—';

        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatScoreCard
                title="TOTAL TENANT"
                value={stats?.total_tenants ?? totalTenants}
                icon={Store}
                statusBadge={{ text: "Terdaftar", color: "blue" }}
                subtitle="Populasi tenant aktif"
                progressBar={{ value: 88, color: "bg-blue-500" }}
              />
              <StatScoreCard
                title="KATEGORI DOMINAN"
                value={topCategory}
                icon={Layers}
                statusBadge={{ text: "Terbanyak", color: "violet" }}
                subtitle="Sektor bisnis utama"
                progressBar={{ value: 75, color: "bg-violet-500" }}
              />
              <StatScoreCard
                title="PAKET FAVORIT"
                value={topPlan}
                icon={Award}
                statusBadge={{ text: "Populer", color: "amber" }}
                subtitle="Paket langganan dominan"
                progressBar={{ value: 85, color: "bg-amber-500" }}
              />
              <StatScoreCard
                title="TOTAL PENGGUNA"
                value={stats?.total_users ?? 0}
                icon={Users}
                statusBadge={{ text: "Aktif", color: "emerald" }}
                subtitle="Akun operator & staf"
                progressBar={{ value: 92, color: "bg-emerald-500" }}
              />
            </div>

            <div className="reports-two-col-grid">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm min-w-0">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">Pertumbuhan Tenant</h3>
                </div>
                <BarChart data={monthlyRevenue} keyX="month" keyY="tenants" color="#8b5cf6" height={220} loading={loading} />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm min-w-0">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">Distribusi Kategori</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {categoryDist.map(c => {
                    const pct = Math.round((c.value / (categoryDist.reduce((s, x) => s + Number(x.value), 0) || 1)) * 100)
                    return (
                      <div key={c.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13 }} className="text-slate-700 dark:text-slate-300">{c.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{c.value} ({pct}%)</span>
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

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <Award size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">Top Tenant berdasarkan Revenue</h3>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead><tr><th>#</th><th>Nama</th><th>Paket</th><th>Kategori</th><th>Revenue/bln</th><th>Bergabung</th></tr></thead>
                  <tbody>
                    {topTenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                          Belum ada data tenant.
                        </td>
                      </tr>
                    ) : (
                      topTenants.map((t, i) => (
                        <tr key={t.name}>
                          <td style={{ fontWeight: 600, color: i < 3 ? '#f59e0b' : 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{t.name}</td>
                          <td><span className={`badge ${t.plan === 'Pro' ? 'badge-violet' : 'badge-blue'}`}>{t.plan}</span></td>
                          <td style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.category}</td>
                          <td style={{ fontWeight: 600, color: '#10b981' }}>{fmtRp(t.revenue)}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-primary)' }}>{t.joined}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  )
}
