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
    <tr key={item.id}>
      <td className="text-xs text-slate-500">
        {new Date(item.date).toLocaleDateString('id-ID')}
      </td>
      <td>
        <div style={{ color: '#1e293b', fontWeight: 500 }}>{item.category}</div>
      </td>
      <td>
        <div className="text-xs text-slate-600">{item.description}</div>
      </td>
      <td className="text-slate-800" style={{ fontWeight: 600, color: '#000', textAlign: 'right' }}>
        {item.type === 'income' ? formatRp(item.amount) : '-'}
      </td>
      <td className="text-slate-800" style={{ fontWeight: 600, color: '#000', textAlign: 'right' }}>
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
              <div className="kd-ledger-grid no-print" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div className="kd-panel">
                  <div className="text-sm font-bold text-slate-800 mb-4 text-center">Komposisi Pemasukan vs Pengeluaran</div>
                  <div style={{ height: 250, width: '100%' }}>
                    {overviewData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={overviewData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                            {overviewData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => formatRp(val)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">Tidak ada data</div>
                    )}
                  </div>
                </div>
                
                <div className="kd-panel">
                  <div className="text-sm font-bold text-slate-800 mb-4 text-center">Rincian Pengeluaran</div>
                  <div style={{ height: 250, width: '100%' }}>
                    {expenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                            {expenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val) => formatRp(val)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">Tidak ada pengeluaran</div>
                    )}
                  </div>
                </div>
              </div>

              {/* LEDGER TABLE */}
              <div className="kd-panel no-print" style={{ marginBottom: 24 }}>
                <div className="kd-panel-header">
                  <div className="text-sm font-bold text-slate-800">
                    Rincian Transaksi
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Menampilkan {ledger.length} transaksi
                  </div>
                </div>

                <div className="kd-table-container">
                  <table className="kd-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                        <th style={{ textAlign: 'right' }}>Pendapatan</th>
                        <th style={{ textAlign: 'right' }}>Pengeluaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-10 text-slate-400">Tidak ada transaksi pada periode ini.</td></tr>
                      ) : (
                        renderLedgerRows(paginatedData)
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div style={{ padding: '0 24px 16px' }}>
                  <ClientPagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={pageSize}
                    setItemsPerPage={setPageSize}
                    totalPages={totalPages}
                    totalItems={totalItems}
                  />
                </div>
              </div>

              {/* PRINT ONLY TABLE - TEMPLATE LABA RUGI */}
              <div className="print-only w-full">
                {/* Print Wrapper */}
                <div
                  id="financial-report-sheet"
                  className="w-full text-slate-900 font-sans"
                >
                    {/* HEADER LAPORAN (JENIS LAPORAN -> NAMA PERUSAHAAN -> PERIODE / ALAMAT / MATA UANG) */}
                    <div className="text-center mb-4 leading-tight">
                      <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900 print:text-black">
                        Laporan Laba Rugi (P&L Summary)
                      </h2>
                      <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-900 print:text-black">
                        {user?.tenant_name || 'Toko Kuliner'}
                      </h1>
                      <p className="text-xs font-semibold text-slate-800 print:text-black mt-1">
                        Periode: {formatDate(startDate)} - {formatDate(endDate)}
                      </p>
                    </div>

                    {/* TABEL FINANSIAL */}
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-y-2 border-slate-900 print:border-black text-sm uppercase font-bold text-slate-900 print:text-black bg-slate-50 print:bg-transparent">
                            <th className="py-2 px-2 text-left">Uraian / Pos Laporan</th>
                            <th className="py-2 px-2 text-right w-36">Periode Ini</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                            <td className="py-2 px-2 text-slate-800 print:text-black font-semibold">
                              (+) Total Omset Kotor Penjualan (Revenue)
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-800 print:text-black w-36">
                              {formatRp(summary.total_sales || 0)}
                            </td>
                          </tr>
                          
                          <tr className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                            <td className="py-2 px-2 text-slate-800 print:text-black font-semibold">
                              (-) Estimasi HPP / Cost of Goods Sold (Resep)
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-800 print:text-black w-36">
                              -{formatRp(summary.total_cogs || 0)}
                            </td>
                          </tr>

                          <tr className="font-bold text-sm bg-slate-100/70 print:bg-transparent">
                            <td className="py-2 px-2 text-slate-900 print:text-black uppercase">
                              (=) Laba Kotor (Gross Profit)
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-900 print:text-black border-t border-slate-900 print:border-black font-extrabold">
                              {formatRp(summary.gross_profit || 0)}
                            </td>
                          </tr>

                          <tr className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                            <td className="py-2 px-2 text-slate-800 print:text-black font-semibold">
                              (-) Total Pengeluaran Operasional (Beban)
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-800 print:text-black w-36">
                              -{formatRp(summary.total_expenses || 0)}
                            </td>
                          </tr>

                          <tr className="font-bold text-sm">
                            <td className="py-2 px-2 text-slate-900 print:text-black uppercase pt-4">
                              (=) LABA BERSIH (NET PROFIT)
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-slate-900 print:text-black border-t-2 border-slate-900 print:border-black font-extrabold pt-4" style={{ borderBottom: '3px double #000' }}>
                              {formatRp(summary.profit || 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* FOOTER INFORMASI STANDAR */}
                    <div className="mt-8 text-center text-[10px] text-slate-400 print:text-black italic border-t border-slate-100 print:border-slate-300 pt-2">
                      Dokumen ini dicetak secara otomatis melalui Sistem Manajemen UMKM.
                    </div>
                  </div>
                </div>
            </div>
          </>
        )}
      </div>
    </KulinerAdminLayout>
  )
}
