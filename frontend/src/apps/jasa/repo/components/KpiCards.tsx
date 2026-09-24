import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Star,
  Wallet
} from '@/constants/icons';
import { ServiceStats } from '../types';
import { formatRupiah } from '../data/mockData';

interface KpiCardsProps {
  stats: ServiceStats;
  onFilterUrgent?: () => void;
  onFilterActive?: () => void;
  canViewFinancial?: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ 
  stats, 
  onFilterUrgent, 
  onFilterActive,
  canViewFinancial = true
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 ${canViewFinancial ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4 mb-5`}>
      {/* 1. Pendapatan Jasa (Hanya ditampilkan bila memiliki hak akses finansial) */}
      {canViewFinancial && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Omset Jasa</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans'] text-slate-900 tracking-tight truncate">
              {formatRupiah(stats.totalRevenueMonth)}
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-emerald-600 font-medium font-['Inter']">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8% bln ini</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. SPK Selesai */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">SPK Selesai</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans'] text-slate-900 tracking-tight">
            {stats.completedThisMonth} <span className="text-xs font-semibold text-slate-400 font-['Inter']">/ {stats.totalOrders}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium font-['Inter']">
            Rasio <span className="text-blue-600 font-semibold">{((stats.completedThisMonth / stats.totalOrders) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* 3. SPK Aktif & Dalam Proses */}
      <button 
        onClick={onFilterActive}
        className="text-left bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Pesanan Aktif</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans'] text-blue-600 tracking-tight">
            {stats.activeOrders} <span className="text-xs font-semibold text-slate-400 font-['Inter']">SPK</span>
          </div>
          <div className="mt-1 text-xs text-blue-600 group-hover:underline font-semibold font-['Inter'] flex items-center gap-1">
            <span>Antrean →</span>
          </div>
        </div>
      </button>

      {/* 4. Tiket Darurat */}
      <button 
        onClick={onFilterUrgent}
        className="text-left bg-white border border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 font-['Inter']">Tiket Kritis</span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans'] text-rose-600 tracking-tight flex items-center space-x-1.5">
            <span>{stats.urgentTickets} Tiket</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="mt-1 text-xs text-rose-600 group-hover:underline font-semibold font-['Inter']">
            Respon →
          </div>
        </div>
      </button>

      {/* 5. SLA Kepatuhan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">SLA Kepatuhan</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans'] text-indigo-600 tracking-tight">
            {stats.slaComplianceRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium font-['Inter']">
            Target: <span className="text-slate-800 font-semibold">≥95%</span>
          </div>
        </div>
      </div>

      {/* 6. CSAT Kepuasan Pelanggan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-['Inter']">Skor CSAT</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans'] text-slate-900 tracking-tight flex items-baseline space-x-1">
            <span>{stats.averageCsat}</span>
            <span className="text-xs text-slate-400 font-semibold font-['Inter']">/ 5.0</span>
          </div>
          <div className="mt-1 text-xs text-amber-600 font-medium font-['Inter'] flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline shrink-0" />
            <span>92 ulasan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
