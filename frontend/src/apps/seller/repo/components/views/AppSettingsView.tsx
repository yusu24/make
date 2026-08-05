import React, { useState, useEffect } from 'react';
import { Store, Upload, Save, Building, Trash2, QrCode } from 'lucide-react';
import api from '../../../../../services/api';

export const AppSettingsView: React.FC = () => {
  const [storeName, setStoreName] = useState('');
  const [receiptHeader, setReceiptHeader] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingQris, setUploadingQris] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchSettings = () => {
    setLoading(true);
    api.get('/retail/settings')
      .then((res) => {
        const s = res.data || {};
        setStoreName(s.store_name || '');
        setReceiptHeader(s.receipt_header || '');
        setStoreAddress(s.store_address || '');
        setStorePhone(s.store_phone || '');
        setIconUrl(s.store_icon_url || null);
        setQrisUrl(s.qris_image_url || null);
      })
      .catch((err) => console.error('Failed to fetch settings', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/retail/settings', {
        store_name: storeName,
        receipt_header: receiptHeader,
        store_address: storeAddress,
        store_phone: storePhone,
      });
      setMsg('Pengaturan berhasil disimpan.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save settings', err);
      setMsg('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('store_icon', file);
      // The api instance defaults Content-Type to application/json for every
      // request; axios doesn't reliably override an instance-level default
      // just because the body is FormData, so it was still going out as
      // application/json (Laravel then can't see the file/fields at all —
      // "field is required"). Setting it to undefined here removes that
      // default so the browser sets the real multipart+boundary header.
      const res = await api.post('/retail/settings/store-icon', formData, {
        headers: { 'Content-Type': undefined },
      });
      setIconUrl(res.data?.store_icon_url || null);
    } catch (err: any) {
      console.error('Failed to upload logo', err);
      const apiMsg = err.response?.data?.errors?.store_icon?.[0];
      alert(apiMsg || 'Gagal mengunggah logo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Hapus logo toko?')) return;
    try {
      await api.delete('/retail/settings/store-icon');
      setIconUrl(null);
    } catch (err) {
      console.error('Failed to remove logo', err);
    }
  };

  const handleUploadQris = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQris(true);
    try {
      const formData = new FormData();
      formData.append('qris_image', file);
      const res = await api.post('/retail/settings/qris', formData, {
        headers: { 'Content-Type': undefined },
      });
      setQrisUrl(res.data?.qris_image_url || null);
    } catch (err: any) {
      console.error('Failed to upload QRIS', err);
      const apiMsg = err.response?.data?.errors?.qris_image?.[0];
      alert(apiMsg || 'Gagal mengunggah QRIS.');
    } finally {
      setUploadingQris(false);
      e.target.value = '';
    }
  };

  const handleRemoveQris = async () => {
    if (!confirm('Hapus QRIS toko?')) return;
    try {
      await api.delete('/retail/settings/qris');
      setQrisUrl(null);
    } catch (err) {
      console.error('Failed to remove QRIS', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Pengaturan Aplikasi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Atur informasi dasar toko Anda, logo, dan alamat.
          </p>
        </div>

        {msg && (
          <span className={`text-xs font-semibold ${msg.includes('Gagal') ? 'text-rose-600' : 'text-emerald-600'}`}>{msg}</span>
        )}

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          <span className="sm:hidden">Simpan</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-5 space-y-6">

          {/* Logo Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Logo Toko</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                {iconUrl ? (
                  <img src={iconUrl} alt="Logo toko" className="w-full h-full object-cover" />
                ) : (
                  <Building className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <label className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2 cursor-pointer w-fit">
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Mengunggah...' : 'Upload Logo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUploadLogo} disabled={uploading} className="hidden" />
                </label>
                {iconUrl && (
                  <button onClick={handleRemoveLogo} className="ml-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors inline-flex items-center gap-2 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
                <p className="text-[10px] text-slate-500 mt-2">Format PNG/JPG/WEBP (Maks 5MB).</p>
              </div>
            </div>
          </div>

          {/* QRIS Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">QRIS Pembayaran</label>
            <p className="text-[11px] text-slate-500 mb-3">
              Upload gambar kode QRIS toko Anda. Kode ini akan ditampilkan otomatis di Kasir (POS) saat pembeli memilih metode pembayaran QRIS.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                {qrisUrl ? (
                  <img src={qrisUrl} alt="QRIS toko" className="w-full h-full object-contain" />
                ) : (
                  <QrCode className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <label className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2 cursor-pointer w-fit">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingQris ? 'Mengunggah...' : 'Upload QRIS'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUploadQris} disabled={uploadingQris} className="hidden" />
                </label>
                {qrisUrl && (
                  <button onClick={handleRemoveQris} className="ml-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors inline-flex items-center gap-2 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
                <p className="text-[10px] text-slate-500 mt-2">Format PNG/JPG/WEBP (Maks 5MB).</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Nama Toko</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Toko Makmur Jaya"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">No. Telepon Toko</label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Slogan Toko (tampil di struk)</label>
              <input
                type="text"
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                placeholder="Contoh: Terlengkap dan Terpercaya"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Alamat Toko</label>
              <textarea
                rows={3}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Alamat lengkap toko Anda"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
