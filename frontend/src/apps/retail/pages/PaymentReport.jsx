import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CreditCard, RefreshCw, Printer, Percent, Calendar } from 'lucide-react';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import RetailLoading from '../components/RetailLoading';
import { api } from '../../../lib/api';
import '../retail.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

export default function PaymentReport() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Date filter state (default: current month)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [data, setData] = useState({
    total_payments: 0,
    total_tax: 0,
    payments: [],
    chart_data: []
  });

  const loadData = () => {
    setLoading(true);
    api.get('/retail/reports/payments', { params: { startDate, endDate } })
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error("Error fetching payment report:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [startDate, endDate]);

  const filteredPayments = (data.payments || []).filter(p =>
    (p.invoice_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.method || '').toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage, setCurrentPage, pageSize, setPageSize, totalPages, totalItems,
    paginatedData, startIndex, endIndex
  } = usePagination(filteredPayments);

  if (loading) return <RetailLoading text="Menyiapkan data pembayaran & pajak..." />;

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div className="flex items-center gap-4 flex-wrap">
           <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
             <Calendar size={16} className="text-slate-400" />
             <input 
               type="date" 
               className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer"
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
             />
             <span className="text-slate-300">-</span>
             <input 
               type="date" 
               className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer"
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
             />
           </div>

           <button className="btn btn-secondary flex items-center gap-2" onClick={loadData}>
              <RefreshCw size={16} /> Segarkan
           </button>
           <button className="btn btn-primary flex items-center gap-2" onClick={() => window.print()}>
              <Printer size={16} /> Cetak laporan
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 24 }}>
         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
                  <CreditCard size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Total Pendapatan Terbayar</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  Rp {Math.round(data.total_payments).toLocaleString('id-ID')}
               </p>
               <p className="text-xs text-slate-400 mt-1">Akumulasi penerimaan kas kotor bulan ini.</p>
            </div>
         </div>

         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                  <Percent size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Total Pajak Terpungut (PPN)</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  Rp {Math.round(data.total_tax).toLocaleString('id-ID')}
               </p>
               <p className="text-xs text-slate-400 mt-1">Estimasi PPN Keluaran yang harus dilaporkan.</p>
            </div>
         </div>
      </div>

      {/* Chart Section */}
      <div className="card card-pad mb-12 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Komposisi Metode Pembayaran</h3>
        </div>
        <div style={{ height: 350, width: '100%' }}>
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.chart_data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.chart_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                  contentStyle={{ background: 'var(--retail-card-bg)', border: '1px solid var(--retail-border)', borderRadius: '12px', padding: '12px', color: 'var(--retail-text-primary)' }}
                  itemStyle={{ fontSize: 13, fontWeight: 600 }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
              </PieChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              placeholder="Cari metode / no. invoice..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
             <tr>
                <th className="pl-6 retail-table-header">Tanggal & Waktu</th>
                <th className="retail-table-header">No. Invoice</th>
                <th className="retail-table-header">Metode</th>
                <th className="retail-table-header text-right">Subtotal</th>
                <th className="retail-table-header text-right">PPN (11%)</th>
                <th className="retail-table-header text-right pr-6">Total Dibayar</th>
             </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>Data tidak ditemukan.</td></tr>
            ) : (
              paginatedData.map(tx => (
                <tr key={tx.id}>
                  <td className="pl-6">
                    <span className="retail-text-primary">{new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td>
                    <code className="text-[11px] retail-text-primary retail-bg-main retail-border px-2 py-1 rounded">{tx.invoice_no}</code>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${tx.method === 'Tunai' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {tx.method}
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="retail-text-primary">Rp {Math.round(tx.subtotal).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right">
                    <span className="retail-text-primary">Rp {Math.round(tx.tax).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right pr-6 font-semibold">
                    <span className="retail-text-primary">Rp {Math.round(tx.total).toLocaleString('id-ID')}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
        <RetailPagination
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          pageSize={pageSize} setPageSize={setPageSize}
          totalPages={totalPages} totalItems={totalItems}
          startIndex={startIndex} endIndex={endIndex}
        />
      </div>
    </div>
  );
}
