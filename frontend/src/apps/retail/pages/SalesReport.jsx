import React, { useState, useEffect, useRef } from 'react';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  BarChart3, TrendingUp, Target, ArrowUpRight, 
  Receipt, RefreshCw, Printer, Calendar
} from 'lucide-react';
import RetailLoading from '../components/RetailLoading';
import '../retail.css';
import '../retail-print.css';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function SalesReport() {
  const { user } = useAuth();
  const [data, setData] = useState({ total_sales: 0, total_transactions: 0, transactions: [], daily_sales: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const fetchReports = () => {
    setLoading(true);
    api.get('/retail/reports')
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Penjualan-${user?.tenant_name || 'Retail'}-${new Date().toISOString().split('T')[0]}`,
  });

  const chartData = (data.daily_sales || []).map(item => ({
    name: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    total: Number(item.total)
  }));

  const filteredTransactions = (data.transactions || []).filter(tx =>
    String(tx.invoice_no || '').toLowerCase().includes(search.toLowerCase()) ||
    (tx.customer?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSalesAmount = (data.transactions || []).reduce((acc, tx) => acc + Number(tx.total_amount || 0), 0);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredTransactions);

  if (loading) return <RetailLoading text="Menganalisis performa penjualan..." />;

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Header action toolbar */}
      <div className="page-header" style={{ marginBottom: 24, justifyContent: 'flex-end' }}>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary flex items-center gap-2" onClick={fetchReports}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Segarkan
          </button>
          <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint}>
            <Printer size={16} /> Cetak / Export PDF
          </button>
        </div>
      </div>

      <div ref={printRef}>
        {/* ========================================================================= */}
        {/* PRINT-ONLY FORMAL MONOCHROME SALES REPORT PDF TEMPLATE                   */}
        {/* ========================================================================= */}
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          {/* 1. Header / Kop Laporan Resmi */}
          <RetailPrintHeader
            user={user}
            title="Laporan Rekapitulasi Penjualan"
            subtitle="Ringkasan Performa Omzet Kasir & Buku Register Transaksi Penjualan (Sales Statement)"
            periodText="Rekapitulasi Transaksi Berjalan"
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader title="I. Ringkasan Kinerja Penjualan Toko (Sales Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. AKUMULASI PENDAPATAN & VOLUME TRANSAKSI
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Volume Transaksi Kasir</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>{data.total_transactions || 0} Transaksi</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Rata-rata Nilai per Transaksi (Basket Size)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>
                    {formatRp(data.total_transactions > 0 ? (totalSalesAmount / data.total_transactions) : 0)}
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>TOTAL OMZET PENJUALAN TERCATAT</td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    {data.transactions?.length || 0} Faktur Terbit
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600 }}>
                    {formatRp(totalSalesAmount || data.total_sales)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader 
              title="II. Buku Register Transaksi Penjualan (Sales Invoice Register)" 
              rightText={`Total ${filteredTransactions.length} faktur transaksi`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 150, fontWeight: 600 }}>No. Faktur / Invoice</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 150, fontWeight: 600 }}>Waktu Transaksi</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Pelanggan</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 140, fontWeight: 600, whiteSpace: 'nowrap' }}>Total Nilai (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'center', width: 85, fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                      Tidak ada catatan penjualan pada filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>#{tx.invoice_no}</td>
                      <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{formatDateIndo(tx.created_at)}</td>
                      <td style={{ padding: '6px 6px', color: '#000000' }}>{tx.customer?.name || 'Pelanggan Umum (Walk-in)'}</td>
                      <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                        {formatRp(tx.total_amount)}
                      </td>
                      <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600, fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                        {tx.status === 'paid' ? 'LUNAS' : String(tx.status).toUpperCase()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Omzet:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalSalesAmount || data.total_sales)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <RetailPrintFooter user={user} showSignatures={true} />

          {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & METODOLOGI PENJUALAN (TANPA ROMAWI) */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <RetailPrintAppendixHeader 
              title="Lampiran: Penjelasan & Metodologi Analisis Penjualan"
              subtitle={`Keterangan Metodologi Audit Penjualan Kasir & Standar Pengakuan Omzet — ${user?.tenant_name || 'Toko Retail'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <RetailPrintExplanationBox
                number="1"
                title="Pengakuan Omzet Penjualan (Revenue Recognition)"
                desc="Omzet diakui secara real-time pada saat struk kasir berhasil dicetak dan pembayaran disahkan (tunai, transfer, QRIS, atau tempo terdaftar)."
                variant="default"
              />

              <RetailPrintExplanationBox
                number="2"
                title="Ukuran Rata-rata Keranjang Belanja (Average Basket Size)"
                desc="Indikator efektivitas promosi dan *cross-selling* kasir yang mengukur rata-rata belanja konsumen dalam satu struk transaksi."
                formula="Rumus: Basket Size = Total Nilai Omzet Penjualan ÷ Total Frekuensi Transaksi"
                variant="emerald"
              />

              <RetailPrintExplanationBox
                number="3"
                title="Prinsip Audit & Rekonsiliasi Struk Kasir"
                desc="Nomor faktur yang tercetak berurutan secara unik mencegah adanya transaksi ganda atau transaksi yang tidak tercatat dalam buku besar penjualan."
                variant="indigo"
              />

              <RetailPrintExplanationBox
                number="4"
                title="Sinkronisasi Arus Kas & Saldo Persediaan"
                desc="Setiap transaksi kasir otomatis mengurangi stok barang di gudang/toko dan menambah catatan kas masuk untuk memastikan akurasi buku pembantu."
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
          {/* Finance KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
            {/* Total Omzet Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Omzet</span>
              </div>
              <div>
                <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  {formatRp(data.total_sales || 0)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Akumulasi pendapatan kotor bulan ini.</p>
              </div>
            </div>

            {/* Total Transaksi Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                  <Target size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Transaksi</span>
              </div>
              <div>
                <p className="text-2xl text-slate-900 leading-tight font-normal">
                  {data.total_transactions} <span className="text-sm text-slate-400 font-medium ml-1">TRX</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">Volume penjualan yang berhasil diproses.</p>
              </div>
            </div>

            {/* Rata-rata Transaksi */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
                  <ArrowUpRight size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Rata-rata Transaksi</span>
              </div>
              <div>
                <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  {formatRp(data.total_transactions > 0 ? (Number(data.total_sales || 0) / data.total_transactions) : 0)}
                </p>
                <p className="text-xs text-slate-400 mt-1">Estimasi nilai belanja per konsumen.</p>
              </div>
            </div>
          </div>

          {/* Daily Sales Chart */}
          <div className="card table-wrap animate-fade-in" style={{ padding: '24px', marginBottom: 24 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Tren Penjualan Harian</h3>
                <p className="text-xs text-slate-400 mt-0.5">Grafik dinamika omzet harian pada periode berjalan.</p>
              </div>
            </div>
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4318FF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} tickFormatter={(val) => `Rp ${(val/1000).toFixed(0)}k`} width={70} />
                  <Tooltip
                    contentStyle={{ background: 'var(--retail-card-bg)', border: '1px solid var(--retail-border)', borderRadius: '12px', padding: '12px', color: 'var(--retail-text-primary)' }}
                    itemStyle={{ fontSize: 14, fontWeight: 700, color: 'var(--retail-primary)' }}
                    labelStyle={{ fontSize: 10, fontWeight: 800, color: 'var(--retail-text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--retail-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions Table (Synced with Unified Style) */}
          <div className="card table-wrap animate-fade-in">
            <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
              <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
                <input
                  placeholder="Cari invoice/pelanggan..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="retail-table-responsive"><table className="table">
              <thead>
                <tr>
                  <th className="pl-6 retail-table-header">Invoice</th>
                  <th className="retail-table-header">Waktu Transaksi</th>
                  <th className="retail-table-header">Identitas Pelanggan</th>
                  <th className="retail-table-header">Nilai Bruto</th>
                  <th className="text-right pr-6 retail-table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                      Belum ada data transaksi penjualan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map(tx => (
                    <tr key={tx.id}>
                      <td className="pl-6">
                        <code className="text-[11px] retail-text-primary retail-bg-main retail-border px-2 py-1 rounded">#{tx.invoice_no}</code>
                      </td>
                      <td>
                        <span className="retail-text-primary">{formatDateIndo(tx.created_at)}</span>
                      </td>
                      <td>
                        <span className="retail-text-primary uppercase tracking-tight">{tx.customer?.name || 'Walk-in Customer'}</span>
                      </td>
                      <td>
                        <span className="retail-text-primary">{formatRp(tx.total_amount || 0)}</span>
                      </td>
                      <td className="text-right pr-6">
                        <span className={`retail-badge ${tx.status === 'paid' ? 'retail-badge-success' : 'retail-badge-warning'}`}>
                          {tx.status === 'paid' ? 'Paid' : tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table></div>
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
        </div>
      </div>
    </div>
  );
}
