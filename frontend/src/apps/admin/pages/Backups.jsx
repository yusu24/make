import { useState, useEffect } from 'react'
import {
  Archive,
  Download,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Database,
  Clock,
  RefreshCw,
  Play
} from '@/constants/icons'
import { api } from '../../../lib/api'
import './Shared.css'
import StatScoreCard from '@/components/ui/StatScoreCard'

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
      showMsg('Backup berhasil dijalankan dan disimpan ke storage!', 'success')
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
    <div className="animate-fade-in space-y-6">
      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchBackups}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang daftar backup"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
        <button
          onClick={handleRunBackup}
          disabled={running}
          className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          {running ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Memproses Backup...</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              <span>Jalankan Backup Sekarang</span>
            </>
          )}
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
          msgType === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
        }`}>
          {msgType === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{msg}</span>
        </div>
      )}

      {!reachable && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-xs font-semibold">
          <AlertTriangle size={16} />
          <span>Tujuan backup tidak bisa diakses{connectionError ? `: ${connectionError}` : '.'} Pastikan izin write folder atau bucket S3 valid.</span>
        </div>
      )}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatScoreCard
          title="TOTAL ARSIP"
          value={backups.length}
          icon={Archive}
          statusBadge={{ text: backups.length > 0 ? "Tersedia" : "Kosong", color: "blue" }}
          subtitle="File snapshot terverifikasi"
          progressBar={{ value: Math.min(100, Math.max(10, backups.length * 15)), color: "bg-blue-500" }}
        />
        <StatScoreCard
          title="TOTAL UKURAN DISK"
          value={totalSizeHuman}
          icon={HardDrive}
          statusBadge={{ text: "Optimal", color: "emerald" }}
          subtitle="Kapasitas penyimpanan terpakai"
          progressBar={{ value: 45, color: "bg-emerald-500" }}
        />
        <StatScoreCard
          title="STATUS STORAGE"
          value={reachable ? "Online" : "Offline"}
          icon={Database}
          statusBadge={{ text: reachable ? "Tersambung" : "Gagal", color: reachable ? "emerald" : "red" }}
          subtitle="Konektivitas driver target disk"
          progressBar={{ value: reachable ? 100 : 0, color: reachable ? "bg-emerald-500" : "bg-red-500" }}
        />
        <StatScoreCard
          title="SNAPSHOT TERBARU"
          value={newest ? formatDate(newest.date).split(' ')[1] : "—"}
          icon={Clock}
          statusBadge={{ text: newest ? "Terkini" : "Belum Ada", color: "amber" }}
          subtitle={newest ? formatDate(newest.date).split(' ')[0] : "Otomatis setiap 03:00"}
          progressBar={{ value: 100, color: "bg-amber-500" }}
        />
      </div>

      {/* ── Backup Table Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Archive size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
              Riwayat Snapshot &amp; Cadangan Tersimpan
            </span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
              {backups.length} file
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Jadwal: Harian 03:00 WIB • Retensi 30 Hari
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu Cadangan</th>
                <th>Target Disk</th>
                <th>Nama File Snapshot</th>
                <th>Ukuran</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Memeriksa repositori backup...</span>
                    </div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Archive size={32} className="opacity-40" />
                      <span className="text-xs">Belum ada file backup. Klik "Jalankan Backup Sekarang" untuk membuat arsip baru.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={`${b.disk}-${b.filename}`}>
                    <td className="font-medium text-xs text-slate-800 dark:text-slate-200">{formatDate(b.date)}</td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
                        {b.disk}
                      </span>
                    </td>
                    <td>
                      <code className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {b.filename}
                      </code>
                    </td>
                    <td className="text-xs font-semibold text-slate-700 dark:text-slate-300">{b.size_human}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDownload(b)}
                        disabled={downloadingFile === b.filename}
                        className="h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                        title="Unduh file snapshot ke komputer"
                      >
                        {downloadingFile === b.filename ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Mengunduh...</span>
                          </>
                        ) : (
                          <>
                            <Download size={13} />
                            <span>Unduh</span>
                          </>
                        )}
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
