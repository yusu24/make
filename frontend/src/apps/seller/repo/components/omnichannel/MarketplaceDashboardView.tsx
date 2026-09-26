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
} from '@/constants/icons';
import { ConnectMarketplaceModal } from '../modals/ConnectMarketplaceModal';
import { useAuth } from '../../../../../contexts/AuthContext';


interface StoreItem {
  id: number;
  platform: string;
  shop: string;
  status: 'Connected' | 'Token Expired' | 'Disconnected';
  lastSync: string;
  color: string;
}

const INITIAL_STORES: StoreItem[] = [
  { id: 1, platform: 'Shopee', shop: 'Toko Elektronik Budi', status: 'Connected', lastSync: 'Baru saja', color: 'bg-orange-500' },
  { id: 2, platform: 'Tokopedia', shop: 'Budi Gadget Official', status: 'Connected', lastSync: '12 menit yang lalu', color: 'bg-emerald-500' },
  { id: 3, platform: 'TikTok Shop', shop: 'Budi Gadget Live', status: 'Token Expired', lastSync: '5 jam yang lalu', color: 'bg-black dark:bg-slate-600' },
  { id: 4, platform: 'Lazada', shop: 'Budi Elektronik Mall', status: 'Connected', lastSync: '15 menit yang lalu', color: 'bg-blue-600' },
];

export const MarketplaceDashboardView: React.FC<{ onNavigateToConnected?: () => void }> = ({
  onNavigateToConnected,
}) => {
  const { user } = useAuth();
  const DEMO_EMAILS = ['seller@demo.com', 'ahmad@retail.com', 'retail@demo.com', 'siti@ikan.com', 'budidaya@demo.com', 'dewi@kuliner.com', 'kuliner@demo.com', 'jasa@demo.com'];
  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-') || DEMO_EMAILS.includes(user?.email || '');

  const [stores, setStores] = useState<StoreItem[]>(isDemo ? INITIAL_STORES : []);

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

      {/* Top Action Bar */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
        <button
          onClick={handleGlobalSync}
          disabled={isGlobalSyncing}
          className="flex items-center gap-2 px-4 h-[38px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors text-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGlobalSyncing ? 'animate-spin' : ''}`} />
          <span>{isGlobalSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Global'}</span>
        </button>

        <button
          onClick={() => setIsAddStoreModalOpen(true)}
          className="flex items-center gap-2 px-4 h-[38px] bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 shadow-xs transition-colors text-xs cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Tambah Toko</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Toko Terhubung
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <LinkIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {stores.length} <span className="text-xs font-normal text-slate-400 font-['Inter']">Toko</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Integrasi channel</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              {stores.filter(s => s.status === 'Connected').length} Aktif
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Produk Ter-mapping
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {isDemo ? '1,245' : '0'} <span className="text-xs font-normal text-slate-400 font-['Inter']">SKU</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Sinkron katalog</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              Multi-Channel
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Sync Berhasil
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {isDemo ? '128' : '0'} <span className="text-xs font-normal text-slate-400 font-['Inter']">Event</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Hari ini</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              100% Berhasil
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Status Koneksi
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {stores.filter((s) => s.status !== 'Connected').length} <span className="text-xs font-normal text-slate-400 font-['Inter']">Isu</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Token & Sync</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${
              stores.filter((s) => s.status !== 'Connected').length > 0
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
            }`}>
              {stores.filter((s) => s.status !== 'Connected').length > 0 ? 'Perlu Perhatian' : 'Semua Normal'}
            </span>
          </div>
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
              {(isDemo ? [
                { time: '10:45 AM', event: 'Sync Stok Otomatis (Shopee)', status: 'Success', detail: '34 SKU diperbarui' },
                { time: '10:42 AM', event: 'Tarik Pesanan Baru (Tokopedia)', status: 'Success', detail: '5 Pesanan masuk' },
                { time: '09:15 AM', event: 'Sync Harga (TikTok Shop)', status: 'Failed', detail: 'Token Kadaluarsa' },
                { time: '08:30 AM', event: 'Sync Katalog (Lazada)', status: 'Success', detail: '128 Produk terhubung' },
              ] : []).map((act, idx) => (
                <div key={idx} className="flex gap-3 items-start pb-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{act.event}</p>
                    <p className="text-[11px] text-slate-400">{act.detail}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time}</span>
                </div>
              ))}
              {!isDemo && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Belum ada aktivitas sinkronisasi.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal: Tambah Toko Baru */}
      <ConnectMarketplaceModal
        isOpen={isAddStoreModalOpen}
        onClose={() => setIsAddStoreModalOpen(false)}
      />
    </div>
  );
};
