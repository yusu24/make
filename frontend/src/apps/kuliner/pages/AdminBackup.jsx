import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const AdminBackup = () => {
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
  const [backupSaving, setBackupSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [downloading, setDownloading] = useState(null); // 'excel' | 'json' | null
  const [emailing, setEmailing] = useState(null); // 'excel' | 'json' | null

  useEffect(() => {
    fetchBackupSettings();
  }, []);

  const fetchBackupSettings = async () => {
    try {
      const res = await api.get('/kuliner/admin/settings/backup/config');
      if (res.data?.success) {
        setBackup(res.data.data);
        const email = res.data.data.auto_backup_email || '';
        setEmailInput(email);
        setManualEmail(email);
      }
    } catch (err) {
      console.error('Failed to fetch backup settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackup = async (e) => {
    if (e) e.preventDefault();
    setBackupSaving(true);
    setMessage(null);
    try {
      const res = await api.post('/kuliner/admin/settings/backup/config', {
        ...backup,
        auto_backup_email: emailInput,
      });
      if (res.data?.success) {
        setBackup(res.data.data);
        setMessage({ type: 'success', text: 'Pengaturan backup otomatis berhasil disimpan!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Gagal menyimpan pengaturan backup.' });
    } finally {
      setBackupSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDownload = async (fmt) => {
    setDownloading(fmt);
    setMessage(null);
    try {
      const res = await api.get(`/kuliner/admin/settings/backup/download?format=${fmt}`, { responseType: 'blob' });
      const ext = fmt === 'json' ? 'json' : 'xlsx';
      const mime = fmt === 'json' ? 'application/json' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_kuliner_${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: `File backup ${fmt.toUpperCase()} berhasil diunduh ke perangkat Anda!` });
    } catch {
      setMessage({ type: 'error', text: 'Gagal mengunduh file backup.' });
    } finally {
      setDownloading(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleEmailBackup = async (fmt) => {
    const targetEmail = manualEmail || emailInput;
    if (!targetEmail) {
      setMessage({ type: 'error', text: 'Silakan masukkan alamat email tujuan pengiriman backup.' });
      return;
    }
    setEmailing(fmt);
    setMessage(null);
    try {
      const res = await api.post('/kuliner/admin/settings/backup/email', {
        email: targetEmail,
        format: fmt,
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
      } else {
        throw new Error(res.data?.message);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Gagal mengirim email backup.' });
    } finally {
      setEmailing(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const backupDataItems = [
    { icon: '🍔', title: 'Menu Makanan & Minuman', desc: 'Daftar produk, kategori, harga jual, diskon, dan ketersediaan menu.' },
    { icon: '🧾', title: 'Riwayat Pesanan & POS', desc: 'Faktur transaksi, rincian item, pajak, service charge, dan status order.' },
    { icon: '🥬', title: 'Stok Bahan Baku', desc: 'Data bahan dapur, sisa stok aktual, batas stok minimum, dan harga modal.' },
    { icon: '🚚', title: 'Pemasok & Supplier', desc: 'Daftar supplier bahan baku, kontak PIC, dan alamat distributor.' },
    { icon: '🪑', title: 'Daftar Meja Resto', desc: 'Nomor meja, kapasitas kursi pelanggan, dan status dine-in.' },
    { icon: '💰', title: 'Keuangan & Pengeluaran', desc: 'Catatan pengeluaran operasional restoran dan kategori keuangan.' },
    { icon: '⏱️', title: 'Riwayat Shift Kasir', desc: 'Rekap buka/tutup shift kasir, saldo awal modal kasir, dan selisih kas.' },
    { icon: '🏢', title: 'Profil & Info Toko', desc: 'Pengaturan identitas resto, jam kerja, hari operasional, dan info sistem.' },
  ];

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Backup & Keamanan Data</h1>
        <div className="kd-topbar-actions" />
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memuat Pengaturan Backup..." />
        ) : (
          <>
            {message && (
              <div className={`p-4 rounded-2xl mb-6 text-sm font-bold border animate-in fade-in slide-in-from-top-4 duration-300 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {message.type === 'success' ? '✨ ' : '❌ '} {message.text}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* PANEL 1: BACKUP OTOMATIS */}
              <div className="kd-panel" style={{ height: 'fit-content' }}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl text-[#b48c36]">
                    ⏰
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Jadwal Backup Otomatis</h3>
                    <p className="text-[11px] text-slate-400">Kirim arsip cadangan toko ke email Anda secara terjadwal</p>
                  </div>
                </div>

                <form onSubmit={handleSaveBackup}>
                  {/* Toggle */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '18px', border: '1px solid #f1f5f9' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Status Backup Otomatis</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {backup.auto_backup_enabled ? '🟢 Sistem backup aktif berjalan' : '⚪ Backup otomatis nonaktif'}
                        </div>
                      </div>
                      <div
                        onClick={() => setBackup(b => ({ ...b, auto_backup_enabled: !b.auto_backup_enabled }))}
                        style={{
                          width: 48, height: 26, borderRadius: 13,
                          background: backup.auto_backup_enabled ? '#b48c36' : '#cbd5e1',
                          position: 'relative', transition: 'background 0.25s', cursor: 'pointer', flexShrink: 0
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff',
                          position: 'absolute', top: 3,
                          left: backup.auto_backup_enabled ? 25 : 3,
                          transition: 'left 0.25s',
                          boxShadow: '0 2px 5px rgba(0,0,0,.25)'
                        }} />
                      </div>
                    </label>
                  </div>

                  {backup.auto_backup_enabled && (
                    <div className="kd-form-group animate-in fade-in duration-200">
                      <label className="kd-form-label flex items-center gap-2">
                        <span>📅</span> Frekuensi Pengiriman
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                          ['daily', 'Harian', 'Tiap 02:15 WIB'],
                          ['weekly', 'Mingguan', 'Setiap 7 hari'],
                          ['monthly', 'Bulanan', 'Setiap akhir bulan']
                        ].map(([val, label, desc]) => (
                          <div
                            key={val}
                            onClick={() => setBackup(b => ({ ...b, auto_backup_frequency: val }))}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '12px',
                              border: '2px solid',
                              borderColor: backup.auto_backup_frequency === val ? '#b48c36' : '#e2e8f0',
                              background: backup.auto_backup_frequency === val ? '#fdf8ee' : '#fafafa',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: 700, color: backup.auto_backup_frequency === val ? '#b48c36' : '#334155' }}>
                              {label}
                            </div>
                            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Format Selector */}
                  <div className="kd-form-group">
                    <label className="kd-form-label flex items-center gap-2">
                      <span>📁</span> Format File Backup
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        ['excel', '📊 Excel (.xlsx)', 'Bisa dibuka di MS Excel / Google Sheets'],
                        ['json', '📄 JSON (.json)', 'Format data mentah untuk restore teknis']
                      ].map(([val, label, desc]) => (
                        <div
                          key={val}
                          onClick={() => setBackup(b => ({ ...b, auto_backup_format: val }))}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '14px',
                            border: '2px solid',
                            borderColor: backup.auto_backup_format === val ? '#b48c36' : '#e2e8f0',
                            background: backup.auto_backup_format === val ? '#fdf8ee' : '#fafafa',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '13px', color: backup.auto_backup_format === val ? '#b48c36' : '#334155' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px', lineHeight: '1.3' }}>
                            {desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Recipient */}
                  <div className="kd-form-group">
                    <label className="kd-form-label flex items-center gap-2">
                      <span>📧</span> Email Penerima Cadangan Data
                    </label>
                    <input
                      type="email"
                      required
                      className="kd-form-input"
                      placeholder="contoh: owner@restoran.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      File backup terjadwal dan manual akan dikirim ke alamat email di atas.
                    </p>
                  </div>

                  {backup.last_auto_backup_at && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: '#16a34a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✅</span>
                      <div>
                        <strong>Backup Terakhir:</strong> {new Date(backup.last_auto_backup_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={backupSaving}
                    className="w-full py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-[#b48c36]/15"
                    style={{
                      background: backupSaving ? '#cbd5e1' : '#b48c36',
                      color: '#fff',
                      border: 'none',
                      cursor: backupSaving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {backupSaving ? 'Menyimpan Pengaturan...' : '💾 Simpan Pengaturan Backup'}
                  </button>
                </form>
              </div>

              {/* PANEL 2: MANUAL BACKUP (ON-DEMAND) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="kd-panel" style={{ height: 'fit-content' }}>
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl text-emerald-600">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Backup Manual (Instan)</h3>
                      <p className="text-[11px] text-slate-400">Unduh langsung ke komputer/HP atau kirim ke email sekarang</p>
                    </div>
                  </div>

                  {/* Unduh Langsung */}
                  <div style={{ marginBottom: '20px' }}>
                    <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                      <span>📥</span> Unduh Langsung ke Perangkat:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleDownload('excel')}
                        disabled={!!downloading}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #e2e8f0',
                          background: downloading === 'excel' ? '#f1f5f9' : '#fff',
                          cursor: downloading ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s'
                        }}
                      >
                        {downloading === 'excel' ? '⏳ Mengunduh...' : '📊 Unduh Excel (.xlsx)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload('json')}
                        disabled={!!downloading}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #e2e8f0',
                          background: downloading === 'json' ? '#f1f5f9' : '#fff',
                          cursor: downloading ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s'
                        }}
                      >
                        {downloading === 'json' ? '⏳ Mengunduh...' : '📄 Unduh JSON (.json)'}
                      </button>
                    </div>
                  </div>

                  {/* Kirim ke Email */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                      <span>✉️</span> Kirim ke Alamat Email:
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="email"
                        className="kd-form-input"
                        placeholder="contoh: manager@restoran.com"
                        value={manualEmail}
                        onChange={e => setManualEmail(e.target.value)}
                        style={{ fontSize: '13px', padding: '10px 14px', borderRadius: '12px' }}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Bisa dikirim ke email Anda sendiri, kasir, atau akuntan toko.
                      </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleEmailBackup('excel')}
                        disabled={!!emailing}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #bbf7d0',
                          background: emailing === 'excel' ? '#f0fdf4' : '#ecfdf5',
                          cursor: emailing ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        {emailing === 'excel' ? '⏳ Mengirim...' : '✉️ Kirim Excel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEmailBackup('json')}
                        disabled={!!emailing}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1.5px solid #bbf7d0',
                          background: emailing === 'json' ? '#f0fdf4' : '#ecfdf5',
                          cursor: emailing ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s'
                        }}
                      >
                        {emailing === 'json' ? '⏳ Mengirim...' : '✉️ Kirim JSON'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TIPS & INFO */}
                <div className="kd-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">💡</span>
                    <h4 className="font-bold text-sm text-white">Tips Keamanan Data Toko</h4>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-2 leading-relaxed list-disc list-inside">
                    <li>Disarankan mengaktifkan <strong>Backup Otomatis Mingguan</strong> untuk mencegah kehilangan riwayat transaksi penting.</li>
                    <li>File <strong>Excel (.xlsx)</strong> memiliki 8 sheet terpisah berwarna yang rapi dan siap dicetak/dianalisis.</li>
                    <li>File backup dienkripsi dan diisolasi aman per toko/tenant.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* PANEL 3: CAKUPAN DATA YANG DI-BACKUP */}
            <div className="kd-panel">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl text-blue-600">
                  📦
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Cakupan Data yang Dicadangkan (8 Kategori)</h3>
                  <p className="text-[11px] text-slate-400">Setiap file backup Excel memuat 8 lembar kerja (sheets) lengkap dengan data berikut:</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {backupDataItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #edf2f7',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      fontSize: '20px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-1">{item.title}</div>
                      <div className="text-[11px] text-slate-500 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </KulinerAdminLayout>
  );
};

export default AdminBackup;
