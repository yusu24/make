import React, { useState, useMemo, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Printer,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Package,
  Download
} from '@/constants/icons';
import { Order, OrderStatus, MarketplacePlatform } from '../../types';
import { formatIDR, getPlatformBadgeColor } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { exportToCsv } from '../../utils/excelExport';
import { useTranslation } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import '../../../seller-print.css';
import {
  SellerPrintHeader,
  SellerPrintSectionHeader,
  SellerPrintAppendixHeader,
  SellerPrintExplanationBox,
  SellerPrintFooter,
  formatRp,
  formatDateIndo
} from '../SellerPrintLayout';

interface OrdersViewProps {
  orders: Order[];
  onOpenAwbModal: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenAwbModal,
  onUpdateOrderStatus,
}) => {
  const { user } = useAuth();
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('Perlu Diproses');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Pesanan-Pelanggan-Ecommerce-${new Date().toISOString().split('T')[0]}`,
  });

  const statusOptions: OrderStatus[] = [
    'Perlu Diproses',
    'Dalam Pengiriman',
    'Selesai',
    'Dibatalkan/Retur',
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status tab filter
      const matchesStatus =
        activeStatusTab === 'Semua' || ord.status === activeStatusTab;

      // Platform filter
      const matchesPlatform =
        selectedPlatform === 'all' || ord.platform === selectedPlatform;

      // Search term
      const matchesSearch =
        ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.courier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ord.items.some((it) => it.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesPlatform && matchesSearch;
    });
  }, [orders, activeStatusTab, selectedPlatform, searchTerm]);

  const { paginatedItems: paginatedOrders, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(filteredOrders);

  const handleCopyTracking = (trackingNo: string) => {
    navigator.clipboard.writeText(trackingNo);
    setCopiedId(trackingNo);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportExcel = () => {
    const headers = ['Nomor Pesanan', 'Tanggal', 'Marketplace', 'Pembeli', 'Total Pembayaran (Rp)', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.orderDate,
      o.platform,
      o.customerName,
      o.totalAmount,
      o.status,
    ]);
    exportToCsv('Laporan_Pesanan_Seller', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveStatusTab('Semua')}
          className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            activeStatusTab === 'Semua' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'Total Orders' : 'Total Pesanan'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#101828] dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {orders.length} <span className="text-xs font-normal text-slate-400 font-['Inter']">{i18n?.language === 'en' ? 'Orders' : 'Pesanan'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
            {i18n?.language === 'en' ? 'All channels & platforms' : 'Semua kanal & platform'}
          </div>
        </div>

        <div
          onClick={() => setActiveStatusTab('Perlu Diproses')}
          className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            activeStatusTab === 'Perlu Diproses' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'Needs Process' : 'Perlu Diproses'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {orders.filter(o => o.status === 'Perlu Diproses').length} <span className="text-xs font-normal text-slate-400 font-['Inter']">{i18n?.language === 'en' ? 'Orders' : 'Pesanan'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-amber-600 dark:text-amber-400 font-semibold font-['Inter']">
            {i18n?.language === 'en' ? 'Awaiting AWB label print' : 'Menunggu cetak resi AWB'}
          </div>
        </div>

        <div
          onClick={() => setActiveStatusTab('Dalam Pengiriman')}
          className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            activeStatusTab === 'Dalam Pengiriman' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'In Delivery' : 'Dalam Pengiriman'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {orders.filter(o => o.status === 'Dalam Pengiriman').length} <span className="text-xs font-normal text-slate-400 font-['Inter']">{i18n?.language === 'en' ? 'Orders' : 'Pesanan'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-blue-600 dark:text-blue-400 font-semibold font-['Inter']">
            {i18n?.language === 'en' ? 'In courier transit' : 'Sedang transit / kurir'}
          </div>
        </div>

        <div
          onClick={() => setActiveStatusTab('Selesai')}
          className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer ${
            activeStatusTab === 'Selesai' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'Completed' : 'Selesai Diterima'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {orders.filter(o => o.status === 'Selesai').length} <span className="text-xs font-normal text-slate-400 font-['Inter']">{i18n?.language === 'en' ? 'Orders' : 'Pesanan'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold font-['Inter']">
            {i18n?.language === 'en' ? 'Successfully received' : 'Pesanan sukses diterima'}
          </div>
        </div>
      </div>

      {/* Main Orders Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        {/* Filters Bar: Search, Status Dropdown, Marketplace, & Action Buttons */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('seller.searchOrder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[38px] pl-10 pr-4 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
              />
            </div>

            {/* Status Dropdown Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={activeStatusTab}
                onChange={(e) => setActiveStatusTab(e.target.value)}
                className="h-[38px] px-3.5 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Semua">
                  {i18n?.language === 'en' ? 'All Status' : 'Semua Status'} ({orders.length})
                </option>
                {statusOptions.map((st) => {
                  const count = orders.filter((o) => o.status === st).length;
                  const displayStatus = st === 'Perlu Diproses' ? (i18n?.language === 'en' ? 'Needs Process' : 'Perlu Diproses') : st === 'Dalam Pengiriman' ? (i18n?.language === 'en' ? 'In Delivery' : 'Dalam Pengiriman') : st === 'Selesai' ? (i18n?.language === 'en' ? 'Completed' : 'Selesai') : st === 'Dibatalkan/Retur' ? (i18n?.language === 'en' ? 'Canceled/Return' : 'Dibatalkan/Retur') : st;
                  return (
                    <option key={st} value={st}>
                      {displayStatus} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Platform Dropdown Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="h-[38px] px-3 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">{i18n?.language === 'en' ? 'All E-Commerce Platforms' : 'Semua Platform E-Commerce'}</option>
                <option value="Shopee">Shopee</option>
                <option value="Tokopedia">Tokopedia</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Lazada">Lazada</option>
              </select>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-3.5 h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Cetak Laporan Register Pesanan PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Export PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 h-[38px] rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Export Daftar Pesanan ke Excel/CSV"
            >
              <Download className="w-4 h-4" />
              <span>{t('seller.exportExcel')}</span>
            </button>
          </div>
        </div>

        {/* Orders List / Table */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-y border-slate-200/80 dark:border-slate-700/80 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 pl-6">{i18n?.language === 'en' ? 'ORDER & TIME' : 'PESANAN & WAKTU'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'CUSTOMER & ADDRESS' : 'PEMBELI & ALAMAT'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'PRODUCTS' : 'PRODUK'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'SHIPPING' : 'PENGIRIMAN'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'STATUS' : 'STATUS'}</th>
                <th className="py-3 px-4 pr-6 text-center">{i18n?.language === 'en' ? 'ACTION' : 'AKSI'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-[13.5px]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 text-center text-slate-400">
                      <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                        Tidak ada pesanan pada status ini
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => {
                  const badge = getPlatformBadgeColor(ord.platform);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                      {/* Pesanan & Waktu */}
                      <td className="py-3.5 px-4 pl-6 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold w-fit ${badge.bg} ${badge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {ord.platform}
                          </span>
                          <span className="font-mono font-bold text-[13px] text-slate-800 dark:text-slate-100">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ord.orderDate}</span>
                        </div>
                      </td>

                      {/* Pembeli */}
                      <td className="py-3.5 px-4 align-top whitespace-normal min-w-[180px] max-w-[220px]">
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                          {ord.customerName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {ord.customerPhone}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={ord.address}>
                          {ord.address}
                        </p>
                      </td>

                      {/* Produk */}
                      <td className="py-3.5 px-4 align-top whitespace-normal min-w-[220px]">
                        <div className="space-y-2">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              {it.image && (
                                <img src={it.image} alt={it.productName} className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[13px] text-slate-800 dark:text-slate-100 truncate" title={it.productName}>
                                  {it.productName}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {it.quantity}x @ {formatIDR(it.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center font-bold text-sm text-slate-800 dark:text-slate-100">
                            <span>{i18n?.language === 'en' ? 'Total Amount' : 'Total Bayar'}</span>
                            <span>{formatIDR(ord.totalAmount)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Pengiriman */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-[13px] text-slate-700 dark:text-slate-200 font-semibold">
                          {ord.courier}
                        </div>
                        {ord.trackingNumber && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-500">{ord.trackingNumber}</span>
                            <button
                              onClick={() => handleCopyTracking(ord.trackingNumber!)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                              title="Salin Resi"
                            >
                              {copiedId === ord.trackingNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          ord.status === 'Perlu Diproses'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            : ord.status === 'Dalam Pengiriman'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                            : ord.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          {ord.status === 'Perlu Diproses' ? (i18n?.language === 'en' ? 'Needs Process' : 'Perlu Diproses') : ord.status === 'Dalam Pengiriman' ? (i18n?.language === 'en' ? 'Shipped' : 'Dalam Pengiriman') : ord.status === 'Selesai' ? (i18n?.language === 'en' ? 'Completed' : 'Selesai') : ord.status}
                        </span>
                        {ord.isPrintedAWB && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-2 py-0.5 rounded">
                            <Printer className="w-3 h-3" />
                            <span>{i18n?.language === 'en' ? 'Printed' : 'Dicetak'}</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 pr-6 align-top text-center">
                        <button
                          onClick={() => onPrintAwb(ord)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 h-[32px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer w-full whitespace-nowrap"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{i18n?.language === 'en' ? 'Print Label' : 'Cetak Resi'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE CUSTOMER ORDERS REPORT                           */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Toko Online */}
          <SellerPrintHeader
            user={user}
            title="Laporan Register Pesanan Pelanggan"
            subtitle="Rekapitulasi Pemenuhan Pesanan (Fulfillment), Logistik Kurir & Nilai Transaksi"
            periodText={`Status: ${activeStatusTab} • Channel: ${selectedPlatform === 'all' ? 'Semua Platform' : selectedPlatform}`}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader title="I. Ringkasan Volume & Nilai Transaksi Pesanan" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI PESANAN MASUK
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Volume Pesanan Terdaftar</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>{filteredOrders.length} Pesanan</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    TOTAL NILAI BRUTO PESANAN (GROSS ORDER VALUE)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    100.0%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader 
              title="II. Buku Register Transaksi Pesanan Pelanggan (Orders Ledger)" 
              rightText={`Total ${filteredOrders.length} pesanan`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 30, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 110, fontWeight: 600 }}>No. Pesanan</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 75, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 85, fontWeight: 600 }}>Channel</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 110, fontWeight: 600 }}>Pembeli</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 110, fontWeight: 600 }}>Kurir & Resi</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 85, fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Nilai Pembayaran (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, idx) => (
                  <tr key={o.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 4px', fontWeight: 600, color: '#000000', fontFamily: 'monospace' }}>
                      {o.orderNumber}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', whiteSpace: 'nowrap' }}>
                      {o.orderDate ? o.orderDate.substring(0, 10) : '-'}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', textTransform: 'capitalize' }}>
                      {o.platform}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {o.customerName || '-'}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {o.courier} {o.trackingNumber ? `(${o.trackingNumber})` : ''}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', textTransform: 'capitalize' }}>
                      {o.status}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={7} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Nilai Pesanan:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(filteredOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <SellerPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN PANDUAN SLA PENGIRIMAN & FULFILLMENT */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <SellerPrintAppendixHeader 
              title="Lampiran: Panduan SLA Pengiriman & Pemenuhan Pesanan (Fulfillment)"
              subtitle={`Standar Operasional Packing, Batas Waktu Kirim & Protokol Ekspedisi — ${user?.tenant_name || 'Toko Online'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <SellerPrintExplanationBox
                number="1"
                title="Service Level Agreement (SLA Batas Waktu Pengiriman)"
                desc="Pesanan yang masuk sebelum batas cut-off operasional (pukul 15.00 WIB) wajib diproses dan diserahterimakan ke kurir pada hari yang sama untuk mempertahankan skor performa toko."
                variant="default"
              />

              <SellerPrintExplanationBox
                number="2"
                title="Prosedur Validasi Pick & Pack (Zero-Error Picking)"
                desc="Admin gudang wajib melakukan pemindaian barcode resi dan SKU barang untuk memastikan kesesuaian varian (warna, ukuran, jumlah) sebelum paket disegel lakban."
                variant="emerald"
              />

              <SellerPrintExplanationBox
                number="3"
                title="Standar Pengemasan Barang Rentan (Fragile Packing Standards)"
                desc="Produk cair atau pecah belah wajib dibalut minimal 3 lapis bubble wrap tebal, menggunakan kardus gelombang ganda, dan ditempeli stiker Fragile di bagian atas."
                variant="rose"
              />

              <SellerPrintExplanationBox
                number="4"
                title="Serah Terima Manifest Kurir Ekspedisi"
                desc="Petugas pick-up kurir wajib menandatangani lembar manifest penyerahan paket dengan mencantumkan jumlah total koli dan jam penjemputan barang."
                variant="indigo"
              />

              <SellerPrintExplanationBox
                number="5"
                title="Penanganan Pesanan Retur & Gagal Kirim COD (RTS)"
                desc="Paket yang kembali karena alamat tidak ditemukan atau penolakan COD diinspeksi keutuhan segelnya dan dicatat ke dalam modul retur sebelum stok dimasukkan kembali."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
