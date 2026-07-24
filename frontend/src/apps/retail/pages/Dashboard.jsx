import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, TrendingUp, Package, Users,
  ArrowRight, BarChart3, Clock, CheckCircle,
  AlertTriangle, Star, Zap, Receipt
} from 'lucide-react';
import { useCore } from '../../../hooks/useCore';
import { useAuth } from '../../../contexts/AuthContext';
import RetailLoading from '../components/RetailLoading';

function StatCard({ icon: Icon, label, value, sub, color = 'indigo', trend, isMoney = false }) {
  const colors = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border} shrink-0`}>
          <Icon size={18} className={c.text} />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {trend !== undefined && (
          <span className={`ml-auto text-xs font-normal px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className={`text-2xl text-slate-900 leading-tight ${isMoney ? 'font-semibold' : 'font-normal'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

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
      className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo} text-white shadow-md hover:shadow-lg transition-all duration-200 group`}
    >
      <div className="p-2.5 bg-white/15 rounded-xl shrink-0">
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-white">{title}</h3>
        <p className="text-[11px] text-white truncate">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
    </Link>
  );
}

const fmtRp = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

// Keyed by tenant so switching accounts (impersonate, logout/login) within
// the same browser tab can never show a previous user's cached numbers.
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

  // Our retail tenants use role 'customer' for the store owner and
  // 'retail_cashier' for staff — map those onto the owner/cashier split.
  const isCashier = user?.role === 'retail_cashier';
  const isOwnerOrManager = !isCashier;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';
  const roleLabel = isCashier ? 'Kasir' : 'Owner';

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-indigo-600/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-6 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-indigo-300 text-sm font-medium mb-1">{greeting}, 👋</p>
            <h2 className="text-2xl font-extrabold leading-tight">{user?.name || 'User'}</h2>
            <p className="text-slate-400 text-sm mt-1">
              Role: <span className="text-indigo-300 font-normal">{roleLabel}</span>
              {user?.tenant_name && (
                <> &middot; Outlet: <span className="text-indigo-300 font-normal">{user.tenant_name}</span></>
              )}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
            <Clock size={16} className="text-indigo-300" />
            <span className="text-sm font-medium text-white/80">
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {isCashier && (
          <Link
            to="/retail/pos"
            className="relative z-10 mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors duration-200 shadow-md"
          >
            <Zap size={16} />
            Buka Kasir POS
            <ArrowRight size={14} className="ml-1" />
          </Link>
        )}
      </div>

      {/* Stats Grid - only for owner */}
      {isOwnerOrManager && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Receipt}
            label="Transaksi Hari Ini"
            value={data.today_transactions}
            sub="total transaksi"
            color="indigo"
          />
          <StatCard
            icon={TrendingUp}
            label="Omzet Hari Ini"
            value={fmtRp(data.today_income)}
            sub="total penjualan"
            color="emerald"
            isMoney
          />
          <StatCard
            icon={Package}
            label="Produk Aktif"
            value={data.active_products}
            sub="produk tersedia"
            color="amber"
          />
          <StatCard
            icon={Users}
            label="Kasir Aktif"
            value={data.active_staff}
            sub="pengguna terdaftar"
            color="rose"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-normal text-slate-600 uppercase tracking-wider mb-3">Akses Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <QuickAction icon={ShoppingCart} title="Kasir POS" desc="Mulai sesi penjualan" href="/retail/pos" color="indigo" />
          {isOwnerOrManager && (
            <>
              <QuickAction icon={Package} title="Kelola Produk" desc="Tambah atau edit produk" href="/retail/products" color="emerald" />
              <QuickAction icon={BarChart3} title="Lihat Laporan" desc="Analisis penjualan" href="/retail/reports/sales" color="amber" />
              <QuickAction icon={Receipt} title="Riwayat Transaksi" desc="Daftar semua pesanan" href="/retail/transactions" color="slate" />
            </>
          )}
        </div>
      </div>

      {/* Bottom section: Recent transactions + Low stock */}
      {isOwnerOrManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Transaksi Terbaru</h3>
              <Link to="/retail/transactions" className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {data.recent_transactions.length > 0 ? data.recent_transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                  <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                    <Receipt size={14} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal text-slate-800 truncate">#{t.invoice_no}</p>
                    <p className="text-[10px] text-slate-400">{t.cashier_name || 'Kasir'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-900">{fmtRp(t.total_amount)}</p>
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-normal px-1.5 py-0.5 rounded-full ${
                      t.status === 'paid' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                    }`}>
                      {t.status === 'paid' ? <><CheckCircle size={9} /> Lunas</> : t.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Receipt size={28} className="opacity-30" />
                  <p className="text-xs">Belum ada transaksi.</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Stok Hampir Habis
              </h3>
              <Link to="/retail/inventory" className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                Kelola stok <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {data.low_stock.length > 0 ? data.low_stock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                  <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                    <Package size={14} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.category || 'Tanpa Kategori'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block text-[9px] font-normal px-2 py-0.5 rounded-full ${
                      p.stock <= 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Sisa: {Math.round(p.stock)}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Star size={28} className="opacity-30 text-emerald-500" />
                  <p className="text-xs text-emerald-600 font-medium">Semua stok aman! 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
