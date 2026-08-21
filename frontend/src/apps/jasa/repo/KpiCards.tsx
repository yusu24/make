import React from 'react';
import { 
  ClipboardCheck, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Users, 
  Star,
  DollarSign,
  Zap,
  Activity
} from 'lucide-react';
import { ServiceStats } from '../types';
import { formatRupiah } from '../data/mockData';

interface KpiCardsProps {
  stats: ServiceStats;
  onFilterUrgent?: () => void;
  onFilterActive?: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ 
  stats, 
  onFilterUrgent, 
  onFilterActive 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* 1. Pendapatan Jasa */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Omset Jasa</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-base group-hover:scale-105 transition-transform">
            💰
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            {formatRupiah(stats.totalRevenueMonth)}
          </div>
          <div className="flex items-center space-x-1 mt-2 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% bln ini</span>
          </div>
        </div>
      </div>

      {/* 2. SPK Selesai */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">SPK Selesai</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-base group-hover:scale-105 transition-transform">
            ✅
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            {stats.completedThisMonth} <span className="text-xs font-semibold text-slate-400">/ {stats.totalOrders}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Rasio beres <span className="text-blue-600 font-semibold">{((stats.completedThisMonth / stats.totalOrders) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* 3. SPK Aktif & Dalam Proses */}
      <button 
        onClick={onFilterActive}
        className="text-left bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pesanan Aktif</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-base group-hover:scale-105 transition-transform">
            ⚡
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-blue-600 tracking-tight">
            {stats.activeOrders} <span className="text-xs font-semibold text-slate-400">SPK</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 group-hover:underline font-semibold flex items-center gap-1">
            <span>Buka antrean →</span>
          </div>
        </div>
      </button>

      {/* 4. Tiket Darurat */}
      <button 
        onClick={onFilterUrgent}
        className="text-left bg-white border border-rose-200/80 rounded-3xl p-5 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-500">Tiket Kritis</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-semibold text-base group-hover:scale-105 transition-transform">
            🚨
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-rose-600 tracking-tight flex items-center space-x-2">
            <span>{stats.urgentTickets} Tiket</span>
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="mt-2 text-[11px] text-rose-600 group-hover:underline font-semibold">
            Respon cepat →
          </div>
        </div>
      </button>

      {/* 5. SLA Kepatuhan */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">SLA Kepatuhan</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-base group-hover:scale-105 transition-transform">
            🎯
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-indigo-600 tracking-tight">
            {stats.slaComplianceRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Target SLA: <span className="text-slate-800 font-semibold">≥95%</span>
          </div>
        </div>
      </div>

      {/* 6. CSAT Kepuasan Pelanggan */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Skor CSAT</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-base group-hover:scale-105 transition-transform">
            ⭐
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight flex items-baseline space-x-1">
            <span>{stats.averageCsat}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-semibold">
            ★ 92 ulasan klien
          </div>
        </div>
      </div>
    </div>
  );
};
