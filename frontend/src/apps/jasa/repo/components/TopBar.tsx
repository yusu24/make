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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenNewSpk: () => void;
  onOpenAiAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  urgentCount: number;
  onFilterUrgent: () => void;
  activeTabTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileSidebar,
  onOpenNewSpk,
  onOpenAiAssistant,
  searchQuery,
  setSearchQuery,
  urgentCount,
  onFilterUrgent,
  activeTabTitle
}) => {
  const { user, logout, isImpersonating, exitImpersonate } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Mobile Sidebar Trigger & Current View Title */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-open-sidebar-mobile"
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                  {activeTabTitle}
                </h1>
                <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{currentDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="topbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor SPK, nama pelanggan, peralatan, teknisi..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: Urgent Alert & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Urgent Alert Badge Button */}
            {urgentCount > 0 && (
              <button
                id="btn-topbar-urgent-alert"
                onClick={onFilterUrgent}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors animate-pulse"
                title={`${urgentCount} SPK berprioritas darurat`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">{urgentCount} Darurat</span>
              </button>
            )}

            {/* Profile Dropdown Widget in Navtop */}
            <div className="relative pl-1" ref={profileRef}>
              <button
                id="btn-navtop-profile"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-expanded={profileOpen}
                aria-label="Menu profil pengguna"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-semibold text-xs shadow-2xs shrink-0">
                  {initials}
                </div>
                <div className="hidden xl:block text-left leading-tight pr-1">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{userName}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Online
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-semibold text-sm shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 truncate">{userName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{userEmail}</div>
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 mt-1">
                          {userRole}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-1.5 border-b border-slate-100">
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Info Tenant & Sistem
                    </div>
                    <div className="px-2.5 py-1 text-xs text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Tenant:
                      </span>
                      <span className="font-semibold text-slate-800 font-mono text-[11px]">
                        {user?.tenant_id || 'JASA-DEMO'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isImpersonating && isImpersonating() ? 'Keluar Mode Impersonasi' : 'Keluar / Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Search Bar Row (When on mobile) */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SPK, klien, alat, atau teknisi..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200 w-4 h-4 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
