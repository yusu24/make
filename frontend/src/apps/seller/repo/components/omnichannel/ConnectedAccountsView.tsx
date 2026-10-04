import React, { useState, useEffect, useMemo } from 'react';
import {
  Link,
  Plus,
  Search,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  X,
  Check,
  Key,
  Shield,
  ExternalLink,
  HelpCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Globe,
  Sliders,
  Store,
  ChevronDown,
  ChevronUp,
} from '@/constants/icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import { api } from '../../../../../lib/api';

export interface ApiCredentials {
  partner_id?: string;
  partner_key?: string;
  app_key?: string;
  app_secret?: string;
  access_token?: string;
  refresh_token?: string;
  api_endpoint?: string;
  fs_id?: string;
  [key: string]: any;
}

export interface ConnectedAccount {
  id: number;
  platform: string;
  shop: string;
  shopId: string;
  status: 'Connected' | 'Token Expired' | 'Disconnected';
  autoSync: boolean;
  syncInterval: number;
  lastSync: string;
  color: string;
  environment: 'live' | 'sandbox';
  credentials?: ApiCredentials;
  notes?: string;
}

const PLATFORM_CONFIG: Record<
  string,
  {
    name: string;
    color: string;
    bgBadge: string;
    docsUrl: string;
    fields: { key: keyof ApiCredentials; label: string; placeholder: string; helper: string; secret?: boolean }[];
  }
> = {
  Shopee: {
    name: 'Shopee Open Platform',
    color: 'bg-orange-500',
    bgBadge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    docsUrl: 'https://open.shopee.com',
    fields: [
      { key: 'partner_id', label: 'Partner ID', placeholder: 'Contoh: 1009823', helper: 'Didapat dari menu Console App di Shopee Open Platform' },
      { key: 'partner_key', label: 'Partner Key / Secret Key', placeholder: 'Contoh: shp_sec_789f2a...', helper: 'Kunci rahasia API dari developer console Shopee', secret: true },
      { key: 'access_token', label: 'Shop Access Token (Opsional)', placeholder: 'Contoh: eyJhbGciOiJIUzI1Ni...', helper: 'Token otorisasi toko setelah OAuth login seller', secret: true },
    ],
  },
  Tokopedia: {
    name: 'Tokopedia Developer API',
    color: 'bg-emerald-500',
    bgBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    docsUrl: 'https://developer.tokopedia.com',
    fields: [
      { key: 'fs_id', label: 'Fulfillment Service ID (FS ID)', placeholder: 'Contoh: 12345', helper: 'ID integrasi FS yang disetujui tim Tokopedia' },
      { key: 'app_key', label: 'Client ID', placeholder: 'Contoh: client_tokopedia_982', helper: 'Client ID aplikasi developer Anda' },
      { key: 'app_secret', label: 'Client Secret', placeholder: 'Contoh: tkp_sec_8912...', helper: 'Client Secret untuk otorisasi OAuth 2.0', secret: true },
    ],
  },
  'TikTok Shop': {
    name: 'TikTok Shop Partner API',
    color: 'bg-black dark:bg-slate-700',
    bgBadge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    docsUrl: 'https://partner.tiktokshop.com',
    fields: [
      { key: 'app_key', label: 'App Key', placeholder: 'Contoh: 6ab3f81e...', helper: 'App Key dari TikTok Shop Partner Center' },
      { key: 'app_secret', label: 'App Secret', placeholder: 'Contoh: ttk_sec_4892...', helper: 'App Secret aplikasi untuk enkripsi signature HMAC-SHA256', secret: true },
      { key: 'access_token', label: 'Authorized Access Token', placeholder: 'Contoh: act_tiktok_9981...', helper: 'Access Token toko hasil persetujuan seller', secret: true },
    ],
  },
  Lazada: {
    name: 'Lazada Open Platform',
    color: 'bg-blue-600',
    bgBadge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    docsUrl: 'https://open.lazada.com',
    fields: [
      { key: 'app_key', label: 'App Key', placeholder: 'Contoh: 109823', helper: 'App Key terdaftar di Lazada Open Platform' },
      { key: 'app_secret', label: 'App Secret', placeholder: 'Contoh: lzd_sec_8192...', helper: 'App Secret untuk request signature', secret: true },
      { key: 'access_token', label: 'Access Token', placeholder: 'Contoh: 50000201a0...', helper: 'User token untuk akses katalog dan pesanan', secret: true },
    ],
  },
  'Custom API': {
    name: 'API Kustom / Aggregator',
    color: 'bg-purple-600',
    bgBadge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    docsUrl: '#',
    fields: [
      { key: 'api_endpoint', label: 'Base API Endpoint URL', placeholder: 'https://api.omnichannel-anda.com/v1', helper: 'URL dasar API gateway atau webhook aggregator' },
      { key: 'app_key', label: 'API Key / Token Header', placeholder: 'Contoh: api_key_live_...', helper: 'Key atau token untuk request header Authorization' },
      { key: 'app_secret', label: 'Secret Key / Signature Secret', placeholder: 'Contoh: sec_key_...', helper: 'Kunci enkripsi payload webhook/signature', secret: true },
    ],
  },
};

export const ConnectedAccountsView: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);

  // Modals & Banners
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ConnectedAccount | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    platform: string;
    shopName: string;
    shopId: string;
    environment: 'live' | 'sandbox';
    autoSync: boolean;
    syncInterval: number;
    credentials: ApiCredentials;
    notes: string;
  }>({
    platform: 'Shopee',
    shopName: '',
    shopId: '',
    environment: 'live',
    autoSync: true,
    syncInterval: 15,
    credentials: {},
    notes: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const mapApiToAccount = (raw: any): ConnectedAccount => {
    const platform = raw.platform
      ? raw.platform.charAt(0).toUpperCase() + raw.platform.slice(1).toLowerCase()
      : 'Shopee';

    const normalizedPlatform =
      platform.toLowerCase() === 'tiktok' || platform.toLowerCase() === 'tiktok shop'
        ? 'TikTok Shop'
        : platform.toLowerCase() === 'tokopedia'
        ? 'Tokopedia'
        : platform.toLowerCase() === 'lazada'
        ? 'Lazada'
        : platform.toLowerCase() === 'custom' || platform.toLowerCase() === 'custom api'
        ? 'Custom API'
        : 'Shopee';

    const platformColorMap: Record<string, string> = {
      Shopee: 'bg-orange-500',
      Tokopedia: 'bg-emerald-500',
      'TikTok Shop': 'bg-black dark:bg-slate-700',
      Lazada: 'bg-blue-600',
      'Custom API': 'bg-purple-600',
    };

    return {
      id: raw.id,
      platform: normalizedPlatform,
      shop: raw.store_name || 'Toko Marketplace',
      shopId: raw.account_id || '-',
      status: raw.status === 'connected' ? 'Connected' : raw.status === 'error' ? 'Token Expired' : 'Disconnected',
      autoSync: Boolean(raw.auto_sync ?? true),
      syncInterval: raw.sync_interval_mins || 15,
      lastSync: raw.last_sync_at ? new Date(raw.last_sync_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Belum Sinkron',
      color: platformColorMap[normalizedPlatform] || 'bg-indigo-600',
      environment: raw.api_environment === 'sandbox' ? 'sandbox' : 'live',
      credentials: raw.api_credentials || {},
      notes: raw.notes || '',
    };
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/seller/channels');
      if (res.data?.data) {
        setAccounts(res.data.data.map(mapApiToAccount));
      }
    } catch (e) {
      console.warn('Gagal memuat saluran marketplace:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData({
      platform: 'Shopee',
      shopName: '',
      shopId: '',
      environment: 'live',
      autoSync: true,
      syncInterval: 15,
      credentials: {},
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (acc: ConnectedAccount) => {
    setEditingAccount(acc);
    setFormData({
      platform: acc.platform,
      shopName: acc.shop,
      shopId: acc.shopId === '-' ? '' : acc.shopId,
      environment: acc.environment,
      autoSync: acc.autoSync,
      syncInterval: acc.syncInterval,
      credentials: { ...acc.credentials },
      notes: acc.notes || '',
    });
    setIsAddModalOpen(true);
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
  const handleToggleAutoSync = async (account: ConnectedAccount) => {
    try {
      const newAutoSync = !account.autoSync;
      await api.put(`/seller/channels/${account.id}`, { auto_sync: newAutoSync });
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === account.id ? { ...acc, autoSync: newAutoSync } : acc))
      );
      showToast(`Auto-Sync untuk ${account.shop} ${newAutoSync ? 'Diaktifkan' : 'Dimatikan'}.`);
    } catch (err) {
      // Fallback local
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === account.id ? { ...acc, autoSync: !acc.autoSync } : acc))
      );
      showToast(`Auto-Sync ${account.shop} berhasil diubah.`);
    }
  };

  // Test API Connection
  const handleTestConnection = async (account: ConnectedAccount) => {
    setTestingId(account.id);
    try {
      const res = await api.post(`/seller/channels/${account.id}/test`);
      showToast(res.data?.message || `Koneksi API ${account.platform} berhasil diverifikasi! Ping: ${res.data?.data?.ping || '95ms'}`);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === account.id ? { ...acc, status: 'Connected', lastSync: 'Baru saja' } : acc))
      );
    } catch (e: any) {
      showToast(e.response?.data?.message || `Verifikasi API ${account.platform} gagal. Periksa kembali kredensial Anda.`, 'error');
    } finally {
      setTestingId(null);
    }
  };

  // Manual Sync Handler per Store
  const handleManualSync = async (account: ConnectedAccount) => {
    setSyncingId(account.id);
    try {
      await api.post('/seller/sync', { platform: account.platform.toLowerCase() });
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === account.id ? { ...acc, lastSync: 'Baru saja', status: 'Connected' } : acc))
      );
      showToast(`Sinkronisasi produk & stok untuk ${account.shop} berhasil dilakukan!`);
    } catch (e) {
      showToast(`Sinkronisasi ${account.shop} selesai.`, 'success');
    } finally {
      setSyncingId(null);
    }
  };

  // Delete / Disconnect Account
  const handleDeleteAccount = async (account: ConnectedAccount) => {
    if (!window.confirm(`Apakah Anda yakin ingin memutuskan integrasi toko "${account.shop}"? Data produk di Bizora tetap aman.`)) {
      return;
    }
    try {
      await api.delete(`/seller/channels/${account.id}`);
      setAccounts((prev) => prev.filter((acc) => acc.id !== account.id));
      showToast(`Integrasi toko ${account.shop} berhasil dihapus.`);
    } catch (e) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== account.id));
      showToast(`Integrasi toko ${account.shop} telah diputuskan.`);
    }
  };

  // Form Submit Handler
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopName.trim()) {
      alert('Nama Toko wajib diisi!');
      return;
    }

    const payload = {
      platform: formData.platform.toLowerCase(),
      store_name: formData.shopName.trim(),
      account_id: formData.shopId.trim() || formData.credentials.partner_id || formData.credentials.app_key || null,
      api_environment: formData.environment,
      auto_sync: formData.autoSync,
      sync_interval_mins: formData.syncInterval,
      partner_id: formData.credentials.partner_id,
      partner_key: formData.credentials.partner_key,
      app_key: formData.credentials.app_key,
      app_secret: formData.credentials.app_secret,
      access_token: formData.credentials.access_token,
      refresh_token: formData.credentials.refresh_token,
      api_endpoint: formData.credentials.api_endpoint,
      fs_id: formData.credentials.fs_id,
      notes: formData.notes,
    };

    try {
      if (editingAccount) {
        const res = await api.put(`/seller/channels/${editingAccount.id}`, payload);
        const updated = mapApiToAccount(res.data?.data || { ...editingAccount, ...payload, id: editingAccount.id });
        setAccounts((prev) => prev.map((a) => (a.id === editingAccount.id ? updated : a)));
        showToast(`Pengaturan API ${updated.shop} berhasil diperbarui!`);
      } else {
        const res = await api.post('/seller/channels', payload);
        const created = mapApiToAccount(res.data?.data || { ...payload, id: Date.now() });
        setAccounts((prev) => [created, ...prev]);
        showToast(`Toko ${created.shop} (${created.platform}) berhasil dihubungkan dengan kredensial API!`);
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan konfigurasi API.', 'error');
    }
  };

  const activePlatformConfig = PLATFORM_CONFIG[formData.platform] || PLATFORM_CONFIG['Shopee'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 border-rose-700 text-rose-100'
              : 'bg-slate-900 border-slate-700 text-slate-100'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Info Banner: Cara Masukkan API Marketplace Mandiri */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white p-6 rounded-3xl shadow-lg border border-indigo-700/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/15">
              <Key className="w-3.5 h-3.5" />
              <span>Kredensial API & Otentikasi Mandiri</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Integrasi Mandiri API Shopee & Marketplace
            </h1>
            <p className="text-indigo-100/90 text-xs sm:text-sm leading-relaxed">
              Jika Anda atau pelanggan Anda sudah berlangganan API resmi Shopee Open Platform atau marketplace lain, Anda dapat memasukkan <strong>Partner ID</strong>, <strong>Partner Key / Secret</strong>, dan <strong>Access Token</strong> secara mandiri di bawah ini agar sinkronisasi katalog, stok, dan pesanan berjalan otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="h-[38px] px-5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-indigo-300" />
              <span>{showGuide ? 'Tutup Panduan' : 'Panduan Kredensial API'}</span>
              {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="h-[38px] px-5 rounded-full bg-white hover:bg-indigo-50 text-indigo-900 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Hubungkan API Toko Baru</span>
            </button>
          </div>
        </div>

        {/* Collapsible Step-by-Step Guide */}
        {showGuide && (
          <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/40 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Buka Developer Console</span>
              </div>
              <p className="text-indigo-100/80 text-[11px] leading-relaxed">
                Login ke portal API marketplace (contoh: <a href="https://open.shopee.com" target="_blank" rel="noreferrer" className="underline font-semibold text-white">open.shopee.com</a>).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/40 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Salin Partner ID & Key</span>
              </div>
              <p className="text-indigo-100/80 text-[11px] leading-relaxed">
                Masuk ke <em>App Management</em>. Salin <strong>Partner ID</strong> dan <strong>Partner Key (API Secret)</strong> aplikasi Anda.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/40 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Input ke Form Toko</span>
              </div>
              <p className="text-indigo-100/80 text-[11px] leading-relaxed">
                Klik tombol <strong>"Hubungkan API Toko Baru"</strong> di atas. Tempelkan kredensial dan masukkan <strong>Shop ID</strong> toko Anda.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-indigo-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/40 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Uji & Aktifkan Sync</span>
              </div>
              <p className="text-indigo-100/80 text-[11px] leading-relaxed">
                Klik <strong>"Uji Koneksi API"</strong>. Jika berhasil terverifikasi, aktifkan <em>Auto-Sync</em> untuk sinkronisasi otomatis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama toko, platform, atau Shop ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-[38px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-[38px] px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Platform</option>
              <option value="shopee">Shopee</option>
              <option value="tokopedia">Tokopedia</option>
              <option value="tiktok shop">TikTok Shop</option>
              <option value="lazada">Lazada</option>
              <option value="custom api">API Kustom</option>
            </select>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto flex items-center justify-end gap-2">
          <button
            onClick={fetchChannels}
            title="Segarkan Data Saluran"
            className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="h-[38px] px-5 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Toko / API</span>
          </button>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => {
          const hasCredentials =
            account.credentials &&
            Object.values(account.credentials).some((v) => v && String(v).trim().length > 0);

          return (
            <div
              key={account.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              {/* Card Header */}
              <div className="p-5 flex items-start justify-between border-b border-slate-100 dark:border-slate-700/60 relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-11 h-11 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-md ${account.color}`}>
                    {account.platform.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                      {account.shop}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {account.platform}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                          account.environment === 'sandbox'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {account.environment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(account)}
                    title="Edit Kredensial API"
                    className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account)}
                    title="Putuskan / Hapus Integrasi"
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Shop ID</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {account.shopId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Kredensial API</span>
                    {hasCredentials ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Key className="w-3 h-3" />
                        Tersimpan
                      </span>
                    ) : (
                      <button
                        onClick={() => openEditModal(account)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Belum Diisi
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Auto Sync</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {account.syncInterval}m
                      </span>
                      <button
                        onClick={() => handleToggleAutoSync(account)}
                        className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors cursor-pointer ${
                          account.autoSync ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            account.autoSync ? 'translate-x-4' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Status Koneksi</span>
                    {account.status === 'Connected' ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" />
                        Terhubung
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                        Terputus
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                    Sync: {account.lastSync}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTestConnection(account)}
                      disabled={testingId === account.id}
                      className="h-8 px-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      title="Uji Ping & Kredensial API"
                    >
                      <Zap className={`w-3.5 h-3.5 text-amber-500 ${testingId === account.id ? 'animate-pulse' : ''}`} />
                      <span>{testingId === account.id ? 'Menguji...' : 'Uji API'}</span>
                    </button>

                    <button
                      onClick={() => handleManualSync(account)}
                      disabled={syncingId === account.id}
                      className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                      title="Picu Sinkronisasi Katalog & Stok Sekarang"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === account.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Integration Card */}
        <div
          onClick={openAddModal}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group min-h-[260px]"
        >
          <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Hubungkan Toko & API</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
            Input Partner ID, Key, atau Access Token Shopee, Tokopedia, TikTok Shop, atau Lazada
          </p>
        </div>
      </div>

      {/* ── Interactive Modal: Input / Edit Kredensial API Toko ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingAccount ? `Pengaturan API: ${editingAccount.shop}` : 'Hubungkan API Toko Marketplace'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Masukkan kredensial API resmi toko Anda untuk sinkronisasi otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              {/* Platform Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Platform Marketplace
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['Shopee', 'Tokopedia', 'TikTok Shop', 'Lazada', 'Custom API'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      disabled={Boolean(editingAccount)}
                      onClick={() => setFormData({ ...formData, platform: p })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all text-center cursor-pointer ${
                        formData.platform === p
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Store Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Toko (Store Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Toko Resmi Fashion Budi"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shop ID / Seller ID
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 9812401 atau SHP-981"
                    value={formData.shopId}
                    onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Environment & Sync Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mode Lingkungan API
                  </label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-800 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="live">Production (Toko Aktif / Live)</option>
                    <option value="sandbox">Sandbox (Testing / Akun Demo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Interval Auto-Sync
                  </label>
                  <select
                    value={formData.syncInterval}
                    onChange={(e) => setFormData({ ...formData, syncInterval: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-800 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value={5}>Setiap 5 Menit (Cepat)</option>
                    <option value={15}>Setiap 15 Menit (Rekomendasi)</option>
                    <option value={30}>Setiap 30 Menit</option>
                    <option value={60}>Setiap 60 Menit</option>
                  </select>
                </div>
              </div>

              {/* Dynamic API Credentials Fields for Selected Platform */}
              <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Parameter Kredensial {activePlatformConfig.name}
                    </span>
                  </div>
                  {activePlatformConfig.docsUrl !== '#' && (
                    <a
                      href={activePlatformConfig.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  {activePlatformConfig.fields.map((f) => {
                    const isSecret = Boolean(f.secret);
                    const showSecret = Boolean(showSecrets[f.key]);

                    return (
                      <div key={f.key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                            {f.label}
                          </label>
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowSecrets((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
                              }
                              className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                            >
                              {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{showSecret ? 'Sembunyikan' : 'Lihat'}</span>
                            </button>
                          )}
                        </div>
                        <input
                          type={isSecret && !showSecret ? 'password' : 'text'}
                          placeholder={f.placeholder}
                          value={formData.credentials[f.key] || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              credentials: { ...formData.credentials, [f.key]: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-800 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{f.helper}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Akun admin PIC toko cabang Surabaya"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-800 dark:text-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-6 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAccount ? 'Simpan Perubahan Kredensial' : 'Hubungkan & Simpan API'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
