import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import usePagination from '../../../hooks/usePagination'
import SaasPagination from '../../../components/SaasPagination'
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
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✗',
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
    <div>
      <div className="page-header">
        <h2 className="page-title">Log Aktivitas &amp; Audit</h2>
      </div>

      {/* Table Card Container */}
      <div className="card card-pad table-card" style={{ padding: 0, boxShadow: 'none', transform: 'none', transition: 'none' }}>
        
        {/* Toolbar Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="search-wrap" style={{ minWidth: 220, maxWidth: 320, flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input
                id="input-search-logs"
                className="form-input search-input"
                placeholder="Cari aktivitas, pengguna, IP..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 150 }}>
                <select 
                  id="log-filter-select"
                  className="form-input" 
                  value={level} 
                  onChange={e => setLevel(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    height: 38
                  }}
                >
                  <option value="all">Semua Level</option>
                  <option value="info">ℹ Info</option>
                  <option value="success">✓ Success</option>
                  <option value="warning">⚠ Warning</option>
                  <option value="danger">✗ Danger</option>
                </select>
              </div>
              <button 
                id="btn-refresh-logs" 
                className="btn btn-secondary btn-sm" 
                style={{ height: 38 }}
                onClick={fetchLogs}
                disabled={loading}
              >
                🔄 Refresh
              </button>
              <button id="btn-export-logs" className="btn btn-secondary btn-sm" style={{ height: 38 }}>
                ⬇ Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pengguna</th>
                <th>Level</th>
                <th>Aksi</th>
                <th>Detail / Target</th>
                <th>Alamat IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Memuat log aktivitas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Tidak ada log aktivitas yang cocok
                  </td>
                </tr>
              ) : (
                paginatedData.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 12.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                      <code style={{ fontSize: 12, color: 'var(--text-primary)', background: '#f1f5f9', padding: '3px 7px', borderRadius: 4 }}>
                        {log.time}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: log.user === 'System' ? '#f1f5f9' : '#eaeaff',
                          color: log.user === 'System' ? '#64748b' : '#696cff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 11
                        }}>
                          {log.user === 'System' ? '⚙' : log.user.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13, color: '#32475c' }}>
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${LEVEL_BADGE[log.level] || 'badge-secondary'}`}>
                        {LEVEL_ICON[log.level]} {log.level}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ textTransform: 'none', fontWeight: 600 }}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {log.target}
                    </td>
                    <td>
                      <code style={{ fontSize: 11.5, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                        {log.ip || '-'}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

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
    </div>
  )
}
