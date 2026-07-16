import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import './Dashboard.css'
import './Shared.css'
import { CardSkeleton, ListSkeleton } from '../../../components/Skeleton'

const fmt = (n) => new Intl.NumberFormat('id-ID').format(n)
const fmtRp = (n) => 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
        borderRadius: 10, padding: '10px 14px', fontSize: 12
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.name === 'revenue' ? fmtRp(p.value * 1000000) : fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const STAT_CARDS = (stats) => [
  {
    id: 'total-users',
    label: 'Total Pengguna',
    value: fmt(stats.total_users || 0),
    sub: `+${stats.new_users_this_week || 0} minggu ini`,
    icon: '◉',
    color: '#3b82f6',
    trend: '+12%',
    up: true,
  },
  {
    id: 'total-tenants',
    label: 'Total Tenant Aktif',
    value: fmt(stats.total_tenants || 0),
    sub: 'Terdaftar di sistem',
    icon: '⬡',
    color: '#10b981',
    trend: '+8%',
    up: true,
  },
  {
    id: 'active-subs',
    label: 'Langganan Aktif',
    value: fmt(stats.active_subscriptions || 0),
    sub: `${stats.total_users ? Math.round((stats.active_subscriptions || 0) / stats.total_users * 100) : 0}% konversi`,
    icon: '⭐',
    color: '#8b5cf6',
    trend: '+5%',
    up: true,
  },
  {
    id: 'revenue',
    label: 'Pendapatan Bulan Ini',
    value: fmtRp(stats.revenue_this_month || 0),
    sub: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    icon: '◈',
    color: '#f59e0b',
    trend: '+18%',
    up: true,
  },
]

export default function Dashboard() {
  const { user, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState({
    total_users: 0,
    total_tenants: 0,
    total_categories: 0,
    active_subscriptions: 0,
    revenue_this_month: 0,
    new_users_this_week: 0,
  })
  const [catData, setCatData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, catRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/categories'),
        ])
        const sData = statsRes.data?.data || {}
        setStats({
          total_users: sData.total_users || 0,
          total_tenants: sData.total_tenants || 0,
          total_categories: sData.total_categories || 0,
          active_subscriptions: sData.active_subscriptions || 0,
          revenue_this_month: sData.revenue_this_month || 0,
          new_users_this_week: sData.new_users_this_week || 0,
        })
        setRecentUsers(sData.recent_users || [])
        setMonthlyData(sData.monthly_data || [])
        
        // Map category data dynamically so that Recharts PieChart value is linked to tenants_count
        const mappedCats = (catRes.data?.data || []).map(c => ({
          name: c.name,
          value: c.tenants_count ?? 0,
          color: c.color || '#3b82f6'
        }))
        setCatData(mappedCats)
      } catch {
        // Safe empty fallback
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const cards = STAT_CARDS(stats)
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Siang'
    if (h < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="dashboard animate-fade-in">
      {/* Welcome Banner */}
      <div className="dashboard__welcome">
        <div className="dashboard__welcome-text">
          <h2 className="dashboard__greeting">
            {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Admin'}! 👋</span>
          </h2>
          <p className="dashboard__greeting-sub">
            {isSuperAdmin()
              ? 'Berikut ringkasan statistik platform BIZORA SaaS Anda hari ini.'
              : `Anda masuk sebagai Customer — Kategori: ${user?.business_category || '-'}`}
          </p>
        </div>
        <div className="dashboard__welcome-badge">
          <span className="badge badge-blue" style={{ fontSize: 13, padding: '6px 14px' }}>
            {isSuperAdmin() ? '⭐ Super Admin' : user?.role === 'admin' ? '🔧 Admin' : '📦 Customer'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 stagger" style={{ marginBottom: 28 }}>
        {loading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : cards.map(card => (
          <div key={card.id} id={`stat-card-${card.id}`} className="kpi-card animate-fade-in">
            <div className="kpi-card__top">
              <div className="kpi-card__icon-wrap" style={{ background: card.color + '20' }}>
                <span className="kpi-card__icon" style={{ color: card.color }}>{card.icon}</span>
              </div>
              <span className={`kpi-card__trend ${card.up ? 'kpi-card__trend--up' : 'kpi-card__trend--down'}`}>
                {card.up ? '↑' : '↓'} {card.trend}
              </span>
            </div>
            <div className="kpi-card__value stat-number">{card.value}</div>
            <div className="kpi-card__label">{card.label}</div>
            <div className="kpi-card__sub">{card.sub}</div>
            <div className="kpi-card__bar" style={{ background: card.color + '30' }}>
              <div className="kpi-card__bar-fill" style={{ background: card.color, width: '65%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Area Chart */}
        <div className="card card-pad">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Pertumbuhan Pengguna</h3>
              <p className="chart-sub">Tren bulanan tahun 2026</p>
            </div>
            <span className="badge badge-blue">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Pengguna" stroke="#3b82f6" strokeWidth={2}
                fill="url(#colorUsers)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Revenue */}
        <div className="card card-pad">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Pendapatan Platform</h3>
              <p className="chart-sub">Dalam jutaan rupiah</p>
            </div>
            <span className="badge badge-yellow">Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="revenue" fill="url(#colorRev)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Pie + Recent Users */}
      <div className="grid-2" style={{ marginBottom: 8 }}>
        {/* Pie Chart */}
        <div className="card card-pad">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Distribusi Kategori Bisnis</h3>
              <p className="chart-sub">Komposisi tenant per kategori</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {catData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [fmt(v) + ' tenant', n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {catData.map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{cat.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card card-pad">
          <div className="chart-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 className="chart-title">Pengguna Terbaru</h3>
              <p className="chart-sub">5 pendaftar terakhir</p>
            </div>
            <a href="/users" className="btn btn-ghost btn-sm">Lihat Semua →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <ListSkeleton count={5} />
            ) : recentUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div className="avatar" style={{
                  background: u.role === 'admin'
                    ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
                    : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  width: 34, height: 34, fontSize: 12
                }}>
                  {u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{u.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">{u.email}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, marginBottom: 3 }}>
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                      {u.status}
                    </span>
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
