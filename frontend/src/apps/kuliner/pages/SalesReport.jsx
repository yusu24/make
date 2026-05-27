import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      // For now using the orders endpoint as a base for sales report
      const response = await api.get('/kuliner/admin/orders');
      const orders = response.data;
      
      const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total || 0), 0);
      const totalOrders = orders.length;
      
      setSales(orders);
      setCurrentPage(1); // Reset page on data load
      setSummary({
        totalSales,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
      });
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const currentSales = sales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Laporan Penjualan</h1>
        <div className="kd-topbar-actions">
          <button className="kd-btn kd-btn-secondary" onClick={fetchSalesReport}>↻ Segarkan Data</button>
          <button className="kd-btn kd-btn-primary" onClick={() => window.print()}>💾 Cetak Laporan</button>
        </div>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memproses data laporan..." />
        ) : (
          <>
            {/* PRINT HEADER */}
            <div className="print-only" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #000' }}>
              <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#000' }}>Laporan Penjualan - Dapur Nusantara</h2>
              <p style={{ margin: '4px 0', fontSize: 14, color: '#333' }}>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* SUMMARY CARDS */}
        <div className="kd-ledger-grid" style={{ marginBottom: 32 }}>
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
            <div className="text-[10px] text-slate-400 mt-2">Efisiensi penjualan per meja</div>
          </div>
        </div>

        <div className="kd-panel">
          <div className="kd-panel-header no-print">
            <div className="text-sm font-bold text-slate-800">Riwayat Transaksi Terakhir</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="kd-form-select" style={{ padding: '4px 12px', fontSize: 11, width: 'auto' }}>
                <option>Hari Ini</option>
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
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
                {sales.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada transaksi yang tercatat.</td></tr>
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
                Menampilkan <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, sales.length)}</span> dari <span className="font-bold text-slate-700">{sales.length}</span> transaksi
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
                {sales.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: 16, textAlign: 'center' }}>Tidak ada transaksi.</td></tr>
                ) : (
                  sales.map(order => (
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
