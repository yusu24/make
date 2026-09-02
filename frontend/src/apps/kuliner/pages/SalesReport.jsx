import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../../contexts/I18nContext';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import ClientPagination from '../components/ClientPagination';
import KulinerLoading from '../components/KulinerLoading';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
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

const SalesReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Date filter: 'today' | 'week' | 'month' | 'all'
  const [dateFilter, setDateFilter] = useState('today');
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Penjualan-Kuliner-${new Date().toISOString().split('T')[0]}`,
    pageStyle: "@page { size: A4; margin: 1cm !important; }",
  });

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kuliner/admin/orders');
      setSales(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const formatRp = (n) => `Rp ${Math.round(Number(n || 0)).toLocaleString('id-ID')}`;

  // Filtered orders based on active dateFilter
  const filteredSales = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return sales.filter(order => {
      const orderDate = new Date(order.created_at);
      
      if (dateFilter === 'today') {
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        return orderDay.getTime() === todayStart.getTime();
      }
      
      if (dateFilter === 'week') {
        const oneWeekAgo = new Date(todayStart);
        oneWeekAgo.setDate(todayStart.getDate() - 6); // Includes today + 6 previous days = 7 days total
        return orderDate >= oneWeekAgo;
      }
      
      if (dateFilter === 'month') {
        // Current calendar month (from 1st day of this month)
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return orderDate >= startOfMonth;
      }
      
      return true; // 'all'
    });
  }, [sales, dateFilter]);

  // Aggregate stats based on FILTERED sales
  const summary = useMemo(() => {
    const totalSales = filteredSales.reduce((acc, order) => acc + parseFloat(order.total || 0), 0);
    const totalOrders = filteredSales.length;
    return {
      totalSales,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    };
  }, [filteredSales]);

  // --- Chart 1: Sales by Day of the Week (Busy Days Analysis) ---
  const dayNameMapping = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dailyChartData = useMemo(() => {
    // Initialize empty days
    const dayTotals = dayNameMapping.map((name) => ({ name, total: 0, orders: 0 }));
    
    filteredSales.forEach(order => {
      const d = new Date(order.created_at);
      const dayIndex = d.getDay();
      dayTotals[dayIndex].total += parseFloat(order.total || 0);
      dayTotals[dayIndex].orders += 1;
    });

    // Reorder so it starts on Monday (Senin) instead of Sunday (Minggu)
    const sunday = dayTotals.shift();
    dayTotals.push(sunday);

    return dayTotals;
  }, [filteredSales]);

  // Find the busiest day
  const busiestDay = useMemo(() => {
    let max = -1;
    let day = t('kulinerSales.noData') || 'Tidak ada data';
    dailyChartData.forEach(item => {
      if (item.total > max && item.orders > 0) {
        max = item.total;
        day = item.name;
      }
    });
    return { day, amount: max };
  }, [dailyChartData]);

  // --- Chart 2: Sales by Month of the Year (Busy Months Analysis) ---
  const monthNameMapping = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const monthlyChartData = useMemo(() => {
    const monthlyTotals = monthNameMapping.map((name) => ({ name, total: 0, orders: 0 }));
    
    // Process all sales (or filtered, but all sales is better for yearly context)
    sales.forEach(order => {
      const d = new Date(order.created_at);
      const monthIndex = d.getMonth();
      monthlyTotals[monthIndex].total += parseFloat(order.total || 0);
      monthlyTotals[monthIndex].orders += 1;
    });

    return monthlyTotals;
  }, [sales]);

  // Find the busiest month
  const busiestMonth = useMemo(() => {
    let max = -1;
    let month = t('kulinerSales.noData') || 'Tidak ada data';
    monthlyChartData.forEach(item => {
      if (item.total > max && item.orders > 0) {
        max = item.total;
        month = item.name;
      }
    });
    return { month, amount: max };
  }, [monthlyChartData]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = useMemo(() => {
    return filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredSales, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerSales.title') || 'Laporan Penjualan'}</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message={t('kulinerSales.loading') || 'Memproses data laporan...'} />
        ) : (
          <>
            {/* Action Bar */}
            <div className="kd-page-actions no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Periode:</span>
                {['today', 'week', 'month', 'all'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => { setDateFilter(filter); setCurrentPage(1); }}
                    className={`kd-btn kd-btn-sm ${dateFilter === filter ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                    style={{ textTransform: 'capitalize', fontSize: 11, padding: '6px 12px' }}
                  >
                    {filter === 'today' ? t('kulinerSales.filterToday') || 'Hari Ini' : filter === 'week' ? t('kulinerSales.filterWeek') || '7 Hari Terakhir' : filter === 'month' ? t('kulinerSales.filterMonth') || 'Bulan Ini' : t('kulinerSales.filterAll') || 'Semua'}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="kd-btn kd-btn-secondary" onClick={fetchSalesReport}>↻ Segarkan Data</button>
                <button className="kd-btn kd-btn-primary" onClick={handlePrint}>💾 Cetak Laporan</button>
              </div>
            </div>

            <div ref={printRef}>

            {/* SUMMARY CARDS */}
            <div className="kd-ledger-grid no-print" style={{ marginBottom: 24 }}>
              <div className="kd-panel" style={{ borderLeft: '4px solid #b48c36' }}>
                <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2">{t('kulinerSales.summaryTotalSales') || 'Total Pendapatan'}</div>
                <div className="text-2xl font-black text-slate-800">{formatRp(summary.totalSales)}</div>
                <div className="text-[10px] text-slate-400 mt-2">Performa periode ini</div>
              </div>
              <div className="kd-panel" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2">{t('kulinerSales.summaryTotalOrders') || 'Total Pesanan'}</div>
                <div className="text-2xl font-black text-slate-800">{summary.totalOrders} <span className="text-sm font-normal text-slate-400">Pesanan</span></div>
                <div className="text-[10px] text-slate-400 mt-2">Terhitung dari semua channel</div>
              </div>
              <div className="kd-panel" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="text-xs text-slate-900 font-bold uppercase tracking-wider mb-2">{t('kulinerSales.summaryAvgOrder') || 'Rata-rata Per Pesanan'}</div>
                <div className="text-2xl font-black text-slate-800">{formatRp(summary.avgOrderValue)}</div>
                <div className="text-[10px] text-slate-400 mt-2">Efisiensi penjualan per transaksi</div>
              </div>
            </div>

            {/* CHARTS CONTAINER */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
              
              {/* Daily Chart (Day of Week Traffic) */}
              <div className="kd-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>📊 {t('kulinerSales.chartDailyTitle') || 'Trafik Penjualan Harian'}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{t('kulinerSales.chartDailySub') || 'Analisis hari teramai dalam satu minggu.'}</p>
                </div>
                
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b48c36" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#b48c36" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis width={70} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${v/1000000}jt` : v >= 1000 ? `${v/1000}rb` : v} />
                      <Tooltip formatter={(value) => [formatRp(value), 'Pendapatan']} labelStyle={{ fontWeight: 'bold' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="total" stroke="#b48c36" strokeWidth={2} fillOpacity={1} fill="url(#colorDaily)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('kulinerSales.busiestDay') || 'Hari Teramai:'}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                    {busiestDay.amount > 0 ? `${busiestDay.day} (${formatRp(busiestDay.amount)})` : 'Tidak ada data'}
                  </span>
                </div>
              </div>

              {/* Monthly Chart (Yearly Context) */}
              <div className="kd-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>📈 {t('kulinerSales.chartMonthlyTitle') || 'Perbandingan Penjualan Bulanan'}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{t('kulinerSales.chartMonthlySub') || 'Tren pendapatan kumulatif dari bulan ke bulan.'}</p>
                </div>
                
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis width={70} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${v/1000000}jt` : v >= 1000 ? `${v/1000}rb` : v} />
                      <Tooltip formatter={(value) => [formatRp(value), 'Pendapatan']} labelStyle={{ fontWeight: 'bold' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {monthlyChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === busiestMonth.month && entry.total > 0 ? '#b48c36' : 'rgba(180, 140, 54, 0.35)'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('kulinerSales.busiestMonth') || 'Bulan Teramai:'}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                    {busiestMonth.amount > 0 ? `${busiestMonth.month} (${formatRp(busiestMonth.amount)})` : t('kulinerSales.noData') || 'Tidak ada data'}
                  </span>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="no-print" style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginTop: 20 }}>
              <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {t('kulinerSales.headerOrderId') || 'Order ID'}
                      </th>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {t('kulinerSales.headerCustomer') || 'Pelanggan'}
                      </th>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        Tipe Pesanan
                      </th>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {t('kulinerSales.headerDate') || 'Tanggal'}
                      </th>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        Metode
                      </th>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {t('kulinerSales.headerTotal') || 'Total'}
                      </th>
                      <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                          {t('kulinerSales.emptyHistory') || 'Belum ada transaksi pada periode ini.'}
                        </td>
                      </tr>
                    ) : (
                      currentSales.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                          <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 600 }}>
                              #ORD-{order.id.toString().padStart(5, '0')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {order.customer_name}
                          </td>
                          <td style={{ padding: '12px 18px', color: '#475569', whiteSpace: 'nowrap' }}>
                            {order.order_type === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}
                          </td>
                          <td style={{ padding: '12px 18px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: 10.5, padding: '3px 8px', background: '#F1F5F9', borderRadius: 6, textTransform: 'uppercase', color: '#475569', fontWeight: 600 }}>
                              {order.payment_method}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                            {formatRp(order.total)}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              borderRadius: 20,
                              fontSize: 11.5,
                              fontWeight: 600,
                              background: order.status === 'completed' ? '#DCFCE7' : (order.status === 'processing' ? '#FEF3C7' : '#F1F5F9'),
                              color: order.status === 'completed' ? '#166534' : (order.status === 'processing' ? '#92400E' : '#475569')
                            }}>
                              {order.status === 'completed' ? 'Selesai' : (order.status === 'processing' ? 'Diproses' : 'Pending')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* PAGINATION */}
              <ClientPagination 
                setItemsPerPage={setItemsPerPage} 
                currentPage={currentPage}
                setCurrentPage={handlePageChange}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredSales.length}
              />
            </div>

              {/* ========================================================================= */}
              {/* PRINT-ONLY FORMAL ACCOUNTING SALES REPORT TEMPLATE                       */}
              {/* ========================================================================= */}
              <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
                
                {/* 1. Header / Kop Laporan Resmi Kuliner */}
                <KulinerPrintHeader
                  user={user}
                  title="Laporan Penjualan Kasir"
                  subtitle="Rekapitulasi Transaksi Pemesanan Makanan & Minuman (POS Sales Register)"
                  periodText={dateFilter === 'today' ? 'Hari Ini' : dateFilter === 'week' ? '7 Hari Terakhir' : dateFilter === 'month' ? 'Bulan Ini' : 'Semua Periode'}
                />

                {/* 2. Formal Summary Table (Horizontal Borders Only) */}
                <div style={{ marginBottom: 22 }}>
                  <KulinerPrintSectionHeader title="I. Ringkasan Kinerja Penjualan Restoran (Sales Performance)" />

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                          A. AKUMULASI PENDAPATAN & VOLUME TRANSAKSI POS
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Volume Pesanan Masuk (Order Count)</td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>{summary.totalOrders} Pesanan</td>
                        <td style={{ width: 140 }}></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Rata-rata Nilai per Pesanan (Average Basket Size / Meja)</td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                          {formatRp(summary.avgOrderValue)}
                        </td>
                        <td></td>
                      </tr>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                        <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>TOTAL OMZET PENJUALAN KULINER TERCATAT</td>
                        <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                          {filteredSales.length} Faktur / Pesanan
                        </td>
                        <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatRp(summary.totalSales)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
                <div style={{ marginBottom: 22 }}>
                  <KulinerPrintSectionHeader 
                    title="II. Buku Register Transaksi Penjualan Restoran (Sales Invoice Register)" 
                    rightText={`Total ${filteredSales.length} pesanan terbit`} 
                  />

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                    <thead>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                        <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>ID Order</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>Waktu Pesanan</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Pelanggan</th>
                        <th style={{ padding: '7px 6px', textAlign: 'center', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Layanan</th>
                        <th style={{ padding: '7px 6px', textAlign: 'right', width: 140, fontWeight: 600, whiteSpace: 'nowrap' }}>Total Nilai (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                            Tidak ada catatan penjualan pada periode yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        filteredSales.map((order, idx) => (
                          <tr key={`print-${order.id}`} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                            <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>#ORD-{String(order.id).padStart(5, '0')}</td>
                            <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{formatDateIndo(order.created_at)}</td>
                            <td style={{ padding: '6px 6px', color: '#000000' }}>{order.customer_name || 'Pelanggan Umum (Walk-in)'}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'center', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                              {order.order_type === 'dine_in' ? 'Dine In (Meja)' : 'Takeaway (Bungkus)'}
                            </td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                              {formatRp(order.total)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                        <td colSpan={5} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                          Total Rekapitulasi Omzet Penjualan:
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatRp(summary.totalSales)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
                <KulinerPrintFooter user={user} showSignatures={true} />

                {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & METODOLOGI PENJUALAN KULINER */}
                <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
                  <KulinerPrintAppendixHeader 
                    title="Lampiran: Penjelasan & Analisis Penjualan Restoran"
                    subtitle={`Keterangan Metodologi Rekonsiliasi Kasir & Performa Penjualan F&B — ${user?.tenant_name || 'Restoran & Kafe'}`}
                    user={user}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                    <KulinerPrintExplanationBox
                      number="1"
                      title="Metodologi Pencatatan Omzet Penjualan (Revenue Recognition)"
                      desc="Seluruh pesanan makanan dan minuman diakui sebagai omzet penjualan sah saat transaksi kasir telah berstatus Lunas (dibayar tunai, QRIS, transfer bank, atau kartu debit/kredit)."
                      variant="default"
                    />

                    <KulinerPrintExplanationBox
                      number="2"
                      title="Rata-rata Nilai Transaksi per Meja (Average Basket Size)"
                      desc="Indikator seberapa besar nilai rata-rata belanja yang dihabiskan oleh setiap kelompok pelanggan atau meja saat berkunjung ke restoran."
                      formula="Rumus: Basket Size = Total Omzet Penjualan ÷ Total Jumlah Pesanan"
                      variant="emerald"
                    />

                    <KulinerPrintExplanationBox
                      number="3"
                      title="Segmentasi Layanan Dine-in vs Takeaway"
                      desc="Pemisahan pesanan yang dikonsumsi langsung di restoran (mempengaruhi pemakaian ruang & servis) dibanding pesanan bawa pulang (mempengaruhi biaya kemasan & plastik)."
                      variant="indigo"
                    />

                    <KulinerPrintExplanationBox
                      number="4"
                      title="Rekonsiliasi Kas Kasir vs Pembayaran Digital"
                      desc="Total omzet pada laporan ini merupakan gabungan kas fisik di laci kasir dan mutasi rekening bank digital (QRIS/EDC) yang wajib dicocokkan setiap tutup shift."
                      variant="rose"
                    />

                    <KulinerPrintExplanationBox
                      number="5"
                      title="Analisis Waktu Ramai Restoran (Peak Hours)"
                      desc="Data historis penjualan digunakan untuk memprediksi kebutuhan stok bahan baku dan penjadwalan staf pada hari dan jam sibuk operasional restoran."
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
};

export default SalesReport;
