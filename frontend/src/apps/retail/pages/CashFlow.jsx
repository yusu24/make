import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { Activity, Search, Download, Calendar } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Skeleton from '../../../components/Skeleton';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CashFlow() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date();
  firstDay.setDate(1);
  const startOfMonth = firstDay.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(today);

  const demoEmails = ['ahmad@retail.com','retail@demo.com','siti@ikan.com','budidaya@demo.com','dewi@kuliner.com','kuliner@demo.com','jasa@demo.com','seller@demo.com'];
  const isDemo = user?.email?.startsWith('demo-sandbox-') || user?.email?.startsWith('demo-kuliner-') || demoEmails.includes(user?.email);
  const isPro = user?.subscription_plan === 'pro' || isDemo;

  useEffect(() => {
    if (isPro) fetchCashFlow();
    else setLoading(false);
  }, [isPro]);

  const fetchCashFlow = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/retail/finance/cash-flow?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch (err) {
      toast.error('Gagal memuat laporan arus kas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchCashFlow();
  };

  if (!isPro) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center mt-20">
        <Activity size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Fitur Laporan Arus Kas (Pro)</h2>
        <p className="text-gray-500 mb-6">Upgrade paket Anda ke Pro untuk membuka Laporan Arus Kas yang komprehensif.</p>
        <button onClick={() => window.location.href='/retail/subscription'} className="btn btn-primary">
          Upgrade Sekarang
        </button>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const chartData = data ? [
    { name: 'Penjualan', value: Number(data.inflow.sales) },
    { name: 'Pemasukan Lain', value: Number(data.inflow.other_incomes) },
    { name: 'Pembayaran Piutang', value: Number(data.inflow.receivable_payments) },
    { name: 'Pengeluaran Lain', value: Number(data.outflow.other_expenses) },
    { name: 'Pembayaran Hutang', value: Number(data.outflow.payable_payments) },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="flex justify-end mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-2 border-r border-gray-100">
            <Calendar size={16} className="text-gray-400" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-none bg-transparent text-sm focus:ring-0 outline-none w-[120px]" />
            <span className="text-gray-400">-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-none bg-transparent text-sm focus:ring-0 outline-none w-[120px]" />
          </div>
          <button type="submit" className="btn btn-sm btn-primary">Filter</button>
        </form>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton height={150} />
          <Skeleton height={300} />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={64} className="text-emerald-500" />
              </div>
              <p className="text-emerald-600 text-sm font-semibold mb-1">Total Kas Masuk</p>
              <h3 className="text-2xl font-bold text-emerald-700">Rp {Number(data.inflow.total).toLocaleString('id-ID')}</h3>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity size={64} className="text-red-500" />
              </div>
              <p className="text-red-600 text-sm font-semibold mb-1">Total Kas Keluar</p>
              <h3 className="text-2xl font-bold text-red-700">Rp {Number(data.outflow.total).toLocaleString('id-ID')}</h3>
            </div>
            
            <div className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-center relative overflow-hidden ${data.net_cash >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
              <p className={`text-sm font-semibold mb-1 ${data.net_cash >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Arus Kas Bersih (Net)</p>
              <h3 className={`text-2xl font-bold ${data.net_cash >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Rp {Number(data.net_cash).toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakdowns */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Rincian Kas Masuk</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">Penjualan (Lunas)</span>
                  <span className="font-semibold">Rp {Number(data.inflow.sales).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">Pembayaran Piutang</span>
                  <span className="font-semibold">Rp {Number(data.inflow.receivable_payments).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">Pemasukan Lain</span>
                  <span className="font-semibold">Rp {Number(data.inflow.other_incomes).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 mt-4">
                  <span className="text-gray-800 font-bold">Total Inflow</span>
                  <span className="font-bold text-emerald-600">Rp {Number(data.inflow.total).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Rincian Kas Keluar</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">Pembayaran Hutang (Supplier)</span>
                  <span className="font-semibold">Rp {Number(data.outflow.payable_payments).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600">Pengeluaran Operasional</span>
                  <span className="font-semibold">Rp {Number(data.outflow.other_expenses).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center py-2 mt-4">
                  <span className="text-gray-800 font-bold">Total Outflow</span>
                  <span className="font-bold text-red-600">Rp {Number(data.outflow.total).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Grafik Proporsi Kas</h3>
              {chartData.length > 0 ? (
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Belum ada data untuk periode ini
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
