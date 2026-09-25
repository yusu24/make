import React, { useState, useEffect } from 'react';
import {
  useNavigate,
  Link
} from 'react-router-dom';
import { 
  DollarSign,
  ShoppingBag,
  Award,
  AlertTriangle,
  Plus,
  Tag,
  Sparkles,
  BarChart2,
  Utensils,
  Eye
} from '@/constants/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import StatScoreCard from '../../../components/ui/StatScoreCard';
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

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : (user?.role === 'admin' ? 'Admin Resto' : 'Owner');

  return (
    <KulinerAdminLayout>
      <div className="kd-content">
        {loading ? (
          <KulinerLoading message={t('kulinerDashboard.preparingKitchen')} />
        ) : (
          <>
            {/* Welcome Banner - Warm Deep Amber/Coffee Theme */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#23150d] via-[#1a0f09] to-[#120a06] p-5 sm:p-6 text-white shadow-lg border border-amber-500/15 mb-6">
              {/* Soft Ambient Light Accents */}
              <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-500/15 via-orange-500/5 to-transparent pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 right-1/3 w-72 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Column: Greeting, Subtitle, Badges */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl tracking-tight text-white leading-tight font-['Plus_Jakarta_Sans']" style={{ fontWeight: 800 }}>
                    {timeGreeting}, {user?.name || 'Chef / Owner'}
                  </h2>
                  <p className="text-amber-100/80 text-xs sm:text-sm mt-1 font-normal font-['Inter']">
                    Pusat operasional resto {user?.tenant_name || 'BIZORA Kuliner'}.
                  </p>

                  {/* Badges / Status Pills */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 font-['Inter']">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/20 text-[11px] font-semibold text-amber-200">
                      {roleLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/20 text-[11px] font-semibold text-amber-100/80">
                      {now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Right Column: Actions & Frosted Glass Icon Card */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <Link
                    to="/kuliner/admin/orders"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-900/30 font-['Plus_Jakarta_Sans']"
                  >
                    <ShoppingBag size={15} />
                    Kasir & Pesanan
                  </Link>
                  <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-amber-400/20 flex items-center justify-center shadow-lg text-amber-300">
                    <Utensils size={24} className="text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Unified KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatScoreCard
                title={t('kulinerDashboard.todaysRevenue')}
                value={formatRp(stats?.revenue_today)}
                icon={DollarSign}
                color="emerald"
                badgeText={revenueChange.label}
                sublabel="Penjualan hari ini"
              />
              <StatScoreCard
                title={t('kulinerDashboard.todaysOrders')}
                value={stats?.orders_today || 0}
                icon={ShoppingBag}
                color="amber"
                badgeText={`${stats?.orders_today || 0} ${t('kulinerDashboard.newOrders')}`}
                sublabel="Transaksi sukses"
              />
              <StatScoreCard
                title={t('kulinerDashboard.bestSellingMenu')}
                value={stats?.top_menu || '-'}
                icon={Award}
                color="violet"
                badgeText={t('kulinerDashboard.positiveTrend')}
                sublabel="Menu terfavorit"
              />
              <StatScoreCard
                title={t('kulinerDashboard.lowStockIngredients')}
                value={stats?.low_stock_ingredients?.length || 0}
                icon={AlertTriangle}
                color={stats?.low_stock_ingredients?.length > 0 ? "rose" : "slate"}
                badgeText={stats?.low_stock_ingredients?.length > 0 ? "Perlu Restock" : "Stok Aman"}
                sublabel={(stats?.low_stock_ingredients || []).slice(0, 2).map((i) => i.name).join(', ') || t('kulinerDashboard.allStockSafe')}
                onClick={() => navigate('/kuliner/admin/ingredients')}
              />
            </div>

            {/* CHART & WIDGETS */}
            <div className="kd-panels" style={{ gridTemplateColumns: '1fr', marginTop: 16 }}>
              <div className="kd-panel">
                <div className="kd-panel-header" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="kd-panel-title font-['Plus_Jakarta_Sans'] font-semibold text-slate-900">
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
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 font-['Inter']">Akses Cepat</h3>
              <div className="kd-quick-actions">
                <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/categories')}>
                  <div className="kd-action-icon kd-ai-add"><Plus size={18} /></div>
                  <div className="kd-action-text">
                    <h4>{t('kulinerDashboard.addNewMenu')}</h4>
                    <p>{t('kulinerDashboard.uploadMenuDesc')}</p>
                  </div>
                </button>

                <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/categories')}>
                  <div className="kd-action-icon kd-ai-edit"><Tag size={18} /></div>
                  <div className="kd-action-text">
                    <h4>{t('kulinerDashboard.manageCategories')}</h4>
                    <p>{t('kulinerDashboard.manageCategoriesDesc')}</p>
                  </div>
                </button>

                <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/promos')}>
                  <div className="kd-action-icon kd-ai-design"><Sparkles size={18} /></div>
                  <div className="kd-action-text">
                    <h4>{t('kulinerDashboard.managePromos')}</h4>
                    <p>{t('kulinerDashboard.managePromosDesc')}</p>
                  </div>
                </button>

                <button className="kd-action-btn" onClick={() => navigate('/kuliner/admin/reports')}>
                  <div className="kd-action-icon kd-ai-finance"><BarChart2 size={18} /></div>
                  <div className="kd-action-text">
                    <h4>{t('kulinerDashboard.financialReports')}</h4>
                    <p>{t('kulinerDashboard.financialReportsDesc')}</p>
                  </div>
                </button>
              </div>
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
                        <th>Kontak</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th className="kd-col-waktu">Waktu</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recent_orders?.map((order) => (
                        <tr key={order.id}>
                            <td><span className="font-mono font-normal text-slate-700 text-[12px]">#{order.order_number}</span></td>
                            <td>
                              <span className="text-slate-800 font-normal font-['Inter'] text-[12px]">{order.customer_name}</span>
                            </td>
                            <td>
                              <span className="text-[12px] text-slate-500 font-mono font-normal">{order.customer_phone || '-'}</span>
                            </td>
                            <td><span className="font-['Inter'] font-semibold text-slate-900 text-[12px]">{formatRp(order.total_amount)}</span></td>
                          <td><span className={`kd-status-badge ${getOrderStatusBadgeClass(order.status)}`}>{order.status}</span></td>
                          <td className="kd-col-waktu font-['Inter'] text-[12px] font-normal text-slate-600">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="text-right">
                            <button className="kd-icon-btn" title="Lihat Detail" onClick={() => navigate('/kuliner/admin/orders')}>
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                        <tr>
                          <td colSpan="7" className="text-center py-10 text-slate-400 font-['Inter']">Belum ada pesanan masuk.</td>
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
                <div className="kd-activity-list font-['Inter']">
                  {(stats?.recent_orders || []).slice(0, 3).map((order) => (
                    <div className="kd-activity-item" key={order.id}>
                      <div className="kd-activity-icon kd-act-order"><ShoppingBag size={16} /></div>
                      <div className="kd-activity-content">
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">Pesanan dari {order.customer_name}</h4>
                        <p className="text-xs text-slate-500">{formatRp(order.total_amount)} · {timeAgo(order.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {stats?.top_menu && (
                    <div className="kd-activity-item">
                      <div className="kd-activity-icon kd-act-menu"><Utensils size={16} /></div>
                      <div className="kd-activity-content">
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">Menu Terlaris</h4>
                        <p className="text-xs text-slate-500">{stats.top_menu} (30 hari terakhir)</p>
                      </div>
                    </div>
                  )}
                  {(stats?.low_stock_ingredients || []).length > 0 && (
                    <div className="kd-activity-item">
                      <div className="kd-activity-icon kd-act-review"><AlertTriangle size={16} /></div>
                      <div className="kd-activity-content">
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-800">Bahan Baku Menipis</h4>
                        <p className="text-xs text-slate-500">{stats.low_stock_ingredients.slice(0, 3).map((i) => i.name).join(', ')}</p>
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
