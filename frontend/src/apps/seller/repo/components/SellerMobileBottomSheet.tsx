import React, { useState, useMemo, useEffect } from 'react'
import {
  X, Search, Home, CreditCard, ShoppingBag, Package,
  Globe, Link, Layers, RefreshCw, History, Building2,
  Truck, ClipboardCheck, Send, Box, Wallet, TrendingUp,
  TrendingDown, BarChart2, Users, Settings, UserCheck,
  ShieldCheck, Zap, BookOpen, Database, Sparkles, Tag,
  Archive, Printer, ArrowRightLeft, ArrowDownLeft, ArrowUpRight,
  FileText, Store, HelpCircle, QrCode
} from '@/constants/icons'
import '../../../../apps/admin/components/AdminMobileNav.css'
import { ActiveTab } from '../types'

export interface SellerModuleItem {
  id: ActiveTab
  label: string
  icon: React.ReactNode
  code: string
}

export interface SellerModuleSection {
  group: string
  items: SellerModuleItem[]
}

export const SELLER_MODULE_SECTIONS: SellerModuleSection[] = [
  {
    group: 'MENU UTAMA',
    items: [
      { id: 'menu-utama', icon: <Home size={20} />, label: 'Dashboard Seller', code: 'S01' },
      { id: 'toko-offline', icon: <CreditCard size={20} />, label: 'Kasir POS (Toko Fisik)', code: 'S02' },
      { id: 'pesanan', icon: <ShoppingBag size={20} />, label: 'Pesanan Masuk', code: 'S03' },
    ]
  },
  {
    group: 'MARKETPLACE & OMNICHANNEL',
    items: [
      { id: 'marketplace-dashboard', icon: <Globe size={20} />, label: 'Dashboard Multi-Channel', code: 'M01' },
      { id: 'marketplace-connected', icon: <Link size={20} />, label: 'Toko Terhubung', code: 'M02' },
      { id: 'marketplace-mapping', icon: <Layers size={20} />, label: 'Mapping Master SKU', code: 'M03' },
      { id: 'marketplace-sync', icon: <RefreshCw size={20} />, label: 'Sinkronisasi Stok Real-Time', code: 'M04' },
      { id: 'marketplace-history', icon: <History size={20} />, label: 'Riwayat Sinkronisasi', code: 'M05' },
    ]
  },
  {
    group: 'PENGIRIMAN & EKSPEDISI',
    items: [
      { id: 'shipping-dashboard', icon: <Truck size={20} />, label: 'Dashboard Pengiriman', code: 'L01' },
      { id: 'shipping-management', icon: <Send size={20} />, label: 'Manajemen Resi & Kurir', code: 'L02' },
      { id: 'shipping-packing', icon: <Box size={20} />, label: 'Packing Station & Cetak AWB', code: 'L03' },
      { id: 'notification-center', icon: <Sparkles size={20} />, label: 'Pusat Notifikasi', code: 'L04' },
    ]
  },
  {
    group: 'KATALOG & HARGA',
    items: [
      { id: 'katalog', icon: <Package size={20} />, label: 'Daftar Produk', code: 'K01' },
      { id: 'katalog-kategori', icon: <Layers size={20} />, label: 'Kategori Produk', code: 'K02' },
      { id: 'katalog-satuan', icon: <Tag size={20} />, label: 'Satuan Barang', code: 'K03' },
      { id: 'katalog-batch', icon: <Archive size={20} />, label: 'Batch & Kadaluwarsa', code: 'K04' },
      { id: 'katalog-serial', icon: <QrCode size={20} />, label: 'Serial Number / IMEI', code: 'K05' },
      { id: 'katalog-label', icon: <Printer size={20} />, label: 'Cetak Label Barcode', code: 'K06' },
      { id: 'katalog-diskon', icon: <Tag size={20} />, label: 'Kode Diskon & Promo', code: 'K07' },
      { id: 'katalog-harga', icon: <Layers size={20} />, label: 'Harga Grosir & Member', code: 'K08' },
    ]
  },
  {
    group: 'INVENTORI & GUDANG',
    items: [
      { id: 'gudang', icon: <Building2 size={20} />, label: 'Stok Barang & Gudang', code: 'G01' },
      { id: 'gudang-multi', icon: <Store size={20} />, label: 'Multi-Gudang Seller', code: 'G02' },
      { id: 'gudang-po', icon: <ShoppingBag size={20} />, label: 'Purchase Order (PO)', code: 'G03' },
      { id: 'penerimaan-barang', icon: <Truck size={20} />, label: 'Penerimaan Barang Masuk', code: 'G04' },
      { id: 'gudang-mutasi', icon: <RefreshCw size={20} />, label: 'Riwayat Mutasi Stok', code: 'G05' },
      { id: 'gudang-transfer', icon: <ArrowRightLeft size={20} />, label: 'Transfer Stok Antar Gudang', code: 'G06' },
      { id: 'stock-opname', icon: <ClipboardCheck size={20} />, label: 'Stock Opname Fisik', code: 'G07' },
      { id: 'gudang-retur-supplier', icon: <Truck size={20} />, label: 'Retur ke Supplier', code: 'G08' },
    ]
  },
  {
    group: 'TRANSAKSI & KASIR',
    items: [
      { id: 'transaksi-riwayat', icon: <FileText size={20} />, label: 'Riwayat Transaksi POS', code: 'T01' },
      { id: 'transaksi-shift', icon: <Wallet size={20} />, label: 'Shift & Laci Kasir', code: 'T02' },
      { id: 'transaksi-retur-pelanggan', icon: <RefreshCw size={20} />, label: 'Retur dari Pelanggan', code: 'T03' },
    ]
  },
  {
    group: 'PELANGGAN & SUPPLIER',
    items: [
      { id: 'pelanggan', icon: <Users size={20} />, label: 'Data Pelanggan (CRM)', code: 'C01' },
      { id: 'crm-supplier', icon: <Truck size={20} />, label: 'Data Supplier', code: 'C02' },
      { id: 'crm-cabang', icon: <Store size={20} />, label: 'Daftar Cabang / Outlet', code: 'C03' },
    ]
  },
  {
    group: 'KEUANGAN & KAS',
    items: [
      { id: 'keuangan-laba-rugi', icon: <BarChart2 size={20} />, label: 'Laba Rugi', code: 'F01' },
      { id: 'keuangan-kas', icon: <Wallet size={20} />, label: 'Catatan Kas & Bank', code: 'F02' },
      { id: 'keuangan-hutang', icon: <ArrowDownLeft size={20} />, label: 'Hutang ke Supplier', code: 'F03' },
      { id: 'keuangan-piutang', icon: <ArrowUpRight size={20} />, label: 'Piutang Pelanggan', code: 'F04' },
      { id: 'keuangan-mutasi', icon: <ArrowRightLeft size={20} />, label: 'Mutasi Antar Kas', code: 'F05' },
      { id: 'keuangan-arus-kas', icon: <RefreshCw size={20} />, label: 'Arus Kas', code: 'F06' },
      { id: 'keuangan-pajak', icon: <FileText size={20} />, label: 'Laporan Pajak PPN', code: 'F07' },
      { id: 'keuangan-kategori', icon: <Tag size={20} />, label: 'Kategori Keuangan', code: 'F08' },
    ]
  },
  {
    group: 'LAPORAN BISNIS',
    items: [
      { id: 'keuangan-laporan', icon: <BarChart2 size={20} />, label: 'Laporan Penjualan', code: 'R01' },
      { id: 'laporan-produk', icon: <ShoppingBag size={20} />, label: 'Laporan Produk Terlaris', code: 'R02' },
      { id: 'laporan-margin', icon: <TrendingUp size={20} />, label: 'Laporan Margin Keuntungan', code: 'R03' },
      { id: 'laporan-pelanggan', icon: <Users size={20} />, label: 'Laporan Analitik Pelanggan', code: 'R04' },
      { id: 'laporan-konsinyasi', icon: <Package size={20} />, label: 'Laporan Konsinyasi', code: 'R05' },
      { id: 'laporan-shift', icon: <Users size={20} />, label: 'Laporan Kasir & Shift', code: 'R06' },
      { id: 'laporan-pembayaran', icon: <CreditCard size={20} />, label: 'Laporan Metode Pembayaran', code: 'R07' },
    ]
  },
  {
    group: 'PENGATURAN & SISTEM',
    items: [
      { id: 'setting-staff', icon: <Users size={20} />, label: 'Data Staf Pegawai', code: 'P01' },
      { id: 'setting-roles', icon: <ShieldCheck size={20} />, label: 'Role & Izin Akses', code: 'P02' },
      { id: 'setting-store', icon: <Settings size={20} />, label: 'Pengaturan Toko', code: 'P03' },
      { id: 'settings-app', icon: <Settings size={20} />, label: 'Pengaturan Aplikasi', code: 'P04' },
      { id: 'settings-account', icon: <UserCheck size={20} />, label: 'Akun & Profil', code: 'P05' },
      { id: 'developer-api', icon: <Zap size={20} />, label: 'Integrasi API & Webhook', code: 'P06' },
      { id: 'panduan', icon: <BookOpen size={20} />, label: 'Panduan SOP Toko', code: 'P07' },
      { id: 'langganan', icon: <CreditCard size={20} />, label: 'Paket Langganan', code: 'P08' },
      { id: 'support', icon: <HelpCircle size={20} />, label: 'Pusat Bantuan', code: 'P09' },
      { id: 'backup', icon: <Database size={20} />, label: 'Backup & Restore Data', code: 'P10' },
    ]
  }
]

interface SellerMobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  activeTab: ActiveTab
  onSelectTab: (tab: ActiveTab) => void
}

export const SellerMobileBottomSheet: React.FC<SellerMobileBottomSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setSearchQuery('')
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SELLER_MODULE_SECTIONS
    const q = searchQuery.toLowerCase()
    return SELLER_MODULE_SECTIONS.map(sec => ({
      ...sec,
      items: sec.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
    })).filter(sec => sec.items.length > 0)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="admin-sheet-backdrop" onClick={onClose} />

      {/* Slide-Up Bottom Sheet */}
      <div className="admin-sheet-container" role="dialog" aria-modal="true">
        <div className="admin-sheet-drag-handle" />

        {/* Header */}
        <div className="admin-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 className="admin-sheet-title">All modules</h3>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: 9999 }}>
              Seller & Online
            </span>
          </div>
          <button
            type="button"
            className="admin-sheet-close-btn"
            onClick={onClose}
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Search */}
        <div className="admin-sheet-search-wrap">
          <div className="admin-sheet-search-box">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              className="admin-sheet-search-input"
              placeholder="Cari modul, pesanan, gudang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} color="#94a3b8" />
              </button>
            )}
          </div>
        </div>

        {/* Modules List */}
        <div className="admin-sheet-body">
          {filteredSections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8', fontSize: 13 }}>
              Tidak ada modul yang cocok dengan "<strong>{searchQuery}</strong>"
            </div>
          ) : (
            filteredSections.map(section => (
              <div key={section.group} className="admin-sheet-group">
                <div className="admin-sheet-group-label">{section.group}</div>
                {section.items.map(item => {
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id)
                        onClose()
                      }}
                      className={`admin-sheet-item ${isActive ? 'admin-sheet-item--active' : ''}`}
                    >
                      <div className="admin-sheet-item-left">
                        <span className="admin-sheet-item-icon">
                          {item.icon}
                        </span>
                        <span className="admin-sheet-item-label">
                          {item.label}
                        </span>
                      </div>
                      <span className="admin-sheet-item-code">
                        {item.code}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer / Quick AI Trigger */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: '#fafafa', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('bizora:open-seller-ai'));
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200/60 text-orange-800 font-semibold text-xs active:bg-orange-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-600" />
              <span>Buka Seller AI Advisor</span>
            </div>
            <span className="text-[10px] bg-orange-200/70 px-1.5 py-0.5 rounded text-orange-900 font-bold">PRO</span>
          </button>
        </div>
      </div>
    </>
  )
}
