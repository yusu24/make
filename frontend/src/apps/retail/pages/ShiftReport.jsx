import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, RefreshCw, Printer, Clock, ArrowDownRight, ArrowUpRight, Calendar } from '@/constants/icons';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import RetailLoading from '../components/RetailLoading';
import { api } from '../../../lib/api';
import '../retail.css';

export default function ShiftReport() {
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
    total_shifts: 0,
    total_expected: 0,
    total_actual: 0,
    total_variance: 0,
    shifts: [],
    chart_data: []
  });

  const loadData = () => {
    setLoading(true);
    api.get('/retail/reports/shifts', { params: { startDate, endDate } })
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.error("Error fetching shift report:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [startDate, endDate]);

  const filteredShifts = (data.shifts || []).filter(s =>
    (s.cashier_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.shift_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage, setCurrentPage, pageSize, setPageSize, totalPages, totalItems,
    paginatedData, startIndex, endIndex
  } = usePagination(filteredShifts);

  if (loading) return <RetailLoading text="Menyiapkan data shift..." />;

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
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Segarkan
           </button>
           <button className="btn btn-primary flex items-center gap-2" onClick={() => window.print()}>
              <Printer size={16} /> Cetak laporan
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                     Shift Selesai
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                     <Clock size={18} />
                  </div>
               </div>
               <p className="font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight mt-1">
                  {data.total_shifts} <span className="text-xs font-normal text-slate-400 font-['Inter']">Sesi</span>
               </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
               Total sesi ditutup
            </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                     Pemasukan Sistem
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                     <ArrowUpRight size={18} />
                  </div>
               </div>
               <p className="font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight mt-1">
                  Rp {Math.round(data.total_expected).toLocaleString('id-ID')}
               </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
               Total omzet sistem kasir
            </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                     Setoran Kasir
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                     <Users size={18} />
                  </div>
               </div>
               <p className="font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight mt-1">
                  Rp {Math.round(data.total_actual).toLocaleString('id-ID')}
               </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
               Uang fisik diserahkan
            </div>
         </div>

         <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                     Total Selisih
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${data.total_variance < 0 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                     <ArrowDownRight size={18} />
                  </div>
               </div>
               <p className={`font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl tracking-tight leading-tight mt-1 ${data.total_variance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  Rp {Math.round(data.total_variance).toLocaleString('id-ID')}
               </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
               {data.total_variance === 0 ? 'Seimbang (Pas 100%)' : data.total_variance < 0 ? 'Selisih Minus (Kurang)' : 'Selisih Surplus (Lebih)'}
            </div>
         </div>
      </div>

      {/* Chart Section */}
      <div className="card card-pad mb-12 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Pendapatan per Shift Harian</h3>
        </div>
        <div style={{ height: 350, width: '100%' }}>
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chart_data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} tickFormatter={(val) => `Rp ${(val/1000).toFixed(0)}k`} width={70} />
                <Tooltip
                  cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  contentStyle={{ background: 'var(--retail-card-bg)', border: '1px solid var(--retail-border)', borderRadius: '12px', padding: '12px', color: 'var(--retail-text-primary)' }}
                  itemStyle={{ fontSize: 13, fontWeight: 600 }}
                  labelStyle={{ fontSize: 11, fontWeight: 800, color: 'var(--retail-text-secondary)', marginBottom: '6px' }}
                  formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 10 }} />
                <Line type="monotone" dataKey="pagi" name="Shift Pagi" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="siang" name="Shift Siang" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="malam" name="Shift Malam" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              placeholder="Cari kasir / nama shift..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
             <tr>
                <th className="pl-6 retail-table-header">Tanggal & Waktu</th>
                <th className="retail-table-header">Nama Shift</th>
                <th className="retail-table-header">Kasir</th>
                <th className="retail-table-header text-right">Modal Awal</th>
                <th className="retail-table-header text-right">Setoran Kasir (Actual)</th>
                <th className="retail-table-header text-right pr-6">Selisih</th>
             </tr>
          </thead>
          <tbody>
            {filteredShifts.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>Data tidak ditemukan.</td></tr>
            ) : (
              paginatedData.map(tx => (
                <tr key={tx.id}>
                  <td className="pl-6">
                    <span className="retail-text-primary">{new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary font-medium">{tx.shift_name}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary">{tx.cashier_name}</span>
                  </td>
                  <td className="text-right">
                    <span className="retail-text-primary">Rp {Math.round(tx.opening_balance).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right">
                    <span className="retail-text-primary">Rp {Math.round(tx.actual_balance).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right pr-6">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${tx.variance === 0 ? 'bg-slate-100 text-slate-500' : tx.variance < 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {tx.variance === 0 ? 'Balance' : `Rp ${Math.round(tx.variance).toLocaleString('id-ID')}`}
                    </span>
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
