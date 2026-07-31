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
    return 'Rp ' + Number(num).toLocaleString('id-ID');
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Pendapatan</span>
            </div>
            <div>
              <p className="text-2xl text-slate-900 leading-tight font-semibold">
                {loading ? '...' : formatRp(summary.total_sales)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Total kotor dari transaksi mesin kasir (POS).</p>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                <TrendingDown size={18} />
              </div>
              <span className="text-sm font-medium text-slate-500">Total Pengeluaran</span>
            </div>
            <div>
              <p className="text-2xl text-rose-600 leading-tight font-semibold">
                {loading ? '...' : formatRp(summary.total_expenses)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Total seluruh catatan pengeluaran manual.</p>
            </div>
          </div>

          {/* Profit Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                <Wallet size={18} />
              </div>
              <span className="text-sm font-medium text-slate-500">Laba Bersih (Profit)</span>
            </div>
            <div>
              <p className={`text-2xl leading-tight font-semibold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                {loading ? '...' : formatRp(summary.profit)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Pendapatan dikurangi Pengeluaran.</p>
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
