import React from 'react';
import { 
  ClipboardList, 
  Users, 
  Plus, 
  Eye, 
  Printer, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ChevronRight,
  Wrench,
  ShieldCheck
} from '@/constants/icons';
import { WorkOrder, Technician, ServiceStats } from '../types';
import { formatRupiah } from '../data/mockData';
import { KpiCards } from './KpiCards';
import { useAuth } from '../../../../contexts/AuthContext';
import { useJasa } from '../contexts/JasaContext';
import { hasJasaPermission } from './Sidebar';

interface OverviewDashboardProps {
  stats: ServiceStats;
  workOrders: WorkOrder[];
  technicians: Technician[];
  onOpenNewSpk: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
  onPrintWorkOrder: (order: WorkOrder) => void;
  onFilterUrgent: () => void;
  onFilterActive: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  stats,
  workOrders,
  technicians,
  onOpenNewSpk,
  onNavigateTab,
  onSelectWorkOrder,
  onPrintWorkOrder,
  onFilterUrgent,
  onFilterActive
}) => {
  const { user } = useAuth();
  const { terms } = useJasa();

  // Real-time live date and time state
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const greetingTime = 
    hours >= 4 && hours < 11 ? 'Selamat Pagi' :
    hours >= 11 && hours < 15 ? 'Selamat Siang' :
    hours >= 15 && hours < 18 ? 'Selamat Sore' : 'Selamat Malam';

  const dayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long'
  }).format(currentTime);

  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);

  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(currentTime).replace(/\./g, ':');

  const displayName = user?.name || user?.tenant_name || 'Admin';
  const businessName = user?.tenant_name || user?.business_name || terms.workOrdersLabel || 'Workshop';

  // Check role & permissions
  const canViewFinancial = hasJasaPermission(user, 'finance_view');
  const canViewAllSpk = hasJasaPermission(user, 'spk_view_all');

  // Match technician linked to current logged-in user
  const myTechnician = React.useMemo(() => {
    return technicians.find(t => 
      (t.user_id && user?.id && String(t.user_id) === String(user.id)) ||
      (t.email && user?.email && t.email.toLowerCase() === user.email.toLowerCase())
    );
  }, [technicians, user]);

  const isOperatorOrTech = !canViewFinancial && (!canViewAllSpk || !!myTechnician);

  // My Personal Assigned Active Tasks (for Technician)
  const myAssignedOrders = React.useMemo(() => {
    if (!myTechnician && canViewAllSpk) return [];
    return workOrders.filter(o => {
      if (o.status === 'Diserahkan / Lunas' || (o.status as string) === 'Selesai' || o.status === 'Dibatalkan') {
        return false;
      }
      if (myTechnician) {
        return String(o.technicianId) === String(myTechnician.id) ||
          (o.technicianName && myTechnician.name && o.technicianName.toLowerCase() === myTechnician.name.toLowerCase());
      }
      return false;
    });
  }, [workOrders, myTechnician, canViewAllSpk]);

  // 1. Pipeline Status Breakdown (personalized if operator)
  const pipelineCounts = React.useMemo(() => {
    // If technician only, count pipeline for their assigned orders
    const targetOrders = (isOperatorOrTech && myAssignedOrders.length > 0) 
      ? workOrders.filter(o => {
          if (!myTechnician) return true;
          return String(o.technicianId) === String(myTechnician.id) ||
            (o.technicianName && myTechnician.name && o.technicianName.toLowerCase() === myTechnician.name.toLowerCase());
        })
      : workOrders;

    const total = targetOrders.length;
    const antrean = targetOrders.filter(w => w.status === 'Antrean' || w.status === 'Pengecekan & Estimasi').length;
    const pengerjaan = targetOrders.filter(w => w.status === 'Sedang Dikerjakan').length;
    const menungguPart = targetOrders.filter(w => w.status === 'Menunggu Sparepart' || w.status === 'Menunggu Persetujuan').length;
    const selesai = targetOrders.filter(w => w.status === 'Selesai & Siap Diambil' || w.status === 'Diserahkan / Lunas' || (w.status as string) === 'Selesai').length;

    return { total, antrean, pengerjaan, menungguPart, selesai };
  }, [workOrders, isOperatorOrTech, myAssignedOrders, myTechnician]);

  // 2. Technicians Availability
  const techAvailability = React.useMemo(() => {
    const total = technicians.length;
    const available = technicians.filter(t => t.currentStatus === 'Tersedia' || t.currentStatus === 'Siaga');
    const busy = technicians.filter(t => t.currentStatus === 'Bertugas');
    const leave = technicians.filter(t => t.currentStatus === 'Izin / Cuti');

    return { total, available, busy, leave };
  }, [technicians]);

  // 3. Priority Urgent / Active Orders (Personalized for technician or global for owner)
  const priorityOrders = React.useMemo(() => {
    let list = [...workOrders]
      .filter(o => o.status !== 'Diserahkan / Lunas' && (o.status as string) !== 'Selesai' && o.status !== 'Dibatalkan');

    // If restricted technician/operator, filter only their own orders
    if (isOperatorOrTech && myTechnician) {
      list = list.filter(o => 
        String(o.technicianId) === String(myTechnician.id) ||
        (o.technicianName && myTechnician.name && o.technicianName.toLowerCase() === myTechnician.name.toLowerCase())
      );
    }

    return list
      .sort((a, b) => {
        const weight: Record<string, number> = { 'Darurat': 4, 'Tinggi': 3, 'Sedang': 2, 'Rendah': 1 };
        const diff = (weight[b.priority] || 0) - (weight[a.priority] || 0);
        if (diff !== 0) return diff;
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      })
      .slice(0, 6);
  }, [workOrders, isOperatorOrTech, myTechnician]);

  const isEmptyAccount = workOrders.length === 0 && technicians.length === 0;

  return (
    <div className="space-y-4">
      {/* Welcome & Context Bar - Sleek & Compact */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#170e2b] via-[#120a22] to-[#0a0515] p-4 sm:p-5 text-white shadow-xs border border-purple-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-['Plus_Jakarta_Sans'] tracking-tight text-white" style={{ fontWeight: 800 }}>
              {greetingTime}, {displayName}
            </h2>
            <p className="text-purple-200/70 text-xs mt-0.5 font-['Inter'] flex items-center gap-2">
              <span>{businessName}</span>
              <span>•</span>
              <span>{dayFormatted}, {dateFormatted}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.07] px-3 py-1.5 rounded-xl border border-purple-400/20 self-start sm:self-center">
            <Clock className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="font-mono text-xs text-white">{timeFormatted} WIB</span>
          </div>
        </div>
      </div>

      {/* 1. Top Bento KPI Metric Cards */}
      <KpiCards
        stats={stats}
        onFilterUrgent={onFilterUrgent}
        onFilterActive={onFilterActive}
        canViewFinancial={canViewFinancial}
      />

      {/* Empty State Onboarding Guide for Fresh Accounts */}
      {isEmptyAccount && (
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white border border-blue-200/80 shadow-xs">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-3">
              <Sparkles size={14} />
              <span>Selamat Datang di Sistem Jasa & Servis</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Mulai Pengaturan Usaha Anda dalam 3 Langkah Mudah
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-6 leading-relaxed">
              Akun Anda siap digunakan. Ikuti langkah cepat di bawah ini untuk mencatat layanan, teknisi, dan menerbitkan Surat Perintah Kerja (SPK) perdana Anda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => onNavigateTab('catalog')}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  1
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Atur Tarif & Layanan
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Daftarkan jenis servis & ongkos kerja.
                </div>
              </button>

              <button 
                onClick={() => onNavigateTab('technicians')}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  2
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Daftarkan Teknisi / Tim
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Tambahkan pekerja atau operator bengkel.
                </div>
              </button>

              <button 
                onClick={onOpenNewSpk}
                className="p-3.5 rounded-xl bg-white border border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:shadow-sm text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-2.5">
                  3
                </div>
                <div className="text-xs font-bold text-blue-700">
                  Terbitkan SPK Pertama
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Catat unit servis masuk & cetak tanda terima.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Middle Grid: Service Pipeline Status & Team Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Card A: Pipeline Progres Servis */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Alur Kerja Servis Hari Ini</span>
              </h3>
              <button
                onClick={() => onNavigateTab('work-orders')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua SPK</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Visual Pipeline Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex my-3.5 shadow-inner">
              {pipelineCounts.total > 0 ? (
                <>
                  <div 
                    style={{ width: `${(pipelineCounts.antrean / pipelineCounts.total) * 100}%` }} 
                    className="bg-amber-400 transition-all duration-500" 
                    title={`Antrean: ${pipelineCounts.antrean}`}
                  />
                  <div 
                    style={{ width: `${(pipelineCounts.pengerjaan / pipelineCounts.total) * 100}%` }} 
                    className="bg-blue-600 transition-all duration-500" 
                    title={`Pengerjaan: ${pipelineCounts.pengerjaan}`}
                  />
                  <div 
                    style={{ width: `${(pipelineCounts.menungguPart / pipelineCounts.total) * 100}%` }} 
                    className="bg-purple-500 transition-all duration-500" 
                    title={`Menunggu Sparepart: ${pipelineCounts.menungguPart}`}
                  />
                  <div 
                    style={{ width: `${(pipelineCounts.selesai / pipelineCounts.total) * 100}%` }} 
                    className="bg-emerald-500 transition-all duration-500" 
                    title={`Selesai: ${pipelineCounts.selesai}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200" />
              )}
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Antrean Masuk</span>
                </div>
                <div className="text-lg font-bold text-amber-900 mt-1">
                  {pipelineCounts.antrean} <span className="text-[11px] font-normal text-amber-700">unit</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-blue-700 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Sedang Dikerjakan</span>
                </div>
                <div className="text-lg font-bold text-blue-900 mt-1">
                  {pipelineCounts.pengerjaan} <span className="text-[11px] font-normal text-blue-700">unit</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-purple-700 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Tunggu Sparepart</span>
                </div>
                <div className="text-lg font-bold text-purple-900 mt-1">
                  {pipelineCounts.menungguPart} <span className="text-[11px] font-normal text-purple-700">unit</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Siap Ambil / Selesai</span>
                </div>
                <div className="text-lg font-bold text-emerald-900 mt-1">
                  {pipelineCounts.selesai} <span className="text-[11px] font-normal text-emerald-700">unit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Bar under Pipeline */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Total pengerjaan SPK:{' '}
              <strong className="text-slate-800">{pipelineCounts.total} SPK</strong>
            </span>
            <div className="flex items-center gap-2">
              {hasJasaPermission(user, 'spk_create') && (
                <button
                  onClick={onOpenNewSpk}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>{terms.newWorkOrderBtn || 'Terbitkan SPK Baru'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card B: Tim Teknisi (Admin) ATAU Status Tugas Saya (Teknisi) */}
        {isOperatorOrTech ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Tugas Servis Saya Hari Ini</span>
                </h3>
                <button
                  onClick={() => onNavigateTab('work-orders')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>SPK Saya</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="font-semibold text-slate-700">Dalam Penanganan:</span>
                </div>
                <span className="font-bold text-blue-700">
                  {myAssignedOrders.length} Unit Aktif
                </span>
              </div>

              {/* List of my assigned orders */}
              <div className="space-y-2 max-h-[168px] overflow-y-auto pr-1">
                {myAssignedOrders.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-emerald-400" />
                    <p className="text-xs font-semibold text-slate-700">Belum Ada Tugas Aktif</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Semua SPK penugasan Anda telah selesai dikerjakan.</p>
                  </div>
                ) : (
                  myAssignedOrders.slice(0, 4).map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => onSelectWorkOrder(order)}
                      className="p-2 rounded-xl border border-slate-100 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                          {order.id} - {order.serviceObjectName || order.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {order.customerName} • {order.scheduledDate || 'Hari ini'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                        {order.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-right">
              <button
                onClick={() => onNavigateTab('work-orders')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Buka lembar kerja SPK saya →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ketersediaan Tim Teknisi</span>
                </h3>
                <button
                  onClick={() => onNavigateTab('technicians')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Kelola</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Quick Status Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-700">Siap Ditugaskan:</span>
                </div>
                <span className="font-bold text-emerald-600">
                  {techAvailability.available.length} dari {techAvailability.total} Teknisi
                </span>
              </div>

              {/* List of active technicians */}
              <div className="space-y-2 max-h-[168px] overflow-y-auto pr-1">
                {technicians.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                    <p className="text-xs font-medium">Belum ada data teknisi.</p>
                    <button 
                      onClick={() => onNavigateTab('technicians')}
                      className="text-[11px] font-semibold text-blue-600 hover:underline mt-1 inline-block"
                    >
                      + Daftarkan Teknisi
                    </button>
                  </div>
                ) : (
                  technicians.slice(0, 4).map(tech => {
                    const isAvailable = tech.currentStatus === 'Tersedia' || tech.currentStatus === 'Siaga';
                    const isBusy = tech.currentStatus === 'Bertugas';
                    const badgeClass = isAvailable 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : isBusy 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200';

                    return (
                      <div 
                        key={tech.id} 
                        className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-200">
                            {tech.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">{tech.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{tech.specialty || 'Teknisi Umum'}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badgeClass}`}>
                          {tech.currentStatus}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-right">
              <button
                onClick={() => onNavigateTab('technicians')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Lihat beban kerja seluruh staf →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Table: SPK Prioritas & Pekerjaan yang Membutuhkan Perhatian */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>SPK Prioritas Hari Ini</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('work-orders')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Buka Menu SPK Lengkap ({workOrders.length})</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Priority List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. SPK &amp; Jadwal</th>
                <th className="py-3 px-4">Unit Servis &amp; Masalah</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Teknisi Bertugas</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4">Status</th>
                {canViewFinancial && (
                  <th className="py-3 px-4 text-right">Estimasi Biaya</th>
                )}
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {priorityOrders.length === 0 ? (
                <tr>
                  <td colSpan={canViewFinancial ? 8 : 7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Semua SPK Berjalan Telah Selesai!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tidak ada antrean darurat atau tiket yang tertahan saat ini.</p>
                  </td>
                </tr>
              ) : (
                priorityOrders.map(order => {
                  const badgeColor = 
                    order.status === 'Selesai' || order.status === 'Selesai & Siap Diambil' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    order.status === 'Sedang Dikerjakan' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    order.status === 'Menunggu Sparepart' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    order.status === 'Dibatalkan' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-slate-100 text-slate-700 border-slate-200';

                  const priorityBadge = 
                    order.priority === 'Darurat' ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' :
                    order.priority === 'Tinggi' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    order.priority === 'Sedang' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-100 text-slate-600 border-slate-200';

                  return (
                    <tr key={order.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-blue-700">
                          {order.id}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          <span>{order.scheduledDate || 'Hari ini'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          {order.serviceObjectName || order.title}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {order.serviceDescription || order.title}
                        </p>
                      </td>

                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="font-semibold text-slate-800 truncate">
                          {order.customerName}
                        </div>
                        <div className="text-[10.5px] text-slate-500 truncate">
                          {order.customerCompany || order.customerPhone || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {order.technicianName?.charAt(0) || 'T'}
                          </div>
                          <span className="font-medium text-slate-800">{order.technicianName || 'Belum Ditugaskan'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] rounded-md border ${priorityBadge}`}>
                          {order.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10.5px] font-bold rounded-lg border ${badgeColor}`}>
                          {order.status}
                        </span>
                      </td>

                      {canViewFinancial && (
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                          {formatRupiah(order.grandTotal)}
                        </td>
                      )}

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectWorkOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail SPK"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onPrintWorkOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Cetak SPK"
                          >
                            <Printer size={14} />
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
      </div>
    </div>
  );
};
