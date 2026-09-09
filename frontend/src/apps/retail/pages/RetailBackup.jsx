import React, { useState, useEffect } from 'react';
import {
  Archive, Download, Mail, Save, CheckCircle2, AlertCircle,
  FileSpreadsheet, FileCode, ShieldCheck, Clock, Calendar,
  Package, ShoppingCart, Users, Truck, Wallet, Layers, Database,
  ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '../../../lib/api';
import RetailLoading from '../components/RetailLoading';
import '../retail.css';

const DATA_SCOPES = [
  {
    icon: Package,
    title: 'Katalog & Produk',
    desc: 'Master produk, varian, SKU, harga grosir, batch exp date, & serial number.',
    color: '#4318FF',
    bg: 'rgba(67, 24, 255, 0.08)'
  },
  {
    icon: Layers,
    title: 'Inventaris & Stok',
    desc: 'Saldo stok toko/gudang, log mutasi keluar-masuk, transfer & stock opname.',
    color: '#05CD99',
    bg: 'rgba(5, 205, 153, 0.08)'
  },
  {
    icon: ShoppingCart,
    title: 'Transaksi & POS',
    desc: 'Struk penjualan kasir, rincian item, metode pembayaran, diskon & retur.',
    color: '#FFB533',
    bg: 'rgba(255, 181, 51, 0.08)'
  },
  {
    icon: Wallet,
    title: 'Keuangan & Kas',
    desc: 'Catatan kas masuk/keluar, buku hutang supplier, & piutang pelanggan.',
    color: '#707EAE',
    bg: 'rgba(112, 126, 174, 0.08)'
  },
  {
    icon: Users,
    title: 'Pelanggan & CRM',
    desc: 'Database pelanggan, poin loyalitas, riwayat belanja, dan kontak.',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.08)'
  },
  {
    icon: Truck,
    title: 'Supplier & Outlet',
    desc: 'Data vendor supplier, purchase orders (PO), dan seluruh cabang toko.',
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)'
  },
];

export default function RetailBackup() {
  const [loading, setLoading] = useState(true);
  const [backup, setBackup] = useState({
    auto_backup_enabled: false,
    auto_backup_frequency: 'weekly',
    auto_backup_format: 'excel',
    auto_backup_email: '',
    last_auto_backup_at: null,
  });

  const [emailInput, setEmailInput] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualFormat, setManualFormat] = useState('excel');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(null); // 'excel' | 'json' | null
  const [emailing, setEmailing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    fetchBackupConfig();
  }, []);

  const fetchBackupConfig = async () => {
    try {
      const res = await api.get('/retail/settings/backup/config');
      if (res.data?.success) {
        setBackup(res.data.data);
        const email = res.data.data.auto_backup_email || '';
        setEmailInput(email);
        setManualEmail(email);
      }
    } catch (err) {
      console.error('Failed to load retail backup config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/retail/settings/backup/config', {
        auto_backup_enabled: backup.auto_backup_enabled,
        auto_backup_frequency: backup.auto_backup_frequency,
        auto_backup_format: backup.auto_backup_format,
        auto_backup_email: emailInput,
      });
      if (res.data?.success) {
        setBackup(res.data.data);
        showToast('Konfigurasi backup otomatis berhasil disimpan!');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Gagal menyimpan konfigurasi backup.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (fmt) => {
    setDownloading(fmt);
    try {
      const res = await api.get(`/retail/settings/backup?format=${fmt}`, { responseType: 'blob' });
      const ext = fmt === 'json' ? 'json' : 'xlsx';
      const mime = fmt === 'json'
        ? 'application/json'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_retail_${new Date().toISOString().slice(0, 10)}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`File cadangan ${fmt.toUpperCase()} berhasil diunduh ke perangkat Anda!`);
    } catch (err) {
      showToast('Gagal mengunduh file backup retail.', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleEmailBackup = async () => {
    const targetEmail = manualEmail || emailInput;
    if (!targetEmail) {
      showToast('Masukkan alamat email tujuan terlebih dahulu.', 'error');
      return;
    }
    setEmailing(true);
    try {
      const res = await api.post('/retail/settings/backup/email', {
        email: targetEmail,
        format: manualFormat,
      });
      if (res.data?.success) {
        showToast(res.data.message || `File backup berhasil dikirimkan ke ${targetEmail}`);
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Gagal mengirim backup via email.', 'error');
    } finally {
      setEmailing(false);
    }
  };

  if (loading) {
    return <RetailLoading message="Memuat modul cadangan & backup data toko..." />;
  }

  const formatLastBackup = (dateStr) => {
    if (!dateStr) return 'Belum Pernah';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="retail-dashboard-spacing" style={{ padding: '0 0 40px 0' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 20px',
          borderRadius: 12,
          background: toast.type === 'error' ? '#EF4444' : '#05CD99',
          color: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          fontWeight: 600,
          fontSize: 14,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--retail-primary-subtle, rgba(67, 24, 255, 0.1))',
            color: 'var(--retail-primary, #4318FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Archive size={24} />
          </div>
          <div>
            <h1 className="retail-title" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
              Backup & Cadangan Data Toko
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--retail-text-secondary, #A3AED0)' }}>
              Amankan dan cadangkan seluruh riwayat transaksi, katalog produk, inventaris stok, serta laporan keuangan toko Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Card 1: Status */}
        <div style={{
          background: 'var(--retail-card-bg, #FFFFFF)',
          border: '1px solid var(--retail-border, #E2E8F0)',
          borderRadius: 16,
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'var(--retail-shadow)'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: backup.auto_backup_enabled ? 'rgba(5, 205, 153, 0.12)' : 'rgba(238, 93, 80, 0.12)',
            color: backup.auto_backup_enabled ? '#05CD99' : '#EE5D50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="retail-label" style={{ display: 'block', fontSize: 11, fontWeight: 600 }}>Otomasi Cloud</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>
              {backup.auto_backup_enabled ? 'Aktif Terjadwal' : 'Nonaktif'}
            </div>
          </div>
        </div>

        {/* Card 2: Frequency */}
        <div style={{
          background: 'var(--retail-card-bg, #FFFFFF)',
          border: '1px solid var(--retail-border, #E2E8F0)',
          borderRadius: 16,
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'var(--retail-shadow)'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(67, 24, 255, 0.1)',
            color: '#4318FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={22} />
          </div>
          <div>
            <span className="retail-label" style={{ display: 'block', fontSize: 11, fontWeight: 600 }}>Frekuensi Backup</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>
              {backup.auto_backup_frequency === 'daily' ? 'Harian (02:00)' : backup.auto_backup_frequency === 'monthly' ? 'Bulanan' : 'Mingguan'}
            </div>
          </div>
        </div>

        {/* Card 3: Default Format */}
        <div style={{
          background: 'var(--retail-card-bg, #FFFFFF)',
          border: '1px solid var(--retail-border, #E2E8F0)',
          borderRadius: 16,
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'var(--retail-shadow)'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(255, 181, 51, 0.12)',
            color: '#FFB533',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {backup.auto_backup_format === 'json' ? <FileCode size={22} /> : <FileSpreadsheet size={22} />}
          </div>
          <div>
            <span className="retail-label" style={{ display: 'block', fontSize: 11, fontWeight: 600 }}>Format Berkas</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--retail-text-primary)' }}>
              {backup.auto_backup_format === 'json' ? 'JSON Structure' : 'Excel (.xlsx)'}
            </div>
          </div>
        </div>

        {/* Card 4: Last Backup */}
        <div style={{
          background: 'var(--retail-card-bg, #FFFFFF)',
          border: '1px solid var(--retail-border, #E2E8F0)',
          borderRadius: 16,
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'var(--retail-shadow)'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(112, 126, 174, 0.12)',
            color: '#707EAE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <span className="retail-label" style={{ display: 'block', fontSize: 11, fontWeight: 600 }}>Backup Terakhir</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--retail-text-primary)' }}>
              {formatLastBackup(backup.last_auto_backup_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & Instant Backup */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 24,
        marginBottom: 28
      }}>
        {/* Left Column: Scheduled Auto-Backup Form */}
        <div style={{
          background: 'var(--retail-card-bg, #FFFFFF)',
          border: '1px solid var(--retail-border, #E2E8F0)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--retail-shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Calendar size={20} color="var(--retail-primary, #4318FF)" />
            <h3 className="retail-card-title" style={{ margin: 0, fontSize: 16 }}>
              Otomasi Jadwal Backup Cloud
            </h3>
          </div>
          <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'var(--retail-text-secondary, #A3AED0)' }}>
            Bizora akan secara otomatis membuat arsip cadangan data toko dan mengirimkannya ke email Anda sesuai jadwal.
          </p>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Toggle Active */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 12,
              background: 'var(--retail-bg, #F4F7FE)',
              border: '1px solid var(--retail-border, #E2E8F0)'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--retail-text-primary)' }}>
                  Status Backup Otomatis
                </div>
                <div style={{ fontSize: 12, color: 'var(--retail-text-secondary)' }}>
                  {backup.auto_backup_enabled ? 'Sistem aktif membuat cadangan otomatis' : 'Otomasi cadangan nonaktif'}
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={backup.auto_backup_enabled}
                  onChange={e => setBackup(prev => ({ ...prev, auto_backup_enabled: e.target.checked }))}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: backup.auto_backup_enabled ? 'var(--retail-primary, #4318FF)' : '#cbd5e1',
                  transition: '.3s',
                  borderRadius: 24
                }}>
                  <span style={{
                    position: 'absolute',
                    height: 18, width: 18,
                    left: backup.auto_backup_enabled ? 22 : 3,
                    bottom: 3,
                    backgroundColor: 'white',
                    transition: '.3s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>

            {/* Frequency Selection */}
            <div>
              <label className="retail-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Frekuensi Eksekusi
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { id: 'daily', label: 'Harian', desc: 'Tiap 02:00' },
                  { id: 'weekly', label: 'Mingguan', desc: 'Tiap Minggu' },
                  { id: 'monthly', label: 'Bulanan', desc: 'Awal Bulan' }
                ].map(freq => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setBackup(prev => ({ ...prev, auto_backup_frequency: freq.id }))}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: backup.auto_backup_frequency === freq.id
                        ? '2px solid var(--retail-primary, #4318FF)'
                        : '1px solid var(--retail-border, #E2E8F0)',
                      background: backup.auto_backup_frequency === freq.id
                        ? 'var(--retail-primary-subtle, rgba(67, 24, 255, 0.08))'
                        : 'var(--retail-card-bg, #FFFFFF)',
                      color: backup.auto_backup_frequency === freq.id
                        ? 'var(--retail-primary, #4318FF)'
                        : 'var(--retail-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{freq.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--retail-text-secondary)', marginTop: 2 }}>{freq.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="retail-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Format File Otomatis
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setBackup(prev => ({ ...prev, auto_backup_format: 'excel' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: backup.auto_backup_format === 'excel'
                      ? '2px solid #05CD99'
                      : '1px solid var(--retail-border, #E2E8F0)',
                    background: backup.auto_backup_format === 'excel'
                      ? 'rgba(5, 205, 153, 0.08)'
                      : 'var(--retail-card-bg, #FFFFFF)',
                    color: backup.auto_backup_format === 'excel' ? '#05CD99' : 'var(--retail-text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <FileSpreadsheet size={18} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Excel (.xlsx)</div>
                    <div style={{ fontSize: 10, color: 'var(--retail-text-secondary)' }}>Multi-sheet spreadsheet</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBackup(prev => ({ ...prev, auto_backup_format: 'json' }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: backup.auto_backup_format === 'json'
                      ? '2px solid #4318FF'
                      : '1px solid var(--retail-border, #E2E8F0)',
                    background: backup.auto_backup_format === 'json'
                      ? 'rgba(67, 24, 255, 0.08)'
                      : 'var(--retail-card-bg, #FFFFFF)',
                    color: backup.auto_backup_format === 'json' ? '#4318FF' : 'var(--retail-text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <FileCode size={18} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>JSON Schema</div>
                    <div style={{ fontSize: 10, color: 'var(--retail-text-secondary)' }}>Database raw format</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="retail-label" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                Email Penerima Arsip Terjadwal
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                <input
                  type="email"
                  placeholder="contoh: owner.toko@gmail.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 10,
                    border: '1px solid var(--retail-border, #E2E8F0)',
                    background: 'var(--retail-card-bg, #FFFFFF)',
                    color: 'var(--retail-text-primary)',
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'var(--retail-primary, #4318FF)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(67, 24, 255, 0.25)',
                marginTop: 6
              }}
            >
              <Save size={16} />
              {saving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Otomasi'}
            </button>
          </form>
        </div>

        {/* Right Column: Instant Manual Backup & Export */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Action 1: Instant Download */}
          <div style={{
            background: 'var(--retail-card-bg, #FFFFFF)',
            border: '1px solid var(--retail-border, #E2E8F0)',
            borderRadius: 16,
            padding: 24,
            boxShadow: 'var(--retail-shadow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Download size={20} color="#05CD99" />
              <h3 className="retail-card-title" style={{ margin: 0, fontSize: 16 }}>
                Unduh Manual (Instan)
              </h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--retail-text-secondary)' }}>
              Unduh salinan berkas data toko terkini secara langsung ke komputer atau smartphone Anda:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                disabled={!!downloading}
                onClick={() => handleDownload('excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid #05CD99',
                  background: 'rgba(5, 205, 153, 0.08)',
                  color: '#05CD99',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <FileSpreadsheet size={16} />
                {downloading === 'excel' ? 'Mengunduh...' : 'Unduh Excel (.xlsx)'}
              </button>

              <button
                type="button"
                disabled={!!downloading}
                onClick={() => handleDownload('json')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid var(--retail-primary, #4318FF)',
                  background: 'var(--retail-primary-subtle, rgba(67, 24, 255, 0.08))',
                  color: 'var(--retail-primary, #4318FF)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: downloading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <FileCode size={16} />
                {downloading === 'json' ? 'Mengunduh...' : 'Unduh JSON (.json)'}
              </button>
            </div>
          </div>

          {/* Action 2: Send to Email Now */}
          <div style={{
            background: 'var(--retail-card-bg, #FFFFFF)',
            border: '1px solid var(--retail-border, #E2E8F0)',
            borderRadius: 16,
            padding: 24,
            boxShadow: 'var(--retail-shadow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Mail size={20} color="#FFB533" />
              <h3 className="retail-card-title" style={{ margin: 0, fontSize: 16 }}>
                Kirim Salinan ke Email Sekarang
              </h3>
            </div>
            <p style={{ margin: '0 0 14px 0', fontSize: 13, color: 'var(--retail-text-secondary)' }}>
              Kirimkan arsip data toko saat ini ke alamat email spesifik tanpa menunggu jadwal otomatis:
            </p>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--retail-text-secondary)' }}>Format:</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--retail-text-primary)' }}>
                <input
                  type="radio"
                  name="manualFormat"
                  value="excel"
                  checked={manualFormat === 'excel'}
                  onChange={() => setManualFormat('excel')}
                />
                Excel Spreadsheet
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--retail-text-primary)' }}>
                <input
                  type="radio"
                  name="manualFormat"
                  value="json"
                  checked={manualFormat === 'json'}
                  onChange={() => setManualFormat('json')}
                />
                JSON Data
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--retail-text-secondary)' }} />
                <input
                  type="email"
                  placeholder="Email tujuan pengiriman"
                  value={manualEmail}
                  onChange={e => setManualEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: 10,
                    border: '1px solid var(--retail-border, #E2E8F0)',
                    background: 'var(--retail-card-bg, #FFFFFF)',
                    color: 'var(--retail-text-primary)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="button"
                disabled={emailing || !manualEmail}
                onClick={handleEmailBackup}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: '#FFB533',
                  color: '#1B2559',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: emailing || !manualEmail ? 'not-allowed' : 'pointer',
                  opacity: emailing || !manualEmail ? 0.6 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                <RefreshCw size={14} className={emailing ? 'animate-spin' : ''} />
                {emailing ? 'Mengirim...' : 'Kirim Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scope of Protected Datasets */}
      <div style={{
        background: 'var(--retail-card-bg, #FFFFFF)',
        border: '1px solid var(--retail-border, #E2E8F0)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--retail-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Database size={20} color="var(--retail-primary, #4318FF)" />
          <h3 className="retail-card-title" style={{ margin: 0, fontSize: 16 }}>
            Cakupan Dataset Toko yang Dicadangkan
          </h3>
        </div>
        <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'var(--retail-text-secondary)' }}>
          Setiap proses pencadangan secara menyeluruh mengekstrak relasi tabel berikut untuk menjamin integritas data saat pemulihan:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16
        }}>
          {DATA_SCOPES.map((scope, idx) => {
            const Icon = scope.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  border: '1px solid var(--retail-border, #E2E8F0)',
                  background: 'var(--retail-bg, #F4F7FE)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: scope.bg,
                  color: scope.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--retail-text-primary)', marginBottom: 3 }}>
                    {scope.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--retail-text-secondary)', lineHeight: 1.4 }}>
                    {scope.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
