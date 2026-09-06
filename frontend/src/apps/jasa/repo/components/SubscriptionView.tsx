import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  QrCode, 
  Copy, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Users, 
  Wrench, 
  Layers, 
  Package, 
  ArrowRight,
  TrendingUp,
  Scale,
  Bot
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../lib/api';
import { formatRupiah } from '../data/mockData';

interface SubscriptionViewProps {
  workOrdersCount?: number;
  techniciansCount?: number;
  inventoryCount?: number;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  workOrdersCount = 0,
  techniciansCount = 0,
  inventoryCount = 0
}) => {
  const { user } = useAuth();
  const isDemoAccount = user?.email?.startsWith('demo-') || user?.tenant_id?.startsWith('TN-DS-') || user?.tenant_id?.startsWith('TN-DK-');

  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState<any>(null);
  const [categoryPromo, setCategoryPromo] = useState<any>(null);
  const [globalSettings, setGlobalSettings] = useState<any>(null);
  const [apiPlans, setApiPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Checkout Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState<'basic' | 'pro'>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<1 | 2>(1);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'invoices'>('plans');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription/current');
      if (res.data) {
        setPendingReq(res.data.data || null);
        setCategoryPromo(res.data.category_promo || null);
        setGlobalSettings(res.data.global_settings || null);
        setApiPlans(res.data.plans || []);
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      console.warn('Subscription fetch fallback to local defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPlan = (user?.subscription_plan || 'free').toLowerCase();

  const getPlanPriceInfo = (planKey: 'basic' | 'pro') => {
    const basePrices = {
      basic: globalSettings?.pricing_basic_monthly || 49000,
      pro: globalSettings?.pricing_pro_monthly || 149000
    };

    const override = apiPlans.find(p => p.plan_key === planKey)?.price;
    const base = override !== undefined && override !== null ? Number(override) : basePrices[planKey];

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
      original: null,
      display: formatRupiah(base) + ' / bln',
      numeric: base,
      discounted: false,
      discountPct: 0
    };
  };

  const handleOpenUpgrade = (planKey: 'basic' | 'pro') => {
    setSelectedPlanKey(planKey);
    setPaymentStep(1);
    setPaymentData(null);
    setShowOrderModal(true);
  };

  const handleProceedPayment = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/subscription/request', { plan: selectedPlanKey });
      if (res.data?.payment_data) {
        setPaymentData(res.data.payment_data);
      } else {
        // Fallback Mock Payment Data
        setPaymentData({
          invoice_id: 'INV-SUB-' + Date.now().toString().slice(-6),
          amount: getPlanPriceInfo(selectedPlanKey).numeric,
          qris_payload: '00020101021226580016ID.CO.BIZORA.WWW01189360091800000000005204581253033605802ID5914BIZORA SAAS JASA6007JAKARTA61051234062070703A016304',
          va_numbers: [
            { bank: 'BCA', va_number: '88019' + (user?.tenant_id?.replace(/[^0-9]/g, '') || '99281') },
            { bank: 'Mandiri', va_number: '89100' + (user?.tenant_id?.replace(/[^0-9]/g, '') || '99281') },
            { bank: 'BNI', va_number: '98800' + (user?.tenant_id?.replace(/[^0-9]/g, '') || '99281') },
            { bank: 'BRI', va_number: '12800' + (user?.tenant_id?.replace(/[^0-9]/g, '') || '99281') }
          ],
          expired_at: new Date(Date.now() + 24 * 3600000).toISOString()
        });
      }
      setPaymentStep(2);
      fetchData();
    } catch (err: any) {
      // If error (e.g. demo mode / offline), provide mock interactive payment session
      console.warn('Using demo mock payment session:', err);
      setPaymentData({
        invoice_id: 'INV-SUB-DEMO-' + Date.now().toString().slice(-4),
        amount: getPlanPriceInfo(selectedPlanKey).numeric,
        qris_payload: '00020101021226580016ID.CO.BIZORA.WWW01189360091800000000005204581253033605802ID5914BIZORA SAAS JASA6007JAKARTA61051234062070703A016304',
        va_numbers: [
          { bank: 'BCA', va_number: '88019283749201' },
          { bank: 'Mandiri', va_number: '89100283749201' },
          { bank: 'BNI', va_number: '98800283749201' },
          { bank: 'BRI', va_number: '12800283749201' }
        ],
        expired_at: new Date(Date.now() + 24 * 3600000).toISOString()
      });
      setPaymentStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string = 'Teks') => {
    navigator.clipboard.writeText(text);
    alert(`${label} berhasil disalin ke clipboard!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Status Langganan Saat Ini */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Background Ambient Circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                Status Langganan
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {user?.business_name || 'Servis & Jasa Workshop'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold capitalize">
                Paket {currentPlan}
              </h2>
              <span className={'px-3 py-1 rounded-xl text-xs font-bold border ' + (
                currentPlan === 'pro' 
                  ? 'bg-purple-500/30 border-purple-400 text-purple-200' 
                  : currentPlan === 'basic' 
                  ? 'bg-blue-500/30 border-blue-400 text-blue-200' 
                  : 'bg-amber-500/30 border-amber-400 text-amber-200'
              )}>
                {currentPlan === 'pro' ? '👑 Pro Enterprise' : currentPlan === 'basic' ? '⭐ Basic' : '🎁 Free Tier'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              {currentPlan === 'pro' 
                ? 'Akun Anda memiliki akses penuh ke seluruh modul Enterprise: SPK Tak Terbatas, AI Diagnosis, Kasir POS, dan Pembukuan Akuntansi SAK EMKM.'
                : currentPlan === 'basic'
                ? 'Paket Basic aktif. Upgrade ke Pro untuk membuka modul Akuntansi Neraca SAK EMKM, AI Diagnosis Otomatis, dan Teknisi Tak Terbatas.'
                : 'Anda sedang menggunakan Paket Gratis (Free). Upgrade ke paket berbayar untuk menikmati operasional tanpa batasan SPK dan fitur lanjutan.'
              }
            </p>
          </div>

          {/* Quick Metrics of Tenant Resources */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 grid grid-cols-3 gap-4 min-w-[280px]">
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-bold">Total SPK</p>
              <p className="text-lg font-extrabold mt-0.5">{workOrdersCount}</p>
              <p className="text-[10px] text-slate-300">{currentPlan === 'free' ? 'Maks 15 SPK' : 'Unlimited'}</p>
            </div>
            <div className="border-l border-white/10 pl-3">
              <p className="text-[10px] text-blue-200 uppercase font-bold">Teknisi</p>
              <p className="text-lg font-extrabold mt-0.5">{techniciansCount}</p>
              <p className="text-[10px] text-slate-300">{currentPlan === 'free' ? 'Maks 2 Orang' : 'Unlimited'}</p>
            </div>
            <div className="border-l border-white/10 pl-3">
              <p className="text-[10px] text-blue-200 uppercase font-bold">Sparepart</p>
              <p className="text-lg font-extrabold mt-0.5">{inventoryCount}</p>
              <p className="text-[10px] text-slate-300">{currentPlan === 'free' ? 'Maks 25 Item' : 'Unlimited'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Pilihan Paket vs Riwayat Invoice */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('plans')}
            className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
              activeTab === 'plans' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pilihan Paket & Upgrade</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
              activeTab === 'invoices' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Riwayat Pembayaran & Invoice</span>
            {invoices.length > 0 && (
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px]">
                {invoices.length}
              </span>
            )}
          </button>
        </div>

        {categoryPromo && categoryPromo.discount_pct > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Promo Spesial: Diskon {categoryPromo.discount_pct}% Aktif!</span>
          </span>
        )}
      </div>

      {/* ======================================================================= */}
      {/* SECTION 1: PRICING PLANS COMPARISON                                     */}
      {/* ======================================================================= */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. FREE PLAN */}
          <div className={'bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ' + (
            currentPlan === 'free' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 shadow-sm'
          )}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  Free Starter
                </span>
                {currentPlan === 'free' && (
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    Paket Aktif
                  </span>
                )}
              </div>

              <h3 className="text-xl font-extrabold text-slate-900">Paket Gratis</h3>
              <p className="text-xs text-slate-500 mt-1">Untuk mencoba sistem kasir servis dasar.</p>

              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">Rp 0</span>
                  <span className="text-xs text-slate-400 font-semibold">/ selamanya</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fitur yang Tersedia:</p>
                
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 15 SPK / Order per bulan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 2 Teknisi Terdaftar</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Katalog 25 Item Sparepart</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Buku Kas & Pengeluaran Simpel</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Kasir POS Penjualan Cepat</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>AI Diagnosis & Estimasi Kerusakan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Akuntansi Neraca SAK EMKM & Jurnal</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                disabled={currentPlan === 'free'}
                className={'w-full py-2.5 rounded-xl font-bold text-xs transition-all ' + (
                  currentPlan === 'free' 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer'
                )}
              >
                {currentPlan === 'free' ? 'Paket Sedang Aktif' : 'Pilih Free'}
              </button>
            </div>
          </div>

          {/* 2. BASIC PLAN */}
          <div className={'bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ' + (
            currentPlan === 'basic' ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md' : 'border-slate-200 shadow-sm hover:border-blue-300'
          )}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold">
                  ⭐ Basic Workshop
                </span>
                {currentPlan === 'basic' && (
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    Paket Aktif
                  </span>
                )}
              </div>

              <h3 className="text-xl font-extrabold text-slate-900">Paket Basic</h3>
              <p className="text-xs text-slate-500 mt-1">Ideal untuk bengkel & jasa reparasi yang sedang bertumbuh.</p>

              <div className="my-6">
                {getPlanPriceInfo('basic').discounted && (
                  <p className="text-xs text-slate-400 line-through font-semibold mb-0.5">
                    {getPlanPriceInfo('basic').original}
                  </p>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-blue-600">
                    {formatRupiah(getPlanPriceInfo('basic').numeric)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ bulan</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Semua di Free, Ditambah:</p>
                
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Unlimited SPK & Order Perbaikan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Hingga 5 Teknisi Terdaftar</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Kasir POS Penjualan Sparepart Langsung</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Kontrak Maintenance Berkala (B2B)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Export Laporan Excel & Cetak PDF SPK</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>AI Diagnosis & Estimasi Kerusakan</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <span>Akuntansi Neraca SAK EMKM & Jurnal</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                disabled={currentPlan === 'basic'}
                onClick={() => handleOpenUpgrade('basic')}
                className={'w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ' + (
                  currentPlan === 'basic'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25'
                )}
              >
                {currentPlan === 'basic' ? 'Paket Sedang Aktif' : 'Upgrade ke Basic'}
              </button>
            </div>
          </div>

          {/* 3. PRO ENTERPRISE PLAN */}
          <div className="bg-gradient-to-b from-purple-50 via-white to-white rounded-3xl p-6 border-2 border-purple-500 shadow-lg relative flex flex-col justify-between">
            {/* Top Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Rekomendasi Terbaik
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1">
                  👑 Pro Enterprise
                </span>
                {currentPlan === 'pro' && (
                  <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                    Paket Aktif
                  </span>
                )}
              </div>

              <h3 className="text-xl font-extrabold text-slate-900">Paket Pro Enterprise</h3>
              <p className="text-xs text-slate-500 mt-1">Solusi komplit dengan AI canggih dan akuntansi resmi SAK EMKM.</p>

              <div className="my-6">
                {getPlanPriceInfo('pro').discounted && (
                  <p className="text-xs text-slate-400 line-through font-semibold mb-0.5">
                    {getPlanPriceInfo('pro').original}
                  </p>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-purple-700">
                    {formatRupiah(getPlanPriceInfo('pro').numeric)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ bulan</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-purple-100 pt-5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Semua Fitur Basic, Ditambah:</p>
                
                <div className="flex items-center gap-2 text-purple-950 font-bold bg-purple-50 p-2 rounded-xl border border-purple-100">
                  <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>AI Diagnosa Kerusakan & Estimasi Biaya</span>
                </div>
                <div className="flex items-center gap-2 text-purple-950 font-bold bg-purple-50 p-2 rounded-xl border border-purple-100">
                  <Scale className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Dual-Mode Akuntansi Neraca SAK EMKM</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Buku Jurnal Umum Double-Entry Otomatis</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Hutang Supplier (AP) & Multi Rekening Bank</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Teknisi & Staf Tanpa Batas (Unlimited)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Priority VIP Support 24/7 & Custom Nota</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-purple-100">
              <button
                disabled={currentPlan === 'pro'}
                onClick={() => handleOpenUpgrade('pro')}
                className={'w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ' + (
                  currentPlan === 'pro'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25'
                )}
              >
                {currentPlan === 'pro' ? 'Paket Sedang Aktif' : '⚡ Upgrade ke Pro Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* SECTION 2: INVOICES & SUBSCRIPTION HISTORY                              */}
      {/* ======================================================================= */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Tagihan & Pembayaran Langganan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daftar invoice resmi perpanjangan dan upgrade paket SaaS Bizora</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Invoice</th>
                  <th className="py-3 px-4">Paket</th>
                  <th className="py-3 px-4">Tanggal Permintaan</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">Belum ada riwayat tagihan berbayar</p>
                      <p className="text-xs text-slate-400 mt-0.5">Invoice akan muncul secara otomatis saat Anda melakukan upgrade paket.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoice_number || `INV-SUB-2026${String(idx + 1).padStart(3, '0')}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-slate-900">{inv.plan || 'Pro'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {(inv.created_at || new Date().toISOString()).split('T')[0]}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatRupiah(inv.amount || 149000)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={'inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ' + (
                          inv.status === 'paid' || inv.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                          {inv.status === 'paid' || inv.status === 'approved' ? 'Lunas / Aktif' : 'Menunggu Pembayaran'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL CHECKOUT & PAYMENT GATEWAY (QRIS + VIRTUAL ACCOUNT)               */}
      {/* ======================================================================= */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {paymentStep === 1 ? 'Konfirmasi Upgrade Paket' : 'Instruksi Pembayaran Tagihan'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {paymentStep === 1 ? 'Periksa rincian pesanan langganan Anda' : 'Selesaikan pembayaran sebelum batas waktu berakhir'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Konfirmasi Order */}
            {paymentStep === 1 && (
              <div className="p-6 space-y-4 text-xs">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-blue-950 capitalize text-sm">
                      Paket {selectedPlanKey === 'pro' ? 'Pro Enterprise' : 'Basic Workshop'}
                    </span>
                    <span className="font-black text-blue-700 text-base">
                      {formatRupiah(getPlanPriceInfo(selectedPlanKey).numeric)}
                    </span>
                  </div>
                  <p className="text-blue-700 text-[11px]">
                    {selectedPlanKey === 'pro'
                      ? 'Termasuk AI Diagnosis, Akuntansi Neraca SAK EMKM, dan Unlimited Teknisi.'
                      : 'Termasuk Unlimited SPK, Kasir POS, dan Kontrak B2B.'}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-2 text-slate-700">
                  <div className="flex justify-between">
                    <span>Harga Paket Normal</span>
                    <span className="font-semibold text-slate-900">
                      {getPlanPriceInfo(selectedPlanKey).original || formatRupiah(getPlanPriceInfo(selectedPlanKey).numeric)}
                    </span>
                  </div>
                  {getPlanPriceInfo(selectedPlanKey).discounted && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Diskon Kategori Promo ({getPlanPriceInfo(selectedPlanKey).discountPct}%)</span>
                      <span>-{formatRupiah((getPlanPriceInfo(selectedPlanKey).numeric * (getPlanPriceInfo(selectedPlanKey).discountPct || 0)) / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan Gateway</span>
                    <span>Rp 0 (Gratis)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                    <span>Total Tagihan</span>
                    <span className="text-blue-600">{formatRupiah(getPlanPriceInfo(selectedPlanKey).numeric)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleProceedPayment}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Memproses...' : 'Lanjutkan ke Pembayaran →'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment Gateway (QRIS & Virtual Account) */}
            {paymentStep === 2 && paymentData && (
              <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                <div className="text-center pb-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total yang Harus Dibayar</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                    {formatRupiah(paymentData.amount)}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    No. Invoice: {paymentData.invoice_id}
                  </p>
                </div>

                {/* QRIS Code Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>Scan QRIS (Gopay, OVO, Dana, BCA, Livin, ShopeePay)</span>
                  </div>

                  {/* QRIS Visual Mock Box */}
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-sm flex flex-col items-center justify-center relative">
                    <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 opacity-80">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={'rounded-xs ' + (i % 2 === 0 || i % 3 === 0 ? 'bg-slate-900' : 'bg-slate-200')} />
                      ))}
                    </div>
                    <div className="absolute bg-white px-2 py-0.5 rounded-md border border-slate-300 text-[9px] font-bold text-slate-800 shadow-xs">
                      QRIS BIZORA
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-2">
                    Scan menggunakan aplikasi m-Banking atau E-Wallet apapun yang mendukung QRIS.
                  </p>
                </div>

                {/* Virtual Accounts List */}
                <div className="space-y-2">
                  <p className="font-bold text-slate-800 text-xs">Atau Transfer via Virtual Account (Verifikasi Otomatis):</p>
                  
                  {(paymentData.va_numbers || []).map((va: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{va.bank} Virtual Account</span>
                        <p className="font-mono text-xs text-blue-600 font-bold mt-0.5">{va.va_number}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(va.va_number, `Nomor VA ${va.bank}`)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Confirmation Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi Otomatis</span>
                  </div>
                  <button
                    onClick={() => {
                      alert('Permintaan upgrade telah dicatat. Paket Anda akan aktif setelah pembayaran terverifikasi.');
                      setShowOrderModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Saya Sudah Bayar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
