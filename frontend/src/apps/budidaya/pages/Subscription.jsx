import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import { useBudidayaTerms } from '../hooks/useBudidayaTerms'

export default function Subscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState(null);
  const [categoryPromo, setCategoryPromo] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [apiPlans, setApiPlans] = useState([]);
  
  const [pondCount, setPondCount] = useState(0);
  const [activeCycleCount, setActiveCycleCount] = useState(0);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Step 1 = konfirmasi, Step 2 = tampilkan QRIS/VA setelah submit
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);
  const [invoices, setInvoices] = useState([]);

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
      setApiPlans(subRes.data.plans || []);
      setInvoices(subRes.data.invoices || []);
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

  const getPlanPriceInfo = (planId, customPrice = null) => {
    if (!planId || planId === 'free') return { display: 'Rp 0', numeric: 0, discounted: false };
    
    const basePrices = { 
      basic: globalSettings?.pricing_basic_monthly || 49000, 
      pro: globalSettings?.pricing_pro_monthly || 149000
    };
    const base = (customPrice !== null && customPrice !== undefined && customPrice > 0) ? customPrice : (basePrices[planId] || 0);
    
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

  const handleOrderUpgrade = (planId) => {
    setSelectedPlan(planId);
    setPaymentStep(1);
    setPaymentData(null);
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowOrderModal(false);
    setPaymentStep(1);
    setPaymentData(null);
    setSelectedPlan(null);
  };

  const copyToClipboard = (text, label = 'Teks') => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} berhasil disalin!`));
  };

  const submitUpgradeRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/subscription/request', { plan: selectedPlan });
      setPaymentData(res.data.payment_data || null);
      setPaymentStep(2);
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

  const FEATURE_LABELS = {
    ponds: `Manajemen ${terms.Pond}`,
    cycles: `Siklus ${terms.Cycle}`,
    feeding: `Jadwal ${terms.Feed}`,
    harvest: 'Pencatatan Panen',
    health: 'Catatan Kesehatan',
    breeding: 'Silsilah Breeding',
    reports: 'Laporan Budidaya',
    multiUser: 'Multi-User Akses Staf',
    exportExcel: 'Export Excel / PDF',
    prioritySupport: 'Priority Support 24/7',
  };

  const describePlan = (plan) => {
    const bullets = [];
    bullets.push(plan.plan_key === 'free' ? 'Masa Aktif 3-5 Hari' : 'Tanpa Batas Waktu');
    bullets.push(plan.max_staff === null ? 'Staf Tak Terbatas' : `Maks ${plan.max_staff} Staf`);
    if (plan.features && typeof plan.features === 'object') {
      Object.entries(plan.features).forEach(([key, enabled]) => {
        if (enabled && FEATURE_LABELS[key]) bullets.push(FEATURE_LABELS[key]);
      });
    }
    return bullets;
  };

  const DEFAULT_PLANS = [
    { 
      id: 'free', 
      name: 'Free (Tester)', 
      price: 'Rp 0', 
      features: ['Masa Aktif 3-5 Hari', `Manajemen ${terms.Pond}`, `Siklus ${terms.Cycle}`],
      color: '#64748b'
    },
    { 
      id: 'basic', 
      name: 'Basic', 
      price: getPlanPriceInfo('basic').display, 
      features: ['Tanpa Batas Waktu', `Jadwal ${terms.Feed}`, 'Pencatatan Panen', 'Laporan Budidaya'],
      color: '#2D6A4F'
    },
    { 
      id: 'pro', 
      name: 'Pro (Terbaik)', 
      price: getPlanPriceInfo('pro').display, 
      features: ['Tanpa Batas Waktu', 'Catatan Kesehatan & Breeding', 'Multi-User Staf & Export Excel'],
      color: '#1B4332' 
    }
  ];

  const PLANS = (apiPlans && apiPlans.length > 0)
    ? apiPlans.map(plan => ({
        id: plan.plan_key,
        name: plan.name,
        price: plan.plan_key === 'free' ? 'Rp 0' : getPlanPriceInfo(plan.plan_key, plan.price).display,
        features: describePlan(plan),
        color: plan.plan_key === 'free' ? '#64748b' : (plan.plan_key === 'basic' ? '#2D6A4F' : '#1B4332')
      }))
    : DEFAULT_PLANS;

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
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#2D6A4F', background: '#E8F5ED', padding: '4px 12px', borderRadius: 20 }}>Paket Langganan</span>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', margin: '6px 0 0 0', letterSpacing: '-0.01em', textTransform: 'capitalize' }}>{currentPlan}</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Status Layanan</div>
                {pendingReq ? (
                  <div style={{ color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <span className="animate-pulse">⏳</span> Verifikasi Upgrade
                  </div>
                ) : (
                  <div style={{ color: '#10B981', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14 }}>✓</span> Akun Aktif
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
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#2D6A4F' }}>
                            {plan.price}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1B4332' }}>
                          {plan.price}
                        </div>
                      )}
                    </div>

                    <ul style={{ padding: 0, margin: '0 0 24px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#475569' }}>
                      {plan.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ color: '#2D6A4F', fontWeight: 600 }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="btn-upgrade"
                      disabled={isCurrent || plan.id === 'free' || pendingReq?.plan === plan.id}
                      onClick={() => handleOrderUpgrade(plan.id)}
                      style={plan.id === 'pro' ? { background: '#1B4332' } : {}}
                    >
                      {isCurrent ? 'Paket Aktif Saat Ini' : (pendingReq?.plan === plan.id ? 'Menunggu Aktivasi' : 'Pilih Paket')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Riwayat Invoice & Bank Info */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #E9F0EC', borderRadius: 20, padding: 28, boxShadow: '0 4px 12px rgba(27, 67, 50, 0.02)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: '#1B4332' }}>🧾 Riwayat Invoice</h3>

            {invoices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                <p style={{ fontSize: 13 }}>Belum ada riwayat pembayaran.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {invoices.map(inv => {
                  const badge = inv.status === 'paid'
                    ? { label: 'Lunas', bg: '#dcfce7', color: '#15803d' }
                    : inv.status === 'overdue'
                      ? { label: 'Jatuh Tempo', bg: '#fee2e2', color: '#dc2626' }
                      : { label: 'Belum Dibayar', bg: '#fef9c3', color: '#ca8a04' };
                  return (
                    <div key={inv.id} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{inv.id}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 10 }}>{badge.label}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Paket {inv.plan}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{inv.due_date ? `Jatuh tempo: ${inv.due_date}` : inv.date}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#1B4332' }}>{formatRupiah(inv.amount)}</div>
                      </div>
                      {inv.status === 'unpaid' && (
                        <button
                          style={{ width: '100%', marginTop: 10, padding: '8px', border: 'none', borderRadius: 8, background: '#2D6A4F', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                          onClick={async () => {
                            try {
                              await api.post('/payment/simulate-pay', { invoice_number: inv.id, payment_method: 'Simulasi' });
                              alert('✅ Pembayaran berhasil disimulasikan! Paket akan segera aktif.');
                              fetchData();
                            } catch (e) { alert(e.response?.data?.message || 'Gagal simulasi'); }
                          }}
                        >
                          ⚡ Simulasi Bayar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ height: 1, background: '#E2E8F0', margin: '20px 0' }} />

            {(() => {
              const accounts = (Array.isArray(globalSettings?.bank_accounts) && globalSettings.bank_accounts.length > 0)
                ? globalSettings.bank_accounts
                : [{
                    bank_name: globalSettings?.bank_name || 'BANK BCA',
                    bank_account_no: globalSettings?.bank_account_no || '8837 001 992',
                    bank_account_name: globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'
                  }];
              return (
                <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Rekening Manual Alternatif ({accounts.length} Bank)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {accounts.map((acc, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1B4332' }}>{acc.bank_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#1B4332', letterSpacing: '0.02em' }}>{acc.bank_account_no || acc.bank_account_number}</div>
                          <button onClick={() => copyToClipboard(acc.bank_account_no || acc.bank_account_number, `Nomor Rekening ${acc.bank_name}`)} style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#1B4332', cursor: 'pointer' }}>Salin</button>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>a.n. <strong style={{ color: '#1B4332' }}>{acc.bank_account_name || 'PT Antigravity Global SaaS'}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Upgrade Order Modal — 2 Step */}
      {showOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div className="animate-scale-in" style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1B4332', margin: 0 }}>
                {paymentStep === 1 ? 'Konfirmasi Upgrade Paket' : '💳 Detail Pembayaran'}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            {/* Step 1: Konfirmasi */}
            {paymentStep === 1 && (
              <>
                <div style={{ textAlign: 'center', padding: '12px 0 20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Anda memilih paket <strong style={{ color: '#1B4332', textTransform: 'capitalize' }}>{selectedPlan}</strong></div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1B4332' }}>{getPlanPriceInfo(selectedPlan).display}</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2D6A4F', marginBottom: 8 }}>⚡ Saluran Pembayaran Otomatis:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>📱 QRIS (GoPay / OVO / Dana / ShopeePay)</div><div style={{ fontSize: 11, color: '#64748b' }}>Auto aktif 24/7</div></div>
                      <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>Auto Aktif</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                      <div><div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7' }}>🏦 Virtual Account (BCA, Mandiri, BRI)</div><div style={{ fontSize: 11, color: '#64748b' }}>Nomor VA otomatis</div></div>
                      <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>Verif. Cepat</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const accounts = (Array.isArray(globalSettings?.bank_accounts) && globalSettings.bank_accounts.length > 0)
                    ? globalSettings.bank_accounts
                    : [{
                        bank_name: globalSettings?.bank_name || 'BANK BCA',
                        bank_account_no: globalSettings?.bank_account_no || '8837 001 992',
                        bank_account_name: globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'
                      }];
                  return (
                    <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20, fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: '#1B4332', marginBottom: 8 }}>🏦 Rekening Manual Alternatif ({accounts.length} Bank Tersedia):</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {accounts.map((acc, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                            <div>
                              <span style={{ fontSize: 11, color: '#1B4332', fontWeight: 700 }}>{acc.bank_name}</span>: <strong style={{ fontWeight: 800, color: '#1B4332' }}>{acc.bank_account_no || acc.bank_account_number}</strong>
                              <div style={{ fontSize: 10.5, color: '#64748b' }}>a.n. {acc.bank_account_name || 'PT Antigravity Global SaaS'}</div>
                            </div>
                            <button onClick={() => copyToClipboard(acc.bank_account_no || acc.bank_account_number, `Nomor Rekening ${acc.bank_name}`)} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#1B4332', cursor: 'pointer' }}>Salin</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleCloseModal} style={{ flex: 1, padding: 12, border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Batal</button>
                  <button onClick={submitUpgradeRequest} disabled={isSubmitting} style={{ flex: 2, padding: 12, border: 'none', borderRadius: 10, background: '#1B4332', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                    {isSubmitting ? 'Memproses...' : '⚡ Bayar & Aktifkan Paket'}
                  </button>
                </div>
              </>
            )}

            {/* Step 2: QRIS & VA */}
            {paymentStep === 2 && (
              <>
                <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#1B4332' }}>Permintaan Berhasil Dikirim!</h4>
                  {paymentData && (
                    <>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '6px 0 0' }}>Invoice: <strong>{paymentData.invoice_number}</strong> · Jatuh tempo: <strong>{paymentData.due_date?.split(' ')[0]}</strong></p>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#1B4332', marginTop: 4 }}>{formatRupiah(paymentData.amount)}</div>
                    </>
                  )}
                </div>

                {paymentData?.payment_channels?.qris && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#15803d', marginBottom: 6 }}>📱 Bayar via QRIS</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>GoPay · OVO · Dana · ShopeePay · Mobile Banking</div>
                    <div style={{ background: '#fff', border: '1px dashed #86efac', borderRadius: 8, padding: '10px', fontSize: 10, wordBreak: 'break-all', color: '#374151', marginBottom: 8, fontFamily: 'monospace' }}>
                      {paymentData.payment_channels.qris.qr_string}
                    </div>
                    <button onClick={() => copyToClipboard(paymentData.payment_channels.qris.qr_string, 'QRIS String')} style={{ width: '100%', padding: '8px', border: '1px solid #86efac', borderRadius: 8, background: '#fff', color: '#15803d', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>📋 Salin QRIS String</button>
                  </div>
                )}

                {paymentData?.payment_channels?.virtual_accounts?.length > 0 && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1d4ed8', marginBottom: 10 }}>🏦 Virtual Account</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {paymentData.payment_channels.virtual_accounts.map((va, i) => (
                        <div key={i} style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8' }}>{va.bank}</div>
                            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.04em' }}>{va.va_number}</div>
                            <div style={{ fontSize: 10, color: '#64748b' }}>a.n. {va.name}</div>
                          </div>
                          <button onClick={() => copyToClipboard(va.va_number, `VA ${va.bank}`)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}>Salin</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#166534', lineHeight: 1.6, border: '1px solid #bbf7d0', marginBottom: 16 }}>
                  ⚠️ Setelah pembayaran diterima, langganan akan otomatis aktif. Email konfirmasi akan dikirim ke akun Anda.
                </div>
                <button onClick={handleCloseModal} style={{ width: '100%', padding: 12, border: 'none', borderRadius: 10, background: '#1B4332', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Selesai &amp; Tutup</button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
