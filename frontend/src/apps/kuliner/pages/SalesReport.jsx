import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import api from '../../../services/api';
import './KulinerDashboard.css';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Laporan Penjualan</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau performa bisnis dan pertumbuhan pendapatan Anda.</p>
        </div>
        <div className="kd-topbar-actions">
          <button className="kd-btn kd-btn-secondary" onClick={fetchSalesReport}>↻ Segarkan Data</button>
          <button className="kd-btn kd-btn-primary">💾 Cetak Laporan</button>
        </div>
      </div>

      <div className="kd-content">
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
          <div className="kd-panel-header">
            <div className="text-sm font-bold text-slate-800">Riwayat Transaksi Terakhir</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="kd-form-select" style={{ padding: '4px 12px', fontSize: 11, width: 'auto' }}>
                <option>Hari Ini</option>
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
            </div>
          </div>

          <div className="kd-table-container">
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
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10">Memproses data laporan...</td></tr>
                ) : sales.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada transaksi yang tercatat.</td></tr>
                ) : (
                  sales.map(order => (
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
        </div>
      </div>
    </KulinerAdminLayout>
  );
};

export default SalesReport;
