import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import './Shared.css'

export default function InvoiceSettings() {
  const [invoiceSettings, setInvoiceSettings] = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [savingSettings, setSavingSettings]   = useState(false)

  const fetchInvoiceSettings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/finance/settings')
      setInvoiceSettings(res.data?.data || {})
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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Pengaturan Invoice &amp; Template Email</h2>
          <p className="page-sub">Sesuaikan identitas perusahaan, instruksi pembayaran bank, dan templat email tagihan</p>
        </div>
      </div>

      <div className="card card-pad" style={{ maxWidth: 840 }}>
        {loading || !invoiceSettings ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <span>Memuat pengaturan invoice...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section 1: Informasi Perusahaan */}
            <div style={{ padding: 20, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                🏢 Identitas Perusahaan / Penerbit Faktur
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nama Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_name || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tagline Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_tagline || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_tagline: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Resmi Billing</label>
                  <input
                    type="email"
                    className="form-input"
                    value={invoiceSettings.company_email || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>No. Telepon / CS</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_phone || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_phone: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Alamat Kantor Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.company_address || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, company_address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Rekening Bank Pembayaran */}
            <div style={{ padding: 20, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                💳 Rekening Bank Pembayaran
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nama Bank</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.bank_name || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, bank_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nomor Rekening</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.bank_account_number || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, bank_account_number: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Atas Nama Rekening</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.bank_account_name || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, bank_account_name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Catatan Instruksi Pembayaran</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.payment_notes || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, payment_notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Template Email */}
            <div style={{ padding: 20, border: '1px solid var(--border-color)', borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                ✉️ Templat Email &amp; Subjek Tagihan
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Subjek Email Tagihan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.email_subject || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, email_subject: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Template Pesan Email</label>
                  <textarea
                    className="form-input"
                    rows={6}
                    value={invoiceSettings.email_body_template || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, email_body_template: e.target.value })}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <small style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                    Variabel dinamis: <code>{'{tenant_id}'}</code>, <code>{'{tenant_name}'}</code>, <code>{'{plan}'}</code>, <code>{'{amount}'}</code>, <code>{'{status}'}</code>
                  </small>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Catatan Footer / Syarat Ketentuan Faktur</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceSettings.invoice_terms || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, invoice_terms: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? 'Menyimpan...' : '💾 Simpan Pengaturan Invoice'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
