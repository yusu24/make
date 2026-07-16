import React, { useState, useEffect } from 'react';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  BarChart3, TrendingUp, Target, ArrowUpRight, 
  Receipt, RefreshCw, Printer
} from 'lucide-react';
import RetailLoading from '../components/RetailLoading';
import '../retail.css';

export default function SalesReport() {
  const [data, setData] = useState({ total_sales: 0, total_transactions: 0, transactions: [], daily_sales: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredTransactions = (data.transactions || []).filter(tx =>
    String(tx.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (tx.customer?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredTransactions);

  if (loading) return <RetailLoading text="Menganalisis performa penjualan..." />;

  

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
        <div className="flex items-center gap-4">
           <button className="btn btn-secondary flex items-center gap-2" onClick={fetchReports}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Segarkan analisis
           </button>
           <button className="btn btn-primary flex items-center gap-2" onClick={() => window.print()}>
              <Printer size={16} /> Cetak laporan
           </button>
        </div>
      </div>

      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 52 }}>
         {/* Total Omzet Card */}
         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                  <TrendingUp size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Total Omzet</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  Rp {Number(data.total_sales).toLocaleString('id-ID')}
               </p>
               <p className="text-xs text-slate-400 mt-1">Akumulasi pendapatan kotor bulan ini.</p>
            </div>
         </div>

         {/* Total Transaksi Card */}
         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                  <Target size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Total Transaksi</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-normal">
                  {data.total_transactions} <span className="text-sm text-slate-400 font-medium ml-1">TRX</span>
               </p>
               <p className="text-xs text-slate-400 mt-1">Volume penjualan yang berhasil diproses.</p>
            </div>
         </div>

         {/* Rata-rata Keranjang Card */}
         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                  <ArrowUpRight size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Rata-rata Keranjang</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  Rp {data.total_transactions > 0 ? Math.round(data.total_sales / data.total_transactions).toLocaleString('id-ID') : 0}
               </p>
               <p className="text-xs text-slate-400 mt-1">Rata-rata nilai per transaksi (Basket Size).</p>
            </div>
         </div>
      </div>

      {/* Chart Section */}
      <div className="card card-pad mb-12 animate-fade-in">
        <div className="flex justify-end items-center mb-10">
        </div>
        <div style={{ height: 350, width: '100%' }}>
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                   <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--retail-primary)" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="var(--retail-primary)" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} tickFormatter={(val) => `Rp ${(val/1000).toFixed(0)}k`} width={70} />
                <Tooltip
                  contentStyle={{ background: 'var(--retail-card-bg)', border: '1px solid var(--retail-border)', borderRadius: '12px', padding: '12px', color: 'var(--retail-text-primary)' }}
                  itemStyle={{ fontSize: 14, fontWeight: 700, color: 'var(--retail-primary)' }}
                  labelStyle={{ fontSize: 10, fontWeight: 800, color: 'var(--retail-text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--retail-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table (Synced with Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari invoice/pelanggan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
             <tr>
                <th className="pl-6 retail-table-header">Invoice</th>
                <th className="retail-table-header">Waktu Transaksi</th>
                <th className="retail-table-header">Identitas Pelanggan</th>
                <th className="retail-table-header">Nilai Bruto</th>
                <th className="text-right pr-6 retail-table-header">Status</th>
             </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                 <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data transaksi penjualan.
                 </td>
              </tr>
            ) : (
              paginatedData.map(tx => (
                <tr key={tx.id}>
                  <td className="pl-6">
                    <code className="text-[11px] retail-text-primary retail-bg-main retail-border px-2 py-1 rounded">#{tx.invoice_number}</code>
                  </td>
                  <td>
                    <span className="retail-text-primary">{new Date(tx.created_at).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary uppercase tracking-tight">{tx.customer?.name || 'Walk-in Customer'}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary">Rp {Number(tx.total_price).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right pr-6">
                    <span className="retail-badge retail-badge-success">Paid</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
        <RetailPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>
    </div>
  );
}
