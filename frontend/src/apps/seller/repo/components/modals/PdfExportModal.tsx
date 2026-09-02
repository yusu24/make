import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Expense, Order } from '../../types';
import { useAuth } from '../../../../../contexts/AuthContext';
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

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  orders: Order[];
  storeCount: number;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  orders,
  storeCount,
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalOmset = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const netProfit = totalOmset - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header (Screen Modal) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Pratinjau Cetak Laporan Keuangan PDF (E-Commerce Multi-Channel)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal 2-Page Document */}
        <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-900 flex-1 flex justify-center print:p-0 print:m-0 print:bg-white">
          <div className="w-full max-w-2xl bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 text-xs font-sans print:shadow-none print:border-none print:p-0 print:m-0">
            
            {/* ==================== HALAMAN 1: LAPORAN FINANSIAL TOKO ==================== */}
            <div>
              {/* 1. Header / Kop Surat Resmi Toko Online */}
              <SellerPrintHeader
                user={user}
                title="Laporan Finansial E-Commerce"
                subtitle="Rekapitulasi Omzet Penjualan Multi-Channel, Marketplace & Beban Operasional"
                channelText={`${storeCount} Marketplace / Sales Channel Terhubung`}
              />

              {/* 2. Formal Summary Table (Horizontal Borders Only) */}
              <div style={{ marginBottom: 20 }}>
                <SellerPrintSectionHeader title="I. Ringkasan Posisi Keuangan Toko (Financial Summary)" />

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #000000' }}>
                      <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                        A. REKAPITULASI OMZET PENJUALAN & BEBAN
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Omzet Penjualan Kotor (Gross Merchandise Value)</td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalOmset)}</td>
                      <td style={{ width: 140 }}></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Beban Operasional & Pengeluaran Toko</td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalExpenses)})</td>
                      <td></td>
                    </tr>
                    <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                      <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                        LABA BERSIH PENJUALAN TOKO (NET SALES PROFIT)
                      </td>
                      <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                        Margin: {totalOmset > 0 ? ((netProfit / totalOmset) * 100).toFixed(1) : 0}%
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
                  title="II. Buku Register Transaksi Pengeluaran Kas (Expense Ledger)" 
                  rightText={`Total ${expenses.length} item pengeluaran`} 
                />

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                  <thead>
                    <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                      <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                      <th style={{ padding: '7px 6px', textAlign: 'left', width: 90, fontWeight: 600 }}>Tanggal</th>
                      <th style={{ padding: '7px 6px', textAlign: 'left', width: 140, fontWeight: 600 }}>Kategori Beban</th>
                      <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan & Rincian Pengeluaran</th>
                      <th style={{ padding: '7px 6px', textAlign: 'right', width: 160, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Keluar / Outflow (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e, idx) => (
                      <tr key={e.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{e.date}</td>
                        <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{e.category}</td>
                        <td style={{ padding: '6px 6px', color: '#000000' }}>{e.description || '-'}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                          ({formatRp(e.amount)})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                      <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                        Total Rekapitulasi Pengeluaran:
                      </td>
                      <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ({formatRp(totalExpenses)})
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
              <SellerPrintFooter user={user} />
            </div>

            {/* ==================== HALAMAN 2: LAMPIRAN METODOLOGI E-COMMERCE ==================== */}
            <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
              <SellerPrintAppendixHeader 
                title="Lampiran: Standar Metodologi & Rekonsiliasi E-Commerce"
                subtitle={`Pedoman Rekonsiliasi Saldo Marketplace, Potongan Platform Fee & Iklan — ${user?.tenant_name || 'Toko Online'}`}
                user={user}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                <SellerPrintExplanationBox
                  number="1"
                  title="Gross Merchandise Value (GMV) vs Net Revenue"
                  desc="GMV mencakup total nilai transaksi bruto dari seluruh pesanan sebelum dikurangi diskon voucher toko, komisi platform, dan biaya gratis ongkir XTRA."
                  formula="Rumus: Net Omzet = Total GMV - (Potongan Komisi + Biaya Gratis Ongkir + Diskon Toko)"
                  variant="default"
                />

                <SellerPrintExplanationBox
                  number="2"
                  title="Potongan Biaya Layanan & Komisi Marketplace (Platform Fees)"
                  desc="Biaya administrasi merchant (Shopee, Tokopedia, TikTok Shop, Lazada) yang dipotong otomatis dari saldo pelepasan dana escrow."
                  formula="Alokasi Beban: Biaya Layanan + Biaya Transaksi + Biaya Program Gratis Ongkir"
                  variant="emerald"
                />

                <SellerPrintExplanationBox
                  number="3"
                  title="Efisiensi Biaya Iklan (Return on Ad Spend / ROAS)"
                  desc="Efektivitas pengeluaran iklan berbayar (Shopee Ads, TikTok Ads, CPAS) dalam menghasilkan omzet pesanan riil."
                  formula="Rumus: ROAS = Total Omzet Penjualan Iklan ÷ Total Biaya Top-up Iklan"
                  variant="indigo"
                />

                <SellerPrintExplanationBox
                  number="4"
                  title="Margin Laba Kotor (Gross Profit Margin)"
                  desc="Keuntungan bersih penjualan setelah menutup seluruh Harga Pokok Penjualan (HPP) modal beli stok produk."
                  formula="Rumus: Gross Margin (%) = ((Omzet - HPP Stok) ÷ Omzet) × 100%"
                  variant="rose"
                />

                <SellerPrintExplanationBox
                  number="5"
                  title="Rekonsiliasi Saldo Escrow & Penarikan Dana (Payout Settlement)"
                  desc="Pencocokan berkala antara saldo pesanan terselesaikan di dashboard seller center dengan mutasi rekening bank penerima pencairan."
                  variant="dark"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

