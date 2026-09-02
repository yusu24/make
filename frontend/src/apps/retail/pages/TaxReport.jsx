import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { FileText, Calendar, Printer } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import Skeleton from '../../../components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function TaxReport() {
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Pajak-${user?.tenant_name || 'Retail'}-${startDate}_${endDate}`,
  });

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

  const transactions = data?.transactions || [];
  const totalTax = Number(data?.summary?.total_tax || transactions.reduce((s, t) => s + Number(t.tax_amount || 0), 0));
  const totalSalesWithTax = Number(data?.summary?.total_sales_with_tax || 0);
  const netSalesExclTax = totalSalesWithTax - totalTax;

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
        {/* PRINT-ONLY FORMAL ACCOUNTING TAX REPORT TEMPLATE          */}
        {/* ========================================================= */}
        {data && (
          <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#0f172a' }}>
            
            {/* 1. Header / Kop Laporan Resmi */}
            <RetailPrintHeader
              user={user}
              title="Laporan Rekapitulasi Pajak"
              subtitle="Rekapitulasi Pemungutan PPN & Transaksi Penjualan Kena Pajak (Tax Statement)"
              startDate={startDate}
              endDate={endDate}
            />

            {/* 2. Formal Tax Statement Table (NO VERTICAL LINES, BLACK & WHITE) */}
            <div style={{ marginBottom: 22 }}>
              <RetailPrintSectionHeader title="I. Laporan Posisi Pemungutan Pajak (Tax Summary Statement)" />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                      A. TOTAL OMSET PENJUALAN KENA PAJAK (TAXABLE SALES)
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Penjualan Bruto (Termasuk Komponen Pajak)</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>{formatRp(totalSalesWithTax)}</td>
                    <td style={{ width: 140 }}></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Penjualan Bersih Sebelum Pajak (Net Sales Excl. Tax)</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>{formatRp(netSalesExclTax)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>Dasar Pengenaan Pajak (DPP)</td>
                    <td></td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>{formatRp(netSalesExclTax)}</td>
                  </tr>

                  {/* B. PPN TERKUMPUL */}
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                      B. PEMUNGUTAN PAJAK PERTAMBAHAN NILAI (OUTPUT VAT COLLECTED)
                    </td>
                    <td></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Akumulasi PPN Terkumpul dari {transactions.length} Faktur Penjualan</td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>{formatRp(totalTax)}</td>
                    <td></td>
                  </tr>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                    <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                      TOTAL PAJAK TERKUMPUL SIAP SETOR (OUTPUT TAX)
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                      {transactions.length} Faktur Terbit
                    </td>
                    <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600 }}>
                      {formatRp(totalTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
            <div style={{ marginBottom: 22 }}>
              <RetailPrintSectionHeader 
                title="II. Register Faktur Penjualan Kena Pajak (Tax Invoices Register)" 
                rightText={`Total ${transactions.length} faktur diterbitkan`} 
              />

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                <thead>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                    <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                    <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>No. Faktur / Invoice</th>
                    <th style={{ padding: '7px 6px', textAlign: 'left', width: 170, fontWeight: 600 }}>Tanggal Transaksi</th>
                    <th style={{ padding: '7px 6px', textAlign: 'right', width: 160, fontWeight: 600, whiteSpace: 'nowrap' }}>Nilai Pajak PPN (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                        Tidak ada data pajak pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{t.invoice_no}</td>
                        <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>
                          {t.created_at ? formatDateIndo(t.created_at) : '-'}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                          {formatRp(t.tax_amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                    <td colSpan={3} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                      Total PPN Terkumpul:
                    </td>
                    <td style={{ padding: '7px 6px', textAlign: 'right', color: '#000000', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatRp(totalTax)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
            <RetailPrintFooter user={user} showSignatures={true} />

            {/* 4. HALAMAN 2: LAMPIRAN KETENTUAN & METODOLOGI PERPAJAKAN (TANPA ROMAWI) */}
            <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
              <RetailPrintAppendixHeader 
                title="Lampiran: Penjelasan & Tata Kelola Perpajakan Usaha"
                subtitle={`Keterangan Kebijakan Pemungutan PPN & Rekonsiliasi Faktur — ${user?.tenant_name || 'Toko Retail'}`}
                user={user}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                <RetailPrintExplanationBox
                  number="1"
                  title="Dasar Hukum & Ketentuan Pemungutan PPN"
                  desc="Pajak Pertambahan Nilai (PPN) dipungut atas penyerahan barang kena pajak dalam daerah pabean sesuai tarif perpajakan yang berlaku pada sistem kasir."
                  variant="default"
                />

                <RetailPrintExplanationBox
                  number="2"
                  title="Metodologi Perhitungan Pajak Transaksi Kasir"
                  desc="Sistem menghitung komponen pajak secara otomatis pada saat kasir mencetak struk/faktur penjualan, memisahkan nilai penjualan bersih dengan titipan pajak konsumen."
                  formula="Rumus: Nilai PPN = Dasar Pengenaan Pajak (DPP) × Tarif PPN (%)"
                  variant="emerald"
                />

                <RetailPrintExplanationBox
                  number="3"
                  title="Kewajiban Rekapitulasi & Pelaporan SPT Masa"
                  desc="Total PPN yang terkumpul merupakan titipan pajak konsumen yang wajib disetorkan dan dilaporkan dalam Surat Pemberitahuan (SPT) Masa Pajak bulanan."
                  variant="indigo"
                />

                <RetailPrintExplanationBox
                  number="4"
                  title="Rekonsiliasi Faktur Pajak dengan Omset Penjualan"
                  desc="Laporan ini berfungsi sebagai instrumen audit internal untuk memvalidasi kesesuaian antara nomor faktur invoice yang diterbitkan dan total setoran pajak riil."
                  variant="dark"
                />
              </div>

              {/* Catatan Audit Sistem (Tanpa Kolom Tanda Tangan Ulang) */}
              <RetailPrintFooter user={user} showSignatures={false} />
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN-ONLY INTERACTIVE UI                                 */}
        {/* ========================================================= */}
        <div className="no-print">
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
                  <h3 className="text-2xl font-bold text-gray-800">{formatRp(data.summary?.total_sales_with_tax)}</h3>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FileText size={64} className="text-blue-600" />
                  </div>
                  <p className="text-blue-600 text-sm font-semibold mb-1">Total Pajak Terkumpul</p>
                  <h3 className="text-2xl font-bold text-blue-700">{formatRp(data.summary?.total_tax)}</h3>
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
                          <Tooltip formatter={(value) => formatRp(value)} />
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
                        {transactions.length > 0 ? (
                          transactions.map(t => (
                            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="p-3 text-blue-600">
                                {t.invoice_no}
                                <div className="text-xs text-gray-400">{t.created_at ? t.created_at.split('T')[0] : '-'}</div>
                              </td>
                              <td className="p-3 text-right font-medium">{formatRp(t.tax_amount)}</td>
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
      </div>
    </div>
  );
}
