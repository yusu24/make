import React, { useState, useRef, useEffect } from 'react';
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
  Wrench
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useJasa } from '../contexts/JasaContext';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenNewSpk: () => void;
  onOpenAiAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  urgentCount: number;
  onFilterUrgent: () => void;
  activeTabTitle: string;
  onOpenSettings?: () => void;
  onOpenSubscription?: () => void;
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
  onOpenMobileSidebar,
  onOpenNewSpk,
  onOpenAiAssistant,
  searchQuery,
  setSearchQuery,
  urgentCount,
  onFilterUrgent,
  activeTabTitle,
  onOpenSettings,
  onOpenSubscription
}) => {
  const { user, logout, isImpersonating, exitImpersonate } = useAuth();
  const { terms, openPicker } = useJasa();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const CategoryIcon = CATEGORY_ICONS[terms.categoryIcon] || Wrench;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs h-14 sm:h-16 flex items-center">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Sidebar Trigger & Current View Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <button
              id="btn-open-sidebar-mobile"
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 min-w-0">
                <h1 className="text-[15px] sm:text-base lg:text-[17px] font-bold text-slate-900 tracking-tight truncate whitespace-nowrap">
                  {activeTabTitle}
                </h1>

                <span className="hidden xl:inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{currentDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Urgent Alert & Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
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
                        if (onOpenSettings) onOpenSettings();
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Pengaturan Akun</span>
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
