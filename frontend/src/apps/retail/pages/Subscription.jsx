import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import { FEATURE_LABELS } from '../../../lib/subscriptionFeatures';

const PLAN_COLOR = {
  free: 'var(--text-muted)',
  basic: 'var(--primary-500)',
  pro: '#8b5cf6',
};

export default function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenantInfo, setTenantInfo] = useState(null);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState(null);
  const [categoryPromo, setCategoryPromo] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Step 1 = konfirmasi, Step 2 = tampilkan QRIS/VA setelah submit
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);

  const fetchData = async () => {
    try {
      const [staffRes, subRes] = await Promise.all([
        api.get('/retail/staff'),
        api.get('/subscription/current')
      ]);
      setStaffCount(staffRes.data.length || 0);
      setPendingReq(subRes.data.data);
      setCategoryPromo(subRes.data.category_promo || null);
      setGlobalSettings(subRes.data.global_settings || null);
      setPlans(subRes.data.plans || []);
      setInvoices(subRes.data.invoices || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/subscription/request', { plan: selectedPlan.id });
      setPaymentData(res.data.payment_data || null);
      setPaymentStep(2);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setShowOrderModal(false);
    setPaymentStep(1);
    setPaymentData(null);
    setSelectedPlan(null);
  };

  const copyToClipboard = (text, label = 'Teks') => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} berhasil disalin!`);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPlan = user?.subscription_plan || 'free';
  
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const getPlanPriceInfo = (planId) => {
    if (!planId || planId === 'free') return { display: 'Rp 0', numeric: 0, discounted: false };

    const planOverride = plans.find(p => p.plan_key === planId)?.price;
    const basePrices = {
      basic: globalSettings?.pricing_basic_monthly || 49000,
      pro: globalSettings?.pricing_pro_monthly || 149000
    };
    const base = planOverride ?? (basePrices[planId] || 0);

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
  
  const describePlan = (plan) => {
    const bullets = [];
    bullets.push(plan.plan_key === 'free' ? 'Masa Aktif 3-5 Hari' : 'Tanpa Batas Waktu');
    bullets.push(plan.max_staff === null ? 'Pegawai Tak Terbatas' : `Maks ${plan.max_staff} Pegawai`);
    bullets.push(plan.max_products === null ? 'Produk Tak Terbatas' : `Maks ${plan.max_products} Produk`);
    Object.entries(FEATURE_LABELS).forEach(([key, { label }]) => {
      if (plan.features?.[key]) bullets.push(label);
    });
    return bullets;
  };

  const PLANS = plans.map(plan => ({
    id: plan.plan_key,
    name: plan.name,
    features: describePlan(plan),
    color: PLAN_COLOR[plan.plan_key] || 'var(--primary-500)'
  }));

  const currentPlanLimits = plans.find(p => p.plan_key === currentPlan);
  const staffLimit = currentPlanLimits ? (currentPlanLimits.max_staff ?? '∞') : (currentPlan === 'free' ? 1 : (currentPlan === 'basic' ? 5 : '∞'));
  const staffPercentage = staffLimit === '∞' ? 0 : (staffCount / staffLimit) * 100;

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Lunas', bg: '#dcfce7', color: '#15803d' };
    if (status === 'overdue') return { label: 'Jatuh Tempo', bg: '#fee2e2', color: '#dc2626' };
    return { label: 'Belum Dibayar', bg: '#fef9c3', color: '#ca8a04' };
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
      </div>

      <style>{`
        .subscription-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .subscription-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="grid-2 subscription-grid">
        
        {/* Current Status Card */}
        <div className="flex-col" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 140, height: 140, background: 'var(--primary-500)', opacity: 0.05, borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                   <span className="badge badge-blue" style={{ marginBottom: 8, display: 'inline-block', padding: '4px 12px', borderRadius: 20 }}>PAKET AKTIF</span>
                   <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{currentPlan.toUpperCase()}</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Status Akun</div>
                   {pendingReq ? (
                      <div style={{ color: 'var(--warning-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="animate-pulse">⏳</span> Menunggu Aktivasi
                      </div>
                   ) : (
                      <div style={{ color: 'var(--success-500)', fontWeight: 700 }}>✓ Terverifikasi</div>
                   )}
                </div>
            </div>

            <div style={{ padding: 20, background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>Kuota Pegawai</span>
                  <span style={{ fontWeight: 800 }}>{staffCount} / {staffLimit}</span>
               </div>
               <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, staffPercentage)}%`, height: '100%', background: staffPercentage > 90 ? 'var(--danger-500)' : 'var(--primary-500)', transition: 'width 1s ease' }} />
               </div>
               <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                  {currentPlan === 'free' 
                    ? 'Anda menggunakan paket Gratis. Batasan 4 pegawai berlaku.' 
                    : `Anda dalam paket ${currentPlan}. Nikmati kapasitas yang lebih luas.`}
               </p>
            </div>
          </div>

          {categoryPromo && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(217, 70, 239, 0.08))',
              border: '1px dashed #8b5cf6',
              borderRadius: 16,
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              <div style={{ fontSize: 28 }}>🎉</div>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#8b5cf6' }}>
                  Promo Khusus Kategori {categoryPromo.category_name} Aktif!
                </h4>
                <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {categoryPromo.text || `Selamat! Akun Anda memenuhi syarat untuk diskon upgrade sebesar ${categoryPromo.discount_pct}%.`}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
             {PLANS.map(plan => (
               <div key={plan.id} className="card" style={{ padding: 24, border: currentPlan === plan.id ? `2px solid ${plan.color}` : '1px solid var(--border-color)', opacity: currentPlan !== plan.id && plan.id === 'free' ? 0.6 : 1, transform: currentPlan === plan.id ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.3s ease' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4, color: plan.color }}>{plan.name}</div>
                  
                  {(() => {
                    const priceInfo = getPlanPriceInfo(plan.id);
                    return (
                      <div style={{ marginBottom: 20 }}>
                        {priceInfo.discounted ? (
                          <div>
                            <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: 8 }}>
                              {priceInfo.original}
                            </span>
                            <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                              -{priceInfo.discountPct}%
                            </span>
                            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, color: '#10b981' }}>
                              {priceInfo.display}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 24, fontWeight: 900 }}>{priceInfo.display}</div>
                        )}
                      </div>
                    );
                  })()}

                  <ul style={{ padding: 0, margin: '0 0 24px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                     {plan.features.map((f, i) => (
                       <li key={i} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--success-500)' }}>✓</span> {f}
                       </li>
                     ))}
                  </ul>
                  {(() => {
                    const PLAN_TIER = { free: 0, basic: 1, pro: 2, enterprise: 3 };
                    const curTier = PLAN_TIER[currentPlan?.toLowerCase()] ?? 0;
                    const targetTier = PLAN_TIER[plan.id?.toLowerCase()] ?? 0;
                    const isCurrent = currentPlan?.toLowerCase() === plan.id?.toLowerCase();
                    const isDowngrade = targetTier < curTier || (plan.id === 'free' && currentPlan !== 'free');

                    if (isCurrent) {
                      return <button className="btn btn-secondary" style={{ width: '100%' }} disabled>Paket Anda Saat Ini</button>;
                    }
                    if (pendingReq?.plan === plan.id) {
                      return <button className="btn btn-warning" style={{ width: '100%', cursor: 'default' }} disabled>Dalam Proses Aktivasi...</button>;
                    }
                    if (isDowngrade) {
                      return (
                        <button 
                          className="btn btn-secondary" 
                          style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }} 
                          disabled 
                          title="Downgrade paket tidak tersedia secara langsung"
                        >
                          Downgrade Tidak Tersedia
                        </button>
                      );
                    }
                    return (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', background: plan.id === 'pro' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : '', border: 'none' }}
                        onClick={() => { setSelectedPlan(plan); setPaymentStep(1); setPaymentData(null); setShowOrderModal(true); }}
                      >
                        Pilih &amp; Upgrade Paket
                      </button>
                    );
                  })()}
               </div>
             ))}
          </div>
        </div>

        {/* Sidebar — Riwayat Invoice */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 800 }}>🧾 Riwayat Invoice</h3>

          {invoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontSize: 13 }}>Belum ada riwayat pembayaran.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {invoices.map(inv => {
                const badge = getStatusBadge(inv.status);
                return (
                  <div key={inv.id} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{inv.id}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, padding: '2px 8px', borderRadius: 10 }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Paket {inv.plan}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.due_date ? `Jatuh tempo: ${inv.due_date}` : inv.date}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--primary-500)' }}>
                        {formatRupiah(inv.amount)}
                      </div>
                    </div>
                    {inv.status === 'unpaid' && (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 10, fontSize: 12 }}
                        onClick={async () => {
                          try {
                            await api.post('/payment/simulate-pay', { invoice_number: inv.id, payment_method: 'Simulasi' });
                            alert('✅ Pembayaran berhasil disimulasikan! Paket akan segera aktif.');
                            fetchData();
                          } catch (e) {
                            alert(e.response?.data?.message || 'Gagal simulasi pembayaran');
                          }
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

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />
          
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Kendala saat upgrade? Hubungi tim support kami.
          </p>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/support')}>Hubungi Support BIZORA</button>
        </div>

      </div>

      {/* MODAL ORDER & PEMBAYARAN MULTI-CHANNEL */}
      <Modal isOpen={showOrderModal} onClose={handleCloseModal} title={paymentStep === 1 ? 'Konfirmasi & Pembayaran Langganan' : '💳 Detail Pembayaran'} maxWidth="540px">
         <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

           {/* ── STEP 1: Konfirmasi Paket ── */}
           {paymentStep === 1 && (
             <>
               {(() => {
                  const priceInfo = getPlanPriceInfo(selectedPlan?.id);
                  return (
                    <div style={{ textAlign: 'center', padding: '6px 0' }}>
                       <div style={{ fontSize: 36, marginBottom: 6 }}>💳</div>
                       <p style={{ fontSize: 15, margin: 0 }}>Pilihan Paket: <strong>{selectedPlan?.name}</strong></p>
                       {priceInfo.discounted ? (
                         <div style={{ marginTop: 6 }}>
                           <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 13, marginRight: 8 }}>
                             {priceInfo.original}
                           </span>
                           <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                             POTONGAN {priceInfo.discountPct}% KATEGORI
                           </span>
                           <h2 style={{ fontSize: 28, fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                             {priceInfo.display}
                           </h2>
                         </div>
                       ) : (
                         <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary-500)', margin: '6px 0' }}>
                           {priceInfo.display}
                         </h2>
                       )}
                    </div>
                  );
               })()}

               {/* Payment channel info */}
               <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: 13.5, fontWeight: 700, color: '#1e293b' }}>
                    ⚡ Saluran Pembayaran Otomatis (Instant Activation):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                        <div>
                           <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>📱 QRIS (GoPay / OVO / Dana / ShopeePay / Mobile Banking)</div>
                           <div style={{ fontSize: 12, color: '#64748b' }}>Scan QR langsung aktif instan 24/7</div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: 10 }}>Auto Aktif</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                        <div>
                           <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7' }}>🏦 Virtual Account (BCA, Mandiri, BRI)</div>
                           <div style={{ fontSize: 12, color: '#64748b' }}>Nomor VA otomatis terverifikasi sistem</div>
                        </div>
                        <span className="badge badge-primary" style={{ fontSize: 10 }}>Verifikasi Cepat</span>
                     </div>
                  </div>
               </div>

               <div style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>🏦 Rekening Manual Alternatif:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span>{globalSettings?.bank_name || 'BCA'}: <strong>{globalSettings?.bank_account_no || '8837 001 992'}</strong></span>
                     <span style={{ color: 'var(--text-muted)' }}>a.n. {globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'}</span>
                  </div>
               </div>

               <div className="modal__actions" style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCloseModal} disabled={isSubmitting}>Batal</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleOrder} disabled={isSubmitting}>
                     {isSubmitting ? 'Memproses...' : '⚡ Bayar & Aktifkan Paket'}
                  </button>
               </div>
             </>
           )}

           {/* ── STEP 2: Tampilkan QRIS & VA setelah submit ── */}
           {paymentStep === 2 && paymentData && (
             <>
               <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                 <div style={{ fontSize: 40, marginBottom: 6 }}>✅</div>
                 <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Permintaan Berhasil Dikirim!</h3>
                 <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>
                   Invoice: <strong>{paymentData.invoice_number}</strong> · Jatuh tempo: <strong>{paymentData.due_date?.split(' ')[0]}</strong>
                 </p>
                 <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary-500)', marginTop: 4 }}>
                   {formatRupiah(paymentData.amount)}
                 </div>
               </div>

               {/* QRIS */}
               {paymentData.payment_channels?.qris && (
                 <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px' }}>
                   <div style={{ fontWeight: 700, fontSize: 13, color: '#15803d', marginBottom: 8 }}>📱 Bayar via QRIS</div>
                   <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>GoPay · OVO · Dana · ShopeePay · Mobile Banking · Semua QRIS</div>
                   <div style={{ background: '#fff', border: '1px dashed #86efac', borderRadius: 8, padding: '10px 12px', fontSize: 10, wordBreak: 'break-all', color: '#374151', marginBottom: 8, fontFamily: 'monospace' }}>
                     {paymentData.payment_channels.qris.qr_string}
                   </div>
                   <button
                     className="btn btn-secondary"
                     style={{ width: '100%', fontSize: 12 }}
                     onClick={() => copyToClipboard(paymentData.payment_channels.qris.qr_string, 'QRIS String')}
                   >
                     📋 Salin QRIS String
                   </button>
                 </div>
               )}

               {/* Virtual Accounts */}
               {paymentData.payment_channels?.virtual_accounts?.length > 0 && (
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
                         <button
                           style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}
                           onClick={() => copyToClipboard(va.va_number, `VA ${va.bank}`)}
                         >
                           Salin
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                 ⚠️ Setelah pembayaran diterima, langganan akan otomatis aktif. Email konfirmasi akan dikirim ke akun Anda.
               </div>

               <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCloseModal}>
                 Selesai &amp; Tutup
               </button>
             </>
           )}

           {/* Fallback jika paymentData null di step 2 */}
           {paymentStep === 2 && !paymentData && (
             <>
               <div style={{ textAlign: 'center', padding: '20px 0' }}>
                 <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                 <p>Permintaan upgrade berhasil dikirim! Tim kami akan memverifikasi pembayaran Anda.</p>
               </div>
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCloseModal}>Tutup</button>
             </>
           )}

         </div>
      </Modal>
    </div>
  );
}
