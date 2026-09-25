import { useState, useEffect } from 'react'
import {
  Clock,
  Radio,
  Zap,
  AlertTriangle,
  Activity,
  Wrench,
  FileText,
  AlertCircle,
  Info,
  Server
} from '@/constants/icons'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

// ─── Fake real-time metrics ────────────────────────────────────────────────────
function useMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: 34, memory: 58, disk: 42, requests: 127,
    uptime: '14d 6h 32m', latency: 82, errors: 2,
  })
  useEffect(() => {
    const t = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 8)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 4)),
        requests: Math.max(80, Math.min(300, prev.requests + Math.floor((Math.random() - 0.4) * 20))),
        latency: Math.max(40, Math.min(250, prev.latency + (Math.random() - 0.5) * 15)),
      }))
    }, 2000)
    return () => clearInterval(t)
  }, [])
  return metrics
}

// ─── Gauge / progress bar ─────────────────────────────────────────────────────
function Gauge({ value, label, color, unit = '%' }) {
  const pct = Math.min(100, Math.max(0, value))
  const statusColor = pct > 80 ? '#ef4444' : pct > 60 ? '#f59e0b' : color
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: statusColor }}>{Math.round(pct)}{unit}</span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, width: `${pct}%`,
          background: `linear-gradient(90deg, ${statusColor}80, ${statusColor})`,
          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ values, color }) {
  const max = Math.max(...values, 1)
  const w = 80, h = 28
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const DUMMY_SERVICES = [
  { name: 'API Backend', status: 'operational', latency: 78, uptime: '99.98%' },
  { name: 'Database (MySQL)', status: 'operational', latency: 12, uptime: '99.99%' },
  { name: 'Redis Cache', status: 'operational', latency: 2, uptime: '100%' },
  { name: 'File Storage', status: 'degraded', latency: 340, uptime: '98.72%' },
  { name: 'Email Service', status: 'operational', latency: 95, uptime: '99.85%' },
  { name: 'Payment Gateway', status: 'operational', latency: 210, uptime: '99.91%' },
]

const DUMMY_LOGS = [
  { level: 'error', message: 'File upload timeout on tenant TN-005', time: '2 menit lalu' },
  { level: 'warn', message: 'Memory usage exceeded 80% threshold', time: '12 menit lalu' },
  { level: 'info', message: 'Scheduled backup completed successfully', time: '1 jam lalu' },
  { level: 'info', message: 'New tenant TN-012 registered', time: '2 jam lalu' },
  { level: 'error', message: 'Payment webhook failed for INV-2026050016', time: '3 jam lalu' },
  { level: 'info', message: 'Database migration executed: add_promo_fields', time: '5 jam lalu' },
]

const LOG_COLOR = { error: '#ef4444', warn: '#f59e0b', info: '#3b82f6' }
const LOG_ICON_COMP = { error: AlertCircle, warn: AlertTriangle, info: Info }
const SVC_STATUS = { operational: { label: 'Operational', badge: 'badge-green' }, degraded: { label: 'Degraded', badge: 'badge-yellow' }, down: { label: 'Down', badge: 'badge-red' } }

export default function SystemMonitoring() {
  const metrics = useMetrics()
  const [cpuHistory] = useState(() => Array.from({ length: 20 }, () => 20 + Math.random() * 50))
  const [memHistory] = useState(() => Array.from({ length: 20 }, () => 40 + Math.random() * 30))

  return (
    <div className="animate-fade-in">
      {/* ── Live Status Toolbar ── */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Metrik server, performa REST API, dan status latency diperbarui realtime secara otomatis.
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Live Monitoring Aktif</span>
        </div>
      </div>

      {/* ── Top Stats with StatScoreCard ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatScoreCard
          title="Server Uptime"
          value={metrics.uptime}
          status="99.98% SLA"
          statusVariant="emerald"
          icon={Clock}
          desc="Server aktif stabil tanpa downtime"
          progress={99}
          progressVariant="emerald"
        />

        <StatScoreCard
          title="Throughput API"
          value={`${metrics.requests} /mnt`}
          status="Beban Normal"
          statusVariant="indigo"
          icon={Radio}
          desc="Total request REST API saat ini"
          progress={Math.min(100, Math.round((metrics.requests / 300) * 100))}
          progressVariant="indigo"
        />

        <StatScoreCard
          title="Avg Latency"
          value={`${Math.round(metrics.latency)}ms`}
          status={metrics.latency < 100 ? "Sangat Cepat" : "Stabil"}
          statusVariant={metrics.latency < 100 ? "emerald" : "amber"}
          icon={Zap}
          desc="Response time gateway & backend"
          progress={Math.min(100, Math.max(10, Math.round((1 - metrics.latency / 250) * 100)))}
          progressVariant="emerald"
        />

        <StatScoreCard
          title="Errors (24 Jam)"
          value={metrics.errors}
          status={metrics.errors === 0 ? "Zero Error" : `${metrics.errors} Minor`}
          statusVariant={metrics.errors === 0 ? "emerald" : "amber"}
          icon={AlertTriangle}
          desc="Anomali request exception terdeteksi"
          progress={Math.max(0, 100 - metrics.errors * 20)}
          progressVariant="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* ── Resource Usage ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 m-0">
              <Server size={18} className="text-indigo-600 dark:text-indigo-400" />
              Resource Usage
            </h3>
            <span className="text-[11px] text-slate-400">Update berkala realtime</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Pantau beban CPU, RAM, serta kapasitas penyimpanan lokal server hosting.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <Gauge value={metrics.cpu} label="CPU Core" color="#3b82f6" />
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-slate-400">Tren (30 detik):</span>
                <Sparkline values={[...cpuHistory, metrics.cpu]} color="#3b82f6" />
              </div>
            </div>
            <div>
              <Gauge value={metrics.memory} label="Memory (RAM)" color="#8b5cf6" />
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-slate-400">Tren (30 detik):</span>
                <Sparkline values={[...memHistory, metrics.memory]} color="#8b5cf6" />
              </div>
            </div>
            <div>
              <Gauge value={metrics.disk} label="Disk Usage (SSD)" color="#10b981" />
            </div>
          </div>
        </div>

        {/* ── Service Status ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 m-0">
              <Wrench size={18} className="text-amber-500" />
              Status Layanan Ekosistem
            </h3>
            <span className="text-[11px] text-slate-400">6 Sub-layanan</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Status operasional subsistem backend, database cache, dan layanan eksternal.
          </p>
          <div className="flex flex-col gap-2.5">
            {DUMMY_SERVICES.map(svc => (
              <div key={svc.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-xs text-slate-800 dark:text-slate-100 m-0">{svc.name}</p>
                  <p className="text-[11px] text-slate-400 m-0 mt-0.5">Latency: {svc.latency}ms · Uptime: {svc.uptime}</p>
                </div>
                <span className={`badge ${SVC_STATUS[svc.status].badge}`}>
                  {SVC_STATUS[svc.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Server Logs ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 m-0">
            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
            Log Sistem Terbaru
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 m-0">
            Catatan log kejadian, warning, dan error sistem untuk mempermudah audit operasional.
          </p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {DUMMY_LOGS.map((log, i) => {
            const LogIcon = LOG_ICON_COMP[log.level] || Info;
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <span className="shrink-0 mt-0.5" style={{ color: LOG_COLOR[log.level] }}>
                  <LogIcon size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 m-0">{log.message}</p>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{log.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

