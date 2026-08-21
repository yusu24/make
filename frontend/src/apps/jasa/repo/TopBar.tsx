import React from 'react';
import { 
  Menu, 
  Search, 
  Sparkles, 
  Plus, 
  Bell, 
  ShieldAlert,
  Calendar
} from 'lucide-react';

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
  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
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

          {/* Right: Quick Actions & Urgent Alert */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Urgent Alert Badge Button */}
            {urgentCount > 0 && (
              <button
                id="btn-topbar-urgent-alert"
                onClick={onFilterUrgent}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors animate-pulse"
                title={`${urgentCount} SPK berprioritas darurat`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">{urgentCount} Darurat</span>
              </button>
            )}

            {/* AI Assistant Button */}
            <button
              id="btn-topbar-ai-modal"
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100/80 transition-colors text-xs font-semibold shadow-2xs group"
              title="Gunakan AI Diagnosa & Estimator Biaya"
            >
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">AI Diagnosa</span>
            </button>

            {/* Buat SPK Baru Button */}
            <button
              id="btn-topbar-new-spk"
              onClick={onOpenNewSpk}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Buat SPK</span>
            </button>
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
