import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'

export default function Subscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState(null);
  const [categoryPromo, setCategoryPromo] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  
  const [pondCount, setPondCount] = useState(0);
  const [activeCycleCount, setActiveCycleCount] = useState(0);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [pondRes, cycleRes, subRes] = await Promise.all([
        api.get('/budidaya/ponds'),
        api.get('/budidaya/cycles'),
        api.get('/subscription/current')
      ]);

      const ponds = Array.isArray(pondRes.data) ? pondRes.data : (pondRes.data.data || []);
      const cycles = Array.isArray(cycleRes.data) ? cycleRes.data : (cycleRes.data.data || []);

      setPondCount(ponds.length);
      setActiveCycleCount(cycles.filter(c => c.status === 'active').length);

      setPendingReq(subRes.data.data);
      setCategoryPromo(subRes.data.category_promo || null);
      setGlobalSettings(subRes.data.global_settings || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const getPlanPriceInfo = (planId) => {
    if (!planId || planId === 'free') return { display: 'Rp 0', numeric: 0, discounted: false };
    
    const basePrices = { 
      basic: globalSettings?.price_basic || 149000, 
      pro: globalSettings?.price_pro || 299000 
    };
    const base = basePrices[planId] || 0;
    
    if (categoryPromo && categoryPromo.discount_pct > 0) {
      const discount = Math.round(base * (categoryPromo.discount_pct / 100));
      const finalPrice = base - discount;
      return {
        original: formatRupiah(base) + ' / bln',
        display: formatRupiah(finalPrice) + ' / bln',
        numeric: finalPrice,
        discounted: true,
        discountPct: categoryPromo.discount_pct
      };
    }
    
    return {
      display: formatRupiah(base) + ' / bln',
      numeric: base,
      discounted: false
    };
  };

  const handleOrderUpgrade = async (planId) => {
    setSelectedPlan(planId);
    setShowOrderModal(true);
  };

  const submitUpgradeRequest = async () => {
    setIsSubmitting(true);
    const priceInfo = getPlanPriceInfo(selectedPlan);
    try {
      await api.post('/subscription/request', {
        plan: selectedPlan,
        amount: priceInfo.numeric
      });
      alert('Permintaan upgrade berhasil dikirim! Silakan lakukan transfer bank dan tunggu verifikasi Admin.');
      setShowOrderModal(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengirim permintaan upgrade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: '#1B4332' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid #E8F5ED', borderTopColor: '#1B4332', borderRadius: '50%' }} />
      </div>
    );
  }

  const terms = useBudidayaTerms();
  const currentPlan = user?.subscription_plan || 'free';

  const PLANS = [
    { 
      id: 'free', 
      name: 'Free (Tester)', 
      price: 'Rp 0', 
      features: ['Masa Aktif 3-5 Hari', `Maks 2 ${terms.unit} Budidaya`, 'Maks 1 Siklus Aktif', `Laporan Dasar ${terms.unit}`],
      color: '#64748b'
    },
    { 
      id: 'basic', 
      name: 'Basic', 
      price: getPlanPriceInfo('basic').display, 
      features: ['Tanpa Batas Waktu', `Maks 5 ${terms.unit} Budidaya`, 'Maks 3 Siklus Aktif', `${terms.isTanaman ? 'Laporan Pupuk & Sampling' : 'Laporan Pakan & Sampling'}`],
      color: '#2D6A4F'
    },
    { 
      id: 'pro', 
      name: 'Pro (Terbaik)', 
      price: getPlanPriceInfo('pro').display, 
      features: ['Tanpa Batas Waktu', `${terms.unit} Tak Terbatas`, 'Siklus Tak Terbatas', `Analitik Panen & Multi ${terms.unit}`],
      color: '#1B4332' 
    }
  ];

  const pondLimit = currentPlan === 'free' ? 2 : (currentPlan === 'basic' ? 5 : '∞');
  const pondPercentage = pondLimit === '∞' ? 0 : (pondCount / pondLimit) * 100;

  const cycleLimit = currentPlan === 'free' ? 1 : (currentPlan === 'basic' ? 3 : '∞');
  const cyclePercentage = cycleLimit === '∞' ? 0 : (activeCycleCount / cycleLimit) * 100;

  return (
    <div className="aq-container">
      <style>{`
        .sub-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .sub-grid {
            grid-template-columns: 1fr;
          }
        }
        .plan-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .plan-card:hover {
          border-color: #2D6A4F;
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(27, 67, 50, 0.12);
        }
        .btn-upgrade {
          background: #1B4332;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: auto;
          text-align: center;
          width: 100%;
        }
        .btn-upgrade:hover {
          background: #2D6A4F;
          transform: translateY(-1px);
        }
        .btn-upgrade:disabled {
          background: #CBD5E1;
          color: #64748b;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="sub-grid">
        
        {/* Left Side: Current Status & Package Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Status Card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #E9F0EC', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(27, 67, 50, 0.02)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: '#1B4332', opacity: 0.03, borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#2D6A4F', letterSpacing: '0.05em', textTransform: 'uppercase', background: '#E8F5ED', padding: '6px 14px', borderRadius: 20 }}>Paket Langganan</span>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1B4332', margin: '8px 0 0 0', letterSpacing: '-0.03em' }}>{currentPlan.toUpperCase()}</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Status Layanan</div>
                {pendingReq ? (
                  <div style={{ color: '#D97706', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                    <span className="animate-pulse">⏳</span> Verifikasi Upgrade
                  </div>
                ) : (
                  <div style={{ color: '#10B981', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 16 }}>✓</span> Akun Aktif
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              
              {/* Kolam Progress */}
              <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>{`Kapasitas ${terms.unit}`}</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#1B4332' }}>{pondCount} / {pondLimit}</span>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, pondPercentage)}%`, height: '100%', background: pondPercentage >= 100 ? '#EF4444' : '#2D6A4F', transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 10, margin: '10px 0 0 0', lineHeight: 1.4 }}>
                  {pondLimit === '∞' ? `Kapasitas ${terms.unitLower} Anda tidak terbatas.` : `Maksimal ${terms.unitLower} aktif adalah ${pondLimit} ${terms.unitLower}.`}
                </p>
              </div>

              {/* Siklus Progress */}
              <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Siklus Aktif</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#1B4332' }}>{activeCycleCount} / {cycleLimit}</span>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, cyclePercentage)}%`, height: '100%', background: cyclePercentage >= 100 ? '#EF4444' : '#1B4332', transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 10, margin: '10px 0 0 0', lineHeight: 1.4 }}>
                  {cycleLimit === '∞' ? 'Siklus budidaya tidak terbatas.' : `Maksimal siklus budidaya aktif adalah ${cycleLimit} siklus.`}
                </p>
              </div>

            </div>
          </div>

          {/* Promo Banner */}
          {categoryPromo && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.06), rgba(16, 185, 129, 0.06))',
              border: '1px dashed #2D6A4F',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{ fontSize: 28 }}>{user?.business_category === 'Budidaya Tanaman' ? '🌱' : '🐟'}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1B4332' }}>
                  Promo Spesial {categoryPromo.category_name} Aktif!
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                  {categoryPromo.text || `Dapatkan diskon upgrade sebesar ${categoryPromo.discount_pct}% khusus untuk memperluas area budidaya Anda.`}
                </p>
              </div>
            </div>
          )}

          {/* Package Selection Cards */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1B4332', marginBottom: 16 }}>Daftar Paket Upgrade</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {PLANS.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const isPromo = plan.id !== 'free' && categoryPromo && categoryPromo.discount_pct > 0;
                
                return (
                  <div key={plan.id} className="plan-card" style={isCurrent ? { borderColor: plan.color, borderWidth: 2 } : {}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#1B4332' }}>{plan.name}</span>
                      {isCurrent && <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: plan.color, padding: '3px 8px', borderRadius: 20 }}>AKTIF</span>}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      {isPromo ? (
                        <>
                          <div style={{ fontSize: 11, color: '#EF4444', textDecoration: 'line-through', marginBottom: 2 }}>
                            {getPlanPriceInfo(plan.id).original}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#2D6A4F' }}>
                            {plan.price}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#1B4332' }}>
                          {plan.price}
                        </div>
                      )}
                    </div>

                    <ul style={{ padding: 0, margin: '0 0 24px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#475569' }}>
                      {plan.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ color: '#2D6A4F', fontWeight: 800 }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="btn-upgrade"
                      disabled={isCurrent || plan.id === 'free' || pendingReq}
                      onClick={() => handleOrderUpgrade(plan.id)}
                      style={plan.id === 'pro' ? { background: '#1B4332' } : {}}
                    >
                      {isCurrent ? 'Paket Aktif Saat Ini' : (pendingReq ? 'Menunggu Aktivasi' : 'Pilih Paket')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Billing Transfer info */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #E9F0EC', borderRadius: 20, padding: 28, boxShadow: '0 4px 12px rgba(27, 67, 50, 0.02)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800, color: '#1B4332' }}>Informasi Pembayaran</h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 24 }}>
              Pembayaran menggunakan transfer bank manual. Rekening pembayaran resmi platform AquaGrow:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: 16, border: '1px solid #E2E8F0', position: 'relative' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Bank Transfer</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1B4332' }}>{globalSettings?.bank_name || 'BANK BCA'}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#1B4332', letterSpacing: '0.03em' }}>
                    {globalSettings?.bank_account_no || '8837 001 992'}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(globalSettings?.bank_account_no || '8837 001 992');
                      alert('Nomor Rekening Disalin!');
                    }}
                    style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#1B4332', cursor: 'pointer' }}
                  >
                    Salin
                  </button>
                </div>

                <div style={{ height: 1, background: '#E2E8F0', margin: '12px 0' }} />
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Atas Nama: <strong style={{ color: '#1B4332' }}>{globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'}</strong>
                </div>
              </div>

              <div style={{ padding: '0 8px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                <strong style={{ color: '#1B4332', display: 'block', marginBottom: 4 }}>Petunjuk Pembayaran:</strong>
                1. Pilih paket upgrade yang Anda inginkan.<br />
                2. Lakukan transfer sesuai harga paket yang tertera.<br />
                3. Klik tombol <strong>"Saya Sudah Bayar"</strong> di modal konfirmasi.<br />
                4. Akun Anda akan segera diaktifkan oleh Admin maksimal 24 jam.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Upgrade Order Modal */}
      {showOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="animate-scale-in" style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1B4332', margin: 0 }}>Konfirmasi Upgrade Paket</h3>
              <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0 24px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Anda memilih paket <strong style={{ color: '#1B4332' }}>{selectedPlan?.toUpperCase()}</strong></div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#1B4332' }}>
                {getPlanPriceInfo(selectedPlan).display}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', marginBottom: 8 }}>Instruksi Pembayaran:</div>
              <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5, marginBottom: 12 }}>Lakukan transfer ke rekening berikut:</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 800 }}>{globalSettings?.bank_name || 'BANK BCA'}</div>
                  <div style={{ fontWeight: 800, fontSize: 16, color: '#1B4332' }}>{globalSettings?.bank_account_no || '8837 001 992'}</div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(globalSettings?.bank_account_no || '8837 001 992');
                    alert('Nomor Rekening Disalin!');
                  }}
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#1B4332', cursor: 'pointer' }}
                >
                  Salin
                </button>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 10, textAlign: 'center' }}>
                a.n. <strong>{globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowOrderModal(false)}
                style={{ flex: 1, padding: 12, border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                onClick={submitUpgradeRequest}
                disabled={isSubmitting}
                style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: '#1B4332', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
              >
                {isSubmitting ? 'Mengirim...' : 'Saya Sudah Bayar'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
