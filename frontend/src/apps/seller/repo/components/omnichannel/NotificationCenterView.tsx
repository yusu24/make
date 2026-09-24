import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  ShieldAlert, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Eye, 
  ArrowRight, 
  RefreshCw, 
  X,
  ExternalLink,
  ChevronRight,
  Info
} from '@/constants/icons';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

export interface NotificationItem {
  id: number;
  type: string;
  category: 'critical' | 'warning' | 'info' | 'success';
  channel: 'TikTok Shop' | 'Shopee' | 'Tokopedia' | 'Lazada' | 'Sistem';
  title: string;
  message: string;
  time: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: 'Token Expired',
    category: 'critical',
    channel: 'TikTok Shop',
    title: 'Koneksi TikTok Shop Terputus',
    message: 'Sistem gagal menyinkronkan data karena token otorisasi OAuth telah kedaluwarsa. Harap sambungkan ulang akun toko Anda.',
    time: '2 jam yang lalu',
    date: '22 Sep 2026, 19:40',
    isRead: false,
    actionUrl: '/seller/integrations',
    actionLabel: 'Hubungkan Ulang Akun'
  },
  {
    id: 2,
    type: 'Konflik Stok',
    category: 'warning',
    channel: 'Shopee',
    title: 'Konflik Stok SKU-001 (Kemeja Oxford)',
    message: 'Terdapat perbedaan jumlah stok antara gudang lokal (10) dan Shopee (15). Sinkronisasi stok otomatis ditangguhkan.',
    time: '3 jam yang lalu',
    date: '22 Sep 2026, 18:30',
    isRead: false,
    actionUrl: '/seller/inventory',
    actionLabel: 'Selesaikan Konflik Stok'
  },
  {
    id: 3,
    type: 'Pemetaan Gagal',
    category: 'critical',
    channel: 'Tokopedia',
    title: 'Pemetaan Produk SKU-002 Gagal',
    message: 'Gagal memetakan SKU-002 dengan Tokopedia karena ID produk atau varian tidak ditemukan pada katalog toko tujuan.',
    time: '5 jam yang lalu',
    date: '22 Sep 2026, 16:15',
    isRead: false,
    actionUrl: '/seller/mapping',
    actionLabel: 'Periksa Pemetaan SKU'
  },
  {
    id: 4,
    type: 'Peringatan Harga',
    category: 'warning',
    channel: 'Lazada',
    title: 'Peringatan Harga Jual di Bawah HPP',
    message: 'Harga jual SKU-005 di Lazada disetel Rp 45.000, lebih rendah dari Harga Pokok Penjualan (HPP) Rp 50.000.',
    time: 'Kemarin, 14:20',
    date: '21 Sep 2026, 14:20',
    isRead: true,
    actionUrl: '/seller/catalog',
    actionLabel: 'Sesuaikan Harga'
  },
  {
    id: 5,
    type: 'Gagal Sinkronisasi',
    category: 'critical',
    channel: 'Shopee',
    title: 'Sinkronisasi Pesanan Gagal (Error 500)',
    message: 'API Shopee sedang mengalami gangguan temporer (HTTP 500). Sistem background sync akan mencoba kembali secara otomatis.',
    time: 'Kemarin, 10:10',
    date: '21 Sep 2026, 10:10',
    isRead: true,
    actionUrl: '/seller/sync-center',
    actionLabel: 'Lihat Antrean Sync'
  },
  {
    id: 6,
    type: 'Pesanan Baru',
    category: 'info',
    channel: 'TikTok Shop',
    title: 'Pesanan Masuk #TT-99824 Siap Dikemas',
    message: 'Pesanan baru senilai Rp 320.000 telah dibayar pembeli. Segera proses cetak resi pengiriman sebelum batas waktu kirim.',
    time: '20 Sep 2026',
    date: '20 Sep 2026, 11:05',
    isRead: true,
    actionUrl: '/seller/orders',
    actionLabel: 'Buka Menu Pesanan'
  },
  {
    id: 7,
    type: 'Stok Menipis',
    category: 'warning',
    channel: 'Sistem',
    title: 'Peringatan Stok Menipis SKU-009 (Kaos Polos M)',
    message: 'Sisa stok fisik di Gudang Utama tersisa 3 unit (di bawah batas minimum 10 unit). Segera buat pesanan pembelian ke supplier.',
    time: '19 Sep 2026',
    date: '19 Sep 2026, 09:12',
    isRead: true,
    actionUrl: '/seller/inventory',
    actionLabel: 'Restock Barang'
  },
  {
    id: 8,
    type: 'Otorisasi Sukses',
    category: 'success',
    channel: 'Lazada',
    title: 'Token Toko Lazada Berhasil Diperbarui',
    message: 'Koneksi API toko Lazada telah diperpanjang dengan masa aktif token 30 hari ke depan. Sinkronisasi aktif normal.',
    time: '18 Sep 2026',
    date: '18 Sep 2026, 15:45',
    isRead: true,
    actionUrl: '/seller/integrations',
    actionLabel: 'Lihat Status Integrasi'
  },
  {
    id: 9,
    type: 'Pembatalan Pesanan',
    category: 'warning',
    channel: 'Shopee',
    title: 'Pembatalan Otomatis Pesanan #SP-88310',
    message: 'Pembeli membatalkan pesanan karena batas waktu pembayaran habis. Stok barang telah otomatis dikembalikan ke inventaris.',
    time: '17 Sep 2026',
    date: '17 Sep 2026, 13:20',
    isRead: true,
    actionUrl: '/seller/orders',
    actionLabel: 'Lihat Riwayat Pesanan'
  },
  {
    id: 10,
    type: 'Batch Sync',
    category: 'success',
    channel: 'TikTok Shop',
    title: 'Sinkronisasi 50 Katalog Produk Berhasil',
    message: 'Pembaruan data harga grosir dan deskripsi 50 produk ke TikTok Shop berhasil dipublikasikan tanpa kendala.',
    time: '16 Sep 2026',
    date: '16 Sep 2026, 17:00',
    isRead: true,
    actionUrl: '/seller/sync-center',
    actionLabel: 'Riwayat Sinkronisasi'
  }
];

export const NotificationCenterView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical' | 'warning' | 'info'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === 'unread' && item.isRead) return false;
      if (activeTab === 'critical' && item.category !== 'critical') return false;
      if (activeTab === 'warning' && item.category !== 'warning') return false;
      if (activeTab === 'info' && item.category !== 'info' && item.category !== 'success') return false;

      // Channel filter
      if (selectedChannel !== 'all' && item.channel !== selectedChannel) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesMessage = item.message.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        const matchesChannel = item.channel.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage && !matchesType && !matchesChannel) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeTab, selectedChannel, searchTerm]);

  // Pagination
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setCurrentPage
  } = usePagination(filteredNotifications, 10);

  // Statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const critical = notifications.filter(n => n.category === 'critical').length;
    const warning = notifications.filter(n => n.category === 'warning').length;
    return { total, unread, critical, warning };
  }, [notifications]);

  // Actions
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n));
  };

  const handleDelete = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Hapus notifikasi ini?')) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Hapus ${selectedIds.length} notifikasi yang dipilih?`)) {
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedIds.length === 0) return;
    setNotifications(prev => prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n));
    setSelectedIds([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allCurrentIds = paginatedItems.map(n => n.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allCurrentIds])));
    } else {
      const allCurrentIds = paginatedItems.map(n => n.id);
      setSelectedIds(selectedIds.filter(id => !allCurrentIds.includes(id)));
    }
  };

  const isAllCurrentSelected = paginatedItems.length > 0 && paginatedItems.every(n => selectedIds.includes(n.id));

  // Channel badge styling helper
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'Shopee':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
      case 'Tokopedia':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'TikTok Shop':
        return 'bg-slate-900 text-white border-slate-900 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600';
      case 'Lazada':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
    }
  };

  // Category badge & icon styling helper
  const getCategoryMeta = (category: string) => {
    switch (category) {
      case 'critical':
        return {
          label: 'Kritis / Error',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
          badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        };
      case 'warning':
        return {
          label: 'Peringatan',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
          badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        };
      case 'success':
        return {
          label: 'Sukses',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
        };
      default:
        return {
          label: 'Info',
          icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
          badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Actions */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {selectedIds.length > 0 ? (
          <>
            <button
              onClick={handleMarkSelectedAsRead}
              className="flex items-center gap-1.5 px-3.5 h-[38px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tandai Terbaca ({selectedIds.length})</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3.5 h-[38px] bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold rounded-xl border border-rose-200 dark:border-rose-800 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 h-[38px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors text-xs cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Tandai Semua Dibaca</span>
          </button>
        )}
      </div>

      {/* KPI / Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveTab('all')} 
          className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'all' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Notifikasi</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Seluruh riwayat peringatan</div>
        </div>

        <div 
          onClick={() => setActiveTab('unread')} 
          className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'unread' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Belum Dibaca</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.unread}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Perlu tindak lanjut / respon</div>
        </div>

        <div 
          onClick={() => setActiveTab('critical')} 
          className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'critical' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Masalah Kritis</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.critical}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Token putus & sinkronisasi error</div>
        </div>

        <div 
          onClick={() => setActiveTab('warning')} 
          className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all cursor-pointer shadow-xs ${
            activeTab === 'warning' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Peringatan Operasional</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.warning}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Konflik stok & harga bawah HPP</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul, tipe, atau isi pesan..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Status / Kategori Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter:</span>
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="all">Semua ({stats.total})</option>
                <option value="unread">Belum Dibaca ({stats.unread})</option>
                <option value="critical">Kritis & Error ({stats.critical})</option>
                <option value="warning">Peringatan ({stats.warning})</option>
                <option value="info">Info & Sukses ({stats.total - stats.critical - stats.warning})</option>
              </select>
            </div>

            {/* Saluran Dropdown Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Saluran:</span>
              <select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="all">Semua Saluran</option>
                <option value="Shopee">Shopee</option>
                <option value="Tokopedia">Tokopedia</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Lazada">Lazada</option>
                <option value="Sistem">Sistem Internal</option>
              </select>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-700/40 text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={handleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Pilih Semua Halaman Ini"
                  />
                </th>
                <th className="py-3 px-3 w-16 text-center">Status</th>
                <th className="py-3 px-4 w-44">Tipe & Saluran</th>
                <th className="py-3 px-4 min-w-[280px]">Judul & Deskripsi Notifikasi</th>
                <th className="py-3 px-4 w-36 whitespace-nowrap">Waktu</th>
                <th className="py-3 px-4 w-36 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-sans">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Tidak ada notifikasi yang ditemukan
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Coba ganti filter tab atau kata kunci pencarian Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((notif) => {
                  const isSelected = selectedIds.includes(notif.id);
                  const meta = getCategoryMeta(notif.category);
                  const channelBadge = getChannelBadge(notif.channel);

                  return (
                    <tr
                      key={notif.id}
                      onClick={() => setSelectedNotification(notif)}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${
                        !notif.isRead 
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/10 font-normal' 
                          : 'opacity-85'
                      } ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-900/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <td 
                        className="py-3.5 px-4 text-center align-top"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds([...selectedIds, notif.id]);
                            } else {
                              setSelectedIds(selectedIds.filter(id => id !== notif.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Status indicator (Read / Unread) */}
                      <td className="py-3.5 px-3 text-center align-top">
                        {notif.isRead ? (
                          <span 
                            title="Sudah Dibaca"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span 
                            title="Notifikasi Baru (Belum Dibaca)"
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 font-bold text-[10px] animate-pulse"
                          >
                            ●
                          </span>
                        )}
                      </td>

                      {/* Tipe & Saluran */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.badge}`}>
                            {meta.icon}
                            <span>{notif.type}</span>
                          </span>
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${channelBadge}`}>
                              {notif.channel}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Judul & Pesan */}
                      <td className="py-3.5 px-4 align-top">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-[13px] text-slate-900 dark:text-slate-100 ${!notif.isRead ? 'font-bold' : 'font-semibold'}`}>
                              {notif.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="py-3.5 px-4 align-top text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{notif.time}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{notif.date}</div>
                      </td>

                      {/* Aksi */}
                      <td 
                        className="py-3.5 px-4 align-top text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedNotification(notif)}
                            title="Lihat Rincian & Tindakan"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleToggleRead(notif.id, e)}
                            title={notif.isRead ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            title="Hapus Notifikasi"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        )}
      </div>

      {/* MODAL: DETAIL & TINDAKAN NOTIFIKASI */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  {getCategoryMeta(selectedNotification.category).icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Rincian Peringatan Sistem
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    ID #{selectedNotification.id} • {selectedNotification.date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryMeta(selectedNotification.category).badge}`}>
                  {selectedNotification.type}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getChannelBadge(selectedNotification.channel)}`}>
                  {selectedNotification.channel}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${selectedNotification.isRead ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                  {selectedNotification.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedNotification.title}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Rekomendasi Solusi */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 rounded-xl text-xs space-y-1">
                <strong className="text-amber-900 dark:text-amber-200 font-semibold block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rekomendasi Tindakan:</span>
                </strong>
                <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                  Periksa menu terkait untuk menyelesaikan masalah sebelum proses sinkronisasi berikutnya dieksekusi.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  handleToggleRead(selectedNotification.id);
                  setSelectedNotification(prev => prev ? { ...prev, isRead: !prev.isRead } : null);
                }}
                className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {selectedNotification.isRead ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
              </button>

              <div className="flex items-center gap-2">
                {selectedNotification.actionUrl && (
                  <a
                    href={selectedNotification.actionUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>{selectedNotification.actionLabel || 'Buka Halaman'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
