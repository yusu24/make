import React from 'react';
import { 
  Wrench, 
  ClipboardList, 
  Users, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  Plus, 
  Search,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSpk: () => void;
  onOpenAiAssistant: () => void;
  urgentCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSpk,
  onOpenAiAssistant,
  urgentCount,
  searchQuery,
  setSearchQuery
}) => {
  const tabs = [
    { id: 'overview', label: 'Beranda Utama', icon: BarChart3 },
    { id: 'work-orders', label: 'Daftar SPK', icon: ClipboardList, badge: urgentCount > 0 ? urgentCount : undefined },
    { id: 'technicians', label: 'Kelola Teknisi', icon: Users },
    { id: 'catalog', label: 'Katalog Layanan', icon: BookOpen },
    { id: 'analytics', label: 'Laporan Performa', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand (Bento Style) */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-xl shadow-sm shadow-blue-500/25">
              S
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold tracking-tight text-slate-900">ServisHub</span>
                <span className="text-[10px] uppercase tracking-widest font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-lg">
                  Modul Jasa
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Sistem Operasional Unit Servis & Lapangan</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor SPK, nama pelanggan, peralatan, teknisi..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 bg-slate-200/70 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* User Profile Pill & Actions */}
          <div className="flex items-center space-x-3">
            {/* User Profile Pill (as in Bento Design) */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">
                AP
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-800">Admin Pusat</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Online
                </p>
              </div>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100/80 transition-colors text-xs font-semibold shadow-2xs group"
              title="Gunakan AI Diagnosa & Estimator Biaya"
            >
              <Sparkles className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">AI Diagnosa</span>
            </button>

            {/* Buat SPK Baru Button */}
            <button
              onClick={onOpenNewSpk}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat SPK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Bento Sub-Navigation) */}
      <div className="bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500 text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
