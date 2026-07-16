import React, { useState, useEffect, useMemo } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import KulinerLoading from '../components/KulinerLoading';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import './KulinerDashboard.css';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Date filter: 'today' | 'week' | 'month' | 'all'
  const [dateFilter, setDateFilter] = useState('today');

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

  const formatRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

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
    let day = 'Tidak ada data';
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
    let month = 'Tidak ada data';
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
        <h1 className="kd-page-title">Laporan Penjualan</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memproses data laporan..." />
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
                    {filter === 'today' ? 'Hari Ini' : filter === 'week' ? '7 Hari Terakhir' : filter === 'month' ? 'Bulan Ini' : 'Semua'}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="kd-btn kd-btn-secondary" onClick={fetchSalesReport}>↻ Segarkan Data</button>
                <button className="kd-btn kd-btn-primary" onClick={() => window.print()}>💾 Cetak Laporan</button>
              </div>
            </div>

            {/* PRINT HEADER */}
            <div className="print-only" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #000' }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#000' }}>Laporan Penjualan - Dapur Nusantara</h2>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#333' }}>
                Periode: {dateFilter === 'today' ? 'Hari Ini' : dateFilter === 'week' ? '7 Hari Terakhir' : dateFilter === 'month' ? 'Bulan Ini' : 'Semua'}
              </p>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#333' }}>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* SUMMARY CARDS */}
            <div className="kd-ledger-grid" style={{ marginBottom: 24 }}>
              <div className="kd-panel" style={{ borderLeft: '4px solid #b48c36' }}>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Pendapatan</div>
                <div className="text-2xl font-black text-slate-800">{formatRp(summary.totalSales)}</div>
                <div className="text-[10px] text-slate-400 mt-2">Performa periode ini</div>
              </div>
              <div className="kd-panel" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Total Pesanan</div>
                <div className="text-2xl font-black text-slate-800">{summary.totalOrders} <span className="text-sm font-normal text-slate-400">Pesanan</span></div>
                <div className="text-[10px] text-slate-400 mt-2">Terhitung dari semua channel</div>
              </div>
              <div className="kd-panel" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Rata-rata Per Pesanan</div>
                <div className="text-2xl font-black text-slate-800">{formatRp(summary.avgOrderValue)}</div>
                <div className="text-[10px] text-slate-400 mt-2">Efisiensi penjualan per transaksi</div>
              </div>
            </div>

            {/* CHARTS CONTAINER */}
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
              
              {/* Daily Chart (Day of Week Traffic) */}
              <div className="kd-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>📊 Trafik Penjualan Harian</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Analisis hari teramai dalam satu minggu.</p>
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
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${v/1000000}jt` : v >= 1000 ? `${v/1000}rb` : v} />
                      <Tooltip formatter={(value) => [formatRp(value), 'Pendapatan']} labelStyle={{ fontWeight: 'bold' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="total" stroke="#b48c36" strokeWidth={2} fillOpacity={1} fill="url(#colorDaily)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 10, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hari Teramai:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                    {busiestDay.amount > 0 ? `${busiestDay.day} (${formatRp(busiestDay.amount)})` : 'Tidak ada data'}
                  </span>
                </div>
              </div>

              {/* Monthly Chart (Yearly Context) */}
              <div className="kd-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>📈 Perbandingan Penjualan Bulanan</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Tren pendapatan kumulatif dari bulan ke bulan.</p>
                </div>
                
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${v/1000000}jt` : v >= 1000 ? `${v/1000}rb` : v} />
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
                  <span style={{ color: 'var(--text-secondary)' }}>Bulan Teramai:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                    {busiestMonth.amount > 0 ? `${busiestMonth.month} (${formatRp(busiestMonth.amount)})` : 'Tidak ada data'}
                  </span>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="kd-panel">
              <div className="kd-panel-header no-print">
                <div className="text-sm font-bold text-slate-800">
                  Detail Transaksi Periode Ini
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  Menampilkan {filteredSales.length} transaksi
                </div>
              </div>

              <div className="kd-table-container no-print">
                <table className="kd-table">
                  <thead>
                    <tr>
                      <th>ID Order</th>
                      <th>Pelanggan</th>
                      <th>Tanggal</th>
                      <th>Metode</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada transaksi pada periode ini.</td></tr>
                    ) : (
                      currentSales.map(order => (
                        <tr key={order.id}>
                          <td className="font-mono text-xs text-slate-400">#ORD-{order.id.toString().padStart(5, '0')}</td>
                          <td>
                            <div className="font-bold text-slate-700">{order.customer_name}</div>
                            <div className="text-[10px] text-slate-400">{order.order_type === 'dine_in' ? 'Makan di Tempat' : 'Bawa Pulang'}</div>
                          </td>
                          <td className="text-xs text-slate-500">
                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded uppercase text-slate-500">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="font-bold text-slate-800">{formatRp(order.total)}</td>
                          <td>
                            <span className={`kd-status-badge ${order.status === 'completed' || order.status === 'processing' ? 'kd-status-active' : 'kd-status-hidden'}`}>
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
              {totalPages > 1 && (
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                  <span className="text-xs text-slate-500">
                    Menampilkan <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> dari <span className="font-bold text-slate-700">{filteredSales.length}</span> transaksi
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="kd-btn kd-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: 11 }}
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      &laquo; Sebelumnya
                    </button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[...Array(totalPages)].map((_, idx) => (
                        <button 
                          key={idx}
                          className={`kd-btn ${currentPage === idx + 1 ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                          style={{ padding: '6px 12px', fontSize: 11, minWidth: 32 }}
                          onClick={() => handlePageChange(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      className="kd-btn kd-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: 11 }}
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Selanjutnya &raquo;
                    </button>
                  </div>
                </div>
              )}

              {/* PRINT ONLY TABLE (ALL ITEMS) */}
              <div className="print-only">
                <h3 style={{ fontSize: 18, marginTop: 24, marginBottom: 12, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>Detail Transaksi</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '2px solid #000', padding: '8px 4px', textAlign: 'left' }}>ID Order</th>
                      <th style={{ borderBottom: '2px solid #000', padding: '8px 4px', textAlign: 'left' }}>Pelanggan</th>
                      <th style={{ borderBottom: '2px solid #000', padding: '8px 4px', textAlign: 'left' }}>Tipe</th>
                      <th style={{ borderBottom: '2px solid #000', padding: '8px 4px', textAlign: 'left' }}>Metode</th>
                      <th style={{ borderBottom: '2px solid #000', padding: '8px 4px', textAlign: 'left' }}>Tanggal</th>
                      <th style={{ borderBottom: '2px solid #000', padding: '8px 4px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: 16, textAlign: 'center' }}>Tidak ada transaksi.</td></tr>
                    ) : (
                      filteredSales.map(order => (
                        <tr key={`print-${order.id}`}>
                          <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 4px' }}>#ORD-{order.id.toString().padStart(5, '0')}</td>
                          <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 4px', fontWeight: 'bold' }}>{order.customer_name}</td>
                          <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 4px' }}>{order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}</td>
                          <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 4px' }}>{order.payment_method}</td>
                          <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 4px' }}>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                          <td style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 4px', textAlign: 'right', fontWeight: 'bold' }}>{formatRp(order.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        )}
      </div>
    </KulinerAdminLayout>
  );
};

export default SalesReport;
