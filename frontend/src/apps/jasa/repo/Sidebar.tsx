import React from 'react';
import { 
  BarChart3, 
  ClipboardList, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  X,
  ChevronRight,
  Activity,
  Layers,
  Wrench
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSpk: () => void;
  onOpenAiAssistant: () => void;
  urgentCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalOrders: number;
  availableTechsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSpk,
  onOpenAiAssistant,
  urgentCount,
  isOpenMobile,
  onCloseMobile,
  totalOrders,
  availableTechsCount
}) => {
  const navItems = [
    { 
      id: 'overview', 
      label: 'Beranda Utama', 
      desc: 'Ringkasan & Metrik',
      icon: BarChart3 
    },
    { 
      id: 'work-orders', 
      label: 'Daftar SPK', 
      desc: 'Tiket & Perintah Kerja',
      icon: ClipboardList, 
      badge: urgentCount > 0 ? `${urgentCount} Darurat` : `${totalOrders}`,
      badgeType: urgentCount > 0 ? 'urgent' : 'neutral'
    },
    { 
      id: 'technicians', 
      label: 'Kelola Teknisi', 
      desc: 'Alokasi & Kesiapan',
      icon: Users,
      badge: `${availableTechsCount} Siaga`,
      badgeType: 'success'
    },
    { 
      id: 'catalog', 
      label: 'Katalog Layanan', 
      desc: 'Paket & Tarif Biaya',
      icon: BookOpen 
    },
    { 
      id: 'analytics', 
      label: 'Laporan & SLA', 
      desc: 'Performa & Keuangan',
      icon: ShieldCheck 
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div 
              id="sidebar-brand"
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => {
                setActiveTab('overview');
                onCloseMobile();
              }}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                S
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-semibold tracking-tight text-slate-900">ServisHub</span>
                  <span className="text-[9px] uppercase tracking-widest font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-md">
                    Modul Jasa
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Sistem Manajemen Servis</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              id="btn-close-sidebar-mobile"
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button in Sidebar */}
          <div className="mt-5 space-y-2">
            <button
              id="btn-sidebar-create-spk"
              onClick={() => {
                onOpenNewSpk();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat SPK Baru</span>
            </button>

            <button
              id="btn-sidebar-ai-diagnostic"
              onClick={() => {
                onOpenAiAssistant();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 font-semibold text-xs transition-colors shadow-2xs group"
            >
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>AI Diagnosa & Estimasi</span>
            </button>
          </div>
        </div>

        {/* Navigation Links (Middle Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-none">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Menu Navigasi
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/90 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80 group-hover:text-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className={`text-xs ${isActive ? 'font-semibold text-blue-900' : 'font-semibold text-slate-800'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex-shrink-0 ml-2 ${
                    item.badgeType === 'urgent'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                      : item.badgeType === 'success'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Operational Status Bento Widget inside Sidebar */}
          <div className="pt-4 px-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" /> Sistem Lapangan
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Dispatch otomatis aktif. Kesiapan armada teknisi 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-semibold text-xs shadow-2xs">
                AP
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-slate-900">Admin Pusat</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Online • Kepala Divisi
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
