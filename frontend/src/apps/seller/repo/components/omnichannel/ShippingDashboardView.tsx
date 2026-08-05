import React from 'react';
import { Truck, Package, Clock, ShieldAlert, ArrowLeftRight, ChevronRight } from 'lucide-react';

export const ShippingDashboardView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="truncate">Fulfillment Dashboard</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Pantau status pemrosesan dan pengiriman pesanan secara real-time.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between group cursor-pointer hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">45</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Perlu Dikemas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between group cursor-pointer hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">12</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Siap Pickup</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between group cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-500" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">89</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Dikirim Hari Ini</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between group cursor-pointer hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-rose-500 transition-colors" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">3</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Terlambat / Kendala</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between group cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-purple-500" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">2</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Retur Hari Ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Attention Needed */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Perlu Perhatian Segera
            </h2>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {[
                { id: 'INV-12003', issue: 'Batas waktu pengiriman hampir habis (Shopee)', time: 'Sisa 2 jam' },
                { id: 'INV-12005', issue: 'Kurir gagal pickup (J&T Express)', time: '1 jam yang lalu' },
                { id: 'INV-11990', issue: 'Pembeli mengajukan pembatalan (Tokopedia)', time: '3 jam yang lalu' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-900/30">
                  <div>
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">{item.id}</h4>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">{item.issue}</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 dark:text-rose-500 bg-white dark:bg-rose-950 px-2 py-1 rounded-full shadow-sm">{item.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-100 dark:border-rose-800/30">
              Lihat Semua Isu
            </button>
          </div>
        </div>

        {/* Courier Performance (Dummy) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              Performa Ekspedisi
            </h2>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center">
            <div className="space-y-5">
              {[
                { name: 'J&T Express', percent: 85, color: 'bg-red-500' },
                { name: 'JNE Reguler', percent: 65, color: 'bg-blue-600' },
                { name: 'SiCepat Halu', percent: 45, color: 'bg-rose-500' },
                { name: 'GoSend Instant', percent: 20, color: 'bg-emerald-500' },
              ].map((courier, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>{courier.name}</span>
                    <span>{courier.percent}% volume</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className={`${courier.color} h-full rounded-full`} style={{ width: `${courier.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
