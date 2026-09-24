import React, { useState, useEffect, useMemo } from 'react';
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
  Bot,
  Store,
  Printer,
  ChevronRight,
  HelpCircle,
  Tag,
  Wallet,
  X
} from '@/constants/icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import PaymentProofUpload from '../PaymentProofUpload';
import { useToast } from '../Toast';

export default function UniversalSubscriptionView({
  categoryKey = 'retail',
  categoryTitle,
  usageMetrics = [],
  featureMatrix,
  defaultPlans
}) {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [pendingReq, setPendingReq] = useState(null);
  const [categoryPromo, setCategoryPromo] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [apiPlans, setApiPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Checkout Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');

  // Exact Theme Configurations Per Module
  const theme = useMemo(() => {
    switch (categoryKey) {
      case 'budidaya':
        return {
          heroGradient: 'from-[#0b2b1f] via-[#123b2b] to-slate-950',
          ambientGlow: 'bg-emerald-500/20',
          statusBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          metricBox: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300',
          metricBar: 'bg-emerald-400',
          tabActive: 'border-[#1B4332] text-[#1B4332] dark:text-emerald-400',
          basicBadge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          basicText: 'text-[#1B4332] dark:text-emerald-400',
          basicBorder: 'border-emerald-600 ring-emerald-500/20 hover:border-emerald-500',
          basicButton: 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-md shadow-emerald-900/20',
          basicCheck: 'text-emerald-600 dark:text-emerald-400',
          proBorder: 'border-emerald-500 ring-emerald-500/20 hover:border-emerald-600',
          proText: 'text-emerald-700 dark:text-emerald-400',
          proButton: 'bg-gradient-to-r from-[#1B4332] via-emerald-600 to-teal-700 hover:from-[#143326] hover:to-teal-800 text-white shadow-lg shadow-emerald-900/25',
          proCheck: 'text-emerald-600 dark:text-emerald-400',
          tableHighlight: 'bg-emerald-50/50 dark:bg-emerald-950/20',
          tableBasicText: 'text-[#1B4332] dark:text-emerald-400',
          tableProText: 'text-emerald-800 dark:text-emerald-300',
          modalAccentBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400',
          modalSummaryBg: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
          modalButton: 'bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-emerald-900/20',
        };

      case 'kuliner':
        return {
          heroGradient: 'from-[#2c1e11] via-[#1c1917] to-slate-950',
          ambientGlow: 'bg-amber-500/20',
          statusBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          metricBox: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
          metricBar: 'bg-amber-500',
          tabActive: 'border-[#b48c36] text-[#b48c36] dark:text-amber-400',
          basicBadge: 'bg-amber-50 dark:bg-amber-950/60 text-[#b48c36] dark:text-amber-300 border-amber-200 dark:border-amber-800',
          basicText: 'text-[#b48c36] dark:text-amber-400',
          basicBorder: 'border-[#b48c36] ring-amber-500/20 hover:border-amber-500',
          basicButton: 'bg-[#b48c36] hover:bg-[#96742c] text-white shadow-md shadow-amber-700/20',
          basicCheck: 'text-[#b48c36] dark:text-amber-400',
          proBorder: 'border-amber-500 ring-amber-500/20 hover:border-amber-600',
          proText: 'text-[#b48c36] dark:text-amber-400',
          proButton: 'bg-gradient-to-r from-[#b48c36] via-amber-600 to-orange-600 hover:from-[#96742c] hover:to-orange-700 text-white shadow-lg shadow-amber-700/25',
          proCheck: 'text-[#b48c36] dark:text-amber-400',
          tableHighlight: 'bg-amber-50/50 dark:bg-amber-950/20',
          tableBasicText: 'text-[#b48c36] dark:text-amber-400',
          tableProText: 'text-amber-800 dark:text-amber-300',
          modalAccentBg: 'bg-amber-50 dark:bg-amber-950/50 text-[#b48c36] dark:text-amber-400',
          modalSummaryBg: 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50',
          modalButton: 'bg-[#b48c36] hover:bg-[#96742c] text-white shadow-amber-700/20',
        };

      case 'seller':
        return {
          heroGradient: 'from-indigo-950 via-slate-900 to-purple-950',
          ambientGlow: 'bg-purple-500/20',
          statusBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          metricBox: 'bg-indigo-500/20 border-indigo-400/30 text-indigo-300',
          metricBar: 'bg-gradient-to-r from-indigo-500 to-purple-500',
          tabActive: 'border-indigo-600 text-indigo-600 dark:text-indigo-400',
          basicBadge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          basicText: 'text-indigo-600 dark:text-indigo-400',
          basicBorder: 'border-indigo-500 ring-indigo-500/20 hover:border-indigo-400',
          basicButton: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20',
          basicCheck: 'text-indigo-600 dark:text-indigo-400',
          proBorder: 'border-purple-500 ring-purple-500/20 hover:border-purple-600',
          proText: 'text-purple-600 dark:text-purple-400',
          proButton: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25',
          proCheck: 'text-purple-500 dark:text-purple-400',
          tableHighlight: 'bg-indigo-50/50 dark:bg-indigo-950/20',
          tableBasicText: 'text-indigo-700 dark:text-indigo-400',
          tableProText: 'text-purple-700 dark:text-purple-300',
          modalAccentBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
          modalSummaryBg: 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50',
          modalButton: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20',
        };

      case 'jasa':
        return {
          heroGradient: 'from-blue-900 via-indigo-900 to-slate-900',
          ambientGlow: 'bg-blue-500/20',
          statusBadge: 'bg-blue-500/30 text-blue-200 border-blue-400/30',
          metricBox: 'bg-blue-500/20 border-blue-400/30 text-blue-300',
          metricBar: 'bg-blue-400',
          tabActive: 'border-blue-600 text-blue-600 dark:text-blue-400',
          basicBadge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          basicText: 'text-blue-600 dark:text-blue-400',
          basicBorder: 'border-blue-500 ring-blue-500/20 hover:border-blue-400',
          basicButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20',
          basicCheck: 'text-blue-600 dark:text-blue-400',
          proBorder: 'border-indigo-500 ring-indigo-500/20 hover:border-indigo-600',
          proText: 'text-indigo-600 dark:text-indigo-400',
          proButton: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25',
          proCheck: 'text-indigo-500 dark:text-indigo-400',
          tableHighlight: 'bg-blue-50/50 dark:bg-blue-950/20',
          tableBasicText: 'text-blue-700 dark:text-blue-300',
          tableProText: 'text-indigo-800 dark:text-indigo-200',
          modalAccentBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
          modalSummaryBg: 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50',
          modalButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
        };

      default: // retail
        return {
          heroGradient: 'from-blue-950 via-slate-900 to-indigo-950',
          ambientGlow: 'bg-blue-500/20',
          statusBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          metricBox: 'bg-blue-500/20 border-blue-400/30 text-blue-300',
          metricBar: 'bg-blue-400',
          tabActive: 'border-blue-600 text-blue-600 dark:text-blue-400',
          basicBadge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          basicText: 'text-blue-600 dark:text-blue-400',
          basicBorder: 'border-blue-500 ring-blue-500/20 hover:border-blue-300',
          basicButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20',
          basicCheck: 'text-blue-600 dark:text-blue-400',
          proBorder: 'border-blue-500 ring-blue-500/20 hover:border-blue-600',
          proText: 'text-blue-600 dark:text-blue-400',
          proButton: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25',
          proCheck: 'text-blue-500 dark:text-blue-400',
          tableHighlight: 'bg-blue-50/50 dark:bg-blue-950/20',
          tableBasicText: 'text-blue-700 dark:text-blue-300',
          tableProText: 'text-blue-800 dark:text-blue-200',
          modalAccentBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
          modalSummaryBg: 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50',
          modalButton: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
        };
    }
  }, [categoryKey]);

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
      console.warn('Subscription fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentPlan = (user?.subscription_plan || 'free').toLowerCase();

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number || 0);
  };

  const getPlanPriceInfo = (planKey) => {
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

  const handleOpenUpgrade = (planKey) => {
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
        setPaymentData({
          invoice_id: 'INV-SUB-' + Date.now().toString().slice(-6),
          amount: getPlanPriceInfo(selectedPlanKey).numeric,
          qris_payload: '00020101021226580016ID.CO.BIZORA.WWW01189360091800000000005204581253033605802ID5914BIZORA SAAS6007JAKARTA61051234062070703A016304',
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
    } catch (err) {
      console.warn('Demo mock payment session:', err);
      setPaymentData({
        invoice_id: 'INV-SUB-DEMO-' + Date.now().toString().slice(-4),
        amount: getPlanPriceInfo(selectedPlanKey).numeric,
        qris_payload: '00020101021226580016ID.CO.BIZORA.WWW01189360091800000000005204581253033605802ID5914BIZORA SAAS6007JAKARTA61051234062070703A016304',
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

  const copyToClipboard = (text, label = 'Teks') => {
    navigator.clipboard.writeText(text);
    if (toast?.success) {
      toast.success(`${label} berhasil disalin!`);
    } else {
      alert(`${label} berhasil disalin ke clipboard!`);
    }
  };

  // ── Centralized Feature Label Dictionary for SaaS Dynamic Updates ──
  const FEATURES_DICTIONARY = {
    // Retail & POS
    pos: 'Mesin Kasir (POS) & Checkout',
    pos_void: 'Pembatalan Transaksi (Void)',
    pos_shifts: 'Manajemen Shift Kasir',
    inventory: 'Manajemen Stok & Logistik',
    stock_transfers: 'Transfer Antar Cabang',
    stock_opname: 'Stock Opname Fisik',
    batches: 'Pelacakan Batch & Expired',
    serials: 'Serial Number / IMEI',
    suppliers: 'Data Partner Supplier',
    customers: 'Data Pelanggan & CRM',
    discounts: 'Diskon & Pricelist Grosir',
    purchasing: 'Purchase Order (PO)',
    supplier_returns: 'Retur Pembelian Supplier',
    finance: 'Buku Kas & Biaya Operasional',
    payables: 'Buku Hutang & Piutang',
    tax_report: 'Laporan Pajak / PPN',
    reports: 'Laporan Penjualan & Laba',
    multiUser: 'Multi-User Staf & Kasir',
    multiOutlet: 'Multi-Cabang / Gudang',
    print_labels: 'Cetak Barcode & Label Produk',
    ai_advisor: 'Bizora AI Smart Advisor',
    exportExcel: 'Export Data Excel & PDF',
    importData: 'Import Data Massal (Excel/CSV)',
    apiAccess: 'Akses API Developer & Webhook',
    prioritySupport: 'Priority Support 24/7',

    // Budidaya (Pertanian / Perikanan / Peternakan)
    ponds: 'Manajemen Kolam / Kandang / Lahan',
    land: 'Manajemen Lahan & Petak',
    cycles: 'Siklus Budidaya / Musim Tanam',
    feeding: 'Jadwal & Log Pakan / Nutrisi',
    fertilizer: 'Jadwal Pupuk & Nutrisi',
    harvest: 'Pencatatan Panen & Hasil',
    health: 'Catatan Kesehatan & Deteksi Hama',
    breeding: 'Silsilah Breeding',
    ai_diagnosis: 'Bio-AI Smart Diagnostics & Advisor',

    // Kuliner
    menu: 'Manajemen Menu & Varian',
    orders: 'Kasir POS & KDS Dapur',
    tables: 'Manajemen Meja & QR Order',
    recipes: 'Resep & HPP Otomatis (BOM)',
    ingredients: 'Stok Bahan Baku Dapur',
    modifiers: 'Topping & Pilihan Level',
    addons: 'Add-on Menu Tambahan',
    bundles: 'Paket Combo & Bundle',
    waste: 'Limbah & Waste Log',
    purchases: 'Pembelian Bahan Supplier',
    shifts: 'Shift Kasir Restoran',
    ai_assistant: 'AI Chef Assistant & Resep HPP',
    analytics: 'Menu Engineering & Profit',
    delivery: 'Layanan Antar / Delivery',
    storefront: 'Online Storefront Web',

    // Jasa & Servis
    workOrders: 'Surat Perintah Kerja (SPK)',
    contracts: 'Kontrak Layanan Berkala (B2B)',
    spareparts: 'Stok Suku Cadang & Sparepart',
    services: 'Katalog Tarif Layanan Jasa',
    technicians: 'Penugasan Teknisi / Staf',
    accounting_pro: 'Akuntansi Neraca & Jurnal',

    // Seller Omnichannel
    marketplace: 'Integrasi Marketplace',
    sync: 'Sync Stok Otomatis Multi-Channel',
    shipments: 'Pengiriman & Cetak Resi',
  };

  // Build default category-specific features
  const defaultCategoryFeatures = {
    retail: {
      free: ['Hingga 50 Produk Katalog', '1 Akun Kasir / Staf', 'POS Kasir Standar', 'Laporan Penjualan Dasar', 'Dukungan Komunitas'],
      basic: ['Hingga 500 Produk Katalog', '5 Akun Kasir & Staf', 'Manajemen Stok & Opname', 'Laporan Laba Rugi & Pajak', 'Multi-Metode Pembayaran (QRIS/VA)', 'Dukungan WhatsApp Priority'],
      pro: ['Produk & Transaksi Unlimited', 'Multi Cabang / Outlet', 'Sistem Komisi Pegawai', 'Bizora AI Copilot Smart Insight', 'Integrasi API & Webhook POS', 'Dedicated Account Manager']
    },
    kuliner: {
      free: ['Hingga 20 Menu Makanan/Minuman', 'Hingga 5 Meja Resto', 'POS Kasir & Cetak Struk', 'Laporan Penjualan Harian', 'Dukungan Komunitas'],
      basic: ['Hingga 150 Menu & Varian Addon', 'Hingga 25 Meja & QR Order Meja', 'Manajemen Resep & Bahan Baku', 'Laporan HPP & Waste Bahan', 'Manajemen Shift Kasir', 'Dukungan WhatsApp Priority'],
      pro: ['Menu & Meja Unlimited', 'Kitchen Display System (KDS)', 'Multi Cabang / Outlet', 'Bizora AI Prediksi Stok & Menu Laris', 'Website Order Online Mandiri', 'Dedicated Account Manager']
    },
    budidaya: {
      free: ['Hingga 3 Kolam / Lahan', '1 Siklus Aktif Berjalan', 'Pencatatan Pakan Sederhana', 'Grafik Pertumbuhan Dasar', 'Dukungan Komunitas'],
      basic: ['Hingga 15 Kolam / Lahan', '5 Siklus Aktif Bersamaan', 'Pencatatan Pakan, Sampling & Mortalitas', 'Kalkulasi Otomatis FCR & ADG', 'Laporan Keuangan & HPP Panen', 'Dukungan WhatsApp Priority'],
      pro: ['Kolam & Siklus Unlimited', 'Multi Lokasi / Farm', 'Bizora AI Disease & Feeding Advisor', 'Sensor IoT & Water Quality Alert', 'Laporan Investor & Sertifikasi', 'Dedicated Account Manager']
    },
    jasa: {
      free: ['Hingga 15 SPK (Work Order) / bln', '1 Akun Teknisi / Admin', 'Cetak Form SPK & Tanda Terima', 'Pencatatan Suku Cadang Dasar', 'Dukungan Komunitas'],
      basic: ['Hingga 100 SPK / bln', '5 Akun Teknisi & Resepsionis', 'Katalog Layanan & Komisi Teknisi', 'Pengingat Servis Berkala WhatsApp', 'Laporan Pendapatan Jasa & Sparepart', 'Dukungan WhatsApp Priority'],
      pro: ['SPK & Transaksi Unlimited', 'Teknisi & Cabang Unlimited', 'Bizora AI Smart Diagnostics Engine', 'Manajemen Kontrak Maintenance (SLA)', 'Integrasi API & Billing Otomatis', 'Dedicated Account Manager']
    },
    seller: {
      free: ['Hingga 30 Produk', '1 Gudang Utama', 'Pencatatan Pesanan Manual', 'Laporan Penjualan Dasar', 'Dukungan Komunitas'],
      basic: ['Hingga 500 Produk', '3 Gudang & Multi Kurir', 'Sinkronisasi Stok Otomatis', 'Laporan Keuangan & Laba Bersih', 'Cetak Resi & Label Pengiriman', 'Dukungan WhatsApp Priority'],
      pro: ['Produk & Pesanan Unlimited', 'Multi Channel E-Commerce', 'Bizora AI Sales Forecast & Margin Optimizer', 'Manajemen Supplier & Restock Otomatis', 'Integrasi API & Webhook', 'Dedicated Account Manager']
    }
  };

  // Dynamically resolve card checklist features (uses DB apiPlans when configured by SaaS Admin)
  const activeFeatures = useMemo(() => {
    const freePlan = apiPlans.find(p => p.plan_key === 'free');
    const basicPlan = apiPlans.find(p => p.plan_key === 'basic');
    const proPlan = apiPlans.find(p => p.plan_key === 'pro');

    const defaultFeats = defaultCategoryFeatures[categoryKey] || defaultCategoryFeatures.retail;

    if ((freePlan?.features && freePlan.features.length > 0) || 
        (basicPlan?.features && basicPlan.features.length > 0) || 
        (proPlan?.features && proPlan.features.length > 0)) {
      const mapKeys = (plan, fallback) => {
        if (!plan?.features || plan.features.length === 0) return fallback;
        const mapped = plan.features.map(k => FEATURES_DICTIONARY[k] || k.replace(/_/g, ' '));
        if (plan.max_products) mapped.unshift(`Hingga ${plan.max_products} Katalog/Item`);
        if (plan.max_staff) mapped.splice(1, 0, `${plan.max_staff} Akun Staf/Pengguna`);
        return mapped.slice(0, 6);
      };

      return {
        free: mapKeys(freePlan, defaultFeats.free),
        basic: mapKeys(basicPlan, defaultFeats.basic),
        pro: mapKeys(proPlan, defaultFeats.pro),
      };
    }

    return defaultFeats;
  }, [apiPlans, categoryKey]);

  // Dynamically resolve feature comparison matrix table (auto-updates with SaaS Admin changes)
  const activeMatrix = useMemo(() => {
    if (featureMatrix && featureMatrix.length > 0) {
      return featureMatrix;
    }

    const freePlan = apiPlans.find(p => p.plan_key === 'free');
    const basicPlan = apiPlans.find(p => p.plan_key === 'basic');
    const proPlan = apiPlans.find(p => p.plan_key === 'pro');

    const hasDbFeatures = (freePlan?.features && Array.isArray(freePlan.features)) ||
                          (basicPlan?.features && Array.isArray(basicPlan.features)) ||
                          (proPlan?.features && Array.isArray(proPlan.features));

    if (hasDbFeatures) {
      const matrix = [];

      // 1. Quota & Limits row from DB
      matrix.push({
        feature: 'Kapasitas Kuota / Katalog Produk',
        free: freePlan?.max_products ? `${Number(freePlan.max_products).toLocaleString('id-ID')} Item` : 'Terbatas (Free Tier)',
        basic: basicPlan?.max_products ? `${Number(basicPlan.max_products).toLocaleString('id-ID')} Item` : 'Menengah (Standar UMKM)',
        pro: proPlan?.max_products ? `${Number(proPlan.max_products).toLocaleString('id-ID')} Item` : 'Unlimited (Tanpa Batas)',
        highlight: true
      });

      matrix.push({
        feature: 'Manajemen Staf & Pengguna',
        free: freePlan?.max_staff ? `${freePlan.max_staff} Pengguna` : '1 Pengguna',
        basic: basicPlan?.max_staff ? `${basicPlan.max_staff} Pengguna` : '5 Pengguna',
        pro: proPlan?.max_staff ? `${proPlan.max_staff} Pengguna` : 'Unlimited',
        highlight: false
      });

      // 2. Granular Features configured in SaaS Admin
      const allFeatureKeys = Array.from(new Set([
        ...(freePlan?.features || []),
        ...(basicPlan?.features || []),
        ...(proPlan?.features || [])
      ]));

      allFeatureKeys.forEach(key => {
        const label = FEATURES_DICTIONARY[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const isFree = freePlan?.features?.includes(key) || false;
        const isBasic = basicPlan?.features?.includes(key) || false;
        const isPro = proPlan?.features?.includes(key) || false;
        const isHighlight = key.includes('ai') || key.includes('multi') || key.includes('api') || key.includes('accounting');

        matrix.push({
          feature: label,
          free: isFree,
          basic: isBasic,
          pro: isPro,
          highlight: isHighlight
        });
      });

      // 3. Technical Support SLA
      matrix.push({
        feature: 'Dukungan Teknis & Layanan Bantuan',
        free: 'Komunitas & Dokumen Panduan',
        basic: 'WhatsApp Priority',
        pro: 'Dedicated 24/7 Account Manager',
        highlight: false
      });

      if (matrix.length > 3) {
        return matrix;
      }
    }

    // Default curated fallback if DB is not yet populated
    return [
      { feature: 'Kapasitas Kuota Utama', free: 'Terbatas (Free Tier)', basic: 'Menengah (Standar UMKM)', pro: 'Unlimited (Skala Enterprise)', highlight: true },
      { feature: 'Manajemen Staf / Tim', free: '1 Pengguna', basic: 'Hingga 5 Pengguna', pro: 'Unlimited Pengguna' },
      { feature: 'Laporan Keuangan & Laba Rugi', free: 'Dasar (30 Hari)', basic: 'Lengkap + Export Excel/PDF', pro: 'Lengkap + Analisis Multi-Periode' },
      { feature: 'Cetak Dokumen / Struk / Laporan', free: true, basic: true, pro: true },
      { feature: 'Fitur AI Copilot & Smart Insight', free: false, basic: 'Akses Standar', pro: 'Akses Penuh Unlimited', highlight: true },
      { feature: 'Multi Cabang / Multi Gudang / Multi Lokasi', free: false, basic: false, pro: true },
      { feature: 'Integrasi API & Webhook', free: false, basic: false, pro: true },
      { feature: 'Dukungan Teknis', free: 'Komunitas & Dokumen', basic: 'WhatsApp Priority', pro: 'Dedicated 24/7 Support' }
    ];
  }, [featureMatrix, apiPlans]);

  const resolvedCategoryTitle = categoryTitle || (
    categoryKey === 'jasa' ? 'Bengkel & Servis Jasa' :
    categoryKey === 'kuliner' ? 'Resto & Kuliner' :
    categoryKey === 'budidaya' ? 'Budidaya & Pertanian' :
    categoryKey === 'seller' ? 'Seller Omnichannel' : 'Toko Retail POS'
  );

  return (
    <div className="w-full space-y-3.5 animate-in fade-in duration-200">
      {/* ── HERO BANNER: STATUS LANGGANAN AKTIF ── */}
      <div className={`bg-gradient-to-r ${theme.heroGradient} rounded-2xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden`}>
        <div className={`absolute -right-10 -bottom-10 w-48 h-48 ${theme.ambientGlow} rounded-full blur-2xl pointer-events-none`} />
        <div className="absolute right-1/3 -top-10 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full ${theme.statusBadge} text-[10px] font-bold uppercase tracking-wider`}>
                Status Langganan
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {user?.business_name || resolvedCategoryTitle}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold capitalize">
                Paket {currentPlan}
              </h2>
              <span className={'px-2.5 py-0.5 rounded-lg text-xs font-bold border ' + (
                currentPlan === 'pro' 
                  ? 'bg-purple-500/30 border-purple-400 text-purple-200' 
                  : currentPlan === 'basic' 
                  ? theme.statusBadge
                  : 'bg-amber-500/30 border-amber-400 text-amber-200'
              )}>
                {currentPlan === 'pro' ? '👑 Pro Enterprise' : currentPlan === 'basic' ? '⭐ Basic' : '🎁 Free Tier'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {currentPlan === 'pro' 
                ? 'Akun Anda memiliki akses penuh tanpa batas ke semua fitur AI Copilot, multi cabang/lokasi, laporan mendalam, dan dukungan prioritas.'
                : currentPlan === 'basic'
                ? 'Anda menggunakan paket Basic. Upgrade ke Pro untuk menikmati kuota unlimited dan fitur AI Smart Insight.'
                : 'Anda saat ini menggunakan paket Gratis. Upgrade untuk membuka kuota lebih besar dan fitur bisnis lengkap.'}
            </p>
          </div>

          {/* Quick Action Button in Banner */}
          {currentPlan !== 'pro' && (
            <button
              onClick={() => handleOpenUpgrade('pro')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <Sparkles size={15} className="text-slate-950" />
              <span>Upgrade ke Pro Enterprise</span>
            </button>
          )}
        </div>

        {/* Dynamic Usage Metric Bars */}
        {usageMetrics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {usageMetrics.map((m, idx) => {
              const MetricIcon = m.icon || Package;
              const limitNum = typeof m.limit === 'number' ? m.limit : 0;
              const isUnlimited = typeof m.limit === 'string' && (m.limit === '∞' || m.limit.toLowerCase() === 'unlimited');
              const pct = isUnlimited ? 0 : Math.min(100, Math.round((m.used / (limitNum || 1)) * 100));

              return (
                <div key={idx} className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${theme.metricBox} flex items-center justify-center shrink-0`}>
                    <MetricIcon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium truncate">{m.label}</span>
                      <span className="font-bold text-white">
                        {m.used} / {isUnlimited ? '∞' : m.limit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isUnlimited ? `${theme.metricBar} w-full` : pct > 85 ? 'bg-rose-400' : theme.metricBar
                        }`}
                        style={{ width: isUnlimited ? '100%' : `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PROMO ALERT BANNER (IF ACTIVE) ── */}
      {categoryPromo && categoryPromo.discount_pct > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-amber-400/40 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Tag size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Promo Spesial Kategori: Diskon {categoryPromo.discount_pct}%!
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase">
                  Terbatas
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Hemat biaya langganan modul {resolvedCategoryTitle}. Berlaku untuk aktivasi paket hari ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenUpgrade('basic')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition-all whitespace-nowrap"
          >
            Klaim Diskon Sekarang
          </button>
        </div>
      )}

      {/* ── PENDING REQUEST BANNER (IF ANY) ── */}
      {pendingReq && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-200">
                Pengajuan Upgrade Paket: {pendingReq.plan?.toUpperCase()} (Menunggu Pembayaran)
              </div>
              <div className="text-[11px] text-blue-700 dark:text-blue-300">
                Invoice #{pendingReq.invoice_id || pendingReq.id} • Total: {formatRupiah(pendingReq.amount || getPlanPriceInfo(pendingReq.plan || 'basic').numeric)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedPlanKey(pendingReq.plan || 'pro');
                setPaymentStep(2);
                setShowOrderModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Selesaikan Pembayaran / Bukti
            </button>
          </div>
        </div>
      )}

      {/* ── TAB SELECTOR ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'plans'
              ? theme.tabActive
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles size={15} />
          <span>Pilihan Paket Langganan</span>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'invoices'
              ? theme.tabActive
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText size={15} />
          <span>Riwayat Faktur & Pembayaran</span>
          {invoices.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              {invoices.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'plans' ? (
        <>
          {/* ── 3-TIER PRICING CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            {/* 1. Free Tier */}
            <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
              currentPlan === 'free'
                ? 'border-slate-400 shadow-md ring-1 ring-slate-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Mulai Gratis
                  </span>
                  {currentPlan === 'free' && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Aktif Saat Ini
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Cocok untuk UMKM baru memulai dan mencoba fitur dasar.</p>

                <div className="my-3.5">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Rp 0</div>
                  <div className="text-[11px] text-slate-400 font-medium">Gratis Selamanya</div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {activeFeatures.free.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check size={14} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentPlan === 'free'}
                  className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                >
                  {currentPlan === 'free' ? 'Paket Aktif Anda' : 'Paket Dasar'}
                </button>
              </div>
            </div>

            {/* 2. Basic Plan */}
            <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
              currentPlan === 'basic'
                ? `${theme.basicBorder} shadow-lg ring-1`
                : `border-slate-200 dark:border-slate-800 ${theme.basicBorder} hover:shadow-md`
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${theme.basicBadge}`}>
                    ⭐ Paling Populer
                  </span>
                  {currentPlan === 'basic' && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Aktif Saat Ini
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Basic Bisnis</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Ideal untuk usaha yang sedang berkembang dan butuh kuota lebih luas.</p>

                <div className="my-3.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl sm:text-3xl font-black ${theme.basicText}`}>
                      {getPlanPriceInfo('basic').display}
                    </span>
                    {getPlanPriceInfo('basic').original && (
                      <span className="text-[11px] line-through text-slate-400">
                        {getPlanPriceInfo('basic').original}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Ditagih bulanan • Batalkan kapan saja</div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {activeFeatures.basic.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check size={14} className={`${theme.basicCheck} shrink-0 mt-0.5`} />
                      <span className="font-medium text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenUpgrade('basic')}
                  disabled={currentPlan === 'basic'}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    currentPlan === 'basic'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : theme.basicButton
                  }`}
                >
                  {currentPlan === 'basic' ? 'Paket Aktif Anda' : 'Pilih Paket Basic'}
                </button>
              </div>
            </div>

            {/* 3. Pro Enterprise Plan */}
            <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between relative ${
              currentPlan === 'pro'
                ? `${theme.proBorder} shadow-lg ring-1`
                : `border-slate-200 dark:border-slate-800 ${theme.proBorder} hover:shadow-md`
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm flex items-center gap-1">
                    👑 Fitur Lengkap & AI
                  </span>
                  {currentPlan === 'pro' && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Aktif Saat Ini
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Pro Enterprise</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Solusi total tanpa batas dengan Bizora AI Copilot dan integrasi penuh.</p>

                <div className="my-3.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl sm:text-3xl font-black ${theme.proText}`}>
                      {getPlanPriceInfo('pro').display}
                    </span>
                    {getPlanPriceInfo('pro').original && (
                      <span className="text-[11px] line-through text-slate-400">
                        {getPlanPriceInfo('pro').original}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Ditagih bulanan • Akses VIP & SLA</div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {activeFeatures.pro.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check size={14} className={`${theme.proCheck} shrink-0 mt-0.5`} />
                      <span className="font-medium text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenUpgrade('pro')}
                  disabled={currentPlan === 'pro'}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    currentPlan === 'pro'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : theme.proButton
                  }`}
                >
                  {currentPlan === 'pro' ? 'Paket Aktif Anda' : 'Upgrade ke Pro Enterprise'}
                </button>
              </div>
            </div>
          </div>

          {/* ── FEATURE COMPARISON MATRIX TABLE ── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Matriks Perbandingan Fitur Lengkap
              </h3>
              <p className="text-[11px] text-slate-500">
                Rincian kemampuan dan limitasi sistem antar paket langganan {resolvedCategoryTitle}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Fitur Modul</th>
                    <th className="py-2.5 px-3 text-center">Free Starter</th>
                    <th className={`py-2.5 px-3 text-center ${theme.tableBasicText}`}>Basic Bisnis</th>
                    <th className={`py-2.5 px-3 text-center ${theme.tableProText}`}>Pro Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeMatrix.map((item, idx) => (
                    <tr key={idx} className={item.highlight ? `${theme.tableHighlight} font-semibold` : ''}>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 text-[11px]">
                        {item.feature}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400 text-[11px]">
                        {typeof item.free === 'boolean' ? (
                          item.free ? <Check size={14} className="text-emerald-500 mx-auto" /> : <X size={14} className="text-slate-300 mx-auto" />
                        ) : item.free}
                      </td>
                      <td className={`py-2.5 px-3 text-center ${theme.tableBasicText} text-[11px]`}>
                        {typeof item.basic === 'boolean' ? (
                          item.basic ? <Check size={14} className={`${theme.basicCheck} mx-auto`} /> : <X size={14} className="text-slate-300 mx-auto" />
                        ) : item.basic}
                      </td>
                      <td className={`py-2.5 px-3 text-center ${theme.tableProText} font-bold text-[11px]`}>
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? <Check size={14} className={`${theme.proCheck} mx-auto`} /> : <X size={14} className="text-slate-300 mx-auto" />
                        ) : item.pro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ── INVOICE HISTORY TAB ── */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Riwayat Faktur & Pembayaran</h3>
              <p className="text-[11px] text-slate-500">Semua catatan tagihan dan bukti pembayaran langganan akun Anda.</p>
            </div>
            <button
              onClick={fetchData}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 text-slate-600 dark:text-slate-300"
            >
              Segarkan
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <FileText size={32} className="mx-auto text-slate-300" />
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Belum ada faktur pembayaran</div>
              <div className="text-[11px]">Faktur akan muncul otomatis setelah Anda melakukan pengajuan upgrade paket.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5 text-[11px]">No. Invoice</th>
                    <th className="p-2.5 text-[11px]">Paket</th>
                    <th className="p-2.5 text-[11px]">Tanggal</th>
                    <th className="p-2.5 text-[11px]">Jumlah</th>
                    <th className="p-2.5 text-center text-[11px]">Status</th>
                    <th className="p-2.5 text-right text-[11px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv, idx) => {
                    const status = (inv.status || 'pending').toLowerCase();
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          {inv.invoice_number || inv.invoice_id || `INV-SUB-${inv.id}`}
                        </td>
                        <td className={`p-2.5 font-semibold capitalize ${theme.basicText} text-[11px]`}>
                          Paket {inv.plan || inv.plan_name || 'Basic'}
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white text-[11px]">
                          {formatRupiah(inv.amount || inv.total_amount || 0)}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            status === 'paid' || status === 'active' || status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {status === 'paid' || status === 'approved' ? 'LUNAS' : status === 'pending' ? 'MENUNGGU' : 'BATAL'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => window.print()}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                            title="Cetak Faktur"
                          >
                            <Printer size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 2-STEP INTERACTIVE CHECKOUT MODAL ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${theme.modalAccentBg} flex items-center justify-center`}>
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    {paymentStep === 1 ? 'Konfirmasi Upgrade Paket' : 'Instruksi Pembayaran Langganan'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {paymentStep === 1 ? 'Periksa rincian sebelum memproses transaksi' : 'Selesaikan pembayaran menggunakan QRIS atau Virtual Account'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {paymentStep === 1 ? (
                <>
                  <div className={`p-3.5 rounded-xl ${theme.modalSummaryBg} space-y-2.5`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Paket Pilihan:</span>
                      <span className={`font-extrabold capitalize ${theme.basicText}`}>
                        Paket {selectedPlanKey}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Durasi Berlangganan:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">1 Bulan (30 Hari)</span>
                    </div>
                    {categoryPromo && categoryPromo.discount_pct > 0 && (
                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                        <span>Diskon Promo Kategori ({categoryPromo.discount_pct}%):</span>
                        <span className="font-bold">- Diskon Terpasang</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">Total Tagihan:</span>
                      <span className={`text-base font-black ${theme.basicText}`}>
                        {getPlanPriceInfo(selectedPlanKey).display}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Pilih Metode Pembayaran:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-xl border ${theme.basicBorder} ${theme.modalAccentBg} font-bold flex items-center gap-2`}>
                        <QrCode size={15} /> QRIS Instant
                      </div>
                      <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Building2 size={15} /> Virtual Account
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Step 2: Payment Details (QRIS + VA + Proof Upload) */
                <div className="space-y-4">
                  {/* Amount Badge */}
                  <div className={`text-center p-3 rounded-xl ${theme.modalSummaryBg}`}>
                    <div className="text-[11px] text-slate-500 font-medium">Total yang harus dibayar:</div>
                    <div className={`text-xl font-black ${theme.basicText} mt-0.5`}>
                      {formatRupiah(paymentData?.amount || getPlanPriceInfo(selectedPlanKey).numeric)}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
                      <Clock size={11} /> Berlaku hingga 24 Jam ke depan
                    </div>
                  </div>

                  {/* QRIS Section */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-center space-y-1.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Scan QRIS Instant</div>
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg border flex items-center justify-center shadow-inner">
                      <QrCode size={96} className="text-slate-900" />
                    </div>
                    <div className="text-[9px] text-slate-500">Mendukung BCA Mobile, Mandiri Livin, GoPay, OVO, ShopeePay, DANA</div>
                  </div>

                  {/* Virtual Account Options */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Transfer Virtual Account:</div>
                    <div className="space-y-1">
                      {(paymentData?.va_numbers || [
                        { bank: 'BCA', va_number: '88019283749201' },
                        { bank: 'Mandiri', va_number: '89100283749201' },
                        { bank: 'BNI', va_number: '98800283749201' },
                        { bank: 'BRI', va_number: '12800283749201' }
                      ]).map((va, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{va.bank} VA</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${theme.basicText}`}>{va.va_number}</span>
                            <button
                              onClick={() => copyToClipboard(va.va_number, `Nomor VA ${va.bank}`)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-700"
                              title="Salin Nomor VA"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proof of Payment Upload */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 text-[11px]">
                      Konfirmasi / Upload Bukti Transfer (Opsional):
                    </div>
                    <PaymentProofUpload
                      onUploaded={() => {
                        fetchData();
                        setShowOrderModal(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Tutup
              </button>
              {paymentStep === 1 && (
                <button
                  onClick={handleProceedPayment}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-xl ${theme.modalButton} text-xs font-bold shadow-md flex items-center gap-1.5`}
                >
                  {isSubmitting ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
