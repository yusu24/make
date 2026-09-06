import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Calendar,
  Sun,
  Moon,
  LogOut,
  Globe,
  CreditCard,
  ShieldCheck,
  Building2,
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

const TAB_TITLES: Record<string, string> = {
  'menu-utama': 'Dashboard Seller',
  'pesanan': 'Manajemen Pesanan',
  'katalog': 'Katalog Produk',
  'gudang': 'Manajemen Gudang',
  'penerimaan-barang': 'Penerimaan Barang',
  'stock-opname': 'Stock Opname',
  'toko-offline': 'Kasir POS (Offline)',
  'keuangan-pengeluaran': 'Catatan Pengeluaran',
  'keuangan-pemasukan': 'Pemasukan Lainnya',
  'keuangan-kas': 'Buku Kas & Rekening',
  'keuangan-laporan': 'Laporan Keuangan',
  'master-data': 'Master Data',
  'pelanggan': 'Data Pelanggan',
  'marketplace-dashboard': 'Dashboard Marketplace',
  'marketplace-connected': 'Toko Terhubung',
  'marketplace-mapping': 'Mapping Produk',
  'marketplace-sync': 'Sinkronisasi Marketplace',
  'marketplace-history': 'Riwayat Sinkronisasi',
  'shipping-dashboard': 'Dashboard Pengiriman',
  'shipping-management': 'Manajemen Kurir',
  'shipping-packing': 'Packing & Resi',
  'notification-center': 'Pusat Notifikasi',
  'panduan': 'Panduan Penggunaan',
  'langganan': 'Paket Langganan',
  'backup': 'Backup & Restore Data',
  'settings-app': 'Pengaturan Aplikasi',
  'settings-account': 'Pengaturan Akun',
  'settings-roles': 'Role & Hak Akses',
  'settings-users': 'Pengguna & Staf',
};

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
  const initials = (user?.tenant_name || user?.business_name || user?.name || 'SL')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SL';

  const handleLogout = () => {
    setProfileMenuOpen(false);
    if (isImpersonating && isImpersonating()) {
      const redirectPath = exitImpersonate();
      window.location.href = redirectPath || '/tenants';
      return;
    }
    const isDemo = user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-') || user?.email?.startsWith('demo-sandbox-') || DEMO_EMAILS.includes(user?.email || '') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'));
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
    <header className={`h-16 bg-white dark:bg-[#101828] border-b border-gray-200 dark:border-slate-800 fixed top-0 right-0 left-0 ${collapsed ? 'md:left-20' : 'md:left-64'} z-30 transition-all duration-300 px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-xs shrink-0`}>
      {/* Left section: Toggle, Dynamic Page Title & Date Badge */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileMenuOpen?.(!mobileMenuOpen);
            } else {
              onToggleCollapse();
            }
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title={collapsed ? 'Perlebar Sidebar' : 'Perkecil Sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 min-w-0">
            <h1 className="text-[15px] sm:text-base lg:text-[17px] font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate whitespace-nowrap">
              {TAB_TITLES[activeTab] || 'Bizora Seller'}
            </h1>
            <span className="hidden md:inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md shrink-0">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{currentDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Language, Dark Mode, Notifications & Profile */}
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
            className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left flex items-center justify-center"
            title="Profil Pengguna"
            aria-expanded={profileMenuOpen}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 relative">
              {initials}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-700">
                <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{user?.name || 'Pengguna'}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || '-'}</div>
                </div>
              </div>

              <div className="py-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Toko / Bisnis:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] text-right">{user?.tenant_name || user?.business_name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Status Paket:</span>
                  <span className="font-bold text-indigo-600 capitalize">{user?.subscription_plan || 'Free'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Channel Terhubung:</span>
                  <span className="font-bold text-emerald-600">{stores.length} Toko</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/seller/subscription');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Upgrade & Paket Langganan</span>
                </button>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate('/seller/settings/account');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Pengaturan Akun</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>
                    {isImpersonating && isImpersonating() 
                      ? 'Keluar dari Impersonate' 
                      : ((user?.email?.startsWith('demo-sandbox-') || DEMO_EMAILS.includes(user?.email || '') || (user?.email?.includes('demo-') && user?.email?.includes('@umkm-demo.com'))) ? 'Keluar dari Akun Demo' : 'Keluar')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
