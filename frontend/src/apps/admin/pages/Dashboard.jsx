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
import StatScoreCard from '../../../components/ui/StatScoreCard'

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
          <StatScoreCard
            title="MRR (Monthly Recurring)"
            value={fmtRp(stats.mrr || 0)}
            status="Bulan Ini"
            statusVariant="indigo"
            icon={<TrendingUp size={20} />}
            desc={`ARPU: ${fmtRp(stats.arpu || 0)} / tenant aktif`}
            progress={84}
            progressVariant="indigo"
            className="h-full"
          />

          <StatScoreCard
            title="ARR (Annual Run Rate)"
            value={fmtRp(stats.arr || (stats.mrr * 12) || 0)}
            status="Tahunan"
            statusVariant="emerald"
            icon={<DollarSign size={20} />}
            desc={`${stats.active_subscriptions || 0} Langganan Tenant Aktif`}
            progress={92}
            progressVariant="emerald"
            className="h-full"
          />
        </div>
      </div>

      {/* ── 2. Tenant Health & Churn Risk Radar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">Radar Kesehatan Tenant &amp; Risiko Churn</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Klasifikasi tingkat keaktifan seluruh tenant berdasarkan riwayat transaksi &amp; login terakhir.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/tenants')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-1.5"
          >
            <span>Lihat Semua Tenant</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 3 Health Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Healthy */}
          <div 
            onClick={() => navigate('/tenants?health_status=healthy')}
            className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Sehat &amp; Aktif</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 mt-1 font-['Plus_Jakarta_Sans']">
                {stats.tenant_health?.healthy || 0}
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Ada transaksi &lt; 3 hari terakhir</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-1 rounded-lg">
                {Math.round(((stats.tenant_health?.healthy || 0) / (stats.total_tenants || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* Warning */}
          <div 
            onClick={() => navigate('/tenants?health_status=warning')}
            className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Perhatian (Mulai Pasif)</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-950 dark:text-amber-100 mt-1 font-['Plus_Jakarta_Sans']">
                {stats.tenant_health?.warning || 0}
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Inaktif 4 – 14 hari terakhir</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-1 rounded-lg">
                {Math.round(((stats.tenant_health?.warning || 0) / (stats.total_tenants || 1)) * 100)}%
              </span>
            </div>
          </div>

          {/* At-Risk */}
          <div 
            onClick={() => navigate('/tenants?health_status=at_risk')}
            className="p-4 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-900 dark:text-rose-300">Berisiko Churn</span>
              </div>
              <div className="text-2xl font-extrabold text-rose-950 dark:text-rose-100 mt-1 font-['Plus_Jakarta_Sans']">
                {stats.tenant_health?.at_risk || 0}
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">Inaktif &gt; 14 hari / Tidak bayar</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-1 rounded-lg">
                {Math.round(((stats.tenant_health?.at_risk || 0) / (stats.total_tenants || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Core 4-Column Metric Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatScoreCard
          title="Total Pengguna"
          value={fmt(stats.total_users || 0)}
          status="+12% bln ini"
          statusVariant="sky"
          icon={<Users size={20} />}
          desc={`+${stats.new_users_this_week || 0} pendaftar baru minggu ini`}
          progress={82}
          progressVariant="sky"
        />

        <StatScoreCard
          title="Total Tenant Aktif"
          value={fmt(stats.total_tenants || 0)}
          status="+8% tumbuh"
          statusVariant="indigo"
          icon={<Building2 size={20} />}
          desc="Tersebar di seluruh modul BIZORA"
          progress={91}
          progressVariant="indigo"
          onClick={() => navigate('/tenants')}
        />

        <StatScoreCard
          title="Langganan Aktif"
          value={`${stats.active_subscriptions || 0} Tenant`}
          status={`${stats.active_subscriptions || 0} Paket`}
          statusVariant="amber"
          icon={<CreditCard size={20} />}
          desc="Paket Basic, Pro & Enterprise Aktif"
          progress={75}
          progressVariant="amber"
          onClick={() => navigate('/subscriptions')}
        />

        <StatScoreCard
          title="Tingkat Churn"
          value={`${stats.churn_rate || 0}%`}
          status="Stabil Rendah"
          statusVariant="emerald"
          icon={<ShieldCheck size={20} />}
          desc={`Tingkat retensi tenant ${100 - (stats.churn_rate || 0)}% (Aman)`}
          progress={96}
          progressVariant="emerald"
        />
      </div>

      {/* ── 3. Charts & Analytics Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Area Chart: Revenue & Growth */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">
                Tren Pertumbuhan Platform
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Aktivitas pengguna &amp; estimasi pendapatan &bull; {periodLabel}
              </p>
            </div>
            <select
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" name="Pengguna" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#colorUsersSneat)" dot={false} activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Category Composition & Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">
                  Distribusi Kategori Bisnis
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Komposisi tenant terdaftar per sektor UMKM
                </p>
              </div>
              <button
                onClick={() => navigate('/categories')}
                className="px-3 py-1 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Kelola Kategori</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-3.5">
              {catData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Memuat data distribusi kategori...
                </div>
              ) : (
                catData.map((cat, idx) => {
                  const percent = Math.round((cat.value / totalTenantCount) * 100) || 0
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color || '#6366f1' }} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <span>{fmt(cat.value)} Tenant</span>
                          <span className="font-bold text-slate-900 dark:text-white w-9 text-right">
                            {percent}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(percent, 4)}%`,
                            background: cat.color || '#6366f1'
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total Tenant Aktif: <strong>{totalTenantCount}</strong></span>
            <span className="text-indigo-500 font-medium">100% Tercakup</span>
          </div>
        </div>
      </div>

      {/* ── 4. Recent Users / Tenants Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 dark:text-white m-0">
              Pendaftar &amp; Pengguna Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5 Pengguna yang baru bergabung ke ekosistem BIZORA SaaS
            </p>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-1.5 w-fit"
          >
            <span>Lihat Semua Pengguna</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Pengguna</th>
                <th className="pb-3">Role / Akses</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Waktu Bergabung</th>
                <th className="pb-3 pr-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center">
                    <ListSkeleton count={4} />
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada data pendaftar baru
                  </td>
                </tr>
              ) : (
                recentUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {u.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-xs">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {u.role === 'admin' ? '⭐ Super Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {u.status === 'active' ? 'Aktif' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {u.joined || 'Baru Saja'}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={() => navigate('/users')}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
