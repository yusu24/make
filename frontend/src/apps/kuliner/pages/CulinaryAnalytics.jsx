import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
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

  // AI Insight states
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiStep, setAiStep] = useState(0);

  const steps = [
    'Menghubungkan ke Mesin Analitik Bizora AI...',
    'Membaca riwayat transaksi & jam sibuk...',
    'Mengalkulasi tingkat retensi pelanggan...',
    'Menyusun rekomendasi taktis bisnis...'
  ];

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

  const handleGenerateAi = async () => {
    setShowAiModal(true);
    setAiLoading(true);
    setAiData(null);
    setAiStep(0);

    // Simulate thinking steps for visual effect
    const interval = setInterval(() => {
      setAiStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 850);

    try {
      const response = await api.post('/kuliner/admin/ai-insights');
      // Wait at least 3.5s total to let the cool steps render
      await new Promise(resolve => setTimeout(resolve, 3500));
      setAiData(response.data.insights || null);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      alert('Gagal menghasilkan analisis AI.');
    } finally {
      clearInterval(interval);
      setAiLoading(false);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Analitik Bisnis</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Menganalisis data transaksi Anda..." />
        ) : (
          <>
            <div className="kd-page-actions">
              <div className="text-xs font-medium text-slate-400">Data terakhir diperbarui: Baru saja</div>
              <button className="kd-btn kd-btn-primary" onClick={handleGenerateAi}>
                ⚡ Generate Insight AI
              </button>
            </div>
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
                  {peakHours.every(ph => ph.intensity === 0) ? (
                    <div className="text-center text-slate-400 text-xs italic">Data jam sibuk akan muncul setelah ada transaksi.</div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
                      {peakHours.map((data, index) => (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '8px' }}>
                            <div 
                              style={{ 
                                width: '80%', 
                                height: `${Math.max(data.intensity, 2)}%`, 
                                background: data.intensity > 0 ? 'linear-gradient(to top, #3b82f6, #60a5fa)' : '#f1f5f9', 
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 1s ease-out'
                              }} 
                              title={`${data.hour} - Intensitas: ${data.intensity}%`}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold" style={{ visibility: index % 3 === 0 ? 'visible' : 'hidden' }}>
                            {data.hour}
                          </span>
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
          </>
        )}
      </div>

      {/* AI INSIGHTS MODAL */}
      {showAiModal && (
        <div className="kd-modal-overlay visible" onClick={() => !aiLoading && setShowAiModal(false)}>
          <div className="kd-modal max-w-2xl" onClick={e => e.stopPropagation()} style={{ border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.3)' }}>
            <div className="kd-modal-header" style={{ background: 'linear-gradient(to right, #e0e7ff, #f3e8ff)', borderBottom: '1px solid #e2e8f0' }}>
              <h2 className="kd-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4f46e5' }}>
                <span>⚡</span> Bizora Business Intelligence AI
              </h2>
              {!aiLoading && (
                <button className="kd-close-btn" onClick={() => setShowAiModal(false)}>✕</button>
              )}
            </div>

            <div className="kd-modal-body" style={{ padding: '24px' }}>
              {aiLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 16 }}>
                  <div className="relative flex items-center justify-center">
                    <div style={{ width: 64, height: 64, border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ position: 'absolute', fontSize: 24 }}>⚡</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Sedang Menganalisis Bisnis Anda</div>
                    <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, minHeight: 20 }}>
                      {steps[aiStep]}
                    </div>
                  </div>
                </div>
              ) : aiData ? (
                <div>
                  <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)', padding: '16px 20px', borderRadius: 12, border: '1px solid #c7d2fe', marginBottom: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#312e81', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💡</span> Ringkasan Eksekutif
                    </div>
                    <p style={{ fontSize: 12, color: '#1e1b4b', lineHeight: 1.6, margin: 0 }}>
                      {aiData.summary}
                    </p>
                  </div>

                  {aiData.details && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      {aiData.details.product_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>🍔</span> Analisis Menu
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.product_insight }} />
                        </div>
                      )}
                      {aiData.details.time_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>⏰</span> Jam Kunjungan
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.time_insight }} />
                        </div>
                      )}
                      {aiData.details.loyalty_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>👥</span> Loyalitas Pelanggan
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.loyalty_insight }} />
                        </div>
                      )}
                      {aiData.details.payment_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>💳</span> Preferensi Transaksi
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.payment_insight }} />
                        </div>
                      )}
                    </div>
                  )}

                  {aiData.recommendations && (
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 12, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🎯</span> Rekomendasi Taktis &amp; Strategis
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {aiData.recommendations.map((rec, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                            <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 14 }}>✓</span>
                            <span style={{ fontSize: 11, color: '#166534', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: rec }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">Gagal memuat analisis AI.</div>
              )}
            </div>
            
            <div className="kd-modal-footer" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button 
                type="button" 
                className="kd-btn kd-btn-secondary" 
                disabled={aiLoading} 
                onClick={() => setShowAiModal(false)}
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryAnalytics;
