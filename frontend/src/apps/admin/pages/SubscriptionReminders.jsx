import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import Modal from '../../../components/Modal'
import {
  Bell, Mail, MessageSquare, Smartphone, CheckCircle, AlertTriangle,
  Clock, ShieldAlert, Zap, Send, Save, RefreshCw, Copy, Check, Eye
} from 'lucide-react'
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

  if (loading || !settings) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
        <p>Memuat Pengaturan Pengingat &amp; Otomasi...</p>
      </div>
    )
  }

  const currentReminder = settings.reminders[activeTab] || settings.reminders.h7

  // Helper to render dynamic sample preview
  const renderPreviewText = (text) => {
    if (!text) return ''
    let out = text
    VARIABLE_TAGS.forEach(v => {
      out = out.split(v.tag).join(v.sample)
    })
    return out
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap style={{ color: '#f59e0b' }} size={26} />
          Pengingat &amp; Otomasi Tagihan
        </h2>
      </div>

      {/* ── Master Status & Delivery Channels Card ── */}
      <div className="card" style={{ padding: 20, marginBottom: 24, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: settings.is_enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
              color: settings.is_enabled ? '#10b981' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={22} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Status Otomasi Sistem Pengingat
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {settings.is_enabled
                  ? 'Sistem aktif memeriksa masa aktif tenant dan mengirimkan pengingat secara otomatis setiap hari.'
                  : 'Sistem pengingat saat ini dinonaktifkan (tidak ada pesan yang terkirim).'}
              </div>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.is_enabled}
              onChange={e => setSettings(s => ({ ...s, is_enabled: e.target.checked }))}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: settings.is_enabled ? '#10b981' : 'var(--text-muted)' }}>
              {settings.is_enabled ? 'OTOMASI AKTIF' : 'NONAKTIF'}
            </span>
          </label>
        </div>

        {/* Channels Toggles */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Saluran Pengiriman Notifikasi (Delivery Channels)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {/* Email Channel */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
              background: settings.channels.email ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-elevated)',
              border: `1px solid ${settings.channels.email ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-subtle)'}`,
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.channels.email}
                onChange={e => setSettings(s => ({ ...s, channels: { ...s.channels, email: e.target.checked } }))}
                style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }}
              />
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Email Otomatis</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kirim rincian invoice ke email tenant</div>
              </div>
            </label>

            {/* WhatsApp Channel */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
              background: settings.channels.whatsapp ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
              border: `1px solid ${settings.channels.whatsapp ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.channels.whatsapp}
                onChange={e => setSettings(s => ({ ...s, channels: { ...s.channels, whatsapp: e.target.checked } }))}
                style={{ width: 16, height: 16, accentColor: '#10b981', cursor: 'pointer' }}
              />
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>WhatsApp Notification</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pesan WA langsung ke pemilik toko</div>
              </div>
            </label>

            {/* In-App Banner Channel */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
              background: settings.channels.in_app ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-elevated)',
              border: `1px solid ${settings.channels.in_app ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-subtle)'}`,
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.channels.in_app}
                onChange={e => setSettings(s => ({ ...s, channels: { ...s.channels, in_app: e.target.checked } }))}
                style={{ width: 16, height: 16, accentColor: '#8b5cf6', cursor: 'pointer' }}
              />
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Banner Kasir / POS</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Muncul alert bar saat kasir login</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ── Schedule Selector Tabs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {SCHEDULE_TABS.map(tab => {
          const isSelected = activeTab === tab.key
          const isItemActive = settings.reminders[tab.key]?.active
          const Icon = tab.icon
          return (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                background: isSelected ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                border: `2px solid ${isSelected ? tab.color : 'transparent'}`,
                boxShadow: isSelected ? `0 6px 18px ${tab.color}25` : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                    background: tab.bg, color: tab.color
                  }}>
                    {tab.badge}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {tab.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {tab.sub}
                </div>
              </div>

              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isItemActive ? '#10b981' : '#94a3b8',
                marginTop: 4
              }} title={isItemActive ? 'Jadwal Aktif' : 'Jadwal Nonaktif'} />
            </div>
          )
        })}
      </div>

      {/* ── Main Workspace: Template Editor (Left) & Realtime Simulator (Right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.9fr)', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT: Template Editor */}
        <div className="card" style={{ padding: 22, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Pengaturan Pesan: {currentReminder.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Kustomisasi teks email dan WhatsApp yang dikirimkan pada jadwal ini.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
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
                style={{ width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: currentReminder.active ? '#10b981' : 'var(--text-muted)' }}>
                {currentReminder.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
          </div>

          {/* Variable Chips Toolbar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
              Variabel Dinamis (Klik untuk Salin):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {VARIABLE_TAGS.map(v => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleCopyTag(v.tag)}
                  style={{
                    background: copiedTag === v.tag ? '#10b981' : 'var(--bg-elevated)',
                    color: copiedTag === v.tag ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s'
                  }}
                  title={`Contoh: ${v.sample}`}
                >
                  {copiedTag === v.tag ? <Check size={12} /> : <Copy size={12} />}
                  <code>{v.tag}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Email Subject */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} style={{ color: '#3b82f6' }} /> Subjek Email Notifikasi
            </label>
            <input
              className="form-input"
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
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Email Body */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={14} style={{ color: '#3b82f6' }} /> Konten Isi Email (Email Body)
            </label>
            <textarea
              className="form-input"
              rows={9}
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
              style={{ fontSize: 12, lineHeight: 1.5, fontFamily: 'monospace' }}
            />
          </div>

          {/* WhatsApp Body */}
          <div>
            <label className="form-label" style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={14} style={{ color: '#10b981' }} /> Pesan WhatsApp (Format WA: *tebal*, _miring_)
            </label>
            <textarea
              className="form-input"
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
              style={{ fontSize: 12, lineHeight: 1.5, fontFamily: 'monospace' }}
            />
          </div>
        </div>

        {/* RIGHT: Live Preview Simulator */}
        <div>
          <div className="card" style={{ padding: 18, border: '1px solid var(--border-subtle)', position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={16} /> Pratinjau Pesan Realtime
              </div>

              {/* Mode Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-elevated)', padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode('whatsapp')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: previewMode === 'whatsapp' ? '#10b981' : 'transparent',
                    color: previewMode === 'whatsapp' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  💬 WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('email')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: previewMode === 'email' ? '#3b82f6' : 'transparent',
                    color: previewMode === 'email' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  📧 Email
                </button>
              </div>
            </div>

            {/* Simulated Output */}
            {previewMode === 'whatsapp' ? (
              /* WhatsApp Phone Mockup */
              <div style={{
                background: '#0b141a',
                borderRadius: 16,
                padding: '16px 14px',
                border: '1px solid #222d34',
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                color: '#e9edef',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {/* WhatsApp Chat Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid #222d34', marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25d366', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                    BZ
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e9edef' }}>BIZORA Official Billing</div>
                    <div style={{ fontSize: 10, color: '#8696a0' }}>Online · Akun Resmi Terverifikasi</div>
                  </div>
                </div>

                {/* WhatsApp Message Bubble */}
                <div style={{
                  background: '#005c4b',
                  padding: '10px 12px',
                  borderRadius: '10px 10px 2px 10px',
                  fontSize: 12,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                  color: '#e9edef',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {renderPreviewText(currentReminder.wa_body)}
                  <div style={{ textAlign: 'right', fontSize: 9.5, color: '#8696a0', marginTop: 4 }}>
                    10:45 ✓✓
                  </div>
                </div>
              </div>
            ) : (
              /* Email Client Mockup */
              <div style={{
                background: '#ffffff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                color: '#1e293b'
              }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Dari: <strong>billing@bizora.id</strong></div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Kepada: <strong>ahmad@retail.com</strong></div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    Subjek: {renderPreviewText(currentReminder.subject)}
                  </div>
                </div>
                <div style={{
                  padding: '16px 14px',
                  fontSize: 12,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  color: '#334155',
                  maxHeight: 380,
                  overflowY: 'auto'
                }}>
                  {renderPreviewText(currentReminder.email_body)}
                </div>
              </div>
            )}

            {/* In-App POS Banner Preview */}
            {settings.channels.in_app && (
              <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone size={14} /> Simulasi Alert Banner di Kasir (POS):
                </div>
                <div style={{ fontSize: 11.5, color: '#92400e', marginTop: 4, lineHeight: 1.4 }}>
                  ⚠️ <strong>Pengingat Langganan:</strong> Paket Anda akan berakhir dalam 7 hari ({renderPreviewText('{due_date}')}). <a href="#" style={{ color: '#b45309', fontWeight: 700, textDecoration: 'underline' }}>Perpanjang Sekarang</a>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Action Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setTestSchedule(activeTab)
            setTestModalOpen(true)
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          <Send size={15} /> Uji Coba Pesan
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* ── Test Send Modal ── */}
      {testModalOpen && (
        <Modal onClose={() => setTestModalOpen(false)}>
          <div style={{ padding: 4 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              Uji Coba Pengiriman Notifikasi
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
              Kirimkan simulasi pesan pengingat ke kontak email atau nomor WhatsApp Anda untuk memeriksa tampilan aslinya.
            </p>

            <form onSubmit={handleTestSend}>
              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Pilih Jadwal Notifikasi</label>
                <select
                  className="form-input"
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

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Saluran Pengiriman</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name="testChannel"
                      checked={testChannel === 'email'}
                      onChange={() => setTestChannel('email')}
                    />
                    📧 Email
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name="testChannel"
                      checked={testChannel === 'whatsapp'}
                      onChange={() => setTestChannel('whatsapp')}
                    />
                    💬 WhatsApp (Simulasi Log)
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">
                  {testChannel === 'email' ? 'Alamat Email Tujuan' : 'Nomor WhatsApp Tujuan'}
                </label>
                <input
                  className="form-input"
                  placeholder={testChannel === 'email' ? 'admin@anda.com' : '081234567890'}
                  value={testTarget}
                  onChange={e => setTestTarget(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setTestModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={testSending}>
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
