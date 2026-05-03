import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import './KulinerDashboard.css';

const CulinaryAnalytics = () => {
  // Real data state
  const [topProducts, setTopProducts] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    loyaltyRate: 0,
    favoriteMethod: '-',
    serviceRating: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kuliner/admin/analytics');
      setTopProducts(response.data.topProducts || []);
      setPeakHours(response.data.peakHours || []);
      setStats(response.data.stats || { loyaltyRate: 0, favoriteMethod: '-', serviceRating: 0 });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <KulinerAdminLayout>
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 20px' }}></div>
        <p className="text-slate-400">Menganalisis data transaksi Anda...</p>
      </div>
    </KulinerAdminLayout>
  );

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Analitik Bisnis</h1>
          <p className="text-sm text-slate-500 mt-1">Pahami tren pelanggan dan optimalkan strategi penjualan Anda.</p>
        </div>
        <div className="kd-topbar-actions">
          <div className="text-xs font-medium text-slate-400 mr-2">Data terakhir diperbarui: Baru saja</div>
          <button className="kd-btn kd-btn-primary">⚡ Generate Insight AI</button>
        </div>
      </div>

      <div className="kd-content">
        <div className="kd-settings-layout">
          
          {/* TOP PRODUCTS CHART */}
          <div className="kd-panel">
            <div className="kd-panel-header">
              <div className="text-sm font-bold text-slate-800">Menu Paling Dicari (Top 5)</div>
            </div>
            <div className="p-6">
              {topProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic">Belum ada data penjualan menu.</div>
              ) : (
                topProducts.map((product, index) => (
                  <div key={index} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="text-xs font-bold text-slate-700">{product.name}</span>
                      <span className="text-xs font-mono text-slate-400">{product.orders} Pesanan</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${product.percentage}%`, 
                          background: product.color,
                          borderRadius: 4,
                          transition: 'width 1s ease-in-out'
                        }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PEAK HOURS CHART */}
          <div className="kd-panel">
            <div className="kd-panel-header">
              <div className="text-sm font-bold text-slate-800">Analisis Jam Sibuk</div>
            </div>
            <div className="p-6" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {peakHours.length === 0 ? (
                <div className="text-center text-slate-400 text-xs italic">Data jam sibuk akan muncul setelah ada transaksi.</div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                  {peakHours.map((data, index) => (
                    <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${data.intensity}%`, 
                          background: 'linear-gradient(to top, #3b82f6, #60a5fa)', 
                          borderRadius: '8px 8px 0 0',
                          transition: 'height 1s ease-out'
                        }} 
                      />
                      <span className="text-[10px] text-slate-400 mt-4 font-bold">{data.hour}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 mt-2 bg-blue-50/50 rounded-xl mx-6 mb-6">
              <p className="text-[10px] text-blue-600 leading-relaxed">
                <strong>Insight:</strong> {topProducts.length === 0 ? 'Mulai lakukan transaksi untuk mendapatkan insight bisnis.' : 'Sistem sedang menganalisis pola kunjungan pelanggan Anda.'}
              </p>
            </div>
          </div>

        </div>

        <div className="kd-ledger-grid" style={{ marginTop: 24 }}>
          <div className="kd-panel text-center p-8">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-xl font-black text-slate-800">{stats.loyaltyRate}%</div>
            <div className="text-[10px] text-slate-400 font-bold tracking-widest">Pelanggan Setia</div>
          </div>
          <div className="kd-panel text-center p-8">
            <div className="text-3xl mb-2">💳</div>
            <div className="text-xl font-black text-slate-800">{stats.favoriteMethod}</div>
            <div className="text-[10px] text-slate-400 font-bold tracking-widest">Metode Terfavorit</div>
          </div>
          <div className="kd-panel text-center p-8">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-xl font-black text-slate-800">{stats.serviceRating > 0 ? stats.serviceRating + '/5.0' : '-'}</div>
            <div className="text-[10px] text-slate-400 font-bold tracking-widest">Rating Layanan</div>
          </div>
        </div>
      </div>
    </KulinerAdminLayout>
  );
};

export default CulinaryAnalytics;
