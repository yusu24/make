import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'

const DUMMY_LOGS = [
  { id:1, user:'Super Admin',  action:'login',          target:'System',                   ip:'127.0.0.1', time:'2026-04-10 21:35:12', level:'info' },
  { id:2, user:'Super Admin',  action:'create_user',    target:'User: Ahmad Suharto',      ip:'127.0.0.1', time:'2026-04-10 20:10:05', level:'success' },
  { id:3, user:'Rizka Amalia', action:'edit_category',  target:'Kategori: Toko Retail',    ip:'192.168.1.5',time:'2026-04-10 18:44:30',level:'info' },
  { id:4, user:'System',       action:'failed_login',   target:'Email: unknown@test.com',  ip:'203.0.113.1',time:'2026-04-10 17:22:01',level:'warning' },
  { id:5, user:'Super Admin',  action:'delete_tenant',  target:'Tenant: TN-009',           ip:'127.0.0.1', time:'2026-04-10 15:01:55', level:'danger' },
  { id:6, user:'Farid Salim',  action:'view_tenants',   target:'Tenant List',              ip:'10.0.0.2',  time:'2026-04-10 14:30:00', level:'info' },
  { id:7, user:'System',       action:'email_verified', target:'User: Siti Rahayu',        ip:'-',         time:'2026-04-10 13:11:22', level:'success' },
  { id:8, user:'Super Admin',  action:'toggle_category',target:'Kategori: Manufaktur',     ip:'127.0.0.1', time:'2026-04-10 12:05:48', level:'warning' },
]

const LEVEL_BADGE = { info:'badge-blue', success:'badge-green', warning:'badge-yellow', danger:'badge-red' }
const LEVEL_ICON  = { info:'ℹ', success:'✓', warning:'⚠', danger:'✗' }

export default function ActivityLogs() {
  const [logs, setLogs]       = useState(DUMMY_LOGS)
  const [search, setSearch]   = useState('')
  const [level, setLevel]     = useState('all')

  useEffect(() => {
    api.get('/logs').then(r => setLogs(r.data?.data || DUMMY_LOGS)).catch(() => {})
  }, [])

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.target.toLowerCase().includes(q)
    const matchLevel = level === 'all' || l.level === level
    return matchSearch && matchLevel
  })

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Activity Log</h2>
          <p className="page-sub">Riwayat aktivitas di platform UMKM SaaS</p>
        </div>
        <button id="btn-export-logs" className="btn btn-secondary">⬇ Export Log</button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input id="input-search-logs" className="form-input search-input" placeholder="Cari aktivitas..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['all','info','success','warning','danger'].map(f => (
            <button key={f} id={`log-filter-${f}`}
              className={`filter-tab ${level===f?'filter-tab--active':''}`}
              onClick={() => setLevel(f)}
            >
              {LEVEL_ICON[f] || '⊞'} {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        {/* Timeline style logs */}
        <div style={{display:'flex', flexDirection:'column'}}>
          {filtered.map((log, i) => (
            <div key={log.id} style={{
              display:'flex', gap:16,
              padding:'16px 20px',
              borderBottom: i < filtered.length-1 ? '1px solid var(--border-subtle)' : 'none',
              transition:'background 0.15s'
            }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
            onMouseLeave={e=>e.currentTarget.style.background=''}
            >
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, fontWeight:700,
                background: log.level==='info'    ? 'rgba(59,130,246,0.15)'  :
                            log.level==='success' ? 'rgba(16,185,129,0.15)'  :
                            log.level==='warning' ? 'rgba(245,158,11,0.15)'  :
                                                    'rgba(239,68,68,0.15)',
                color: log.level==='info'    ? '#60a5fa' :
                       log.level==='success' ? '#34d399' :
                       log.level==='warning' ? '#fbbf24' : '#f87171',
              }}>
                {LEVEL_ICON[log.level]}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:4}}>
                  <span style={{fontWeight:600, fontSize:13, color:'var(--text-primary)'}}>{log.user}</span>
                  <span className={`badge ${LEVEL_BADGE[log.level]}`} style={{fontSize:10}}>{log.action.replace(/_/g,' ')}</span>
                </div>
                <p style={{fontSize:12, color:'var(--text-secondary)', marginBottom:2}}>{log.target}</p>
                <div style={{display:'flex', gap:16}}>
                  <span style={{fontSize:11, color:'var(--text-muted)'}}>🕐 {log.time}</span>
                  <span style={{fontSize:11, color:'var(--text-muted)'}}>📡 {log.ip}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{padding:60, textAlign:'center', color:'var(--text-muted)'}}>
              Tidak ada log ditemukan
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
