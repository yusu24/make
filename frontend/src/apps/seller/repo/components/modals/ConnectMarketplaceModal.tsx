import React, { useState } from 'react';
import { X, Store, ExternalLink, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

type Platform = 'Shopee' | 'Tokopedia' | 'TikTok Shop' | 'Lazada';

interface PlatformInfo {
  color: string;
  bg: string;
  portalName: string;
  portalUrl: string;
  steps: string[];
  fields: { label: string; placeholder: string }[];
}

const PLATFORM_INFO: Record<Platform, PlatformInfo> = {
  Shopee: {
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    portalName: 'Shopee Open Platform',
    portalUrl: 'open.shopee.com',
    steps: [
      'Daftar akun Partner di Shopee Open Platform, lalu buat aplikasi baru di dashboard Partner.',
      'Catat Partner ID & Partner Key dari aplikasi yang sudah dibuat.',
      'Masukkan Partner ID & Partner Key di form ini, lalu klik "Hubungkan" — pemilik toko akan diarahkan ke halaman login Shopee untuk mengotorisasi akses.',
      'Setelah disetujui, produk, stok, dan pesanan dari toko Shopee akan mulai tersinkron otomatis ke sistem ini.',
    ],
    fields: [
      { label: 'Partner ID', placeholder: 'Contoh: 1187xxx' },
      { label: 'Partner Key', placeholder: 'Kunci rahasia dari dashboard Shopee Partner' },
      { label: 'Shop ID Toko', placeholder: 'ID toko Shopee yang ingin dihubungkan' },
    ],
  },
  Tokopedia: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    portalName: 'Tokopedia Developer Center',
    portalUrl: 'developer.tokopedia.com',
    steps: [
      'Daftar sebagai Partner di Tokopedia Developer Center, lalu buat aplikasi baru.',
      'Dapatkan Client ID & Client Secret dari aplikasi tersebut.',
      'Masukkan kredensial di form ini, lalu otorisasi toko Tokopedia Anda lewat proses login resmi Tokopedia.',
      'Sinkronisasi otomatis produk, stok, dan pesanan akan aktif setelah toko terhubung.',
    ],
    fields: [
      { label: 'Client ID', placeholder: 'Client ID aplikasi Tokopedia' },
      { label: 'Client Secret', placeholder: 'Client Secret aplikasi Tokopedia' },
      { label: 'Shop ID / Fulfillment Service ID', placeholder: 'ID toko Tokopedia' },
    ],
  },
  'TikTok Shop': {
    color: 'text-slate-900 dark:text-slate-100',
    bg: 'bg-slate-100 dark:bg-slate-800',
    portalName: 'TikTok Shop Partner Center',
    portalUrl: 'partner.tiktokshop.com',
    steps: [
      'Daftar sebagai Partner di TikTok Shop Partner Center, lalu buat App baru.',
      'Dapatkan App Key & App Secret dari App yang sudah dibuat.',
      'Toko perlu meng-otorisasi akses aplikasi ini lewat TikTok Shop Seller Center.',
      'Setelah terhubung, pesanan dan stok akan tersinkron dua arah secara otomatis.',
    ],
    fields: [
      { label: 'App Key', placeholder: 'App Key dari TikTok Shop Partner Center' },
      { label: 'App Secret', placeholder: 'App Secret dari TikTok Shop Partner Center' },
      { label: 'Shop ID Toko', placeholder: 'ID toko TikTok Shop' },
    ],
  },
  Lazada: {
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    portalName: 'Lazada Open Platform',
    portalUrl: 'open.lazada.com',
    steps: [
      'Daftar sebagai Developer di Lazada Open Platform, lalu buat App baru.',
      'Dapatkan App Key & App Secret dari App tersebut.',
      'Hubungkan toko lewat proses otorisasi resmi Lazada Seller Center.',
      'Produk dan pesanan akan tersinkron otomatis setelah toko tersambung.',
    ],
    fields: [
      { label: 'App Key', placeholder: 'App Key dari Lazada Open Platform' },
      { label: 'App Secret', placeholder: 'App Secret dari Lazada Open Platform' },
      { label: 'Seller ID', placeholder: 'ID toko/seller Lazada' },
    ],
  },
};

interface ConnectMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectMarketplaceModal: React.FC<ConnectMarketplaceModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<Platform>('Shopee');
  const [values, setValues] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const info = PLATFORM_INFO[platform];

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            Hubungkan Toko Marketplace
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          {/* Mockup disclaimer */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 rounded-xl px-3 py-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Ini pratinjau (mockup) alur integrasi</strong>, belum tersambung ke API resmi. Layar ini menunjukkan langkah-langkah yang nantinya perlu Anda lakukan setelah integrasi API per platform selesai dibangun.
            </span>
          </div>

          {/* Platform tabs */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PLATFORM_INFO) as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  platform === p
                    ? `${PLATFORM_INFO[p].bg} ${PLATFORM_INFO[p].color} border-current`
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className={`rounded-2xl border border-slate-200 dark:border-slate-700 p-4 ${info.bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className={`w-3.5 h-3.5 ${info.color}`} />
              <span className={`font-semibold ${info.color}`}>Portal Partner: {info.portalName} ({info.portalUrl})</span>
            </div>
            <ol className="space-y-2">
              {info.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Mock credential form */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kredensial API {platform} (pratinjau form)</span>
            </div>
            {info.fields.map((f) => (
              <div key={f.label}>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">{f.label}</label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={values[`${platform}-${f.label}`] || ''}
                  onChange={(e) => handleChange(`${platform}-${f.label}`, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-700 shrink-0 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Toko Offline (POS) Anda sudah tersambung otomatis, tanpa perlu langkah ini.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
