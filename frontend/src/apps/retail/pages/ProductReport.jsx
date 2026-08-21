import React, { useState, useEffect } from 'react';
import '../retail.css';
import { api } from '../../../lib/api';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductReport() {
  const [data, setData] = useState({ top_products: [], low_stock: [] });
  const [loading, setLoading] = useState(true);
  
  // Date filters defaulting to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchData = () => {
    setLoading(true);
    api.get(`/retail/reports?startDate=${startDate}&endDate=${endDate}`)
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  const chartData = data.top_products.map(tp => ({
    name: tp.product?.name?.substring(0, 15) + (tp.product?.name?.length > 15 ? '...' : ''),
    qty: Number(tp.total_qty)
  }));

  const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Produk Paling Laris</h3>
              <p className="text-xs text-gray-500 mt-0.5">Berdasarkan volume penjualan (Top 5)</p>
            </div>
          </div>
          <div className="p-5">
            {loading ? <div className="flex justify-center items-center h-64"><p className="text-gray-400 animate-pulse">Menganalisa...</p></div> : (
              <>
                {chartData.length > 0 ? (
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={120} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="qty" name="Terjual" radius={[0, 4, 4, 0]} barSize={24}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-3 font-medium">Nama Barang</th>
                        <th className="p-3 font-medium text-right">Total Terjual</th>
                        <th className="p-3 font-medium text-right">Peringkat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.top_products.map((tp, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-3 font-medium text-gray-800">{tp.product?.name}</td>
                          <td className="p-3 text-right text-gray-600">{tp.total_qty} <span className="text-xs text-gray-400">{tp.product?.unit}</span></td>
                          <td className="p-3 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              Top {i+1}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {data.top_products.length === 0 && <tr><td colSpan="3" className="text-center p-8 text-gray-400">Belum ada data penjualan pada periode ini.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Peringatan Stok Kritis</h3>
              <p className="text-xs text-gray-500 mt-0.5">Barang yang hampir habis atau melewati batas minimal</p>
            </div>
          </div>
          <div className="p-5">
            {loading ? <div className="flex justify-center items-center h-32"><p className="text-gray-400 animate-pulse">Mengecek gudang...</p></div> : (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-3 font-medium">Nama Barang</th>
                      <th className="p-3 font-medium text-right">Sisa</th>
                      <th className="p-3 font-medium text-right">Batas Min.</th>
                      <th className="p-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.low_stock.map(p => (
                      <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                        <td className="p-3 font-medium text-gray-800">{p.name}</td>
                        <td className="p-3 text-right font-bold text-red-500">{p.stock}</td>
                        <td className="p-3 text-right text-gray-500">{p.stock_min}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                            Kritis
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.low_stock.length === 0 && <tr><td colSpan="4" className="text-center p-8 text-gray-400">Semua stok aman. Tidak ada peringatan.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            <button className="w-full mt-6 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-200" onClick={()=>window.location.href='/retail/inventory'}>
              Kelola Semua Inventori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
