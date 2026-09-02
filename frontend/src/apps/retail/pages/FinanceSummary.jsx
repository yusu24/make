import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Printer, 
  Calendar, 
  Layers, 
  FileText, 
  Info,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function FinanceSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_sales: 0,
    gross_sales: 0,
    total_discounts: 0,
    total_cogs: 0,
    gross_profit: 0,
    total_expenses: 0,
    total_incomes: 0,
    profit: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month'); // today, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const printRef = useRef(null);

  useEffect(() => {
    // Set default to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const fetchSummary = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await api.get('/retail/finance/summary', {
        params: { startDate, endDate }
      });
      setSummary(res.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);
    const today = new Date();
    if (val === 'today') {
      const td = today.toISOString().split('T')[0];
      setStartDate(td);
      setEndDate(td);
    } else if (val === 'month') {
      const fd = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const ld = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(fd);
      setEndDate(ld);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Laba-Rugi-${user?.tenant_name || 'Retail'}-${startDate}_${endDate}`,
  });

  const grossSales = summary.gross_sales || (Number(summary.total_sales || 0) + Number(summary.total_discounts || 0));
  const grossProfit = Number(summary.total_sales || 0) - Number(summary.total_cogs || 0);
  const netMarginRate = summary.total_sales > 0 
    ? ((Number(summary.profit || 0) / Number(summary.total_sales)) * 100).toFixed(1) 
    : '0.0';
  const grossMarginRate = summary.total_sales > 0 
    ? ((Number(summary.gross_profit || grossProfit) / Number(summary.total_sales)) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Header action button */}
      <div className="page-header" style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint} disabled={loading}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* ========================================================= */}
        {/* PRINT-ONLY FORMAL MONOCHROME LABA RUGI PDF TEMPLATE       */}
        {/* ========================================================= */}
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Laporan Resmi */}
          <RetailPrintHeader
            user={user}
            title="Laporan Laba Rugi"
            subtitle="Ikhtisar Kinerja Pendapatan, Beban Pokok & Laba Usaha Komprehensif (Income Statement)"
            startDate={startDate}
            endDate={endDate}
          />

          {/* 2. Formal Income Statement Breakdown Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader title="I. Laporan Laba Rugi Komprehensif (Income Statement)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                {/* A. PENDAPATAN */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. PENDAPATAN USAHA (REVENUE)
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Penjualan Kotor (Gross Sales)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>{formatRp(grossSales)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Potongan / Diskon Penjualan</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>({formatRp(summary.total_discounts || 0)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>Total Pendapatan Bersih (Net Revenue)</td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>{formatRp(summary.total_sales || 0)}</td>
                </tr>

                {/* B. HPP */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                    B. HARGA POKOK PENJUALAN (HPP / COGS)
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Beban Pokok Penjualan Barang Dagang</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>({formatRp(summary.total_cogs || 0)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>Total HPP</td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>({formatRp(summary.total_cogs || 0)})</td>
                </tr>

                {/* C. LABA KOTOR */}
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '6px 4px', color: '#000000' }}>C. LABA KOTOR (GROSS PROFIT)</td>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>Margin: {grossMarginRate}%</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', color: '#000000', fontSize: 11.5, fontWeight: 600 }}>{formatRp(summary.gross_profit || grossProfit)}</td>
                </tr>

                {/* D. BEBAN OPERASIONAL */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                    D. BEBAN OPERASIONAL (OPERATING EXPENSES)
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pengeluaran & Beban Operasional Toko</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>({formatRp(summary.total_expenses || 0)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>Total Beban Operasional</td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>({formatRp(summary.total_expenses || 0)})</td>
                </tr>

                {/* E. PENDAPATAN LAIN */}
                {Number(summary.total_incomes) > 0 && (
                  <>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>E. PENDAPATAN LAIN-LAIN</td>
                      <td></td>
                    </tr>
                    <tr style={{ borderBottom: '1.5px solid #000000' }}>
                      <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Pemasukan Tambahan Manual</td>
                      <td></td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>+{formatRp(summary.total_incomes || 0)}</td>
                    </tr>
                  </>
                )}

                {/* F. LABA BERSIH AKHIR */}
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '8px 4px', fontSize: 11, color: '#000000' }}>
                    LABA BERSIH PERIODE BERJALAN (NET PROFIT)
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Net Margin: {netMarginRate}%
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 12, color: '#000000', fontWeight: 600 }}>
                    {formatRp(summary.profit || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <RetailPrintFooter user={user} showSignatures={true} />

          {/* 3. HALAMAN 2: LAMPIRAN PENJELASAN & RUMUS PERHITUNGAN LABA RUGI */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <RetailPrintAppendixHeader 
              title="Lampiran: Penjelasan & Rumus Perhitungan Laba Rugi"
              subtitle={`Keterangan Metodologi Akuntansi & Sumber Data Transaksi — ${user?.tenant_name || 'Toko Retail'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              
              <RetailPrintExplanationBox
                number="1"
                title="Total Penjualan Kotor (Gross Revenue) & Diskon"
                desc="Dihitung dari total nilai seluruh transaksi kasir yang berstatus Lunas pada rentang tanggal yang dipilih, sebelum dikurangi potongan harga. Jika terdapat diskon nota atau diskon item, nilai potongan diakumulasikan pada komponen Potongan / Diskon Penjualan."
                formula="Rumus: Total Pendapatan Bersih = Total Penjualan Kotor - Total Diskon Penjualan"
                variant="default"
              />

              <RetailPrintExplanationBox
                number="2"
                title="Harga Pokok Penjualan (HPP / Cost of Goods Sold)"
                desc="Merupakan total modal awal/harga beli produk yang berhasil terjual. Sistem mengalikan kuantitas setiap produk yang laku dengan harga modal pokok barang (cost price) saat transaksi terjadi."
                formula="Rumus: Total HPP = Σ (Jumlah Barang Terjual × Harga Pokok / Modal Satuan)"
                variant="default"
              />

              <RetailPrintExplanationBox
                number="3"
                title="Laba Kotor Usaha (Gross Profit)"
                desc="Keuntungan murni dari aktivitas perdagangan barang sebelum dipotong biaya sewa, gaji, listrik, dan biaya operasional lainnya."
                formula="Rumus: Laba Kotor = Total Pendapatan Bersih - Total HPP"
                variant="emerald"
              />

              <RetailPrintExplanationBox
                number="4"
                title="Beban Operasional Toko (Operating Expenses)"
                desc="Akumulasi seluruh pengeluaran kas non-HPP yang dicatatkan pada modul Pengeluaran Kas / Biaya Toko selama periode berjalan, seperti gaji karyawan, listrik, air, internet, perlengkapan kasir, pemeliharaan, serta logistik."
                formula="Rumus: Total Beban Operasional = Σ (Seluruh Transaksi Beban Operasional Tercatat)"
                variant="amber"
              />

              <RetailPrintExplanationBox
                number="5"
                title="Laba Bersih Akhir (Net Profit / Loss) & Margin Rate"
                desc="Hasil laba/rugi bersih riil bisnis yang siap menjadi dividen atau laba ditahan untuk modal usaha periode berikutnya."
                formula="Rumus Laba Bersih = Laba Kotor + Pemasukan Lainnya - Total Beban Operasional | Net Margin = (Laba Bersih ÷ Total Omset) × 100%"
                variant="dark"
              />

            </div>

            {/* Catatan Audit Sistem (Tanpa Kolom Tanda Tangan Ulang) */}
            <RetailPrintFooter user={user} showSignatures={false} />
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCREEN-ONLY INTERACTIVE UI                                 */}
        {/* ========================================================= */}
        <div className="no-print">
          {/* Period Filter Card */}
          <div className="card card-pad" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="retail-filter-group">
              <Calendar size={15} className="retail-text-secondary" style={{ flexShrink: 0 }} />
              <select className="retail-filter-select" value={dateFilter} onChange={handleFilterChange}>
                <option value="today">Hari Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Pilih Rentang Tanggal...</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="date" className="retail-filter-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input type="date" className="retail-filter-date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* Net Profit Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden mb-6 mt-4">
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    Net Profit
                  </span>
                  <span className="text-xs text-slate-400">Periode: {formatDateIndo(startDate)} - {formatDateIndo(endDate)}</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white mt-1">
                  {formatRp(summary.profit || 0)}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Margin Keuntungan Bersih: <strong className="text-emerald-400 font-bold">{netMarginRate}%</strong> dari total penjualan
                </p>
              </div>
              <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400 shrink-0">
                <DollarSign size={32} />
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Penjualan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Penjualan Bersih</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{formatRp(summary.total_sales || 0)}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Kotor: {formatRp(grossSales)}</span>
                {Number(summary.total_discounts) > 0 && (
                  <span className="text-rose-500 font-medium">Diskon: -{formatRp(summary.total_discounts)}</span>
                )}
              </div>
            </div>

            {/* Total HPP */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Beban Pokok (HPP)</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Layers size={16} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{formatRp(summary.total_cogs || 0)}</p>
              <p className="text-xs text-slate-400 mt-1">Modal awal barang yang terjual</p>
            </div>

            {/* Laba Kotor */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laba Kotor (Gross Profit)</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Percent size={16} />
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-600 mt-2">{formatRp(summary.gross_profit || grossProfit)}</p>
              <p className="text-xs text-emerald-600/80 mt-1 font-medium">Gross Margin: {grossMarginRate}%</p>
            </div>

            {/* Total Beban Operasional */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Beban Operasional</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                  <TrendingDown size={16} />
                </div>
              </div>
              <p className="text-xl font-bold text-rose-600 mt-2">{formatRp(summary.total_expenses || 0)}</p>
              <p className="text-xs text-slate-400 mt-1">Pengeluaran & operasional toko</p>
            </div>
          </div>

          {/* Income Statement Table View on Screen */}
          <div className="card table-wrap" style={{ padding: '24px' }}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                <h3 className="font-bold text-slate-800 text-base">Rincian Laporan Laba Rugi Komprehensif</h3>
              </div>
            </div>

            <div className="retail-table-responsive">
              <table className="table" style={{ width: '100%' }}>
                <tbody>
                  {/* Revenue */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={2}>1. PENDAPATAN (REVENUE)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="pl-6 text-slate-600">Penjualan Kotor (Gross Sales)</td>
                    <td className="text-right font-medium text-slate-800">{formatRp(grossSales)}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="pl-6 text-slate-600">Potongan Diskon Penjualan</td>
                    <td className="text-right text-rose-600 font-medium">({formatRp(summary.total_discounts || 0)})</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-slate-200 font-semibold bg-slate-50/50">
                    <td className="pl-6 text-slate-900">Total Pendapatan Bersih (Net Revenue)</td>
                    <td></td>
                    <td className="text-right font-bold text-slate-900">{formatRp(summary.total_sales || 0)}</td>
                  </tr>

                  {/* COGS */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={2}>2. HARGA POKOK PENJUALAN (COGS)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="pl-6 text-slate-600">Beban Pokok Penjualan Barang</td>
                    <td className="text-right text-rose-600 font-medium">({formatRp(summary.total_cogs || 0)})</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-slate-200 font-semibold bg-slate-50/50">
                    <td className="pl-6 text-slate-900">Total HPP</td>
                    <td></td>
                    <td className="text-right font-bold text-rose-600">({formatRp(summary.total_cogs || 0)})</td>
                  </tr>

                  {/* Gross Profit */}
                  <tr className="bg-emerald-50/60 border-y border-emerald-200 font-bold text-emerald-900">
                    <td>3. LABA KOTOR (GROSS PROFIT)</td>
                    <td className="text-center text-xs text-emerald-700 font-semibold">Margin: {grossMarginRate}%</td>
                    <td className="text-right text-base text-emerald-700">{formatRp(summary.gross_profit || grossProfit)}</td>
                  </tr>

                  {/* Operational Expenses */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td colSpan={2}>4. BEBAN OPERASIONAL (EXPENSES)</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td className="pl-6 text-slate-600">Pengeluaran & Biaya Operasional Toko</td>
                    <td className="text-right text-rose-600 font-medium">({formatRp(summary.total_expenses || 0)})</td>
                    <td></td>
                  </tr>
                  <tr className="border-b border-slate-200 font-semibold bg-slate-50/50">
                    <td className="pl-6 text-slate-900">Total Beban Operasional</td>
                    <td></td>
                    <td className="text-right font-bold text-rose-600">({formatRp(summary.total_expenses || 0)})</td>
                  </tr>

                  {/* Other Incomes */}
                  {Number(summary.total_incomes) > 0 && (
                    <>
                      <tr className="bg-slate-50 font-bold text-slate-800">
                        <td colSpan={2}>5. PENDAPATAN LAINNYA</td>
                        <td></td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="pl-6 text-slate-600">Pemasukan Tambahan Manual</td>
                        <td></td>
                        <td className="text-right font-bold text-emerald-600">+{formatRp(summary.total_incomes || 0)}</td>
                      </tr>
                    </>
                  )}

                  {/* Net Profit */}
                  <tr className="net-profit-row font-extrabold text-base" style={{ background: '#0f172a' }}>
                    <td className="net-profit-cell py-4 pl-4 font-bold" style={{ background: '#0f172a' }}>
                      LABA BERSIH (NET PROFIT)
                    </td>
                    <td className="net-profit-sub py-4 text-center text-xs font-semibold" style={{ background: '#0f172a' }}>
                      Net Margin: {netMarginRate}%
                    </td>
                    <td 
                      className={`py-4 pr-4 text-right font-black text-lg ${Number(summary.profit || 0) >= 0 ? 'net-profit-positive' : 'net-profit-negative'}`}
                      style={{ background: '#0f172a' }}
                    >
                      {formatRp(summary.profit || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
