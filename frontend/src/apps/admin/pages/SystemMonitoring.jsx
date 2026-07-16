import { useState, useEffect } from 'react'
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
const LOG_ICON = { error: '🔴', warn: '🟡', info: '🔵' }
const SVC_STATUS = { operational: { label: 'Operational', badge: 'badge-green' }, degraded: { label: 'Degraded', badge: 'badge-yellow' }, down: { label: 'Down', badge: 'badge-red' } }

export default function SystemMonitoring() {
  const metrics = useMetrics()
  const [cpuHistory] = useState(() => Array.from({ length: 20 }, () => 20 + Math.random() * 50))
  const [memHistory] = useState(() => Array.from({ length: 20 }, () => 40 + Math.random() * 30))

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">System Monitoring</h2>
          <p className="page-sub">Pantau kesehatan server, performa API, dan status layanan secara real-time.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Live Monitoring</span>
        </div>
      </div>

      {/* ── Top Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Uptime', value: metrics.uptime, icon: '⏱', color: '#10b981', desc: 'Lama server aktif' },
          { label: 'Req / Menit', value: metrics.requests, icon: '📡', color: '#3b82f6', desc: 'Total request API saat ini' },
          { label: 'Avg Latency', value: `${Math.round(metrics.latency)}ms`, icon: '⚡', color: '#8b5cf6', desc: 'Kecepatan respon server' },
          { label: 'Errors (24j)', value: metrics.errors, icon: '⚠️', color: '#ef4444', desc: 'Kegagalan sistem terdeteksi' },
        ].map(card => (
          <div key={card.label} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.color + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: card.color, flexShrink: 0
              }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{card.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>{card.desc}</div>
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: card.color, lineHeight: 1 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* ── Resource Usage ── */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>🖥️ Resource Usage</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Update setiap 2 detik</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Pantau beban CPU, RAM, serta kapasitas penyimpanan lokal server hosting.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <Gauge value={metrics.cpu} label="CPU Core" color="#3b82f6" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tren (30 detik):</span>
                <Sparkline values={[...cpuHistory, metrics.cpu]} color="#3b82f6" />
              </div>
            </div>
            <div>
              <Gauge value={metrics.memory} label="Memory (RAM)" color="#8b5cf6" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tren (30 detik):</span>
                <Sparkline values={[...memHistory, metrics.memory]} color="#8b5cf6" />
              </div>
            </div>
            <div>
              <Gauge value={metrics.disk} label="Disk Usage (SSD)" color="#10b981" />
            </div>
          </div>
        </div>

        {/* ── Service Status ── */}
        <div className="card card-pad">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>🔧 Status Layanan</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Status operasional subsistem backend, database cache, dan layanan eksternal.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DUMMY_SERVICES.map(svc => (
              <div key={svc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{svc.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Latency: {svc.latency}ms · Uptime: {svc.uptime}</p>
                </div>
                <span className={`badge ${SVC_STATUS[svc.status].badge}`}>{SVC_STATUS[svc.status].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Logs ── */}
      <div className="card card-pad" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>📋 Log Sistem Terbaru</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Catatan log kejadian, warning, dan error sistem untuk mempermudah audit operasional.
          </p>
        </div>
        <div style={{ padding: '12px 0' }}>
          {DUMMY_LOGS.map((log, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 24px',
              borderBottom: i < DUMMY_LOGS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{LOG_ICON[log.level]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{log.message}</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
