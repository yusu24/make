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
} from 'lucide-react';
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
  const pendingOrders = orders.filter((o) => o.status === 'Perlu Diproses');
  const lowStockProducts = products.filter((p) => p.status === 'Stok Menipis' || p.status === 'Habis');

  const totalOmsetToday = stores.reduce((sum, s) => sum + s.revenueToday, 0);
  const totalOrdersToday = stores.reduce((sum, s) => sum + s.totalOrdersToday, 0);
  const totalEscrow = stores.reduce((sum, s) => sum + s.pendingEscrow, 0);

  // Real 7-day revenue trend from actual orders — Retail has no marketplace
  // integration, so this is a single "Omset" series (not a per-marketplace
  // breakdown) built from whatever transactions were fetched.
  const revenueChartData = React.useMemo(() => {
    const days: { date: string; day: string; Omset: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      days.push({ date: dateStr, day: DAY_LABELS[d.getDay()], Omset: 0 });
    }
    orders.forEach((o) => {
      const orderDateStr = o.orderDate.substring(0, 10);
      const match = days.find((d) => d.date === orderDateStr);
      if (match) match.Omset += o.totalAmount;
    });
    return days;
  }, [orders]);

  const total30DaysRevenue = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return orders
      .filter((o) => new Date(o.orderDate.substring(0, 10)) >= cutoff)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Bento Grid Layer 1: Main Revenue Bento Block (8 cols) & Marketplace API Dark Bento Block (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Total Omset Bento Hero Block */}
        <div className="lg:col-span-8 bg-white dark:bg-[#101828] rounded-[32px] border border-gray-200 dark:border-slate-800 p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-[#667085] text-xs font-semibold uppercase tracking-wider">
                  Total Pendapatan (30 Hari)
                </h2>
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#101828] dark:text-white tracking-tight">
                {formatIDR(total30DaysRevenue)}
              </div>
              <p className="text-xs text-[#667085] mt-1">
                Hari Ini: <span className="font-semibold text-[#101828] dark:text-slate-200">{formatIDR(totalOmsetToday)}</span> ({totalOrdersToday} Pesanan Masuk)
              </p>
            </div>
          </div>

          {/* Revenue Chart inside Bento */}
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bentoShopeeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `${val / 1000000}M`}
                  tick={{ fontSize: 11, fill: '#667085' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [formatIDR(Number(value)), 'Omset']}
                  contentStyle={{
                    backgroundColor: '#101828',
                    borderColor: '#1f2937',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                />
                <Area type="monotone" dataKey="Omset" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#bentoShopeeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dark High-Contrast Bento Block: Marketplace Connections */}
        <div className="lg:col-span-4 bg-[#101828] rounded-[32px] p-6 md:p-8 text-white flex flex-col justify-between shadow-md border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Channel Penjualan
              </h2>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {stores.filter((s) => s.connected).length} Terhubung
              </span>
            </div>

            <div className="space-y-3">
              {stores.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-xs">
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
              <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
                Integrasi Shopee/Tokopedia/TikTok Shop belum tersedia — saat ini hanya transaksi kasir offline yang tercatat otomatis.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('master-data')}
            className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-xs text-white transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Kelola Channel Penjualan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid Layer 2: 4 Modular Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Pesanan Masuk */}
        <div className="bg-white dark:bg-[#101828] rounded-[28px] border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Pesanan Hari Ini
              </span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#101828] dark:text-white mt-1">
              {totalOrdersToday} <span className="text-sm font-normal text-slate-400">Pesanan</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-amber-600 font-semibold">{pendingOrders.length} Perlu Diproses</span>
            <button onClick={() => setActiveTab('pesanan')} className="text-indigo-600 font-semibold hover:underline">Proses</button>
          </div>
        </div>

        {/* Metric 2: Saldo Escrow */}
        <div className="bg-white dark:bg-[#101828] rounded-[28px] border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Saldo Escrow
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#101828] dark:text-white mt-1">
              {formatIDR(totalEscrow)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-slate-400 font-medium">
            Belum ada integrasi pencairan marketplace
          </div>
        </div>

        {/* Metric 3: Rata-rata Nilai Transaksi Card */}
        <div className="bg-white dark:bg-[#101828] rounded-[28px] border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                Rata-rata Nilai Transaksi
              </span>
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-500">
                <Star className="w-5 h-5 fill-amber-400 stroke-amber-500" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-[#101828] dark:text-white mt-1">
              {formatIDR(orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dari {orders.length} transaksi tercatat</span>
          </div>
        </div>

        {/* Metric 4: Solid Indigo Bento Card - Stok Menipis Alert */}
        <div className="bg-indigo-600 rounded-[28px] p-6 text-white relative overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80 block mb-1">
              Stok SKU Menipis
            </span>
            <div className="text-4xl font-extrabold mb-2">{lowStockProducts.length} SKU</div>
            <p className="text-xs opacity-85 leading-relaxed">
              Diperlukan restock gudang utama segera.
            </p>
          </div>
          <div className="relative z-10 pt-3">
            <button
              onClick={() => setActiveTab('katalog')}
              className="text-xs font-semibold underline hover:opacity-80 transition-opacity cursor-pointer"
            >
              Atur Restock Stok Sekarang →
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Bento Grid Layer 3: Distribution Share & Quick Unprocessed Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Products Bento Block */}
        <div className="lg:col-span-4 bg-white dark:bg-[#101828] rounded-[32px] border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#101828] dark:text-white">
              Produk Terlaris
            </h3>
            <p className="text-xs text-[#667085]">Berdasarkan jumlah unit terjual dari transaksi tercatat</p>

            {topProducts.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 text-center px-4">
                Belum ada transaksi tercatat untuk dihitung.
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
        <div className="lg:col-span-8 bg-white dark:bg-[#101828] rounded-[32px] border border-gray-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-sm font-semibold text-[#101828] dark:text-white">
                  Pesanan Masuk Perlu Resi ({pendingOrders.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('pesanan')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Pesanan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-semibold text-[#667085] uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                    <th className="pb-3 pr-4">PESANAN</th>
                    <th className="pb-3 px-4">PEMBELI</th>
                    <th className="pb-3 px-4">PRODUK</th>
                    <th className="pb-3 px-4">TOTAL</th>
                    <th className="pb-3 pl-4 text-center">RESI AWB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/80 text-xs">
                  {pendingOrders.slice(0, 4).map((ord) => {
                    const badge = getPlatformBadgeColor(ord.platform);
                    return (
                      <tr key={ord.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text} mb-0.5`}>
                            {ord.platform}
                          </span>
                          <div className="font-mono font-semibold text-[#101828] dark:text-slate-200">
                            {ord.orderNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                          {ord.customerName}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">
                          {ord.items.map((it) => (
                            <div key={it.sku} className="truncate">
                              <span className="font-semibold">{it.quantity}x</span> {it.productName}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-[#101828] dark:text-white">
                          {formatIDR(ord.totalAmount)}
                        </td>
                        <td className="py-3 pl-4 text-center">
                          <button
                            onClick={() => onPrintAwb(ord)}
                            className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold shadow-xs flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Resi</span>
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
