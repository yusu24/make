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
  QrCode
} from 'lucide-react';
import { ActiveTab, StoreChannel } from '../types';

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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  onToggleCollapse,
  openAiAdvisor,
  mobileMenuOpen,
  setMobileMenuOpen,
  stores = [],
}) => {
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
  }, [activeTab]);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-[#101828] border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col 
      ${collapsed ? 'md:w-20' : 'md:w-64'} 
      w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Zap className="w-5 h-5 fill-white/20 stroke-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#101828] dark:text-white">
                BIZORA
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#667085] uppercase">
                Omni-Channel ERP
              </span>
            </div>
          )}
        </div>
        
        {/* Mobile close button */}
        <button 
          className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          onClick={() => setMobileMenuOpen?.(false)}
        >
           <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('menu-utama')}
          title={collapsed ? 'Dashboard' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
            activeTab === 'menu-utama'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeTab === 'menu-utama' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Dashboard</span>}
        </button>

        {/* Pesanan & E-Commerce */}
        <button
          onClick={() => setActiveTab('pesanan')}
          title={collapsed ? 'Pesanan & E-Commerce' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
            activeTab === 'pesanan'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 shrink-0 ${activeTab === 'pesanan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Pesanan & E-Commerce</span>}
        </button>

        {/* Katalog Produk */}
        <button
          onClick={() => setActiveTab('katalog')}
          title={collapsed ? 'Katalog Produk' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
            activeTab === 'katalog'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Package className={`w-5 h-5 shrink-0 ${activeTab === 'katalog' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Katalog Produk</span>}
        </button>

        {/* Marketplace & Sync Section */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setMarketplaceOpen(true);
              } else {
                setMarketplaceOpen(!marketplaceOpen);
              }
            }}
            title={collapsed ? 'Marketplace & Sync' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isMarketplaceActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Globe className={`w-5 h-5 shrink-0 ${isMarketplaceActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Marketplace</span>}
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'marketplace-dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                <span>Connection Status</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-connected')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'marketplace-connected'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-indigo-500" />
                <span>Akun Terhubung</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-mapping')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'marketplace-mapping'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Product Mapping</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-sync')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'marketplace-sync'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sync Center</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-history')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'marketplace-history'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <History className="w-3.5 h-3.5 text-amber-500" />
                <span>Sync History</span>
              </button>
            </div>
          )}
        </div>

        {/* Gudang & Stok Section (Accordion) */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setGudangOpen(true);
              } else {
                setGudangOpen(!gudangOpen);
              }
            }}
            title={collapsed ? 'Gudang & Stok' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isGudangActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <WarehouseIcon className={`w-5 h-5 shrink-0 ${isGudangActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Gudang & Stok</span>}
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'gudang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <WarehouseIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Manajemen Gudang</span>
              </button>

              <button
                onClick={() => setActiveTab('penerimaan-barang')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'penerimaan-barang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Penerimaan Barang</span>
              </button>

              <button
                onClick={() => setActiveTab('stock-opname')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'stock-opname'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Stock Opname</span>
              </button>
            </div>
          )}
        </div>

        {/* Shipping & Fulfillment */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setShippingOpen(true);
              } else {
                setShippingOpen(!shippingOpen);
              }
            }}
            title={collapsed ? 'Shipping & Fulfillment' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isShippingActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Truck className={`w-5 h-5 shrink-0 ${isShippingActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Pengiriman</span>}
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'shipping-dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-500" />
                <span>Fulfillment Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('shipping-management')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'shipping-management'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-orange-500" />
                <span>Manajemen Ekspedisi</span>
              </button>
              <button
                onClick={() => setActiveTab('shipping-packing')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'shipping-packing'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                <span>Packing Improvement</span>
              </button>
            </div>
          )}
        </div>

        {/* Toko Offline / Kasir POS */}
        <button
          onClick={() => setActiveTab('toko-offline')}
          title={collapsed ? 'Kasir POS (Toko Offline)' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
            activeTab === 'toko-offline'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Store className={`w-5 h-5 shrink-0 ${activeTab === 'toko-offline' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Kasir POS (Offline)</span>}
          {!collapsed && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              NEW
            </span>
          )}
        </button>

        {/* Keuangan Section (Accordion) */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setKeuanganOpen(true);
              } else {
                setKeuanganOpen(!keuanganOpen);
              }
            }}
            title={collapsed ? 'Keuangan' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isKeuanganActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Wallet className={`w-5 h-5 shrink-0 ${isKeuanganActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Keuangan</span>}
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
                onClick={() => setActiveTab('keuangan-pemasukan')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'keuangan-pemasukan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pemasukan Lain</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan-pengeluaran')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'keuangan-pengeluaran'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                <span>Pengeluaran</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan-kas')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'keuangan-kas'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Ringkasan Kas</span>
              </button>

              <button
                onClick={() => setActiveTab('keuangan-laporan')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'keuangan-laporan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                <span>Laporan Penjualan</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Master Section (Accordion) — Master Data (supplier/channel)
            kept separate from Data Pelanggan under one group so a long
            customer list doesn't turn one page into an endless scroll
            alongside suppliers and channel status. */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setMasterOpen(true);
              } else {
                setMasterOpen(!masterOpen);
              }
            }}
            title={collapsed ? 'Data Master' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isMasterActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Database className={`w-5 h-5 shrink-0 ${isMasterActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Data Master</span>}
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'master-data'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-violet-500" />
                <span>Master Data & Integrasi</span>
              </button>

              <button
                onClick={() => setActiveTab('pelanggan')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === 'pelanggan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-500" />
                <span>Data Pelanggan</span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Center */}
        <button
          onClick={() => setActiveTab('notification-center')}
          title={collapsed ? 'Pusat Notifikasi' : ''}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
            activeTab === 'notification-center'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Bell className={`w-5 h-5 shrink-0 ${activeTab === 'notification-center' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Pusat Notifikasi</span>}
        </button>

        {/* Pengaturan Sistem */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setSettingsOpen(true);
              } else {
                setSettingsOpen(!settingsOpen);
              }
            }}
            title={collapsed ? 'Pengaturan Sistem' : ''}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isSettingsActive
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Settings className={`w-5 h-5 shrink-0 ${isSettingsActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Pengaturan Sistem</span>}
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'settings-app'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-orange-500" />
                <span>Pengaturan Aplikasi</span>
              </button>
              <button
                onClick={() => setActiveTab('settings-account')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'settings-account'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Akun Saya</span>
              </button>
              <button
                onClick={() => setActiveTab('settings-roles')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'settings-roles'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-violet-500" />
                <span>Hak Akses & Peran</span>
              </button>
              <button
                onClick={() => setActiveTab('settings-users')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'settings-users'
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-500" />
                <span>Manajemen User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Intelligence Assistant Banner */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white shadow-xl shadow-indigo-900/10 border border-indigo-700/30 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-purple-500/30 transition-all duration-500" />
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-indigo-200 tracking-wide">
              BIZORA AI ASSISTANT
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            Analisis profit bersih, proyeksi stok, & optimasi iklan Shopee/TikTok.
          </p>
          <button
            onClick={openAiAdvisor}
            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tanya AI Business Advisor
          </button>
        </div>
      )}


    </aside>
  );
};
