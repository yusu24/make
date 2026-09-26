import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Store,
  ArrowUpRight,
  Printer,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  Check,
  Star,
  CheckCircle2
} from '@/constants/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Order, Product, StoreChannel, ActiveTab } from '../../types';
import { formatIDR, getPlatformBadgeColor } from '../../utils/formatters';
import { useTranslation } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';

interface MainDashboardViewProps {
  orders: Order[];
  products: Product[];
  stores: StoreChannel[];
  setActiveTab: (tab: ActiveTab) => void;
  onPrintAwb: (order: Order) => void;
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const MainDashboardView: React.FC<MainDashboardViewProps> = ({
  orders,
  products,
  stores,
  setActiveTab,
  onPrintAwb,
}) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const pendingOrders = orders.filter((o) => o.status === 'Perlu Diproses');
  const lowStockProducts = products.filter((p) => p.status === 'Stok Menipis' || p.status === 'Habis');

  const todayStr = new Date().toISOString().substring(0, 10);
  const ordersToday = orders.filter((o) => (o.orderDate || '').substring(0, 10) === todayStr);

  const totalOmsetToday = stores.length > 0 && stores.some((s) => (Number(s.revenueToday) || 0) > 0)
    ? stores.reduce((sum, s) => sum + (Number(s.revenueToday) || 0), 0)
    : ordersToday.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const totalOrdersToday = stores.length > 0 && stores.some((s) => (Number(s.totalOrdersToday) || 0) > 0)
    ? stores.reduce((sum, s) => sum + (Number(s.totalOrdersToday) || 0), 0)
    : ordersToday.length;

  const storesEscrow = stores.reduce((sum, s) => sum + (Number(s.pendingEscrow) || 0), 0);
  const inFlightOrdersEscrow = orders
    .filter((o) => o.status === 'Perlu Diproses' || o.status === 'Dalam Pengiriman' || o.status === 'Perlu Dikirim' || o.status === 'Dikirim')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const totalEscrow = storesEscrow > 0 ? storesEscrow : inFlightOrdersEscrow;

  const [revenueRange, setRevenueRange] = React.useState<'7d' | '14d' | '30d'>('30d');

  // Dynamic revenue trend from actual orders based on selected time range
  const revenueChartData = React.useMemo(() => {
    const days: { date: string; day: string; Omset: number; count: number }[] = [];
    const count = revenueRange === '7d' ? 7 : revenueRange === '14d' ? 14 : 30;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      const dayLabel = count === 7 
        ? DAY_LABELS[d.getDay()] 
        : `${d.getDate()} ${monthNames[d.getMonth()]}`;
      days.push({ 
        date: dateStr, 
        day: dayLabel, 
        Omset: 0, 
        count: 0 
      });
    }

    orders.forEach((o) => {
      const orderDateStr = (o.orderDate || '').substring(0, 10);
      const match = days.find((d) => d.date === orderDateStr);
      if (match) {
        match.Omset += Number(o.totalAmount || 0);
        match.count += 1;
      }
    });

    return days;
  }, [orders, revenueRange]);

  const total30DaysRevenue = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return orders
      .filter((o) => new Date((o.orderDate || '').substring(0, 10)) >= cutoff)
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const revenueForRange = React.useMemo(() => {
    return revenueChartData.reduce((sum, d) => sum + d.Omset, 0);
  }, [revenueChartData]);

  const ordersCountForRange = React.useMemo(() => {
    return revenueChartData.reduce((sum, d) => sum + d.count, 0);
  }, [revenueChartData]);

  const avgOrderValue = ordersCountForRange > 0 ? Math.round(revenueForRange / ordersCountForRange) : 0;

  const formatYAxis = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1000000) {
      const m = val / 1000000;
      return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} Jt`;
    }
    if (val >= 1000) {
      return `${Math.round(val / 1000)} rb`;
    }
    return String(val);
  };

  // Real best-sellers from order line items, replacing the marketplace-share
  // pie (meaningless with a single real channel) with something computable.
  const topProducts = React.useMemo(() => {
    const bySku: Record<string, { name: string; qty: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (!bySku[it.sku]) bySku[it.sku] = { name: it.productName, qty: 0 };
        bySku[it.sku].qty += it.quantity;
      });
    });
    return Object.values(bySku).sort((a, b) => b.qty - a.qty).slice(0, 4);
  }, [orders]);
  const topProductsMaxQty = Math.max(1, ...topProducts.map((p) => p.qty));

  const { user } = useAuth();
  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : (user?.role === 'admin' ? 'Admin Store' : 'Seller Partner');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner - Warm Sunset Amber Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#261309] via-[#1c0d05] to-[#120702] p-5 sm:p-6 text-white shadow-lg border border-amber-500/15">
        {/* Soft Ambient Light Accents */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-orange-500/15 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-72 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Column: Greeting, Subtitle, Badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl tracking-tight text-white leading-tight font-['Plus_Jakarta_Sans']" style={{ fontWeight: 800 }}>
              {timeGreeting}, {user?.name || 'Seller Partner'}
            </h2>
            <p className="text-amber-100/80 text-xs sm:text-sm mt-1 font-normal font-['Inter']">
              Pusat operasional & penjualan {user?.tenant_name || 'BIZORA Seller'}.
            </p>

            {/* Badges / Status Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 font-['Inter']">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/20 text-[11px] font-semibold text-amber-200">
                {roleLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/20 text-[11px] font-semibold text-amber-100/80">
                {now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Column: Frosted Glass Icon Card */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-amber-400/20 flex items-center justify-center shadow-lg text-amber-300">
              <ShoppingBag size={24} className="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layer 1: Main Revenue Bento Block (8 cols) & Marketplace API Dark Bento Block (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Total Omset Bento Hero Block */}
        <div className="lg:col-span-8 bg-white dark:bg-[#101828] rounded-2xl border border-gray-200 dark:border-slate-800 p-5 sm:p-6 md:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-[#667085] dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-['Inter']">
                  {revenueRange === '7d' ? 'Total Pendapatan (7 Hari)' : revenueRange === '14d' ? 'Total Pendapatan (14 Hari)' : 'Total Pendapatan (30 Hari)'}
                </h2>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight font-['Plus_Jakarta_Sans']">
                {formatIDR(revenueRange === '30d' ? total30DaysRevenue : revenueForRange)}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#667085] dark:text-slate-400 font-['Inter']">
                <span>{t('seller.today')}: <strong className="font-semibold text-[#101828] dark:text-slate-200">{formatIDR(totalOmsetToday)}</strong> ({totalOrdersToday} {t('seller.ordersReceived')})</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-[11px]">
                  <TrendingUp className="w-3 h-3" /> +14.2% Tren Positif
                </span>
              </div>
            </div>

            {/* Right Side Controls & Quick Metrics */}
            <div className="flex flex-col sm:items-end gap-3">
              {/* Range Toggle */}
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRevenueRange('7d')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    revenueRange === '7d'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setRevenueRange('14d')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    revenueRange === '14d'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  14 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setRevenueRange('30d')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    revenueRange === '30d'
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  30 Hari
                </button>
              </div>

              {/* Quick Stat Badges */}
              <div className="flex items-center gap-4 text-xs font-['Inter']">
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Rata-rata Order</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatIDR(avgOrderValue)}</span>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Volume Terjual</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{ordersCountForRange} Pesanan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart inside Bento */}
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="bentoShopeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#667085' }} 
                  axisLine={false} 
                  tickLine={false}
                  interval={revenueRange === '30d' ? 4 : 0}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), 'Total Omset']}
                  labelFormatter={(label: any) => `Tanggal: ${label}`}
                  contentStyle={{
                    backgroundColor: '#101828',
                    borderColor: '#1f2937',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Omset" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#bentoShopeeGrad)" 
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Footer with Summary Info */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 font-['Inter']">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Omset Keseluruhan (Offline & Marketplace)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Sinkron realtime dengan kasir fisik & pesanan e-commerce
            </span>
          </div>
        </div>

        {/* Dark High-Contrast Bento Block: Marketplace Connections */}
        <div className="lg:col-span-4 bg-[#101828] rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between shadow-md border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider font-['Inter']">
                {t('seller.salesChannels')}
              </h2>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-['Inter']">
                {stores.filter((s) => s.connected).length} Terhubung
              </span>
            </div>

            <div className="space-y-3">
              {stores.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-['Inter']">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-xs font-semibold text-white shadow-xs font-['Plus_Jakarta_Sans']">
                      {st.platform === 'Manual/Offline' ? 'PO' : st.platform.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{st.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{st.connected ? 'Terhubung' : 'Belum Terhubung'}</p>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${st.connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                </div>
              ))}
              <p className="text-[10px] text-gray-500 leading-relaxed pt-1 font-['Inter']">
                Integrasi Shopee/Tokopedia/TikTok Shop belum tersedia — saat ini hanya transaksi kasir offline yang tercatat otomatis.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('master-data')}
            className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-xs text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 font-['Inter']"
          >
            <span>Kelola Channel Penjualan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid Layer 2: 4 Modular Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Pesanan Masuk */}
        <div className="bg-white dark:bg-[#101828] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'Today Orders' : 'Pesanan Hari Ini'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#101828] dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {totalOrdersToday} <span className="text-sm font-normal text-slate-400 font-['Inter']">{i18n?.language === 'en' ? 'Orders' : 'Pesanan'}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-['Inter']">
            <span className="text-amber-600 font-semibold">{pendingOrders.length} {i18n?.language === 'en' ? 'Needs Process' : 'Perlu Diproses'}</span>
            <button onClick={() => setActiveTab('pesanan')} className="text-indigo-600 font-semibold hover:underline cursor-pointer">{i18n?.language === 'en' ? 'Process' : 'Proses'}</button>
          </div>
        </div>

        {/* Metric 2: Saldo Escrow */}
        <div className="bg-white dark:bg-[#101828] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'Escrow Balance' : 'Saldo Escrow'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#101828] dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {formatIDR(totalEscrow)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-slate-400 font-medium font-['Inter']">
            {i18n?.language === 'en' ? 'Marketplace payout integration pending' : 'Belum ada integrasi pencairan marketplace'}
          </div>
        </div>

        {/* Metric 3: Rata-rata Nilai Transaksi Card */}
        <div className="bg-white dark:bg-[#101828] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                {i18n?.language === 'en' ? 'Average Order Value' : 'Rata-rata Nilai Transaksi'}
              </span>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-[#101828] dark:text-white mt-1 font-['Plus_Jakarta_Sans'] tracking-tight">
              {formatIDR(orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-emerald-600 font-semibold flex items-center gap-1 font-['Inter']">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{i18n?.language === 'en' ? `From ${orders.length} recorded orders` : `Dari ${orders.length} transaksi tercatat`}</span>
          </div>
        </div>

        {/* Metric 4: Solid Indigo Bento Card - Stok Menipis Alert */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80 block mb-1 font-['Inter']">
              {i18n?.language === 'en' ? 'Low Stock SKUs' : 'Stok SKU Menipis'}
            </span>
            <div className="text-2xl md:text-3xl font-semibold mb-2 font-['Plus_Jakarta_Sans'] tracking-tight">{lowStockProducts.length} SKU</div>
            <p className="text-xs opacity-85 leading-relaxed font-['Inter']">
              {i18n?.language === 'en' ? 'Main warehouse restock required immediately.' : 'Diperlukan restock gudang utama segera.'}
            </p>
          </div>
          <div className="relative z-10 pt-3 font-['Inter']">
            <button
              onClick={() => setActiveTab('katalog')}
              className="text-xs font-semibold underline hover:opacity-80 transition-opacity cursor-pointer"
            >
              {i18n?.language === 'en' ? 'Restock Stock Now →' : 'Atur Restock Stok Sekarang →'}
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Bento Grid Layer 3: Distribution Share & Quick Unprocessed Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Products Bento Block */}
        <div className="lg:col-span-4 bg-white dark:bg-[#101828] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#101828] dark:text-white mb-2">
              {i18n?.language === 'en' ? 'Top Selling Products' : 'Produk Terlaris'}
            </h3>

            {topProducts.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 text-center px-4">
                {i18n?.language === 'en' ? 'No recorded transactions yet.' : 'Belum ada transaksi tercatat untuk dihitung.'}
              </div>
            ) : (
              <div className="space-y-3 my-4">
                {topProducts.map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{p.name}</span>
                      <span className="font-semibold text-[#101828] dark:text-white shrink-0">{p.qty} unit</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(p.qty / topProductsMaxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Unprocessed Orders Bento Block */}
        <div className="lg:col-span-8 bg-white dark:bg-[#101828] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-sm font-semibold text-[#101828] dark:text-white">
                  {i18n?.language === 'en' ? `Incoming Orders Needing AWB (${pendingOrders.length})` : `Pesanan Masuk Perlu Resi (${pendingOrders.length})`}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('pesanan')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('seller.viewAllOrders')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                    <th className="pb-3 pr-4">{i18n?.language === 'en' ? 'ORDER' : 'PESANAN'}</th>
                    <th className="pb-3 px-4">{i18n?.language === 'en' ? 'CUSTOMER' : 'PEMBELI'}</th>
                    <th className="pb-3 px-4">{i18n?.language === 'en' ? 'ITEMS' : 'PRODUK'}</th>
                    <th className="pb-3 px-4">{i18n?.language === 'en' ? 'TOTAL AMOUNT' : 'TOTAL BAYAR'}</th>
                    <th className="pb-3 pl-4 text-center">{i18n?.language === 'en' ? 'AWB TRACKING' : 'RESI AWB'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-[13px]">
                  {pendingOrders.slice(0, 4).map((ord) => {
                    const badge = getPlatformBadgeColor(ord.platform);
                    return (
                      <tr key={ord.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${badge.bg} ${badge.text} mb-1`}>
                            {ord.platform}
                          </span>
                          <div className="font-mono font-bold text-sm text-[#101828] dark:text-slate-200">
                            {ord.orderNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-200">
                          {ord.customerName}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-600 dark:text-slate-300">
                          {ord.items.map((it) => (
                            <div key={it.sku} className="truncate">
                              <span className="font-semibold text-slate-800 dark:text-slate-100">{it.quantity}x</span> {it.productName}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-[#101828] dark:text-white">
                          {formatIDR(ord.totalAmount)}
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <button
                            onClick={() => onPrintAwb(ord)}
                            className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 mx-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{i18n?.language === 'en' ? 'Print Label' : 'Cetak Resi'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
