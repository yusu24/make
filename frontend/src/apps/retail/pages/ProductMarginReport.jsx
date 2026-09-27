import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Percent, 
  Calendar, RefreshCw, Printer, Search, ArrowUpRight, 
  ArrowDownRight, Layers, Tag
} from '@/constants/icons';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import RetailLoading from '../components/RetailLoading';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { 
  RetailPrintHeader, 
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';
import '../retail.css';
import '../retail-print.css';

const BAR_COLORS = [
  '#059669', // Emerald 600
  '#10b981', // Emerald 500
  '#14b8a6', // Teal 500
  '#06b6d4', // Cyan 500
  '#0284c7', // Sky 600
  '#3b82f6', // Blue 500
  '#6366f1', // Indigo 500
  '#8b5cf6', // Purple 500
  '#a855f7', // Purple 600
  '#64748b'  // Slate 500
];

export default function ProductMarginReport() {
  const { user } = useAuth();
  const printRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Default date filter: Current Month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);

  const [reportData, setReportData] = useState({
    period: { start: startDate, end: endDate },
    summary: {
      total_revenue: 0,
      total_cogs: 0,
      total_margin: 0,
      avg_margin_pct: 0,
      total_products_sold: 0
    },
    top_margins: [],
    data: []
  });

  // Fetch categories for filter dropdown
  useEffect(() => {
    api.get('/retail/categories')
      .then(res => setCategories(res.data || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const fetchMarginReport = () => {
    setLoading(true);
    const params = {
      startDate,
      endDate,
      ...(selectedCategory ? { category_id: selectedCategory } : {})
    };

    api.get('/retail/reports/product-margins', { params })
      .then(res => {
        setReportData(res.data);
      })
      .catch(err => {
        console.error('Error fetching product margin report:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMarginReport();
  }, [startDate, endDate, selectedCategory]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Margin-Produk-${user?.tenant_name || 'Retail'}-${new Date().toISOString().split('T')[0]}`,
  });

  // Search filter on client-side
  const filteredData = (reportData.data || []).filter(item => 
    (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage, setCurrentPage, pageSize, setPageSize, totalPages, totalItems,
    paginatedData, startIndex, endIndex
  } = usePagination(filteredData);

  const chartData = (reportData.top_margins || []).map(item => ({
    name: item.name.length > 22 ? item.name.substring(0, 22) + '...' : item.name,
    fullName: item.name,
    sku: item.sku,
    margin_rp: item.margin_rp,
    margin_pct: item.margin_pct,
    revenue: item.total_revenue,
    cogs: item.total_cogs,
    qty: item.total_qty,
    unit: item.unit
  }));

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Top Filter Bar (Aligned with standard retail reports) */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Tag size={16} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border-none bg-transparent text-sm text-slate-700 focus:ring-0 outline-none cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="border-none bg-transparent text-sm text-slate-700 focus:ring-0 outline-none w-[125px]" 
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="border-none bg-transparent text-sm text-slate-700 focus:ring-0 outline-none w-[125px]" 
            />
          </div>

          <button 
            onClick={fetchMarginReport} 
            className="btn-reset-sync"
            style={{ width: 38, height: 38, flexShrink: 0 }}
            title="Segarkan Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            className="btn btn-secondary shadow-sm"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38 }}
          >
            <Printer size={16} />
            <span className="btn-text-mobile-hide">Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Total Penjualan
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight mt-1">
              {formatRp(reportData.summary.total_revenue)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
            {reportData.summary.total_products_sold} varian barang
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Total Modal (HPP)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight leading-tight mt-1">
              {formatRp(reportData.summary.total_cogs)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
            Biaya pokok barang terjual
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Laba Kotor (Margin)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className={`font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl tracking-tight leading-tight mt-1 ${reportData.summary.total_margin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatRp(reportData.summary.total_margin)}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
            Keuntungan kotor riil
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400 uppercase tracking-wider font-['Inter']">
                Rata-rata Margin
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Percent size={18} />
              </div>
            </div>
            <p className={`font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl tracking-tight leading-tight mt-1 ${reportData.summary.avg_margin_pct >= 20 ? 'text-emerald-600 dark:text-emerald-400' : reportData.summary.avg_margin_pct >= 10 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {reportData.summary.avg_margin_pct}%
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-['Inter']">
            Porsi profit dari omzet
          </div>
        </div>
      </div>

      {/* Top 10 Margin Horizontal Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-white text-base">Top 10 Produk Penyumbang Laba Kotor Terbesar</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-['Inter']">Peringkat produk dengan kontribusi laba kotor tertinggi dari penjualan riil</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-100 dark:border-emerald-800 font-['Inter']">
              Top 10 Profit
            </span>
          </div>

          <div style={{ width: '100%', height: Math.max(280, chartData.length * 36 + 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                <XAxis 
                  type="number"
                  stroke="#64748b" 
                  fontSize={12} 
                  tickFormatter={val => `Rp ${(val/1000).toLocaleString('id-ID')}k`} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  stroke="#334155" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  width={180}
                />
                <Tooltip 
                  formatter={(val, name, item) => [
                    `${formatRp(val)} (Margin: +${item.payload.margin_pct}%)`, 
                    'Laba Kotor'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.fullName} [SKU: ${item.sku || '-'}]` : label;
                  }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="margin_rp" radius={[0, 6, 6, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="card table-wrap animate-fade-in bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs rounded-2xl overflow-hidden">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ width: 320, margin: 0 }}>
            <Search size={16} className="text-slate-400" />
            <input 
              placeholder="Cari nama barang, SKU, atau kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Produk</th>
                <th className="retail-table-header">SKU</th>
                <th className="retail-table-header">Kategori</th>
                <th className="retail-table-header text-right">Qty Terjual</th>
                <th className="retail-table-header text-right">Total Omzet</th>
                <th className="retail-table-header text-right">Total HPP</th>
                <th className="retail-table-header text-right">Laba Kotor (Margin)</th>
                <th className="retail-table-header text-center">Margin %</th>
                <th className="pr-6 retail-table-header text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <RetailTableLoadingRow colSpan={9} text="Menghitung margin & laba kotor produk..." />
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Tidak ada data penjualan produk pada periode dan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const isPositive = item.margin_rp > 0;
                  const isNegative = item.margin_rp < 0;

                  return (
                    <tr key={item.product_id || idx}>
                      <td className="pl-6">
                        <p className="retail-text-primary font-medium">{item.name}</p>
                      </td>
                      <td>
                        <code className="retail-text-primary uppercase tracking-wider text-xs">{item.sku}</code>
                      </td>
                      <td>
                        <span className="px-2.5 py-0.5 retail-bg-primary-subtle rounded-md text-[10px] retail-text-secondary uppercase">
                          {item.category_name}
                        </span>
                      </td>
                      <td className="text-right font-medium text-slate-700">
                        {Number(item.total_qty).toLocaleString('id-ID')} {item.unit}
                      </td>
                      <td className="text-right text-slate-800 font-medium">
                        {formatRp(item.total_revenue)}
                      </td>
                      <td className="text-right text-slate-500 font-medium">
                        {formatRp(item.total_cogs)}
                      </td>
                      <td className={`text-right font-bold ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-600'}`}>
                        {formatRp(item.margin_rp)}
                      </td>
                      <td className="text-center font-bold">
                        {item.margin_pct >= 15 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <TrendingUp size={14} /> +{item.margin_pct}%
                          </span>
                        ) : item.margin_pct >= 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <ArrowUpRight size={14} /> +{item.margin_pct}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600">
                            <TrendingDown size={14} /> {item.margin_pct}%
                          </span>
                        )}
                      </td>
                      <td className="pr-6 text-center">
                        {item.margin_pct >= 30 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <TrendingUp size={12} /> Sangat Sehat
                          </span>
                        ) : item.margin_pct >= 15 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <ArrowUpRight size={12} /> Normal
                          </span>
                        ) : item.margin_pct >= 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <ArrowDownRight size={12} /> Tipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <TrendingDown size={12} /> Rugi
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

      {/* PRINT-ONLY LAYOUT (Hanya muncul saat tombol Cetak Laporan ditekan) */}
      <div ref={printRef}>
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <RetailPrintHeader
            user={user}
            title="LAPORAN MARGIN & PROFITABILITAS PRODUK"
            subtitle="Rekapitulasi Penjualan, Harga Pokok Penjualan (HPP), dan Margin Keuntungan Produk"
            periodText={`Periode: ${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`}
          />

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000', marginTop: 16, marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000000', borderTop: '1px solid #000000' }}>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: 35 }}>No</th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Nama Produk</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', width: 80 }}>SKU</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', width: 90 }}>Kategori</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: 70 }}>Qty</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: 100 }}>Total Omzet</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: 100 }}>Total HPP</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: 105 }}>Laba Kotor</th>
                <th style={{ padding: '8px 6px', textAlign: 'center', width: 65 }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '6px 6px', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '6px 6px' }}><code>{item.sku}</code></td>
                  <td style={{ padding: '6px 6px' }}>{item.category_name}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'right' }}>{item.total_qty} {item.unit}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'right' }}>{formatRp(item.total_revenue)}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'right' }}>{formatRp(item.total_cogs)}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600 }}>{formatRp(item.margin_rp)}</td>
                  <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600 }}>{item.margin_pct}%</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', borderTop: '2px solid #000000', borderBottom: '2px solid #000000', background: '#f8fafc' }}>
                <td colSpan={4} style={{ padding: '8px 6px' }}>TOTAL KESELURUHAN</td>
                <td style={{ padding: '8px 6px', textAlign: 'right' }}>{filteredData.reduce((acc, i) => acc + i.total_qty, 0)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right' }}>{formatRp(reportData.summary.total_revenue)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right' }}>{formatRp(reportData.summary.total_cogs)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right' }}>{formatRp(reportData.summary.total_margin)}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{reportData.summary.avg_margin_pct}%</td>
              </tr>
            </tbody>
          </table>

          <RetailPrintFooter />
        </div>
      </div>
    </div>
  );
}
