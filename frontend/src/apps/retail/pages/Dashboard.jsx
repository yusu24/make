import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  ArrowRight,
  BarChart2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Zap,
  Receipt
} from '@/constants/icons';
import { useCore } from '../../../hooks/useCore';
import { useAuth } from '../../../contexts/AuthContext';
import RetailLoading from '../components/RetailLoading';
import StatScoreCard from '@/components/ui/StatScoreCard';

function QuickAction({ icon: Icon, title, desc, href, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-600 to-indigo-700 hover:from-indigo-500',
    emerald: 'from-emerald-600 to-emerald-700 hover:from-emerald-500',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-400',
    slate: 'from-slate-700 to-slate-800 hover:from-slate-600',
  };

  return (
    <Link
      to={href}
      className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo} text-white shadow-md hover:shadow-lg transition-all duration-200 group min-w-0 overflow-hidden`}
    >
      <div className="p-2.5 bg-white/15 rounded-xl shrink-0">
        <Icon size={18} className="text-white" style={{ color: '#ffffff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xs sm:text-sm text-white truncate" style={{ color: '#ffffff' }}>{title}</h3>
        <p className="font-['Inter'] text-[11px] text-white/90 truncate" style={{ color: '#ffffff' }}>{desc}</p>
      </div>
      <ArrowRight size={15} className="text-white group-hover:translate-x-1 transition-transform duration-200 shrink-0" style={{ color: '#ffffff' }} />
    </Link>
  );
}

const fmtRp = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(val || 0));

const _cacheStore = {};
const CACHE_TTL = 60_000;
const EMPTY_DASHBOARD = {
  today_transactions: 0,
  today_income: 0,
  active_products: 0,
  active_staff: 0,
  recent_transactions: [],
  low_stock: []
};

export default function RetailDashboard() {
  const { user } = useAuth();
  const { getDashboard } = useCore();
  const cacheKey = user?.tenant_id || user?.id || 'anon';
  const cached = _cacheStore[cacheKey];
  const [data, setData] = useState(cached?.data || EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    const now = Date.now();
    const cached = _cacheStore[cacheKey];
    if (cached && (now - cached.time) < CACHE_TTL) {
      setData(cached.data); setLoading(false); return;
    }

    setLoading(true);
    getDashboard().then(res => {
      if (!res) { setLoading(false); return; }
      const summary = res.summary || {};
      const sanitizedData = {
        today_transactions: summary.today_transactions || 0,
        today_income: summary.today_income || 0,
        active_products: summary.active_products || 0,
        active_staff: summary.active_staff || 0,
        recent_transactions: res.recent_transactions || [],
        low_stock: res.low_stock || [],
      };
      _cacheStore[cacheKey] = { data: sanitizedData, time: Date.now() };
      setData(sanitizedData);
      setLoading(false);
    }).catch(err => {
      console.error('Dashboard load failed:', err);
      setLoading(false);
    });
  }, [getDashboard, cacheKey]);

  if (loading) return <RetailLoading text="Menyinkronkan dashboard..." />;

  const isCashier = user?.role === 'retail_cashier';
  const isOwnerOrManager = !isCashier;

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  const roleLabel = isCashier ? 'Kasir' : (user?.role === 'super_admin' ? 'Super Admin' : (user?.role === 'admin' ? 'Admin' : 'Owner'));

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Banner - Silky Smooth Midnight Navy */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#072544] via-[#051e36] to-[#041628] p-6 sm:p-7 text-white shadow-xl border border-white/10">
        {/* Soft Ambient Light Accents */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-sky-500/15 via-blue-500/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-72 h-32 bg-indigo-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Column: Greeting, Subtitle, Badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-[28px] tracking-tight text-white leading-tight font-['Plus_Jakarta_Sans']" style={{ fontWeight: 800 }}>
              {timeGreeting}, {user?.name || 'User'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal font-['Inter']">
              Selamat datang kembali di {user?.tenant_name || 'BIZORA Retail'}.
            </p>

            {/* Badges / Status Pills matching reference image */}
            <div className="flex flex-wrap items-center gap-2 mt-4 font-['Inter']">
              <span className="px-2.5 py-1 rounded-md bg-[#0a3156]/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-sm">
                {roleLabel}
              </span>
              {user?.tenant_name && (
                <span className="px-2.5 py-1 rounded-md bg-[#0a3156]/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-sm">
                  {user.tenant_name}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-md bg-[#0a3156]/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-sm">
                RETAIL
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#0a3156]/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-emerald-300 shadow-sm">
                ONLINE
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#0a3156]/90 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-sky-200/90 shadow-sm">
                {now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Right Column: Actions & Frosted Glass Icon Card */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {isCashier && (
              <Link
                to="/retail/pos"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 font-['Plus_Jakarta_Sans']"
              >
                <Zap size={15} />
                Buka Kasir POS
                <ArrowRight size={13} />
              </Link>
            )}
            <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg text-sky-200">
              <Users size={26} className="text-sky-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - only for owner */}
      {isOwnerOrManager && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatScoreCard
            title="TRANSAKSI HARI INI"
            value={data.today_transactions}
            icon={Receipt}
            statusBadge={{ text: "Realtime", color: "indigo" }}
            subtitle="Total pesanan kasir hari ini"
            progressBar={{ value: Math.min(100, Math.max(15, data.today_transactions * 8)), color: "bg-indigo-500" }}
          />
          <StatScoreCard
            title="OMZET HARI INI"
            value={fmtRp(data.today_income)}
            icon={TrendingUp}
            statusBadge={{ text: "Penjualan", color: "emerald" }}
            subtitle="Total pendapatan bruto harian"
            progressBar={{ value: 85, color: "bg-emerald-500" }}
          />
          <StatScoreCard
            title="PRODUK AKTIF"
            value={data.active_products}
            icon={Package}
            statusBadge={{ text: "Katalog", color: "amber" }}
            subtitle="Barang siap jual dalam sistem"
            progressBar={{ value: 92, color: "bg-amber-500" }}
          />
          <StatScoreCard
            title="KASIR & STAF"
            value={data.active_staff}
            icon={Users}
            statusBadge={{ text: "Operator", color: "blue" }}
            subtitle="Akun staf & kasir terdaftar"
            progressBar={{ value: 100, color: "bg-blue-500" }}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 font-['Inter']">Akses Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <QuickAction icon={ShoppingCart} title="Kasir POS" desc="Mulai sesi penjualan" href="/retail/pos" color="indigo" />
          {isOwnerOrManager && (
            <>
              <QuickAction icon={Package} title="Kelola Produk" desc="Tambah atau edit produk" href="/retail/products" color="emerald" />
              <QuickAction icon={BarChart2} title="Lihat Laporan" desc="Analisis penjualan" href="/retail/reports/sales" color="amber" />
              <QuickAction icon={Receipt} title="Riwayat Transaksi" desc="Daftar semua pesanan" href="/retail/transactions" color="slate" />
            </>
          )}
        </div>
      </div>

      {/* Bottom section: Recent transactions + Low stock */}
      {isOwnerOrManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Transactions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-white text-sm md:text-base m-0">Transaksi Terbaru</h3>
              <Link to="/retail/transactions" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 font-['Inter']">
                Lihat semua <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {data.recent_transactions.length > 0 ? data.recent_transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                    <Receipt size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">#{t.invoice_no}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-['Inter']">{t.cashier_name || 'Kasir'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs md:text-sm font-['Plus_Jakarta_Sans'] font-extrabold text-slate-900 dark:text-white">{fmtRp(t.total_amount)}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      t.status === 'paid' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60' : 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60'
                    }`}>
                      {t.status === 'paid' ? <><CheckCircle2 size={10} /> Lunas</> : t.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Receipt size={28} className="opacity-30" />
                  <p className="text-sm font-['Inter']">Belum ada transaksi.</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2 m-0">
                <AlertTriangle size={16} className="text-amber-500" />
                Stok Menipis &amp; Buffer Minimum
              </h3>
              <Link to="/retail/inventory" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 font-['Inter']">
                Kelola stok <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {data.low_stock.length > 0 ? data.low_stock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate font-['Plus_Jakarta_Sans']">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-['Inter']">{p.category || 'Tanpa Kategori'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                      p.stock <= 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      Sisa: {Math.round(p.stock)}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Star size={28} className="opacity-30 text-emerald-500" />
                  <p className="text-sm text-emerald-600 font-medium font-['Inter']">Semua stok aman! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
