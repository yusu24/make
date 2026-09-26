import React from 'react';
import { Truck, Package, Clock, ShieldAlert, ArrowLeftRight, ChevronRight } from '@/constants/icons';

export const ShippingDashboardView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Perlu Dikemas
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              45 <span className="text-xs font-normal text-slate-400 font-['Inter']">Paket</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Antrian packing</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
              Siap cetak
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Siap Pickup
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              12 <span className="text-xs font-normal text-slate-400 font-['Inter']">Paket</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Menunggu kurir</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Hari ini
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Dikirim Hari Ini
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              89 <span className="text-xs font-normal text-slate-400 font-['Inter']">Paket</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Dalam perjalanan</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Transit
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer hover:border-rose-400 dark:hover:border-rose-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Kendala / Telat
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              3 <span className="text-xs font-normal text-slate-400 font-['Inter']">Isu</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Perlu tindakan</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              Segera cek
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer hover:border-purple-400 dark:hover:border-purple-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Retur Hari Ini
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              2 <span className="text-xs font-normal text-slate-400 font-['Inter']">Paket</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-['Inter']">Pengembalian</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
              Proses QC
            </span>
          </div>
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
