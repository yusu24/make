import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { FileText, Calendar } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Skeleton from '../../../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TaxReport() {
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
    if (isPro) fetchTaxReport();
    else setLoading(false);
  }, [isPro]);

  const fetchTaxReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/retail/finance/tax-report?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data);
    } catch (err) {
      toast.error('Gagal memuat laporan pajak');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchTaxReport();
  };

  const chartData = useMemo(() => {
    if (!data?.transactions) return [];
    const grouped = {};
    data.transactions.forEach(t => {
      const date = t.created_at.split('T')[0];
      if (!grouped[date]) grouped[date] = 0;
      grouped[date] += Number(t.tax_amount);
    });
    return Object.keys(grouped).sort().map(date => ({
      date,
      tax: grouped[date]
    }));
  }, [data]);

  if (!isPro) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center mt-20">
        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Fitur Laporan Pajak (Pro)</h2>
        <p className="text-gray-500 mb-6">Upgrade paket Anda ke Pro untuk melihat rekapitulasi PPN dan pajak lainnya secara otomatis.</p>
        <button onClick={() => window.location.href='/retail/subscription'} className="btn btn-primary">
          Upgrade Sekarang
        </button>
      </div>
    );
  }

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
          <Skeleton height={100} />
          <Skeleton height={300} />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-semibold mb-1">Total Penjualan (Termasuk Pajak)</p>
              <h3 className="text-2xl font-bold text-gray-800">Rp {Number(data.summary.total_sales_with_tax).toLocaleString('id-ID')}</h3>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={64} className="text-blue-600" />
              </div>
              <p className="text-blue-600 text-sm font-semibold mb-1">Total Pajak Terkumpul</p>
              <h3 className="text-2xl font-bold text-blue-700">Rp {Number(data.summary.total_tax).toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Grafik Pajak Harian</h3>
              {chartData.length > 0 ? (
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} />
                      <YAxis tick={{fontSize: 12}} tickFormatter={(value) => `Rp ${value / 1000}k`} />
                      <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                      <Bar dataKey="tax" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Tidak ada data pajak pada periode ini.
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800">Rincian Transaksi Pajak</h3>
              </div>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white sticky top-0 border-b border-gray-100">
                    <tr>
                      <th className="p-3 font-medium text-gray-500">No. Invoice</th>
                      <th className="p-3 font-medium text-gray-500 text-right">Pajak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.length > 0 ? (
                      data.transactions.map(t => (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-3 text-blue-600">
                            {t.invoice_no}
                            <div className="text-xs text-gray-400">{t.created_at.split('T')[0]}</div>
                          </td>
                          <td className="p-3 text-right font-medium">Rp {Number(t.tax_amount).toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="p-4 text-center text-gray-400">Tidak ada transaksi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
