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
  Clock, 
  ShieldCheck,
  Package,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Wrench
} from 'lucide-react';
import api from '../../../../services/api';

interface AutoBackupSettings {
  auto_backup_enabled: boolean;
  auto_backup_frequency: string;
  auto_backup_format: string;
  auto_backup_email: string;
  last_auto_backup_at: string | null;
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
  const [backupSaving, setBackupSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [downloading, setDownloading] = useState<'excel' | 'json' | null>(null);
  const [emailing, setEmailing] = useState<'excel' | 'json' | null>(null);

  useEffect(() => {
    fetchBackupSettings();
  }, []);

  const fetchBackupSettings = async () => {
    try {
      const res = await api.get('/jasa/settings/backup/config');
      if (res.data?.success) {
        setBackup(res.data.data);
        const email = res.data.data.auto_backup_email || '';
        setEmailInput(email);
        setManualEmail(email);
      }
    } catch (err) {
      console.error('Failed to fetch Jasa backup settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupSaving(true);
    setToast(null);
    try {
      const res = await api.post('/jasa/settings/backup/config', {
        ...backup,
        auto_backup_email: emailInput,
      });
      if (res.data?.success) {
        setBackup(res.data.data);
        setToast({ type: 'success', message: 'Pengaturan backup otomatis berhasil disimpan!' });
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Gagal menyimpan pengaturan backup.' });
    } finally {
      setBackupSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleDownload = async (fmt: 'excel' | 'json') => {
    setDownloading(fmt);
    setToast(null);
    try {
      const res = await api.get(`/jasa/settings/backup/download?format=${fmt}`, { responseType: 'blob' });
      const ext = fmt === 'json' ? 'json' : 'xlsx';
      const mime = fmt === 'json' ? 'application/json' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_jasa_${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setToast({ type: 'success', message: `File backup ${fmt.toUpperCase()} berhasil diunduh!` });
    } catch {
      setToast({ type: 'error', message: 'Gagal mengunduh file backup.' });
    } finally {
      setDownloading(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleEmailBackup = async (fmt: 'excel' | 'json') => {
    const targetEmail = manualEmail || emailInput;
    if (!targetEmail) {
      setToast({ type: 'error', message: 'Silakan masukkan alamat email tujuan terlebih dahulu.' });
      return;
    }
    setEmailing(fmt);
    setToast(null);
    try {
      const res = await api.post('/jasa/settings/backup/email', {
        email: targetEmail,
        format: fmt,
      });
      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message });
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Gagal mengirim email backup.' });
    } finally {
      setEmailing(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const backupDataItems = [
    { icon: ClipboardListIcon, title: 'Surat Perintah Kerja (SPK)', desc: 'Riwayat pekerjaan, pelanggan, perangkat, teknisi, rincian biaya & status SPK.', color: 'text-blue-600 bg-blue-50' },
    { icon: BookOpenIcon, title: 'Katalog Layanan & Tarif', desc: 'Daftar kode servis, tarif dasar, estimasi jam kerja, dan masa garansi.', color: 'text-emerald-600 bg-emerald-50' },
    { icon: Package, title: 'Stok Suku Cadang & Material', desc: 'Sisa stok sparepart, harga jual, satuan, dan peringatan stok minimum.', color: 'text-amber-600 bg-amber-50' },
    { icon: Users, title: 'Tim Teknisi & Pekerja', desc: 'Profil teknisi, keahlian/spesialisasi, nomor kontak, rating, dan status siaga.', color: 'text-purple-600 bg-purple-50' },
    { icon: FileText, title: 'Kontrak Kerja & SLA', desc: 'Data kontrak pemeliharaan berkala, nama klien, nilai kontrak, dan durasi.', color: 'text-sky-600 bg-sky-50' },
    { icon: DollarSign, title: 'Keuangan & Transaksi', desc: 'Catatan pemasukan & pengeluaran operasional jasa serta metode bayar.', color: 'text-green-600 bg-green-50' },
    { icon: Wrench, title: 'Profil & Konfigurasi Jasa', desc: 'Istilah teknisi/sparepart, prefix nomor SPK, identitas toko, dan waktu backup.', color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Memuat Pengaturan Backup...</p>
        </div>
      ) : (
        <>
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CARD 1: JADWAL BACKUP OTOMATIS */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Jadwal Backup Otomatis</h2>
                    <p className="text-xs text-slate-400">Kirim arsip cadangan toko ke email Anda secara terjadwal</p>
                  </div>
                </div>

                <form onSubmit={handleSaveBackup} className="p-6 space-y-5">
                  {/* Status Toggle */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800">Status Backup Otomatis</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {backup.auto_backup_enabled ? '🟢 Sistem backup aktif berjalan' : '⚪ Backup otomatis nonaktif'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={backup.auto_backup_enabled}
                        onChange={(e) => setBackup(b => ({ ...b, auto_backup_enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {backup.auto_backup_enabled && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-slate-700 block">Frekuensi Pengiriman</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ['daily', 'Harian', 'Tiap 02:30 WIB'],
                          ['weekly', 'Mingguan', 'Setiap 7 hari'],
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

                  {/* Format Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Format File Backup</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['excel', 'Excel (.xlsx)', 'Bisa dibuka di MS Excel / Sheets', FileSpreadsheet, 'text-emerald-600'],
                        ['json', 'JSON (.json)', 'Format data mentah untuk restore', FileCode, 'text-blue-600'],
                      ].map(([val, label, desc, Icon, iconColor]) => (
                        <div
                          key={val}
                          onClick={() => setBackup(b => ({ ...b, auto_backup_format: val }))}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            backup.auto_backup_format === val
                              ? 'border-blue-600 bg-blue-50/40'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                            <span className={`text-xs font-bold ${backup.auto_backup_format === val ? 'text-blue-700' : 'text-slate-800'}`}>
                              {label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-snug">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Email Penerima Backup Terjadwal
                    </label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="owner@jasaservis.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-400">
                      File backup otomatis akan dikirim ke alamat email di atas.
                    </p>
                  </div>

                  {backup.last_auto_backup_at && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div>
                        <strong>Backup Terakhir:</strong> {new Date(backup.last_auto_backup_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={backupSaving}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {backupSaving ? 'Menyimpan...' : 'Simpan Pengaturan Backup'}
                  </button>
                </form>
              </div>
            </div>

            {/* CARD 2: BACKUP MANUAL (INSTAN) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Backup Manual (Instan)</h2>
                    <p className="text-xs text-slate-400">Unduh langsung ke perangkat atau kirim ke email sekarang juga</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  
                  {/* Section A: Direct Download */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Unduh Langsung ke Perangkat:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownload('excel')}
                        disabled={!!downloading}
                        className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>{downloading === 'excel' ? 'Mengunduh...' : 'Unduh Excel (.xlsx)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload('json')}
                        disabled={!!downloading}
                        className="py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>{downloading === 'json' ? 'Mengunduh...' : 'Unduh JSON (.json)'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Section B: Instant Email Dispatch */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      <span>Kirim ke Alamat Email:</span>
                    </div>
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="contoh: accounting@jasaservis.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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
                        <span>{emailing === 'excel' ? 'Mengirim...' : 'Kirim Excel'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEmailBackup('json')}
                        disabled={!!emailing}
                        className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{emailing === 'json' ? 'Mengirim...' : 'Kirim JSON'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* TIPS CARD */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Keamanan & Perlindungan Data</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Data diisolasi aman dan hanya dapat diakses oleh akun bisnis Anda.</li>
                  <li>File <strong>Excel</strong> memuat 7 sheet terpisah berwarna yang rapi dan siap dibuka di MS Excel atau Google Sheets.</li>
                </ul>
              </div>
            </div>

          </div>

          {/* CARD 3: CAKUPAN DATA BACKUP */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Cakupan Data yang Dicadangkan (7 Kategori)</h2>
                <p className="text-xs text-slate-400">Semua data operasional jasa berikut terangkum lengkap dalam file cadangan:</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backupDataItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl flex items-start gap-3.5"
                >
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

function ClipboardListIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
    </svg>
  );
}

export default BackupView;
