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

  // Kalkulasi kategori Laba Rugi untuk Cetak PDF (Dikelompokkan berdasarkan kategori)
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

  const pendapatan = groupByCategory(ledger.filter(l => l.type === 'income'));
  
  // Asumsi HPP = Bahan Baku
  const hpp = groupByCategory(ledger.filter(l => l.type === 'expense' && l.category === 'Bahan Baku (Pasar/Supplier)'));
  const totalHPP = hpp.reduce((sum, item) => sum + item.amount, 0);
  
  // Beban Operasional = Pengeluaran selain Bahan Baku
  const bebanOperasional = groupByCategory(ledger.filter(l => l.type === 'expense' && l.category !== 'Bahan Baku (Pasar/Supplier)'));
  const totalBebanOp = bebanOperasional.reduce((sum, item) => sum + item.amount, 0);

  const labaKotor = summary.total_sales - totalHPP;
  const labaBersih = summary.profit;

  const overviewData = [
    { name: 'Pemasukan', value: Number(summary.total_sales) || 0, color: '#10b981' },
    { name: 'Pengeluaran', value: Number(summary.total_expenses) || 0, color: '#ef4444' }
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
              {/* SUMMARY CARDS */}
              <div className="kd-ledger-grid no-print" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="kd-panel" style={{ borderLeft: '4px solid #10b981' }}>
                  <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={14} color="#10b981" /> Total Pendapatan
                  </div>
                  <div className="text-xl font-black text-slate-800">{formatRp(summary.total_sales)}</div>
                  <div className="text-[10px] text-slate-400 mt-2">Pemasukan Kas & Penjualan</div>
                </div>

                <div className="kd-panel" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingDown size={14} color="#f59e0b" /> HPP (Cost of Goods)
                  </div>
                  <div className="text-xl font-black text-slate-800" style={{ color: '#f59e0b' }}>{formatRp(totalHPP)}</div>
                  <div className="text-[10px] text-slate-400 mt-2">Bahan Baku & Persediaan</div>
                </div>

                <div className="kd-panel" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wallet size={14} color="#3b82f6" /> Laba Kotor
                  </div>
                  <div className="text-xl font-black text-slate-800" style={{ color: '#3b82f6' }}>{formatRp(labaKotor)}</div>
                  <div className="text-[10px] text-slate-400 mt-2">Pendapatan dikurangi HPP</div>
                </div>

                <div className="kd-panel" style={{ borderLeft: '4px solid #f97316' }}>
                  <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingDown size={14} color="#f97316" /> Beban Operasional
                  </div>
                  <div className="text-xl font-black text-slate-800" style={{ color: '#f97316' }}>{formatRp(totalBebanOp)}</div>
                  <div className="text-[10px] text-slate-400 mt-2">Pengeluaran selain Bahan Baku</div>
                </div>

                <div className="kd-panel" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingDown size={14} color="#ef4444" /> Total Pengeluaran
                  </div>
                  <div className="text-xl font-black text-slate-800" style={{ color: '#ef4444' }}>{formatRp(summary.total_expenses)}</div>
                  <div className="text-[10px] text-slate-400 mt-2">HPP + Beban Operasional</div>
                </div>
                
                <div className="kd-panel" style={{ borderLeft: `4px solid ${isProfit ? '#10b981' : '#ef4444'}` }}>
                  <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wallet size={14} color={isProfit ? '#10b981' : '#ef4444'} /> Laba Bersih
                  </div>
                  <div className="text-xl font-black text-slate-800" style={{ color: isProfit ? '#10b981' : '#ef4444' }}>{formatRp(summary.profit)}</div>
                  <div className="text-[10px] text-slate-400 mt-2">Laba Kotor - Beban Operasional</div>
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
                        Laporan Laba Rugi
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
                          {/* 1. PENDAPATAN OPERASIONAL */}
                          <tr className="font-bold text-sm bg-slate-50/80 print:bg-transparent">
                            <td colSpan="2" className="py-1.5 px-2 text-slate-900 print:text-black uppercase border-t border-slate-200 print:border-black">
                              1. Pendapatan Operasional
                            </td>
                          </tr>
                          {pendapatan.map((item, idx) => (
                            <tr key={`print-inc-${idx}`} className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                              <td className="py-1 px-2 text-slate-800 print:text-black pl-6">
                                {item.category}
                              </td>
                              <td className="py-1 px-2 text-right font-mono text-slate-800 print:text-black w-36">
                                {formatRp(item.amount)}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold text-sm bg-slate-100/70 print:bg-transparent">
                            <td className="py-1.5 px-2 text-slate-900 print:text-black uppercase">
                              Total Pendapatan Bersih
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-slate-900 print:text-black border-t border-slate-900 print:border-black">
                              {formatRp(summary.total_sales)}
                            </td>
                          </tr>

                          {/* 2. HARGA POKOK PENJUALAN */}
                          <tr className="font-bold text-sm bg-slate-50/80 print:bg-transparent">
                            <td colSpan="2" className="py-1.5 px-2 text-slate-900 print:text-black uppercase border-t border-slate-200 print:border-black">
                              2. Beban Pokok Penjualan (HPP)
                            </td>
                          </tr>
                          {hpp.map((item, idx) => (
                            <tr key={`print-hpp-${idx}`} className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                              <td className="py-1 px-2 text-slate-800 print:text-black pl-6">
                                {item.category}
                              </td>
                              <td className="py-1 px-2 text-right font-mono text-slate-800 print:text-black w-36">
                                {formatRp(item.amount)}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold text-sm bg-slate-100/70 print:bg-transparent">
                            <td className="py-1.5 px-2 text-slate-900 print:text-black uppercase">
                              Total Beban Pokok Penjualan
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-slate-900 print:text-black border-t border-slate-900 print:border-black">
                              {formatRp(totalHPP)}
                            </td>
                          </tr>

                          {/* LABA KOTOR */}
                          <tr className="font-bold text-sm bg-slate-100/70 print:bg-transparent">
                            <td className="py-1.5 px-2 text-slate-900 print:text-black uppercase">
                              Laba Kotor
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-slate-900 print:text-black border-t border-slate-900 print:border-black font-extrabold">
                              {formatRp(labaKotor)}
                            </td>
                          </tr>

                          {/* 3. BEBAN OPERASIONAL */}
                          <tr className="font-bold text-sm bg-slate-50/80 print:bg-transparent">
                            <td colSpan="2" className="py-1.5 px-2 text-slate-900 print:text-black uppercase border-t border-slate-200 print:border-black">
                              3. Beban Operasional / Usaha
                            </td>
                          </tr>
                          {bebanOperasional.map((item, idx) => (
                            <tr key={`print-exp-${idx}`} className="hover:bg-slate-50/50 print:hover:bg-transparent text-sm">
                              <td className="py-1 px-2 text-slate-800 print:text-black pl-6">
                                {item.category}
                              </td>
                              <td className="py-1 px-2 text-right font-mono text-slate-800 print:text-black w-36">
                                {formatRp(item.amount)}
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold text-sm bg-slate-100/70 print:bg-transparent">
                            <td className="py-1.5 px-2 text-slate-900 print:text-black uppercase">
                              Total Beban Operasional
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-slate-900 print:text-black border-t border-slate-900 print:border-black">
                              {formatRp(totalBebanOp)}
                            </td>
                          </tr>

                          {/* LABA BERSIH */}
                          <tr className="font-bold text-sm">
                            <td className="py-1.5 px-2 text-slate-900 print:text-black uppercase">
                              LABA BERSIH PERIODE BERJALAN
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-slate-900 print:text-black border-t border-slate-900 print:border-black font-extrabold" style={{ borderBottom: '3px double #000' }}>
                              {formatRp(labaBersih)}
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
