import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Activity,
  Layers,
  Wrench,
  FileText,
  Receipt,
  Package
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
  const menuItems = [
    { id: 'overview', label: 'Beranda Utama', icon: BarChart3 },
    { 
      id: 'work-orders', 
      label: 'Daftar SPK', 
      icon: ClipboardList, 
      badge: urgentCount > 0 ? `${urgentCount} Darurat` : (totalOrders > 0 ? `${totalOrders}` : undefined),
      badgeType: urgentCount > 0 ? 'urgent' : 'neutral'
    },
    { id: 'contracts', label: 'Jadwal Reservasi / Kontrak', icon: FileText },
    { 
      id: 'technicians', 
      label: 'Kelola Tim / Pekerja', 
      icon: Users,
      badge: availableTechsCount > 0 ? `${availableTechsCount} Siaga` : undefined,
      badgeType: 'success'
    },
    { id: 'catalog', label: 'Katalog Layanan', icon: BookOpen },
    { id: 'inventory', label: 'Gudang & Material', icon: Package },
    { id: 'finance', label: 'Tagihan Masuk (Piutang)', icon: Receipt },
    { id: 'expenses', label: 'Catatan Pengeluaran', icon: Receipt },
    { id: 'analytics', label: 'Laporan & SLA', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan Jasa', icon: Wrench }
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
                </div>
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
              id="btn-sidebar-ai-diagnostic"
              onClick={() => {
                onOpenAiAssistant();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 font-semibold text-sm transition-colors shadow-2xs group"
            >
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>AI Diagnosa & Estimasi</span>
            </button>
          </div>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-none">
          {menuItems.map((item) => {
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-transparent text-slate-400 group-hover:text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`text-sm truncate ${isActive ? 'font-semibold text-blue-900' : 'font-medium text-slate-600'}`}>
                    {item.label}
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold flex-shrink-0 ml-2 ${
                    item.badgeType === 'urgent'
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : item.badgeType === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
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
      </aside>
    </>
  );
};
