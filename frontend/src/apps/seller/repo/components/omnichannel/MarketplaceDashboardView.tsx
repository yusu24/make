import React, { useState } from 'react';
import {
  Globe,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Layers,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Check
} from 'lucide-react';

interface StoreItem {
  id: number;
  platform: string;
  shop: string;
  status: 'Connected' | 'Token Expired' | 'Disconnected';
  lastSync: string;
  color: string;
}

export const MarketplaceDashboardView: React.FC<{ onNavigateToConnected?: () => void }> = ({
  onNavigateToConnected,
}) => {
  const [stores, setStores] = useState<StoreItem[]>([
    { id: 1, platform: 'Shopee', shop: 'Toko Elektronik Budi', status: 'Connected', lastSync: 'Baru saja', color: 'bg-orange-500' },
    { id: 2, platform: 'Tokopedia', shop: 'Budi Gadget Official', status: 'Connected', lastSync: '12 menit yang lalu', color: 'bg-emerald-500' },
    { id: 3, platform: 'TikTok Shop', shop: 'Budi Gadget Live', status: 'Token Expired', lastSync: '5 jam yang lalu', color: 'bg-black dark:bg-slate-600' },
    { id: 4, platform: 'Lazada', shop: 'Budi Elektronik Mall', status: 'Connected', lastSync: '15 menit yang lalu', color: 'bg-blue-600' },
  ]);

  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New store form state
  const [newStoreData, setNewStoreData] = useState({
    platform: 'Shopee',
    shopName: '',
    shopId: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Global Sync Handler
  const handleGlobalSync = () => {
    setIsGlobalSyncing(true);
    setTimeout(() => {
      setIsGlobalSyncing(false);
      setStores((prev) =>
        prev.map((s) => ({
          ...s,
          lastSync: 'Baru saja',
          status: s.status === 'Token Expired' ? 'Connected' : s.status,
        }))
      );
      showToast('Sinkronisasi Global Berhasil! 4 Toko & 1.245 Produk ter-update.');
    }, 2000);
  };

  // Reconnect Expired Token Handler
  const handleReconnect = (id: number, shopName: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Connected', lastSync: 'Baru saja' } : s))
    );
    showToast(`Token akses ${shopName} berhasil diperbarui & terhubung kembali.`);
  };

  // Add Store Handler
  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.shopName.trim()) {
      alert('Nama toko wajib diisi!');
      return;
    }

    const platformColorMap: Record<string, string> = {
      Shopee: 'bg-orange-500',
      Tokopedia: 'bg-emerald-500',
      'TikTok Shop': 'bg-black dark:bg-slate-600',
      Lazada: 'bg-blue-600',
      Blibli: 'bg-sky-500',
    };

    const newStore: StoreItem = {
      id: Date.now(),
      platform: newStoreData.platform,
      shop: newStoreData.shopName,
      status: 'Connected',
      lastSync: 'Baru saja',
      color: platformColorMap[newStoreData.platform] || 'bg-indigo-600',
    };

    setStores((prev) => [newStore, ...prev]);
    setIsAddStoreModalOpen(false);
    setNewStoreData({ platform: 'Shopee', shopName: '', shopId: '' });
    showToast(`Toko baru "${newStore.shop}" (${newStore.platform}) berhasil ditambahkan!`);
  };

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
            <Globe className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Marketplace Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Pantau status koneksi dan aktivitas sinkronisasi seluruh toko marketplace Anda.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={handleGlobalSync}
            disabled={isGlobalSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGlobalSyncing ? 'animate-spin' : ''}`} />
            <span>{isGlobalSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Global'}</span>
          </button>

          <button
            onClick={() => setIsAddStoreModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all text-xs cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Tambah Toko</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">Aktif</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stores.length}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toko Terhubung</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">1,245</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Produk Ter-mapping</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">Hari Ini</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">128</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sync Berhasil</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg">Perlu Perhatian</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
            {stores.filter((s) => s.status !== 'Connected').length}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Masalah Koneksi/Sync</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Status List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Status Koneksi Marketplace
            </h2>
            {onNavigateToConnected && (
              <button
                onClick={onNavigateToConnected}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
            {stores.map((shop) => (
              <div key={shop.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${shop.color} text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-sm`}>
                    {shop.platform.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{shop.shop}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{shop.platform}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {shop.status === 'Connected' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" />
                      Terhubung
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReconnect(shop.id, shop.shop)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Perbarui Token Token
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last sync: {shop.lastSync}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sync Logs Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/60">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              Aktivitas Terkini
            </h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="space-y-4 text-xs">
              {[
                { time: '10:45 AM', event: 'Sync Stok Otomatis (Shopee)', status: 'Success', detail: '34 SKU diperbarui' },
                { time: '10:42 AM', event: 'Tarik Pesanan Baru (Tokopedia)', status: 'Success', detail: '5 Pesanan masuk' },
                { time: '09:15 AM', event: 'Sync Harga (TikTok Shop)', status: 'Failed', detail: 'Token Kadaluarsa' },
                { time: '08:30 AM', event: 'Sync Katalog (Lazada)', status: 'Success', detail: '128 Produk terhubung' },
              ].map((act, idx) => (
                <div key={idx} className="flex gap-3 items-start pb-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{act.event}</p>
                    <p className="text-[11px] text-slate-400">{act.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal: Tambah Toko Baru */}
      {isAddStoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hubungkan Toko Marketplace Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddStoreModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Platform Marketplace
                </label>
                <select
                  value={newStoreData.platform}
                  onChange={(e) => setNewStoreData({ ...newStoreData, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="Shopee">Shopee</option>
                  <option value="Tokopedia">Tokopedia</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                  <option value="Lazada">Lazada</option>
                  <option value="Blibli">Blibli</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Toko (Official Name)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Toko Elektronik Budi Official"
                  value={newStoreData.shopName}
                  onChange={(e) => setNewStoreData({ ...newStoreData, shopName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shop ID / App Key (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SHP-99201"
                  value={newStoreData.shopId}
                  onChange={(e) => setNewStoreData({ ...newStoreData, shopId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Hubungkan Toko</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
