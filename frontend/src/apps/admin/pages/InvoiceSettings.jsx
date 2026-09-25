import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../../lib/api'
import {
  RefreshCw,
  Building,
  CreditCard,
  Mail,
  Download,
  Save,
  Image,
  FileText,
  Upload,
  Trash2,
  Eye,
  CheckCircle2,
  Store
} from '@/constants/icons'
import StatScoreCard from '@/components/ui/StatScoreCard'
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
      setInvoiceSettings({
        company_name: 'BIZORA SaaS',
        company_tagline: 'Sistem Manajemen Usaha & Kasir Terintegrasi',
        company_address: 'Jl. Jendral Sudirman No. 123, Jakarta Selatan',
        company_phone: '0812-3456-7890',
        company_email: 'billing@bizora.id',
        bank_accounts: [{ bank_name: 'Bank Mandiri', bank_account_number: '123-00-9988776-5', bank_account_name: 'PT BIZORA TEKNOLOGI INDONESIA' }]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoiceSettings()
  }, [])

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault()
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

  const bankCount = ((invoiceSettings?.bank_accounts && invoiceSettings.bank_accounts.length > 0) ? invoiceSettings.bank_accounts : [1]).length

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Top Actions Toolbar ── */}
      <div className="flex items-center justify-end gap-2.5">
        <button
          onClick={fetchInvoiceSettings}
          disabled={loading}
          className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          title="Muat ulang pengaturan"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Muat Ulang</span>
        </button>
          <button
            onClick={() => handleDownloadDemoPdf(povStatus)}
            disabled={downloadingDemo || !invoiceSettings}
            className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium text-xs shadow-xs transition-colors"
          >
            <Download size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>{downloadingDemo ? 'Mengunduh...' : 'Unduh Demo PDF'}</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings || loading || !invoiceSettings}
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
      </div>

      {loading || !invoiceSettings ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Memuat pengaturan invoice &amp; template email...
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ── KPI Metric Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatScoreCard
              title="PENERBIT FAKTUR"
              value={invoiceSettings.company_name || 'BIZORA'}
              icon={Store}
              statusBadge={{ text: "Penerbit", color: "blue" }}
              subtitle="Entitas legal faktur resmi"
              progressBar={{ value: 100, color: "bg-blue-500" }}
            />
            <StatScoreCard
              title="LOGO DOKUMEN"
              value={logoPreview ? "Terpasang" : "Default"}
              icon={Image}
              statusBadge={{ text: logoPreview ? "Kustom" : "Default", color: logoPreview ? "emerald" : "slate" }}
              subtitle="Kop PDF invoice & kuitansi"
              progressBar={{ value: logoPreview ? 100 : 40, color: logoPreview ? "bg-emerald-500" : "bg-slate-400" }}
            />
            <StatScoreCard
              title="REKENING PEMBAYARAN"
              value={`${bankCount} Rekening`}
              icon={CreditCard}
              statusBadge={{ text: "Transfer Bank", color: "violet" }}
              subtitle="Tujuan transfer pembayaran"
              progressBar={{ value: 85, color: "bg-violet-500" }}
            />
            <StatScoreCard
              title="TEMPLATE NOTIFIKASI"
              value="2 Status"
              icon={Mail}
              statusBadge={{ text: "Unpaid & Paid", color: "amber" }}
              subtitle="Tagihan & kuitansi lunas"
              progressBar={{ value: 100, color: "bg-amber-500" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ═══════════════════════════════════════════════════════════════
                LEFT COLUMN: Form Settings
               ═══════════════════════════════════════════════════════════════ */}
            <form onSubmit={handleSaveSettings} className="lg:col-span-7 flex flex-col gap-5">
              
              {/* Section 0: Upload Logo */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Image size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Logo Faktur / Invoice PDF</span>
                </h4>
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="w-28 h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Invoice"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-[10px]">
                        <span className="text-base block mb-0.5">🏢</span>
                        <span>Tanpa Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Format: PNG, JPG, SVG (maks. 5MB). Logo ini otomatis muncul pada sudut kiri atas dokumen <strong>PDF Invoice &amp; Kuitansi</strong>.
                    </p>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-semibold shadow-xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? 'Mengunggah...' : '📁 Pilih Logo'}
                      </button>
                      {logoPreview && (
                        <button
                          type="button"
                          className="h-8 px-3 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold shadow-xs"
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Store size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Identitas Perusahaan / Penerbit Faktur</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama Perusahaan</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                      value={invoiceSettings.company_name || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, company_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tagline Perusahaan</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                      value={invoiceSettings.company_tagline || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, company_tagline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Resmi Billing</label>
                    <input
                      type="email"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                      value={invoiceSettings.company_email || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, company_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">No. Telepon / CS</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                      value={invoiceSettings.company_phone || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, company_phone: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Alamat Kantor Perusahaan</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900"
                      value={invoiceSettings.company_address || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, company_address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Rekening Bank */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Rekening Bank Pembayaran ({bankCount} Rekening)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const current = (invoiceSettings.bank_accounts && invoiceSettings.bank_accounts.length > 0)
                        ? invoiceSettings.bank_accounts
                        : [{ bank_name: invoiceSettings.bank_name || 'Bank BCA', bank_account_number: invoiceSettings.bank_account_number || '', bank_account_name: invoiceSettings.bank_account_name || '' }];
                      setInvoiceSettings({
                        ...invoiceSettings,
                        bank_accounts: [
                          ...current,
                          { bank_name: 'Bank Mandiri', bank_account_number: '', bank_account_name: invoiceSettings.bank_account_name || 'PT BIZORA' }
                        ]
                      });
                    }}
                    className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold shadow-xs"
                  >
                    + Tambah Rekening
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {((invoiceSettings.bank_accounts && invoiceSettings.bank_accounts.length > 0)
                    ? invoiceSettings.bank_accounts
                    : [{ bank_name: invoiceSettings.bank_name || 'Bank BCA', bank_account_number: invoiceSettings.bank_account_number || '', bank_account_name: invoiceSettings.bank_account_name || '' }]
                  ).map((acc, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          ● Rekening #{idx + 1} {idx === 0 ? '(Utama)' : ''}
                        </span>
                        {bankCount > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = invoiceSettings.bank_accounts || [];
                              const filtered = list.filter((_, i) => i !== idx);
                              setInvoiceSettings({
                                ...invoiceSettings,
                                bank_accounts: filtered,
                                ...(filtered[0] ? { bank_name: filtered[0].bank_name, bank_account_number: filtered[0].bank_account_number, bank_account_name: filtered[0].bank_account_name } : {})
                              });
                            }}
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nama Bank</label>
                          <input
                            type="text"
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                            placeholder="BCA / Mandiri / BRI / BNI / BSI"
                            value={acc.bank_name || ''}
                            onChange={e => {
                              const list = [...((invoiceSettings.bank_accounts && invoiceSettings.bank_accounts.length > 0) ? invoiceSettings.bank_accounts : [{ bank_name: invoiceSettings.bank_name, bank_account_number: invoiceSettings.bank_account_number, bank_account_name: invoiceSettings.bank_account_name }])];
                              list[idx] = { ...list[idx], bank_name: e.target.value };
                              setInvoiceSettings({
                                ...invoiceSettings,
                                bank_accounts: list,
                                ...(idx === 0 ? { bank_name: e.target.value } : {})
                              });
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nomor Rekening</label>
                          <input
                            type="text"
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                            placeholder="Nomor Rekening"
                            value={acc.bank_account_number || acc.bank_account_no || ''}
                            onChange={e => {
                              const list = [...((invoiceSettings.bank_accounts && invoiceSettings.bank_accounts.length > 0) ? invoiceSettings.bank_accounts : [{ bank_name: invoiceSettings.bank_name, bank_account_number: invoiceSettings.bank_account_number, bank_account_name: invoiceSettings.bank_account_name }])];
                              list[idx] = { ...list[idx], bank_account_number: e.target.value, bank_account_no: e.target.value };
                              setInvoiceSettings({
                                ...invoiceSettings,
                                bank_accounts: list,
                                ...(idx === 0 ? { bank_account_number: e.target.value } : {})
                              });
                            }}
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Atas Nama (A.N.)</label>
                          <input
                            type="text"
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                            placeholder="Nama Pemilik Rekening"
                            value={acc.bank_account_name || ''}
                            onChange={e => {
                              const list = [...((invoiceSettings.bank_accounts && invoiceSettings.bank_accounts.length > 0) ? invoiceSettings.bank_accounts : [{ bank_name: invoiceSettings.bank_name, bank_account_number: invoiceSettings.bank_account_number, bank_account_name: invoiceSettings.bank_account_name }])];
                              list[idx] = { ...list[idx], bank_account_name: e.target.value };
                              setInvoiceSettings({
                                ...invoiceSettings,
                                bank_accounts: list,
                                ...(idx === 0 ? { bank_account_name: e.target.value } : {})
                              });
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Catatan Instruksi Pembayaran</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      value={invoiceSettings.payment_notes || ''}
                      onChange={e => setInvoiceSettings({ ...invoiceSettings, payment_notes: e.target.value })}
                      placeholder="Contoh: Sertakan ID Tenant saat transfer."
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Template Email */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Templat Email Notifikasi Otomatis</span>
                  </h4>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setEmailTemplateTab('unpaid'); setPovStatus('unpaid') }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        emailTemplateTab === 'unpaid'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      1. Tagihan Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEmailTemplateTab('paid'); setPovStatus('paid') }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        emailTemplateTab === 'paid'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      2. Kuitansi Lunas
                    </button>
                  </div>
                </div>

                {emailTemplateTab === 'unpaid' ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                      📢 <strong>Email Tagihan:</strong> Dikirim saat invoice baru diterbitkan atau saat tenant perlu melakukan perpanjangan paket langganan.
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subjek Email Tagihan</label>
                      <input
                        type="text"
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                        value={invoiceSettings.email_subject_unpaid || ''}
                        onChange={e => setInvoiceSettings({ ...invoiceSettings, email_subject_unpaid: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Isi Pesan Email Tagihan</label>
                      <textarea
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-mono resize-y"
                        rows={5}
                        value={invoiceSettings.email_body_unpaid_template || ''}
                        onChange={e => setInvoiceSettings({ ...invoiceSettings, email_body_unpaid_template: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                      ✅ <strong>Email Kuitansi Lunas:</strong> Dikirim setelah pembayaran diverifikasi oleh admin sebagai bukti pembayaran resmi &amp; aktivasi paket.
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subjek Email Kuitansi Lunas</label>
                      <input
                        type="text"
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                        value={invoiceSettings.email_subject_paid || ''}
                        onChange={e => setInvoiceSettings({ ...invoiceSettings, email_subject_paid: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Isi Pesan Email Kuitansi Lunas</label>
                      <textarea
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-mono resize-y"
                        rows={5}
                        value={invoiceSettings.email_body_paid_template || ''}
                        onChange={e => setInvoiceSettings({ ...invoiceSettings, email_body_paid_template: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-400">
                  Variabel dinamis: <code>{'{tenant_id}'}</code>, <code>{'{tenant_name}'}</code>, <code>{'{plan}'}</code>, <code>{'{amount}'}</code>, <code>{'{status}'}</code>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Catatan Footer / Syarat Faktur</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                    value={invoiceSettings.invoice_terms || ''}
                    onChange={e => setInvoiceSettings({ ...invoiceSettings, invoice_terms: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50"
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Menyimpan...' : '💾 Simpan Pengaturan Invoice'}
                </button>
              </div>
            </form>

            {/* ═══════════════════════════════════════════════════════════════
                RIGHT COLUMN: Realtime Live PDF POV Preview (Unpaid vs Paid)
               ═══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Eye size={15} /> POV Realtime Dokumen
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPovStatus('unpaid')}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-bold border transition-all ${
                      povStatus === 'unpaid'
                        ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Tagihan
                  </button>
                  <button
                    type="button"
                    onClick={() => setPovStatus('paid')}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-bold border transition-all ${
                      povStatus === 'paid'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    Kuitansi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDemoPdf(povStatus)}
                    disabled={downloadingDemo}
                    className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    {downloadingDemo ? '...' : '📥 PDF'}
                  </button>
                </div>
              </div>

              {/* A4 Paper Mockup Container */}
              <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-xl border border-slate-200 text-xs font-sans">
                {/* Header: Logo + Company Info & Title */}
                <div className={`flex justify-between pb-3 mb-3 border-b-2 ${povStatus === 'paid' ? 'border-emerald-500' : 'border-indigo-600'}`}>
                  <div className="flex gap-2.5 items-center">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="max-h-12 max-w-12 object-contain"
                      />
                    ) : null}
                    <div>
                      <h4 className={`text-sm font-extrabold uppercase tracking-wide leading-none ${povStatus === 'paid' ? 'text-emerald-700' : 'text-indigo-600'}`}>
                        {invoiceSettings.company_name || 'BIZORA SaaS'}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-600 mt-0.5">
                        {invoiceSettings.company_tagline || 'Sistem Manajemen Usaha & Kasir'}
                      </p>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                        {invoiceSettings.company_address || 'Jl. Jendral Sudirman No. 123, Jakarta'}<br />
                        {invoiceSettings.company_email || 'billing@bizora.id'} | {invoiceSettings.company_phone || '0812-3456-7890'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-black tracking-wide ${povStatus === 'paid' ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {povStatus === 'paid' ? 'KUITANSI LUNAS' : 'INVOICE / TAGIHAN'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">No: <strong>INV-2026-001</strong></div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 text-[10px]">
                  <div>
                    <div className="font-bold text-slate-400 uppercase text-[8px]">Ditagihkan Kepada:</div>
                    <div className="font-bold text-slate-900 text-xs mt-0.5">Toko Berkah Sejahtera</div>
                    <div className="text-slate-600">ID: TN-001 · Toko Retail</div>
                    <div className="text-slate-500">ahmad@retail.com</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-400 uppercase text-[8px]">Rincian Transaksi:</div>
                    <div className="text-slate-600 mt-0.5">Tgl: 24 Sep 2026</div>
                    <div className="text-slate-600">Tempo: 01 Okt 2026</div>
                    <div className={`font-bold mt-0.5 ${povStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {povStatus === 'paid' ? 'STATUS: LUNAS' : 'STATUS: MENUNGGU PEMBAYARAN'}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-[10px] mb-3 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-left">
                      <th className="py-1">Deskripsi Layanan</th>
                      <th className="py-1 text-center">Durasi</th>
                      <th className="py-1 text-right">Harga</th>
                      <th className="py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 font-medium">Langganan Paket Pro (Toko Retail)</td>
                      <td className="py-1.5 text-center">1 Bulan</td>
                      <td className="py-1.5 text-right">Rp 299.000</td>
                      <td className="py-1.5 text-right font-semibold">Rp 299.000</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end mb-3">
                  <div className={`flex justify-between gap-6 px-3 py-1.5 rounded-lg text-xs font-bold ${povStatus === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-900'}`}>
                    <span>{povStatus === 'paid' ? 'Total Dibayar:' : 'Total Tagihan:'}</span>
                    <span>Rp 299.000</span>
                  </div>
                </div>

                {/* Payment Instructions / Receipt */}
                {povStatus === 'paid' ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] space-y-0.5 mb-2.5">
                    <div className="font-bold text-emerald-800 uppercase text-[9px]">
                      ✅ STATUS: TELAH DIBAYAR LUNAS (OFFICIAL RECEIPT)
                    </div>
                    <div className="text-emerald-700">
                      Diterima via: <strong>{invoiceSettings.bank_name || 'Bank Mandiri'} ({invoiceSettings.bank_account_number || '123-00-9988776-5'})</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-[10px] space-y-0.5 mb-2.5">
                    <div className="font-bold text-slate-700 uppercase text-[9px]">
                      💳 Instruksi Transfer Bank:
                    </div>
                    <div className="font-bold text-slate-900">
                      {invoiceSettings.bank_name || 'Bank Mandiri'} · {invoiceSettings.bank_account_number || '123-00-9988776-5'}
                    </div>
                    <div className="text-slate-500">
                      a.n. <strong>{invoiceSettings.bank_account_name || 'PT BIZORA TEKNOLOGI INDONESIA'}</strong>
                    </div>
                    {invoiceSettings.payment_notes && (
                      <div className="text-slate-500 italic mt-1 text-[9px]">
                        * {invoiceSettings.payment_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2">
                  {invoiceSettings.invoice_terms || 'Terima kasih atas kepercayaan Anda menggunakan BIZORA SaaS. Faktur ini sah secara elektronik.'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
