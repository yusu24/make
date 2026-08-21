import React, { useState, useEffect, useMemo } from 'react';
import '../retail.css';
import { api } from '../../../lib/api';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CustomerReport() {
  const [data, setData] = useState({ top_customers: [], monthly_spending: [], yearly_spending: [] });
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly'); // 'monthly' | 'yearly'

  useEffect(() => {
    api.get('/retail/reports/customers')
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  // Format chart data: Pivot the raw data by label (X-axis) so each customer becomes a line (Y-axis)
  const chartData = useMemo(() => {
    const rawTrends = chartView === 'monthly' ? data.monthly_spending : data.yearly_spending;
    if (!rawTrends) return [];

    const grouped = {};
    rawTrends.forEach(item => {
      if (!grouped[item.label]) {
        let name = item.label.toString();
        if (chartView === 'monthly') {
          const date = new Date(item.label + '-01');
          name = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        }
        grouped[item.label] = { name, sortKey: item.label };
      }
      
      // Find customer name
      const customer = data.top_customers.find(c => c.customer_id === item.customer_id);
      const customerName = customer?.customer?.name || `Pelanggan #${item.customer_id}`;
      grouped[item.label][customerName] = Number(item.total || 0);
    });

    return Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [data, chartView]);

  // Extract unique customer names for the Line components
  const customerNames = useMemo(() => {
    if (chartData.length === 0) return [];
    const keys = new Set();
    chartData.forEach(item => {
      Object.keys(item).forEach(k => {
        if (k !== 'name' && k !== 'sortKey') keys.add(k);
      });
    });
    return Array.from(keys);
  }, [chartData]);

  const COLORS = ['#4f46e5', '#ec4899', '#06b6d4', '#f59e0b', '#10b981'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
          <p className="text-slate-500 text-xs font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-semibold text-xs mb-1" style={{ color: entry.color }}>
              {entry.name}: Rp {entry.value.toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderGrowth = (customer) => {
    let current = 0;
    let previous = 0;
    
    if (chartView === 'monthly') {
      current = Number(customer.this_month_spent || 0);
      previous = Number(customer.last_month_spent || 0);
    } else {
      current = Number(customer.this_year_spent || 0);
      previous = Number(customer.last_year_spent || 0);
    }

    if (previous === 0 && current > 0) {
      return <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-semibold"><TrendingUp size={14} /> Baru</div>;
    }
    if (previous === 0 && current === 0) {
      return <div className="flex items-center justify-end gap-1 text-slate-400 text-xs font-medium"><Minus size={14} /> 0%</div>;
    }

    const growth = ((current - previous) / previous) * 100;
    const formatted = Math.abs(growth).toFixed(1) + '%';

    if (growth > 0) {
      return <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-semibold"><TrendingUp size={14} /> +{formatted}</div>;
    } else if (growth < 0) {
      return <div className="flex items-center justify-end gap-1 text-rose-500 text-xs font-semibold"><TrendingDown size={14} /> -{formatted}</div>;
    }
    
    return <div className="flex items-center justify-end gap-1 text-slate-400 text-xs font-medium"><Minus size={14} /> 0%</div>;
  };

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Chart Section */}
      <div className="card animate-fade-in mb-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tren Belanja Pelanggan (Top 5)</h2>
            <p className="text-xs text-slate-500 mt-1">Perbandingan tren kontribusi pelanggan teratas dari waktu ke waktu</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${chartView === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setChartView('monthly')}
            >
              Bulanan
            </button>
            <button 
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${chartView === 'yearly' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setChartView('yearly')}
            >
              Tahunan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <span className="text-slate-400 text-sm font-medium">Memuat grafik...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <span className="text-slate-400 text-sm font-medium">Belum ada data transaksi pelanggan</span>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}Jt`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                {customerNames.map((name, index) => (
                  <Line 
                    key={name}
                    type="monotone" 
                    dataKey={name} 
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-between items-center gap-6">
          <div>
             <h3 className="text-base font-bold text-slate-800">Top Pelanggan</h3>
             <p className="text-xs text-slate-500 mt-1">Daftar pelanggan dengan kontribusi terbesar beserta pertumbuhannya</p>
          </div>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg retail-label" style={{ fontSize: 11, fontWeight: 400, textTransform: 'none' }}>
             {data.top_customers.length} pelanggan
          </span>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Nama Pelanggan</th>
              <th className="retail-table-header">No. HP</th>
              <th className="text-center retail-table-header">Frekuensi</th>
              <th className="text-right retail-table-header">Total Kontribusi</th>
              <th className="text-right retail-table-header">Tren (Pertumbuhan)</th>
              <th className="text-right pr-6 retail-table-header">Rata-rata Order</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <RetailTableLoadingRow colSpan={6} text="Menghitung Loyalitas..." />
            ) : data.top_customers.length === 0 ? (
               <tr><td colSpan="6" style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Belum ada data pelanggan yang melakukan transaksi di POS.</td></tr>
            ) : (
              data.top_customers.map(tc => (
                <tr key={tc.customer_id}>
                  <td className="pl-6">
                    <span className="text-slate-800 font-medium">{tc.customer?.name || 'Umum'}</span>
                  </td>
                  <td>
                    <span className="text-slate-500">{tc.customer?.contact || '-'}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-gray">{tc.visit_count}x</span>
                  </td>
                  <td className="text-right">
                    <span className="text-primary-600 font-semibold">Rp {Math.round(Number(tc.total_spent || 0)).toLocaleString('id-ID')}</span>
                  </td>
                  <td className="text-right">
                    {renderGrowth(tc)}
                  </td>
                  <td className="text-right pr-6">
                    <span className="text-slate-500">Rp {Math.round(tc.avg_spent || (tc.total_spent / tc.visit_count)).toLocaleString('id-ID')}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
      </div>

      <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px dashed var(--border-color)' }}>
        <p style={{ margin: 0, fontSize: 13, color:'var(--text-muted)', textAlign:'center' }}>
          💡 Tip: Gunakan data ini untuk memberikan diskon khusus atau reward kepada Top Spenders Anda agar mereka semakin loyal.
        </p>
      </div>
    </div>
  );
}
