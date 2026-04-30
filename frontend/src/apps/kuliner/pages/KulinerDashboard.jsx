import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import './CategoryStorefront.css';

const KulinerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/kuliner/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (n) => {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
  };

  if (loading) return <div className="kl-loading">Memuat Dashboard...</div>;

  return (
    <div className="kl-admin-dashboard" style={{ background: '#fdfaf5', minHeight: '100vh' }}>
      {/* Admin Sidebar/Header */}
      <div className="kl-admin-nav" style={{ background: '#fff', padding: '20px 48px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="kl-logo">Admin <em>Dapur Nusantara</em></div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/kuliner" className="kl-btn-ghost" style={{ fontSize: 13 }}>Lihat Storefront</Link>
          <Link to="/kuliner/admin/settings" className="kl-btn-ghost" style={{ fontSize: 13 }}>Pengaturan Toko</Link>
          <Link to="/kuliner/admin/categories" className="kl-btn-ghost" style={{ fontSize: 13 }}>Kategori Menu</Link>
        </div>
      </div>

      <div style={{ padding: '48px' }}>
        <div className="kl-section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28 }}>Dashboard <em>Keuangan</em></h2>
          <p>Pantau performa penjualan dan pesanan toko Anda secara real-time.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
          <div className="kl-stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Pendapatan Hari Ini</p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{formatRp(stats?.revenue_today)}</h3>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Total dari {stats?.orders_today} pesanan</p>
          </div>
          <div className="kl-stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Pendapatan Bulan Ini</p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#b48c36' }}>{formatRp(stats?.revenue_month)}</h3>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Bulan {new Date().toLocaleString('id-ID', {month: 'long'})}</p>
          </div>
          <div className="kl-stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Total Pesanan</p>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>{stats?.total_orders}</h3>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Semua waktu</p>
          </div>
          <div className="kl-stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Status Sistem</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%' }}></div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>Aktif</h3>
            </div>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 14 }}>Database Connected</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22 }}>Pesanan <em>Terbaru</em></h3>
            <button className="kl-btn-ghost" style={{ fontSize: 13 }}>Lihat Semua Pesanan</button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '16px', color: '#888', fontSize: 13, fontWeight: 600 }}>ORDER ID</th>
                <th style={{ padding: '16px', color: '#888', fontSize: 13, fontWeight: 600 }}>PELANGGAN</th>
                <th style={{ padding: '16px', color: '#888', fontSize: 13, fontWeight: 600 }}>TIPE</th>
                <th style={{ padding: '16px', color: '#888', fontSize: 13, fontWeight: 600 }}>TOTAL</th>
                <th style={{ padding: '16px', color: '#888', fontSize: 13, fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '16px', color: '#888', fontSize: 13, fontWeight: 600 }}>WAKTU</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_orders?.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #fafafa' }}>
                  <td style={{ padding: '20px 16px', fontSize: 14, fontWeight: 700, color: '#b48c36' }}>{order.order_number}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer_name}</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>{order.customer_phone}</div>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: '100px', background: order.order_type === 'dine_in' ? '#eff6ff' : '#f0fdf4', color: order.order_type === 'dine_in' ? '#3b82f6' : '#10b981', fontWeight: 700 }}>
                      {order.order_type === 'dine_in' ? 'Dine In' : 'Take Away'}
                      {order.table_number && ` (${order.table_number})`}
                    </span>
                  </td>
                  <td style={{ padding: '20px 16px', fontSize: 14, fontWeight: 700 }}>{formatRp(order.total_amount)}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: '100px', background: '#fef3c7', color: '#d97706', fontWeight: 700 }}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 16px', fontSize: 13, color: '#888' }}>
                    {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {stats?.recent_orders?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
              <p>Belum ada pesanan masuk.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KulinerDashboard;
