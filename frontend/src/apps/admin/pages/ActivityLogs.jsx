import { useState, useEffect } from 'react'
import {
  Search,
  RefreshCw,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Settings,
  Shield,
  FileText
} from '@/constants/icons'
import { api } from '../../../lib/api'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

const DUMMY_LOGS = [
  { id: 1, user: 'Super Admin',  action: 'login',           target: 'System Dashboard',        ip: '127.0.0.1',  time: '2026-04-10 21:35:12', level: 'info' },
  { id: 2, user: 'Super Admin',  action: 'create_user',     target: 'User: Ahmad Suharto',     ip: '127.0.0.1',  time: '2026-04-10 20:10:05', level: 'success' },
  { id: 3, user: 'Rizka Amalia', action: 'edit_category',   target: 'Kategori: Toko Retail',   ip: '192.168.1.5',time: '2026-04-10 18:44:30', level: 'info' },
  { id: 4, user: 'System',       action: 'failed_login',    target: 'Email: unknown@test.com', ip: '203.0.113.1',time: '2026-04-10 17:22:01', level: 'warning' },
  { id: 5, user: 'Super Admin',  action: 'delete_tenant',   target: 'Tenant: TN-009',          ip: '127.0.0.1',  time: '2026-04-10 15:01:55', level: 'danger' },
  { id: 6, user: 'Farid Salim',  action: 'view_tenants',    target: 'Tenant List',             ip: '10.0.0.2',   time: '2026-04-10 14:30:00', level: 'info' },
  { id: 7, user: 'System',       action: 'email_verified',  target: 'User: Siti Rahayu',       ip: '-',          time: '2026-04-10 13:11:22', level: 'success' },
  { id: 8, user: 'Super Admin',  action: 'toggle_category', target: 'Kategori: Manufaktur',    ip: '127.0.0.1',  time: '2026-04-10 12:05:48', level: 'warning' },
]

const LEVEL_BADGE = {
  info: 'badge-blue',
  success: 'badge-green',
  warning: 'badge-yellow',
  danger: 'badge-red',
}

const LEVEL_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState(DUMMY_LOGS)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [loading, setLoading] = useState(false)

  const fetchLogs = () => {
    setLoading(true)
    api.get('/logs')
      .then(r => setLogs(r.data?.data || DUMMY_LOGS))
      .catch(() => setLogs(DUMMY_LOGS))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const successCount = logs.filter(l => l.level === 'success').length
  const infoCount = logs.filter(l => l.level === 'info').length
  const warningCount = logs.filter(l => l.level === 'warning').length
  const dangerCount = logs.filter(l => l.level === 'danger').length

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    const matchSearch =
      l.user.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.target.toLowerCase().includes(q) ||
      (l.ip && l.ip.toLowerCase().includes(q))
    const matchLevel = level === 'all' || l.level === level
    return matchSearch && matchLevel
  })

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex,
  } = usePagination(filtered, 10)

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang log aktivitas"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
        <button
          onClick={() => alert('Export CSV audit trail sedang di-generate...')}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
        >
          <Download size={14} className="text-slate-500 dark:text-slate-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatScoreCard
          title="TOTAL AUDIT EVENT"
          value={logs.length}
          icon={FileText}
          statusBadge={{ text: "Terekam", color: "blue" }}
          subtitle="Seluruh catatan audit aktif"
          progressBar={{ value: 100, color: "bg-blue-500" }}
          onClick={() => setLevel('all')}
        />
        <StatScoreCard
          title="OPERASI SUKSES"
          value={successCount + infoCount}
          icon={CheckCircle2}
          statusBadge={{ text: "Normal", color: "emerald" }}
          subtitle="Aktivitas tervalidasi sukses"
          progressBar={{ value: Math.min(100, Math.round(((successCount + infoCount) / (logs.length || 1)) * 100)), color: "bg-emerald-500" }}
          onClick={() => setLevel('success')}
        />
        <StatScoreCard
          title="PERINGATAN & ANOMALI"
          value={warningCount}
          icon={AlertTriangle}
          statusBadge={{ text: warningCount > 0 ? "Perhatian" : "Nihil", color: "amber" }}
          subtitle="Percobaan login atau gagal akses"
          progressBar={{ value: Math.min(100, warningCount * 25), color: "bg-amber-500" }}
          onClick={() => setLevel('warning')}
        />
        <StatScoreCard
          title="MUTASI KRITIS (DANGER)"
          value={dangerCount}
          icon={Shield}
          statusBadge={{ text: dangerCount > 0 ? "Insiden" : "Aman", color: dangerCount > 0 ? "red" : "emerald" }}
          subtitle="Penghapusan tenant/user platform"
          progressBar={{ value: Math.min(100, dangerCount * 30), color: dangerCount > 0 ? "bg-red-500" : "bg-emerald-500" }}
          onClick={() => setLevel('danger')}
        />
      </div>

      {/* ── Unified Table Card Container ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2.5 items-center flex-wrap flex-1 min-w-[260px]">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="input-search-logs"
                className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all"
                placeholder="Cari aktivitas, pengguna, IP..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              id="log-filter-select"
              className="h-[38px] rounded-xl px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              value={level} 
              onChange={e => setLevel(e.target.value)}
            >
              <option value="all">Semua Level</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filtered.length}</span> log
          </div>
        </div>

        {/* Table View */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu Kejadian</th>
                <th>Aktor / Pelaku</th>
                <th>Tingkat Keparahan</th>
                <th>Aksi Dilakukan</th>
                <th>Objek Target</th>
                <th>Alamat IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Memuat log aktivitas &amp; audit...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText size={32} className="opacity-40" />
                      <span className="text-xs">Tidak ada log aktivitas yang cocok dengan filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map(log => {
                  const LevelIcon = LEVEL_ICON[log.level] || Info;
                  return (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap">
                        <code className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                          {log.time}
                        </code>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            log.user === 'System'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40'
                          }`}>
                            {log.user === 'System' ? <Settings size={13} /> : log.user.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                            {log.user}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${LEVEL_BADGE[log.level] || 'badge-secondary'} inline-flex items-center gap-1.5`}>
                          <LevelIcon size={12} />
                          <span className="capitalize">{log.level}</span>
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 font-mono">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {log.target}
                      </td>
                      <td>
                        <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                          {log.ip || '-'}
                        </code>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <SaasPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>
    </div>
  )
}
