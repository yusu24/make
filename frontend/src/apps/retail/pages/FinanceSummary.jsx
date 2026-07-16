import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { BarChart2, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import './FinanceSummary.css';

export default function FinanceSummary() {
  const [summary, setSummary] = useState({ total_sales: 0, total_expenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  
  // Default filter: Bulan Ini
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState('month'); // month, today, custom
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchSummary = async (start, end) => {
    setLoading(true);
    try {
      const res = await api.get(`/retail/finance/summary?startDate=${start}&endDate=${end}`);
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(startDate, endDate);
  }, [startDate, endDate]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);
    
    const t = new Date();
    if (val === 'today') {
      const td = t.toISOString().split('T')[0];
      setStartDate(td);
      setEndDate(td);
    } else if (val === 'month') {
      const fd = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
      const ld = new Date(t.getFullYear(), t.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(fd);
      setEndDate(ld);
    }
    // if custom, user will use the date picker inputs
  };

  const formatRp = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  const isProfit = summary.profit >= 0;

  return (
    <div className="finance-summary animate-fade-in">
      <div className="page-header" style={{ marginBottom: 24, justifyContent: 'flex-end' }}>
      </div>

      {/* Filter Section */}
      <div className="card card-pad" style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} className="retail-text-secondary" />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--retail-text-primary)' }}>Periode:</span>
        </div>
        <select className="form-input" style={{ width: 'auto' }} value={dateFilter} onChange={handleFilterChange}>
          <option value="today">Hari Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="custom">Pilih Rentang Tanggal...</option>
        </select>
        
        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>-</span>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <TrendingUp size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Pendapatan</span>
          </div>
          <div>
            <p className="text-2xl text-slate-900 leading-tight font-semibold">
              {loading ? '...' : formatRp(summary.total_sales)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total kotor dari transaksi mesin kasir (POS).</p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
              <TrendingDown size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Pengeluaran</span>
          </div>
          <div>
            <p className="text-2xl text-rose-600 leading-tight font-semibold">
              {loading ? '...' : formatRp(summary.total_expenses)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total seluruh catatan pengeluaran manual.</p>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
              <Wallet size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Laba Bersih (Profit)</span>
          </div>
          <div>
            <p className={`text-2xl leading-tight font-semibold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {loading ? '...' : formatRp(summary.profit)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Pendapatan dikurangi Pengeluaran.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
