import React, { useState } from 'react';
import { RefreshCw, Package, ShoppingCart, Tag, Box, Play, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const SyncCenterView: React.FC = () => {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSync = (type: string, title: string) => {
    setSyncing(type);
    setTimeout(() => {
      setSyncing(null);
      if (type === 'all') {
        showToast('Sinkronisasi Global Berhasil! Seluruh modul (Produk, Stok, Harga, & Pesanan) ter-update.');
      } else {
        showToast(`Proses ${title} Berhasil! Data ter-update secara real-time.`);
      }
    }, 2000);
  };

  const syncModules = [
    {
      id: 'products',
      title: 'Sinkronisasi Produk',
      description: 'Update data produk, deskripsi, gambar, dan varian.',
      icon: <Package className="w-6 h-6 text-indigo-500" />,
      color: 'indigo',
      lastSync: '10 menit yang lalu',
      status: 'success'
    },
    {
      id: 'stock',
      title: 'Sinkronisasi Stok',
      description: 'Update stok gudang ke seluruh platform secara real-time.',
      icon: <Box className="w-6 h-6 text-emerald-500" />,
      color: 'emerald',
      lastSync: '1 menit yang lalu',
      status: 'success'
    },
    {
      id: 'price',
      title: 'Sinkronisasi Harga',
      description: 'Sesuaikan harga jual per marketplace.',
      icon: <Tag className="w-6 h-6 text-amber-500" />,
      color: 'amber',
      lastSync: '2 jam yang lalu',
      status: 'warning'
    },
    {
      id: 'orders',
      title: 'Tarik Pesanan',
      description: 'Tarik pesanan baru dari seluruh toko secara massal.',
      icon: <ShoppingCart className="w-6 h-6 text-purple-500" />,
      color: 'purple',
      lastSync: '5 menit yang lalu',
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="truncate">Synchronization Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Pusat kendali untuk memicu sinkronisasi manual secara massal.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => handleSync('all', 'Sinkronisasi Global')}
            disabled={syncing !== null}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 shadow-md shadow-emerald-500/20 transition-all text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing === 'all' ? 'animate-spin' : ''}`} />
            <span>{syncing === 'all' ? 'Menyinkronkan Semua...' : 'Sync All (Global)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {syncModules.map((mod) => (
          <div key={mod.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col group transition-all hover:border-slate-300 dark:hover:border-slate-500">
            <div className="p-6 flex gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0`}>
                {mod.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{mod.description}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mod.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {mod.lastSync}
                </span>
              </div>
              <button
                onClick={() => handleSync(mod.id, mod.title)}
                disabled={syncing !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {syncing === mod.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Mulai Sync</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-2xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Auto-Sync Aktif</h4>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
            Sistem secara otomatis menyinkronkan stok setiap kali ada transaksi, dan menarik pesanan baru setiap 5 menit. Gunakan tombol manual di atas hanya jika Anda memerlukan pembaruan instan (force sync).
          </p>
        </div>
      </div>
    </div>
  );
};
