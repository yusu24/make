import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Tag,
  ArrowUpDown,
  Building2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Expense, ExpenseCategory, StoreChannel } from '../../types';
import { formatIDR } from '../../utils/formatters';
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

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpenseClick: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  stores: StoreChannel[];
  selectedStoreId: string;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpenseClick,
  onEditExpense,
  onDeleteExpense,
  stores,
  selectedStoreId,
}) => {
  const { user } = useAuth();
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('Semua Tanggal');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Buku-Kas-Pengeluaran-Ecommerce-${new Date().toISOString().split('T')[0]}`,
  });

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Search term
      const matchesSearch =
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || exp.category === selectedCategory;

      // Store filter
      const matchesStore =
        selectedStoreId === 'all' ||
        exp.storeId === 'all' ||
        exp.storeId === selectedStoreId;

      return matchesSearch && matchesCategory && matchesStore;
    });
  }, [expenses, searchTerm, selectedCategory, selectedStoreId]);

  // Calculate totals
  const totalExpensesAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const adsExpenseAmount = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.category === 'Iklan & Marketing')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const packingExpenseAmount = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.category === 'Packing & Bahan')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Pagination
  const totalItems = filteredExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Bento Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Pengeluaran */}
        <div className="bg-white dark:bg-[#101828] p-6 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              {t('seller.expenses')}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#101828] dark:text-white mt-3">
            {formatIDR(totalExpensesAmount)}
          </div>
          <div className="text-[11px] text-[#667085] mt-2 flex items-center gap-1">
            <span>Filter: {selectedDateFilter}</span>
          </div>
        </div>

        {/* Biaya Iklan & Ads */}
        <div className="bg-white dark:bg-[#101828] p-6 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Iklan & Marketing
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#101828] dark:text-white mt-3">
            {formatIDR(adsExpenseAmount)}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
            Shopee Ads & TikTok Affiliate
          </div>
        </div>

        {/* Packing & Bahan */}
        <div className="bg-white dark:bg-[#101828] p-6 rounded-[28px] border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Packing & Bahan
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#101828] dark:text-white mt-3">
            {formatIDR(packingExpenseAmount)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
            Bubble wrap, lakban, packaging
          </div>
        </div>

        {/* Catatan Efisiensi Profit Solid Bento Card */}
        <div className="bg-indigo-600 p-6 rounded-[28px] text-white shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
              ANALISIS MARGIN NETTO
            </div>
            <div className="text-lg font-extrabold mt-1">Biaya Iklan Terkendali</div>
            <p className="text-xs text-indigo-100/90 mt-1 leading-snug">
              12.4% dari omset harian. Profitabilitas bisnis sehat!
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Main Expense Table Container */}
      <div className="bg-white dark:bg-[#101828] rounded-[32px] border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
          {/* + Tambah Pengeluaran Button */}
          <button
            onClick={onAddExpenseClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Pengeluaran</span>
          </button>

          {/* Cetak / Export PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Export PDF</span>
          </button>

          {/* Search Box */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="Iklan & Marketing">Iklan & Marketing</option>
              <option value="Biaya Admin Marketplace">Biaya Admin Marketplace</option>
              <option value="Packing & Bahan">Packing & Bahan</option>
              <option value="Gaji & Operasional">Gaji & Operasional</option>
              <option value="Logistik & Ongkir">Logistik & Ongkir</option>
              <option value="Sewa & Utilitas">Sewa & Utilitas</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          {/* Date Selector Dropdown */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 px-3 py-2 rounded-xl shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Semua Tanggal">Semua Tanggal</option>
              <option value="Hari Ini">Hari Ini</option>
              <option value="7 Hari Terakhir">7 Hari Terakhir</option>
              <option value="Bulan Ini">Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">TANGGAL</th>
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4">KETERANGAN</th>
                <th className="py-3 px-4">NOMINAL</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Tidak ada data pengeluaran ditemukan
                      </span>
                      <span className="text-xs text-slate-400">
                        Coba ubah kata kunci pencarian atau buat pengeluaran baru.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    {/* Tanggal */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {exp.date}
                    </td>

                    {/* Kategori */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                        {exp.category}
                      </span>
                    </td>

                    {/* Keterangan & Store Tag */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {exp.description}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {exp.storeName || 'Semua Toko'} • {exp.paymentMethod}
                        </span>
                      </div>
                    </td>

                    {/* Nominal */}
                    <td className="py-3.5 px-4 font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {formatIDR(exp.amount)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          title="Edit Pengeluaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar - EXACT MATCH TO SCREENSHOT */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-700 flex flex-row flex-nowrap whitespace-nowrap items-center justify-between gap-3 text-xs text-slate-500 w-full overflow-x-auto">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>
            -
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {Math.min(currentPage * pageSize, totalItems)}
            </span>{' '}
            dari <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> data
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Dropdown */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === pg
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE EXPENSE ACCOUNTING REPORT                        */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Toko Online */}
          <SellerPrintHeader
            user={user}
            title="Buku Kas Pengeluaran Toko Online"
            subtitle="Rekapitulasi Arus Kas Keluar, Beban Iklan & Biaya Operasional Multi-Channel"
            periodText={`Filter: ${selectedDateFilter} • Kategori: ${selectedCategory === 'all' ? 'Semua Kategori' : selectedCategory}`}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader title="I. Ringkasan Kas Pengeluaran Operasional Toko" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI PENGELUARAN KAS
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Volume Transaksi Pengeluaran Dicatat</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>{filteredExpenses.length} Transaksi</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Alokasi Beban Iklan & Marketing (Ads Top-up)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(adsExpenseAmount)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Alokasi Packing, Dus & Bahan Pembungkus</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(packingExpenseAmount)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    TOTAL BEBAN KAS KELUAR (TOTAL CASH OUTFLOW)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    100.0%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalExpensesAmount)})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader 
              title="II. Buku Register Transaksi Pengeluaran Kas (Expense Ledger)" 
              rightText={`Total ${filteredExpenses.length} item pengeluaran`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 90, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 140, fontWeight: 600 }}>Kategori Beban</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan & Rincian Pengeluaran</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 160, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Keluar / Outflow (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e, idx) => (
                  <tr key={e.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{e.category}</td>
                    <td style={{ padding: '6px 6px', color: '#000000' }}>{e.description || '-'}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      ({formatRp(e.amount)})
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Pengeluaran:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalExpensesAmount)})
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <SellerPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN PANDUAN PENGENDALIAN BIAYA TOKO ONLINE */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <SellerPrintAppendixHeader 
              title="Lampiran: Panduan & Pengendalian Biaya Operasional E-Commerce"
              subtitle={`Standar Efisiensi Belanja Iklan, Packing & Rekonsiliasi Nota Kas — ${user?.tenant_name || 'Toko Online'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <SellerPrintExplanationBox
                number="1"
                title="Tata Kelola Kas Operasional Toko Online"
                desc="Setiap pengeluaran kas kecil (pembelian bubble wrap, solasi, biaya kurir pick-up khusus) wajib diinput bersama foto struk atau bukti transfer."
                variant="default"
              />

              <SellerPrintExplanationBox
                number="2"
                title="Pengendalian Biaya Iklan (Shopee / TikTok Ads)"
                desc="Top-up saldo iklan wajib dimonitor setiap hari melalui perbandingan nilai ROAS (Return On Ad Spend) dan konversi order aktual."
                formula="Batas Aman Biaya Iklan: Maksimal 10% - 15% dari total omzet penjualan kotor"
                variant="emerald"
              />

              <SellerPrintExplanationBox
                number="3"
                title="Optimalisasi Bahan Packing & Perlengkapan Gudang"
                desc="Pembelian kardus packing, plastik polymailer, dan lakban dalam jumlah grosir (bulk purchase) untuk menekan biaya kemasan per paket kiriman."
                variant="indigo"
              />

              <SellerPrintExplanationBox
                number="4"
                title="Alokasi Upah Packing & Admin Customer Service"
                desc="Biaya tenaga kerja pemrosesan pesanan dicatat secara konsisten setiap periode penggajian untuk mencerminkan HPP layanan yang akurat."
                variant="rose"
              />

              <SellerPrintExplanationBox
                number="5"
                title="Audit Bukti Transaksi & Rekonsiliasi Bank"
                desc="Pencocokan berkala antara total kas keluar di sistem dengan mutasi rekening bank operasional toko online."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
