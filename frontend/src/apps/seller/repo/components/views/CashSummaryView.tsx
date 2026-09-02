import React, { useRef } from 'react';
import { Coins, ArrowDownRight, CreditCard, Building, RefreshCw, CheckCircle, Printer } from 'lucide-react';
import { CashSummaryItem } from '../../types';
import { formatIDR, getPlatformBadgeColor } from '../../utils/formatters';
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

interface CashSummaryViewProps {
  cashSummaries: CashSummaryItem[];
}

export const CashSummaryView: React.FC<CashSummaryViewProps> = ({ cashSummaries }) => {
  const { user } = useAuth();
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const printRef = useRef<HTMLDivElement>(null);

  const totalReadyBalance = cashSummaries.reduce((sum, c) => sum + Number(c.readyBalance || 0), 0);
  const totalPendingEscrow = cashSummaries.reduce((sum, c) => sum + Number(c.pendingEscrow || 0), 0);
  const totalLiquidity = totalReadyBalance + totalPendingEscrow;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Saldo-Kas-Escrow-Ecommerce-${new Date().toISOString().split('T')[0]}`,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex justify-end items-center">
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Export PDF</span>
        </button>
      </div>

      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-md border border-indigo-700/50">
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
            {i18n?.language === 'en' ? 'TOTAL READY BALANCE' : 'TOTAL SALDO SIAP CAIR (READY BALANCE)'}
          </span>
          <div className="text-3xl font-black mt-2">{formatIDR(totalReadyBalance)}</div>
          <p className="text-xs text-indigo-100/80 mt-1">
            {i18n?.language === 'en' ? 'Ready for payout directly to primary BCA/Mandiri Bank Account.' : 'Siap ditarik langsung ke Rekening Bank Utama BCA/Mandiri.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-purple-700/50">
          <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            {i18n?.language === 'en' ? 'TOTAL ESCROW BALANCE' : 'TOTAL SALDO TERTAHAN (ESCROW MARKETPLACE)'}
          </span>
          <div className="text-3xl font-black mt-2">{formatIDR(totalPendingEscrow)}</div>
          <p className="text-xs text-purple-100/80 mt-1">
            {i18n?.language === 'en' ? 'Will be released automatically after buyer confirms order receipt.' : 'Akan cair otomatis setelah pembeli melakukan konfirmasi pesanan diterima.'}
          </p>
        </div>
      </div>

      {/* Cards per Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cashSummaries.map((cs) => {
          const badge = getPlatformBadgeColor(cs.platform);
          return (
            <div key={cs.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${badge.bg} ${badge.text}`}>
                    {cs.platform}
                  </span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{cs.storeName}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Auto Settlement
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{i18n?.language === 'en' ? 'READY BALANCE' : 'SALDO SIAP TARIK'}</span>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{formatIDR(cs.readyBalance)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{i18n?.language === 'en' ? 'PENDING ESCROW' : 'PENDING ESCROW'}</span>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{formatIDR(cs.pendingEscrow)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium">{cs.bankAccount}</span>
                </div>
                <span className="font-semibold text-indigo-600">{cs.nextSettlementDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE CASH SUMMARY & ESCROW REPORT                     */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Toko Online */}
          <SellerPrintHeader
            user={user}
            title="Laporan Saldo Kas & Escrow Multi-Channel"
            subtitle="Rekapitulasi Saldo Siap Cair, Dana Tertahan Marketplace & Rekening Payout"
            periodText={`Total ${cashSummaries.length} Channel Toko Terhubung`}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader title="I. Ringkasan Posisi Likuiditas Kas Toko" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI DANA & SALDO TOKO ONLINE
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Saldo Siap Tarik (Ready Balance)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalReadyBalance)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Saldo Tertahan (Pending Escrow Marketplace)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(totalPendingEscrow)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    TOTAL LIKUIDITAS DANA TOKO (TOTAL LIQUIDITY)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    100.0%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalLiquidity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <SellerPrintSectionHeader 
              title="II. Buku Register Saldo per Akun Marketplace & Toko" 
              rightText={`Total ${cashSummaries.length} akun toko`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 90, fontWeight: 600 }}>Platform</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 140, fontWeight: 600 }}>Nama Toko / Store</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Rekening Bank Payout</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 140, fontWeight: 600, whiteSpace: 'nowrap' }}>Saldo Siap Tarik (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 140, fontWeight: 600, whiteSpace: 'nowrap' }}>Pending Escrow (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {cashSummaries.map((cs, idx) => (
                  <tr key={cs.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 6px', fontWeight: 600, color: '#000000' }}>{cs.platform}</td>
                    <td style={{ padding: '6px 6px', color: '#000000' }}>{cs.storeName}</td>
                    <td style={{ padding: '6px 6px', color: '#000000' }}>{cs.bankAccount}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(cs.readyBalance)}
                    </td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(cs.pendingEscrow)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Saldo:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalReadyBalance)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalPendingEscrow)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <SellerPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN PANDUAN SETTLEMENT & ESCROW MARKETPLACE */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <SellerPrintAppendixHeader 
              title="Lampiran: Panduan Rekonsiliasi & Settlement Dompet Marketplace"
              subtitle={`Pedoman Pencairan Saldo, Proteksi Escrow & Rekening Penampung — ${user?.tenant_name || 'Toko Online'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <SellerPrintExplanationBox
                number="1"
                title="Mekanisme Rekening Escrow Marketplace (Buyer Protection)"
                desc="Pembayaran pembeli diamankan di rekening penampung pihak ketiga (Shopee/Tokopedia/TikTok) dan baru diteruskan ke saldo seller saat barang sampai dengan aman."
                variant="default"
              />

              <SellerPrintExplanationBox
                number="2"
                title="Jadwal Otomatisasi Settlement (Auto Payout)"
                desc="Pencairan saldo siap tarik dilakukan otomatis setiap hari kerja pukul 14.00 WIB atau secara manual sesuai kebutuhan likuiditas kas operasional."
                formula="Waktu Rilis Saldo: 1x24 jam setelah status pesanan berubah menjadi Selesai"
                variant="emerald"
              />

              <SellerPrintExplanationBox
                number="3"
                title="Penanganan Saldo Tertunda (Hold Escrow / Komplain)"
                desc="Pesanan yang mengalami komplain kerusakan barang atau permohonan retur akan ditahan sementara sampai proses investigasi selesai."
                variant="rose"
              />

              <SellerPrintExplanationBox
                number="4"
                title="Biaya Transfer Antarbank & Payout Gateway"
                desc="Penarikan saldo ke bank di luar jaringan mitra utama dapat dikenakan biaya kliring otomatis Rp 2.500 - Rp 6.500 per transaksi pencairan."
                variant="indigo"
              />

              <SellerPrintExplanationBox
                number="5"
                title="Rekonsiliasi Buku Kas & Mutasi Rekening Bank"
                desc="Pengurus keuangan toko wajib mencocokkan nomor referensi pencairan dari marketplace dengan saldo kredit pada rekening koran bank penerima."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

