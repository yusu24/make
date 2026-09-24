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
  Layers, Package, AlertCircle, Eye
} from '@/constants/icons'
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
          arr: sData.arr || 0,
          arpu: sData.arpu || 0,
          churn_rate: sData.churn_rate || 0,
          pending_kyc: sData.pending_kyc || 0,
          tenant_health: sData.tenant_health || { healthy: 0, warning: 0, at_risk: 0, total: 0 }
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

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  const roleLabel = isSuperAdmin() ? 'Super Admin' : (user?.role === 'admin' ? 'Administrator' : 'Executive');

  return (
    <div className="dashboard-container animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── 1. Geometric Balance Hero Banner + Mini KPI Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Hero Card - Silky Smooth Midnight Slate Executive Theme */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#091020] to-[#050913] p-5 sm:p-7 text-white shadow-xl border border-indigo-500/20 flex flex-col justify-between">
          {/* Soft Ambient Light Accents - Mulus, bersih & tanpa bintik-bintik */}
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/15 via-blue-500/5 to-transparent pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-72 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-[28px] tracking-tight text-white leading-tight" style={{ fontWeight: 800 }}>
                  {timeGreeting}, {user?.name || 'Super Admin'}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal">
                  Selamat datang kembali di pusat kendali & analitik eksekutif BIZORA SaaS Platform.
                </p>

                {/* Badges / Status Pills */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider text-indigo-200 shadow-sm">
                    {roleLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider text-indigo-300 shadow-sm">
                    BIZORA PLATFORM
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider text-emerald-400 shadow-sm">
                    EXECUTIVE MODE
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider text-cyan-300 shadow-sm">
                    SYSTEM ALL GREEN
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider text-slate-300 shadow-sm">
                    {now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Right: Frosted Glass Icon Card */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-indigo-400/20 flex items-center justify-center shadow-lg text-indigo-300">
                  <Building2 size={26} className="text-indigo-300" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => navigate('/tenants')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Building2 size={15} className="text-indigo-300" />
                Kelola Tenant ({stats.total_tenants} Terdaftar)
              </button>
              {stats.pending_kyc > 0 && (
                <button
                  onClick={() => navigate('/kyc')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <ShieldCheck size={15} />
                  Tinjau KYC ({stats.pending_kyc} Menunggu)
                </button>
              )}
              <button
                onClick={() => navigate('/content-announcement')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-900/30"
              >
                <Sparkles size={15} />
                Buat Broadcast Notifikasi
              </button>
            </div>
          </div>

          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Revenue Berjalan
              </span>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginTop: 2 }}>
                {stats.revenue_this_month > 0 ? fmtRp(stats.revenue_this_month) : fmtRp(stats.mrr || 42800000)}
              </div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#34d399' }}>
              ▲ +18.4% MoM
            </span>
          </div>
        </div>

        {/* 2 Mini KPI Cards beside Hero: MRR & ARR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
          {/* MRR Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">MRR (Monthly Recurring)</div>
                  <div className="text-[11px] text-slate-400 font-medium">Pendapatan Berulang / Bulan</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] shrink-0">Bulan Ini</span>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{fmtRp(stats.mrr || 0)}</h3>
              <span className="text-xs text-indigo-600 font-semibold block mt-1">
                ARPU: {fmtRp(stats.arpu || 0)} / tenant
              </span>
            </div>
          </div>

          {/* ARR Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight whitespace-nowrap">ARR (Annual Run Rate)</div>
                  <div className="text-[11px] text-slate-400 font-medium">Proyeksi Tahunan (12x MRR)</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] shrink-0">Tahunan</span>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">{fmtRp(stats.arr || (stats.mrr * 12) || 0)}</h3>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                {stats.active_subscriptions || 0} Langganan Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Tenant Health & Churn Risk Radar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
              <Activity size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">Radar Kesehatan Tenant & Risiko Churn</h3>
              <p className="text-xs text-slate-500">Klasifikasi tingkat keaktifan seluruh tenant berdasarkan riwayat transaksi &amp; login terakhir.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/tenants')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Lihat Semua Tenant →
            </button>
          </div>
        </div>

        {/* 3 Health Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Healthy */}
          <div 
            onClick={() => navigate('/tenants?health_status=healthy')}
            className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-900">Sehat &amp; Aktif</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1 font-['Plus_Jakarta_Sans']">
                {stats.tenant_health?.healthy || 0}
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">Ada transaksi &lt; 3 hari terakhir</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                {Math.round(((stats.tenant_health?.healthy || 0) / (stats.total_tenants || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Warning */}
          <div 
            onClick={() => navigate('/tenants?health_status=warning')}
            className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-900">Perhatian (Mulai Pasif)</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-950 mt-1 font-['Plus_Jakarta_Sans']">
                {stats.tenant_health?.warning || 0}
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">Inaktif 4 – 14 hari terakhir</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">
                {Math.round(((stats.tenant_health?.warning || 0) / (stats.total_tenants || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* At-Risk */}
          <div 
            onClick={() => navigate('/tenants?health_status=at_risk')}
            className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-900">Berisiko Churn</span>
              </div>
              <div className="text-2xl font-extrabold text-rose-950 mt-1 font-['Plus_Jakarta_Sans']">
                {stats.tenant_health?.at_risk || 0}
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">Inaktif &gt; 14 hari / Tidak bayar</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-md">
                {Math.round(((stats.tenant_health?.at_risk || 0) / (stats.total_tenants || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Core 4-Column Metric Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">Total Pengguna</div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-full text-[11px] shrink-0">+12%</span>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mb-1">{fmt(stats.total_users || 0)}</h3>
            <span className="text-xs text-slate-400 font-medium block">
              +{stats.new_users_this_week || 0} pendaftar baru minggu ini
            </span>
          </div>
        </div>

        {/* Total Tenants */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight whitespace-nowrap">Total Tenant Aktif</div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-[11px] shrink-0">+8%</span>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mb-1">{fmt(stats.total_tenants || 0)}</h3>
            <span className="text-xs text-slate-400 font-medium block">
              Tersebar di seluruh modul BIZORA
            </span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight whitespace-nowrap">Langganan Aktif</div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[11px] shrink-0">{stats.active_subscriptions || 0} Paket</span>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mb-1">{stats.active_subscriptions || 0} Tenant</h3>
            <span className="text-xs text-slate-400 font-medium block">
              Paket Basic &amp; Pro Aktif
            </span>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Activity size={20} />
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight">Tingkat Churn</div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full text-[11px] shrink-0">{stats.churn_rate || 0}%</span>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] mb-1">{stats.churn_rate || 0}%</h3>
            <span className="text-xs text-slate-400 font-medium block">
              Tingkat retensi tenant {100 - (stats.churn_rate || 0)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Charts & Analytics Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Area Chart: Revenue & Growth */}
        <div className="card min-w-0" style={{ padding: '20px' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 m-0">
                Tren Pertumbuhan Platform
              </h3>
              <p style={{ fontSize: 12, color: '#8592a3', margin: '2px 0 0 0' }}>
                Aktivitas pengguna & revenue · {periodLabel}
              </p>
            </div>
            <select
              className="form-input"
              style={{ width: 'auto', minWidth: 120, fontSize: 12, padding: '6px 10px' }}
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div style={{ width: '100%', height: 260, minWidth: 0, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Business Category Composition & Progress */}
        <div className="card min-w-0" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 m-0">
                Distribusi Kategori Bisnis
              </h3>
              <p style={{ fontSize: 12, color: '#8592a3', margin: '2px 0 0 0' }}>
                Komposisi tenant terdaftar
              </p>
            </div>
            <button
              onClick={() => navigate('/categories')}
              className="btn btn-ghost btn-sm shrink-0"
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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 m-0">
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
                <th style={{ paddingLeft: 8, fontWeight: 700 }}>Pengguna</th>
                <th style={{ fontWeight: 700 }}>Role / Akses</th>
                <th style={{ fontWeight: 700 }}>Status</th>
                <th style={{ fontWeight: 700 }}>Waktu Bergabung</th>
                <th style={{ textAlign: 'right', paddingRight: 8, fontWeight: 700 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', fontWeight: 400 }}>
                    <ListSkeleton count={4} />
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#8592a3', fontWeight: 400 }}>
                    Belum ada data pendaftar baru
                  </td>
                </tr>
              ) : (
                recentUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ paddingLeft: 8, fontWeight: 400 }}>
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
                          fontWeight: 400,
                          fontSize: 12.5
                        }}>
                          {u.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 400, color: '#32475c', fontSize: 13.5 }}>{u.name}</div>
                          <div style={{ fontSize: 11.5, color: '#8592a3', fontWeight: 400 }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 400 }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontWeight: 400 }}>
                        {u.role === 'admin' ? '⭐ Super Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 400 }}>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 400 }}>
                        {u.status === 'active' ? '● Aktif' : '● Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: '#8592a3', fontWeight: 400 }}>
                      {u.joined || 'Baru Saja'}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 8, fontWeight: 400 }}>
                      <button
                        onClick={() => navigate('/users')}
                        className="btn btn-secondary btn-sm"
                        style={{
                          width: 30,
                          height: 30,
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          color: '#696cff'
                        }}
                        title="Buka Detail Pengguna"
                      >
                        <Eye size={14} />
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
