import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse as WarehouseIcon,
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  FileSpreadsheet,
  Database,
  Layers,
  Sparkles,
  Zap,
  Store,
  Settings,
  User,
  Users,
  Shield,
  Truck,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Globe,
  Link,
  RefreshCw,
  History,
  Box,
  Bell,
  QrCode,
  CreditCard,
  Archive,
  BookOpen,
  Code2
} from '@/constants/icons';
import { ActiveTab, StoreChannel } from '../types';
import { useTranslation } from '../../../../contexts/I18nContext';
import { useAuth } from '../../../../contexts/AuthContext';
import bizoraLogo from '../../../../assets/bizora-logo.png';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  openAiAdvisor: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (val: boolean) => void;
  stores?: StoreChannel[];
}

interface FlyoutItem {
  id: ActiveTab;
  label: string;
  icon?: React.ReactNode;
}

interface FlyoutGroup {
  id: string;
  label: string;
  items: FlyoutItem[];
}

const CollapsedGroupFlyout: React.FC<{
  group: FlyoutGroup;
  anchorY: number;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelect: (tab: ActiveTab) => void;
}> = ({ group, anchorY, onClose, activeTab, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  if (!group) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: 72,
        top: Math.max(8, Math.min(anchorY, window.innerHeight - 320)),
        zIndex: 1100,
        minWidth: 210,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: 6,
      }}
    >
      <div style={{ padding: '6px 12px 8px', fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
        {group.label}
      </div>
      {group.items.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelect(item.id);
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#4f46e5' : '#334155',
              background: isActive ? '#eef2ff' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
          >
            {item.icon && <span style={{ display: 'flex', color: isActive ? '#4f46e5' : '#64748b' }}>{item.icon}</span>}
            <span style={{ flex: 1 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  onToggleCollapse,
  openAiAdvisor,
  mobileMenuOpen = false,
  setMobileMenuOpen,
  stores = [],
}) => {
  const { user } = useAuth();
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [flyoutAnchorY, setFlyoutAnchorY] = useState(60);

  const isKeuanganActive = activeTab.startsWith('keuangan-');
  const [keuanganOpen, setKeuanganOpen] = useState(isKeuanganActive);

  const isSettingsActive = activeTab.startsWith('settings-');
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  const isGudangActive = ['gudang', 'penerimaan-barang', 'stock-opname'].includes(activeTab);
  const [gudangOpen, setGudangOpen] = useState(isGudangActive);

  const isMasterActive = ['master-data', 'pelanggan'].includes(activeTab);
  const [masterOpen, setMasterOpen] = useState(isMasterActive);

  const isMarketplaceActive = activeTab.startsWith('marketplace-');
  const [marketplaceOpen, setMarketplaceOpen] = useState(isMarketplaceActive);

  const isShippingActive = activeTab.startsWith('shipping-');
  const [shippingOpen, setShippingOpen] = useState(isShippingActive);

  // Auto-close accordions if navigating to a different section
  useEffect(() => {
    setKeuanganOpen(activeTab.startsWith('keuangan-'));
    setSettingsOpen(activeTab.startsWith('settings-'));
    setGudangOpen(['gudang', 'penerimaan-barang', 'stock-opname'].includes(activeTab));
    setMasterOpen(['master-data', 'pelanggan'].includes(activeTab));
    setMarketplaceOpen(activeTab.startsWith('marketplace-'));
    setShippingOpen(activeTab.startsWith('shipping-'));
    setOpenSection(null);
  }, [activeTab]);

  const handleGroupIconClick = (sectionId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutAnchorY(rect.top);
    setOpenSection(prev => prev === sectionId ? null : sectionId);
  };

  const flyoutGroups: Record<string, FlyoutGroup> = {
    marketplace: {
      id: 'marketplace',
      label: t('seller.marketplace'),
      items: [
        { id: 'marketplace-dashboard', label: t('seller.dashboardMarketplace'), icon: <Globe className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'marketplace-connected', label: t('seller.tokoTerhubung'), icon: <Link className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'marketplace-mapping', label: t('seller.mappingProduk'), icon: <Layers className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'marketplace-sync', label: t('seller.sinkronisasi'), icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'marketplace-history', label: t('seller.riwayatSync'), icon: <History className="w-3.5 h-3.5 text-purple-500" /> },
      ]
    },
    shipping: {
      id: 'shipping',
      label: t('seller.pengiriman'),
      items: [
        { id: 'shipping-dashboard', label: t('seller.dashboardPengiriman', 'Dashboard Pengiriman'), icon: <Truck className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'shipping-management', label: t('seller.kurirEkspedisi'), icon: <Package className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'shipping-packing', label: t('seller.packingResi'), icon: <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" /> },
      ]
    },
    gudang: {
      id: 'gudang',
      label: t('seller.inventoriGudang'),
      items: [
        { id: 'gudang', label: t('seller.stokGudang'), icon: <Box className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'penerimaan-barang', label: t('seller.penerimaanBarang'), icon: <Package className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'stock-opname', label: t('seller.stockOpname'), icon: <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" /> },
      ]
    },
    keuangan: {
      id: 'keuangan',
      label: t('seller.keuanganLaporan'),
      items: [
        { id: 'keuangan-pengeluaran', label: t('seller.pengeluaran'), icon: <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> },
        { id: 'keuangan-pemasukan', label: t('seller.pemasukanLain'), icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'keuangan-kas', label: t('seller.bukuKas'), icon: <Coins className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'keuangan-laporan', label: t('seller.labaRugi'), icon: <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> },
      ]
    },
    master: {
      id: 'master',
      label: t('seller.masterData'),
      items: [
        { id: 'master-data', label: t('seller.masterKategori'), icon: <Database className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'pelanggan', label: t('seller.dataPelanggan'), icon: <Users className="w-3.5 h-3.5 text-emerald-500" /> },
      ]
    },
    settings: {
      id: 'settings',
      label: t('seller.pengaturanSistem'),
      items: [
        { id: 'settings-app', label: t('seller.pengaturanAplikasi'), icon: <Store className="w-3.5 h-3.5 text-orange-500" /> },
        { id: 'settings-account', label: t('seller.akunSaya'), icon: <User className="w-3.5 h-3.5 text-sky-500" /> },
        { id: 'settings-roles', label: t('seller.hakAksesPeran'), icon: <Shield className="w-3.5 h-3.5 text-violet-500" /> },
        { id: 'settings-users', label: t('seller.manajemenUser'), icon: <Users className="w-3.5 h-3.5 text-teal-500" /> },
        { id: 'backup', label: 'Backup Data Toko', icon: <Archive className="w-3.5 h-3.5 text-amber-500" /> },
      ]
    }
  };

  return (
    <>
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-[#101828] transition-all duration-300 flex flex-col 
      ${collapsed ? 'md:w-[68px]' : 'md:w-64'} 
      w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 relative flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
            <img 
              src={user?.store_icon_url || bizoraLogo} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        {/* Mobile close button */}
        <button 
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setMobileMenuOpen?.(false)}
        >
           <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('menu-utama')}
          title={collapsed ? t('seller.dashboard') : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'menu-utama'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'menu-utama' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">{t('seller.dashboard')}</span>}
        </button>

        {/* Kasir POS (Offline / Toko Fisik) */}
        <button
          onClick={() => setActiveTab('toko-offline')}
          title={collapsed ? 'Kasir (POS)' : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'toko-offline'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <CreditCard className={`w-5 h-5 shrink-0 ${activeTab === 'toko-offline' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Kasir (POS)</span>}
          {!collapsed && (
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              POS
            </span>
          )}
        </button>

        {/* Pesanan & E-Commerce */}
        <button
          onClick={() => setActiveTab('pesanan')}
          title={collapsed ? t('seller.allOrders') : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'pesanan'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 shrink-0 ${activeTab === 'pesanan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">{t('seller.allOrders')}</span>}
        </button>

        {/* Katalog Produk */}
        <button
          onClick={() => setActiveTab('katalog')}
          title={collapsed ? t('seller.katalog') : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'katalog'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Package className={`w-5 h-5 shrink-0 ${activeTab === 'katalog' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">{t('seller.katalog')}</span>}
        </button>

        {/* Marketplace & Sync Section */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('marketplace', e);
              } else {
                setMarketplaceOpen(!marketplaceOpen);
              }
            }}
            title={collapsed ? t('seller.marketplace') : ''}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
              isMarketplaceActive || openSection === 'marketplace'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Globe className={`w-5 h-5 shrink-0 ${isMarketplaceActive || openSection === 'marketplace' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">{t('seller.marketplace')}</span>}
            {!collapsed && (
              marketplaceOpen ? (
                <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && marketplaceOpen) && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/40 my-1 space-y-1">
              <button
                onClick={() => setActiveTab('marketplace-dashboard')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'marketplace-dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{t('seller.dashboardMarketplace')}</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-connected')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'marketplace-connected'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('seller.tokoTerhubung')}</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-mapping')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'marketplace-mapping'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{t('seller.mappingProduk')}</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-sync')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'marketplace-sync'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('seller.sinkronisasi')}</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-history')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'marketplace-history'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <History className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>{t('seller.riwayatSync')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Gudang & Stok Section (Accordion) */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('gudang', e);
              } else {
                setGudangOpen(!gudangOpen);
              }
            }}
            title={collapsed ? t('seller.inventoriGudang') : ''}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
              isGudangActive || openSection === 'gudang'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <WarehouseIcon className={`w-5 h-5 shrink-0 ${isGudangActive || openSection === 'gudang' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">{t('seller.inventoriGudang')}</span>}
            {!collapsed && (
              gudangOpen ? (
                <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
          </button>

          {/* Gudang & Stok Sub-menu */}
          {(!collapsed && gudangOpen) && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/40 my-1 space-y-1">
              <button
                onClick={() => setActiveTab('gudang')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'gudang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{t('seller.stokGudang')}</span>
              </button>

              <button
                onClick={() => setActiveTab('penerimaan-barang')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'penerimaan-barang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('seller.penerimaanBarang')}</span>
              </button>

              <button
                onClick={() => setActiveTab('stock-opname')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'stock-opname'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('seller.stockOpname')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Shipping & Fulfillment */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('shipping', e);
              } else {
                setShippingOpen(!shippingOpen);
              }
            }}
            title={collapsed ? t('seller.pengiriman') : ''}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
              isShippingActive || openSection === 'shipping'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Truck className={`w-5 h-5 shrink-0 ${isShippingActive || openSection === 'shipping' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">{t('seller.pengiriman')}</span>}
            {!collapsed && (
              shippingOpen ? (
                <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && shippingOpen) && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/40 my-1 space-y-1">
              <button
                onClick={() => setActiveTab('shipping-dashboard')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'shipping-dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{t('seller.dashboardPengiriman', 'Dashboard Pengiriman')}</span>
              </button>
              <button
                onClick={() => setActiveTab('shipping-management')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'shipping-management'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('seller.kurirEkspedisi')}</span>
              </button>
              <button
                onClick={() => setActiveTab('shipping-packing')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'shipping-packing'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('seller.packingResi')}</span>
              </button>
            </div>
          )}
        </div>


        {/* Keuangan Section (Accordion) */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('keuangan', e);
              } else {
                setKeuanganOpen(!keuanganOpen);
              }
            }}
            title={collapsed ? t('seller.keuanganLaporan') : ''}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
              isKeuanganActive || openSection === 'keuangan'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Wallet className={`w-5 h-5 shrink-0 ${isKeuanganActive || openSection === 'keuangan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">{t('seller.keuanganLaporan')}</span>}
            {!collapsed && (
              keuanganOpen ? (
                <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
          </button>

          {/* Keuangan Sub-menu */}
          {(!collapsed && keuanganOpen) && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/40 my-1 space-y-1">
              <button
                onClick={() => setActiveTab('keuangan-pengeluaran')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'keuangan-pengeluaran'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{t('seller.pengeluaran')}</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan-pemasukan')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'keuangan-pemasukan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('seller.pemasukanLain')}</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan-kas')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'keuangan-kas'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('seller.bukuKas')}</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan-laporan')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'keuangan-laporan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{t('seller.labaRugi')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Master Section (Accordion) */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('master', e);
              } else {
                setMasterOpen(!masterOpen);
              }
            }}
            title={collapsed ? t('seller.dataMaster') : ''}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
              isMasterActive || openSection === 'master'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Database className={`w-5 h-5 shrink-0 ${isMasterActive || openSection === 'master' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">{t('seller.dataMaster')}</span>}
            {!collapsed && (
              masterOpen ? (
                <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
          </button>

          {/* Data Master Sub-menu */}
          {(!collapsed && masterOpen) && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/40 my-1 space-y-1">
              <button
                onClick={() => setActiveTab('master-data')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'master-data'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{t('seller.masterKategori')}</span>
              </button>

              <button
                onClick={() => setActiveTab('pelanggan')}
                className={`w-full flex items-start gap-2 px-3 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150 text-left ${
                  activeTab === 'pelanggan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{t('seller.dataPelanggan')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Center */}
        <button
          onClick={() => setActiveTab('notification-center')}
          title={collapsed ? t('seller.pusatNotifikasi') : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'notification-center'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Bell className={`w-5 h-5 shrink-0 ${activeTab === 'notification-center' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">{t('seller.pusatNotifikasi')}</span>}
        </button>

        {/* Buku Panduan & SOP */}
        <button
          onClick={() => setActiveTab('panduan')}
          title={collapsed ? 'Buku Panduan & SOP' : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'panduan'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className={`w-5 h-5 shrink-0 ${activeTab === 'panduan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Buku Panduan & SOP</span>}
        </button>

        {/* Integrasi API & Webhook */}
        <button
          onClick={() => setActiveTab('developer-api')}
          title={collapsed ? 'Integrasi API & Webhook' : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'developer-api'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Code2 className={`w-5 h-5 shrink-0 ${activeTab === 'developer-api' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Integrasi API & Webhook</span>}
        </button>

        {/* Paket & Langganan */}
        <button
          onClick={() => setActiveTab('langganan')}
          title={collapsed ? 'Paket & Langganan' : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'langganan'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <CreditCard className={`w-5 h-5 shrink-0 ${activeTab === 'langganan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Paket & Langganan</span>}
        </button>

        {/* Pengaturan Sistem */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('settings', e);
              } else {
                setSettingsOpen(!settingsOpen);
              }
            }}
            title={collapsed ? t('seller.pengaturanSistem') : ''}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
              isSettingsActive || openSection === 'settings'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Settings className={`w-5 h-5 shrink-0 ${isSettingsActive || openSection === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">{t('seller.pengaturanSistem')}</span>}
            {!collapsed && (
              settingsOpen ? (
                <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )
            )}
          </button>

          {/* Settings Sub-menu */}
          {(!collapsed && settingsOpen) && (
            <div className="ml-4 pl-3 border-l-2 border-indigo-100 dark:border-indigo-900/40 my-1 space-y-1">
              <button
                onClick={() => setActiveTab('settings-app')}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-all duration-200 text-left ${
                  activeTab === 'settings-app'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span>{t('seller.pengaturanAplikasi')}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings-account')}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-all duration-200 text-left ${
                  activeTab === 'settings-account'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <User className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                <span>{t('seller.akunSaya')}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings-roles')}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-all duration-200 text-left ${
                  activeTab === 'settings-roles'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                <span>{t('seller.hakAksesPeran')}</span>
              </button>
              <button
                onClick={() => setActiveTab('settings-users')}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-all duration-200 text-left ${
                  activeTab === 'settings-users'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                <span>{t('seller.manajemenUser')}</span>
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-all duration-200 text-left ${
                  activeTab === 'backup'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Backup Data Toko</span>
              </button>
            </div>
          )}
        </div>

        {/* Backup Data Toko (Direct Menu Item) */}
        <button
          onClick={() => setActiveTab('backup')}
          title={collapsed ? 'Backup Data Toko' : ''}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full font-medium text-[13.5px] transition-all duration-200 group ${
            activeTab === 'backup'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Archive className={`w-5 h-5 shrink-0 ${activeTab === 'backup' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Backup Data Toko</span>}
        </button>
      </div>
    </aside>

    {/* ── Collapsed-rail flyout ── */}
    {collapsed && openSection && flyoutGroups[openSection] && (
      <CollapsedGroupFlyout
        group={flyoutGroups[openSection]}
        anchorY={flyoutAnchorY}
        onClose={() => setOpenSection(null)}
        activeTab={activeTab}
        onSelect={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen?.(false);
        }}
      />
    )}
    </>
  );
};
