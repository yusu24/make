import { useState, useEffect } from 'react'
import {
  Archive,
  Download,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Database,
  Clock,
  RefreshCw
} from '@/constants/icons'
import { api } from '../../../lib/api'
import './Shared.css'

export default function Backups() {
  const [backups, setBackups] = useState([])
  const [totalSizeHuman, setTotalSizeHuman] = useState('0 B')
  const [reachable, setReachable] = useState(true)
  const [connectionError, setConnectionError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  const fetchBackups = () => {
    setLoading(true)
    api.get('/admin/backups')
      .then(r => {
        setBackups(r.data?.data || [])
        setTotalSizeHuman(r.data?.total_size_human || '0 B')
        setReachable(r.data?.reachable ?? true)
        setConnectionError(r.data?.connection_error || null)
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBackups() }, [])

  // Scrolls to top so the status banner is actually visible, matching the
  // same pattern used across the rest of the admin panel's save/action flows.
  const showMsg = (text, type = 'success') => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMsgType(type)
    setMsg(text)
    setTimeout(() => setMsg(''), 5000)
  }

  const handleRunBackup = async () => {
    setRunning(true)
    try {
      await api.post('/admin/backups/run')
      showMsg('Backup berhasil dijalankan!', 'success')
      fetchBackups()
    } catch (err) {
      showMsg('Backup gagal: ' + (err.response?.data?.message || 'Koneksi bermasalah'), 'error')
    } finally {
      setRunning(false)
    }
  }

  const handleDownload = async (backup) => {
    setDownloadingFile(backup.filename)
    try {
      const res = await api.get('/admin/backups/download', {
        params: { disk: backup.disk, filename: backup.filename },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = backup.filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      showMsg('Gagal mengunduh backup.', 'error')
    } finally {
      setDownloadingFile(null)
    }
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const newest = backups[0]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Cadangan Data</h2>
      </div>

      {msg && (
        <div
          className={`auth-alert ${msgType === 'success' ? 'auth-alert--success' : 'auth-alert--error'}`}
          style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {msgType === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{msg}</span>
        </div>
      )}

      {!reachable && (
        <div className="auth-alert auth-alert--error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} />
          <span>Tujuan backup tidak bisa diakses{connectionError ? `: ${connectionError}` : '.'}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#6366f118', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Archive size={22} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{backups.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Jumlah File Backup</div>
          </div>
        </div>
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#10b98118', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HardDrive size={22} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{totalSizeHuman}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Total Ukuran Disk</div>
          </div>
        </div>
        <div className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f59e0b18', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {newest ? formatDate(newest.date) : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Backup Terbaru</div>
          </div>
        </div>
      </div>

      {/* Toolbar Aksi */}
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Terjadwal otomatis setiap hari pukul <strong>03:00 WIB</strong>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleRunBackup} disabled={running} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {running ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Menjalankan...</> : <><Archive size={14} /> Jalankan Backup Sekarang</>}
        </button>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Disk</th>
              <th>Nama File</th>
              <th>Ukuran</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                  <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></span>
                </td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Belum ada backup. Klik "Backup Sekarang" untuk membuat yang pertama.
                </td>
              </tr>
            ) : (
              backups.map((b) => (
                <tr key={`${b.disk}-${b.filename}`}>
                  <td>{formatDate(b.date)}</td>
                  <td><span className="badge badge-blue">{b.disk}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.filename}</td>
                  <td>{b.size_human}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownload(b)}
                      disabled={downloadingFile === b.filename}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {downloadingFile === b.filename ? '...' : <><Download size={13} /> Unduh</>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

