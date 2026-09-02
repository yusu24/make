import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { Activity, Calendar, Printer } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Skeleton from '../../../components/Skeleton';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function CashFlow() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);
  
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Arus-Kas-${user?.tenant_name || 'Retail'}-${startDate}_${endDate}`,
  });

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
    { name: 'Penjualan', value: Number(data.inflow?.sales || 0) },
    { name: 'Pemasukan Lain', value: Number(data.inflow?.other_incomes || 0) },
    { name: 'Pembayaran Piutang', value: Number(data.inflow?.receivable_payments || 0) },
    { name: 'Pengeluaran Lain', value: Number(data.outflow?.other_expenses || 0) },
    { name: 'Pembayaran Hutang', value: Number(data.outflow?.payable_payments || 0) },
  ].filter(d => d.value > 0) : [];

  const netCash = Number(data?.net_cash || 0);
  const totalInflow = Number(data?.inflow?.total || 0);
  const totalOutflow = Number(data?.outflow?.total || 0);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Header action toolbar */}
      <div className="flex justify-end items-center gap-3 mb-6 no-print">
        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-2 border-r border-gray-100">
            <Calendar size={16} className="text-gray-400" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-none bg-transparent text-sm focus:ring-0 outline-none w-[130px]" />
            <span className="text-gray-400">-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-none bg-transparent text-sm focus:ring-0 outline-none w-[130px]" />
          </div>
          <button type="submit" className="btn btn-sm btn-primary">Filter</button>
        </form>
        <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint} disabled={loading || !data}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* ========================================================= */}
        {/* PRINT-ONLY FORMAL ACCOUNTING CASH FLOW PDF TEMPLATE       */}
        {/* ========================================================= */}
        {data && (
          <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#0f172a' }}>
            
            {/* 1. Header / Kop Laporan Resmi */}
            <RetailPrintHeader
              user={user}
              title="Laporan Arus Kas"
              subtitle="Laporan Arus Kas Masuk & Keluar Komprehensif (Statement of Cash Flows — Direct Method)"
              startDate={startDate}
              endDate={endDate}
            />            
            <div style={{ marginBottom: 22 }}>
              <RetailPrintSectionHeader title="I. Laporan Arus Kas Komprehensif (Statement of Cash Flows)" />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
                <tbody>
                  {/* A. KAS MASUK */}
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                      A. ARUS KAS DARI AKTIVITAS PENJUALAN & OPERASIONAL (CASH INFLOW)
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Penerimaan Kasir dari Penjualan Tunai / Lunas</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>{formatRp(data.inflow?.sales)}</td>
                    <td style={{ width: 140 }}></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Penerimaan Kas Pelunasan Piutang Pelanggan</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>{formatRp(data.inflow?.receivable_payments)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pemasukan Kas Tambahan / Non-Penjualan Manual</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>{formatRp(data.inflow?.other_incomes)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>Total Penerimaan Arus Kas Masuk (A)</td>
                    <td></td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600 }}>{formatRp(totalInflow)}</td>
                  </tr>

                  {/* B. KAS KELUAR */}
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                      B. ARUS KAS KELUAR UNTUK PEMBELIAN & BEBAN USAHA (CASH OUTFLOW)
                    </td>
                    <td style={{ padding: '8px 4px 6px', textAlign: 'right' }}></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pembayaran Hutang Pembelian Barang ke Supplier</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>({formatRp(data.outflow?.payable_payments)})</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pengeluaran Kas untuk Biaya & Beban Operasional Toko</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>({formatRp(data.outflow?.other_expenses)})</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>Total Pengeluaran Arus Kas Keluar (B)</td>
                    <td></td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600 }}>({formatRp(totalOutflow)})</td>
                  </tr>

                  {/* C. NET CASH FLOW */}
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                    <td colSpan={2} style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                      KENAIKAN / (PENURUNAN) BERSIH SALDO KAS (NET CASH FLOW = A - B)
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600 }}>
                      {formatRp(netCash)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginBottom: 22 }}>
              <RetailPrintSectionHeader title="II. Rincian Proporsi & Alokasi Komponen Arus Kas" />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                <thead>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                    <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Nama Komponen Arus Kas</th>
                    <th style={{ padding: '7px 6px', textAlign: 'right', width: 145, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Masuk / Inflow (Rp)</th>
                    <th style={{ padding: '7px 6px', textAlign: 'right', width: 145, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Keluar / Outflow (Rp)</th>
                    <th style={{ padding: '7px 6px', textAlign: 'right', width: 95, fontWeight: 600, whiteSpace: 'nowrap' }}>Proporsi (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>1</td>
                    <td style={{ padding: '6px 6px', color: '#000000', fontWeight: 500 }}>Penjualan Kasir (POS Tunai/Lunas)</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(data.inflow?.sales)}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'center', color: '#6B7280' }}>-</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {totalInflow > 0 ? ((Number(data.inflow?.sales || 0) / totalInflow) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>2</td>
                    <td style={{ padding: '6px 6px', color: '#000000', fontWeight: 500 }}>Pelunasan Piutang Pelanggan</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(data.inflow?.receivable_payments)}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'center', color: '#6B7280' }}>-</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {totalInflow > 0 ? ((Number(data.inflow?.receivable_payments || 0) / totalInflow) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>3</td>
                    <td style={{ padding: '6px 6px', color: '#000000', fontWeight: 500 }}>Pemasukan Kas Tambahan Manual</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(data.inflow?.other_incomes)}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'center', color: '#6B7280' }}>-</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {totalInflow > 0 ? ((Number(data.inflow?.other_incomes || 0) / totalInflow) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>4</td>
                    <td style={{ padding: '6px 6px', color: '#000000', fontWeight: 500 }}>Pembayaran Hutang ke Supplier</td>
                    <td style={{ padding: '6px 6px', textAlign: 'center', color: '#6B7280' }}>-</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(data.outflow?.payable_payments)})</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {totalOutflow > 0 ? ((Number(data.outflow?.payable_payments || 0) / totalOutflow) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>5</td>
                    <td style={{ padding: '6px 6px', color: '#000000', fontWeight: 500 }}>Beban Operasional & Pengeluaran Toko</td>
                    <td style={{ padding: '6px 6px', textAlign: 'center', color: '#6B7280' }}>-</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(data.outflow?.other_expenses)})</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {totalOutflow > 0 ? ((Number(data.outflow?.other_expenses || 0) / totalOutflow) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                    <td colSpan={2} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                      Total Rekapitulasi Arus Kas:
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      +{formatRp(totalInflow)}
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      ({formatRp(totalOutflow)})
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 9.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Net: {formatRp(netCash)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <RetailPrintFooter user={user} showSignatures={true} />

            <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
              <RetailPrintAppendixHeader 
                title="Lampiran: Penjelasan & Metodologi Analisis Arus Kas"
                subtitle={`Keterangan Metodologi Arus Kas Langsung (Direct Cash Flow Statement) — ${user?.tenant_name || 'Toko Retail'}`}
                user={user}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                <RetailPrintExplanationBox
                  number="1"
                  title="Metodologi Arus Kas Langsung (Direct Cash Flow Method)"
                  desc="Laporan arus kas disusun dengan menghitung aliran kas riil (uang yang benar-benar masuk dan keluar dari laci kas dan rekening bank) selama periode tertentu, bukan sekadar laba akuntansi akrual."
                  variant="default"
                />

                <RetailPrintExplanationBox
                  number="2"
                  title="Komponen Arus Kas Masuk (Operating Cash Inflow)"
                  desc="Terdiri dari penerimaan uang tunai dari penjualan langsung di kasir (POS), uang tunai dari cicilan/pelunasan piutang pelanggan, serta pendapatan kas tambahan non-penjualan."
                  formula="Rumus Inflow = Penjualan Kasir Lunas + Pembayaran Piutang + Pemasukan Lain"
                  variant="emerald"
                />

                <RetailPrintExplanationBox
                  number="3"
                  title="Komponen Arus Kas Keluar (Operating Cash Outflow)"
                  desc="Terdiri dari pembayaran tunai/transfer kepada supplier untuk pelunasan stok barang dagang serta seluruh pembayaran beban operasional toko (listrik, gaji, sewa, perlengkapan)."
                  formula="Rumus Outflow = Pembayaran Hutang Supplier + Beban Operasional Tercatat"
                  variant="rose"
                />

                <RetailPrintExplanationBox
                  number="4"
                  title="Kenaikan / Penurunan Kas Bersih (Net Cash Flow)"
                  desc="Jika bernilai positif, menandakan toko menghasilkan surplus likuiditas kas. Jika bernilai negatif, menandakan toko mengalami defisit kas jangka pendek dan memerlukan evaluasi pembayaran piutang/pengeluaran."
                  formula="Rumus: Net Cash Flow = Total Arus Kas Masuk - Total Arus Kas Keluar"
                  variant="indigo"
                />

                <RetailPrintExplanationBox
                  number="5"
                  title="Prinsip Kecukupan Dana Kas Operasional"
                  desc="Toko wajib menjaga saldo kas minimum untuk mengantisipasi kewajiban tempo supplier yang akan jatuh tempo dan menjaga kelancaran pasokan barang."
                  variant="dark"
                />
              </div>

              {/* Kolom Tanda Tangan & Catatan Audit */}
              <RetailPrintFooter user={user} />
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN-ONLY INTERACTIVE UI                                 */}
        {/* ========================================================= */}
        <div className="no-print">
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
                  <h3 className="text-2xl font-bold text-emerald-700">{formatRp(data.inflow?.total)}</h3>
                </div>
                
                <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={64} className="text-red-500" />
                  </div>
                  <p className="text-red-600 text-sm font-semibold mb-1">Total Kas Keluar</p>
                  <h3 className="text-2xl font-bold text-red-700">{formatRp(data.outflow?.total)}</h3>
                </div>
                
                <div className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col justify-center relative overflow-hidden ${netCash >= 0 ? 'border-blue-100' : 'border-orange-100'}`}>
                  <p className={`text-sm font-semibold mb-1 ${netCash >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Arus Kas Bersih (Net)</p>
                  <h3 className={`text-2xl font-bold ${netCash >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{formatRp(netCash)}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breakdowns */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Rincian Kas Masuk</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600">Penjualan (Lunas)</span>
                      <span className="font-semibold">{formatRp(data.inflow?.sales)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600">Pembayaran Piutang</span>
                      <span className="font-semibold">{formatRp(data.inflow?.receivable_payments)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600">Pemasukan Lain</span>
                      <span className="font-semibold">{formatRp(data.inflow?.other_incomes)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 mt-4">
                      <span className="text-gray-800 font-bold">Total Inflow</span>
                      <span className="font-bold text-emerald-600">{formatRp(data.inflow?.total)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">Rincian Kas Keluar</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600">Pembayaran Hutang (Supplier)</span>
                      <span className="font-semibold">{formatRp(data.outflow?.payable_payments)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600">Pengeluaran Operasional</span>
                      <span className="font-semibold">{formatRp(data.outflow?.other_expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 mt-4">
                      <span className="text-gray-800 font-bold">Total Outflow</span>
                      <span className="font-bold text-red-600">{formatRp(data.outflow?.total)}</span>
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
                          <Tooltip formatter={(value) => formatRp(value)} />
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
      </div>
    </div>
  );
}
