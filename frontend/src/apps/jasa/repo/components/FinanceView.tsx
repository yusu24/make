import React, { useState, useMemo, useRef } from 'react';
import { 
  Receipt,
  Search,
  Filter,
  CreditCard,
  Wallet,
  ArrowUpRight,
  Clock,
  Eye,
  Printer,
  Download
} from 'lucide-react';
import { JasaInvoice, InvoiceStatus } from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { useAuth } from '../../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import '../../jasa-print.css';
import {
  JasaPrintHeader,
  JasaPrintSectionHeader,
  JasaPrintAppendixHeader,
  JasaPrintExplanationBox,
  JasaPrintFooter,
  formatRp,
  formatDateIndo
} from '../../components/JasaPrintLayout';

interface FinanceViewProps {
  invoices: JasaInvoice[];
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onViewInvoice: (invoice: JasaInvoice) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ 
  invoices = [], 
  onUpdateInvoiceStatus,
  onViewInvoice
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  
  // Invoice Filters
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'Semua'>('Semua');

  // Metrik Ringkasan
  const totalRevenue = useMemo(() => 
    invoices.filter(i => i.status === 'Lunas').reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0)
  , [invoices]);

  const totalReceivables = useMemo(() => 
    invoices.filter(i => i.status !== 'Lunas' && i.status !== 'Dibatalkan').reduce((acc, curr) => acc + (Number(curr.totalAmount || 0) - Number(curr.paidAmount || 0)), 0)
  , [invoices]);

  const totalInvoiced = useMemo(() =>
    invoices.filter(i => i.status !== 'Dibatalkan').reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0)
  , [invoices]);

  // Filtered Lists
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      !search || 
      inv.id.toLowerCase().includes(search.toLowerCase()) || 
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.workOrderId.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'Semua' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredInvoices, 10);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Tagihan-Piutang-Jasa-${new Date().toISOString().split('T')[0]}`,
  });

  const handleExportExcel = () => {
    const headers = ['No. Invoice', 'Ref SPK', 'Pelanggan', 'Perusahaan', 'Tanggal Tagihan', 'Jatuh Tempo', 'Total (Rp)', 'Dibayar (Rp)', 'Sisa (Rp)', 'Status'];
    const rows = filteredInvoices.map(inv => [
      inv.id,
      inv.workOrderId,
      `"${(inv.customerName || '').replace(/"/g, '""')}"`,
      `"${(inv.customerCompany || '-').replace(/"/g, '""')}"`,
      (inv.issueDate || '').split('T')[0],
      (inv.dueDate || '').split('T')[0],
      inv.totalAmount,
      inv.paidAmount || 0,
      Math.max(0, inv.totalAmount - (inv.paidAmount || 0)),
      inv.status
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tagihan_Piutang_Jasa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dibayar Sebagian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Belum Dibayar': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Jatuh Tempo': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Dibatalkan': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Pendapatan (Lunas)</p>
            <h4 className="text-lg font-bold text-slate-900">{formatRupiah(totalRevenue)}</h4>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>Kas Masuk Terverifikasi</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Total Receivables */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Piutang Berjalan</p>
            <h4 className="text-lg font-bold text-slate-900">{formatRupiah(totalReceivables)}</h4>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600">
              <Clock className="w-3 h-3" />
              <span>Menunggu Pembayaran Pelanggan</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Invoice Controls */}
      <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID Invoice, Pelanggan, atau Ref SPK..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Belum Dibayar">Belum Dibayar</option>
              <option value="Dibayar Sebagian">Dibayar Sebagian</option>
              <option value="Lunas">Lunas</option>
              <option value="Jatuh Tempo">Jatuh Tempo</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Cetak Laporan Tagihan & Piutang PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            title="Export Tagihan ke Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Data Lists */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* INVOICE LIST */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Informasi Tagihan</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Tanggal & Tempo</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Receipt className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada tagihan yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((inv: JasaInvoice) => (
                  <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80 inline-block mb-1">
                        {inv.id}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Ref SPK: <span className="font-semibold text-slate-700">{inv.workOrderId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{inv.customerCompany || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{(inv.issueDate || '').split('T')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Tempo: <span className={new Date(inv.dueDate) < new Date() && inv.status !== 'Lunas' ? 'text-rose-600 font-semibold' : ''}>{(inv.dueDate || '').split('T')[0]}</span></div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-sm">
                        {formatRupiah(inv.totalAmount)}
                      </div>
                      {inv.status !== 'Lunas' && inv.paidAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                          Dibayar: {formatRupiah(inv.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold ${getStatusBadgeColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredInvoices.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredInvoices.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE JASA INVOICES & RECEIVABLES REPORT               */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Bengkel / Jasa */}
          <JasaPrintHeader
            user={user}
            title="Laporan Register Tagihan & Piutang Jasa"
            subtitle="Rekapitulasi Faktur Tagihan SPK, Pembayaran Diterima & Sisa Piutang Berjalan"
            periodText={`Status: ${statusFilter === 'Semua' ? 'Semua Status Tagihan' : statusFilter}`}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Posisi Piutang & Penerimaan Kas" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI TAGIHAN & KAS MASUK
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pendapatan Terbayar (Kas Masuk Lunas)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalRevenue)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Piutang Berjalan (Menunggu Pelunasan)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(totalReceivables)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    TOTAL NILAI BRUTO FAKTUR TAGIHAN (TOTAL INVOICED)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    100.0%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalInvoiced)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader 
              title="II. Buku Register Faktur Tagihan & Piutang Klien (Receivables Ledger)" 
              rightText={`Total ${filteredInvoices.length} tagihan`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 30, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 95, fontWeight: 600 }}>No. Invoice</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 95, fontWeight: 600 }}>Ref. SPK</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 140, fontWeight: 600 }}>Pelanggan / Klien</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 75, fontWeight: 600 }}>Jatuh Tempo</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 85, fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Total Tagihan (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Sisa Piutang (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 4px', fontWeight: 600, color: '#000000', fontFamily: 'monospace' }}>
                      {inv.id}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', fontFamily: 'monospace' }}>
                      {inv.workOrderId}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {inv.customerName} {inv.customerCompany ? `(${inv.customerCompany})` : ''}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', whiteSpace: 'nowrap' }}>
                      {(inv.dueDate || '').split('T')[0]}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {inv.status}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      +{formatRp(inv.totalAmount)}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600, color: inv.status !== 'Lunas' ? '#DC2626' : '#059669', whiteSpace: 'nowrap' }}>
                      {formatRp(Math.max(0, inv.totalAmount - (inv.paidAmount || 0)))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={6} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Tagihan:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalInvoiced)}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#DC2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalReceivables)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <JasaPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN PANDUAN PENAGIHAN & PIUTANG SPK */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <JasaPrintAppendixHeader 
              title="Lampiran: Panduan Penagihan & Manajemen Piutang SPK"
              subtitle={`Prosedur Penerbitan Faktur, Termin Pembayaran & Mitigasi Piutang Macet — ${user?.tenant_name || 'Layanan Jasa & Servis'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <JasaPrintExplanationBox
                number="1"
                title="Penerbitan Faktur Tagihan Berdasarkan SPK Selesai"
                desc="Invoice resmi diterbitkan secara otomatis segera setelah teknisi menyelesaikan pekerjaan dan lembar SPK ditandatangani oleh pelanggan."
                variant="default"
              />

              <JasaPrintExplanationBox
                number="2"
                title="Ketentuan Termin Pembayaran (Payment Terms)"
                desc="Pelanggan retail wajib melakukan pelunasan di tempat (Cash On Delivery/Transfer), sedangkan klien korporat B2B mengikuti termin jatuh tempo 14 s/d 30 hari kalender."
                formula="Jatuh Tempo = Tanggal Terbit Tagihan + Masa Kredit (Terms)"
                variant="emerald"
              />

              <JasaPrintExplanationBox
                number="3"
                title="Prosedur Penagihan & Reminder Otomatis (Dunning Letter)"
                desc="Sistem mengirimkan notifikasi pengingat pembayaran H-3 sebelum jatuh tempo dan peringatan berkala jika tagihan melewati batas tempo (Overdue)."
                variant="rose"
              />

              <JasaPrintExplanationBox
                number="4"
                title="Pencatatan Pembayaran Parsial (Down Payment / Termin)"
                desc="Uang muka (DP) atau cicilan pembayaran diinput ke dalam invoice untuk mengurangi nilai sisa piutang secara akurat tanpa terjadi double record."
                variant="indigo"
              />

              <JasaPrintExplanationBox
                number="5"
                title="Rekonsiliasi Kas Masuk & Validasi Bukti Transfer"
                desc="Admin keuangan melakukan verifikasi mutasi rekening koran bank penerima sebelum mengubah status tagihan menjadi Lunas."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
