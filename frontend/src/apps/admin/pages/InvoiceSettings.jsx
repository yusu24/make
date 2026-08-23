import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'

export default function InvoiceSettings() {
  const [invoiceSettings, setInvoiceSettings] = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [savingSettings, setSavingSettings]   = useState(false)
  const [uploadingLogo, setUploadingLogo]     = useState(false)
  const [resettingLogo, setResettingLogo]     = useState(false)
  const [downloadingDemo, setDownloadingDemo] = useState(false)
  const [logoPreview, setLogoPreview]         = useState(null)
  
  // UI states
  const [emailTemplateTab, setEmailTemplateTab] = useState('unpaid') // 'unpaid' | 'paid'
  const [povStatus, setPovStatus]               = useState('unpaid') // 'unpaid' | 'paid'
  
  const fileInputRef = useRef(null)

  const fetchInvoiceSettings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/finance/settings')
      const data = res.data?.data || {}
      setInvoiceSettings(data)
      setLogoPreview(data.invoice_logo_url || null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoiceSettings()
  }, [])

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await api.post('/admin/finance/settings', invoiceSettings)
      alert(res.data.message || 'Pengaturan invoice berhasil disimpan!')
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + (err.response?.data?.message || err.message))
    } finally {
      setSavingSettings(false)
    }
  }

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (PNG, JPG, JPEG, SVG, atau WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }

    const formData = new FormData()
    formData.append('logo', file)

    setUploadingLogo(true)
    try {
      const res = await api.post('/admin/finance/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const updatedData = res.data?.data || {}
      setInvoiceSettings(updatedData)
      setLogoPreview(updatedData.invoice_logo_url || null)
      alert('Logo invoice berhasil diunggah! 🎉')
    } catch (err) {
      alert('Gagal mengunggah logo: ' + (err.response?.data?.message || err.message))
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleResetLogo = async () => {
    if (!window.confirm('Hapus logo invoice ini dan gunakan format default?')) return
    setResettingLogo(true)
    try {
      const res = await api.delete('/admin/finance/settings/logo')
      const updatedData = res.data?.data || {}
      setInvoiceSettings(updatedData)
      setLogoPreview(null)
      alert('Logo invoice berhasil dihapus.')
    } catch (err) {
      alert('Gagal mereset logo: ' + (err.response?.data?.message || err.message))
    } finally {
      setResettingLogo(false)
    }
  }

  const handleDownloadDemoPdf = async (status = 'unpaid') => {
    setDownloadingDemo(true)
    try {
      const response = await api.get(`/admin/finance/invoices/INV-DEMO/download-pdf?status=${status}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${status === 'paid' ? 'Kuitansi_Lunas' : 'Tagihan_Invoice'}_${invoiceSettings?.company_name || 'BIZORA'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert('Gagal mengunduh contoh PDF')
    } finally {
      setDownloadingDemo(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Pengaturan Invoice &amp; Template Email</h2>
          <p className="page-sub">Kelola identitas faktur, instruksi rekening bank, logo, dan templat email tagihan (Sebelum &amp; Sesudah Bayar)</p>
        </div>
      </div>

      {loading || !invoiceSettings ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <span>Memuat pengaturan invoice...</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 0.85fr)', gap: 24, alignItems: 'start' }}>
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN: Form Settings
             ═══════════════════════════════════════════════════════════════ */}
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Section 0: Upload Logo */}
            <div className="card card-pad" style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                🖼️ Logo Faktur / Invoice PDF
              </h4>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  width: 120, height: 70,
                  borderRadius: 10,
                  border: '2px dashed var(--border-color)',
                  background: 'var(--bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  overflow: 'hidden'
                }}>
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Invoice"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 10 }}>
                      <span style={{ fontSize: 18, display: 'block', marginBottom: 2 }}>🏢</span>
                      <span>Tanpa Logo</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Format: PNG, JPG, SVG (maks. 5MB). Logo ini otomatis muncul pada sudut kiri atas dokumen <strong>PDF Invoice &amp; Kuitansi</strong>.
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? 'Mengunggah...' : '📁 Pilih Logo'}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger-400)' }}
                        onClick={handleResetLogo}
                        disabled={resettingLogo}
                      >
                        {resettingLogo ? 'Mereset...' : '🗑️ Hapus'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Identitas Perusahaan */}
            <div className="card card-pad" style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                🏢 Identitas Perusahaan / Penerbit Faktur
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nama Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_name || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tagline Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_tagline || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_tagline: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Email Resmi Billing</label>
                  <input
                    type="email"
                    className="form-input"
                    value={invoiceSettings.company_email || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>No. Telepon / CS</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_phone || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_phone: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Alamat Kantor Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_address || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Rekening Bank */}
            <div className="card card-pad" style={{ padding: 20 }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                💳 Rekening Bank Pembayaran
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nama Bank</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.bank_name || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, bank_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nomor Rekening</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.bank_account_number || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, bank_account_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Atas Nama Rekening</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.bank_account_name || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, bank_account_name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Catatan Instruksi Pembayaran</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.payment_notes || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, payment_notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Template Email (Sebelum & Sesudah Bayar) */}
            <div className="card card-pad" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  ✉️ Templat Email Otomatis
                </h4>
                {/* Tab Switcher for Email Templates */}
                <div style={{ display: 'flex', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => { setEmailTemplateTab('unpaid'); setPovStatus('unpaid') }}
                    style={{
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: emailTemplateTab === 'unpaid' ? 'var(--primary-500)' : 'transparent',
                      color: emailTemplateTab === 'unpaid' ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    1. Sebelum Bayar (Tagihan)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmailTemplateTab('paid'); setPovStatus('paid') }}
                    style={{
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: emailTemplateTab === 'paid' ? '#10b981' : 'transparent',
                      color: emailTemplateTab === 'paid' ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    2. Sesudah Bayar (Kuitansi Lunas)
                  </button>
                </div>
              </div>

              {/* Sub-template: Sebelum Bayar */}
              {emailTemplateTab === 'unpaid' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#d97706' }}>
                    📢 <strong>Email Tagihan:</strong> Dikirim saat invoice baru diterbitkan atau saat tenant perlu melakukan perpanjangan paket langganan.
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Subjek Email Tagihan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={invoiceSettings.email_subject_unpaid || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, email_subject_unpaid: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Isi Pesan Email Tagihan</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      value={invoiceSettings.email_body_unpaid_template || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, email_body_unpaid_template: e.target.value })}
                      style={{ fontFamily: 'monospace', fontSize: 11 }}
                    />
                  </div>
                </div>
              ) : (
                /* Sub-template: Sesudah Bayar */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#059669' }}>
                    ✅ <strong>Email Kuitansi Lunas:</strong> Dikirim setelah pembayaran diverifikasi oleh admin sebagai bukti pembayaran resmi &amp; aktivasi paket.
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Subjek Email Kuitansi Lunas</label>
                    <input
                      type="text"
                      className="form-input"
                      value={invoiceSettings.email_subject_paid || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, email_subject_paid: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Isi Pesan Email Kuitansi Lunas</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      value={invoiceSettings.email_body_paid_template || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, email_body_paid_template: e.target.value })}
                      style={{ fontFamily: 'monospace', fontSize: 11 }}
                    />
                  </div>
                </div>
              )}

              <small style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Variabel dinamis: <code>{'{tenant_id}'}</code>, <code>{'{tenant_name}'}</code>, <code>{'{plan}'}</code>, <code>{'{amount}'}</code>, <code>{'{status}'}</code>
              </small>

              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Catatan Footer / Syarat Faktur</label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceSettings.invoice_terms || ''}
                  onChange={e => setInvoiceSettings({ ...invoiceSettings, invoice_terms: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? 'Menyimpan...' : '💾 Simpan Pengaturan Invoice'}
              </button>
            </div>
          </form>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN: Realtime Live PDF POV Preview (Unpaid vs Paid)
             ═══════════════════════════════════════════════════════════════ */}
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👁️</span> POV Realtime Dokumen
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {/* Status Toggle */}
                <button
                  type="button"
                  onClick={() => setPovStatus('unpaid')}
                  style={{
                    padding: '3px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: povStatus === 'unpaid' ? '#f59e0b' : 'var(--border-color)',
                    background: povStatus === 'unpaid' ? '#fef3c7' : 'transparent',
                    color: povStatus === 'unpaid' ? '#b45309' : 'var(--text-muted)'
                  }}
                >
                  Belum Bayar
                </button>
                <button
                  type="button"
                  onClick={() => setPovStatus('paid')}
                  style={{
                    padding: '3px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: povStatus === 'paid' ? '#10b981' : 'var(--border-color)',
                    background: povStatus === 'paid' ? '#d1fae5' : 'transparent',
                    color: povStatus === 'paid' ? '#065f46' : 'var(--text-muted)'
                  }}
                >
                  Lunas (Paid)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDownloadDemoPdf(povStatus)}
                  disabled={downloadingDemo}
                  style={{ fontSize: 10, padding: '3px 8px' }}
                  title="Download file PDF hasil render dari server"
                >
                  {downloadingDemo ? '...' : '📥 PDF'}
                </button>
              </div>
            </div>

            {/* A4 Paper Mockup Container */}
            <div style={{
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: 12,
              padding: '24px 22px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              fontSize: 11,
              lineHeight: 1.4,
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              
              {/* Header: Logo + Company Info & Title */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: povStatus === 'paid' ? '2px solid #10b981' : '2px solid #6366f1',
                paddingBottom: 12,
                marginBottom: 14
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      style={{ maxHeight: 42, maxWidth: 54, objectFit: 'contain', display: 'block' }}
                    />
                  ) : null}
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: povStatus === 'paid' ? '#059669' : '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      {invoiceSettings.company_name || 'BIZORA SaaS'}
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: 9.5, color: '#64748b' }}>
                      {invoiceSettings.company_tagline || 'Sistem Manajemen Usaha & Kasir'}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: 9, color: '#64748b', lineHeight: 1.3 }}>
                      {invoiceSettings.company_address || 'Jl. Jendral Sudirman No. 123, Jakarta'}<br />
                      Email: {invoiceSettings.company_email || 'billing@bizora.id'} | Telp: {invoiceSettings.company_phone || '0812-3456-7890'}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: povStatus === 'paid' ? '#15803d' : '#0f172a',
                    letterSpacing: '0.5px'
                  }}>
                    {povStatus === 'paid' ? 'KUITANSI LUNAS' : 'INVOICE / TAGIHAN'}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', margin: '2px 0 0' }}>No: <strong>INV-2026-001</strong></div>
                </div>
              </div>


              {/* Billed To / Info Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Ditagihkan Kepada:</div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#0f172a', marginTop: 2 }}>Toko Berkah Sejahtera</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>ID Tenant: TN-001 · Toko Retail</div>
                  <div style={{ fontSize: 9, color: '#475569' }}>ahmad@retail.com</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Rincian Tanggal:</div>
                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Tanggal Terbit: <strong>23 Agu 2026</strong></div>
                  {povStatus === 'paid' ? (
                    <div style={{ fontSize: 9, color: '#15803d', marginTop: 2 }}>Status: <strong>Lunas Terverifikasi</strong></div>
                  ) : (
                    <div style={{ fontSize: 9, color: '#dc2626', marginTop: 2 }}>Jatuh Tempo: <strong>30 Agu 2026</strong></div>
                  )}
                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Metode: <strong>Transfer Bank</strong></div>
                </div>
              </div>

              {/* Itemized Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                <thead>
                  <tr style={{ background: povStatus === 'paid' ? '#059669' : '#4f46e5', color: '#ffffff' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: 9.5, borderRadius: '4px 0 0 0' }}>Deskripsi Layanan</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9.5 }}>Paket</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9.5 }}>Tarif</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9.5, borderRadius: '0 4px 0 0' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 8px' }}>
                      <strong style={{ color: '#0f172a' }}>Langganan BIZORA SaaS (Pro)</strong>
                      <div style={{ fontSize: 8.5, color: '#64748b' }}>Akses penuh POS Kasir, Multi-Outlet, Laporan Keuangan</div>
                    </td>
                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>Pro</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right' }}>Rp 299.000</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700 }}>Rp 299.000</td>
                  </tr>
                </tbody>
              </table>

              {/* Stamp (Left) + Total Calculation (Right) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                {/* Left: Official Stamp */}
                <div style={{ paddingLeft: 4 }}>
                  {povStatus === 'paid' ? (
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      border: '3px double #16a34a',
                      borderRadius: 6,
                      color: '#15803d',
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '1.8px',
                      textAlign: 'center',
                      backgroundColor: 'rgba(240, 253, 244, 0.95)',
                      transform: 'rotate(-7deg)',
                      boxShadow: '0 0 0 1px #16a34a inset',
                      userSelect: 'none'
                    }}>
                      <div style={{ fontSize: 6.5, letterSpacing: '0.8px', fontWeight: 700, color: '#166534' }}>★ RESMI &amp; TERVERIFIKASI ★</div>
                      <div style={{ padding: '1px 0' }}>L U N A S</div>
                      <div style={{ fontSize: 6.5, letterSpacing: '0.8px', fontWeight: 700, color: '#166534' }}>OFFICIAL RECEIPT</div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      border: '2px dashed #d97706',
                      borderRadius: 6,
                      color: '#b45309',
                      fontSize: 9.5,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      textAlign: 'center',
                      backgroundColor: '#fffbeb',
                      transform: 'rotate(-4deg)',
                      userSelect: 'none'
                    }}>
                      <div style={{ fontSize: 6, letterSpacing: '0.5px' }}>MENUNGGU PEMBAYARAN</div>
                      <div style={{ padding: '1px 0' }}>BELUM BAYAR</div>
                    </div>
                  )}
                </div>

                {/* Right: Total Summary Card */}
                <div style={{ width: 180, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: 9.5, color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span>Rp 299.000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: 9.5, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                    <span>PPN (0%)</span>
                    <span>Rp 0</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: povStatus === 'paid' ? '#15803d' : '#4f46e5',
                    background: povStatus === 'paid' ? '#dcfce7' : '#e0e7ff'
                  }}>
                    <span>{povStatus === 'paid' ? 'Total Dibayar' : 'Total Tagihan'}</span>
                    <span>Rp 299.000</span>
                  </div>
                </div>
              </div>

              {/* Bank Payment Instructions / Receipt Box */}
              {povStatus === 'paid' ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>
                    ✅ STATUS: TELAH DIBAYAR LUNAS (OFFICIAL RECEIPT)
                  </div>
                  <div style={{ fontSize: 10, color: '#166534' }}>
                    Diterima pada Rekening: <strong>{invoiceSettings.bank_name || 'Bank Mandiri'} ({invoiceSettings.bank_account_number || '123-00-9988776-5'})</strong>
                  </div>
                  <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600, marginTop: 2 }}>
                    Pembayaran telah diverifikasi. Paket aktif dan dapat digunakan.
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: 4 }}>
                    💳 Instruksi Transfer Rekening Bank:
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a' }}>
                        {invoiceSettings.bank_name || 'Bank Mandiri'} · {invoiceSettings.bank_account_number || '123-00-9988776-5'}
                      </div>
                      <div style={{ fontSize: 9, color: '#64748b' }}>
                        a.n. <strong>{invoiceSettings.bank_account_name || 'PT BIZORA TEKNOLOGI INDONESIA'}</strong>
                      </div>
                    </div>
                  </div>
                  {invoiceSettings.payment_notes && (
                    <p style={{ margin: '6px 0 0 0', fontSize: 8.5, color: '#64748b', fontStyle: 'italic' }}>
                      * {invoiceSettings.payment_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Footer Note / Terms */}
              <div style={{ textAlign: 'center', fontSize: 8.5, color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                {invoiceSettings.invoice_terms || 'Terima kasih atas kepercayaan Anda menggunakan BIZORA SaaS. Faktur ini sah secara elektronik.'}
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  )
}
