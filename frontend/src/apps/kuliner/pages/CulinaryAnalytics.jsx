import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../contexts/I18nContext';
import { useToast } from '../../../components/Toast';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import { Sparkles, Users, CreditCard, Star, Lightbulb, UtensilsCrossed, Clock, Target, Check, X } from '@/constants/icons';
import './KulinerDashboard.css';

const CulinaryAnalytics = () => {
  const { t } = useTranslation();
  const toast = useToast();
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
    t('kulinerAnalytics.aiStep1') || 'Menghubungkan ke Mesin Analitik Bizora AI...',
    t('kulinerAnalytics.aiStep2') || 'Membaca riwayat transaksi & jam sibuk...',
    t('kulinerAnalytics.aiStep3') || 'Mengalkulasi tingkat retensi pelanggan...',
    t('kulinerAnalytics.aiStep4') || 'Menyusun rekomendasi taktis bisnis...'
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
      toast.error(t('kulinerAnalytics.alertAiFail') || 'Gagal menghasilkan analisis AI.');
    } finally {
      clearInterval(interval);
      setAiLoading(false);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-content">
        {loading ? (
          <KulinerLoading message={t('kulinerAnalytics.loading') || 'Menganalisis data transaksi Anda...'} />
        ) : (
          <>
            <div className="kd-page-actions">
              <div className="text-xs font-medium text-slate-400">{t('kulinerAnalytics.lastUpdated') || 'Data terakhir diperbarui: Baru saja'}</div>
              <button className="kd-btn kd-btn-primary flex items-center gap-1.5" onClick={handleGenerateAi}>
                <Sparkles size={15} /> {t('kulinerAnalytics.generateAiBtn') || 'Generate Insight AI'}
              </button>
            </div>
            <div className="kd-settings-layout">
              
              {/* TOP PRODUCTS CHART */}
              <div className="kd-panel">
                <div className="kd-panel-header">
                  <div className="text-sm font-bold text-slate-800">{t('kulinerAnalytics.topProductsTitle') || 'Menu Paling Dicari (Top 5)'}</div>
                </div>
                <div className="p-6">
                  {topProducts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">{t('kulinerAnalytics.topProductsEmpty') || 'Belum ada data penjualan menu.'}</div>
                  ) : (
                    topProducts.map((product, index) => (
                      <div key={index} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span className="text-xs font-bold text-slate-700">{product.name}</span>
                          <span className="text-xs font-mono text-slate-400">{product.orders} {t('kulinerAnalytics.orders') || 'Pesanan'}</span>
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
                  <div className="text-sm font-bold text-slate-800">{t('kulinerAnalytics.peakHoursTitle') || 'Analisis Jam Sibuk'}</div>
                </div>
                <div className="p-6" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {peakHours.every(ph => ph.intensity === 0) ? (
                    <div className="text-center text-slate-400 text-xs italic">{t('kulinerAnalytics.peakHoursEmpty') || 'Data jam sibuk akan muncul setelah ada transaksi.'}</div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 mb-3 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users size={22} />
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-['Inter']">{t('kulinerAnalytics.statLoyaltySub') || 'Pelanggan Setia'}</div>
                <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight">{stats.loyaltyRate}%</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 mb-3 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <CreditCard size={22} />
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-['Inter']">{t('kulinerAnalytics.statFavoriteMethod') || 'Metode Terfavorit'}</div>
                <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight truncate max-w-full">{stats.favoriteMethod}</div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 mb-3 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Star size={22} />
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-['Inter']">{t('kulinerAnalytics.statServiceRating') || 'Rating Layanan'}</div>
                <div className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight">{stats.serviceRating > 0 ? stats.serviceRating + '/5.0' : '-'}</div>
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
                <Sparkles size={18} className="text-indigo-600" /> {t('kulinerAnalytics.aiModalTitle') || 'Bizora Business Intelligence AI'}
              </h2>
              {!aiLoading && (
                <button className="kd-close-btn" onClick={() => setShowAiModal(false)}><X size={18} /></button>
              )}
            </div>

            <div className="kd-modal-body" style={{ padding: '24px' }}>
              {aiLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 16 }}>
                  <div className="relative flex items-center justify-center">
                    <div style={{ width: 64, height: 64, border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <Sparkles size={24} className="text-indigo-600 absolute" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{t('kulinerAnalytics.aiModalGenerating') || 'Sedang Menganalisis Bisnis Anda'}</div>
                    <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, minHeight: 20 }}>
                      {steps[aiStep]}
                    </div>
                  </div>
                </div>
              ) : aiData ? (
                <div>
                  <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)', padding: '16px 20px', borderRadius: 12, border: '1px solid #c7d2fe', marginBottom: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#312e81', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lightbulb size={16} className="text-indigo-600" /> Ringkasan Eksekutif
                    </div>
                    <p style={{ fontSize: 12, color: '#1e1b4b', lineHeight: 1.6, margin: 0 }}>
                      {aiData.summary}
                    </p>
                  </div>

                  {aiData.details && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      {aiData.details.product_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <UtensilsCrossed size={14} className="text-slate-500" /> Analisis Menu
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.product_insight }} />
                        </div>
                      )}
                      {aiData.details.time_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={14} className="text-slate-500" /> Jam Kunjungan
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.time_insight }} />
                        </div>
                      )}
                      {aiData.details.loyalty_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={14} className="text-slate-500" /> Loyalitas Pelanggan
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.loyalty_insight }} />
                        </div>
                      )}
                      {aiData.details.payment_insight && (
                        <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CreditCard size={14} className="text-slate-500" /> Preferensi Transaksi
                          </div>
                          <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.5, margin: 0 }} dangerouslySetInnerHTML={{ __html: aiData.details.payment_insight }} />
                        </div>
                      )}
                    </div>
                  )}

                  {aiData.recommendations && (
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 12, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Target size={15} className="text-slate-700" /> {t('kulinerAnalytics.aiInsightRecommendation') || 'Rekomendasi Taktis & Strategis'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {aiData.recommendations.map((rec, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#f0fdf4', padding: '10px 14px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                            <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span style={{ fontSize: 11, color: '#166534', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: rec }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">{t('kulinerAnalytics.alertAiFail') || 'Gagal memuat analisis AI.'}</div>
              )}
            </div>
            
            <div className="kd-modal-footer" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button 
                type="button" 
                className="kd-btn kd-btn-secondary" 
                disabled={aiLoading} 
                onClick={() => setShowAiModal(false)}
              >
                {t('kulinerAnalytics.closeBtn') || 'Tutup Panel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryAnalytics;
