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
  const [activeModal, setActiveModal] = useState(null);

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

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <KulinerAdminLayout>
      {loading ? (
        <KulinerLoading message="Menyiapkan Dapur..." />
      ) : (
        <>
          <div className="kd-topbar">
            <h1 className="kd-page-title">Dashboard Overview</h1>
            <div className="kd-topbar-actions">
              {/* Notifications and Profile moved to sidebar */}
            </div>
          </div>

          <div className="kd-content">
            {/* STATS */}
            <div className="kd-stats-grid">
              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <span className="kd-stat-label">Pendapatan Hari Ini</span>
                  <div className="kd-stat-icon kd-icon-revenue">💰</div>
                </div>
                <div className="kd-stat-value">{formatRp(stats?.revenue_today)}</div>
                <div className="kd-stat-change kd-change-up">↑ 12.5% dari kemarin</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <span className="kd-stat-label">Pesanan Hari Ini</span>
                  <div className="kd-stat-icon kd-icon-orders">📦</div>
                </div>
                <div className="kd-stat-value">{stats?.orders_today || 0}</div>
                <div className="kd-stat-change kd-change-up">↑ {stats?.orders_today || 0} pesanan baru</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <span className="kd-stat-label">Pendapatan Bulan Ini</span>
                  <div className="kd-stat-icon kd-icon-menu">📊</div>
                </div>
                <div className="kd-stat-value">{formatRp(stats?.revenue_month)}</div>
                <div className="kd-stat-change kd-change-up">Trend positif bulan ini</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <span className="kd-stat-label">Total Pesanan</span>
                  <div className="kd-stat-icon kd-icon-users">📈</div>
                </div>
                <div className="kd-stat-value">{stats?.total_orders || 0}</div>
                <div className="kd-stat-change kd-change-up">Seluruh periode</div>
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

              <button className="kd-action-btn" onClick={() => openModal('flyer')}>
                <div className="kd-action-icon kd-ai-design">🎨</div>
                <div className="kd-action-text">
                  <h4>Buat Flyer Promo</h4>
                  <p>Desain banner & promosi</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => openModal('finance')}>
                <div className="kd-action-icon kd-ai-finance">📊</div>
                <div className="kd-action-text">
                  <h4>Laporan Keuangan</h4>
                  <p>Lihat & export data</p>
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
                  <div className="kd-activity-item">
                    <div className="kd-activity-icon kd-act-order">📦</div>
                    <div className="kd-activity-content">
                      <h4>Pesanan baru masuk</h4>
                      <p>Sistem otomatis memproses</p>
                    </div>
                  </div>
                  <div className="kd-activity-item">
                    <div className="kd-activity-icon kd-act-menu">🍛</div>
                    <div className="kd-activity-content">
                      <h4>Menu Terlaris</h4>
                      <p>Rendang Padang naik 12%</p>
                    </div>
                  </div>
                  <div className="kd-activity-item">
                    <div className="kd-activity-icon kd-act-review">⭐</div>
                    <div className="kd-activity-content">
                      <h4>Review Pelanggan</h4>
                      <p>Rata-rata 4.8 bintang</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FLYER MODAL */}
          {activeModal === 'flyer' && (
            <div className="kd-modal-overlay visible" onClick={closeModal}>
              <div className="kd-modal" onClick={e => e.stopPropagation()}>
                <div className="kd-modal-header">
                  <h2 className="kd-modal-title">Buat Flyer Promo</h2>
                  <button className="kd-close-btn" onClick={closeModal}>×</button>
                </div>
                <div className="kd-modal-body">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Judul Promo</label>
                    <input type="text" className="kd-form-input" placeholder="Diskon Weekend 20%" />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Upload Desain Flyer</label>
                    <div className="kd-upload-area">
                      <div className="kd-upload-icon">🎨</div>
                      <div className="kd-upload-text">Upload gambar flyer (JPG, PNG max 2MB)</div>
                    </div>
                  </div>
                </div>
                <div className="kd-modal-footer">
                  <button className="kd-btn kd-btn-secondary" onClick={closeModal}>Batal</button>
                  <button className="kd-btn kd-btn-primary">Publikasikan Promo</button>
                </div>
              </div>
            </div>
          )}

          {/* FINANCE MODAL */}
          {activeModal === 'finance' && (
            <div className="kd-modal-overlay visible" onClick={closeModal}>
              <div className="kd-modal" onClick={e => e.stopPropagation()}>
                <div className="kd-modal-header">
                  <h2 className="kd-modal-title">Laporan Keuangan</h2>
                  <button className="kd-close-btn" onClick={closeModal}>×</button>
                </div>
                <div className="kd-modal-body">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Periode Laporan</label>
                    <select className="kd-form-select">
                      <option>Bulan Ini</option>
                      <option>Bulan Lalu</option>
                    </select>
                  </div>
                </div>
                <div className="kd-modal-footer">
                  <button className="kd-btn kd-btn-secondary" onClick={closeModal}>Tutup</button>
                  <button className="kd-btn kd-btn-primary">Download Laporan</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </KulinerAdminLayout>
  );
};

export default KulinerDashboard;
