import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  ClipboardList, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  X,
  Activity,
  Wrench,
  FileText,
  Receipt,
  Package,
  Database,
  CreditCard,
  Wallet,
  Zap
} from 'lucide-react';
import { useJasa } from '../contexts/JasaContext';

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
  const { terms } = useJasa();

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      id: 'pos', 
      label: 'Kasir (POS)', 
      icon: CreditCard,
      badge: 'POS',
      badgeType: 'pos'
    },
    { 
      id: 'work-orders', 
      label: terms.workOrdersLabel || 'Daftar SPK / Order', 
      icon: ClipboardList, 
      badge: urgentCount > 0 ? `${urgentCount} Darurat` : (totalOrders > 0 ? `${totalOrders}` : undefined),
      badgeType: urgentCount > 0 ? 'urgent' : 'neutral'
    },
    { 
      id: 'contracts', 
      label: 'Jadwal & Kontrak Servis', 
      icon: FileText 
    },
    { 
      id: 'technicians', 
      label: terms.techniciansLabel || 'Kelola Tim / Teknisi', 
      icon: Users,
      badge: availableTechsCount > 0 ? `${availableTechsCount} Siaga` : undefined,
      badgeType: 'success'
    },
    { 
      id: 'catalog', 
      label: 'Katalog Layanan', 
      icon: BookOpen 
    },
    { 
      id: 'inventory', 
      label: terms.sparepartsLabel || 'Gudang & Material', 
      icon: Package 
    },
    { 
      id: 'finance', 
      label: 'Keuangan & Kas', 
      icon: Wallet 
    },
    { 
      id: 'analytics', 
      label: 'Laporan & SLA', 
      icon: ShieldCheck 
    },
    { 
      id: 'guide', 
      label: 'Buku Panduan & SOP', 
      icon: BookOpen,
      badge: 'Panduan',
      badgeType: 'neutral'
    },
    { 
      id: 'backup', 
      label: 'Backup & Restore Data', 
      icon: Database 
    },
    { 
      id: 'subscription', 
      label: 'Paket Langganan', 
      icon: CreditCard,
      badge: 'Upgrade',
      badgeType: 'urgent'
    },
    { 
      id: 'developer-api', 
      label: 'Integrasi API & Webhook', 
      icon: Zap 
    },
    { 
      id: 'settings', 
      label: 'Pengaturan Jasa', 
      icon: Wrench 
    }
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
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <div 
            id="sidebar-brand"
            className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
            onClick={() => {
              setActiveTab('overview');
              onCloseMobile();
            }}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white/20 stroke-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Bizora
              </span>
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

        {/* AI Quick Diagnostic Trigger */}
        <div className="px-4 pt-3 pb-1">
          <button
            id="btn-sidebar-ai-diagnostic"
            onClick={() => {
              onOpenAiAssistant();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 font-bold text-xs transition-colors shadow-2xs group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>AI Diagnosa & Estimasi</span>
          </button>
        </div>

        {/* Navigation Links (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-none">
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
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-left transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-[13.5px] truncate ${isActive ? 'font-bold text-blue-900' : 'font-medium text-slate-700'}`}>
                    {item.label}
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold flex-shrink-0 ml-2 ${
                    item.badgeType === 'urgent'
                      ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200'
                      : item.badgeType === 'success'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : item.badgeType === 'pos'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Operational Status Bento Widget inside Sidebar */}
          <div className="pt-3 pb-2 px-0.5">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
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
