import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Printer,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Package,
  Download
} from 'lucide-react';
import { Order, OrderStatus, MarketplacePlatform } from '../../types';
import { formatIDR, getPlatformBadgeColor } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { exportToCsv } from '../../utils/excelExport';
import { useTranslation } from '../../../../../contexts/I18nContext';

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
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('Perlu Diproses');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">{t('seller.allOrders')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            {t('seller.ordersSubtitle')}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Export Daftar Pesanan ke Excel/CSV"
          >
            <Download className="w-4 h-4" />
            <span>{t('seller.exportExcel')}</span>
          </button>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            Total {orders.length} Pesanan Sync
          </span>
        </div>
      </div>

      {/* Main Orders Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        {/* Status Tabs Header */}
        <div className="border-b border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveStatusTab('Semua')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'Semua'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {i18n?.language === 'en' ? 'All' : 'Semua'} ({orders.length})
          </button>

          {statusOptions.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const displayStatus = st === 'Perlu Diproses' ? (i18n?.language === 'en' ? 'Needs Process' : 'Perlu Diproses') : st === 'Dikirim' ? (i18n?.language === 'en' ? 'Shipped' : 'Dikirim') : st === 'Selesai' ? (i18n?.language === 'en' ? 'Completed' : 'Selesai') : st === 'Dibatalkan' ? (i18n?.language === 'en' ? 'Canceled' : 'Dibatalkan') : st;
            return (
              <button
                key={st}
                onClick={() => setActiveStatusTab(st)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeStatusTab === st
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{displayStatus}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  st === 'Perlu Diproses' ? 'bg-amber-100 text-amber-800 font-extrabold' : 'bg-slate-200/70 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters Bar: Search & Marketplace */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('seller.searchOrder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">{i18n?.language === 'en' ? 'All E-Commerce Platforms' : 'Semua Platform E-Commerce'}</option>
              <option value="Shopee">Shopee</option>
              <option value="Tokopedia">Tokopedia</option>
              <option value="TikTok Shop">TikTok Shop</option>
              <option value="Lazada">Lazada</option>
            </select>
          </div>
        </div>

        {/* Orders List / Table */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-y border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'ORDER & TIME' : 'PESANAN & WAKTU'}</th>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'CUSTOMER & ADDRESS' : 'PEMBELI & ALAMAT'}</th>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'PRODUCTS' : 'PRODUK'}</th>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'SHIPPING' : 'PENGIRIMAN'}</th>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'STATUS' : 'STATUS'}</th>
                <th className="px-4 py-3 font-semibold text-center">{i18n?.language === 'en' ? 'ACTION' : 'AKSI'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 text-center text-slate-400">
                      <Package className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
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
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold w-fit ${badge.bg} ${badge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {ord.platform}
                          </span>
                          <span className="font-mono font-semibold text-xs text-slate-800 dark:text-slate-100">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {ord.orderDate}</span>
                        </div>
                      </td>

                      {/* Pembeli */}
                      <td className="px-4 py-4 align-top whitespace-normal min-w-[180px] max-w-[220px]">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                          {ord.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ord.customerPhone}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2" title={ord.address}>
                          {ord.address}
                        </p>
                      </td>

                      {/* Produk */}
                      <td className="px-4 py-4 align-top whitespace-normal min-w-[220px]">
                        <div className="space-y-2">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              {it.image && (
                                <img src={it.image} alt={it.productName} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate" title={it.productName}>
                                  {it.productName}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {it.quantity}x @ {formatIDR(it.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center font-semibold text-xs text-slate-800 dark:text-slate-100">
                            <span>{i18n?.language === 'en' ? 'Total Amount' : 'Total Bayar'}</span>
                            <span>{formatIDR(ord.totalAmount)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Pengiriman */}
                      <td className="px-4 py-4 align-top">
                        <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                          {ord.courier}
                        </div>
                        {ord.trackingNumber && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-500">{ord.trackingNumber}</span>
                            <button
                              onClick={() => handleCopyTracking(ord.trackingNumber!)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
                              title="Salin Resi"
                            >
                              {copiedId === ord.trackingNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 align-top">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold flex w-fit ${
                          ord.status === 'Perlu Diproses'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : ord.status === 'Dalam Pengiriman'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : ord.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {ord.status === 'Perlu Diproses' ? (i18n?.language === 'en' ? 'Needs Process' : 'Perlu Diproses') : ord.status === 'Dalam Pengiriman' ? (i18n?.language === 'en' ? 'Shipped' : 'Dalam Pengiriman') : ord.status === 'Selesai' ? (i18n?.language === 'en' ? 'Completed' : 'Selesai') : ord.status}
                        </span>
                        {ord.isPrintedAWB && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 w-fit px-1.5 py-0.5 rounded">
                            <Printer className="w-3 h-3" />
                            <span>{i18n?.language === 'en' ? 'Printed' : 'Dicetak'}</span>
                          </div>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-4 align-top text-center">
                        <button
                          onClick={() => onPrintAwb(ord)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer w-full whitespace-nowrap"
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
    </div>
  );
};
