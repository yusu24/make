import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { TrendingUp, TrendingDown, Wallet, Calendar, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import usePagination from '../../../hooks/usePagination';
import ClientPagination from '../components/ClientPagination';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import { useAuth } from '../../../contexts/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './KulinerDashboard.css';
import '../kuliner-print.css';
import {
  KulinerPrintHeader,
  KulinerPrintSectionHeader,
  KulinerPrintAppendixHeader,
  KulinerPrintExplanationBox,
  KulinerPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/KulinerPrintLayout';

export default function KulinerFinanceSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ total_sales: 0, total_expenses: 0, profit: 0 });
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  // Default filter: Bulan Ini
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState('month'); 
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchSummary = async (start, end) => {
    setLoading(true);
    try {
      const res = await api.get(`/kuliner/admin/finance/summary?startDate=${start}&endDate=${end}`);
      setSummary(res.data);
      const ledgerRes = await api.get(`/kuliner/admin/ledger?startDate=${start}&endDate=${end}`);
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
  };

  const formatRp = (num) => `Rp ${Math.round(Number(num || 0)).toLocaleString('id-ID')}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Laba-Rugi-Kuliner-${startDate}_${endDate}`,
    pageStyle: "@page { size: A4; margin: 1cm !important; }",
  });

  const isProfit = summary.profit >= 0;

  const renderLedgerRows = (items) => items.map(item => (
    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
      <td style={{ padding: '12px 18px', fontSize: 12.5, color: '#64748B', whiteSpace: 'nowrap' }}>
        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
        <span style={{ 
          background: item.type === 'income' ? '#DCFCE7' : '#F1F5F9', 
          color: item.type === 'income' ? '#166534' : '#475569', 
          padding: '3px 10px', 
          borderRadius: 20, 
          fontSize: 11.5, 
          fontWeight: 600, 
          display: 'inline-block' 
        }}>
          {item.category}
        </span>
      </td>
      <td style={{ padding: '12px 18px', color: '#0F172A', fontWeight: 500 }}>
        {item.description}
      </td>
      <td style={{ padding: '12px 18px', color: '#16A34A', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {item.type === 'income' ? formatRp(item.amount) : '-'}
      </td>
      <td style={{ padding: '12px 18px', color: '#DC2626', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
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

  // Kalkulasi kategori Laba Rugi untuk Grafik
  const groupByCategory = (items) => {
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'Lainnya';
      acc[cat] = (acc[cat] || 0) + Number(item.amount);
      return acc;
    }, {});
    
    return Object.keys(grouped).map(key => ({
      category: key,
      amount: grouped[key]
    })).sort((a, b) => b.amount - a.amount);
  };

  const overviewData = [
    { name: 'Omset Penjualan', value: Number(summary.total_sales) || 0, color: '#10b981' },
    { name: 'HPP & Pengeluaran', value: (Number(summary.total_cogs) || 0) + (Number(summary.total_expenses) || 0), color: '#ef4444' }
  ].filter(d => d.value > 0);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#3b82f6', '#8b5cf6', '#ec4899'];
  const expenseData = groupByCategory(ledger.filter(l => l.type === 'expense'))
    .filter(d => d.amount > 0)
    .map((d, i) => ({
      name: d.category,
      value: d.amount,
      color: COLORS[i % COLORS.length]
    }));

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Laporan Laba Rugi</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memproses laporan keuangan..." />
        ) : (
          <>
            {/* Filter Section */}
            <div className="kd-page-actions no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Calendar size={18} color="#64748b" style={{ marginRight: 4 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Periode:</span>
                
                {['today', 'month', 'custom'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                       setDateFilter(filter);
                       if (filter === 'today') {
                         const d = new Date().toISOString().split('T')[0];
                         setStartDate(d); setEndDate(d);
                       } else if (filter === 'month') {
                         const d = new Date();
                         setStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
                         setEndDate(new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]);
                       }
                    }}
                    className={`kd-btn kd-btn-sm ${dateFilter === filter ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 12px' }}
                  >
                    {filter === 'today' ? 'Hari Ini' : filter === 'month' ? 'Bulan Ini' : 'Custom'}
                  </button>
                ))}

                {dateFilter === 'custom' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
                    <input type="date" className="kd-input" style={{ height: 32, padding: '0 8px', fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span style={{ color: '#64748b' }}>-</span>
                    <input type="date" className="kd-input" style={{ height: 32, padding: '0 8px', fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 6, outline: 'none' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="kd-btn kd-btn-primary" onClick={handlePrint} disabled={loading}>
                  <Printer size={16} /> Cetak Laporan
                </button>
              </div>
            </div>

            <div ref={printRef}>
              {/* Net Profit Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden mb-6 mt-4 no-print">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                      ESTIMASI PROFIT BERSIH (NET PROFIT)
                    </span>
                    <div className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">{loading ? '...' : formatRp(summary.profit)}</div>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Sudah dipotong seluruh HPP resep & pengeluaran operasional terdaftar.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
                    <span className="text-xs text-emerald-200 font-semibold uppercase block">NET MARGIN RATE</span>
                    <div className="text-3xl font-black text-emerald-300 mt-1">{loading ? '...' : `${(summary.total_sales || 0) > 0 ? ((summary.profit / (summary.total_sales || 0)) * 100).toFixed(1) : '0'}%`}</div>
                    <span className="text-[10px] text-white/80">Kategori Bisnis Kuliner</span>
                  </div>
                </div>
              </div>

              {/* Profit & Loss Waterfall Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8 no-print">
                <div className="p-4 bg-slate-50 border-b border-slate-200/80">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Rincian Komponen Laba Rugi (P&L Summary)
                  </h3>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl font-semibold text-sm text-slate-800">
                    <span>(+) Total Omset Kotor Penjualan (Revenue)</span>
                    <span className="text-emerald-600">{loading ? '...' : formatRp(summary.total_sales || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-rose-50/40 rounded-xl text-xs font-semibold text-slate-700">
                    <span>(-) Estimasi HPP / Cost of Goods Sold (Resep)</span>
                    <span className="text-rose-600">-{loading ? '...' : formatRp(summary.total_cogs || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl font-bold text-sm text-emerald-800 border border-emerald-100">
                    <span>(=) Laba Kotor (Gross Profit)</span>
                    <span>{loading ? '...' : formatRp(summary.gross_profit || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl font-semibold text-sm text-slate-800">
                    <span>(+) Pemasukan Tambahan (Non-Sales)</span>
                    <span className="text-emerald-600">{loading ? '...' : formatRp(summary.other_income || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-rose-50/40 rounded-xl text-xs font-semibold text-slate-700">
                    <span>(-) Total Pengeluaran Operasional (Beban)</span>
                    <span className="text-rose-600">-{loading ? '...' : formatRp(summary.total_expenses || 0)}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl font-black text-base text-white mt-2 shadow-inner">
                    <span>(=) Laba Bersih (Net Profit)</span>
                    <span className="text-emerald-400">{loading ? '...' : formatRp(summary.profit || 0)}</span>
                  </div>
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="kd-ledger-grid no-print" style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textAlign: 'center' }}>
                    Komposisi Pemasukan vs Pengeluaran
                  </div>
                  <div style={{ height: 300, width: '100%' }}>
                    {overviewData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={overviewData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="45%" 
                            innerRadius={44} 
                            outerRadius={65} 
                            paddingAngle={4}
                          >
                            {overviewData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => formatRp(val)} />
                          <Legend 
                            verticalAlign="bottom" 
                            align="center" 
                            iconType="circle" 
                            iconSize={8} 
                            wrapperStyle={{ paddingTop: 14, fontSize: 11.5, color: '#475569', lineHeight: '20px' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">Tidak ada data</div>
                    )}
                  </div>
                </div>
                
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12, textAlign: 'center' }}>
                    Rincian Pengeluaran
                  </div>
                  <div style={{ height: 300, width: '100%' }}>
                    {expenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={expenseData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="45%" 
                            innerRadius={44} 
                            outerRadius={65} 
                            paddingAngle={4}
                          >
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => formatRp(val)} />
                          <Legend 
                            verticalAlign="bottom" 
                            align="center" 
                            iconType="circle" 
                            iconSize={8} 
                            wrapperStyle={{ paddingTop: 14, fontSize: 11, color: '#475569', lineHeight: '18px' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">Tidak ada pengeluaran</div>
                    )}
                  </div>
                </div>
              </div>

              {/* LEDGER TABLE */}
              <div className="no-print" style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: 24 }}>
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Tanggal</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Kategori</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Keterangan</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' }}>Pendapatan</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' }}>Pengeluaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                            Tidak ada transaksi pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        renderLedgerRows(paginatedData)
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <ClientPagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={pageSize}
                  setItemsPerPage={setPageSize}
                  totalPages={totalPages}
                  totalItems={totalItems}
                />
              </div>

              {/* ========================================================================= */}
              {/* PRINT-ONLY FORMAL ACCOUNTING CULINARY P&L TEMPLATE                       */}
              {/* ========================================================================= */}
              <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
                
                {/* 1. Header / Kop Laporan Resmi Kuliner */}
                <KulinerPrintHeader
                  user={user}
                  title="Laporan Laba Rugi"
                  subtitle="Laporan Kinerja Keuangan & Profitabilitas Restoran / Kafe (Income Statement)"
                  startDate={startDate}
                  endDate={endDate}
                />

                {/* 2. Formal P&L Statement Table (NO VERTICAL LINES, BLACK & WHITE) */}
                <div style={{ marginBottom: 22 }}>
                  <KulinerPrintSectionHeader title="I. Laporan Posisi Laba Rugi (Income Statement Summary)" />

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
                    <tbody>
                      {/* A. PENDAPATAN */}
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                          A. PENDAPATAN OPERASIONAL RESTORAN (REVENUE)
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                          Total Omzet Penjualan Menu Makanan & Minuman (POS Kasir)
                        </td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140 }}>
                          {formatRp(summary.total_sales || 0)}
                        </td>
                        <td style={{ width: 140 }}></td>
                      </tr>
                      <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                          Total Pendapatan Bersih Penjualan
                        </td>
                        <td></td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatRp(summary.total_sales || 0)}
                        </td>
                      </tr>

                      {/* B. HPP */}
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                          B. HARGA POKOK PENJUALAN (HPP / COGS - BAHAN BAKU & RESEP)
                        </td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                          Estimasi Biaya Bahan Baku Resep & Konsumsi Dapur
                        </td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                          ({formatRp(summary.total_cogs || 0)})
                        </td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                          Total HPP Kuliner
                        </td>
                        <td></td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ({formatRp(summary.total_cogs || 0)})
                        </td>
                      </tr>

                      {/* C. LABA KOTOR */}
                      <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                        <td style={{ padding: '6px 4px', color: '#000000' }}>
                          C. LABA KOTOR RESTORAN (GROSS PROFIT)
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                          Gross Margin: {(summary.total_sales || 0) > 0 ? (((summary.gross_profit || (summary.total_sales - summary.total_cogs)) / summary.total_sales) * 100).toFixed(1) : 0}%
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', color: '#000000', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatRp(summary.gross_profit || (summary.total_sales - summary.total_cogs))}
                        </td>
                      </tr>

                      {/* D. BEBAN OPERASIONAL */}
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                          D. BEBAN OPERASIONAL RESTO (OPERATING EXPENSES)
                        </td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                          Biaya Operasional Dapur, Gaji Karyawan, Sewa & Utilitas
                        </td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                          ({formatRp(summary.total_expenses || 0)})
                        </td>
                        <td></td>
                      </tr>
                      <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                          Total Beban Operasional
                        </td>
                        <td></td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ({formatRp(summary.total_expenses || 0)})
                        </td>
                      </tr>

                      {/* E. PENDAPATAN LAIN */}
                      {Number(summary.other_income || 0) > 0 && (
                        <>
                          <tr style={{ borderBottom: '1px solid #000000' }}>
                            <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                              E. PENDAPATAN LAIN-LAIN (NON-OPERASIONAL)
                            </td>
                            <td></td>
                          </tr>
                          <tr style={{ borderBottom: '1.5px solid #000000' }}>
                            <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                              Pemasukan Kas Tambahan Tercatat
                            </td>
                            <td></td>
                            <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              +{formatRp(summary.other_income || 0)}
                            </td>
                          </tr>
                        </>
                      )}

                      {/* F. LABA BERSIH AKHIR */}
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                        <td style={{ padding: '8px 4px', fontSize: 11, color: '#000000' }}>
                          LABA BERSIH PERIODE BERJALAN (NET PROFIT)
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                          Net Margin: {(summary.total_sales || 0) > 0 ? ((summary.profit / summary.total_sales) * 100).toFixed(1) : 0}%
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatRp(summary.profit || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
                <div style={{ marginBottom: 22 }}>
                  <KulinerPrintSectionHeader 
                    title="II. Buku Pembantu Rincian Transaksi Kas Restoran (General Ledger)" 
                    rightText={`Total ${ledger.length} catatan transaksi`} 
                  />

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                    <thead>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                        <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', width: 110, fontWeight: 600 }}>Tanggal</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>Kategori Akun</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan / Deskripsi</th>
                        <th style={{ padding: '7px 6px', textAlign: 'right', width: 135, fontWeight: 600, whiteSpace: 'nowrap' }}>Pemasukan (Rp)</th>
                        <th style={{ padding: '7px 6px', textAlign: 'right', width: 135, fontWeight: 600, whiteSpace: 'nowrap' }}>Pengeluaran (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                            Tidak ada data transaksi kas pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        ledger.map((item, idx) => (
                          <tr key={item.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                            <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{formatDateIndo(item.date)}</td>
                            <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{item.category || '-'}</td>
                            <td style={{ padding: '6px 6px', color: '#374151', fontSize: 9.5 }}>{item.description || '-'}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', fontWeight: item.type === 'income' ? 600 : 400, whiteSpace: 'nowrap' }}>
                              {item.type === 'income' ? formatRp(item.amount) : '-'}
                            </td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', fontWeight: item.type === 'expense' ? 600 : 400, whiteSpace: 'nowrap' }}>
                              {item.type === 'expense' ? formatRp(item.amount) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                        <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                          Total Rekapitulasi Kas:
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          +{formatRp(ledger.filter(l => l.type === 'income').reduce((s, l) => s + Number(l.amount || 0), 0))}
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ({formatRp(ledger.filter(l => l.type === 'expense').reduce((s, l) => s + Number(l.amount || 0), 0))})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
                <KulinerPrintFooter user={user} showSignatures={true} />

                {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & RUMUS PERHITUNGAN LABA RUGI KULINER */}
                <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
                  <KulinerPrintAppendixHeader 
                    title="Lampiran: Penjelasan & Rumus Perhitungan Laba Rugi Kuliner"
                    subtitle={`Keterangan Metodologi Akuntansi & Sumber Data Transaksi F&B — ${user?.tenant_name || 'Restoran & Kafe'}`}
                    user={user}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                    <KulinerPrintExplanationBox
                      number="1"
                      title="Total Omzet Penjualan Menu (Revenue)"
                      desc="Seluruh transaksi pemesanan menu makanan & minuman yang telah dibayar lunas melalui mesin kasir POS (makan di tempat / dine-in, takeaway, maupun pesanan online)."
                      formula="Rumus: Omzet = Σ (Kuantitas Menu Terjual × Harga Jual per Porsi)"
                      variant="default"
                    />

                    <KulinerPrintExplanationBox
                      number="2"
                      title="HPP Resep & Bahan Baku (Food Cost / COGS)"
                      desc="Akumulasi biaya bahan baku yang terpakai untuk memproduksi menu sesuai dengan struktur resep (Bill of Materials) dan takaran bahan dapur."
                      formula="Rumus: HPP = Σ (Pemakaian Gramasi Bahan Baku × Harga Pokok Bahan)"
                      variant="emerald"
                    />

                    <KulinerPrintExplanationBox
                      number="3"
                      title="Laba Kotor Restoran (Gross Profit)"
                      desc="Selisih pendapatan penjualan menu setelah dikurangi total biaya bahan baku resep sebelum dibebani biaya operasional tempat."
                      formula="Rumus: Laba Kotor = Total Omzet Penjualan - Total HPP Bahan Baku"
                      variant="indigo"
                    />

                    <KulinerPrintExplanationBox
                      number="4"
                      title="Beban Operasional Restoran (Operating Expenses)"
                      desc="Seluruh pengeluaran di luar bahan baku, seperti gaji koki & pelayan, gas LPG, listrik, sewa ruko, kemasan makanan, kebersihan dapur, dan pemasaran."
                      variant="rose"
                    />

                    <KulinerPrintExplanationBox
                      number="5"
                      title="Laba Bersih Akhir (Net Profit)"
                      desc="Keuntungan bersih final yang dapat ditarik sebagai dividen pemilik atau dialokasikan untuk ekspansi cabang restoran."
                      formula="Rumus: Laba Bersih = Laba Kotor - Beban Operasional + Pendapatan Lain"
                      variant="dark"
                    />
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </KulinerAdminLayout>
  );
}
