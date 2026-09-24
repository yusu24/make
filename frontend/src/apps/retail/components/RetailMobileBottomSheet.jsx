import React, { useState, useMemo, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  X, Search, Home, LayoutDashboard, CreditCard, Package, Layers, Tag,
  Archive, Printer, Box, ArrowRightLeft, Truck, ClipboardList, Receipt,
  Inbox, ArrowDownLeft, ArrowUpRight, UserCheck, Users, Store, TrendingUp,
  Wallet, TrendingDown, RefreshCw, FileText, BarChart2, ShoppingCart,
  Settings, Zap, BookOpen, HelpCircle, Sparkles
} from '@/constants/icons'
import '../../admin/components/AdminMobileNav.css'

export const RETAIL_MODULE_SECTIONS = [
  {
    group: 'MENU UTAMA',
    items: [
      { path: '/retail/dashboard', icon: <Home size={20} />, label: 'Dashboard Retail', code: 'R01' },
      { path: '/retail/pos', icon: <CreditCard size={20} />, label: 'Kasir (POS)', code: 'R02' },
    ]
  },
  {
    group: 'KATALOG & HARGA',
    items: [
      { path: '/retail/products', icon: <Package size={20} />, label: 'Daftar Produk', code: 'K01' },
      { path: '/retail/categories', icon: <Layers size={20} />, label: 'Kategori Produk', code: 'K02' },
      { path: '/retail/units', icon: <Tag size={20} />, label: 'Satuan Barang', code: 'K03' },
      { path: '/retail/batches', icon: <Archive size={20} />, label: 'Batch & Kadaluwarsa', code: 'K04' },
      { path: '/retail/print-labels', icon: <Printer size={20} />, label: 'Cetak Barcode & Label', code: 'K05' },
      { path: '/retail/discounts', icon: <Tag size={20} />, label: 'Kode Diskon & Promo', code: 'K06' },
      { path: '/retail/pricelists', icon: <CreditCard size={20} />, label: 'Harga Grosir & Member', code: 'K07' },
    ]
  },
  {
    group: 'INVENTORI & GUDANG',
    items: [
      { path: '/retail/inventory', icon: <Box size={20} />, label: 'Stok Barang', code: 'I01' },
      { path: '/retail/stock-movements', icon: <ArrowRightLeft size={20} />, label: 'Riwayat & Mutasi Stok', code: 'I02' },
      { path: '/retail/stock-transfers', icon: <Truck size={20} />, label: 'Transfer Stok Cabang', code: 'I03' },
      { path: '/retail/stock-opname', icon: <ClipboardList size={20} />, label: 'Stock Opname', code: 'I04' },
    ]
  },
  {
    group: 'PEMBELIAN & SUPPLIER',
    items: [
      { path: '/retail/purchase-orders', icon: <Receipt size={20} />, label: 'Pesanan Pembelian (PO)', code: 'P01' },
      { path: '/retail/stock', icon: <Inbox size={20} />, label: 'Penerimaan Barang', code: 'P02' },
      { path: '/retail/supplier-returns', icon: <ArrowDownLeft size={20} />, label: 'Retur ke Supplier', code: 'P03' },
      { path: '/retail/suppliers', icon: <Truck size={20} />, label: 'Data Supplier', code: 'P04' },
    ]
  },
  {
    group: 'PENJUALAN & TRANSAKSI',
    items: [
      { path: '/retail/transactions', icon: <Receipt size={20} />, label: 'Riwayat Transaksi', code: 'J01' },
      { path: '/retail/shifts', icon: <Users size={20} />, label: 'Shift & Laci Kasir', code: 'J02' },
      { path: '/retail/customer-returns', icon: <ArrowUpRight size={20} />, label: 'Retur Pelanggan', code: 'J03' },
      { path: '/retail/customers', icon: <UserCheck size={20} />, label: 'Data Pelanggan', code: 'J04' },
      { path: '/retail/outlets', icon: <Store size={20} />, label: 'Daftar Cabang / Outlet', code: 'J05' },
    ]
  },
  {
    group: 'KEUANGAN & KAS',
    items: [
      { path: '/retail/finance/summary', icon: <TrendingUp size={20} />, label: 'Laba Rugi', code: 'F01' },
      { path: '/retail/finance/cash', icon: <Wallet size={20} />, label: 'Catatan Kas & Bank', code: 'F02' },
      { path: '/retail/finance/incomes', icon: <TrendingUp size={20} />, label: 'Pemasukan Lain', code: 'F03' },
      { path: '/retail/finance/expenses', icon: <TrendingDown size={20} />, label: 'Pengeluaran Operasional', code: 'F04' },
      { path: '/retail/finance/payables', icon: <ArrowDownLeft size={20} />, label: 'Hutang Supplier', code: 'F05' },
      { path: '/retail/finance/receivables', icon: <ArrowUpRight size={20} />, label: 'Piutang Pelanggan', code: 'F06' },
      { path: '/retail/finance/transfers', icon: <ArrowRightLeft size={20} />, label: 'Mutasi Antar Kas', code: 'F07' },
      { path: '/retail/finance/cash-flow', icon: <RefreshCw size={20} />, label: 'Arus Kas', code: 'F08' },
      { path: '/retail/finance/tax-report', icon: <FileText size={20} />, label: 'Laporan Pajak', code: 'F09' },
      { path: '/retail/finance-categories', icon: <Tag size={20} />, label: 'Kategori Keuangan', code: 'F10' },
    ]
  },
  {
    group: 'LAPORAN BISNIS',
    items: [
      { path: '/retail/reports/sales', icon: <BarChart2 size={20} />, label: 'Laporan Penjualan', code: 'L01' },
      { path: '/retail/reports/products', icon: <ShoppingCart size={20} />, label: 'Produk Terlaris', code: 'L02' },
      { path: '/retail/reports/margins', icon: <TrendingUp size={20} />, label: 'Margin Keuntungan', code: 'L03' },
      { path: '/retail/reports/customers', icon: <UserCheck size={20} />, label: 'Laporan Pelanggan', code: 'L04' },
      { path: '/retail/reports/consignment', icon: <Package size={20} />, label: 'Laporan Konsinyasi', code: 'L05' },
      { path: '/retail/reports/shifts', icon: <Users size={20} />, label: 'Laporan Shift Kasir', code: 'L06' },
      { path: '/retail/reports/payments', icon: <CreditCard size={20} />, label: 'Metode Pembayaran', code: 'L07' },
    ]
  },
  {
    group: 'KARYAWAN & SISTEM',
    items: [
      { path: '/retail/staff', icon: <Users size={20} />, label: 'Data Pegawai', code: 'S01' },
      { path: '/retail/roles', icon: <UserCheck size={20} />, label: 'Jabatan & Hak Akses', code: 'S02' },
      { path: '/retail/settings', icon: <Settings size={20} />, label: 'Pengaturan Toko', code: 'S03' },
      { path: '/retail/backup', icon: <Archive size={20} />, label: 'Cadangan Data (Backup)', code: 'S04' },
      { path: '/retail/developer-api', icon: <Zap size={20} />, label: 'Integrasi API & Webhook', code: 'S05' },
      { path: '/retail/guide', icon: <BookOpen size={20} />, label: 'Panduan & SOP Toko', code: 'S06' },
      { path: '/retail/subscription', icon: <CreditCard size={20} />, label: 'Paket Langganan', code: 'S07' },
      { path: '/retail/support', icon: <HelpCircle size={20} />, label: 'Pusat Bantuan', code: 'S08' },
    ]
  }
]

export default function RetailMobileBottomSheet({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { pathname } = useLocation()

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
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
    if (!searchQuery.trim()) return RETAIL_MODULE_SECTIONS
    const q = searchQuery.toLowerCase()
    return RETAIL_MODULE_SECTIONS.map(sec => ({
      ...sec,
      items: sec.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
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
            <span style={{ fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 9999 }}>
              Toko Retail
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
              placeholder="Cari modul atau fitur..."
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
                  const isActive = pathname === item.path
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
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
                    </NavLink>
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
              window.dispatchEvent(new CustomEvent('bizora:open-retail-ai'));
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-semibold text-xs active:bg-indigo-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span>Buka Retail AI Advisor</span>
            </div>
            <span className="text-[10px] bg-indigo-200/60 px-1.5 py-0.5 rounded text-indigo-800 font-bold">PRO</span>
          </button>
        </div>
      </div>
    </>
  )
}
