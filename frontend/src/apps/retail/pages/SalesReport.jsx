import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  BarChart3, TrendingUp, Target, ArrowUpRight, 
  Receipt, RefreshCw
} from 'lucide-react';
import '../retail.css';

export default function SalesReport() {
  const [data, setData] = useState({ total_sales: 0, total_transactions: 0, transactions: [], daily_sales: [] });
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    api.get('/retail/reports')
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const chartData = (data.daily_sales || []).map(item => ({
    name: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    total: Number(item.total)
  }));

  if (loading) return (
    <div className="retail-dashboard-spacing">
      <div className="loading-state-premium">
        <div className="spinner-glow"></div>
        <p className="loading-text">Menganalisis performa penjualan...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
           <h2 className="page-title">Analisis Penjualan</h2>
           <p className="page-sub">Pantau performa harian dan tren pendapatan retail Anda.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="btn btn-secondary" onClick={fetchReports}>
              + Segarkan analisis
           </button>
           <button className="btn btn-primary" onClick={() => window.print()}>
              + Cetak laporan
           </button>
        </div>
      </div>

      {/* Finance KPI Cards */}
      <div className="finance-cards-grid" style={{ marginBottom: 52 }}>
        <div className="finance-card finance-card--success">
           <div className="finance-card__header">
              <span className="finance-card__title">Total Omzet</span>
              <div className="finance-card__icon"><TrendingUp size={20} /></div>
           </div>
           <div className="finance-card__amount">Rp {Number(data.total_sales).toLocaleString('id-ID')}</div>
           <div className="finance-card__desc">Akumulasi pendapatan kotor bulan ini.</div>
        </div>

        <div className="finance-card finance-card--primary">
           <div className="finance-card__header">
              <span className="finance-card__title">Total Transaksi</span>
              <div className="finance-card__icon"><Target size={20} /></div>
           </div>
           <div className="finance-card__amount">{data.total_transactions} <span className="text-sm opacity-20 ml-1">TRX</span></div>
           <div className="finance-card__desc">Volume penjualan yang berhasil diproses.</div>
        </div>

        <div className="finance-card finance-card--warning">
           <div className="finance-card__header">
              <span className="finance-card__title">Rata-rata Keranjang</span>
              <div className="finance-card__icon"><ArrowUpRight size={20} /></div>
           </div>
           <div className="finance-card__amount">
              Rp {data.total_transactions > 0 ? Math.round(data.total_sales / data.total_transactions).toLocaleString('id-ID') : 0}
           </div>
           <div className="finance-card__desc">Rata-rata nilai per transaksi (Basket Size).</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card card-pad mb-12 animate-fade-in">
        <div className="flex justify-between items-center mb-10">
           <div>
              <h3 className="font-800 text-xl tracking-tight text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>Tren Pendapatan Harian</h3>
              <p className="text-[11px] font-800 text-slate-400 uppercase tracking-widest mt-1">Visualisasi 7 hari terakhir</p>
           </div>
           <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-800 uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>Live Updates</span>
        </div>
        <div style={{ height: 350, width: '100%' }}>
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                   <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} tickFormatter={(val) => `Rp ${(val/1000).toFixed(0)}k`} width={70} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', padding: '16px', color: 'white' }}
                  itemStyle={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}
                  labelStyle={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table (Synced with Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Histori Transaksi Terakhir</h3>
          </div>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-800 text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
             {data.transactions.length} Records found
          </span>
        </div>

        <table className="table">
          <thead>
             <tr>
                <th className="pl-6">Invoice</th>
                <th>Waktu Transaksi</th>
                <th>Identitas Pelanggan</th>
                <th>Nilai Bruto</th>
                <th className="text-right pr-6">Status</th>
             </tr>
          </thead>
          <tbody>
            {data.transactions.length === 0 ? (
              <tr>
                 <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data transaksi penjualan.
                 </td>
              </tr>
            ) : (
              data.transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="pl-6">
                    <code className="text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded">#{tx.invoice_number}</code>
                  </td>
                  <td>
                    <span className="text-slate-800">{new Date(tx.created_at).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="text-primary-600 uppercase tracking-tight">{tx.customer?.name || 'Walk-in Customer'}</span>
                  </td>
                  <td>
                    <span className="text-slate-800">Rp {Number(tx.total_price).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right pr-6">
                    <span className="badge badge-green">Paid</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
