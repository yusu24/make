import React, { useState, useEffect } from 'react'
import {
  Database, Calendar, Mail, Download, Send,
  CheckCircle2, AlertCircle, FileSpreadsheet, FileCode,
  Fish, Layers, BarChart2, ShieldCheck,
  Archive, FlaskConical, HeartPulse, CreditCard
} from 'lucide-react'
import { api } from '../../../lib/api'
import '../budidaya.css'

const CATEGORIES = [
  {
    icon: Layers,
    title: 'Kolam & Tambak',
    desc: 'Daftar kolam, kapasitas, volume, lokasi, dan status operasional.',
    iconBg: '#e0f2fe', iconColor: '#0369a1',
  },
  {
    icon: Fish,
    title: 'Siklus Budidaya',
    desc: 'Riwayat siklus tebar, spesies, jumlah tebar, berat awal, dan status.',
    iconBg: '#dcfce7', iconColor: '#15803d',
  },
  {
    icon: Archive,
    title: 'Data Panen',
    desc: 'Tanggal panen, bobot hasil, harga/kg, total nilai, dan tipe panen.',
    iconBg: '#fef9c3', iconColor: '#a16207',
  },
  {
    icon: FlaskConical,
    title: 'Jadwal & Log Pakan',
    desc: 'Jenis pakan, kuantitas pemberian (kg), FCR, dan petugas sesi.',
    iconBg: '#f3e8ff', iconColor: '#7c3aed',
  },
  {
    icon: HeartPulse,
    title: 'Log Kesehatan',
    desc: 'Kondisi kolam, mortalitas, gejala klinis, dan riwayat perawatan.',
    iconBg: '#fee2e2', iconColor: '#dc2626',
  },
  {
    icon: Database,
    title: 'Inventaris & Pakan',
    desc: 'Stok pakan, obat-obatan, peralatan, valuasi aset, minimum stok.',
    iconBg: '#e0e7ff', iconColor: '#4338ca',
  },
  {
    icon: CreditCard,
    title: 'Keuangan & Pengeluaran',
    desc: 'Biaya operasional, kategori beban biaya, dan pengeluaran per siklus.',
    iconBg: '#dcfce7', iconColor: '#16a34a',
  },
  {
    icon: BarChart2,
    title: 'Profil & Pengaturan Farm',
    desc: 'Nama peternakan, komoditas, mode tracking, dan konfigurasi sistem.',
    iconBg: '#f1f5f9', iconColor: '#475569',
  },
]

export default function BudidayaBackup() {
  const [loading, setLoading]         = useState(true)
  const [backup, setBackup]           = useState({
    auto_backup_enabled:   false,
    auto_backup_frequency: 'weekly',
    auto_backup_format:    'excel',
    auto_backup_email:     '',
    last_auto_backup_at:   null,
  })
  const [emailInput,  setEmailInput]  = useState('')
  const [manualEmail, setManualEmail] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [emailing,    setEmailing]    = useState(null)

  useEffect(() => { fetchSettings() }, [])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchSettings = async () => {
    try {
      const res = await api.get('/budidaya/settings/backup/config')
      if (res.data?.success) {
        setBackup(res.data.data)
        setEmailInput(res.data.data.auto_backup_email || '')
        setManualEmail(res.data.data.auto_backup_email || '')
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan backup:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post('/budidaya/settings/backup/config', {
        ...backup,
        auto_backup_email: emailInput,
      })
      if (res.data?.success) {
        setBackup(res.data.data)
        showToast('success', 'Pengaturan backup otomatis berhasil disimpan!')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Gagal menyimpan pengaturan.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async (fmt) => {
    setDownloading(fmt)
    try {
      const res  = await api.get(`/budidaya/settings/backup/download?format=${fmt}`, { responseType: 'blob' })
      const ext  = fmt === 'json' ? 'json' : 'xlsx'
      const mime = fmt === 'json'
        ? 'application/json'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: mime }))
      const a    = document.createElement('a')
      a.href     = url
      a.download = `backup_budidaya_${new Date().toISOString().slice(0, 10)}.${ext}`
      a.click()
      window.URL.revokeObjectURL(url)
      showToast('success', `File backup ${fmt.toUpperCase()} berhasil diunduh!`)
    } catch {
      showToast('error', 'Gagal mengunduh file backup.')
    } finally {
      setDownloading(null)
    }
  }

  const handleEmailBackup = async (fmt) => {
    const target = manualEmail || emailInput
    if (!target) { showToast('error', 'Masukkan alamat email tujuan terlebih dahulu.'); return }
    setEmailing(fmt)
    try {
      const res = await api.post('/budidaya/settings/backup/email', { email: target, format: fmt })
      if (res.data?.success) showToast('success', res.data.message)
      else throw new Error(res.data?.message)
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Gagal mengirim email backup.')
    } finally {
      setEmailing(null)
    }
  }

  if (loading) {
    return (
      <div className="aq-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid #E2E8F0', borderTopColor: '#1B4332',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Memuat pengaturan backup...</p>
      </div>
    )
  }

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  }

  const inputStyle = {
    width: '100%', padding: '9px 13px', borderRadius: '8px',
    border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", boxSizing: 'border-box', color: '#0f172a',
    background: '#ffffff',
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '4px',
    display: 'block',
  }

  const sectionHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '16px 20px', borderBottom: '1px solid #E2E8F0',
    background: '#F8FAFC',
  }

  return (
    <div className="aq-container" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', borderRadius: 10, marginBottom: 20,
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#15803d' : '#dc2626',
        }}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            : <AlertCircle  size={16} style={{ flexShrink: 0 }} />}
          <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>

        {/* ── LEFT: JADWAL OTOMATIS ── */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Calendar size={17} style={{ color: '#1B4332' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#0f172a' }}>Jadwal Backup Otomatis</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>Kirim cadangan data ke email secara terjadwal</div>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ padding: '20px' }}>

            {/* Toggle */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: backup.auto_backup_enabled ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${backup.auto_backup_enabled ? '#BBF7D0' : '#E2E8F0'}`,
              borderRadius: 10, padding: '12px 14px', marginBottom: 16,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>Status Backup Otomatis</div>
                <div style={{ fontSize: '11.5px', color: backup.auto_backup_enabled ? '#16a34a' : '#64748b', marginTop: 2 }}>
                  {backup.auto_backup_enabled ? '● Sistem backup aktif' : '○ Backup otomatis nonaktif'}
                </div>
              </div>
              <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: 42, height: 24, flexShrink: 0 }}>
                <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }}
                  checked={backup.auto_backup_enabled}
                  onChange={e => setBackup(b => ({ ...b, auto_backup_enabled: e.target.checked }))} />
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: 9999,
                  background: backup.auto_backup_enabled ? '#1B4332' : '#CBD5E1',
                  transition: 'background 0.2s', cursor: 'pointer',
                }}>
                  <span style={{
                    position: 'absolute', top: 3, left: backup.auto_backup_enabled ? 21 : 3,
                    width: 18, height: 18, borderRadius: 9999, background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </span>
              </label>
            </div>

            {/* Frekuensi — hanya tampil saat aktif */}
            {backup.auto_backup_enabled && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Frekuensi Pengiriman</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    ['daily',   'Harian',   'Pukul 02:00'],
                    ['weekly',  'Mingguan', 'Tiap 7 Hari'],
                    ['monthly', 'Bulanan',  'Akhir Bulan'],
                  ].map(([val, label, hint]) => {
                    const active = backup.auto_backup_frequency === val
                    return (
                      <div key={val} onClick={() => setBackup(b => ({ ...b, auto_backup_frequency: val }))}
                        style={{
                          padding: '9px 6px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                          border: `1.5px solid ${active ? '#1B4332' : '#CBD5E1'}`,
                          background: active ? '#F0FDF4' : '#ffffff',
                          transition: 'all 0.15s',
                        }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: active ? '#1B4332' : '#334155' }}>{label}</div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: 1 }}>{hint}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Format */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Format File Backup</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['excel', 'Excel (.xlsx)', 'MS Excel / Spreadsheets', '#16a34a', FileSpreadsheet],
                  ['json',  'JSON (.json)',  'Restore / Sinkronisasi API', '#2563eb', FileCode],
                ].map(([val, label, hint, color, Icon]) => {
                  const active = backup.auto_backup_format === val
                  return (
                    <div key={val} onClick={() => setBackup(b => ({ ...b, auto_backup_format: val }))}
                      style={{
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${active ? '#1B4332' : '#CBD5E1'}`,
                        background: active ? '#F0FDF4' : '#ffffff',
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        transition: 'all 0.15s',
                      }}>
                      <Icon size={16} style={{ color, marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: active ? '#1B4332' : '#0f172a' }}>{label}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 1 }}>{hint}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Penerima Backup Terjadwal</label>
              <input type="email" required value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="owner@farmbudidaya.com"
                style={inputStyle} />
            </div>

            {/* Last backup info */}
            {backup.last_auto_backup_at && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 8, marginBottom: 16,
                background: '#F0FDF4', border: '1px solid #BBF7D0',
              }}>
                <CheckCircle2 size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: '11.5px', color: '#15803d' }}>
                  <strong>Backup terakhir:</strong>{' '}
                  {new Date(backup.last_auto_backup_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                </span>
              </div>
            )}

            <button type="submit" disabled={saving}
              style={{
                width: '100%', height: '38px', borderRadius: 8, border: 'none',
                background: saving ? '#94a3b8' : '#1B4332',
                color: '#fff', fontWeight: 600, fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan Backup'}
            </button>
          </form>
        </div>

        {/* ── RIGHT: BACKUP MANUAL + TIPS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Manual Backup Card */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E8F5ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Download size={17} style={{ color: '#1B4332' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#0f172a' }}>Backup Manual (Instan)</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>Unduh langsung atau kirim via email sekarang</div>
              </div>
            </div>

            <div style={{ padding: 20 }}>

              {/* Unduh */}
              <label style={{ ...labelStyle, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={13} style={{ color: '#2563eb' }} /> Unduh Langsung ke Perangkat
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {[
                  ['excel', 'Unduh Excel (.xlsx)', FileSpreadsheet, '#16a34a'],
                  ['json',  'Unduh JSON (.json)',  FileCode,        '#2563eb'],
                ].map(([fmt, label, Icon, ic]) => (
                  <button key={fmt} onClick={() => handleDownload(fmt)} disabled={!!downloading}
                    style={{
                      padding: '8px 12px', borderRadius: 8, cursor: downloading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: '12.5px', fontWeight: 600, color: '#334155',
                      background: '#ffffff', border: '1px solid #CBD5E1',
                      opacity: downloading && downloading !== fmt ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}>
                    <Icon size={15} style={{ color: ic }} />
                    {downloading === fmt ? 'Mengunduh...' : label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#E2E8F0', marginBottom: 16 }} />

              {/* Email */}
              <label style={{ ...labelStyle, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} style={{ color: '#16a34a' }} /> Kirim ke Alamat Email Lain
              </label>
              <input type="email" value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                placeholder="contoh: owner@farmbudidaya.com"
                style={{ ...inputStyle, marginBottom: 10 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['excel', 'Kirim Excel (.xlsx)', '#16a34a'],
                  ['json',  'Kirim JSON (.json)',  '#2563eb'],
                ].map(([fmt, label]) => (
                  <button key={fmt} onClick={() => handleEmailBackup(fmt)} disabled={!!emailing}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      background: '#F0FDF4', border: '1px solid #BBF7D0',
                      cursor: emailing ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: '12.5px', fontWeight: 600, color: '#15803d',
                      opacity: emailing && emailing !== fmt ? 0.5 : 1,
                    }}>
                    <Send size={13} />
                    {emailing === fmt ? 'Mengirim...' : label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div style={{
            borderRadius: 16, padding: '16px 20px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid #334155',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={16} style={{ color: '#facc15' }} />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#facc15' }}>Keamanan &amp; Integritas Data</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.7 }}>
              <li>Data farm terisolasi aman — hanya dapat diakses akun bisnis Anda.</li>
              <li>File <strong style={{ color: '#e2e8f0' }}>Excel</strong> memuat 8 sheet lengkap: Kolam, Siklus, Panen, Pakan, Kesehatan, Inventaris, Keuangan &amp; Profil Farm.</li>
              <li>Format <strong style={{ color: '#e2e8f0' }}>JSON</strong> cocok untuk migrasi atau integrasi sistem luar.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── CAKUPAN DATA ── */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Database size={17} style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14.5px', color: '#0f172a' }}>Cakupan Data yang Dicadangkan (8 Kategori)</div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>Semua data operasional budidaya terangkum dalam satu file cadangan</div>
          </div>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} style={{
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid #E2E8F0', background: '#F8FAFC',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: cat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <cat.icon size={16} style={{ color: cat.iconColor }} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginBottom: 2, lineHeight: 1.3 }}>{cat.title}</div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
