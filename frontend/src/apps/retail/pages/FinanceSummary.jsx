import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { BarChart2, TrendingUp, TrendingDown, Wallet, Calendar, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { useAuth } from '../../../contexts/AuthContext';
import '../retail-print.css';
import './FinanceSummary.css';

export default function FinanceSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ total_sales: 0, total_expenses: 0, profit: 0 });
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  // Default filter: Bulan Ini
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState('month'); // month, today, custom
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchSummary = async (start, end) => {
    setLoading(true);
    try {
      const res = await api.get(`/retail/finance/summary?startDate=${start}&endDate=${end}`);
      setSummary(res.data);
      const ledgerRes = await api.get(`/retail/finance/ledger?startDate=${start}&endDate=${end}`);
      setLedger(ledgerRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(startDate, endDate);
  }, [startDate, endDate]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);
    
    const t = new Date();
    if (val === 'today') {
      const td = t.toISOString().split('T')[0];
      setStartDate(td);
      setEndDate(td);
    } else if (val === 'month') {
      const fd = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
      const ld = new Date(t.getFullYear(), t.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(fd);
      setEndDate(ld);
    }
    // if custom, user will use the date picker inputs
  };

  const formatRp = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Keuangan-${startDate}_${endDate}`,
  });

  const isProfit = summary.profit >= 0;

  const renderLedgerRows = (items) => items.map(item => (
    <tr key={item.id}>
      <td className="pl-6 text-sm">{new Date(item.date).toLocaleString('id-ID')}</td>
      <td className="text-sm">{item.description}</td>
      <td className="text-right text-emerald-600 font-medium text-sm">
        {item.type === 'income' ? formatRp(item.amount) : '-'}
      </td>
      <td className="pr-6 text-right text-rose-600 font-medium text-sm">
        {item.type === 'expense' ? formatRp(item.amount) : '-'}
      </td>
    </tr>
  ));

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(ledger);

  return (
    <div className="finance-summary animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint} disabled={loading}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      {/* Filter Section */}
      <div className="card card-pad no-print" style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} className="retail-text-secondary" />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--retail-text-primary)' }}>Periode:</span>
        </div>
        <select className="form-input" style={{ width: 'auto' }} value={dateFilter} onChange={handleFilterChange}>
          <option value="today">Hari Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="custom">Pilih Rentang Tanggal...</option>
        </select>

        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>-</span>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}
      </div>

      <div ref={printRef} className="finance-print-area">
        {/* Print-only header */}
        <div className="print-only retail-print-header">
          <h2>Laporan Keuangan</h2>
          <p>{user?.tenant_name || 'Toko'}</p>
          <p>Periode: {formatDate(startDate)} &ndash; {formatDate(endDate)}</p>
        </div>

        {/* Net Profit Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden mb-6 mt-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                ESTIMASI PROFIT BERSIH (NET PROFIT)
              </span>
              <div className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">{loading ? '...' : formatRp(summary.profit)}</div>
              <p className="text-xs text-emerald-100/80 mt-1">
                Sudah dipotong seluruh HPP barang, diskon, & pengeluaran operasional terdaftar.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
              <span className="text-xs text-emerald-200 font-semibold uppercase block">NET MARGIN RATE</span>
              <div className="text-3xl font-black text-emerald-300 mt-1">{loading ? '...' : `${((summary.total_sales || 0) + (summary.total_discounts || 0)) > 0 ? ((summary.profit / ((summary.total_sales || 0) + (summary.total_discounts || 0))) * 100).toFixed(1) : '0'}%`}</div>
              <span className="text-[10px] text-white/80">Kategori Bisnis Sehat</span>
            </div>
          </div>
        </div>

        {/* Profit & Loss Waterfall Breakdown Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
          <div className="p-4 bg-slate-50 border-b border-slate-200/80">
            <h3 className="text-sm font-semibold text-slate-800">
              Rincian Komponen Laba Rugi (P&L Summary)
            </h3>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl font-semibold text-sm text-slate-800">
              <span>(+) Total Omset Kotor (Gross Revenue)</span>
              <span className="text-emerald-600">{loading ? '...' : formatRp((summary.total_sales || 0) + (summary.total_discounts || 0))}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-rose-50/40 rounded-xl text-xs font-semibold text-slate-700">
              <span>(-) Total Diskon Penjualan</span>
              <span className="text-rose-600">-{loading ? '...' : formatRp(summary.total_discounts || 0)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-rose-50/40 rounded-xl text-xs font-semibold text-slate-700">
              <span>(-) Total HPP / Modal Awal Produk</span>
              <span className="text-rose-600">-{loading ? '...' : formatRp(summary.total_cogs || 0)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl font-bold text-sm text-emerald-800 border border-emerald-100">
              <span>(=) Laba Kotor (Gross Profit)</span>
              <span>{loading ? '...' : formatRp(summary.gross_profit || 0)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700">
              <span>(+) Pemasukan Tambahan (Manual)</span>
              <span className="text-emerald-600">+{loading ? '...' : formatRp(summary.total_incomes || 0)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-rose-50/40 rounded-xl text-xs font-semibold text-slate-700">
              <span>(-) Pengeluaran Operasional (Beban)</span>
              <span className="text-rose-600">-{loading ? '...' : formatRp(summary.total_expenses || 0)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl font-black text-base text-white mt-2 shadow-inner">
              <span>(=) Laba Bersih (Net Profit)</span>
              <span className="text-emerald-400">{loading ? '...' : formatRp(summary.profit || 0)}</span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="card table-wrap animate-fade-in mt-6">
          <div className="toolbar-no-stack" style={{ padding: '16px 20px', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--retail-text-primary)' }}>Rincian Transaksi Laba Rugi</h3>
          </div>
          {/* Screen view: paginated */}
          <div className="retail-table-responsive no-print">
            <table className="table">
              <thead>
                <tr>
                  <th className="pl-6 retail-table-header">Tanggal</th>
                  <th className="retail-table-header">Keterangan</th>
                  <th className="retail-table-header text-right">Pendapatan</th>
                  <th className="pr-6 retail-table-header text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-4 text-slate-500">Memuat rincian...</td></tr>
                ) : ledger.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-500">Tidak ada transaksi pada periode ini.</td></tr>
                ) : renderLedgerRows(paginatedData)}
              </tbody>
            </table>
          </div>
          <div className="no-print">
            <RetailPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>

          {/* Print/PDF view: full ledger, not paginated */}
          <div className="retail-table-responsive print-only">
            <table className="table">
              <thead>
                <tr>
                  <th className="pl-6 retail-table-header">Tanggal</th>
                  <th className="retail-table-header">Keterangan</th>
                  <th className="retail-table-header text-right">Pendapatan</th>
                  <th className="pr-6 retail-table-header text-right">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-500">Tidak ada transaksi pada periode ini.</td></tr>
                ) : renderLedgerRows(ledger)}
              </tbody>
              <tfoot className="retail-print-totals">
                <tr>
                  <td className="pl-6 text-sm font-semibold" colSpan={2}>Total</td>
                  <td className="text-right text-emerald-600 font-semibold text-sm">{formatRp(summary.total_sales)}</td>
                  <td className="pr-6 text-right text-rose-600 font-semibold text-sm">{formatRp(summary.total_expenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
