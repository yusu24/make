import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { Wallet, TrendingUp, CheckCircle, AlertCircle, RefreshCw, Trash2, Printer, Calendar, Filter } from 'lucide-react';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { 
  RetailPrintHeader, 
  RetailPrintSectionHeader, 
  RetailPrintAppendixHeader,
  RetailPrintExplanationBox,
  RetailPrintFooter, 
  formatRp, 
  formatDateIndo 
} from '../components/RetailPrintLayout';

export default function Receivables() {
  const { user } = useAuth();
  const [receivables, setReceivables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [search, setSearch] = useState('');
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState('all'); // all, unpaid, partial, paid
  const [dateFilter, setDateFilter] = useState('all'); // all, today, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  const printRef = useRef(null);

  const fetchCustomers = async () => {
    try {
      const cRes = await api.get('/retail/customers');
      setCustomers(cRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (customerFilter !== 'all') params.customer_id = customerFilter;

      const rRes = await api.get('/retail/receivables', { params });
      setReceivables(rRes.data.data || []); 
      setSummary(rRes.data.summary || {}); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [statusFilter, startDate, endDate, customerFilter]);

  const handleDateFilterChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);

    const t = new Date();
    if (val === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (val === 'today') {
      const td = t.toISOString().split('T')[0];
      setStartDate(td);
      setEndDate(td);
    } else if (val === 'month') {
      const fd = new Date(t.getFullYear(), t.getMonth(), 1).toISOString().split('T')[0];
      const ld = new Date(t.getFullYear(), t.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(fd);
      setEndDate(ld);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/retail/receivables', {
        customer_id: fd.get('customer_id'),
        total_amount: Number(fd.get('total_amount')),
        due_date: fd.get('due_date') || null,
        note: fd.get('note'),
      });
      setShowModal(false); 
      fetchData();
    } catch (e) { 
      alert(e.response?.data?.message || 'Gagal menyimpan'); 
    }
  };

  const handleDelete = async (receivable) => {
    if (!confirm(`Hapus catatan piutang dari "${receivable.customer?.name || 'pelanggan ini'}"?`)) return;
    try {
      await api.delete(`/retail/receivables/${receivable.id}`);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus catatan piutang');
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/retail/receivables/${payModal.id}/payments`, { amount_paid: payAmount, payment_method: 'CASH' });
      setPayModal(null); 
      setPayAmount(0); 
      fetchData();
    } catch (e) { 
      alert(e.response?.data?.message || 'Gagal mencatat pembayaran'); 
    }
  };

  const filteredReceivables = receivables.filter(r =>
    (r.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.note || '').toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Piutang-Pelanggan-${user?.tenant_name || 'Retail'}-${startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]}`,
  });

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
  } = usePagination(filteredReceivables);

  const totalCredit = Number(summary.total_credit || receivables.reduce((s, r) => s + Number(r.total_amount || 0), 0));
  const totalPaid = Number(summary.total_paid || receivables.reduce((s, r) => s + Number(r.paid_amount || 0), 0));
  const totalOutstanding = Number(summary.total_outstanding || receivables.reduce((s, r) => s + Number(r.remaining ?? (r.total_amount - r.paid_amount) || 0), 0));
  const collectionRate = totalCredit > 0 ? ((totalPaid / totalCredit) * 100).toFixed(1) : '0';

  const paidCount = filteredReceivables.filter(r => r.status === 'paid').length;
  const partialCount = filteredReceivables.filter(r => r.status === 'partial').length;
  const unpaidCount = filteredReceivables.filter(r => r.status === 'unpaid' || !r.status).length;

  const getStatusText = (status) => {
    if (status === 'paid') return 'LUNAS';
    if (status === 'partial') return 'SEBAGIAN';
    return 'BELUM BAYAR';
  };

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
        {/* PRINT-ONLY FORMAL ACCOUNTING RECEIVABLES PDF TEMPLATE     */}
        {/* ========================================================= */}
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#0f172a' }}>
          
          {/* 1. Header / Kop Laporan Resmi */}
          <RetailPrintHeader
            user={user}
            title="Laporan Piutang Usaha"
            subtitle="Rekapitulasi Tagihan Piutang Penjualan Pelanggan (Accounts Receivable Statement)"
            startDate={startDate}
            endDate={endDate}
            periodText={statusFilter !== 'all' ? `Status: ${getStatusText(statusFilter)} | ${startDate && endDate ? `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}` : 'Semua Tanggal'}` : undefined}
          />

          {/* 2. Formal Accounts Receivable Statement Breakdown Table */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader title="I. Laporan Posisi Piutang Usaha (Accounts Receivable Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                {/* A. TOTAL TAGIHAN PIUTANG */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. TOTAL TAGIHAN PIUTANG PENJUALAN (GROSS RECEIVABLES)
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Akumulasi Penjualan Tempo Tercatat ({filteredReceivables.length} Tagihan)
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>
                    {formatRp(totalCredit)}
                  </td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Subtotal Piutang Usaha (Gross)
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>
                    {formatRp(totalCredit)}
                  </td>
                </tr>

                {/* B. PEMBAYARAN DITERIMA */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                    B. PEMBAYARAN DITERIMA / TERTAGIH (COLLECTIONS)
                  </td>
                  <td style={{ padding: '8px 4px 6px', textAlign: 'right' }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Total Kas Masuk dari Pelunasan & Cicilan Piutang
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>
                    ({formatRp(totalPaid)})
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Total Pembayaran Piutang Berhasil Diterima
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11 }}>
                    ({formatRp(totalPaid)})
                  </td>
                </tr>

                {/* C. SISA SALDO PIUTANG */}
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    C. SISA SALDO PIUTANG BELUM TERTANGIH (OUTSTANDING RECEIVABLES)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Efektivitas: {collectionRate}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600 }}>
                    {formatRp(totalOutstanding)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader 
              title="II. Buku Pembantu Rincian Piutang per Pelanggan (Customer Ledger)" 
              rightText={`Total ${filteredReceivables.length} Data (${paidCount} Lunas, ${partialCount} Sebagian, ${unpaidCount} Belum Bayar)`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Nama Pelanggan</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 120, fontWeight: 600, whiteSpace: 'nowrap' }}>Total Piutang (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Diterima (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 120, fontWeight: 600, whiteSpace: 'nowrap' }}>Sisa Piutang (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'center', width: 100, fontWeight: 600, whiteSpace: 'nowrap' }}>Jatuh Tempo</th>
                  <th style={{ padding: '7px 6px', textAlign: 'center', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 110, fontWeight: 600 }}>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                      Tidak ada catatan piutang pada filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredReceivables.map((r, idx) => {
                    const rem = r.remaining ?? (r.total_amount - r.paid_amount);
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{r.customer?.name || '-'}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>{formatRp(r.total_amount)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>{formatRp(r.paid_amount)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                          {formatRp(rem)}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', color: '#000000', whiteSpace: 'nowrap' }}>
                          {r.due_date ? formatDateIndo(r.due_date) : '-'}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600, fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                          {getStatusText(r.status)}
                        </td>
                        <td style={{ padding: '6px 6px', color: '#374151', fontSize: 9.5 }}>{r.note || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={2} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalCredit)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalPaid)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 11, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalOutstanding)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <RetailPrintFooter user={user} showSignatures={true} />

          {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & METODOLOGI AKUNTANSI PIUTANG (TANPA ROMAWI) */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <RetailPrintAppendixHeader 
              title="Lampiran: Penjelasan & Metodologi Pengelolaan Piutang Usaha"
              subtitle={`Keterangan Kebijakan Akuntansi Piutang & Ketentuan Penagihan — ${user?.tenant_name || 'Toko Retail'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <RetailPrintExplanationBox
                number="1"
                title="Total Nilai Tagihan Piutang (Gross Receivables)"
                desc="Merupakan total seluruh transaksi penjualan kasir atau nota penjualan yang menggunakan metode pembayaran tempo / kredit kepada pelanggan yang terdaftar pada sistem."
                formula="Rumus: Total Piutang = Σ (Nilai Seluruh Faktur Tagihan Penjualan Tempo Tercatat)"
                variant="default"
              />

              <RetailPrintExplanationBox
                number="2"
                title="Penerimaan Pembayaran Piutang (Cash Collections)"
                desc="Akumulasi seluruh pembayaran kas / transfer bank yang telah dibayarkan oleh pelanggan sebagai cicilan atau pelunasan dari nota piutang yang bersangkutan."
                formula="Rumus: Total Diterima = Σ (Seluruh Pembayaran Kas Masuk Pelunasan Piutang)"
                variant="emerald"
              />

              <RetailPrintExplanationBox
                number="3"
                title="Sisa Piutang Belum Tertagih (Outstanding Balance)"
                desc="Saldo riil kewajiban pelanggan yang masih aktif dan wajib ditagih sebelum atau tepat pada tanggal jatuh tempo yang telah disepakati bersama."
                formula="Rumus: Sisa Piutang = Total Tagihan Piutang - Total Pembayaran Diterima"
                variant="amber"
              />

              <RetailPrintExplanationBox
                number="4"
                title="Rasio Efektivitas Penagihan (Collection Efficiency Rate)"
                desc="Indikator kesehatan arus kas yang mengukur persentase keberhasilan penerimaan kas dari seluruh piutang yang diberikan kepada pelanggan."
                formula="Rumus: Collection Rate = (Total Dana Diterima ÷ Total Nilai Piutang) × 100%"
                variant="indigo"
              />

              <RetailPrintExplanationBox
                number="5"
                title="Kebijakan Jatuh Tempo & Pengendalian Risiko Piutang"
                desc="Sistem secara otomatis memantau batas waktu jatuh tempo transaksi. Pelanggan dengan status 'Belum Bayar' atau 'Sebagian' yang melewati jatuh tempo ditandai untuk tindak lanjut penagihan prioritas demi menjaga likuiditas usaha."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
            {/* Total Piutang Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Piutang</span>
              </div>
              <div>
                <p className="text-2xl text-slate-900 leading-tight font-semibold">{formatRp(summary.total_credit)}</p>
                <p className="text-xs text-slate-400 mt-1">Total keseluruhan piutang dari pelanggan.</p>
              </div>
            </div>

            {/* Sudah Diterima Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                  <CheckCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Sudah Diterima</span>
              </div>
              <div>
                <p className="text-2xl text-emerald-600 leading-tight font-semibold">{formatRp(summary.total_paid)}</p>
                <p className="text-xs text-slate-400 mt-1">Total pembayaran yang telah diterima.</p>
              </div>
            </div>

            {/* Sisa Piutang Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                  <AlertCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Sisa Piutang</span>
              </div>
              <div>
                <p className="text-2xl text-rose-600 leading-tight font-semibold">{formatRp(summary.total_outstanding)}</p>
                <p className="text-xs text-slate-400 mt-1">Piutang yang belum dilunasi pelanggan.</p>
              </div>
            </div>
          </div>

          <div className="card table-wrap animate-fade-in">
            {/* Filter Toolbar */}
            <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
              <button title="Catat Piutang Baru"
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
                onClick={() => setShowModal(true)}
              >
                <Wallet size={15} className="mr-2 mobile-no-margin" />
                <span className="btn-text-mobile-hide">Catat Piutang Baru</span>
              </button>

              <div className="airy-search-wrapper" style={{ width: 220, margin: 0 }}>
                <input
                  placeholder="Cari pelanggan / catatan..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="retail-filter-group">
                <Filter size={15} className="retail-text-secondary" style={{ flexShrink: 0 }} />
                <select className="retail-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="unpaid">Belum Bayar</option>
                  <option value="partial">Sebagian</option>
                  <option value="paid">Lunas</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="retail-filter-group">
                <Calendar size={15} className="retail-text-secondary" style={{ flexShrink: 0 }} />
                <select className="retail-filter-select" value={dateFilter} onChange={handleDateFilterChange}>
                  <option value="all">Semua Tanggal</option>
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

              <button onClick={fetchData} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="retail-table-responsive"><table className="table">
              <thead>
                <tr>
                  <th className="pl-6 retail-table-header">Pelanggan</th>
                  <th className="text-right retail-table-header">Total</th>
                  <th className="text-right retail-table-header">Diterima</th>
                  <th className="text-right retail-table-header">Sisa</th>
                  <th className="text-center retail-table-header">Jatuh Tempo</th>
                  <th className="text-center retail-table-header">Status</th>
                  <th className="pr-6 text-right retail-table-header">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <RetailTableLoadingRow colSpan={7} />
                ) : filteredReceivables.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada catatan piutang yang sesuai filter.</td></tr>
                ) : (
                  paginatedData.map(r => (
                    <tr key={r.id}>
                      <td className="pl-6 retail-text-primary">
                        <div className="font-semibold">{r.customer?.name || '-'}</div>
                        {r.note && <div className="text-xs text-slate-400">{r.note}</div>}
                      </td>
                      <td className="text-right">{formatRp(r.total_amount)}</td>
                      <td className="text-right retail-text-secondary">{formatRp(r.paid_amount)}</td>
                      <td className="text-right font-semibold">{formatRp(r.remaining ?? (r.total_amount - r.paid_amount))}</td>
                      <td className="text-center retail-text-secondary" style={{ fontSize: 12 }}>{r.due_date ? formatDateIndo(r.due_date) : '-'}</td>
                      <td className="text-center">
                        <span className={`retail-badge ${r.status === 'paid' ? 'retail-badge-primary' : ''}`}>
                          {r.status === 'paid' ? 'Lunas' : r.status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="pr-6 text-right">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {r.status !== 'paid' && (
                            <button className="btn btn-sm btn-ghost" onClick={() => { setPayModal(r); setPayAmount(r.remaining ?? (r.total_amount - r.paid_amount)); }} title="Terima"><Wallet size={15} /></button>
                          )}
                          <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(r)} title="Hapus"><Trash2 size={15} /></button>
                        </div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Catat Piutang Pelanggan">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Pelanggan</label>
            <select name="customer_id" className="form-input" defaultValue="" required>
              <option value="" disabled>Pilih pelanggan...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Piutang (Rp)</label>
            <CurrencyInput name="total_amount" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Jatuh Tempo</label>
            <input name="due_date" type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Catatan</label>
            <textarea name="note" className="form-input" />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Catat Penerimaan Pembayaran">
        <form onSubmit={submitPayment} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Jumlah Diterima (Rp)</label>
            <CurrencyInput className="form-input" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setPayModal(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
