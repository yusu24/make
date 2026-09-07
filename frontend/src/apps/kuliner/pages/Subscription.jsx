import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../contexts/AuthContext'
import KulinerAdminLayout from '../components/KulinerAdminLayout'
import Modal from '../../../components/Modal'
import PaymentProofUpload from '../../../components/PaymentProofUpload'

export default function Subscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState(null);
  const [categoryPromo, setCategoryPromo] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [apiPlans, setApiPlans] = useState([]);
  
  const [menuCount, setMenuCount] = useState(0);
  const [tableCount, setTableCount] = useState(0);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Step 1 = konfirmasi, Step 2 = tampilkan QRIS/VA setelah submit
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const fetchData = async () => {
    try {
      const [productRes, settingsRes, subRes] = await Promise.all([
        api.get('/kuliner/admin/products'),
        api.get('/kuliner/admin/settings'),
        api.get('/subscription/current')
      ]);

      const products = Array.isArray(productRes.data) ? productRes.data : (productRes.data.data || []);
      const settings = settingsRes.data.data || settingsRes.data || {};

      setMenuCount(products.length);
      setTableCount(parseInt(settings.total_tables) || 0);

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

  const handleOrderUpgrade = async (planId) => {
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

  const copyToClipboard = (text, label = 'Teks') => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} berhasil disalin!`));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: '#D97706' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid #FEF3C7', borderTopColor: '#D97706', borderRadius: '50%' }} />
      </div>
    );
  }

  const currentPlan = user?.subscription_plan || 'free';

  const FEATURE_LABELS = {
    menu: 'Manajemen Menu',
    orders: 'Kasir & KDS Pesanan',
    tables: 'Manajemen Meja & QR Order',
    recipes: 'Resep & HPP (BOM)',
    ingredients: 'Stok Bahan Baku Dapur',
    modifiers: 'Varian & Topping',
    addons: 'Add-on & Extra',
    bundles: 'Paket Menu Bundle',
    waste: 'Catatan Limbah & Waste',
    purchases: 'Pembelian Bahan Baku',
    shifts: 'Shift Kasir & History',
    analytics: 'Menu Engineering Analytics',
    delivery: 'Layanan Delivery',
    reports: 'Laporan Penjualan & Laba Rugi',
    multiUser: 'Multi-User Akses Staf',
    exportExcel: 'Export Excel / PDF',
    prioritySupport: 'Priority Support 24/7',
  };

  const describePlan = (plan) => {
    const bullets = [];
    bullets.push(plan.plan_key === 'free' ? 'Masa Aktif 3-5 Hari' : 'Tanpa Batas Waktu');
    bullets.push(plan.max_products === null ? 'Menu Tak Terbatas' : `Maks ${plan.max_products} Menu Kuliner`);
    bullets.push(plan.max_staff === null ? 'Pegawai Tak Terbatas' : `Maks ${plan.max_staff} Staf/Pegawai`);
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
      features: ['Masa Aktif 3-5 Hari', 'Maks 10 Menu Kuliner', 'Maks 1 Staf/Pegawai', 'Laporan Pesanan Dasar'],
      color: '#64748b'
    },
    { 
      id: 'basic', 
      name: 'Basic', 
      price: getPlanPriceInfo('basic').display, 
      features: ['Tanpa Batas Waktu', 'Maks 50 Menu Kuliner', 'Maks 3 Staf/Pegawai', 'Resep & Bahan Baku', 'Shift Kasir'],
      color: '#EA580C'
    },
    { 
      id: 'pro', 
      name: 'Pro (Terbaik)', 
      price: getPlanPriceInfo('pro').display, 
      features: ['Tanpa Batas Waktu', 'Menu Tak Terbatas', 'Pegawai Tak Terbatas', 'Menu Engineering Analytics', 'Multi-User & Export'],
      color: '#D97706' 
    }
  ];

  const PLANS = (apiPlans && apiPlans.length > 0)
    ? apiPlans.map(plan => ({
        id: plan.plan_key,
        name: plan.name,
        price: plan.plan_key === 'free' ? 'Rp 0' : getPlanPriceInfo(plan.plan_key, plan.price).display,
        features: describePlan(plan),
        color: plan.plan_key === 'free' ? '#64748b' : (plan.plan_key === 'basic' ? '#EA580C' : '#D97706')
      }))
    : DEFAULT_PLANS;

  const currentPlanLimits = apiPlans?.find(p => p.plan_key === currentPlan);
  const menuLimit = currentPlanLimits ? (currentPlanLimits.max_products ?? '∞') : (currentPlan === 'free' ? 10 : (currentPlan === 'basic' ? 50 : '∞'));
  const menuPercentage = menuLimit === '∞' ? 0 : (menuCount / menuLimit) * 100;

  const tableLimit = currentPlan === 'free' ? 5 : (currentPlan === 'basic' ? 20 : '∞');
  const tablePercentage = tableLimit === '∞' ? 0 : (tableCount / tableLimit) * 100;

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Paket Langganan & Upgrade</h1>
        <div className="kd-topbar-actions" />
      </div>

      <div className="kd-content">
        <div className="animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          border-color: #EA580C;
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(234, 88, 12, 0.12);
        }
        .btn-upgrade {
          background: #EA580C;
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
          background: #D97706;
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
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #FEF3C7', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.02)' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: '#EA580C', opacity: 0.03, borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#EA580C', letterSpacing: '0.05em', textTransform: 'uppercase', background: '#FFF7ED', padding: '6px 14px', borderRadius: 20 }}>Paket Langganan</span>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: '#EA580C', margin: '8px 0 0 0', letterSpacing: '-0.03em' }}>{currentPlan.toUpperCase()}</h1>
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
              
              {/* Menu Progress */}
              <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Kuota Menu</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#EA580C' }}>{menuCount} / {menuLimit}</span>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, menuPercentage)}%`, height: '100%', background: menuPercentage >= 100 ? '#EF4444' : '#EA580C', transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 10, margin: '10px 0 0 0', lineHeight: 1.4 }}>
                  {menuLimit === '∞' ? 'Kapasitas menu Anda tidak terbatas.' : `Maksimal menu aktif adalah ${menuLimit} items.`}
                </p>
              </div>

              {/* Meja Progress */}
              <div style={{ padding: 20, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Kapasitas Meja</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#EA580C' }}>{tableCount} / {tableLimit}</span>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, tablePercentage)}%`, height: '100%', background: tablePercentage >= 100 ? '#EF4444' : '#D97706', transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 10, margin: '10px 0 0 0', lineHeight: 1.4 }}>
                  {tableLimit === '∞' ? 'Kapasitas meja makan tidak terbatas.' : `Maksimal meja makan aktif adalah ${tableLimit} meja.`}
                </p>
              </div>

            </div>

            {pendingReq && (
              <PaymentProofUpload
                pendingReq={pendingReq}
                globalSettings={globalSettings}
                onUploadSuccess={fetchData}
              />
            )}
          </div>

          {/* Promo Banner */}
          {categoryPromo && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.06), rgba(217, 119, 6, 0.06))',
              border: '1px dashed #EA580C',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{ fontSize: 28 }}>🍳</div>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#EA580C' }}>
                  Promo Spesial Kuliner ({categoryPromo.category_name}) Aktif!
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                  {categoryPromo.text || `Dapatkan diskon upgrade sebesar ${categoryPromo.discount_pct}% khusus untuk mengembangkan bisnis kuliner Anda.`}
                </p>
              </div>
            </div>
          )}

          {/* Package Selection Cards */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#EA580C', marginBottom: 16 }}>Daftar Paket Upgrade</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {PLANS.map((plan) => {
                const PLAN_TIER = { free: 0, basic: 1, pro: 2, enterprise: 3 };
                const curTier = PLAN_TIER[currentPlan?.toLowerCase()] ?? 0;
                const targetTier = PLAN_TIER[plan.id?.toLowerCase()] ?? 0;
                const isCurrent = currentPlan?.toLowerCase() === plan.id?.toLowerCase();
                const isDowngrade = targetTier < curTier || (plan.id === 'free' && currentPlan !== 'free');
                const isPromo = plan.id !== 'free' && categoryPromo && categoryPromo.discount_pct > 0;
                
                return (
                  <div key={plan.id} className="plan-card" style={isCurrent ? { borderColor: plan.color, borderWidth: 2 } : (isDowngrade ? { opacity: 0.6 } : {})}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#EA580C' }}>{plan.name}</span>
                      {isCurrent && (
                        <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                          AKTIF
                        </span>
                      )}
                      {isPromo && !isCurrent && (
                        <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
                          PROMO {categoryPromo.discount_pct}%
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      {isPromo ? (
                        <>
                          <div style={{ fontSize: 12, textDecoration: 'line-through', color: '#94a3b8', marginBottom: 2 }}>
                            {plan.price}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#EA580C' }}>
                            {formatRupiah(getPlanPriceInfo(plan.id, apiPlans?.find(p => p.plan_key === plan.id)?.price).numeric)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#EA580C' }}>
                          {plan.price}
                        </div>
                      )}
                    </div>

                    <ul style={{ padding: 0, margin: '0 0 24px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: '#475569' }}>
                      {plan.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ color: '#EA580C', fontWeight: 800 }}>✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className="btn-upgrade"
                      disabled={isCurrent || isDowngrade || pendingReq?.plan === plan.id}
                      onClick={() => handleOrderUpgrade(plan.id)}
                      style={
                        isCurrent 
                          ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }
                          : isDowngrade
                            ? { background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', border: '1px solid #e2e8f0' }
                            : (plan.id === 'pro' ? { background: '#EA580C' } : {})
                      }
                    >
                      {isCurrent 
                        ? 'Paket Aktif Saat Ini' 
                        : (pendingReq?.plan === plan.id 
                            ? 'Menunggu Aktivasi' 
                            : (isDowngrade ? 'Downgrade Tidak Tersedia' : 'Pilih & Upgrade Paket'))}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Riwayat Invoice & Bank Info */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #FEF3C7', borderRadius: 20, padding: 28, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.02)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800, color: '#EA580C' }}>🧾 Riwayat Invoice</h3>

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
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#EA580C' }}>{formatRupiah(inv.amount)}</div>
                      </div>
                      {inv.status === 'unpaid' && (
                        <button
                          style={{ width: '100%', marginTop: 10, padding: '8px', border: 'none', borderRadius: 8, background: '#EA580C', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
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
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                    Rekening Manual Alternatif ({accounts.length} Bank)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {accounts.map((acc, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#EA580C' }}>{acc.bank_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: '#EA580C', letterSpacing: '0.03em' }}>{acc.bank_account_no || acc.bank_account_number}</div>
                          <button
                            onClick={() => copyToClipboard(acc.bank_account_no || acc.bank_account_number, `Nomor Rekening ${acc.bank_name}`)}
                            style={{ background: '#FFF7ED', border: '1px solid #FED7AA', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#EA580C', cursor: 'pointer' }}
                          >Salin</button>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>a.n. <strong style={{ color: '#EA580C' }}>{acc.bank_account_name || 'PT Antigravity Global SaaS'}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* MODAL ORDER & PEMBAYARAN 2-STEP */}
      <Modal isOpen={showOrderModal} onClose={handleCloseModal} title={paymentStep === 1 ? 'Konfirmasi & Pembayaran Langganan' : '💳 Detail Pembayaran'} maxWidth="540px">
         <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

           {/* ── STEP 1: Konfirmasi Paket ── */}
           {paymentStep === 1 && (() => {
             const planObj = apiPlans?.find(p => p.plan_key === selectedPlan);
             const priceInfo = getPlanPriceInfo(selectedPlan, planObj?.price);
             return (
               <>
                 <div style={{ textAlign: 'center', padding: '6px 0' }}>
                   <div style={{ fontSize: 36, marginBottom: 6 }}>💳</div>
                   <p style={{ fontSize: 15, margin: 0 }}>Pilihan Paket: <strong>{planObj?.name || selectedPlan?.toUpperCase()}</strong></p>
                   {priceInfo.discounted ? (
                     <div style={{ marginTop: 6 }}>
                       <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: 13, marginRight: 8 }}>{priceInfo.original}</span>
                       <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>POTONGAN {priceInfo.discountPct}% KATEGORI</span>
                       <h2 style={{ fontSize: 28, fontWeight: 900, color: '#10b981', margin: '4px 0' }}>{priceInfo.display}</h2>
                     </div>
                   ) : (
                     <h2 style={{ fontSize: 28, fontWeight: 900, color: '#EA580C', margin: '6px 0' }}>{priceInfo.display}</h2>
                   )}
                 </div>
                 <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                   <h4 style={{ margin: '0 0 10px 0', fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>⚡ Saluran Pembayaran Otomatis:</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                       <div><div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>📱 QRIS (GoPay / OVO / Dana / ShopeePay)</div><div style={{ fontSize: 12, color: '#64748b' }}>Scan QR langsung aktif instan 24/7</div></div>
                       <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>Auto Aktif</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                       <div><div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7' }}>🏦 Virtual Account (BCA, Mandiri, BRI)</div><div style={{ fontSize: 12, color: '#64748b' }}>Nomor VA otomatis terverifikasi sistem</div></div>
                       <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>Verifikasi Cepat</span>
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
                      <div style={{ background: '#fff8f0', padding: '12px 16px', borderRadius: 10, border: '1px solid #ffedd5', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: '#ea580c', marginBottom: 8 }}>🏦 Rekening Transfer Bank Manual ({accounts.length} Bank Tersedia):</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {accounts.map((acc, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '6px 10px', borderRadius: 8, border: '1px solid #fed7aa' }}>
                              <div>
                                <span style={{ fontWeight: 700, color: '#ea580c' }}>{acc.bank_name}</span>: <strong style={{ color: '#334155' }}>{acc.bank_account_no || acc.bank_account_number}</strong>
                                <div style={{ fontSize: 10.5, color: '#64748b' }}>a.n. {acc.bank_account_name || 'PT Antigravity Global SaaS'}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(acc.bank_account_no || acc.bank_account_number, `No Rekening ${acc.bank_name}`)}
                                style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#ea580c', cursor: 'pointer' }}
                              >
                                Salin
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                 <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                   <button onClick={handleCloseModal} disabled={isSubmitting} style={{ flex: 1, padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Batal</button>
                   <button onClick={submitUpgradeRequest} disabled={isSubmitting} style={{ flex: 2, padding: '10px 16px', border: 'none', borderRadius: 8, background: '#EA580C', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                     {isSubmitting ? 'Memproses...' : '⚡ Bayar & Aktifkan Paket'}
                   </button>
                 </div>
               </>
             );
           })()}

           {/* ── STEP 2: QRIS & VA setelah submit ── */}
           {paymentStep === 2 && (
             <>
               <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                 <div style={{ fontSize: 40, marginBottom: 6 }}>✅</div>
                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Permintaan Berhasil Dikirim!</h3>
                 {paymentData && (
                   <>
                     <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>Invoice: <strong>{paymentData.invoice_number}</strong> · Jatuh tempo: <strong>{paymentData.due_date?.split(' ')[0]}</strong></p>
                     <div style={{ fontSize: 22, fontWeight: 900, color: '#EA580C', marginTop: 4 }}>{formatRupiah(paymentData.amount)}</div>
                   </>
                 )}
               </div>
               {paymentData?.payment_channels?.qris && (
                 <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px' }}>
                   <div style={{ fontWeight: 700, fontSize: 13, color: '#15803d', marginBottom: 6 }}>📱 Bayar via QRIS</div>
                   <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>GoPay · OVO · Dana · ShopeePay · Mobile Banking</div>
                   <div style={{ background: '#fff', border: '1px dashed #86efac', borderRadius: 8, padding: '10px 12px', fontSize: 10, wordBreak: 'break-all', color: '#374151', marginBottom: 8, fontFamily: 'monospace' }}>
                     {paymentData.payment_channels.qris.qr_string}
                   </div>
                   <button onClick={() => copyToClipboard(paymentData.payment_channels.qris.qr_string, 'QRIS String')} style={{ width: '100%', padding: '8px', border: '1px solid #86efac', borderRadius: 8, background: '#fff', color: '#15803d', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>📋 Salin QRIS String</button>
                 </div>
               )}
               {paymentData?.payment_channels?.virtual_accounts?.length > 0 && (
                 <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 16px' }}>
                   <div style={{ fontWeight: 700, fontSize: 13, color: '#1d4ed8', marginBottom: 10 }}>🏦 Virtual Account</div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                     {paymentData.payment_channels.virtual_accounts.map((va, i) => (
                       <div key={i} style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                           <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{va.bank}</div>
                           <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.04em' }}>{va.va_number}</div>
                           <div style={{ fontSize: 10, color: '#64748b' }}>a.n. {va.name}</div>
                         </div>
                         <button onClick={() => copyToClipboard(va.va_number, `VA ${va.bank}`)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}>Salin</button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
                <PaymentProofUpload
                  pendingReq={pendingReq || paymentData}
                  globalSettings={globalSettings}
                  onUploadSuccess={() => {
                    fetchData();
                    handleCloseModal();
                  }}
                  style={{ marginTop: 10 }}
                />

                <div style={{ background: '#fff8f0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#64748b', lineHeight: 1.6, border: '1px solid #ffedd5' }}>
                  ⚠️ Setelah pembayaran dan bukti transfer diunggah, Super Admin akan segera memverifikasi dan mengaktifkan paket Anda.
                </div>
                <button onClick={handleCloseModal} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: 10, background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Tutup</button>
             </>
           )}

         </div>
      </Modal>

    </div>
    </div>
    </KulinerAdminLayout>
  );
}
