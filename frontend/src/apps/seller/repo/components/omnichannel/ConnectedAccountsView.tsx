import React, { useState, useMemo } from 'react';
import {
  Link,
  Plus,
  Search,
  MoreVertical,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  X,
  Check,
  Power
} from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';

interface ConnectedAccount {
  id: number;
  platform: string;
  shop: string;
  shopId: string;
  status: 'Connected' | 'Token Expired' | 'Disconnected';
  autoSync: boolean;
  lastSync: string;
  color: string;
}

const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  { id: 1, platform: 'Shopee', shop: 'Toko Elektronik Budi', shopId: 'SH-992312', status: 'Connected', autoSync: true, lastSync: '10 mins ago', color: 'bg-orange-500' },
  { id: 2, platform: 'Tokopedia', shop: 'Budi Gadget Official', shopId: 'TK-12003', status: 'Connected', autoSync: true, lastSync: '12 mins ago', color: 'bg-emerald-500' },
  { id: 3, platform: 'TikTok Shop', shop: 'Budi Gadget Live', shopId: 'TT-550112', status: 'Token Expired', autoSync: false, lastSync: '5 hours ago', color: 'bg-black dark:bg-slate-600' },
  { id: 4, platform: 'Lazada', shop: 'Budi Elektronik Mall', shopId: 'LZ-88123', status: 'Connected', autoSync: true, lastSync: '15 mins ago', color: 'bg-blue-600' },
  { id: 5, platform: 'Blibli', shop: 'Budi Store Official', shopId: 'BL-9912', status: 'Disconnected', autoSync: false, lastSync: 'Never', color: 'bg-sky-500' },
];

export const ConnectedAccountsView: React.FC = () => {
  const { user } = useAuth();
  const DEMO_EMAILS = ['seller@demo.com', 'ahmad@retail.com', 'retail@demo.com', 'siti@ikan.com', 'budidaya@demo.com', 'dewi@kuliner.com', 'kuliner@demo.com', 'jasa@demo.com'];
  const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-') || DEMO_EMAILS.includes(user?.email || '');

  const [accounts, setAccounts] = useState<ConnectedAccount[]>(isDemo ? INITIAL_ACCOUNTS : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [syncingId, setSyncingId] = useState<number | null>(null);

  // Modals & Toasts
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newAccountData, setNewAccountData] = useState({
    platform: 'Shopee',
    shopName: '',
    shopId: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.shopId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlatform =
        selectedPlatform === 'all' || acc.platform.toLowerCase() === selectedPlatform.toLowerCase();

      return matchesSearch && matchesPlatform;
    });
  }, [accounts, searchTerm, selectedPlatform]);

  // Toggle Auto-Sync Handler
  const handleToggleAutoSync = (id: number) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const nextVal = !acc.autoSync;
          showToast(`Auto-Sync untuk ${acc.shop} ${nextVal ? 'Diaktifkan' : 'Dimatikan'}.`);
          return { ...acc, autoSync: nextVal };
        }
        return acc;
      })
    );
  };

  // Manual Sync Handler per Store
  const handleManualSync = (id: number, shopName: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === id ? { ...acc, lastSync: 'Baru saja', status: 'Connected' } : acc))
      );
      showToast(`Manual Sync ${shopName} Berhasil! Data produk & stok terbarui.`);
    }, 1500);
  };

  // Add Account Handler
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountData.shopName.trim()) {
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

    const newAcc: ConnectedAccount = {
      id: Date.now(),
      platform: newAccountData.platform,
      shop: newAccountData.shopName,
      shopId: newAccountData.shopId || `STORE-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Connected',
      autoSync: true,
      lastSync: 'Baru saja',
      color: platformColorMap[newAccountData.platform] || 'bg-indigo-600',
    };

    setAccounts((prev) => [newAcc, ...prev]);
    setIsAddModalOpen(false);
    setNewAccountData({ platform: 'Shopee', shopName: '', shopId: '' });
    showToast(`Toko ${newAcc.shop} (${newAcc.platform}) berhasil dihubungkan!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Akun Terhubung</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Kelola integrasi toko Anda dengan berbagai platform marketplace.
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Integrasi</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama toko atau platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Platform</option>
            <option value="shopee">Shopee</option>
            <option value="tokopedia">Tokopedia</option>
            <option value="tiktok shop">TikTok Shop</option>
            <option value="lazada">Lazada</option>
            <option value="blibli">Blibli</option>
          </select>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col group">
            <div className="p-5 flex items-start justify-between border-b border-slate-100 dark:border-slate-700/60 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-md ${account.color}`}>
                  {account.platform.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{account.shop}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{account.platform}</p>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Shop ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{account.shopId}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Auto Sync</span>
                  <button
                    onClick={() => handleToggleAutoSync(account.id)}
                    className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                      account.autoSync ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${account.autoSync ? 'translate-x-4' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Status Koneksi</span>
                  {account.status === 'Connected' ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                      <CheckCircle className="w-3 h-3" />
                      Terhubung
                    </span>
                  ) : account.status === 'Token Expired' ? (
                    <button
                      onClick={() => handleManualSync(account.id, account.shop)}
                      className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/40 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Re-Auth Token
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500 font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      Terputus
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Last Sync: {account.lastSync}
                </span>
                <button
                  onClick={() => handleManualSync(account.id, account.shop)}
                  disabled={syncingId === account.id}
                  className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  title="Picu Manual Sync"
                >
                  <RefreshCw className={`w-4 h-4 ${syncingId === account.id ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Integration Card */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group min-h-[260px]"
        >
          <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Hubungkan Toko Baru</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
            Shopee, Tokopedia, Lazada, TikTok Shop, atau Blibli
          </p>
        </div>
      </div>

      {/* Interactive Modal: Tambah Integrasi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hubungkan Integrasi Marketplace
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Platform Marketplace
                </label>
                <select
                  value={newAccountData.platform}
                  onChange={(e) => setNewAccountData({ ...newAccountData, platform: e.target.value })}
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
                  Nama Toko (Store Name)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Toko Resmi Budi"
                  value={newAccountData.shopName}
                  onChange={(e) => setNewAccountData({ ...newAccountData, shopName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shop ID / Seller ID
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SHP-99201"
                  value={newAccountData.shopId}
                  onChange={(e) => setNewAccountData({ ...newAccountData, shopId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
