import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Menu, 
  Search, 
  Sparkles, 
  Plus, 
  ShieldAlert,
  Calendar,
  User,
  LogOut,
  ChevronDown,
  Building2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Car,
  Snowflake,
  Shirt,
  Scissors,
  Layers,
  Wrench,
  Users,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle
} from '@/constants/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useJasa } from '../contexts/JasaContext';
import { hasJasaPermission } from './Sidebar';
import { WorkOrder, JasaContract } from '../types';

interface TopBarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenMobileSidebar: () => void;
  onOpenNewSpk: () => void;
  onOpenAiAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  urgentCount: number;
  onFilterUrgent: () => void;
  activeTabTitle: string;
  activeTab?: string;
  onNavigate?: (tab: string) => void;
  onOpenSettings?: () => void;
  onOpenSubscription?: () => void;
  workOrders?: WorkOrder[];
  contracts?: JasaContract[];
  onSelectWorkOrder?: (order: WorkOrder) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Smartphone,
  Car,
  Snowflake,
  Shirt,
  Scissors,
  Needle: Layers,
  Wrench
};

export const TopBar: React.FC<TopBarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onOpenMobileSidebar,
  onOpenNewSpk,
  onOpenAiAssistant,
  searchQuery,
  setSearchQuery,
  urgentCount,
  onFilterUrgent,
  activeTabTitle,
  activeTab,
  onNavigate,
  onOpenSettings,
  onOpenSubscription,
  workOrders = [],
  contracts = [],
  onSelectWorkOrder
}) => {
  const { user, logout, isImpersonating, exitImpersonate } = useAuth();
  const { terms, openPicker } = useJasa();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const canManageStaff = hasJasaPermission(user, 'staff_manage');
  const CategoryIcon = CATEGORY_ICONS[terms.categoryIcon] || Wrench;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications calculation from live data
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      type: 'urgent' | 'info' | 'warning' | 'success';
      action?: () => void;
    }> = [];

    // 1. Urgent SPKs
    const urgentList = workOrders.filter(w => w.priority === 'Darurat' && w.status !== 'Diserahkan / Lunas' && (w.status as string) !== 'Selesai');
    urgentList.slice(0, 3).forEach(w => {
      list.push({
        id: `notif-urgent-${w.id}`,
        title: `SPK Darurat: ${w.id}`,
        message: `${w.customerName} - ${w.serviceObjectName || w.title}`,
        time: w.scheduledDate || 'Hari ini',
        type: 'urgent',
        action: () => {
          if (onSelectWorkOrder) onSelectWorkOrder(w);
          else if (onNavigate) onNavigate('work-orders');
        }
      });
    });

    // 2. Waiting for Spareparts
    const partWaiting = workOrders.filter(w => w.status === 'Menunggu Sparepart');
    if (partWaiting.length > 0) {
      list.push({
        id: 'notif-part-waiting',
        title: 'Menunggu Pengadaan Sparepart',
        message: `${partWaiting.length} pekerjaan sedang tertahan menunggu komponen suku cadang.`,
        time: 'Operasional',
        type: 'warning',
        action: () => {
          if (onNavigate) onNavigate('work-orders');
        }
      });
    }

    // 3. Ready to Pickup
    const readyPickup = workOrders.filter(w => w.status === 'Selesai & Siap Diambil');
    if (readyPickup.length > 0) {
      list.push({
        id: 'notif-ready-pickup',
        title: 'Unit Servis Siap Diambil',
        message: `${readyPickup.length} unit telah selesai diperbaiki dan siap diserahkan ke pelanggan.`,
        time: 'Hari ini',
        type: 'success',
        action: () => {
          if (onNavigate) onNavigate('work-orders');
        }
      });
    }

    // 4. Upcoming Contract schedules (if any)
    contracts.filter(c => c.status === 'Aktif' && c.nextScheduleDate).slice(0, 2).forEach(c => {
      list.push({
        id: `notif-contract-${c.id}`,
        title: `Jadwal Kontrak Rutin: ${c.clientName}`,
        message: `Kunjungan perawatan berkala: ${c.title}`,
        time: c.nextScheduleDate || 'Mendatang',
        type: 'info',
        action: () => {
          if (onNavigate) onNavigate('contracts');
        }
      });
    });

    return list;
  }, [workOrders, contracts, onSelectWorkOrder, onNavigate]);

  const unreadCount = notifications.length;

  const userName = user?.name || 'Admin Pusat';
  const userRole = user?.role || 'Kepala Divisi';
  const userEmail = user?.email || 'admin@servishub.id';
  const initials = userName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AP';

  const handleLogout = () => {
    setProfileOpen(false);
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate();
      window.location.href = redirectPath || '/tenants';
      return;
    }
    const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'));
    logout();
    window.location.href = isDemo ? '/' : '/login';
  };

  return (
    <header className={`fixed top-0 right-0 left-0 ${collapsed ? 'lg:left-[68px]' : 'lg:left-72'} z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs h-14 sm:h-16 flex items-center transition-all duration-300`}>
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Sidebar Toggle & Current View Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <button
              id="btn-open-sidebar-toggle"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onOpenMobileSidebar();
                } else if (onToggleCollapse) {
                  onToggleCollapse();
                }
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
              title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-[15px] sm:text-base lg:text-[17px] font-bold font-['Plus_Jakarta_Sans'] text-slate-900 tracking-tight truncate whitespace-nowrap">
                {activeTabTitle}
              </h1>
            </div>
          </div>

          {/* Right: Urgent Alert, Notifications & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">

            {/* Urgent Alert Badge Button */}
            {urgentCount > 0 && (
              <button
                id="btn-topbar-urgent-alert"
                onClick={onFilterUrgent}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors animate-pulse cursor-pointer shrink-0"
                title={`${urgentCount} SPK berprioritas darurat`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="hidden sm:inline font-bold">{urgentCount} Darurat</span>
              </button>
            )}

            {/* Notification Bell Button & Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="btn-navtop-notifications"
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer relative flex items-center justify-center ${
                  notifOpen 
                    ? 'bg-blue-50 border-blue-200 text-blue-600' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Notifikasi"
                title="Pusat Notifikasi Operasional"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Bell size={14} className="text-blue-600" />
                        <span>Notifikasi Operasional</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pemberitahuan tiket darurat &amp; pembaruan bengkel.
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-700">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>

                  {/* List of Notifications */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <CheckCircle2 className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700 text-xs">Tidak ada notifikasi baru</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Semua pekerjaan operasional berjalan lancar.</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const iconBg = 
                          n.type === 'urgent' ? 'bg-rose-50 text-rose-600' :
                          n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                          n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-blue-50 text-blue-600';

                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifOpen(false);
                              if (n.action) n.action();
                            }}
                            className="p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer flex items-start gap-3 text-left group"
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                              {n.type === 'urgent' && <AlertTriangle size={15} />}
                              {n.type === 'warning' && <Clock size={15} />}
                              {n.type === 'success' && <CheckCircle2 size={15} />}
                              {n.type === 'info' && <Calendar size={15} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-800 text-xs group-hover:text-blue-600 transition-colors truncate">
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                              </div>
                              <p className="text-[11.5px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        if (onNavigate) onNavigate('work-orders');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Buka Semua Daftar Pekerjaan SPK →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Impersonation Banner Indicator */}
            {isImpersonating && isImpersonating() && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold shrink-0">
                <span className="hidden md:inline text-amber-700">Mode Uji:</span>
                <span className="font-bold truncate max-w-[130px]" title={user?.name || user?.email}>
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const redirectPath = exitImpersonate();
                    window.location.href = redirectPath || '/jasa/staff';
                  }}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer ml-1"
                  title="Kembali ke akun Pemilik / Super Admin"
                >
                  Kembali
                </button>
              </div>
            )}

            {/* Profile Dropdown Widget in Navtop */}
            <div className="relative" ref={profileRef}>
              <button
                id="btn-navtop-profile"
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-left flex items-center justify-center"
                aria-expanded={profileOpen}
                aria-label="Menu profil pengguna"
              >
                {/* Avatar Icon (Visible on all screen sizes) */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 shrink-0 relative">
                  {(user?.tenant_name || user?.business_name || userName || 'JS')
                    .split(' ')
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'JS'}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {/* User Header */}
                  <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                    <div className="w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-sm shadow-md shadow-blue-500/25 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm truncate">{userName}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{userEmail}</div>
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="py-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Toko / Bengkel:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[150px] text-right">
                        {user?.tenant_name || user?.business_name || 'ServisHub Jasa'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Status Paket:</span>
                      <span className="font-bold text-blue-600 capitalize">
                        {user?.subscription_plan || 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Kategori Bisnis:</span>
                      <span className="font-bold text-blue-600">
                        {user?.business_category || 'Jasa & Servis'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        if (onOpenSubscription) onOpenSubscription();
                        else if (onOpenSettings) onOpenSettings();
                        else window.location.href = '/subscriptions';
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Upgrade & Paket Langganan</span>
                    </button>


                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        if (onNavigate) onNavigate('profile');
                        else if (onOpenSettings) onOpenSettings();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Pengaturan Profil Akun</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        if (onOpenSettings) onOpenSettings();
                        else if (onNavigate) onNavigate('settings');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-slate-600" />
                      <span>Pengaturan Usaha &amp; Jasa</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>
                        {isImpersonating && isImpersonating()
                          ? 'Keluar dari Impersonate'
                          : (user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com')))
                          ? 'Keluar dari Akun Demo'
                          : 'Keluar'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
