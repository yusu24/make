import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Zap,
  Send,
  Save,
  RefreshCw,
  Copy,
  Check,
  Eye
} from '@/constants/icons'
import StatScoreCard from '@/components/ui/StatScoreCard'
import './Shared.css'

const SCHEDULE_TABS = [
  { key: 'h7',      badge: 'H-7',       label: 'Pemberitahuan Awal',    sub: '7 hari sebelum jatuh tempo', icon: Clock,          color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  { key: 'h3',      badge: 'H-3',       label: 'Peringatan Kedua',      sub: '3 hari sebelum jatuh tempo', icon: Bell,           color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  { key: 'h0',      badge: 'Hari H',    label: 'Batas Akhir Hari Ini',  sub: 'Saat tanggal jatuh tempo',   icon: AlertTriangle,  color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { key: 'overdue', badge: 'Overdue',   label: 'Masa Tenggang & Suspend',sub: 'Setelah lewat jatuh tempo', icon: ShieldAlert,    color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
]

const VARIABLE_TAGS = [
  { tag: '{owner_name}',  label: 'Nama Pemilik', sample: 'Ahmad Suharto' },
  { tag: '{tenant_name}', label: 'Nama Usaha',   sample: 'Toko Berkah Sejahtera' },
  { tag: '{tenant_id}',   label: 'ID Tenant',    sample: 'TN-001' },
  { tag: '{plan_name}',   label: 'Paket Usaha',  sample: 'Pro (Bulanan)' },
  { tag: '{amount}',      label: 'Nominal Tagihan', sample: '299.000' },
  { tag: '{due_date}',    label: 'Tanggal Jatuh Tempo', sample: '30 Agustus 2026' },
  { tag: '{days_left}',   label: 'Sisa Hari',    sample: '7' },
  { tag: '{bank_info}',   label: 'Rekening Bank',sample: 'Bank Mandiri (123-00-9988776-5) a.n. PT BIZORA' },
]

export default function SubscriptionReminders() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('h7')
  const [previewMode, setPreviewMode] = useState('whatsapp') // 'whatsapp' | 'email'
  const [copiedTag, setCopiedTag] = useState(null)
  const [toast, setToast] = useState(null)

  // Test send modal
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testChannel, setTestChannel] = useState('email')
  const [testTarget, setTestTarget] = useState('')
  const [testSchedule, setTestSchedule] = useState('h7')
  const [testSending, setTestSending] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/subscription-reminders')
      if (res.data?.data) {
        setSettings(res.data.data)
      }
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat pengaturan reminder', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/subscription-reminders', settings)
      showToast('Pengaturan Pengingat & Otomasi berhasil disimpan!')
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan pengaturan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(null), 1500)
  }

  const handleTestSend = async (e) => {
    e.preventDefault()
    if (!testTarget) {
      showToast('Tujuan pengiriman tidak boleh kosong', 'error')
      return
    }
    setTestSending(true)
    try {
      const res = await api.post('/admin/subscription-reminders/test', {
        channel: testChannel,
        target: testTarget,
        schedule_key: testSchedule,
      })
      showToast(res.data?.message || 'Uji coba berhasil dikirim!')
      setTestModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast('Gagal mengirim pesan uji coba', 'error')
    } finally {
      setTestSending(false)
    }
  }

  const currentReminder = settings?.reminders?.[activeTab] || settings?.reminders?.h7 || {}

  const renderPreviewText = (text) => {
    if (!text) return ''
    let out = text
    VARIABLE_TAGS.forEach(v => {
      out = out.split(v.tag).join(v.sample)
    })
    return out
  }

  const activeChannelsCount = settings?.channels ? Object.values(settings.channels).filter(Boolean).length : 0

  return (
    <div className="animate-fade-in space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-white ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang pengaturan"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
          <button
            onClick={() => {
              setTestSchedule(activeTab)
              setTestModalOpen(true)
            }}
            disabled={!settings}
            className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          >
            <Send size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Uji Coba</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !settings}
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
      </div>

      {loading || !settings ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Memuat pengaturan pengingat &amp; otomasi tagihan...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ── KPI Metric Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatScoreCard
              title="OTOMASI MASTER"
              value={settings.is_enabled ? "Aktif Berjalan" : "Dihentikan"}
              icon={Zap}
              statusBadge={{ text: settings.is_enabled ? "Running" : "Paused", color: settings.is_enabled ? "emerald" : "slate" }}
              subtitle="Daemon pengingat harian 08:00"
              progressBar={{ value: settings.is_enabled ? 100 : 0, color: "bg-emerald-500" }}
            />
            <StatScoreCard
              title="SALURAN TERHUBUNG"
              value={`${activeChannelsCount}/3 Saluran`}
              icon={Send}
              statusBadge={{ text: "Email / WA / App", color: "blue" }}
              subtitle="Kanal distribusi notifikasi"
              progressBar={{ value: Math.round((activeChannelsCount / 3) * 100), color: "bg-blue-500" }}
            />
            <StatScoreCard
              title="SIKLUS JADWAL"
              value="4 Siklus"
              icon={Clock}
              statusBadge={{ text: "H-7 s/d Overdue", color: "violet" }}
              subtitle="Eskalasi pengingat tagihan"
              progressBar={{ value: 100, color: "bg-violet-500" }}
            />
            <StatScoreCard
              title="MASA TENGGANG"
              value={`${settings.grace_period_days || 3} Hari`}
              icon={ShieldAlert}
              statusBadge={{ text: "Toleransi", color: "amber" }}
              subtitle="Tenggang sebelum tenant suspend"
              progressBar={{ value: 60, color: "bg-amber-500" }}
            />
          </div>

          {/* ── Master Status & Delivery Channels Card ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-white">
                  Sakelar Utama Mesin Pengingat
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Jika dinonaktifkan, pengiriman notifikasi pengingat otomatis akan dihentikan sementara.
                </p>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_enabled}
                  onChange={e => setSettings(s => ({ ...s, is_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                />
                <span className={`text-xs font-bold ${settings.is_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {settings.is_enabled ? 'OTOMASI AKTIF' : 'NONAKTIF'}
                </span>
              </label>
            </div>

            {/* Channels Toggles */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Saluran Pengiriman Notifikasi (Delivery Channels)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Email Channel */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.channels.email
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={settings.channels.email}
                    onChange={e => setSettings(s => ({ ...s, channels: { ...s.channels, email: e.target.checked } }))}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Otomatis</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Kirim rincian invoice ke email tenant</div>
                  </div>
                </label>

                {/* WhatsApp Channel */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.channels.whatsapp
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={settings.channels.whatsapp}
                    onChange={e => setSettings(s => ({ ...s, channels: { ...s.channels, whatsapp: e.target.checked } }))}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">WhatsApp Notification</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Pesan WA langsung ke pemilik toko</div>
                  </div>
                </label>

                {/* In-App POS Banner */}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.channels.in_app
                    ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={settings.channels.in_app}
                    onChange={e => setSettings(s => ({ ...s, channels: { ...s.channels, in_app: e.target.checked } }))}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Banner Kasir / POS</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Muncul alert bar saat kasir login</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── Schedule Selector Tabs ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCHEDULE_TABS.map(tab => {
              const isSelected = activeTab === tab.key
              const isItemActive = settings.reminders[tab.key]?.active
              return (
                <div
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] font-extrabold"
                        style={{ background: tab.bg, color: tab.color }}
                      >
                        {tab.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {tab.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tab.sub}
                    </div>
                  </div>

                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${isItemActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                    title={isItemActive ? 'Jadwal Aktif' : 'Jadwal Nonaktif'}
                  />
                </div>
              )
            })}
          </div>

          {/* ── Main Workspace: Template Editor (Left) & Realtime Simulator (Right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Template Editor */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-white">
                    Pengaturan Pesan: {currentReminder.title || activeTab.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Kustomisasi teks notifikasi email dan WhatsApp yang dikirimkan pada jadwal ini.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentReminder.active}
                    onChange={e => {
                      const checked = e.target.checked
                      setSettings(s => ({
                        ...s,
                        reminders: {
                          ...s.reminders,
                          [activeTab]: { ...s.reminders[activeTab], active: checked }
                        }
                      }))
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${currentReminder.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {currentReminder.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </label>
              </div>

              {/* Variable Chips Toolbar */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Variabel Dinamis (Klik untuk Salin):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VARIABLE_TAGS.map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleCopyTag(v.tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        copiedTag === v.tag
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={`Contoh isi: ${v.sample}`}
                    >
                      {copiedTag === v.tag ? <Check size={12} /> : <Copy size={12} />}
                      <code className="text-[11px]">{v.tag}</code>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-500" /> Subjek Email Notifikasi
                </label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                  value={currentReminder.subject || ''}
                  onChange={e => {
                    const val = e.target.value
                    setSettings(s => ({
                      ...s,
                      reminders: {
                        ...s.reminders,
                        [activeTab]: { ...s.reminders[activeTab], subject: val }
                      }
                    }))
                  }}
                  placeholder="Subjek email..."
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-500" /> Konten Isi Email (Email Body)
                </label>
                <textarea
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 font-mono resize-y"
                  rows={8}
                  value={currentReminder.email_body || ''}
                  onChange={e => {
                    const val = e.target.value
                    setSettings(s => ({
                      ...s,
                      reminders: {
                        ...s.reminders,
                        [activeTab]: { ...s.reminders[activeTab], email_body: val }
                      }
                    }))
                  }}
                />
              </div>

              {/* WhatsApp Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-emerald-500" /> Pesan WhatsApp (Format WA: *tebal*, _miring_)
                </label>
                <textarea
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 font-mono resize-y"
                  rows={6}
                  value={currentReminder.wa_body || ''}
                  onChange={e => {
                    const val = e.target.value
                    setSettings(s => ({
                      ...s,
                      reminders: {
                        ...s.reminders,
                        [activeTab]: { ...s.reminders[activeTab], wa_body: val }
                      }
                    }))
                  }}
                />
              </div>
            </div>

            {/* RIGHT: Live Preview Simulator */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm lg:sticky lg:top-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Eye size={15} /> Pratinjau Pesan Realtime
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('whatsapp')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewMode === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('email')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewMode === 'email'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      📧 Email
                    </button>
                  </div>
                </div>

                {/* Simulated Output */}
                {previewMode === 'whatsapp' ? (
                  <div className="bg-[#0b141a] rounded-2xl p-4 border border-[#222d34] shadow-xl text-[#e9edef] font-sans">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#222d34] mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#25d366] text-black flex items-center justify-center font-extrabold text-xs">
                        BZ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#e9edef]">BIZORA Official Billing</div>
                        <div className="text-[10px] text-[#8696a0]">Online · Akun Resmi Terverifikasi</div>
                      </div>
                    </div>

                    <div className="bg-[#005c4b] p-3 rounded-2xl rounded-tr-xs text-xs leading-relaxed whitespace-pre-wrap shadow-md text-[#e9edef]">
                      {renderPreviewText(currentReminder.wa_body)}
                      <div className="text-right text-[9px] text-[#8696a0] mt-1.5">
                        10:45 ✓✓
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden text-slate-800 dark:text-slate-200">
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-3 border-b border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-slate-500 dark:text-slate-400">Dari: <strong className="text-slate-800 dark:text-slate-200">billing@bizora.id</strong></div>
                      <div className="text-slate-500 dark:text-slate-400">Kepada: <strong className="text-slate-800 dark:text-slate-200">ahmad@retail.com</strong></div>
                      <div className="font-bold text-slate-900 dark:text-white pt-1">
                        Subjek: {renderPreviewText(currentReminder.subject)}
                      </div>
                    </div>
                    <div className="p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300 max-h-80 overflow-y-auto">
                      {renderPreviewText(currentReminder.email_body)}
                    </div>
                  </div>
                )}

                {/* In-App POS Banner Preview */}
                {settings.channels.in_app && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                    <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                      <Smartphone size={14} /> Simulasi Alert Banner di Kasir (POS):
                    </div>
                    <div className="text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
                      ⚠️ <strong>Pengingat Langganan:</strong> Paket Anda akan berakhir dalam 7 hari ({renderPreviewText('{due_date}')}). <span className="underline font-bold cursor-pointer">Perpanjang Sekarang</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Test Send Modal ── */}
      {testModalOpen && (
        <Modal onClose={() => setTestModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Uji Coba Pengiriman Notifikasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kirimkan simulasi pesan pengingat ke kontak email atau nomor WhatsApp Anda untuk memeriksa tampilan aslinya.
              </p>
            </div>

            <form onSubmit={handleTestSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pilih Jadwal Notifikasi</label>
                <select
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={testSchedule}
                  onChange={e => setTestSchedule(e.target.value)}
                >
                  {SCHEDULE_TABS.map(t => (
                    <option key={t.key} value={t.key}>
                      {t.badge} - {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Saluran Pengiriman</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="testChannel"
                      checked={testChannel === 'email'}
                      onChange={() => setTestChannel('email')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    📧 Email
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="testChannel"
                      checked={testChannel === 'whatsapp'}
                      onChange={() => setTestChannel('whatsapp')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    💬 WhatsApp (Simulasi Log)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {testChannel === 'email' ? 'Alamat Email Tujuan' : 'Nomor WhatsApp Tujuan'}
                </label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                  placeholder={testChannel === 'email' ? 'admin@anda.com' : '081234567890'}
                  value={testTarget}
                  onChange={e => setTestTarget(e.target.value)}
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  className="h-[38px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold"
                  onClick={() => setTestModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
                  disabled={testSending}
                >
                  {testSending ? 'Mengirim...' : 'Kirim Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}
