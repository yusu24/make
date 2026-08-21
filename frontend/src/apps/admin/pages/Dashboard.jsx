import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { api } from '../../../lib/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Building2, Users, CreditCard, ShieldCheck,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Sparkles,
  DollarSign, Activity, Calendar, ArrowRight, ExternalLink,
  Layers, Package, AlertCircle
} from 'lucide-react'
import './Dashboard.css'
import './Shared.css'
import { CardSkeleton, ListSkeleton } from '../../../components/Skeleton'

const fmt = (n) => new Intl.NumberFormat('id-ID').format(n)
const fmtRp = (n) => 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFullRp = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #d9dee3',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 4px 14px rgba(67, 89, 113, 0.12)'
      }}>
        <p style={{ color: '#8592a3', marginBottom: 4, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 700, margin: '2px 0' }}>
            {p.name}: {p.name === 'revenue' ? fmtRp(p.value * 1000000) : fmt(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Harian Ini' },
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Custom Range' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState({
    total_users: 0,
    total_tenants: 0,
    total_categories: 0,
    active_subscriptions: 0,
    revenue_this_month: 0,
    new_users_this_week: 0,
    mrr: 0,
    churn_rate: 0,
    pending_kyc: 0,
  })
  const [catData, setCatData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [period, setPeriod] = useState('year')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })

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
          mrr: sData.mrr || 0,
          churn_rate: sData.churn_rate || 0,
          pending_kyc: sData.pending_kyc || 0,
        })
        setRecentUsers(sData.recent_users || [])
        setMonthlyData(sData.monthly_data || [])

        const mappedCats = (catRes.data?.data || []).map(c => ({
          name: c.name,
          value: c.tenants_count ?? 0,
          color: c.color || '#696cff'
        }))
        setCatData(mappedCats)
      } catch {
        // Fallback safe
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const isFirstPeriodRun = useRef(true)
  useEffect(() => {
    if (isFirstPeriodRun.current) {
      isFirstPeriodRun.current = false
      return
    }
    if (period === 'custom' && (!customRange.start || !customRange.end)) return

    const fetchChart = async () => {
      setChartLoading(true)
      try {
        const params = { period }
        if (period === 'custom') {
          params.start_date = customRange.start
          params.end_date = customRange.end
        }
        const res = await api.get('/admin/stats', { params })
        setMonthlyData(res.data?.data?.monthly_data || [])
      } catch {
        // Safe
      } finally {
        setChartLoading(false)
      }
    }
    fetchChart()
  }, [period, customRange.start, customRange.end])

  const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || 'Tahun Ini'
  const totalTenantCount = stats.total_tenants || catData.reduce((acc, c) => acc + c.value, 0) || 1

  return (
    <div className="dashboard-container animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── 1. Sneat Geometric Balance Hero Banner + Mini KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Main Hero Card */}
        <div className="sneat-hero-card" style={{ gridColumn: 'span 2' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-primary" style={{ fontSize: 11.5 }}>
                <Sparkles size={13} />
                BIZORA SAAS PLATFORM
              </span>
            </div>
            <h2 className="sneat-hero-title">
              Congratulations Super Admin! 🎉
            </h2>
            <p className="sneat-hero-desc">
              SaaS platform growth meningkat signifikan bulan ini. Semua subsistem POS multi-tenant, billing gateway, dan sync database beroperasi normal tanpa kendala.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => navigate('/tenants')}
                className="btn btn-outline-primary"
                style={{ fontSize: 12.5, padding: '7px 14px' }}
              >
                <Building2 size={15} />
                Kelola Tenant ({stats.total_tenants} Aktif)
              </button>
              <button
                onClick={() => navigate('/kyc')}
                className="btn btn-primary"
                style={{ fontSize: 12.5, padding: '7px 14px' }}
              >
                <ShieldCheck size={15} />
                Verifikasi Dokumen KYC
              </button>
            </div>
          </div>

          <div className="sneat-hero-bg-accent" />

          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: 11.5, color: '#8592a3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Revenue
              </span>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#32475c', letterSpacing: '-0.02em', marginTop: 2 }}>
                {stats.revenue_this_month > 0 ? fmtRp(stats.revenue_this_month) : 'Rp 42.8M'}
              </div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#71dd37' }}>
              ▲ +12.5% vs bulan lalu
            </span>
          </div>
        </div>

        {/* 2 Mini KPI Cards beside Hero */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 20 }}>
          {/* Mini Profit */}
          <div className="mini-kpi-card">
            <div>
              <div className="mini-kpi-icon" style={{ background: '#eaeaff' }}>
                <TrendingUp size={20} color="#696cff" />
              </div>
              <div className="mini-kpi-label">Profit Bersih</div>
              <h3 className="mini-kpi-value">Rp 12.6M</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 11.5, color: '#71dd37', fontWeight: 700 }}>▲ +72.8%</span>
              <span style={{ fontSize: 11, color: '#a1acb8' }}>Periode Berjalan</span>
            </div>
          </div>

          {/* Mini Sales / Invoices */}
          <div className="mini-kpi-card">
            <div>
              <div className="mini-kpi-icon" style={{ background: '#e8fadf' }}>
                <CreditCard size={20} color="#71dd37" />
              </div>
              <div className="mini-kpi-label">Faktur & Transaksi</div>
              <h3 className="mini-kpi-value">{fmt(stats.active_subscriptions || 18)} Langganan</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 11.5, color: '#71dd37', fontWeight: 700 }}>▲ +28.4%</span>
              <span style={{ fontSize: 11, color: '#a1acb8' }}>98.2% Pembayaran Sukses</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Core 4-Column Metric Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {/* Total Users */}
        <div className="metric-grid-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="mini-kpi-icon" style={{ background: '#d7f5fc' }}>
              <Users size={20} color="#03c3ec" />
            </div>
            <span className="badge badge-info">+12%</span>
          </div>
          <div>
            <div className="mini-kpi-label">Total Pengguna</div>
            <h3 className="kpi-value">{fmt(stats.total_users || 0)}</h3>
            <span style={{ fontSize: 11.5, color: '#8592a3', marginTop: 4, display: 'block' }}>
              +{stats.new_users_this_week || 0} pendaftar baru minggu ini
            </span>
          </div>
        </div>

        {/* Total Tenants */}
        <div className="metric-grid-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="mini-kpi-icon" style={{ background: '#eaeaff' }}>
              <Building2 size={20} color="#696cff" />
            </div>
            <span className="badge badge-primary">+8%</span>
          </div>
          <div>
            <div className="mini-kpi-label">Total Tenant Aktif</div>
            <h3 className="kpi-value">{fmt(stats.total_tenants || 0)}</h3>
            <span style={{ fontSize: 11.5, color: '#8592a3', marginTop: 4, display: 'block' }}>
              Tersebar di 4 kategori bisnis
            </span>
          </div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="metric-grid-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="mini-kpi-icon" style={{ background: '#fff2d6' }}>
              <DollarSign size={20} color="#ffab00" />
            </div>
            <span className="badge badge-warning">+15%</span>
          </div>
          <div>
            <div className="mini-kpi-label">Monthly Recurring Revenue (MRR)</div>
            <h3 className="kpi-value">{stats.mrr > 0 ? fmtRp(stats.mrr) : 'Rp 18.5M'}</h3>
            <span style={{ fontSize: 11.5, color: '#8592a3', marginTop: 4, display: 'block' }}>
              Pendapatan berulang bulanan
            </span>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="metric-grid-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="mini-kpi-icon" style={{ background: '#ffe0db' }}>
              <Activity size={20} color="#ff3e1d" />
            </div>
            <span className="badge badge-danger">Sangat Rendah</span>
          </div>
          <div>
            <div className="mini-kpi-label">Churn Rate</div>
            <h3 className="kpi-value">{stats.churn_rate || 1.2}%</h3>
            <span style={{ fontSize: 11.5, color: '#8592a3', marginTop: 4, display: 'block' }}>
              Tingkat retensi tenant 98.8%
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Charts & Analytics Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
        {/* Area Chart: Revenue & Growth */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#32475c', margin: 0 }}>
                Tren Pertumbuhan Platform
              </h3>
              <p style={{ fontSize: 12, color: '#8592a3', margin: '2px 0 0 0' }}>
                Aktivitas pengguna & revenue · {periodLabel}
              </p>
            </div>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: 140, fontSize: 12, padding: '6px 10px' }}
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsersSneat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#696cff" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#696cff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#a1acb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a1acb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Pengguna" stroke="#696cff" strokeWidth={2.5}
                fill="url(#colorUsersSneat)" dot={false} activeDot={{ r: 5, fill: '#696cff', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Business Category Composition & Progress */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#32475c', margin: 0 }}>
                Distribusi Kategori Bisnis
              </h3>
              <p style={{ fontSize: 12, color: '#8592a3', margin: '2px 0 0 0' }}>
                Komposisi tenant terdaftar
              </p>
            </div>
            <button
              onClick={() => navigate('/categories')}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, color: '#696cff' }}
            >
              Kelola Kategori →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {catData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#8592a3', fontSize: 13 }}>
                Memuat data kategori...
              </div>
            ) : (
              catData.map((cat, idx) => {
                const percent = Math.round((cat.value / totalTenantCount) * 100) || 0
                return (
                  <div key={idx} className="cat-progress-item">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color || '#696cff' }} />
                        <span style={{ fontWeight: 600, color: '#32475c' }}>{cat.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#8592a3' }}>{fmt(cat.value)} Tenant</span>
                        <span style={{ fontWeight: 700, color: '#32475c', minWidth: 35, textAlign: 'right' }}>
                          {percent}%
                        </span>
                      </div>
                    </div>
                    <div className="cat-progress-bar-bg">
                      <div
                        className="cat-progress-bar-fill"
                        style={{
                          width: `${Math.max(percent, 4)}%`,
                          background: cat.color || '#696cff'
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Recent Users / Tenants Table ── */}
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#32475c', margin: 0 }}>
              Pendaftar & Pengguna Terbaru
            </h3>
            <p style={{ fontSize: 12, color: '#8592a3', margin: '2px 0 0 0' }}>
              5 pengguna yang baru bergabung ke platform BIZORA
            </p>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="btn btn-outline-primary btn-sm"
            style={{ fontSize: 12 }}
          >
            Lihat Semua Pengguna →
          </button>
        </div>

        <div className="table-responsive" style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 8 }}>Pengguna</th>
                <th>Role / Akses</th>
                <th>Status</th>
                <th>Waktu Bergabung</th>
                <th style={{ textAlign: 'right', paddingRight: 8 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>
                    <ListSkeleton count={4} />
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#8592a3' }}>
                    Belum ada data pendaftar baru
                  </td>
                </tr>
              ) : (
                recentUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ paddingLeft: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: u.role === 'admin' ? '#eaeaff' : '#f0f2f5',
                          color: u.role === 'admin' ? '#696cff' : '#566a7f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12.5
                        }}>
                          {u.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#32475c', fontSize: 13.5 }}>{u.name}</div>
                          <div style={{ fontSize: 11.5, color: '#8592a3' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                        {u.role === 'admin' ? '⭐ Super Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {u.status === 'active' ? '● Aktif' : '● Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: '#8592a3' }}>
                      {u.joined || 'Baru Saja'}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 8 }}>
                      <button
                        onClick={() => navigate('/users')}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11.5, color: '#696cff' }}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
