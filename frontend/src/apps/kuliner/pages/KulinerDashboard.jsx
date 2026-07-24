import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

import { useAuth } from '../../../contexts/AuthContext';

const KulinerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(n));
  };

  const revenueChange = (() => {
    const today = Number(stats?.revenue_today || 0);
    const yesterday = Number(stats?.revenue_yesterday || 0);
    if (yesterday === 0) return today > 0 ? { label: 'Naik dari Rp 0 kemarin', up: true } : { label: 'Belum ada pendapatan', up: null };
    const pct = ((today - yesterday) / yesterday) * 100;
    return { label: `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}% dari kemarin`, up: pct >= 0 };
  })();

  const timeAgo = (dateStr) => {
    const diffMin = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    return `${Math.round(diffHour / 24)} hari yang lalu`;
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Dashboard Overview</h1>
        <div className="kd-topbar-actions" />
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Menyiapkan Dapur..." />
        ) : (
          <>
            {/* STATS */}
            <div className="kd-stats-grid">
              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-revenue">💰</div>
                  <span className="kd-stat-label">Pendapatan Hari Ini</span>
                </div>
                <div className="kd-stat-value">{formatRp(stats?.revenue_today)}</div>
                <div className={`kd-stat-change ${revenueChange.up === false ? 'kd-change-down' : 'kd-change-up'}`}>{revenueChange.label}</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-orders">📦</div>
                  <span className="kd-stat-label">Pesanan Hari Ini</span>
                </div>
                <div className="kd-stat-value">{stats?.orders_today || 0}</div>
                <div className="kd-stat-change kd-change-up">↑ {stats?.orders_today || 0} pesanan baru</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-menu">📊</div>
                  <span className="kd-stat-label">Pendapatan Bulan Ini</span>
                </div>
                <div className="kd-stat-value">{formatRp(stats?.revenue_month)}</div>
                <div className="kd-stat-change kd-change-up">Trend positif bulan ini</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-users">📈</div>
                  <span className="kd-stat-label">Total Pesanan</span>
                </div>
                <div className="kd-stat-value">{stats?.total_orders || 0}</div>
                <div className="kd-stat-change kd-change-up">Seluruh periode</div>
              </div>
            </div>

            {/* PHASE 4: ADDITIONAL WIDGETS */}
            <div className="kd-stats-grid" style={{ marginTop: 16 }}>
              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-revenue">📈</div>
                  <span className="kd-stat-label">Profit Hari Ini</span>
                </div>
                <div className="kd-stat-value">{formatRp(stats?.profit_today)}</div>
                <div className="kd-stat-change" style={{ color: '#94a3b8' }}>Estimasi: pendapatan − HPP − beban</div>
              </div>
              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-menu">🏆</div>
                  <span className="kd-stat-label">Menu Terlaris (30 hari)</span>
                </div>
                <div className="kd-stat-value" style={{ fontSize: 18 }}>{stats?.top_menu || '-'}</div>
              </div>
              <div className="kd-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/kuliner/admin/kitchen-queue')}>
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-orders">👨‍🍳</div>
                  <span className="kd-stat-label">Kitchen Queue Aktif</span>
                </div>
                <div className="kd-stat-value">{stats?.kitchen_queue_count || 0}</div>
                <div className="kd-stat-change" style={{ color: '#94a3b8' }}>Klik untuk lihat papan dapur →</div>
              </div>
              <div className="kd-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/kuliner/admin/ingredients')}>
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-users">⚠️</div>
                  <span className="kd-stat-label">Bahan Baku Hampir Habis</span>
                </div>
                <div className="kd-stat-value">{stats?.low_stock_ingredients?.length || 0}</div>
                <div className="kd-stat-change" style={{ color: '#94a3b8' }}>
                  {(stats?.low_stock_ingredients || []).slice(0, 3).map((i) => i.name).join(', ') || 'Semua stok aman'}
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="kd-quick-actions">
              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/categories')}>
                <div className="kd-action-icon kd-ai-add">➕</div>
                <div className="kd-action-text">
                  <h4>Tambah Menu Baru</h4>
                  <p>Upload menu dan atur harga</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/categories')}>
                <div className="kd-action-icon kd-ai-edit">🏷️</div>
                <div className="kd-action-text">
                  <h4>Kelola Kategori</h4>
                  <p>Edit & atur kategori menu</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/promos')}>
                <div className="kd-action-icon kd-ai-design">🎨</div>
                <div className="kd-action-text">
                  <h4>Kelola Promo</h4>
                  <p>Buat & atur kode promo</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/reports')}>
                <div className="kd-action-icon kd-ai-finance">📊</div>
                <div className="kd-action-text">
                  <h4>Laporan Keuangan</h4>
                  <p>Lihat & cetak laporan penjualan</p>
                </div>
              </button>
            </div>

            <div className="kd-panels">
              <div className="kd-panel">
                <div className="kd-panel-header">
                  <h3 className="kd-panel-title">Pesanan Terbaru</h3>
                  <button className="kd-panel-action" onClick={() => navigate('/kuliner/admin/orders')}>Lihat semua →</button>
                </div>
                <div className="kd-table-container">
                  <table className="kd-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Pelanggan</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recent_orders?.map((order) => (
                        <tr key={order.id}>
                          <td><span className="font-bold text-[#b48c36]">{order.order_number}</span></td>
                          <td>
                            <div className="kd-menu-name">{order.customer_name}</div>
                            <div className="text-[11px] text-slate-400">{order.customer_phone}</div>
                          </td>
                          <td>{formatRp(order.total_amount)}</td>
                          <td><span className="kd-status-badge kd-status-draft">{order.status}</span></td>
                          <td>{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                      {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-slate-400">Belum ada pesanan masuk.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="kd-panel">
                <div className="kd-panel-header">
                  <h3 className="kd-panel-title">Aktivitas Terkini</h3>
                </div>
                <div className="kd-activity-list">
                  {(stats?.recent_orders || []).slice(0, 3).map((order) => (
                    <div className="kd-activity-item" key={order.id}>
                      <div className="kd-activity-icon kd-act-order">📦</div>
                      <div className="kd-activity-content">
                        <h4>Pesanan dari {order.customer_name}</h4>
                        <p>{formatRp(order.total_amount)} · {timeAgo(order.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {stats?.top_menu && (
                    <div className="kd-activity-item">
                      <div className="kd-activity-icon kd-act-menu">🍛</div>
                      <div className="kd-activity-content">
                        <h4>Menu Terlaris</h4>
                        <p>{stats.top_menu} (30 hari terakhir)</p>
                      </div>
                    </div>
                  )}
                  {(stats?.low_stock_ingredients || []).length > 0 && (
                    <div className="kd-activity-item">
                      <div className="kd-activity-icon kd-act-review">⚠️</div>
                      <div className="kd-activity-content">
                        <h4>Bahan Baku Menipis</h4>
                        <p>{stats.low_stock_ingredients.slice(0, 3).map((i) => i.name).join(', ')}</p>
                      </div>
                    </div>
                  )}
                  {(!stats?.recent_orders || stats.recent_orders.length === 0) && !stats?.top_menu && (stats?.low_stock_ingredients || []).length === 0 && (
                    <div className="kd-activity-item">
                      <div className="kd-activity-content">
                        <p style={{ color: '#94a3b8' }}>Belum ada aktivitas untuk ditampilkan.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </KulinerAdminLayout>
  );
};

export default KulinerDashboard;