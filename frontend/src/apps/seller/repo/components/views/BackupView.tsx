import React, { useState, useEffect } from 'react';
import {
  Database,
  Calendar,
  Mail,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Package,
  Users,
  ShoppingCart,
  Truck,
  BarChart2,
  ShieldCheck,
  DollarSign,
  Store,
  Layers,
} from 'lucide-react';
import { api } from '../../../../../lib/api';

interface AutoBackupSettings {
  auto_backup_enabled: boolean;
  auto_backup_frequency: string;
  auto_backup_format: string;
  auto_backup_email: string;
  last_auto_backup_at: string | null;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export const BackupView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [backup, setBackup] = useState<AutoBackupSettings>({
    auto_backup_enabled: false,
    auto_backup_frequency: 'weekly',
    auto_backup_format: 'excel',
    auto_backup_email: '',
    last_auto_backup_at: null,
  });
  const [emailInput, setEmailInput] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [downloading, setDownloading] = useState<'excel' | 'json' | null>(null);
  const [emailing, setEmailing] = useState<'excel' | 'json' | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/seller/settings/backup/config');
      if (res.data?.success) {
        setBackup(res.data.data);
        const email = res.data.data.auto_backup_email || '';
        setEmailInput(email);
        setManualEmail(email);
      }
    } catch (err) {
      console.error('Failed to fetch Seller backup settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/seller/settings/backup/config', {
        ...backup,
        auto_backup_email: emailInput,
      });
      if (res.data?.success) {
        setBackup(res.data.data);
        showToast('success', 'Pengaturan backup otomatis berhasil disimpan!');
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Gagal menyimpan pengaturan backup.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (fmt: 'excel' | 'json') => {
    setDownloading(fmt);
    try {
      const res = await api.get(`/seller/settings/backup/download?format=${fmt}`, { responseType: 'blob' });
      const ext = fmt === 'json' ? 'json' : 'xlsx';
      const mime = fmt === 'json' ? 'application/json' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_seller_${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('success', `File backup ${fmt.toUpperCase()} berhasil diunduh!`);
    } catch {
      showToast('error', 'Gagal mengunduh file backup.');
    } finally {
      setDownloading(null);
    }
  };

  const handleEmailBackup = async (fmt: 'excel' | 'json') => {
    const targetEmail = manualEmail || emailInput;
    if (!targetEmail) {
      showToast('error', 'Silakan masukkan alamat email tujuan terlebih dahulu.');
      return;
    }
    setEmailing(fmt);
    try {
      const res = await api.post('/seller/settings/backup/email', { email: targetEmail, format: fmt });
      if (res.data?.success) {
        showToast('success', res.data.message);
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Gagal mengirim email backup.');
    } finally {
      setEmailing(null);
    }
  };

  const backupDataItems = [
    { icon: ShoppingCart, title: 'Pesanan & Penjualan', desc: 'Riwayat semua transaksi pesanan online & offline (POS), nomor order, status, pembeli, total.', color: 'text-blue-600 bg-blue-50' },
    { icon: Package, title: 'Katalog Produk', desc: 'Daftar produk, SKU, harga jual, kategori, gambar URL, dan atribut varian produk.', color: 'text-emerald-600 bg-emerald-50' },
    { icon: Store, title: 'Gudang & Stok', desc: 'Lokasi gudang, saldo stok per SKU, riwayat mutasi stok masuk/keluar, dan opname fisik.', color: 'text-amber-600 bg-amber-50' },
    { icon: Truck, title: 'Supplier & Pembelian', desc: 'Data supplier, riwayat penerimaan barang (purchase order), dan nilai pembelian kumulatif.', color: 'text-purple-600 bg-purple-50' },
    { icon: Users, title: 'Data Pelanggan', desc: 'Profil pelanggan, nomor telepon, email, riwayat pembelian, dan poin/loyalitas.', color: 'text-sky-600 bg-sky-50' },
    { icon: DollarSign, title: 'Keuangan & Kas', desc: 'Catatan pengeluaran, pemasukan lain-lain, ringkasan kas harian, dan laporan penjualan.', color: 'text-green-600 bg-green-50' },
    { icon: Layers, title: 'Channel Marketplace', desc: 'Akun terhubung, mapping produk antar channel, riwayat sinkronisasi, dan pengiriman.', color: 'text-indigo-600 bg-indigo-50' },
    { icon: BarChart2, title: 'Profil & Konfigurasi Toko', desc: 'Data toko seller, pengaturan aplikasi, user & peran akses, dan status backup terakhir.', color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Memuat Pengaturan Backup...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── CARD 1: JADWAL BACKUP OTOMATIS ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Jadwal Backup Otomatis</h2>
                  <p className="text-xs text-slate-400">Kirim arsip cadangan ke email secara terjadwal</p>
                </div>
              </div>
              <form onSubmit={handleSaveBackup} className="p-6 space-y-5">

                {/* Toggle */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-800">Status Backup Otomatis</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {backup.auto_backup_enabled ? '🟢 Sistem backup aktif' : '⚪ Backup otomatis nonaktif'}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={backup.auto_backup_enabled}
                      onChange={(e) => setBackup(b => ({ ...b, auto_backup_enabled: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Frekuensi */}
                {backup.auto_backup_enabled && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Frekuensi Pengiriman</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['daily', 'Harian', '02:00 WIB'],
                        ['weekly', 'Mingguan', '7 hari sekali'],
                        ['monthly', 'Bulanan', 'Akhir bulan'],
                      ].map(([val, label, desc]) => (
                        <div
                          key={val}
                          onClick={() => setBackup(b => ({ ...b, auto_backup_frequency: val }))}
                          className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                            backup.auto_backup_frequency === val
                              ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Format */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Format File Backup</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['excel', 'Excel (.xlsx)', 'Bisa dibuka di MS Excel / Sheets', FileSpreadsheet, 'text-emerald-600'],
                      ['json', 'JSON (.json)', 'Format data mentah untuk restore', FileCode, 'text-blue-600'],
                    ].map(([val, label, desc, Icon, iconColor]) => (
                      <div
                        key={val as string}
                        onClick={() => setBackup(b => ({ ...b, auto_backup_format: val as string }))}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          backup.auto_backup_format === val
                            ? 'border-blue-600 bg-blue-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                          <span className={`text-xs font-bold ${backup.auto_backup_format === val ? 'text-blue-700' : 'text-slate-800'}`}>
                            {label as string}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{desc as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Penerima */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Email Penerima Backup Terjadwal</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="owner@tokoseller.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {backup.last_auto_backup_at && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Backup Terakhir:</strong>{' '}
                      {new Date(backup.last_auto_backup_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pengaturan Backup'}
                </button>
              </form>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-6">

              {/* CARD 2: BACKUP MANUAL */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Backup Manual (Instan)</h2>
                    <p className="text-xs text-slate-400">Unduh langsung atau kirim ke email sekarang juga</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">

                  {/* Unduh Langsung */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-blue-600" />
                      Unduh Langsung ke Perangkat:
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownload('excel')}
                        disabled={!!downloading}
                        className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        {downloading === 'excel' ? 'Mengunduh...' : 'Unduh Excel (.xlsx)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload('json')}
                        disabled={!!downloading}
                        className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <FileCode className="w-4 h-4 text-blue-600" />
                        {downloading === 'json' ? 'Mengunduh...' : 'Unduh JSON (.json)'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Kirim Email */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Kirim ke Alamat Email:
                    </div>
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="contoh: accounting@tokoseller.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-400">
                      Bisa dikirim ke email owner, kasir, atau akuntan toko.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleEmailBackup('excel')}
                        disabled={!!emailing}
                        className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {emailing === 'excel' ? 'Mengirim...' : 'Kirim Excel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEmailBackup('json')}
                        disabled={!!emailing}
                        className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {emailing === 'json' ? 'Mengirim...' : 'Kirim JSON'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIPS */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  Keamanan & Perlindungan Data
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Data diisolasi aman dan hanya dapat diakses oleh akun bisnis Anda.</li>
                  <li>File <strong>Excel</strong> memuat 8 sheet terpisah berwarna yang rapi dan siap dibuka di MS Excel atau Google Sheets.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── CAKUPAN DATA ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Cakupan Data yang Dicadangkan (8 Kategori)</h2>
                <p className="text-xs text-slate-400">Semua data operasional seller terangkum dalam file cadangan:</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {backupDataItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg shrink-0 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BackupView;
