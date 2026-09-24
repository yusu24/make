import React, { useState, useMemo, useEffect } from 'react';
import {
  NavLink,
  useSearchParams } from 'react-router-dom';
import { 
  Sparkles,
  LayoutDashboard,
  Type,
  Copy,
  Check,
  Search,
  Eye,
  Code2,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Package,
  Layers,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  ShoppingCart,
  Plus,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  FileText,
  ExternalLink,
  Store,
  Utensils,
  Wrench,
  Droplets,
  ShieldCheck,
  Clock,
  User,
  QrCode,
  Flame,
  Activity
} from '@/constants/icons';
import { useToast } from '../../../components/Toast';

export default function CardDictionary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'catalog';
  const initialModule = searchParams.get('module') || 'retail';

  const [activeTab, setActiveTab] = useState(initialTab); // 'catalog' | 'inspector' | 'guidelines'
  const [selectedModule, setSelectedModule] = useState(initialModule);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCodeId, setExpandedCodeId] = useState(null);

  const toast = useToast();

  // Sync state to URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const modFromUrl = searchParams.get('module');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    if (modFromUrl && modFromUrl !== selectedModule) {
      setSelectedModule(modFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleModuleChange = (modId) => {
    setSelectedModule(modId);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'inspector');
      next.set('module', modId);
      return next;
    });
  };

  const handleCopy = (text, id, label) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (toast?.success) {
      toast.success(`${label} disalin ke clipboard!`);
    }
    setTimeout(() => {
      setCopiedId(prev => (prev === id ? null : prev));
    }, 2000);
  };

  const categories = useMemo(() => [
    { id: 'all', label: 'Semua Card' },
    { id: 'kpi', label: 'KPI & Statistik' },
    { id: 'content', label: 'Konten & Data' },
    { id: 'product', label: 'Katalog & Produk' },
    { id: 'action', label: 'Aksi Cepat' },
    { id: 'notification', label: 'Notifikasi & Banner' },
    { id: 'pos', label: 'Kasir & POS' },
  ], []);

  // Standard Card Catalog Items
  const CARD_ITEMS = useMemo(() => [
    {
      id: 'kpi-stat-trend',
      category: 'kpi',
      title: 'KPI Card dengan Tren Persentase',
      description: 'Kartu ringkasan metrik utama dengan ikon aksen, angka besar, dan indikator tren positif/negatif.',
      tags: ['kpi', 'metrik', 'omzet', 'dashboard', 'statistik'],
      tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow',
      codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan</span>
    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
      <ShoppingBag size={20} />
    </div>
  </div>
  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Rp 128.450.000</div>
  <div className="flex items-center gap-1.5 mt-3 text-xs">
    <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
      <TrendingUp size={12} /> +14.2%
    </span>
    <span className="text-slate-400">vs bulan lalu</span>
  </div>
</div>`,
      renderPreview: () => (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Rp 128.450.000</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp size={12} /> +14.2%
            </span>
            <span className="text-slate-400">vs bulan lalu</span>
          </div>
        </div>
      )
    },
    {
      id: 'kpi-gradient-card',
      category: 'kpi',
      title: 'KPI Card Gradasi Premium',
      description: 'Kartu metrik dengan latar belakang gradasi warna untuk menonjolkan data terpenting pada halaman utama.',
      tags: ['kpi', 'gradient', 'premium', 'highlight', 'saldo'],
      tailwindClass: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-2xl p-5 shadow-lg shadow-indigo-600/20',
      codeSnippet: `<div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-2xl p-5 shadow-lg shadow-indigo-600/20 relative overflow-hidden">
  <div className="relative z-10">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Saldo Kas Utama</span>
      <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">REALTIME</span>
    </div>
    <div className="text-2xl md:text-3xl font-extrabold tracking-tight">Rp 45.280.000</div>
    <div className="flex items-center justify-between text-xs text-indigo-100 mt-4 pt-3 border-t border-white/10">
      <span>Siap Ditarik: Rp 42.100.000</span>
      <span className="underline cursor-pointer hover:text-white">Tarik Dana &rarr;</span>
    </div>
  </div>
</div>`,
      renderPreview: () => (
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-2xl p-5 shadow-lg shadow-indigo-600/20 relative overflow-hidden w-full">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Saldo Kas Utama</span>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">REALTIME</span>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight">Rp 45.280.000</div>
            <div className="flex items-center justify-between text-xs text-indigo-100 mt-4 pt-3 border-t border-white/10">
              <span>Siap Ditarik: Rp 42.100.000</span>
              <span className="underline cursor-pointer hover:text-white">Tarik Dana &rarr;</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'content-product-card',
      category: 'product',
      title: 'Product Catalog Grid Card',
      description: 'Kartu produk e-commerce atau POS dengan gambar, badge kategori, indikator stok, dan tombol tambah.',
      tags: ['produk', 'katalog', 'retail', 'pos', 'grid'],
      tailwindClass: 'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-md transition-all',
      codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col">
  <div className="h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center">
    <Package size={48} className="text-slate-300" />
    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md">
      Stok 24
    </span>
  </div>
  <div className="p-4 flex flex-col flex-1 justify-between">
    <div>
      <span className="text-[11px] font-semibold text-indigo-600 uppercase">Minuman</span>
      <h4 className="font-bold text-slate-800 text-sm mt-0.5 line-clamp-1">Kopi Susu Gula Aren 250ml</h4>
    </div>
    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
      <span className="font-extrabold text-slate-900 text-base">Rp 18.000</span>
      <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors">
        <Plus size={16} />
      </button>
    </div>
  </div>
</div>`,
      renderPreview: () => (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col w-full max-w-xs">
          <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center">
            <Package size={40} className="text-slate-300" />
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md">
              Stok 24
            </span>
          </div>
          <div className="p-4 flex flex-col flex-1 justify-between">
            <div>
              <span className="text-[11px] font-semibold text-indigo-600 uppercase">Minuman</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5 line-clamp-1">Kopi Susu Gula Aren 250ml</h4>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-base">Rp 18.000</span>
              <button className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'action-quick-card',
      category: 'action',
      title: 'Action Card / Shortcut Menu',
      description: 'Kartu navigasi cepat untuk aksi operasional seperti Buka Kasir, Tambah Transaksi, atau Import Data.',
      tags: ['shortcut', 'navigasi', 'action', 'quick'],
      tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5',
      codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
  <div className="flex items-center gap-3.5">
    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
      <ShoppingCart size={22} />
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-sm">Buka Kasir POS</h4>
      <p className="text-xs text-slate-400 mt-0.5">Mulai sesi penjualan baru</p>
    </div>
  </div>
  <ArrowRight size={18} className="text-slate-400" />
</div>`,
      renderPreview: () => (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between w-full">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Buka Kasir POS</h4>
              <p className="text-xs text-slate-400 mt-0.5">Mulai sesi kasir shift pagi</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-slate-400" />
        </div>
      )
    },
    {
      id: 'notification-alert-card',
      category: 'notification',
      title: 'Notice & Status Banner Card',
      description: 'Kartu penegas pesan informasi penting, peringatan jatuh tempo, atau peringatan stok menipis.',
      tags: ['alert', 'warning', 'info', 'banner'],
      tailwindClass: 'rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm',
      codeSnippet: `<div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm flex items-start gap-3">
  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
  <div className="flex-1">
    <h5 className="font-bold text-amber-900 text-xs">Peringatan Stok Menipis</h5>
    <p className="text-xs text-amber-700 mt-0.5">5 produk berada di bawah batas minimum stok aman. Segera buat pesanan pembelian (PO).</p>
  </div>
  <button className="text-xs font-bold text-amber-900 underline shrink-0">Lihat Produk</button>
</div>`,
      renderPreview: () => (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm flex items-start gap-3 w-full">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <h5 className="font-bold text-amber-900 text-xs">Peringatan Stok Menipis</h5>
            <p className="text-xs text-amber-700 mt-0.5">5 produk berada di bawah batas minimum stok aman. Segera buat pesanan pembelian (PO).</p>
          </div>
          <button className="text-xs font-bold text-amber-900 underline shrink-0">Lihat Produk</button>
        </div>
      )
    },
    {
      id: 'pos-compact-card',
      category: 'pos',
      title: 'POS Cashier Grid Item Card',
      description: 'Kartu ringkas touch-friendly untuk layar kasir dengan tombol tambah cepat dan badge harga mencolok.',
      tags: ['pos', 'kasir', 'grid', 'touch', 'cepat'],
      tailwindClass: 'bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-emerald-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between',
      codeSnippet: `<div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-emerald-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between cursor-pointer">
  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
    <ShoppingCart size={22} />
  </div>
  <div className="font-semibold text-slate-800 text-xs line-clamp-2 leading-tight">
    Es Kopi Susu Aren
  </div>
  <div className="mt-2 font-bold text-emerald-600 text-xs">
    Rp 18.000
  </div>
  <div className="text-[10px] text-slate-400 mt-0.5">
    Stok: 84
  </div>
</div>`,
      renderPreview: () => (
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-emerald-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <ShoppingCart size={22} />
            </div>
            <div className="font-semibold text-slate-800 text-xs line-clamp-2 leading-tight">
              Es Kopi Susu Aren
            </div>
            <div className="mt-2 font-bold text-emerald-600 text-xs">
              Rp 18.000
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Stok: 84
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-emerald-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between cursor-pointer">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Package size={22} />
            </div>
            <div className="font-semibold text-slate-800 text-xs line-clamp-2 leading-tight">
              Croissant Butter
            </div>
            <div className="mt-2 font-bold text-indigo-600 text-xs">
              Rp 24.000
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Stok: 12
            </div>
          </div>
        </div>
      )
    }
  ], []);

  // ── MODULE INSPECTOR SPECIFICATIONS ──
  const MODULE_DATA = useMemo(() => ({
    retail: {
      id: 'retail',
      name: 'Retail & Toko',
      icon: Store,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accentColor: 'indigo',
      routePrefix: '/retail/*',
      cssFiles: ['retail.css', 'pos.css', 'index.css'],
      description: 'Modul perdagangan retail, minimarket, dan toko grosir. Berfokus pada kecepatan input kasir POS, barcode scanning instan, dan display katalog multi-satuan.',
      cardGuidelines: {
        radius: 'rounded-2xl (16px) untuk kartu kontainer dashboard, rounded-xl (12px) untuk touch item POS',
        shadow: 'border border-slate-200 shadow-sm hover:shadow-md transition-shadow',
        touchFeedback: 'active:scale-95 pada tombol tambah cepat POS kasir untuk tactile feel di HP',
        accentBorder: 'Border hover warna Indigo (hover:border-indigo-400) atau Emerald (hover:border-emerald-400)'
      },
      cards: [
        {
          id: 'retail-kpi-sales',
          title: 'Kartu KPI Omzet Retail & Sesi Shift',
          location: 'src/apps/retail/pages/Dashboard.jsx',
          role: 'Menampilkan ringkasan omzet harian toko, target shift berjalan, dan jumlah struk transaksi.',
          tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all',
          codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
        <Store size={18} />
      </div>
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Omzet Kasir Retail</span>
        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sesi Shift Pagi Aktif
        </div>
      </div>
    </div>
    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">84 Struk</span>
  </div>
  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
    Rp 14.850.000
  </div>
  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
    <span>Target Harian: Rp 18.000.000</span>
    <span className="font-bold text-indigo-600">82.5% Tercapai</span>
  </div>
</div>`,
          renderPreview: () => (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Store size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Omzet Kasir Retail</span>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sesi Shift Pagi Aktif
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">84 Struk</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                Rp 14.850.000
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <span>Target Harian: Rp 18.000.000</span>
                <span className="font-bold text-indigo-600">82.5% Tercapai</span>
              </div>
            </div>
          )
        },
        {
          id: 'retail-pos-touch',
          title: 'Kartu Grid Kasir Touch-Friendly POS',
          location: 'src/apps/retail/pages/POS.jsx',
          role: 'Kartu item pada katalog kasir touch screen dengan thumbnail, harga jelas, dan feedback tekan active:scale-95.',
          tailwindClass: 'bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-indigo-400 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer',
          codeSnippet: `<div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-indigo-400 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer select-none">
  <div className="flex items-start justify-between">
    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
      <Package size={20} />
    </div>
    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
      SKU-098
    </span>
  </div>
  <div className="mt-2">
    <div className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
      Susu UHT Full Cream 1 Liter
    </div>
    <div className="text-[11px] text-slate-400 mt-0.5">Sisa Stok: 42 Pcs</div>
  </div>
  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
    <span className="text-xs font-extrabold text-indigo-600">Rp 19.500</span>
    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-bold">+ Tambah</span>
  </div>
</div>`,
          renderPreview: () => (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-indigo-400 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer select-none">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    SKU-098
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">Susu UHT 1 Liter</div>
                  <div className="text-[10px] text-slate-400">Stok: 42 Pcs</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-600">Rp 19.500</span>
                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">+ Add</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-emerald-400 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer select-none">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    SKU-104
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">Minyak Goreng 2L</div>
                  <div className="text-[10px] text-slate-400">Stok: 18 Pcs</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600">Rp 34.000</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">+ Add</span>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'retail-low-stock',
          title: 'Kartu Peringatan Restock & Mutasi Barang',
          location: 'src/apps/retail/pages/Inventory.jsx',
          role: 'Memberi tahu staf gudang/toko barang mana yang mendekati batas buffer stok minimum untuk segera dipesan.',
          tailwindClass: 'rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm',
          codeSnippet: `<div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm flex items-start gap-3">
  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
    <AlertTriangle size={18} />
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <h5 className="font-bold text-rose-900 text-xs">Peringatan Stok Tipis (3 SKU)</h5>
      <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-1.5 py-0.2 rounded">Urgent</span>
    </div>
    <p className="text-xs text-rose-700 mt-1 leading-snug">Gula Pasir 1kg (Sisa 3 pcs), Beras Premium 5kg (Sisa 2 karung). Segera lakukan Purchase Order ke Supplier.</p>
  </div>
  <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 shadow-sm">
    Buat PO
  </button>
</div>`,
          renderPreview: () => (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm flex items-start gap-3 w-full">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-rose-900 text-xs">Peringatan Stok Tipis (3 SKU)</h5>
                  <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-1.5 py-0.2 rounded">Urgent</span>
                </div>
                <p className="text-xs text-rose-700 mt-1 leading-snug">Gula Pasir 1kg (Sisa 3 pcs), Beras Premium 5kg (Sisa 2 karung). Segera pesan ke supplier.</p>
              </div>
              <button className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 shadow-sm">
                Buat PO
              </button>
            </div>
          )
        }
      ]
    },

    kuliner: {
      id: 'kuliner',
      name: 'Kuliner & Resto',
      icon: Utensils,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      accentColor: 'amber',
      routePrefix: '/kuliner/*',
      cssFiles: ['KulinerDashboard.css', 'kuliner-print.css', 'index.css'],
      description: 'Modul resto, cafe, rumah makan, dan F&B. Menampilkan live table floor plan, tiket dapur (KDS) dengan timer urgensi, dan kalkulasi HPP resep.',
      cardGuidelines: {
        radius: 'rounded-2xl (16px) untuk card meja & pesanan, rounded-xl (12px) untuk item kitchen',
        shadow: 'border border-amber-100 bg-white shadow-sm hover:border-amber-300',
        touchFeedback: 'Warna status meja jelas: Hijau (Kosong), Merah/Amber (Terisi), Biru (Billing)',
        accentBorder: 'Border warm amber & orange untuk mencerminkan nuansa kuliner yang appetizing'
      },
      cards: [
        {
          id: 'kuliner-table-status',
          title: 'Kartu Status Meja Dine-In Restoran',
          location: 'src/apps/kuliner/pages/TableManagement.jsx',
          role: 'Menampilkan nomor meja, status keterisian (Kosong/Terisi/Billing), jumlah tamu, dan durasi makan berjalan.',
          tailwindClass: 'bg-white rounded-2xl border p-4 shadow-sm transition-all cursor-pointer',
          codeSnippet: `<div className="bg-white rounded-2xl border-2 border-amber-400 p-4 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Meja #04</span>
    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">TERISI</span>
  </div>
  <div className="text-xl font-bold text-slate-800">4 Tamu</div>
  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
    <Clock size={12} className="text-amber-600" />
    <span>Durasi: 38 Menit</span>
  </div>
  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
    <span className="text-slate-400">Total Tagihan:</span>
    <span className="font-extrabold text-amber-600">Rp 175.000</span>
  </div>
</div>`,
          renderPreview: () => (
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="bg-white rounded-2xl border-2 border-amber-400 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-amber-800 uppercase">Meja #04</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">TERISI</span>
                </div>
                <div className="text-base font-bold text-slate-800">4 Tamu</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock size={11} className="text-amber-600" /> 38 Menit
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Tagihan:</span>
                  <span className="font-extrabold text-amber-600">Rp 175.000</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase">Meja #07</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">KOSONG</span>
                </div>
                <div className="text-base font-bold text-slate-800">2 Kursi</div>
                <div className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Siap Digunakan
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end text-xs">
                  <button className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-1 rounded-lg">Check-in</button>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'kuliner-kds-ticket',
          title: 'Kartu Kitchen Order Ticket (KDS Dapur)',
          location: 'src/apps/kuliner/pages/KitchenDisplay.jsx',
          role: 'Tiket pesanan untuk koki dapur dengan daftar menu, catatan modifikasi (pedas/es), dan timer waktu masak.',
          tailwindClass: 'bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm',
          codeSnippet: `<div className="bg-white rounded-2xl border-2 border-rose-300 overflow-hidden shadow-sm">
  <div className="bg-rose-500 text-white p-3 flex items-center justify-between">
    <div>
      <span className="text-xs font-mono font-bold tracking-wider">#TKT-KUL-082</span>
      <h4 className="font-bold text-sm">Meja #04 (Dine In)</h4>
    </div>
    <div className="text-right">
      <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded">16:40 WIB</span>
      <div className="text-xs font-mono font-extrabold text-rose-100 mt-0.5">18 mnt lalu (Urgent)</div>
    </div>
  </div>
  <div className="p-3 divide-y divide-slate-100 text-xs">
    <div className="py-2 flex items-start justify-between">
      <div>
        <span className="font-bold text-slate-800">2x Nasi Goreng Spesial</span>
        <div className="text-[11px] text-rose-600 font-semibold italic">&bull; Catatan: Pedas Level 4, Telur Dadar</div>
      </div>
      <span className="text-xs font-bold text-slate-600">Siap</span>
    </div>
    <div className="py-2 flex items-start justify-between">
      <div>
        <span className="font-bold text-slate-800">1x Es Teh Manis Jumbo</span>
        <div className="text-[11px] text-slate-500 italic">&bull; Catatan: Less sugar</div>
      </div>
      <span className="text-xs font-bold text-emerald-600">Selesai</span>
    </div>
  </div>
</div>`,
          renderPreview: () => (
            <div className="bg-white rounded-2xl border-2 border-rose-300 overflow-hidden shadow-sm w-full max-w-sm">
              <div className="bg-rose-500 text-white p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider">#TKT-KUL-082</span>
                  <h4 className="font-bold text-sm">Meja #04 (Dine In)</h4>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono font-extrabold text-rose-100">18 mnt lalu (Urgent)</div>
                </div>
              </div>
              <div className="p-3 divide-y divide-slate-100 text-xs">
                <div className="py-1.5 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-800">2x Nasi Goreng Spesial</span>
                    <div className="text-[10px] text-rose-600 font-semibold italic">&bull; Pedas Level 4, Telur Dadar</div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Masak</span>
                </div>
                <div className="py-1.5 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-800">1x Es Teh Manis Jumbo</span>
                    <div className="text-[10px] text-slate-500 italic">&bull; Less sugar</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Selesai</span>
                </div>
              </div>
            </div>
          )
        }
      ]
    },

    jasa: {
      id: 'jasa',
      name: 'Jasa & Bengkel',
      icon: Wrench,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      accentColor: 'sky',
      routePrefix: '/jasa/*',
      cssFiles: ['jasa.css', 'pos.css', 'index.css'],
      description: 'Modul bengkel motor/mobil, servis elektronik, salon, dan laundry. Menekankan status SPK (Work Order) transparan, penugasan teknisi, dan estimasi waktu kerja.',
      cardGuidelines: {
        radius: 'rounded-2xl (16px) untuk kartu Work Order SPK & rincian biaya',
        shadow: 'border border-slate-200 shadow-sm hover:border-sky-300',
        touchFeedback: 'Status bar stepper visual (Diterima -> Dikerjakan -> Selesai -> Diambil)',
        accentBorder: 'Border aksen Sky Blue (#0284c7) & Slate untuk kesan teknis dan presisi'
      },
      cards: [
        {
          id: 'jasa-spk-card',
          title: 'Kartu Work Order (SPK) Servis Kendaraan',
          location: 'src/apps/jasa/pages/WorkOrders.jsx',
          role: 'Menampilkan detail unit pelanggan, nomor polisi kendaraan, keluhan servis, teknisi penanggung jawab, dan progres pengerjaan.',
          tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all',
          codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="font-mono font-extrabold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
        SPK-2026-0814
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
        SEDANG DIKERJAKAN
      </span>
    </div>
    <span className="text-xs text-slate-400 font-mono">Est: 45 mnt lagi</span>
  </div>
  <div className="flex items-start justify-between">
    <div>
      <h4 className="font-mono font-black text-base text-slate-900 tracking-wider">B 4819 KRF</h4>
      <p className="text-xs text-slate-600 mt-0.5">Honda Vario 160 (2023) &bull; Bpk. Hendra Pratama</p>
    </div>
    <div className="text-right">
      <span className="text-xs font-bold text-slate-700">Teknisi: Dani P.</span>
    </div>
  </div>
  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
    <strong className="text-slate-800">Keluhan:</strong> Servis berkala 10.000 KM + Ganti Oli Mesin & Kampas Rem Depan.
  </div>
  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
    <span className="text-slate-400">Perkiraan Biaya Part + Jasa:</span>
    <span className="font-extrabold text-sky-700 text-sm">Rp 320.000</span>
  </div>
</div>`,
          renderPreview: () => (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                    SPK-2026-0814
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    DIKERJAKAN
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Est: 45 mnt lagi</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-mono font-black text-base text-slate-900 tracking-wider">B 4819 KRF</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Honda Vario 160 &bull; Bpk. Hendra</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700">Teknisi: Dani P.</span>
                </div>
              </div>
              <div className="mt-2.5 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                <strong className="text-slate-800">Servis:</strong> Ganti Oli Mesin & Kampas Rem Depan.
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Biaya:</span>
                <span className="font-extrabold text-sky-700 text-sm">Rp 320.000</span>
              </div>
            </div>
          )
        }
      ]
    },

    seller: {
      id: 'seller',
      name: 'Seller Omnichannel',
      icon: ShoppingBag,
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      accentColor: 'violet',
      routePrefix: '/seller/*',
      cssFiles: ['seller.css', 'pos.css', 'index.css'],
      description: 'Modul sinkronisasi multi-marketplace (Shopee, Tokopedia, TikTok Shop, Lazada) dan integrasi stok gudang fisik terpusat.',
      cardGuidelines: {
        radius: 'rounded-2xl (16px) untuk status integrasi channel & detail pesanan kurir',
        shadow: 'border border-slate-200 shadow-sm hover:border-violet-300',
        touchFeedback: 'Tombol cetak resi dan request pickup yang responsif',
        accentBorder: 'Border violet (#7c3aed) dan badge status ekspedisi logistik'
      },
      cards: [
        {
          id: 'seller-channel-sync',
          title: 'Kartu Sinkronisasi Channel Marketplace',
          location: 'src/apps/seller/pages/Integrations.jsx',
          role: 'Memantau status koneksi API toko ke platform e-commerce, interval auto-sync stok, dan pesanan pending kirim.',
          tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all',
          codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
        SP
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm">Shopee Official Store</h4>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> API Connected (Auto-Sync)
        </div>
      </div>
    </div>
    <span className="text-xs font-extrabold bg-violet-50 text-violet-700 px-2 py-1 rounded-lg">
      14 Pesanan Baru
    </span>
  </div>
  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
    <div>
      <span className="text-slate-400">Sinkron Terakhir:</span>
      <div className="font-mono font-semibold text-slate-700">1 Menit yang lalu</div>
    </div>
    <div>
      <span className="text-slate-400">Stok Terikat:</span>
      <div className="font-mono font-semibold text-slate-700">184 SKU Terkunci</div>
    </div>
  </div>
</div>`,
          renderPreview: () => (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all w-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                    SP
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Shopee Official Store</h4>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Terhubung (Auto-Sync)
                    </div>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-violet-50 text-violet-700 px-2 py-1 rounded-lg">
                  14 Order
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400">Sinkron:</span>
                  <div className="font-mono font-semibold text-slate-700 text-xs">1 Menit lalu</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Alokasi Stok:</span>
                  <div className="font-mono font-semibold text-slate-700 text-xs">184 SKU</div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },

    budidaya: {
      id: 'budidaya',
      name: 'Budidaya & Tambak',
      icon: Droplets,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      accentColor: 'teal',
      routePrefix: '/budidaya/*',
      cssFiles: ['budidaya.css', 'index.css'],
      description: 'Modul tambak udang, kolam ikan, dan agrikultur. Fokus pada parameter kualitas air IoT (pH, DO, Suhu), log pakan harian & FCR, serta sampling biomassa.',
      cardGuidelines: {
        radius: 'rounded-2xl (16px) untuk telemetry card dan sampling biomassa',
        shadow: 'border border-slate-200 bg-white shadow-sm hover:border-teal-400',
        touchFeedback: 'Warna status parameter sensor (Hijau=Optimal, Kuning=Waspada, Merah=Kritis)',
        accentBorder: 'Border Emerald & Teal (#0d9488) yang jelas terbaca di bawah terik matahari lapangan'
      },
      cards: [
        {
          id: 'budidaya-water-telemetry',
          title: 'Kartu Telemetri Kualitas Air Kolam (IoT)',
          location: 'src/apps/budidaya/pages/MonitoringAir.jsx',
          role: 'Menampilkan data live sensor kualitas air: Derajat Keasaman (pH), Dissolved Oxygen (DO), Suhu Air, dan Salinitas.',
          tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all',
          codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center justify-between mb-3">
    <div>
      <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
        KOLAM TERPAL B-02
      </span>
      <h4 className="font-bold text-slate-900 text-sm mt-1">Udang Vaname (DOC 42 Hari)</h4>
    </div>
    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> AIR OPTIMAL
    </span>
  </div>
  <div className="grid grid-cols-3 gap-3 text-center my-3">
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-[11px] text-slate-400 font-semibold uppercase">pH Air</div>
      <div className="font-mono font-black text-xl text-slate-800">7.8</div>
      <div className="text-[10px] text-emerald-600 font-bold">Aman (7.5-8.2)</div>
    </div>
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-[11px] text-slate-400 font-semibold uppercase">DO (Oksigen)</div>
      <div className="font-mono font-black text-xl text-emerald-600">5.8</div>
      <div className="text-[10px] text-slate-500">ppm (&gt;4.0)</div>
    </div>
    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
      <div className="text-[11px] text-slate-400 font-semibold uppercase">Suhu Air</div>
      <div className="font-mono font-black text-xl text-slate-800">29.4&deg;C</div>
      <div className="text-[10px] text-slate-500">Normal</div>
    </div>
  </div>
</div>`,
          renderPreview: () => (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all w-full">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                    KOLAM TERPAL B-02
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">Udang Vaname (DOC 42 Hari)</h4>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> OPTIMAL
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center my-3">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">pH Air</div>
                  <div className="font-mono font-black text-lg text-slate-800">7.8</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Aman</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">DO (Oksigen)</div>
                  <div className="font-mono font-black text-lg text-emerald-600">5.8</div>
                  <div className="text-[9px] text-slate-500">ppm</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Suhu</div>
                  <div className="font-mono font-black text-lg text-slate-800">29.4°C</div>
                  <div className="text-[9px] text-slate-500">Normal</div>
                </div>
              </div>
            </div>
          )
        }
      ]
    },

    admin: {
      id: 'admin',
      name: 'SaaS Admin Platform',
      icon: ShieldCheck,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      accentColor: 'slate',
      routePrefix: '/admin/*',
      cssFiles: ['index.css', 'AdminMobileNav.css'],
      description: 'Modul kontrol multi-tenant platform Bizora SaaS. Memantau kesehatan sistem, MRR langganan, verifikasi KYC merchant, dan pengaturan sistem.',
      cardGuidelines: {
        radius: 'rounded-2xl (16px) untuk card analitik MRR, tenant status, dan health worker',
        shadow: 'border border-slate-200 bg-white shadow-sm hover:shadow-md',
        touchFeedback: 'Tombol aksi cepat verifikasi dokumen dan kelola tenant',
        accentBorder: 'Border Slate korporat dengan aksen Indigo untuk menonjolkan profesionalisme SaaS'
      },
      cards: [
        {
          id: 'admin-mrr-card',
          title: 'Kartu Platform MRR & Pertumbuhan Tenant',
          location: 'src/apps/admin/pages/Dashboard.jsx',
          role: 'Menampilkan Monthly Recurring Revenue (MRR) keseluruhan platform SaaS dan tenant aktif.',
          tailwindClass: 'bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all',
          codeSnippet: `<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform MRR (SaaS)</span>
    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
      <TrendingUp size={12} /> +18.4%
    </span>
  </div>
  <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
    Rp 148.950.000
  </div>
  <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
    <span>412 Tenant Aktif</span>
    <span className="font-semibold text-indigo-600">38 Baru Bulan Ini &rarr;</span>
  </div>
</div>`,
          renderPreview: () => (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform MRR (SaaS)</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                  <TrendingUp size={12} /> +18.4%
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                Rp 148.950.000
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                <span>412 Tenant Aktif</span>
                <span className="font-semibold text-indigo-600">38 Baru Bulan Ini &rarr;</span>
              </div>
            </div>
          )
        }
      ]
    }
  }), []);

  // Filtered Cards for General Catalog
  const filteredCards = useMemo(() => {
    return CARD_ITEMS.filter(card => {
      const matchCat = selectedCategory === 'all' || card.category === selectedCategory;
      if (!matchCat) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [CARD_ITEMS, selectedCategory, search]);

  const activeModuleData = MODULE_DATA[selectedModule] || MODULE_DATA.retail;
  const ActiveModIcon = activeModuleData.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* ── HEADER & DESIGN SYSTEM HUB BANNER ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <LayoutDashboard size={260} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            <span>Bizora Design System & Component Standard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Kamus Card & Container UI
          </h1>
          <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
            Pusat standarisasi komponen Card (*Kartu Konten, KPI Metrik, Display Produk, hingga POS Touch Item*) untuk memastikan keseragaman visual di seluruh modul Bizora UMKM.
          </p>
        </div>

        {/* Design System Hub Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 border-t border-white/10 pt-4">
          <NavLink
            to="/admin/icon-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 text-indigo-200 hover:bg-white/10"
          >
            <Sparkles size={16} />
            <span>1. Kamus Icon UI</span>
          </NavLink>
          <NavLink
            to="/admin/card-dictionary"
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 bg-white text-indigo-900 shadow-md font-bold"
          >
            <LayoutDashboard size={16} />
            <span>2. Kamus Card UI</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              Standard + Per Modul
            </span>
          </NavLink>
          <NavLink
            to={`/admin/font-dictionary?tab=${activeTab === 'inspector' ? 'inspector' : 'catalog'}&module=${selectedModule}`}
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 text-indigo-200 hover:bg-white/10"
          >
            <Type size={16} />
            <span>3. Kamus Font & Tipografi</span>
          </NavLink>
        </div>
      </div>

      {/* ── MAIN SUB-TAB NAVIGATION ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => handleTabChange('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard size={16} />
          <span>Katalog Card Standar</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'catalog' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {CARD_ITEMS.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('inspector')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inspector'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>🔍 Cek Card Per Modul</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
            6 Modul
          </span>
        </button>

        <button
          onClick={() => handleTabChange('guidelines')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'guidelines'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} />
          <span>Panduan & Standar Card</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CATALOG VIEW (Standard Components)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* TOOLBAR & SEARCH */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Search Box */}
              <div className="lg:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari tipe card (kpi, produk, kasir, notifikasi, saldo)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="lg:col-span-6 flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-400">Total Desain Standar:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {filteredCards.length} Varian
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
              {categories.map(cat => {
                const count = cat.id === 'all'
                  ? CARD_ITEMS.length
                  : CARD_ITEMS.filter(i => i.category === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedCategory === cat.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD CATALOG GRID */}
          <div className="space-y-6">
            {filteredCards.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <LayoutDashboard size={40} className="mx-auto text-slate-300" />
                <h3 className="text-base font-bold text-slate-700">Tidak ada komponen card ditemukan</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Coba cari dengan kata kunci lain atau beralih ke tab <strong>"Cek Card Per Modul"</strong>.
                </p>
              </div>
            ) : (
              filteredCards.map(item => {
                const isCodeExpanded = expandedCodeId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4 transition-all hover:border-slate-300"
                  >
                    {/* Header info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedCodeId(isCodeExpanded ? null : item.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Code2 size={14} className="text-indigo-600" />
                          <span>{isCodeExpanded ? 'Tutup Kode' : 'Lihat JSX'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.codeSnippet, item.id, item.title)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedId === item.id ? 'Tersalin!' : 'Salin Kode'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Live Preview Area */}
                    <div className="p-4 md:p-6 bg-slate-50/70 rounded-xl border border-slate-200/60 flex items-center justify-center">
                      <div className="w-full max-w-lg">
                        {item.renderPreview()}
                      </div>
                    </div>

                    {/* Expandable Code Snippet */}
                    {isCodeExpanded && (
                      <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 text-xs font-mono overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.codeSnippet, item.id, 'Kode')}
                          className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                        >
                          {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === item.id ? 'Tersalin' : 'Copy'}</span>
                        </button>
                        <pre className="text-slate-300 leading-relaxed pr-16">{item.codeSnippet}</pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MODULE INSPECTOR (Cek Card Per Modul)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          {/* Module Selector Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pilih Modul untuk Menginspeksi Komponen Card:
              </span>
              <span className="text-xs text-slate-400">
                Pilih salah satu dari 6 modul di bawah
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Object.values(MODULE_DATA).map(mod => {
                const Icon = mod.icon;
                const isSelected = selectedModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleModuleChange(mod.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon size={16} />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {mod.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {mod.routePrefix}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Information & Specifications Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ActiveModIcon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Spesifikasi Card: Modul {activeModuleData.name}
                    </h2>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {activeModuleData.routePrefix}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {activeModuleData.description}
                  </p>
                </div>
              </div>

              {/* Cross-Link to Font Dictionary */}
              <div className="shrink-0 flex items-center gap-2">
                <NavLink
                  to={`/admin/font-dictionary?tab=inspector&module=${activeModuleData.id}`}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Type size={14} className="text-amber-400" />
                  <span>Cek Font Modul Ini ↗</span>
                </NavLink>
              </div>
            </div>

            {/* Design Spec Highlights for Selected Module */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Border Radius</span>
                <p className="font-semibold text-slate-800">{activeModuleData.cardGuidelines.radius}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shadow & Border</span>
                <p className="font-semibold text-slate-800">{activeModuleData.cardGuidelines.shadow}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Touch & Mobile</span>
                <p className="font-semibold text-slate-800">{activeModuleData.cardGuidelines.touchFeedback}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aksen & Identitas</span>
                <p className="font-semibold text-slate-800">{activeModuleData.cardGuidelines.accentBorder}</p>
              </div>
            </div>

            {/* Loaded CSS Files */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <FileText size={14} className="text-slate-400" />
              <span>File CSS Terkait:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {activeModuleData.cssFiles.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Module-Specific Cards List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <span>Komponen Card yang Digunakan pada Modul {activeModuleData.name}</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {activeModuleData.cards.length} Pola Komponen
              </span>
            </div>

            {activeModuleData.cards.map(card => {
              const isCodeExpanded = expandedCodeId === card.id;
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{card.title}</h4>
                        <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                          {card.location}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{card.role}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(card.tailwindClass, `tw-${card.id}`, 'Kelas Tailwind')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === `tw-${card.id}` ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedId === `tw-${card.id}` ? 'Tersalin' : 'Salin Kelas'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedCodeId(isCodeExpanded ? null : card.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        <Code2 size={14} className="text-indigo-600" />
                        <span>{isCodeExpanded ? 'Tutup Kode' : 'Lihat JSX'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(card.codeSnippet, card.id, card.title)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        {copiedId === card.id ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedId === card.id ? 'Tersalin!' : 'Salin JSX'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Rendered Card Preview */}
                  <div className="p-4 md:p-6 bg-slate-50/70 rounded-xl border border-slate-200/60 flex items-center justify-center">
                    <div className="w-full max-w-lg">
                      {card.renderPreview()}
                    </div>
                  </div>

                  {/* Expandable JSX Snippet */}
                  {isCodeExpanded && (
                    <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 text-xs font-mono overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => handleCopy(card.codeSnippet, card.id, 'Kode')}
                        className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                      >
                        {copiedId === card.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedId === card.id ? 'Tersalin' : 'Copy'}</span>
                      </button>
                      <pre className="text-slate-300 leading-relaxed pr-16">{card.codeSnippet}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: GUIDELINES VIEW (Panduan & Kaidah Standarisasi Card)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-lg">Panduan & Kaidah Standarisasi Card Bizora UMKM</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">1. Border Radius Terstandarisasi</h4>
              <p className="leading-relaxed">
                Gunakan <strong>rounded-2xl (16px)</strong> untuk semua kontainer card utama dan modal dialog. Gunakan <strong>rounded-xl (12px)</strong> untuk sub-kartu, badge thumbnail, dan tombol aksi di dalamnya.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">2. Shadow & Border Ringan</h4>
              <p className="leading-relaxed">
                Selalu padukan <strong>border border-slate-200 bg-white shadow-sm</strong>. Saat diarahkan kursor (hover), naikkan menjadi <strong>hover:shadow-md hover:border-slate-300</strong> untuk memberikan interaktivitas tanpa membuat mata lelah.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">3. Responsif & Touch Target HP</h4>
              <p className="leading-relaxed">
                Pada kasir POS atau smartphone operasional lapangan, gunakan <strong>active:scale-95 transition-all</strong> agar pengguna merasakan umpan balik sentuhan instan. Jaga padding minimum 12px untuk kemudahan tap jari.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
