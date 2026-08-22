import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { api } from '../../../../../lib/api';
import Modal from '../../../../../components/Modal';

export const SellerSubscriptionView: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState<any>(null);
  const [categoryPromo, setCategoryPromo] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const subRes = await api.get('/subscription/current');
      setPendingReq(subRes.data?.data || null);
      setCategoryPromo(subRes.data?.category_promo || null);
      setGlobalSettings(subRes.data?.global_settings || null);
      setPlans(subRes.data?.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPlanKey = user?.subscription_plan || 'free';

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const getPlanPriceInfo = (planKey: string, dbPrice?: number) => {
    if (!planKey || planKey === 'free') return { display: 'Gratis', numeric: 0, discounted: false, original: '', discountPct: 0 };

    const basePrices: Record<string, number> = {
      basic: globalSettings?.price_basic || 79000,
      pro: globalSettings?.price_pro || 149000,
    };
    const base = dbPrice ?? basePrices[planKey] ?? 0;

    if (categoryPromo && categoryPromo.discount_pct > 0) {
      const discount = Math.round(base * (categoryPromo.discount_pct / 100));
      const finalPrice = base - discount;
      return {
        original: formatRupiah(base) + ' / bln',
        display: formatRupiah(finalPrice) + ' / bln',
        numeric: finalPrice,
        discounted: true,
        discountPct: categoryPromo.discount_pct,
      };
    }

    return {
      original: '',
      display: formatRupiah(base) + ' / bln',
      numeric: base,
      discounted: false,
      discountPct: 0,
    };
  };

  const handleOrder = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await api.post('/subscription/request', { plan: selectedPlan });
      fetchData();
      setShowOrderModal(false);
      alert('Permintaan upgrade langganan berhasil diajukan! Invoice tagihan telah dibuat.');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengirim pengajuan upgrade.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultPlans = [
    {
      plan_key: 'free',
      name: 'Free Starter',
      price: 0,
      description: 'Coba gratis untuk menguji integrasi marketplace.',
      features: ['Inventory & Gudang', '1 User Akses Kasir'],
    },
    {
      plan_key: 'basic',
      name: 'Basic Seller',
      price: 79000,
      description: 'Cocok untuk toko berkembang di multiple marketplace.',
      features: ['Inventory & Gudang Seller', 'Integrasi Marketplace (Shopee, Tokopedia, TikTok)', 'Sync Stok Otomatis', 'Pengiriman & Resi', 'Laporan Penjualan', 'Export Excel/PDF'],
    },
    {
      plan_key: 'pro',
      name: 'Pro Enterprise',
      price: 149000,
      description: 'Solusi lengkap untuk multi-toko & bisnis volume tinggi.',
      features: ['Semua Fitur Basic', 'Multi-User & Hak Akses Staf', 'Sync Stok & Harga Real-Time Unilimited', 'Multi-Gudang', 'Priority Support 24/7'],
    },
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-indigo-700/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white">Paket & Langganan Seller</h2>
          </div>
          <p className="text-xs text-slate-300">
            Kelola paket langganan aktif toko Anda dan nikmati fitur omnichannel marketplace tanpa batas.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs flex items-center gap-3">
          <div>
            <div className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider">Paket Anda Saat Ini</div>
            <div className="text-base font-black text-emerald-400 capitalize">{currentPlanKey}</div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Pending Request Alert */}
      {pendingReq && pendingReq.status === 'pending' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Permintaan Upgrade Paket "{pendingReq.plan?.toUpperCase()}" Sedang Diproses</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">Silakan selesaikan pembayaran sesuai tagihan invoice untuk mengaktifkan paket.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-full font-bold text-[10px] uppercase">Pending</span>
        </div>
      )}

      {/* Category Promo Badge */}
      {categoryPromo && categoryPromo.discount_pct > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-2xl text-white shadow-md flex items-center gap-3 text-xs">
          <Zap className="w-5 h-5 text-amber-300 animate-bounce shrink-0" />
          <div>
            <strong className="font-extrabold">PROMO SPESIAL KATEGORI SELLER ({categoryPromo.discount_pct}% OFF)!</strong>
            <p className="text-[11px] text-emerald-100">Potongan harga otomatis berlaku untuk seluruh paket langganan kategori bisnis Seller Marketplace.</p>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPlans.map((p) => {
          const isCurrent = currentPlanKey === p.plan_key;
          const priceInfo = getPlanPriceInfo(p.plan_key, p.price);

          return (
            <div
              key={p.plan_key}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xs border transition-all relative flex flex-col justify-between ${
                isCurrent
                  ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300'
              }`}
            >
              <div>
                {isCurrent && (
                  <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                    Aktif
                  </span>
                )}
                <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">{p.name || p.plan_key}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">{p.description}</p>

                <div className="my-6">
                  {priceInfo.discounted ? (
                    <div>
                      <div className="text-xs line-through text-slate-400 font-semibold">{priceInfo.original}</div>
                      <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{priceInfo.display}</div>
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{priceInfo.display}</div>
                  )}
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-4 text-center text-xs border border-slate-100 dark:border-slate-700/50">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Pegawai</div>
                    <div className="font-extrabold text-slate-800 dark:text-white">{p.max_staff ? `${p.max_staff} Orang` : 'Unlimited'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Produk</div>
                    <div className="font-extrabold text-slate-800 dark:text-white">{p.max_products ? `${p.max_products} Item` : 'Unlimited'}</div>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 mb-6 text-xs">
                  {Object.entries({
                    inventory:       { label: 'Stok & Gudang Seller', icon: '📦' },
                    marketplace:     { label: 'Integrasi Marketplace', icon: '🛒' },
                    sync:            { label: 'Sync Stok Otomatis',   icon: '🔄' },
                    shipments:       { label: 'Pengiriman & Resi',    icon: '🚚' },
                    reports:         { label: 'Laporan Penjualan',    icon: '📊' },
                    multiUser:       { label: 'Multi-User Staf',      icon: '👨‍💼' },
                    exportExcel:     { label: 'Export Excel/PDF',     icon: '📁' },
                    prioritySupport: { label: 'Priority Support',     icon: '🎧' },
                  }).map(([key, info]) => {
                    const isEnabled = typeof p.features === 'object' && p.features !== null
                      ? Boolean(p.features[key])
                      : true;
                    return (
                      <div key={key} className={`flex items-center gap-2 ${isEnabled ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 opacity-60 line-through'}`}>
                        <span className={`shrink-0 font-extrabold ${isEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>{isEnabled ? '✓' : '✕'}</span>
                        <span className="shrink-0">{info.icon}</span>
                        <span>{info.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan(p.plan_key);
                  setShowOrderModal(true);
                }}
                disabled={isCurrent || (pendingReq && pendingReq.status === 'pending')}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {isCurrent ? 'Paket Aktif Saat Ini' : 'Pilih & Upgrade Paket'}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL ORDER & PEMBAYARAN MULTI-CHANNEL (QRIS / VA / TRANSFER) */}
      <Modal isOpen={showOrderModal} onClose={() => !isSubmitting && setShowOrderModal(false)} title="Konfirmasi & Pembayaran Langganan" maxWidth="540px">
         <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {(() => {
               const planObj = displayPlans.find((p) => p.plan_key === selectedPlan);
               const priceInfo = getPlanPriceInfo(selectedPlan, planObj?.price);
               return (
                 <div style={{ textAlign: 'center', padding: '6px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>💳</div>
                    <p style={{ fontSize: 15, margin: 0 }}>Pilihan Paket: <strong>{planObj?.name || selectedPlan.toUpperCase()}</strong></p>
                    {priceInfo.discounted ? (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: 13, marginRight: 8 }}>
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
                      <h2 style={{ fontSize: 28, fontWeight: 900, color: '#6366f1', margin: '6px 0' }}>
                        {priceInfo.display}
                      </h2>
                    )}
                 </div>
               );
            })()}

            {/* Payment Options (QRIS / VA / Bank) */}
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
                     <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>Auto Aktif</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                     <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7' }}>🏦 Virtual Account (BCA, Mandiri, BRI, BNI)</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Nomor VA otomatis terverifikasi sistem</div>
                     </div>
                     <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>Verifikasi Cepat</span>
                  </div>
               </div>
            </div>

            <div style={{ background: '#eef2ff', padding: '12px 16px', borderRadius: 10, border: '1px solid #c7d2fe', fontSize: 12 }}>
               <div style={{ fontWeight: 700, color: '#4338ca', marginBottom: 4 }}>🏦 Rekening Transfer Bank Manual Alternatif:</div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155' }}>
                  <span>{globalSettings?.bank_name || 'BANK BCA'}: <strong style={{ color: '#4338ca' }}>{globalSettings?.bank_account_no || '8837 001 992'}</strong></span>
                  <span style={{ color: '#64748b' }}>a.n. {globalSettings?.bank_account_name || 'PT Antigravity Global SaaS'}</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
               <button 
                  onClick={() => setShowOrderModal(false)} 
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
               >
                 Batal
               </button>
               <button 
                  onClick={handleOrder} 
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '10px 16px', border: 'none', borderRadius: 8, background: '#4338ca', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
               >
                  {isSubmitting ? 'Memproses...' : '⚡ Bayar & Aktifkan Paket'}
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};
