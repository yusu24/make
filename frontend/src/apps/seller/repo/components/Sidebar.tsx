import React, { useState, useEffect, useRef } from 'react';
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
  Code2,
  Tag,
  Printer,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  HelpCircle,
  FileText,
  BarChart2
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
        top: Math.max(8, Math.min(anchorY, window.innerHeight - 360)),
        zIndex: 1100,
        minWidth: 220,
        maxHeight: '80vh',
        overflowY: 'auto',
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
  const t = i18n?.t || ((key: string, def?: string) => def || key);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [flyoutAnchorY, setFlyoutAnchorY] = useState(60);

  const isMarketplaceActive = activeTab.startsWith('marketplace-');
  const [marketplaceOpen, setMarketplaceOpen] = useState(isMarketplaceActive);

  const isShippingActive = activeTab.startsWith('shipping-');
  const [shippingOpen, setShippingOpen] = useState(isShippingActive);

  const isKatalogActive = activeTab.startsWith('katalog');
  const [katalogOpen, setKatalogOpen] = useState(isKatalogActive);

  const isGudangActive = ['gudang', 'gudang-multi', 'penerimaan-barang', 'gudang-po', 'gudang-mutasi', 'gudang-transfer', 'gudang-retur-supplier', 'stock-opname'].includes(activeTab);
  const [gudangOpen, setGudangOpen] = useState(isGudangActive);

  const isTransaksiActive = activeTab.startsWith('transaksi-');
  const [transaksiOpen, setTransaksiOpen] = useState(isTransaksiActive);

  const isCrmActive = ['pelanggan', 'crm-supplier', 'crm-cabang', 'master-data'].includes(activeTab);
  const [crmOpen, setCrmOpen] = useState(isCrmActive);

  const isKeuanganActive = activeTab.startsWith('keuangan-') && !['keuangan-laporan'].includes(activeTab);
  const [keuanganOpen, setKeuanganOpen] = useState(isKeuanganActive);

  const isLaporanActive = activeTab.startsWith('laporan-') || activeTab === 'keuangan-laporan';
  const [laporanOpen, setLaporanOpen] = useState(isLaporanActive);

  const isSettingsActive = activeTab.startsWith('settings-') || activeTab.startsWith('setting-') || ['backup', 'developer-api', 'panduan', 'langganan', 'support'].includes(activeTab);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  // Auto-manage accordions when activeTab changes
  useEffect(() => {
    if (activeTab.startsWith('marketplace-')) setMarketplaceOpen(true);
    if (activeTab.startsWith('shipping-')) setShippingOpen(true);
    if (activeTab.startsWith('katalog')) setKatalogOpen(true);
    if (['gudang', 'gudang-multi', 'penerimaan-barang', 'gudang-po', 'gudang-mutasi', 'gudang-transfer', 'gudang-retur-supplier', 'stock-opname'].includes(activeTab)) setGudangOpen(true);
    if (activeTab.startsWith('transaksi-')) setTransaksiOpen(true);
    if (['pelanggan', 'crm-supplier', 'crm-cabang', 'master-data'].includes(activeTab)) setCrmOpen(true);
    if (activeTab.startsWith('keuangan-') && activeTab !== 'keuangan-laporan') setKeuanganOpen(true);
    if (activeTab.startsWith('laporan-') || activeTab === 'keuangan-laporan') setLaporanOpen(true);
    if (activeTab.startsWith('settings-') || activeTab.startsWith('setting-') || ['backup', 'developer-api', 'panduan', 'langganan', 'support'].includes(activeTab)) setSettingsOpen(true);
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
      label: 'Marketplace & Omnichannel',
      items: [
        { id: 'marketplace-dashboard', label: 'Dashboard Multi-Channel', icon: <Globe className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'marketplace-connected', label: 'Toko Terhubung', icon: <Link className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'marketplace-mapping', label: 'Mapping Master SKU', icon: <Layers className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'marketplace-sync', label: 'Pusat Sinkronisasi', icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'marketplace-history', label: 'Riwayat Sync', icon: <History className="w-3.5 h-3.5 text-purple-500" /> },
      ]
    },
    shipping: {
      id: 'shipping',
      label: 'Pengiriman & Logistik',
      items: [
        { id: 'shipping-dashboard', label: 'Dashboard Pengiriman', icon: <Truck className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'shipping-management', label: 'Kurir & Ekspedisi', icon: <Package className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'shipping-packing', label: 'Packing Station & AWB', icon: <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'notification-center', label: 'Pusat Notifikasi', icon: <Bell className="w-3.5 h-3.5 text-rose-500" /> },
      ]
    },
    katalog: {
      id: 'katalog',
      label: 'Katalog & Harga',
      items: [
        { id: 'katalog', label: 'Daftar Produk', icon: <Package className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'katalog-kategori', label: 'Kategori Produk', icon: <Layers className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'katalog-satuan', label: 'Satuan Barang', icon: <Tag className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'katalog-batch', label: 'Batch & Kadaluwarsa', icon: <Archive className="w-3.5 h-3.5 text-purple-500" /> },
        { id: 'katalog-serial', label: 'Serial Number / IMEI', icon: <QrCode className="w-3.5 h-3.5 text-cyan-500" /> },
        { id: 'katalog-label', label: 'Cetak Barcode Label', icon: <Printer className="w-3.5 h-3.5 text-slate-500" /> },
        { id: 'katalog-diskon', label: 'Kode Diskon & Promo', icon: <Tag className="w-3.5 h-3.5 text-rose-500" /> },
        { id: 'katalog-harga', label: 'Harga Grosir & Member', icon: <Layers className="w-3.5 h-3.5 text-blue-500" /> },
      ]
    },
    gudang: {
      id: 'gudang',
      label: 'Inventori & Gudang',
      items: [
        { id: 'gudang', label: 'Stok Barang & Gudang', icon: <Box className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'gudang-multi', label: 'Multi-Gudang Seller', icon: <Store className="w-3.5 h-3.5 text-sky-500" /> },
        { id: 'gudang-po', label: 'Purchase Order (PO)', icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'penerimaan-barang', label: 'Penerimaan Barang', icon: <Truck className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'gudang-mutasi', label: 'Riwayat Mutasi Stok', icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'gudang-transfer', label: 'Transfer Antar Gudang', icon: <ArrowRightLeft className="w-3.5 h-3.5 text-violet-500" /> },
        { id: 'stock-opname', label: 'Stock Opname Fisik', icon: <ClipboardCheck className="w-3.5 h-3.5 text-teal-500" /> },
        { id: 'gudang-retur-supplier', label: 'Retur ke Supplier', icon: <Truck className="w-3.5 h-3.5 text-rose-500" /> },
      ]
    },
    transaksi: {
      id: 'transaksi',
      label: 'Penjualan & Kasir',
      items: [
        { id: 'transaksi-riwayat', label: 'Riwayat Transaksi POS', icon: <FileText className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'transaksi-shift', label: 'Shift & Laci Kasir', icon: <Wallet className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'transaksi-retur-pelanggan', label: 'Retur dari Pelanggan', icon: <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> },
      ]
    },
    crm: {
      id: 'crm',
      label: 'Pelanggan & Supplier',
      items: [
        { id: 'pelanggan', label: 'Data Pelanggan (CRM)', icon: <Users className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'crm-supplier', label: 'Data Supplier', icon: <Truck className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'crm-cabang', label: 'Daftar Cabang / Toko', icon: <Store className="w-3.5 h-3.5 text-amber-500" /> },
      ]
    },
    keuangan: {
      id: 'keuangan',
      label: 'Keuangan & Buku Kas',
      items: [
        { id: 'keuangan-laba-rugi', label: 'Ringkasan Laba Rugi', icon: <BarChart2 className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'keuangan-kas', label: 'Catatan Kas & Bank', icon: <Coins className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'keuangan-hutang', label: 'Hutang ke Supplier', icon: <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" /> },
        { id: 'keuangan-piutang', label: 'Piutang Pelanggan', icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'keuangan-mutasi', label: 'Mutasi Antar Kas', icon: <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'keuangan-arus-kas', label: 'Laporan Arus Kas', icon: <RefreshCw className="w-3.5 h-3.5 text-purple-500" /> },
        { id: 'keuangan-pajak', label: 'Laporan Pajak PPN', icon: <FileText className="w-3.5 h-3.5 text-slate-500" /> },
        { id: 'keuangan-kategori', label: 'Kategori Keuangan', icon: <Tag className="w-3.5 h-3.5 text-cyan-500" /> },
      ]
    },
    laporan: {
      id: 'laporan',
      label: 'Laporan Bisnis',
      items: [
        { id: 'keuangan-laporan', label: 'Laporan Penjualan', icon: <BarChart2 className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'laporan-produk', label: 'Produk Terlaris', icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'laporan-margin', label: 'Margin Keuntungan', icon: <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'laporan-pelanggan', label: 'Analitik Pelanggan', icon: <Users className="w-3.5 h-3.5 text-purple-500" /> },
        { id: 'laporan-konsinyasi', label: 'Laporan Konsinyasi', icon: <Package className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'laporan-shift', label: 'Laporan Kasir & Shift', icon: <Wallet className="w-3.5 h-3.5 text-teal-500" /> },
        { id: 'laporan-pembayaran', label: 'Metode Pembayaran', icon: <CreditCard className="w-3.5 h-3.5 text-rose-500" /> },
      ]
    },
    settings: {
      id: 'settings',
      label: 'Pengaturan & Sistem',
      items: [
        { id: 'setting-staff', label: 'Data Pegawai & Staf', icon: <Users className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'setting-roles', label: 'Hak Akses & Peran', icon: <Shield className="w-3.5 h-3.5 text-emerald-500" /> },
        { id: 'setting-store', label: 'Pengaturan Toko', icon: <Store className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'backup', label: 'Backup Data Toko', icon: <Archive className="w-3.5 h-3.5 text-purple-500" /> },
        { id: 'developer-api', label: 'Integrasi API & Webhook', icon: <Zap className="w-3.5 h-3.5 text-blue-500" /> },
        { id: 'panduan', label: 'Panduan SOP Toko', icon: <BookOpen className="w-3.5 h-3.5 text-teal-500" /> },
        { id: 'langganan', label: 'Paket Langganan', icon: <CreditCard className="w-3.5 h-3.5 text-rose-500" /> },
        { id: 'support', label: 'Pusat Bantuan', icon: <HelpCircle className="w-3.5 h-3.5 text-cyan-500" /> },
      ]
    }
  };

  return (
    <>
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-[#101828] transition-all duration-300 flex flex-col border-r border-slate-100 dark:border-slate-800
      ${collapsed ? 'md:w-[68px]' : 'md:w-64'} 
      w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 relative flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-slate-800 p-1.5 border border-indigo-100 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
            <img 
              src={user?.store_icon_url || bizoraLogo} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight font-['Plus_Jakarta_Sans']">
                {user?.store_name || 'Bizora Seller'}
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Omnichannel POS
              </span>
            </div>
          )}
        </div>
        
        {/* Mobile close button */}
        <button 
          className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setMobileMenuOpen?.(false)}
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-scrollbar">
        {/* ── 1. Dashboard Utama ── */}
        <button
          onClick={() => setActiveTab('menu-utama')}
          title={collapsed ? 'Dashboard' : ''}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
            activeTab === 'menu-utama'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'menu-utama' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Dashboard</span>}
        </button>

        {/* ── 2. Kasir POS Toko Fisik ── */}
        <button
          onClick={() => setActiveTab('toko-offline')}
          title={collapsed ? 'Kasir (POS)' : ''}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
            activeTab === 'toko-offline'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <CreditCard className={`w-4 h-4 shrink-0 ${activeTab === 'toko-offline' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Kasir POS (Offline)</span>}
          {!collapsed && (
            <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
              POS
            </span>
          )}
        </button>

        {/* ── 3. Pesanan Masuk ── */}
        <button
          onClick={() => setActiveTab('pesanan')}
          title={collapsed ? 'Semua Pesanan' : ''}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
            activeTab === 'pesanan'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 shrink-0 ${activeTab === 'pesanan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
          {!collapsed && <span className="flex-1 text-left truncate">Pesanan Masuk</span>}
        </button>

        {/* ── 4. Marketplace & Omnichannel ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('marketplace', e);
              } else {
                setMarketplaceOpen(!marketplaceOpen);
              }
            }}
            title={collapsed ? 'Marketplace' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isMarketplaceActive || openSection === 'marketplace'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Globe className={`w-4 h-4 shrink-0 ${isMarketplaceActive || openSection === 'marketplace' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Marketplace</span>}
            {!collapsed && (
              marketplaceOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && marketplaceOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('marketplace-dashboard')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'marketplace-dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Dashboard Multi-Channel</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-connected')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'marketplace-connected'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Link className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Toko Terhubung</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-mapping')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'marketplace-mapping'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Mapping Master SKU</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-sync')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'marketplace-sync'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <RefreshCw className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Sinkronisasi Real-Time</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace-history')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'marketplace-history'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <History className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">Riwayat Sync</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 5. Pengiriman & Logistik ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('shipping', e);
              } else {
                setShippingOpen(!shippingOpen);
              }
            }}
            title={collapsed ? 'Pengiriman' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isShippingActive || openSection === 'shipping'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Truck className={`w-4 h-4 shrink-0 ${isShippingActive || openSection === 'shipping' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Pengiriman & Resi</span>}
            {!collapsed && (
              shippingOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && shippingOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('shipping-dashboard')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'shipping-dashboard'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Truck className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Dashboard Pengiriman</span>
              </button>
              <button
                onClick={() => setActiveTab('shipping-management')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'shipping-management'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Ekspedisi & Kurir</span>
              </button>
              <button
                onClick={() => setActiveTab('shipping-packing')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'shipping-packing'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ClipboardCheck className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Packing Station & Cetak AWB</span>
              </button>
              <button
                onClick={() => setActiveTab('notification-center')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'notification-center'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Bell className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Pusat Notifikasi</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 6. Katalog & Harga ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('katalog', e);
              } else {
                setKatalogOpen(!katalogOpen);
              }
            }}
            title={collapsed ? 'Katalog' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isKatalogActive || openSection === 'katalog'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Package className={`w-4 h-4 shrink-0 ${isKatalogActive || openSection === 'katalog' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Katalog & Harga</span>}
            {!collapsed && (
              katalogOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && katalogOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('katalog')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Daftar Produk</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-kategori')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-kategori'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Kategori Produk</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-satuan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-satuan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Satuan Barang</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-batch')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-batch'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Archive className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">Batch & Kadaluwarsa</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-serial')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-serial'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <QrCode className="w-3 h-3 text-cyan-500 shrink-0" />
                <span className="truncate">Serial Number / IMEI</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-label')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-label'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Printer className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">Cetak Label Barcode</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-diskon')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-diskon'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Tag className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Kode Diskon & Promo</span>
              </button>
              <button
                onClick={() => setActiveTab('katalog-harga')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'katalog-harga'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Harga Grosir & Member</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 7. Inventori & Gudang ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('gudang', e);
              } else {
                setGudangOpen(!gudangOpen);
              }
            }}
            title={collapsed ? 'Inventori' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isGudangActive || openSection === 'gudang'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <WarehouseIcon className={`w-4 h-4 shrink-0 ${isGudangActive || openSection === 'gudang' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Inventori & Gudang</span>}
            {!collapsed && (
              gudangOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && gudangOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('gudang')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'gudang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Box className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Stok Barang & Nilai</span>
              </button>
              <button
                onClick={() => setActiveTab('gudang-multi')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'gudang-multi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Store className="w-3 h-3 text-sky-500 shrink-0" />
                <span className="truncate">Multi-Gudang Seller</span>
              </button>
              <button
                onClick={() => setActiveTab('gudang-po')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'gudang-po'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ShoppingBag className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Purchase Order (PO)</span>
              </button>
              <button
                onClick={() => setActiveTab('penerimaan-barang')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'penerimaan-barang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Truck className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Penerimaan Barang</span>
              </button>
              <button
                onClick={() => setActiveTab('gudang-mutasi')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'gudang-mutasi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <RefreshCw className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Riwayat Mutasi Stok</span>
              </button>
              <button
                onClick={() => setActiveTab('gudang-transfer')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'gudang-transfer'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3 text-violet-500 shrink-0" />
                <span className="truncate">Transfer Antar Gudang</span>
              </button>
              <button
                onClick={() => setActiveTab('stock-opname')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'stock-opname'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ClipboardCheck className="w-3 h-3 text-teal-500 shrink-0" />
                <span className="truncate">Stock Opname Fisik</span>
              </button>
              <button
                onClick={() => setActiveTab('gudang-retur-supplier')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'gudang-retur-supplier'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Truck className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Retur ke Supplier</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 8. Penjualan & Kasir POS ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('transaksi', e);
              } else {
                setTransaksiOpen(!transaksiOpen);
              }
            }}
            title={collapsed ? 'Transaksi' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isTransaksiActive || openSection === 'transaksi'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileText className={`w-4 h-4 shrink-0 ${isTransaksiActive || openSection === 'transaksi' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Transaksi & Kasir</span>}
            {!collapsed && (
              transaksiOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && transaksiOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('transaksi-riwayat')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'transaksi-riwayat'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Riwayat Transaksi POS</span>
              </button>
              <button
                onClick={() => setActiveTab('transaksi-shift')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'transaksi-shift'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Wallet className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Shift & Laci Kasir</span>
              </button>
              <button
                onClick={() => setActiveTab('transaksi-retur-pelanggan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'transaksi-retur-pelanggan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <RefreshCw className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Retur dari Pelanggan</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 9. Pelanggan & Supplier CRM ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('crm', e);
              } else {
                setCrmOpen(!crmOpen);
              }
            }}
            title={collapsed ? 'Mitra' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isCrmActive || openSection === 'crm'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 ${isCrmActive || openSection === 'crm' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Pelanggan & Supplier</span>}
            {!collapsed && (
              crmOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && crmOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('pelanggan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'pelanggan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Data Pelanggan (CRM)</span>
              </button>
              <button
                onClick={() => setActiveTab('crm-supplier')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'crm-supplier'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Truck className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Data Supplier</span>
              </button>
              <button
                onClick={() => setActiveTab('crm-cabang')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'crm-cabang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Store className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Daftar Cabang & Toko</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 10. Keuangan & Kas ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('keuangan', e);
              } else {
                setKeuanganOpen(!keuanganOpen);
              }
            }}
            title={collapsed ? 'Keuangan' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isKeuanganActive || openSection === 'keuangan'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <Wallet className={`w-4 h-4 shrink-0 ${isKeuanganActive || openSection === 'keuangan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Keuangan & Kas</span>}
            {!collapsed && (
              keuanganOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && keuanganOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('keuangan-laba-rugi')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-laba-rugi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <BarChart2 className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Ringkasan Laba Rugi</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-kas')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-kas'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Coins className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Catatan Kas & Bank</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-hutang')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-hutang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ArrowDownLeft className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Hutang ke Supplier</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-piutang')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-piutang'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Piutang Pelanggan</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-mutasi')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-mutasi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Mutasi Antar Kas</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-arus-kas')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-arus-kas'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <RefreshCw className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">Laporan Arus Kas</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-pajak')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-pajak'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">Laporan Pajak PPN</span>
              </button>
              <button
                onClick={() => setActiveTab('keuangan-kategori')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-kategori'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Tag className="w-3 h-3 text-cyan-500 shrink-0" />
                <span className="truncate">Kategori Keuangan</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 11. Laporan & Analitik Bisnis ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('laporan', e);
              } else {
                setLaporanOpen(!laporanOpen);
              }
            }}
            title={collapsed ? 'Laporan' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isLaporanActive || openSection === 'laporan'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className={`w-4 h-4 shrink-0 ${isLaporanActive || openSection === 'laporan' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Laporan Bisnis</span>}
            {!collapsed && (
              laporanOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && laporanOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('keuangan-laporan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'keuangan-laporan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <BarChart2 className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Laporan Penjualan</span>
              </button>
              <button
                onClick={() => setActiveTab('laporan-produk')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'laporan-produk'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <ShoppingBag className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Produk Terlaris</span>
              </button>
              <button
                onClick={() => setActiveTab('laporan-margin')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'laporan-margin'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <TrendingUp className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Margin Keuntungan</span>
              </button>
              <button
                onClick={() => setActiveTab('laporan-pelanggan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'laporan-pelanggan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">Analitik Pelanggan</span>
              </button>
              <button
                onClick={() => setActiveTab('laporan-konsinyasi')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'laporan-konsinyasi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Package className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Laporan Konsinyasi</span>
              </button>
              <button
                onClick={() => setActiveTab('laporan-shift')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'laporan-shift'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Wallet className="w-3 h-3 text-teal-500 shrink-0" />
                <span className="truncate">Laporan Kasir & Shift</span>
              </button>
              <button
                onClick={() => setActiveTab('laporan-pembayaran')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'laporan-pembayaran'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <CreditCard className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Metode Pembayaran</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 12. Pengaturan & Sistem ── */}
        <div>
          <button
            onClick={(e) => {
              if (collapsed) {
                handleGroupIconClick('settings', e);
              } else {
                setSettingsOpen(!settingsOpen);
              }
            }}
            title={collapsed ? 'Pengaturan' : ''}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-[13px] transition-all duration-150 group ${
              isSettingsActive || openSection === 'settings'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Settings className={`w-4 h-4 shrink-0 ${isSettingsActive || openSection === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            {!collapsed && <span className="flex-1 text-left truncate">Pengaturan & Sistem</span>}
            {!collapsed && (
              settingsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )
            )}
          </button>

          {(!collapsed && settingsOpen) && (
            <div className="ml-3 pl-2.5 border-l border-indigo-100 dark:border-indigo-900/40 my-1 space-y-0.5">
              <button
                onClick={() => setActiveTab('setting-staff')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'setting-staff' || activeTab === 'settings-users'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate">Data Pegawai & Staf</span>
              </button>
              <button
                onClick={() => setActiveTab('setting-roles')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'setting-roles' || activeTab === 'settings-roles'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Hak Akses & Peran</span>
              </button>
              <button
                onClick={() => setActiveTab('setting-store')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'setting-store' || activeTab === 'settings-app'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Store className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Pengaturan Toko</span>
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'backup'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Archive className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="truncate">Backup Data Toko</span>
              </button>
              <button
                onClick={() => setActiveTab('developer-api')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'developer-api'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Zap className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Integrasi API & Webhook</span>
              </button>
              <button
                onClick={() => setActiveTab('panduan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'panduan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <BookOpen className="w-3 h-3 text-teal-500 shrink-0" />
                <span className="truncate">Panduan SOP Toko</span>
              </button>
              <button
                onClick={() => setActiveTab('langganan')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'langganan'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <CreditCard className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Paket Langganan</span>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all text-left ${
                  activeTab === 'support'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <HelpCircle className="w-3 h-3 text-cyan-500 shrink-0" />
                <span className="truncate">Pusat Bantuan</span>
              </button>
            </div>
          )}
        </div>
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
