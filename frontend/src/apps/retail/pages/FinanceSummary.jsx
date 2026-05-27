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
    <div className="finance-summary animate-fade-in" style={{ padding: 24, paddingBottom: 100 }}>
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
      <div className="finance-cards-grid">
        {/* Income Card */}
        <div className="card finance-card finance-card--income">
          <div className="finance-card__header">
            <span className="retail-label">Total Pendapatan</span>
            <div className="finance-card__icon"><TrendingUp size={20} /></div>
          </div>
          <div className="retail-kpi-value retail-text-primary">
            {loading ? '...' : formatRp(summary.total_sales)}
          </div>
          <div className="retail-text-secondary">Total kotor dari transaksi mesin kasir (POS).</div>
        </div>

        {/* Expense Card */}
        <div className="card finance-card finance-card--expense">
          <div className="finance-card__header">
            <span className="retail-label">Total Pengeluaran</span>
            <div className="finance-card__icon"><TrendingDown size={20} /></div>
          </div>
          <div className="retail-kpi-value retail-text-danger">
            {loading ? '...' : formatRp(summary.total_expenses)}
          </div>
          <div className="retail-text-secondary">Total seluruh catatan pengeluaran manual.</div>
        </div>

        {/* Profit Card */}
        <div className={`card finance-card finance-card--profit ${isProfit ? 'is-profit' : 'is-loss'}`}>
          <div className="finance-card__header">
            <span className="retail-label">Laba Bersih (Profit)</span>
            <div className="finance-card__icon"><Wallet size={20} /></div>
          </div>
          <div className="retail-kpi-value" style={{ color: isProfit ? 'var(--retail-success)' : 'var(--retail-danger)' }}>
            {loading ? '...' : formatRp(summary.profit)}
          </div>
          <div className="retail-text-secondary">Pendapatan dikurangi Pengeluaran.</div>
        </div>
      </div>
    </div>
  )
}
