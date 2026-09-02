import React, { useState, useEffect, useRef } from 'react';
import {
  Store, CreditCard, FileText, QrCode,
  Save, Upload, Trash2, Check, AlertCircle,
  ChevronRight, ChevronDown, ToggleLeft, ToggleRight, Eye, EyeOff,
  Phone, MapPin, Building2, Percent, Star, Package,
  Receipt, Shield, Database, Download, Mail, Calendar, Clock,
  FileSpreadsheet, FileCode
} from 'lucide-react';
import { api } from '../../../lib/api';
import RetailLoading from '../components/RetailLoading';

/* ─── Helper: Toast notification ──────────────────────────────────────────── */
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 12,
      background: type === 'success' ? 'var(--retail-success, #16a34a)' : '#dc2626',
      color: '#fff', fontSize: 14, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      animation: 'slideUp 0.3s ease-out',
    }}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

/* ─── Helper: Toggle Switch ────────────────────────────────────────────────── */
function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--retail-text-primary)', margin: 0 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--retail-text-secondary)', margin: '3px 0 0 0' }}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--retail-primary, #6366f1)' : '#cbd5e1',
          position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

/* ─── Helper: Section card ─────────────────────────────────────────────────── */
function SectionCard({ children, style }) {
  return (
    <div style={{
      background: 'var(--retail-bg-card, #fff)',
      border: '1px solid var(--retail-border, #e2e8f0)',
      borderRadius: 16, padding: '24px 28px',
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Helper: form field ───────────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      {children}
      {hint && <small style={{ fontSize: 12, color: 'var(--retail-text-secondary)', marginTop: 4, display: 'block' }}>{hint}</small>}
    </div>
  );
}

/* ─── Tabs config ──────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'store',    label: 'Informasi Toko',   icon: Store },
  { id: 'cashier',  label: 'Transaksi & Kasir', icon: CreditCard },
  { id: 'receipt',  label: 'Struk & Print',     icon: Receipt },
  { id: 'payment',  label: 'Pembayaran',         icon: QrCode },
  { id: 'kyc',      label: 'Verifikasi Usaha',   icon: Shield },
  { id: 'backup',   label: 'Backup Data',        icon: Database },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('store');
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [qrisUploading, setQrisUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [kycUploading, setKycUploading] = useState(false);
  const [previewStruk, setPreviewStruk] = useState(false);
  const [kyc, setKyc] = useState(null);
  const [backupDownloading, setBackupDownloading] = useState(false);
  const [backupEmailing, setBackupEmailing] = useState(false);
  const [backupEmail, setBackupEmail] = useState('');
  const [manualEmailFormat, setManualEmailFormat] = useState('excel');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState('weekly');
  const [autoBackupFormat, setAutoBackupFormat] = useState('excel');
  const [autoBackupEmail, setAutoBackupEmail] = useState('');
  const [lastAutoBackupAt, setLastAutoBackupAt] = useState(null);
  const [savingAutoBackup, setSavingAutoBackup] = useState(false);
  const qrisInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const kycInputRef = useRef(null);

  /* ── fetch ── */
  const fetchSettings = async () => {
    try {
      const res = await api.get('/retail/settings');
      setSettings(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchKyc = async () => {
    try {
      const res = await api.get('/settings/kyc');
      setKyc(res.data?.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBackupConfig = async () => {
    try {
      const res = await api.get('/retail/settings/backup/config');
      if (res.data?.data) {
        setAutoBackupEnabled(Boolean(res.data.data.auto_backup_enabled));
        setAutoBackupFrequency(res.data.data.auto_backup_frequency || 'weekly');
        setAutoBackupFormat(res.data.data.auto_backup_format || 'excel');
        setAutoBackupEmail(res.data.data.auto_backup_email || '');
        setLastAutoBackupAt(res.data.data.last_auto_backup_at || null);
        if (!backupEmail && res.data.data.auto_backup_email) {
          setBackupEmail(res.data.data.auto_backup_email);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    fetchSettings(); 
    fetchKyc(); 
    fetchBackupConfig();
  }, []);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── partial save ── */
  const handleSave = async (fields) => {
    setSaving(true);
    try {
      const payload = {};
      fields.forEach(f => { payload[f] = settings[f]; });
      const res = await api.put('/retail/settings', payload);
      setSettings(res.data);
      showToast('Pengaturan berhasil disimpan');
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── QRIS upload ── */
  const handleQrisUpload = async (file) => {
    if (!file) return;
    setQrisUploading(true);
    try {
      const form = new FormData();
      form.append('qris_image', file);
      const res = await api.post('/retail/settings/qris', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(prev => ({ ...prev, qris_image_path: res.data.qris_image_path, qris_image_url: res.data.qris_image_url }));
      showToast('QRIS berhasil diupload');
    } catch (e) {
      showToast('Gagal upload QRIS', 'error');
    } finally {
      setQrisUploading(false);
    }
  };

  /* ── QRIS delete ── */
  const handleQrisDelete = async () => {
    if (!window.confirm('Hapus gambar QRIS?')) return;
    try {
      await api.delete('/retail/settings/qris');
      setSettings(prev => ({ ...prev, qris_image_path: null, qris_image_url: null }));
      showToast('QRIS dihapus');
    } catch (e) {
      showToast('Gagal hapus QRIS', 'error');
    }
  };

  /* ── Store icon upload ── */
  const handleIconUpload = async (file) => {
    if (!file) return;
    setIconUploading(true);
    try {
      const form = new FormData();
      form.append('store_icon', file);
      const res = await api.post('/retail/settings/store-icon', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(prev => ({ ...prev, store_icon_path: res.data.store_icon_path, store_icon_url: res.data.store_icon_url }));
      showToast('Icon toko berhasil diupload');
    } catch (e) {
      showToast('Gagal upload icon toko', 'error');
    } finally {
      setIconUploading(false);
    }
  };

  /* ── Store icon delete ── */
  const handleIconDelete = async () => {
    if (!window.confirm('Hapus icon toko? Sidebar akan kembali memakai logo BIZORA.')) return;
    try {
      await api.delete('/retail/settings/store-icon');
      setSettings(prev => ({ ...prev, store_icon_path: null, store_icon_url: null }));
      showToast('Icon toko dihapus');
    } catch (e) {
      showToast('Gagal hapus icon toko', 'error');
    }
  };

  /* ── KYC upload ── */
  const handleKycUpload = async (file) => {
    if (!file) return;
    setKycUploading(true);
    try {
      const form = new FormData();
      form.append('document', file);
      const res = await api.post('/settings/kyc', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message);
      fetchKyc();
    } catch (e) {
      showToast('Gagal upload dokumen KYC', 'error');
    } finally {
      setKycUploading(false);
    }
  };

  /* ── field helper ── */
  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  if (!settings) return <RetailLoading text="Memuat pengaturan..." />;

  const activeTabObj = TABS.find(t => t.id === activeTab) || TABS[0];
  const ActiveIcon = activeTabObj.icon;

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .settings-tab-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; border-radius: 10px; border: none;
          cursor: pointer; width: 100%; text-align: left;
          font-size: 13.5px; font-weight: 500;
          background: transparent; color: var(--retail-text-secondary);
          transition: all 0.15s ease;
        }
        .settings-tab-btn:hover { background: var(--retail-bg-hover, #f1f5f9); color: var(--retail-text-primary); }
        .settings-tab-btn.active {
          background: var(--retail-primary-light, #ede9fe);
          color: var(--retail-primary, #6366f1);
          font-weight: 600;
        }
        .settings-grid-2 {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media (max-width: 640px) { .settings-grid-2 { grid-template-columns: 1fr; } }
        .settings-save-bar {
          display: flex; align-items: center; gap: 12px;
          padding-top: 20px; margin-top: 20px;
          border-top: 1px solid var(--retail-border, #e2e8f0);
        }
        .struk-preview {
          background: #fff; border: 1px dashed #cbd5e1; border-radius: 10px;
          padding: 20px; font-family: 'Courier New', monospace; font-size: 12px;
          line-height: 1.6; color: #1e293b; max-width: 280px; margin: 0 auto;
        }
        .struk-preview hr { border: none; border-top: 1px dashed #94a3b8; margin: 8px 0; }
        .struk-preview .center { text-align: center; }

        /* Responsive Layout Classes */
        .settings-layout {
          display: flex; gap: 24px; align-items: flex-start;
        }
        .settings-sidebar-wrapper {
          width: 220px; flex-shrink: 0; display: block;
        }
        .settings-mobile-dropdown-container {
          display: none; width: 100%; margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
          .settings-layout {
            flex-direction: column;
            gap: 16px;
          }
          .settings-sidebar-wrapper {
            display: none;
          }
          .settings-mobile-dropdown-container {
            display: block;
          }
        }
      `}</style>

      <div className="settings-layout">

        {/* ── Mobile Tab Dropdown Select ── */}
        <div className="settings-mobile-dropdown-container" style={{ position: 'relative', zIndex: 50 }}>
          <button
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--retail-border, #e2e8f0)',
              background: '#fff',
              cursor: 'pointer',
              boxShadow: 'var(--retail-shadow)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--retail-text-primary)',
              textAlign: 'left'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--retail-primary-light, #ede9fe)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--retail-primary, #6366f1)',
              flexShrink: 0
            }}>
              <ActiveIcon size={16} />
            </div>
            <span style={{ flex: 1 }}>{activeTabObj.label}</span>
            <ChevronDown size={16} style={{ color: 'var(--retail-text-secondary)', transform: mobileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {mobileDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0, right: 0,
              marginTop: 6,
              background: '#fff',
              border: '1px solid var(--retail-border, #e2e8f0)',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              zIndex: 60
            }}>
              {TABS.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: 'none',
                      background: isActive ? 'var(--retail-primary-light, #ede9fe)' : '#fff',
                      color: isActive ? 'var(--retail-primary, #6366f1)' : 'var(--retail-text-primary)',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                  >
                    <TabIcon size={15} color={isActive ? 'var(--retail-primary, #6366f1)' : 'var(--retail-text-secondary)'} />
                    <span style={{ flex: 1 }}>{tab.label}</span>
                    {isActive && <Check size={14} style={{ color: 'var(--retail-primary, #6366f1)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar Tabs (Desktop) ── */}
        <div className="settings-sidebar-wrapper">
          <SectionCard style={{ padding: '10px 8px' }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </SectionCard>
        </div>

        {/* ── Content Panel ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ Tab 1: Informasi Toko ══════════════════════════════════════ */}
          {activeTab === 'store' && (
            <SectionCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--retail-primary-light, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={20} color="var(--retail-primary, #6366f1)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Informasi Toko</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary)' }}>Data identitas toko yang muncul di struk</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field label="Icon Toko" hint="Menggantikan logo BIZORA di sidebar khusus untuk toko Anda. Kosongkan untuk memakai logo default.">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                      background: '#f8fafc', border: '1px solid var(--retail-border, #e2e8f0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {settings.store_icon_url ? (
                        <img src={settings.store_icon_url} alt="Icon Toko" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Store size={22} color="var(--retail-text-secondary)" />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={iconUploading}
                      >
                        <Upload size={14} style={{ marginRight: 6 }} />
                        {iconUploading ? 'Mengupload...' : (settings.store_icon_url ? 'Ganti Icon' : 'Upload Icon')}
                      </button>
                      {settings.store_icon_url && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                          onClick={handleIconDelete}
                        >
                          <Trash2 size={14} style={{ marginRight: 6 }} />
                          Hapus
                        </button>
                      )}
                    </div>
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={e => handleIconUpload(e.target.files[0])}
                    />
                  </div>
                </Field>

                <Field label="Nama Toko" hint="Ditampilkan di bagian atas struk belanja">
                  <div style={{ position: 'relative' }}>
                    <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                    <input
                      type="text" className="form-input" placeholder="cth. Toko Serba Ada Maju"
                      value={settings.store_name || ''}
                      onChange={e => set('store_name', e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </Field>

                <Field label="Nomor Telepon / WhatsApp" hint="Nomor kontak toko">
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                    <input
                      type="text" className="form-input" placeholder="cth. 0812-3456-7890"
                      value={settings.store_phone || ''}
                      onChange={e => set('store_phone', e.target.value)}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </Field>

                <Field label="Alamat Toko" hint="Alamat lengkap toko Anda">
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--retail-text-secondary)' }} />
                    <textarea
                      className="form-input" rows={3} placeholder="cth. Jl. Merdeka No. 10, Jakarta Pusat"
                      value={settings.store_address || ''}
                      onChange={e => set('store_address', e.target.value)}
                      style={{ paddingLeft: 36, resize: 'vertical' }}
                    />
                  </div>
                </Field>

                <Field label="Mata Uang">
                  <select
                    className="form-input"
                    value={settings.currency || 'IDR'}
                    onChange={e => set('currency', e.target.value)}
                  >
                    <option value="IDR">IDR — Rupiah Indonesia</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="SGD">SGD — Singapore Dollar</option>
                    <option value="MYR">MYR — Malaysian Ringgit</option>
                  </select>
                </Field>
              </div>

              <div className="settings-save-bar">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSave(['store_name', 'store_phone', 'store_address', 'currency'])}
                  disabled={saving}
                >
                  <Save size={15} style={{ marginRight: 6 }} />
                  {saving ? 'Menyimpan...' : 'Simpan Informasi Toko'}
                </button>
              </div>
            </SectionCard>
          )}

          {/* ══ Tab 2: Transaksi & Kasir ════════════════════════════════════ */}
          {activeTab === 'cashier' && (
            <SectionCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#16a34a" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Transaksi & Kasir</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary)' }}>Konfigurasi pajak, poin loyalitas, dan stok</p>
                </div>
              </div>

              {/* Pajak */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--retail-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pajak / PPN</p>
                <ToggleSwitch
                  checked={!!settings.enable_tax}
                  onChange={v => set('enable_tax', v)}
                  label="Aktifkan Pajak (PPN)"
                  description="Pajak akan dihitung otomatis pada setiap transaksi kasir"
                />
                {settings.enable_tax && (
                  <div style={{ marginTop: 16 }}>
                    <Field label="Tarif Pajak (%)" hint="Persentase PPN yang dikenakan per transaksi">
                      <div style={{ position: 'relative', maxWidth: 200 }}>
                        <Percent size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                        <input
                          type="number" step="0.01" min="0" max="100" className="form-input"
                          value={settings.tax_rate || 0}
                          onChange={e => set('tax_rate', e.target.value)}
                          style={{ paddingLeft: 36, maxWidth: 200 }}
                        />
                      </div>
                    </Field>
                  </div>
                )}
              </div>

              {/* Loyalitas */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--retail-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Program Loyalitas</p>
                <ToggleSwitch
                  checked={!!settings.enable_loyalty}
                  onChange={v => set('enable_loyalty', v)}
                  label="Aktifkan Poin Loyalitas"
                  description="Pelanggan mendapatkan poin dari setiap pembelian"
                />
                {settings.enable_loyalty && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Field
                      label="Syarat Mendapat Poin (Belanja Rp X = 1 Poin)"
                      hint={`Setiap belanja Rp ${Math.round(Number(settings.points_ratio || 0)).toLocaleString('id-ID')} = 1 poin`}
                    >
                      <div style={{ position: 'relative', maxWidth: 220 }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--retail-text-secondary)', fontWeight: 600 }}>Rp</span>
                        <input
                          type="number" min="1" className="form-input"
                          value={settings.points_ratio || 10000}
                          onChange={e => set('points_ratio', e.target.value)}
                          style={{ paddingLeft: 36, maxWidth: 220 }}
                        />
                      </div>
                    </Field>

                    <Field
                      label="Nilai Penukaran Poin (1 Poin = Diskon Rp Y)"
                      hint={`Saat ditukarkan, 1 Poin memotong tagihan sebesar Rp ${Math.round(Number(settings.point_value_rupiah || 1)).toLocaleString('id-ID')}`}
                    >
                      <div style={{ position: 'relative', maxWidth: 220 }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--retail-text-secondary)', fontWeight: 600 }}>Rp</span>
                        <input
                          type="number" min="1" step="0.01" className="form-input"
                          value={settings.point_value_rupiah || 1}
                          onChange={e => set('point_value_rupiah', e.target.value)}
                          style={{ paddingLeft: 36, maxWidth: 220 }}
                        />
                      </div>
                    </Field>
                  </div>
                )}
              </div>

              {/* Stok */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--retail-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Manajemen Stok</p>
                <Field
                  label="Ambang Stok Rendah Default"
                  hint="Produk akan ditandai stok rendah jika jumlah di bawah nilai ini (default untuk produk baru)"
                >
                  <div style={{ position: 'relative', maxWidth: 200 }}>
                    <Package size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                    <input
                      type="number" min="0" step="1" className="form-input"
                      value={settings.low_stock_default_threshold || 5}
                      onChange={e => set('low_stock_default_threshold', e.target.value)}
                      style={{ paddingLeft: 36, maxWidth: 200 }}
                    />
                  </div>
                </Field>
              </div>

              <div className="settings-save-bar">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSave(['enable_tax', 'tax_rate', 'enable_loyalty', 'points_ratio', 'point_value_rupiah', 'low_stock_default_threshold'])}
                  disabled={saving}
                >
                  <Save size={15} style={{ marginRight: 6 }} />
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan Transaksi'}
                </button>
              </div>
            </SectionCard>
          )}

          {/* ══ Tab 3: Struk & Print ════════════════════════════════════════ */}
          {activeTab === 'receipt' && (
            <div style={{ display: 'flex', gap: 20 }}>
              <SectionCard style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#d97706" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Struk & Print</h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary)' }}>Kustomisasi tampilan struk kasir</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Field label="Header Struk" hint="Teks yang muncul di bagian atas struk (dibawah nama toko)">
                    <textarea
                      className="form-input" rows={3}
                      placeholder="cth. Selamat datang! Kami melayani dengan sepenuh hati."
                      value={settings.receipt_header || ''}
                      onChange={e => set('receipt_header', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </Field>
                  <Field label="Catatan Kaki Struk" hint="Teks yang muncul di bagian bawah struk">
                    <textarea
                      className="form-input" rows={3}
                      placeholder="cth. Terima kasih telah berbelanja! Barang yang sudah dibeli tidak dapat dikembalikan."
                      value={settings.receipt_footer || ''}
                      onChange={e => set('receipt_footer', e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </Field>
                </div>

                <div className="settings-save-bar">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSave(['receipt_header', 'receipt_footer'])}
                    disabled={saving}
                  >
                    <Save size={15} style={{ marginRight: 6 }} />
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan Struk'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPreviewStruk(v => !v)}
                  >
                    {previewStruk ? <EyeOff size={15} style={{ marginRight: 6 }} /> : <Eye size={15} style={{ marginRight: 6 }} />}
                    {previewStruk ? 'Sembunyikan' : 'Preview Struk'}
                  </button>
                </div>
              </SectionCard>

              {/* Preview panel */}
              {previewStruk && (
                <div style={{ width: 300, flexShrink: 0 }}>
                  <SectionCard>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--retail-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Preview Struk</p>
                    <div className="struk-preview">
                      <div className="center">
                        <strong style={{ fontSize: 14 }}>{settings.store_name || 'Nama Toko'}</strong>
                        {settings.store_phone && <div>{settings.store_phone}</div>}
                        {settings.store_address && <div style={{ fontSize: 11 }}>{settings.store_address}</div>}
                      </div>
                      {settings.receipt_header && (
                        <>
                          <hr />
                          <div className="center" style={{ fontSize: 11, fontStyle: 'italic' }}>{settings.receipt_header}</div>
                        </>
                      )}
                      <hr />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Produk A</span><span>Rp 25.000</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Produk B x2</span><span>Rp 40.000</span></div>
                      <hr />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>Rp 65.000</span></div>
                      {settings.enable_tax && Number(settings.tax_rate) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>PPN {settings.tax_rate}%</span>
                          <span>Rp {Math.round(65000 * settings.tax_rate / 100).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <hr />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>TOTAL</span>
                        <span>Rp {Math.round(65000 * (1 + (settings.enable_tax ? Number(settings.tax_rate) / 100 : 0))).toLocaleString('id-ID')}</span>
                      </div>
                      {settings.receipt_footer && (
                        <>
                          <hr />
                          <div className="center" style={{ fontSize: 11, fontStyle: 'italic' }}>{settings.receipt_footer}</div>
                        </>
                      )}
                      <hr />
                      <div className="center" style={{ fontSize: 11 }}>Terima kasih!</div>
                    </div>
                  </SectionCard>
                </div>
              )}
            </div>
          )}

          {/* ══ Tab 4: Pembayaran / QRIS ════════════════════════════════════ */}
          {activeTab === 'payment' && (
            <SectionCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} color="#16a34a" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Pembayaran QRIS</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary)' }}>Upload gambar QR Code pembayaran toko Anda</p>
                </div>
              </div>

              {/* QRIS preview */}
              {settings.qris_image_url ? (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    display: 'inline-block', padding: 16, background: '#f8fafc',
                    border: '1px solid var(--retail-border)', borderRadius: 16, marginBottom: 16
                  }}>
                    <img
                      src={settings.qris_image_url}
                      alt="QRIS"
                      style={{ width: 200, height: 200, objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => qrisInputRef.current?.click()}
                      disabled={qrisUploading}
                    >
                      <Upload size={15} style={{ marginRight: 6 }} />
                      Ganti QRIS
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                      onClick={handleQrisDelete}
                    >
                      <Trash2 size={15} style={{ marginRight: 6 }} />
                      Hapus QRIS
                    </button>
                  </div>
                </div>
              ) : (
                /* Drop zone */
                <div
                  style={{
                    border: '2px dashed var(--retail-border, #e2e8f0)',
                    borderRadius: 16, padding: '48px 24px', textAlign: 'center',
                    cursor: 'pointer', transition: 'border-color 0.2s ease, background 0.2s ease',
                    background: '#f8fafc', marginBottom: 20
                  }}
                  onClick={() => qrisInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleQrisUpload(e.dataTransfer.files[0]); }}
                >
                  {qrisUploading ? (
                    <div style={{ color: 'var(--retail-text-secondary)' }}>
                      <div style={{ fontSize: 13 }}>Mengupload...</div>
                    </div>
                  ) : (
                    <>
                      <QrCode size={48} style={{ color: 'var(--retail-text-secondary)', marginBottom: 12 }} />
                      <p style={{ fontWeight: 600, color: 'var(--retail-text-primary)', margin: '0 0 6px 0' }}>Upload Gambar QRIS</p>
                      <p style={{ fontSize: 13, color: 'var(--retail-text-secondary)', margin: 0 }}>
                        Klik atau seret file ke sini<br />
                        <span style={{ fontSize: 12 }}>JPG, PNG, WebP — maks. 2 MB</span>
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={qrisInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={e => handleQrisUpload(e.target.files[0])}
              />

              <div style={{
                background: 'var(--retail-bg-base, #f8fafc)',
                border: '1px solid var(--retail-border)', borderRadius: 12, padding: '14px 18px',
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--retail-text-primary)', margin: '0 0 6px 0' }}>💡 Cara penggunaan QRIS</p>
                <ul style={{ fontSize: 13, color: 'var(--retail-text-secondary)', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                  <li>Upload gambar QRIS yang diterbitkan oleh bank atau penyedia pembayaran Anda</li>
                  <li>Gambar QRIS akan muncul sebagai opsi pembayaran di layar kasir (POS)</li>
                  <li>Pastikan kode QR terlihat jelas dan tidak terpotong</li>
                </ul>
              </div>
            </SectionCard>
          )}

          {/* ══ Tab 5: Verifikasi Usaha (KYC) ════════════════════════════════ */}
          {activeTab === 'kyc' && (
            <SectionCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Verifikasi Usaha (KYC)</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary)' }}>Unggah dokumen identitas untuk verifikasi akun</p>
                </div>
              </div>

              {!kyc ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Memuat status verifikasi...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {kyc.kyc_status === 'pending' && (
                    <div className="alert" style={{ background: '#fef3c7', color: '#92400e', padding: 16, borderRadius: 10, fontSize: 13 }}>
                      <strong>Menunggu Verifikasi:</strong> Dokumen Anda sedang ditinjau oleh tim kami. Harap menunggu hingga proses verifikasi selesai.
                    </div>
                  )}
                  {kyc.kyc_status === 'verified' && (
                    <div className="alert" style={{ background: '#dcfce7', color: '#166534', padding: 16, borderRadius: 10, fontSize: 13 }}>
                      <strong>Terverifikasi:</strong> Akun usaha Anda telah diverifikasi. Terima kasih!
                    </div>
                  )}
                  {kyc.kyc_status === 'rejected' && (
                    <div className="alert" style={{ background: '#fee2e2', color: '#991b1b', padding: 16, borderRadius: 10, fontSize: 13 }}>
                      <strong>Verifikasi Ditolak:</strong> {kyc.kyc_notes} <br/><br/>
                      Silakan unggah ulang dokumen yang sesuai.
                    </div>
                  )}
                  {(kyc.kyc_status === 'unverified' || kyc.kyc_status === 'rejected') && (
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={kycInputRef} 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files[0]) handleKycUpload(e.target.files[0]);
                          e.target.value = null;
                        }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={() => kycInputRef.current?.click()}
                        disabled={kycUploading}
                      >
                        {kycUploading ? 'Mengunggah...' : 'Unggah Dokumen (KTP / NIB)'}
                      </button>
                      <p style={{ fontSize: 12, color: 'var(--retail-text-secondary)', marginTop: 8 }}>Format: JPG, PNG. Maks: 2MB.</p>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          )}

          {/* ══ Tab 6: Backup Data ═════════════════════════════════════════ */}
          {activeTab === 'backup' && (
            <SectionCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={20} color="#0284c7" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Backup & Keamanan Data Toko</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary)' }}>Atur jadwal backup otomatis ke email atau unduh data toko dalam format Excel / JSON</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* ── 1. Jadwal Backup Otomatis ke Email ── */}
                <div style={{ padding: 20, border: '1px solid var(--retail-border)', borderRadius: 12, background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Clock size={18} color="var(--retail-primary, #4318FF)" />
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Jadwal Backup Otomatis ke Email</h4>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--retail-text-secondary)' }}>
                    Sistem server Bizora akan secara otomatis mengekstrak seluruh data produk, stok, dan transaksi toko Anda lalu mengirimkannya ke email pemilik.
                  </p>

                  <ToggleSwitch
                    label="Aktifkan Backup Otomatis"
                    description="Kirimkan file backup data toko secara berkala ke alamat email tanpa perlu tindakan manual."
                    checked={autoBackupEnabled}
                    onChange={setAutoBackupEnabled}
                  />

                  {autoBackupEnabled && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeIn 0.2s ease-in' }}>
                      {/* Pilihan Format File */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--retail-text-primary)', marginBottom: 8 }}>
                          Format File Backup
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                          {[
                            {
                              id: 'excel',
                              label: 'Microsoft Excel (.xlsx)',
                              desc: 'Sangat mudah dibaca di Excel, Google Sheets, atau aplikasi HP. Terbagi atas sheet Produk, Transaksi, Pelanggan, & Supplier.',
                              icon: FileSpreadsheet,
                              color: '#16a34a',
                              bg: 'rgba(22, 163, 74, 0.08)'
                            },
                            {
                              id: 'json',
                              label: 'JSON Data (.json)',
                              desc: 'Format data terstruktur untuk arsip teknis sistem dan kebutuhan restore database.',
                              icon: FileCode,
                              color: '#0284c7',
                              bg: 'rgba(2, 132, 199, 0.08)'
                            },
                          ].map(fmt => {
                            const isSelected = autoBackupFormat === fmt.id;
                            const IconComponent = fmt.icon;
                            return (
                              <div
                                key={fmt.id}
                                onClick={() => setAutoBackupFormat(fmt.id)}
                                style={{
                                  padding: '14px',
                                  borderRadius: 10,
                                  border: isSelected ? `2px solid ${fmt.color}` : '1px solid var(--retail-border, #e2e8f0)',
                                  background: isSelected ? fmt.bg : '#f8fafc',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <IconComponent size={18} color={fmt.color} />
                                    <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? fmt.color : 'var(--retail-text-primary)' }}>
                                      {fmt.label}
                                    </span>
                                  </div>
                                  {isSelected && <Check size={16} color={fmt.color} />}
                                </div>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--retail-text-secondary)', lineHeight: 1.4 }}>
                                  {fmt.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Email Tujuan */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--retail-text-primary)', marginBottom: 6 }}>
                          Alamat Email Penerima Backup
                        </label>
                        <div style={{ position: 'relative', maxWidth: 450 }}>
                          <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                          <input
                            type="email"
                            className="form-input"
                            placeholder="nama@email.com"
                            value={autoBackupEmail}
                            onChange={e => setAutoBackupEmail(e.target.value)}
                            style={{ paddingLeft: 38 }}
                          />
                        </div>
                      </div>

                      {/* Pilihan Frekuensi */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--retail-text-primary)', marginBottom: 8 }}>
                          Frekuensi Pengiriman
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                          {[
                            { id: 'daily', label: 'Harian (Daily)', desc: 'Setiap hari jam 02:00 WIB' },
                            { id: 'weekly', label: 'Mingguan (Weekly)', desc: 'Setiap hari Minggu jam 02:00 WIB' },
                            { id: 'monthly', label: 'Bulanan (Monthly)', desc: 'Setiap tanggal 1 jam 02:00 WIB' },
                          ].map(opt => {
                            const isSelected = autoBackupFrequency === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setAutoBackupFrequency(opt.id)}
                                style={{
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: isSelected ? '2px solid var(--retail-primary, #4318FF)' : '1px solid var(--retail-border, #e2e8f0)',
                                  background: isSelected ? 'var(--retail-primary-subtle, rgba(67, 24, 255, 0.05))' : '#f8fafc',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--retail-primary, #4318FF)' : 'var(--retail-text-primary)' }}>
                                    {opt.label}
                                  </span>
                                  {isSelected && <Check size={14} color="var(--retail-primary, #4318FF)" />}
                                </div>
                                <span style={{ fontSize: 11.5, color: 'var(--retail-text-secondary)' }}>{opt.desc}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status Terakhir */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--retail-text-secondary)', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                        <Calendar size={15} />
                        <span>
                          Status: {lastAutoBackupAt ? `Backup terakhir terkirim pada ${new Date(lastAutoBackupAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB` : 'Belum ada riwayat pengiriman backup otomatis.'}
                        </span>
                      </div>

                      <div>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={savingAutoBackup}
                          onClick={async () => {
                            setSavingAutoBackup(true);
                            try {
                              const res = await api.post('/retail/settings/backup/config', {
                                auto_backup_enabled: autoBackupEnabled,
                                auto_backup_frequency: autoBackupFrequency,
                                auto_backup_format: autoBackupFormat,
                                auto_backup_email: autoBackupEmail,
                              });
                              showToast(res.data.message || 'Pengaturan backup otomatis berhasil disimpan');
                            } catch (e) {
                              showToast(e.response?.data?.message || 'Gagal menyimpan pengaturan backup', 'error');
                            } finally {
                              setSavingAutoBackup(false);
                            }
                          }}
                        >
                          <Save size={15} style={{ marginRight: 6 }} />
                          {savingAutoBackup ? 'Menyimpan...' : 'Simpan Pengaturan Jadwal'}
                        </button>
                      </div>
                    </div>
                  )}

                  {!autoBackupEnabled && (
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={savingAutoBackup}
                        onClick={async () => {
                          setSavingAutoBackup(true);
                          try {
                            const res = await api.post('/retail/settings/backup/config', {
                              auto_backup_enabled: false,
                              auto_backup_frequency: autoBackupFrequency,
                              auto_backup_format: autoBackupFormat,
                              auto_backup_email: autoBackupEmail,
                            });
                            showToast(res.data.message || 'Pengaturan backup berhasil disimpan');
                          } catch (e) {
                            showToast('Gagal menyimpan pengaturan backup', 'error');
                          } finally {
                            setSavingAutoBackup(false);
                          }
                        }}
                      >
                        <Save size={15} style={{ marginRight: 6 }} />
                        {savingAutoBackup ? 'Menyimpan...' : 'Simpan Status'}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 2. Unduh Backup Manual ── */}
                <div style={{ padding: 20, border: '1px solid var(--retail-border)', borderRadius: 12, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Download size={18} color="#0284c7" />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Unduh Manual ke Perangkat</h4>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--retail-text-secondary)' }}>
                    Pilih format file dan unduh seketika ke komputer atau smartphone Anda:
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={backupDownloading}
                      style={{ background: '#16a34a', borderColor: '#16a34a' }}
                      onClick={async () => {
                        setBackupDownloading(true);
                        try {
                          const res = await api.get('/retail/settings/backup?format=excel', { responseType: 'blob' });
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `backup_retail_${new Date().toISOString().slice(0,10)}.xlsx`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          showToast('File Excel backup berhasil diunduh');
                        } catch (e) {
                          showToast('Gagal mengunduh file Excel backup', 'error');
                        } finally {
                          setBackupDownloading(false);
                        }
                      }}
                    >
                      <FileSpreadsheet size={16} style={{ marginRight: 8 }} />
                      {backupDownloading ? 'Mengunduh...' : 'Unduh Excel (.xlsx)'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={backupDownloading}
                      onClick={async () => {
                        setBackupDownloading(true);
                        try {
                          const res = await api.get('/retail/settings/backup?format=json', { responseType: 'blob' });
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `backup_retail_${new Date().toISOString().slice(0,10)}.json`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          showToast('File JSON backup berhasil diunduh');
                        } catch (e) {
                          showToast('Gagal mengunduh file JSON backup', 'error');
                        } finally {
                          setBackupDownloading(false);
                        }
                      }}
                    >
                      <FileCode size={16} style={{ marginRight: 8 }} />
                      {backupDownloading ? 'Mengunduh...' : 'Unduh JSON (.json)'}
                    </button>
                  </div>
                </div>

                {/* ── 3. Kirim via Email Manual (On-Demand) ── */}
                <div style={{ padding: 20, border: '1px solid var(--retail-border)', borderRadius: 12, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Mail size={18} color="#0284c7" />
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--retail-text-primary)' }}>Kirim Manual via Email Sekarang</h4>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--retail-text-secondary)' }}>
                    Kirimkan salinan data saat ini dalam format pilihan Anda ke alamat email tujuan.
                  </p>
                  
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--retail-text-primary)' }}>Format:</span>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="manualFormat"
                        value="excel"
                        checked={manualEmailFormat === 'excel'}
                        onChange={() => setManualEmailFormat('excel')}
                      />
                      Excel (.xlsx)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginLeft: 10 }}>
                      <input
                        type="radio"
                        name="manualFormat"
                        value="json"
                        checked={manualEmailFormat === 'json'}
                        onChange={() => setManualEmailFormat('json')}
                      />
                      JSON (.json)
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 12, maxWidth: 460 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Masukkan alamat email"
                        value={backupEmail}
                        onChange={e => setBackupEmail(e.target.value)}
                        style={{ paddingLeft: 38 }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={backupEmailing || !backupEmail}
                      onClick={async () => {
                        if (!backupEmail) return;
                        setBackupEmailing(true);
                        try {
                          const res = await api.post('/retail/settings/backup/email', {
                            email: backupEmail,
                            format: manualEmailFormat
                          });
                          showToast(res.data.message || 'Backup berhasil dikirim ke email');
                        } catch (e) {
                          showToast(e.response?.data?.message || 'Gagal mengirim email backup', 'error');
                        } finally {
                          setBackupEmailing(false);
                        }
                      }}
                    >
                      {backupEmailing ? 'Mengirim...' : 'Kirim Sekarang'}
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
