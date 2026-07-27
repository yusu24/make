import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

import { useAuth } from '../../../contexts/AuthContext';

const KulinerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [chartFilter, setChartFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchStats();
  }, [chartFilter]);

  const fetchStats = async () => {
    try {
      if (!stats) setLoading(true);
      let query = `?filter=${chartFilter}`;
      if (chartFilter === 'custom' && customStartDate && customEndDate) {
        query += `&start_date=${customStartDate}&end_date=${customEndDate}`;
      }
      const response = await api.get(`/kuliner/admin/dashboard/stats${query}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      fetchStats();
    }
  };

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(n));
  };

  const revenueChange = (() => {
    const today = Number(stats?.revenue_today || 0);
    const yesterday = Number(stats?.revenue_yesterday || 0);
    if (yesterday === 0) return today > 0 ? { label: t('kulinerDashboard.upFromZero'), up: true } : { label: t('kulinerDashboard.noRevenue'), up: null };
    const pct = ((today - yesterday) / yesterday) * 100;
    return { label: `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}% ${t('kulinerDashboard.fromYesterday')}`, up: pct >= 0 };
  })();

  const getOrderStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'kd-status-draft';
      case 'processing': return 'kd-status-active';
      case 'completed': return 'kd-status-active';
      case 'cancelled': return 'kd-status-hidden';
      default: return '';
    }
  };

  const timeAgo = (dateStr) => {
    const diffMin = Math.max(0, Math.round((Date.now() - new Date(dateStr).getTime()) / 60000));
    if (diffMin < 1) return t('kulinerDashboard.justNow');
    if (diffMin < 60) return `${diffMin} ${t('kulinerDashboard.minutesAgo')}`;
    const diffHour = Math.round(diffMin / 60);
    if (diffHour < 24) return `${diffHour} ${t('kulinerDashboard.hoursAgo')}`;
    return `${Math.round(diffHour / 24)} ${t('kulinerDashboard.daysAgo')}`;
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerDashboard.dashboardOverview')}</h1>
        <div className="kd-topbar-actions" />
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message={t('kulinerDashboard.preparingKitchen')} />
        ) : (
          <>
            {/* STATS */}
            <div className="kd-stats-grid">
              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-revenue">💰</div>
                  <span className="kd-stat-label">{t('kulinerDashboard.todaysRevenue')}</span>
                </div>
                <div className="kd-stat-value">{formatRp(stats?.revenue_today)}</div>
                <div className={`kd-stat-change ${revenueChange.up === false ? 'kd-change-down' : 'kd-change-up'}`}>{revenueChange.label}</div>
              </div>

              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-orders">📦</div>
                  <span className="kd-stat-label">{t('kulinerDashboard.todaysOrders')}</span>
                </div>
                <div className="kd-stat-value">{stats?.orders_today || 0}</div>
                <div className="kd-stat-change kd-change-up">↑ {stats?.orders_today || 0} {t('kulinerDashboard.newOrders')}</div>
              </div>

              {/* REPLACED CARDS HERE */}
              <div className="kd-stat-card">
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-menu">🏆</div>
                  <span className="kd-stat-label">{t('kulinerDashboard.bestSellingMenu')}</span>
                </div>
                <div className="kd-stat-value" style={{ fontSize: 18, marginTop: 4 }}>{stats?.top_menu || '-'}</div>
                <div className="kd-stat-change kd-change-up">{t('kulinerDashboard.positiveTrend')}</div>
              </div>

              <div className="kd-stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/kuliner/admin/ingredients')}>
                <div className="kd-stat-header">
                  <div className="kd-stat-icon kd-icon-users">⚠️</div>
                  <span className="kd-stat-label">{t('kulinerDashboard.lowStockIngredients')}</span>
                </div>
                <div className="kd-stat-value">{stats?.low_stock_ingredients?.length || 0}</div>
                <div className="kd-stat-change" style={{ color: '#94a3b8' }}>
                  {(stats?.low_stock_ingredients || []).slice(0, 3).map((i) => i.name).join(', ') || t('kulinerDashboard.allStockSafe')}
                </div>
              </div>
            </div>

            {/* CHART & WIDGETS */}
            <div className="kd-panels" style={{ gridTemplateColumns: '1fr', marginTop: 16 }}>
              <div className="kd-panel">
                <div className="kd-panel-header" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="kd-panel-title">
                    {t('kulinerDashboard.revenueTrend')} 
                  </h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {chartFilter === 'custom' && (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="date" className="kd-form-input" style={{ padding: '4px 8px', fontSize: 12, height: 'auto', borderRadius: 6 }} value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                        <span style={{ fontSize: 12, color: '#64748b' }}>-</span>
                        <input type="date" className="kd-form-input" style={{ padding: '4px 8px', fontSize: 12, height: 'auto', borderRadius: 6 }} value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
                        <button className="kd-btn-primary" style={{ padding: '4px 8px', fontSize: 12, borderRadius: 6 }} onClick={applyCustomFilter}>Cari</button>
                      </div>
                    )}
                    <select 
                      className="kd-form-input" 
                      style={{ padding: '4px 12px', fontSize: 12, height: 'auto', borderRadius: 6, width: 'auto' }}
                      value={chartFilter}
                      onChange={e => setChartFilter(e.target.value)}
                    >
                      <option value="today">Harian</option>
                      <option value="week">Mingguan</option>
                      <option value="month">Bulanan</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div style={{ height: 260, width: '100%', marginTop: 20 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chart_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b48c36" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#b48c36" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} />
                      <YAxis width={80} tickFormatter={(val) => `Rp ${val / 1000}k`} tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => formatRp(value)} labelStyle={{color: '#1e293b', fontWeight: 'bold'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                      <Area type="monotone" dataKey="revenue" stroke="#b48c36" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="kd-quick-actions">
              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/categories')}>
                <div className="kd-action-icon kd-ai-add">➕</div>
                <div className="kd-action-text">
                  <h4>{t('kulinerDashboard.addNewMenu')}</h4>
                  <p>{t('kulinerDashboard.uploadMenuDesc')}</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/categories')}>
                <div className="kd-action-icon kd-ai-edit">🏷️</div>
                <div className="kd-action-text">
                  <h4>{t('kulinerDashboard.manageCategories')}</h4>
                  <p>{t('kulinerDashboard.manageCategoriesDesc')}</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/promos')}>
                <div className="kd-action-icon kd-ai-design">🎨</div>
                <div className="kd-action-text">
                  <h4>{t('kulinerDashboard.managePromos')}</h4>
                  <p>{t('kulinerDashboard.managePromosDesc')}</p>
                </div>
              </button>

              <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/reports')}>
                <div className="kd-action-icon kd-ai-finance">📊</div>
                <div className="kd-action-text">
                  <h4>{t('kulinerDashboard.financialReports')}</h4>
                  <p>{t('kulinerDashboard.financialReportsDesc')}</p>
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
                  <table className="kd-table kd-table--compact-mobile">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Pelanggan</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th className="kd-col-waktu">Waktu</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recent_orders?.map((order) => (
                        <tr key={order.id}>
                          <td><span className="font-medium text-[#b48c36]">{order.order_number}</span></td>
                          <td>
                            <div className="kd-menu-name">{order.customer_name}</div>
                            <div className="text-[10px] text-slate-400">{order.customer_phone}</div>
                          </td>
                          <td>{formatRp(order.total_amount)}</td>
                          <td><span className={`kd-status-badge ${getOrderStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                          <td className="kd-col-waktu">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="text-right">
                            <button className="kd-icon-btn" title="Lihat Detail" onClick={() => navigate('/kuliner/admin/orders')}>
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-400">Belum ada pesanan masuk.</td>
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
