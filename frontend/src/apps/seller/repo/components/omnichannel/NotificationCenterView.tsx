import React, { useState } from 'react';
import { Bell, Check, Trash2, ShieldAlert, AlertTriangle, PackageX, Receipt, AlertCircle } from 'lucide-react';

export const NotificationCenterView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const notifications = [
    {
      id: 1,
      type: 'Token Expired',
      title: 'Koneksi TikTok Shop Terputus',
      message: 'Sistem gagal menyinkronkan data karena token akses telah kedaluwarsa. Harap sambungkan ulang akun Anda.',
      time: '2 jam yang lalu',
      isRead: false,
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      borderColor: 'border-rose-100 dark:border-rose-900/30'
    },
    {
      id: 2,
      type: 'Stock Conflict',
      title: 'Konflik Stok SKU-001',
      message: 'Terdapat perbedaan stok antara gudang lokal (10) dan Shopee (15). Sinkronisasi stok dibatalkan.',
      time: '3 jam yang lalu',
      isRead: false,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      borderColor: 'border-amber-100 dark:border-amber-900/30'
    },
    {
      id: 3,
      type: 'Mapping Failed',
      title: 'Pemetaan Produk Gagal',
      message: 'Gagal memetakan SKU-002 dengan Tokopedia karena SKU tidak ditemukan di toko tujuan.',
      time: 'Kemarin',
      isRead: true,
      icon: <PackageX className="w-5 h-5 text-slate-500" />,
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
      borderColor: 'border-slate-200 dark:border-slate-700'
    },
    {
      id: 4,
      type: 'Price Conflict',
      title: 'Peringatan Harga Bawah HPP',
      message: 'Harga jual SKU-005 di Lazada disetel lebih rendah dari Harga Pokok Penjualan (HPP).',
      time: 'Kemarin',
      isRead: true,
      icon: <Receipt className="w-5 h-5 text-indigo-500" />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
      borderColor: 'border-indigo-100 dark:border-indigo-900/30'
    },
    {
      id: 5,
      type: 'Sync Failed',
      title: 'Sinkronisasi Pesanan Gagal (Shopee)',
      message: 'API Shopee sedang mengalami gangguan (Error 500). Sistem akan mencoba lagi dalam 5 menit.',
      time: '12 Okt 2026',
      isRead: true,
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      bgColor: 'bg-rose-50 dark:bg-rose-500/10',
      borderColor: 'border-rose-100 dark:border-rose-900/30'
    }
  ];

  const filtered = activeTab === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="truncate">Pusat Notifikasi</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Pantau semua peringatan sistem dan masalah operasional Omnichannel.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors text-sm">
            <Check className="w-4 h-4" />
            Tandai Semua Dibaca
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-700/60 px-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'all' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'unread' 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Belum Dibaca
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {filtered.map((notif) => (
            <div key={notif.id} className={`p-4 flex gap-4 transition-colors ${notif.isRead ? 'opacity-70 hover:opacity-100' : 'bg-slate-50/50 dark:bg-slate-800/80'} group relative`}>
              {!notif.isRead && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
              )}
              
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${notif.bgColor} ${notif.borderColor}`}>
                {notif.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-600">
                        {notif.type}
                      </span>
                      <span className="text-xs text-slate-400">{notif.time}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{notif.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Tandai Dibaca" className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button title="Hapus Notifikasi" className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {notif.message}
                </p>
                
                {!notif.isRead && (
                  <button className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Ambil Tindakan
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
             <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>Tidak ada notifikasi di kategori ini.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
