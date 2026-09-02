import React, { useMemo, useState, useRef } from 'react';
import { FileSpreadsheet, TrendingUp, DollarSign, Calculator, ArrowUpRight, Percent, CalendarRange, RotateCcw, Download, Printer } from 'lucide-react';
import { Expense, Order, Product } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { exportToCsv } from '../../utils/excelExport';
import { useTranslation } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import '../../../seller-print.css';
import {
  SellerPrintHeader,
  SellerPrintSectionHeader,
  SellerPrintAppendixHeader,
  SellerPrintExplanationBox,
  SellerPrintFooter,
  formatRp,
  formatDateIndo
} from '../SellerPrintLayout';

interface SalesReportViewProps {
  orders: Order[];
  expenses: Expense[];
  products: Product[];
}

const todayStr = () => new Date().toISOString().substring(0, 10);
const daysAgoStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().substring(0, 10);
};

export const SalesReportView: React.FC<SalesReportViewProps> = ({ orders, expenses, products }) => {
  const { user } = useAuth();
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Penjualan-Profit-Ecommerce-${new Date().toISOString().split('T')[0]}`,
  });

  const orders_ = useMemo(() => {
    if (!dateFrom && !dateTo) return orders;
    return orders.filter((o) => {
      const d = o.orderDate.substring(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  const expenses_ = useMemo(() => {
    if (!dateFrom && !dateTo) return expenses;
    return expenses.filter((e) => {
      const d = e.date.substring(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo]);

  // Calculate aggregate metrics
  const totalGrossRevenue = orders_.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPlatformFees = orders_.reduce((sum, o) => sum + (o.platformFee || 0), 0);
  const totalExpenses = expenses_.reduce((sum, e) => sum + e.amount, 0);

  // Estimate HPP
  const totalHPP = orders_.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((itemSum, item) => {
        const prod = products.find((p) => p.sku === item.sku);
        const hppUnit = prod ? prod.hpp : item.price * 0.4;
        return itemSum + hppUnit * item.quantity;
      }, 0)
    );
  }, 0);

  const netProfit = totalGrossRevenue - totalHPP - totalPlatformFees - totalExpenses;
  const netMarginPercent = totalGrossRevenue > 0 ? ((netProfit / totalGrossRevenue) * 100).toFixed(1) : '0';

  const handleExportExcel = () => {
    const headers = ['Nomor Pesanan', 'Tanggal', 'Marketplace', 'Total Omset (Rp)', 'Total HPP (Rp)', 'Biaya Admin (Rp)', 'Status'];
    const rows = orders_.map((o) => {
      const hpp = o.items.reduce((sum, item) => {
        const prod = products.find((p) => p.sku === item.sku);
        return sum + (prod ? prod.hpp : item.price * 0.4) * item.quantity;
      }, 0);
      return [
        o.orderNumber,
        o.orderDate,
        o.platform,
        o.totalAmount,
        hpp,
        o.platformFee || 0,
        o.status,
      ];
    });
    exportToCsv('Laporan_Penjualan_Profit_Bizora', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              {t('seller.cashSummary')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('seller.salesSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Export PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{t('seller.exportExcel')}</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Rentang Tanggal:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <span className="text-slate-400 text-xs">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => { setDateFrom(todayStr()); setDateTo(todayStr()); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={() => { setDateFrom(daysAgoStr(7)); setDateTo(todayStr()); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              7 Hari
            </button>
            <button
              onClick={() => { setDateFrom(daysAgoStr(30)); setDateTo(todayStr()); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              30 Hari
            </button>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset (Semua Tanggal)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Net Profit Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              {i18n?.language === 'en' ? 'ESTIMATED NET PROFIT' : 'ESTIMASI PROFIT BERSIH (NET PROFIT)'}
            </span>
            <div className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">{formatIDR(netProfit)}</div>
            <p className="text-xs text-emerald-100/80 mt-1">
              {i18n?.language === 'en' ? 'Deducted product COGS, platform commissions, & operational expenses.' : 'Sudah dipotong seluruh HPP barang, komisi platform, & pengeluaran terdaftar.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-emerald-200 font-semibold uppercase block">NET MARGIN RATE</span>
            <div className="text-3xl font-black text-emerald-300 mt-1">{netMarginPercent}%</div>
            <span className="text-[10px] text-white/80">{i18n?.language === 'en' ? 'Healthy Business' : 'Kategori Bisnis Sehat'}</span>
          </div>
        </div>
      </div>

      {/* Profit & Loss Waterfall Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {i18n?.language === 'en' ? 'Profit & Loss Summary Breakdown' : 'Rincian Komponen Laba Rugi (P&L Summary)'}
          </h3>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-100">
            <span>{i18n?.language === 'en' ? '(+) Total Gross Revenue' : '(+) Total Omset Kotor (Gross Revenue)'}</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatIDR(totalGrossRevenue)}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{i18n?.language === 'en' ? '(-) Total Product COGS' : '(-) Total HPP / Modal Awal Produk'}</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatIDR(totalHPP)}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{i18n?.language === 'en' ? '(-) Marketplace Admin & Commission Fees' : '(-) Biaya Admin & Komisi Platform Marketplace'}</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatIDR(totalPlatformFees)}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{i18n?.language === 'en' ? '(-) Operational Expenses & Marketing Ads' : '(-) Operational Expenses & Ads (Pengeluaran Kas)'}</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatIDR(totalExpenses)}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl font-black text-base text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
            <span>{i18n?.language === 'en' ? '(=) OPERATIONAL NET MARGIN' : '(=) LABA BERSIH OPERASIONAL (NET MARGIN)'}</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatIDR(netProfit)}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE SALES & PROFIT REPORT                            */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Toko Online */}
          <SellerPrintHeader
            user={user}
            title="Laporan Penjualan & Profitabilitas E-Commerce"
            subtitle="Rekapitulasi Omzet Multi-Channel, Estimasi HPP, Komisi Platform & Laba Bersih"
            startDate={dateFrom}
            endDate={dateTo}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader title="I. Ringkasan Kinerja Penjualan & Laba Rugi Operasional" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI OMZET PENJUALAN & BEBAN POKOK
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>(+) Total Omzet Penjualan Kotor (Gross Revenue)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalGrossRevenue)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>(-) Total Harga Pokok Penjualan (HPP Produk)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalHPP)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>(-) Biaya Admin & Komisi Platform Marketplace</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalPlatformFees)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>(-) Biaya Operasional & Iklan (Pengeluaran Kas)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalExpenses)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    TOTAL LABA BERSIH OPERASIONAL (NET OPERATIONAL MARGIN)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Margin: {netMarginPercent}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader 
              title="II. Buku Register Transaksi Penjualan Pesanan Multi-Channel" 
              rightText={`Total ${orders_.length} pesanan tercatat`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 30, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 110, fontWeight: 600 }}>No. Pesanan</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 75, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 90, fontWeight: 600 }}>Channel / MP</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 75, fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 100, fontWeight: 600, whiteSpace: 'nowrap' }}>Omzet Bruto (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>HPP Modal (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>Biaya Admin (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 100, fontWeight: 600, whiteSpace: 'nowrap' }}>Laba Kotor (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {orders_.map((o, idx) => {
                  const hpp = o.items.reduce((sum, item) => {
                    const prod = products.find((p) => p.sku === item.sku);
                    return sum + (prod ? prod.hpp : item.price * 0.4) * item.quantity;
                  }, 0);
                  const orderGrossProfit = o.totalAmount - hpp - (o.platformFee || 0);

                  return (
                    <tr key={o.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                      <td style={{ padding: '5px 4px', fontWeight: 600, color: '#000000', fontFamily: 'monospace' }}>
                        {o.orderNumber}
                      </td>
                      <td style={{ padding: '5px 4px', color: '#000000', whiteSpace: 'nowrap' }}>
                        {o.orderDate ? o.orderDate.substring(0, 10) : '-'}
                      </td>
                      <td style={{ padding: '5px 4px', color: '#000000', textTransform: 'capitalize' }}>
                        {o.platform}
                      </td>
                      <td style={{ padding: '5px 4px', color: '#000000', textTransform: 'capitalize' }}>
                        {o.status}
                      </td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                        +{formatRp(o.totalAmount)}
                      </td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                        ({formatRp(hpp)})
                      </td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                        ({formatRp(o.platformFee || 0)})
                      </td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                        {orderGrossProfit >= 0 ? `+${formatRp(orderGrossProfit)}` : `(${formatRp(Math.abs(orderGrossProfit))})`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={5} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalGrossRevenue)}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalHPP)})
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalPlatformFees)})
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalGrossRevenue - totalHPP - totalPlatformFees)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <SellerPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN METODOLOGI FINANSIAL E-COMMERCE */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <SellerPrintAppendixHeader 
              title="Lampiran: Metodologi & Indikator Finansial E-Commerce"
              subtitle={`Parameter Evaluasi Net Margin, Struktur HPP & Efisiensi Admin Channel — ${user?.tenant_name || 'Toko Online'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <SellerPrintExplanationBox
                number="1"
                title="Net Margin Rate (Tingkat Margin Bersih)"
                desc="Persentase laba bersih operasional yang tersisa setelah menutupi seluruh HPP stok barang, potongan biaya komisi platform, dan beban operasional harian."
                formula="Rumus: Net Margin Rate = (Laba Bersih ÷ Total Omset) × 100%"
                variant="emerald"
              />

              <SellerPrintExplanationBox
                number="2"
                title="Struktur Harga Pokok Penjualan (HPP Unit)"
                desc="Nilai modal perolehan barang dagang yang dibeli dari supplier atau diproduksi sendiri, menjadi dasar penentuan batas bawah diskon harga jual."
                formula="Standar: HPP dihitung menggunakan metode FIFO (First-In, First-Out)"
                variant="default"
              />

              <SellerPrintExplanationBox
                number="3"
                title="Marketplace Platform & Payment Gateway Fees"
                desc="Total beban potongan komisi merchant, program gratis ongkir ekstra, dan biaya proses transaksi kartu kredit/QRIS."
                variant="rose"
              />

              <SellerPrintExplanationBox
                number="4"
                title="Customer Acquisition Cost (CAC) & Biaya Iklan"
                desc="Rasio efisiensi budget periklanan terhadap jumlah pesanan baru yang berhasil terkonversi dari channel berbayar."
                formula="Rumus: CAC = Total Biaya Iklan ÷ Total Pelanggan Baru Terakuisisi"
                variant="indigo"
              />

              <SellerPrintExplanationBox
                number="5"
                title="Standar Rekonsiliasi Multi-Channel & Audit Stok"
                desc="Sinkronisasi berkala antara jumlah pesanan terkirim, retur/komplain pembeli yang disetujui, dan stok fisik di gudang penyimpanan."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

