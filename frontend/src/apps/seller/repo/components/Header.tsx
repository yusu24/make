import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Printer,
  Calendar,
  Store,
  CheckCircle2,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Sparkles,
  LogOut,
  Globe,
} from 'lucide-react';
import { StoreChannel, ActiveTab, Product } from '../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTranslation } from '../../../../contexts/I18nContext';

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
  stores: StoreChannel[];
  products: Product[];
  onOpenPdfExport: () => void;
  activeTab: ActiveTab;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (val: boolean) => void;
}

const DEMO_EMAILS = ['seller@demo.com'];

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  onToggleCollapse,
  selectedStoreId,
  setSelectedStoreId,
  stores,
  products,
  onOpenPdfExport,
  activeTab,
  darkMode,
  setDarkMode,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const { user, logout, isImpersonating, exitImpersonate } = useAuth();
  const i18n = useTranslation();
  const language = i18n?.language || 'id';
  const toggleLanguage = i18n?.toggleLanguage || (() => {});
  const t = i18n?.t || ((key: string) => key);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);
  const lowStockProducts = products.filter((p) => p.status === 'Stok Menipis' || p.status === 'Habis');
  const initials = (user?.name || 'S')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setProfileMenuOpen(false);
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate();
      window.location.href = redirectPath || '/tenants';
      return;
    }
    const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || DEMO_EMAILS.includes(user?.email) || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'));
    logout();
    window.location.href = isDemo ? '/' : '/login';
  };

  return (
    <header className={`h-16 bg-white dark:bg-[#101828] border-b border-gray-200 dark:border-slate-800 fixed top-0 right-0 left-0 ${collapsed ? 'md:left-20' : 'md:left-64'} z-30 transition-all duration-300 px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-xs shrink-0`}>
      {/* Left section: Toggle & Date */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileMenuOpen?.(!mobileMenuOpen);
            } else {
              onToggleCollapse();
            }
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Today's date — informational only. This used to be a "period filter"
            dropdown with hardcoded options that didn't actually filter
            anything anywhere in the app; showing it as an interactive filter
            was misleading, so it's now just an honest date display. */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#344054] dark:text-slate-300 bg-[#F2F4F7] dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Right section: Store Selector, Export PDF button, Notifications & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">


        {/* Language Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs"
          title={language === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="uppercase tracking-wider">{language === 'id' ? 'ID 🇮🇩' : 'EN 🇬🇧'}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative shrink-0" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Notifikasi Masuk"
          >
            <Bell className="w-4 h-4" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute -right-12 sm:right-0 mt-2 w-[300px] sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Notifikasi Stok
                </span>
                {lowStockProducts.length > 0 && (
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
                    {lowStockProducts.length} Produk
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                {lowStockProducts.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">
                    Semua stok produk aman, tidak ada notifikasi.
                  </div>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/seller/products');
                      }}
                      className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                        p.status === 'Habis'
                          ? 'bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/80 border-rose-100 dark:border-rose-900/50'
                          : 'bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/80 border-amber-100 dark:border-amber-900/50'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.status === 'Habis' ? '⛔' : '⚠️'} {p.status === 'Habis' ? 'Stok Habis' : 'Stok Menipis'}: {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sisa {p.totalStock} unit (SKU: {p.sku}).
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge & Menu Dropdown */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            title="Profil Pengguna"
          >
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors leading-tight max-w-[120px] truncate">
                {user?.name || 'Pengguna'}
              </span>
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-200/60 dark:border-indigo-800 capitalize">
                  {user?.subscription_plan || 'Free'}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform shrink-0">
              {initials}
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Pengguna'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email || '-'}</div>
                </div>
              </div>

              <div className="py-2 space-y-1">
                <div className="flex justify-between items-center py-1 text-slate-600 dark:text-slate-300">
                  <span>Toko:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{user?.tenant_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-slate-600 dark:text-slate-300">
                  <span>Status Paket:</span>
                  <span className="font-semibold text-indigo-600 capitalize">{user?.subscription_plan || 'Free'}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-slate-600 dark:text-slate-300">
                  <span>Channel Terhubung:</span>
                  <span className="font-semibold text-emerald-600">{stores.length}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/seller/settings/account');
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Pengaturan Akun
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isImpersonating && isImpersonating() 
                    ? 'Keluar dari Impersonate' 
                    : ((user?.email?.startsWith('demo-sandbox-') || DEMO_EMAILS.includes(user?.email) || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'))) ? 'Keluar dari Akun Demo' : 'Keluar')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
