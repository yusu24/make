import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { Plus, Wallet, TrendingDown, CheckCircle, AlertCircle, RefreshCw, Trash2, Printer, Calendar, Filter } from 'lucide-react';
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

export default function Payables() {
  const { user } = useAuth();
  const [payables, setPayables] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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
  const [supplierFilter, setSupplierFilter] = useState('all');

  const printRef = useRef(null);

  const fetchSuppliers = async () => {
    try {
      const sRes = await api.get('/retail/suppliers');
      setSuppliers(sRes.data || []);
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
      if (supplierFilter !== 'all') params.supplier_id = supplierFilter;

      const pRes = await api.get('/retail/payables', { params });
      setPayables(pRes.data.data || []); 
      setSummary(pRes.data.summary || {}); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [statusFilter, startDate, endDate, supplierFilter]);

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
      await api.post('/retail/payables', {
        supplier_id: fd.get('supplier_id'),
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

  const handleDelete = async (payable) => {
    if (!confirm(`Hapus catatan hutang ke "${payable.supplier?.name || 'supplier ini'}"?`)) return;
    try {
      await api.delete(`/retail/payables/${payable.id}`);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus catatan hutang');
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/retail/payables/${payModal.id}/payments`, { amount_paid: payAmount, payment_method: 'CASH' });
      setPayModal(null); 
      setPayAmount(0); 
      fetchData();
    } catch (e) { 
      alert(e.response?.data?.message || 'Gagal mencatat pembayaran'); 
    }
  };

  const filteredPayables = payables.filter(p =>
    (p.supplier?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.note || '').toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Hutang-Supplier-${user?.tenant_name || 'Retail'}-${startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]}`,
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
  } = usePagination(filteredPayables);

  const totalDebt = Number(summary.total_debt || payables.reduce((s, p) => s + Number(p.total_amount || 0), 0));
  const totalPaid = Number(summary.total_paid || payables.reduce((s, p) => s + Number(p.paid_amount || 0), 0));
  const totalOutstanding = Number(summary.total_outstanding || payables.reduce((s, p) => s + Number(p.remaining ?? (p.total_amount - p.paid_amount) || 0), 0));
  const settlementRate = totalDebt > 0 ? ((totalPaid / totalDebt) * 100).toFixed(1) : '0';

  const paidCount = filteredPayables.filter(p => p.status === 'paid').length;
  const partialCount = filteredPayables.filter(p => p.status === 'partial').length;
  const unpaidCount = filteredPayables.filter(p => p.status === 'unpaid' || !p.status).length;

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
        {/* ========================================================================= */}
        {/* PRINT-ONLY FORMAL MONOCHROME (BLACK & WHITE) PAYABLES PDF TEMPLATE       */}
        {/* ========================================================================= */}
        <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Laporan Resmi */}
          <RetailPrintHeader
            user={user}
            title="Laporan Hutang Usaha"
            subtitle="Rekapitulasi Kewajiban Hutang Pembelian Supplier (Accounts Payable Statement)"
            startDate={startDate}
            endDate={endDate}
            periodText={statusFilter !== 'all' ? `Status: ${getStatusText(statusFilter)} | ${startDate && endDate ? `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}` : 'Semua Tanggal'}` : undefined}
          />

          {/* 2. Formal Accounts Payable Statement Breakdown (Black & White, Horizontal Borders Only) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader title="I. Laporan Posisi Hutang Usaha (Accounts Payable Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                {/* A. TOTAL KEWAJIBAN HUTANG */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. TOTAL KEWAJIBAN PEMBELIAN SUPPLIER (GROSS PAYABLES)
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Akumulasi Tagihan Pembelian / Faktur Supplier ({filteredPayables.length} Supplier)
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 130 }}>
                    {formatRp(totalDebt)}
                  </td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Subtotal Hutang Usaha (Gross)
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontWeight: 600 }}>
                    {formatRp(totalDebt)}
                  </td>
                </tr>

                {/* B. PEMBAYARAN DILUNASI */}
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '8px 4px 6px', fontWeight: 600, color: '#000000' }}>
                    B. PEMBAYARAN DILUNASI (DISBURSEMENTS / SETTLEMENTS)
                  </td>
                  <td style={{ padding: '8px 4px 6px', textAlign: 'right' }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>
                    Total Kas Keluar untuk Pembayaran Hutang Supplier
                  </td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000' }}>
                    ({formatRp(totalPaid)})
                  </td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 600 }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#000000' }}>
                    Total Pembayaran Hutang Berhasil Dilunasi
                  </td>
                  <td></td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', fontSize: 11 }}>
                    ({formatRp(totalPaid)})
                  </td>
                </tr>

                {/* C. SISA SALDO HUTANG */}
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    C. SISA SALDO HUTANG BELUM LUNAS (OUTSTANDING PAYABLES)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Rasio Pelunasan: {settlementRate}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600 }}>
                    {formatRp(totalOutstanding)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Monochrome Accounting Ledger Table (NO VERTICAL LINES, BLACK & WHITE) */}
          <div style={{ marginBottom: 22 }}>
            <RetailPrintSectionHeader 
              title="II. Buku Pembantu Rincian Hutang per Supplier (Supplier Ledger)" 
              rightText={`Total ${filteredPayables.length} Data (${paidCount} Lunas, ${partialCount} Sebagian, ${unpaidCount} Belum Bayar)`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Nama Supplier</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 120, fontWeight: 600, whiteSpace: 'nowrap' }}>Total Hutang (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 110, fontWeight: 600, whiteSpace: 'nowrap' }}>Terbayar (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 120, fontWeight: 600, whiteSpace: 'nowrap' }}>Sisa Hutang (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'center', width: 100, fontWeight: 600, whiteSpace: 'nowrap' }}>Jatuh Tempo</th>
                  <th style={{ padding: '7px 6px', textAlign: 'center', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 110, fontWeight: 600 }}>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayables.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                      Tidak ada catatan hutang supplier pada filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredPayables.map((p, idx) => {
                    const rem = p.remaining ?? (p.total_amount - p.paid_amount);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{p.supplier?.name || '-'}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>{formatRp(p.total_amount)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>{formatRp(p.paid_amount)}</td>
                        <td style={{ padding: '6px 6px', textAlign: 'right', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                          {formatRp(rem)}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', color: '#000000', whiteSpace: 'nowrap' }}>
                          {p.due_date ? formatDateIndo(p.due_date) : '-'}
                        </td>
                        <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600, fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                          {getStatusText(p.status)}
                        </td>
                        <td style={{ padding: '6px 6px', color: '#374151', fontSize: 9.5 }}>{p.note || '-'}</td>
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
                    {formatRp(totalDebt)}
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

          {/* 4. HALAMAN 2: LAMPIRAN PENJELASAN & METODOLOGI AKUNTANSI HUTANG (TANPA ROMAWI) */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <RetailPrintAppendixHeader 
              title="Lampiran: Penjelasan & Metodologi Pengelolaan Hutang Usaha"
              subtitle={`Keterangan Kebijakan Akuntansi Hutang Supplier & Jadwal Pelunasan — ${user?.tenant_name || 'Toko Retail'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <RetailPrintExplanationBox
                number="1"
                title="Total Nilai Hutang Usaha (Gross Payables)"
                desc="Merupakan total seluruh kewajiban pembayaran tempo atas pembelian persediaan produk / barang dagang kepada mitra supplier yang terdaftar pada sistem."
                formula="Rumus: Total Hutang = Σ (Nilai Seluruh Faktur Pembelian Supplier Tercatat)"
                variant="default"
              />

              <RetailPrintExplanationBox
                number="2"
                title="Realisasi Pembayaran Hutang (Disbursements / Settlements)"
                desc="Akumulasi seluruh dana kas / transfer bank yang telah dibayarkan oleh toko kepada supplier untuk melunasi kewajiban pembelian persediaan barang."
                formula="Rumus: Total Dibayar = Σ (Seluruh Pembayaran Kas Keluar Pelunasan Hutang)"
                variant="emerald"
              />

              <RetailPrintExplanationBox
                number="3"
                title="Sisa Hutang Belum Dilunasi (Outstanding Payables)"
                desc="Saldo riil kewajiban kepada supplier yang masih harus dibayarkan sebelum melewati tenggat waktu jatuh tempo guna menjaga pasokan barang dagang yang stabil."
                formula="Rumus: Sisa Hutang = Total Tagihan Hutang - Total Pembayaran Terbayar"
                variant="amber"
              />

              <RetailPrintExplanationBox
                number="4"
                title="Rasio Pelunasan Hutang (Settlement Rate)"
                desc="Indikator kepatuhan pembayaran yang mengukur persentase nilai kewajiban supplier yang berhasil diselesaikan pada periode berjalan."
                formula="Rumus: Settlement Rate = (Total Dana Dibayarkan ÷ Total Nilai Hutang) × 100%"
                variant="indigo"
              />

              <RetailPrintExplanationBox
                number="5"
                title="Tata Kelola Jatuh Tempo & Manajemen Likuiditas"
                desc="Pencatatan tanggal jatuh tempo memungkinkan bisnis merencanakan arus kas keluar (cash outflow) secara teratur sehingga tidak terjadi penumpukan tagihan mendadak."
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
            {/* Total Hutang Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                  <TrendingDown size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Hutang</span>
              </div>
              <div>
                <p className="text-2xl text-slate-900 leading-tight font-semibold">{formatRp(summary.total_debt)}</p>
                <p className="text-xs text-slate-400 mt-1">Total keseluruhan hutang ke supplier.</p>
              </div>
            </div>

            {/* Sudah Dibayar Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                  <CheckCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Sudah Dibayar</span>
              </div>
              <div>
                <p className="text-2xl text-emerald-600 leading-tight font-semibold">{formatRp(summary.total_paid)}</p>
                <p className="text-xs text-slate-400 mt-1">Total pembayaran yang telah dilunasi.</p>
              </div>
            </div>

            {/* Sisa Hutang Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                  <AlertCircle size={18} />
                </div>
                <span className="text-sm font-medium text-slate-500">Sisa Hutang</span>
              </div>
              <div>
                <p className="text-2xl text-amber-600 leading-tight font-semibold">{formatRp(summary.total_outstanding)}</p>
                <p className="text-xs text-slate-400 mt-1">Hutang yang belum dilunasi.</p>
              </div>
            </div>
          </div>

          <div className="card table-wrap animate-fade-in">
            {/* Filter Toolbar */}
            <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
              <button title="Catat Hutang Baru"
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
                onClick={() => setShowModal(true)}
              >
                <Wallet size={15} className="mr-2 mobile-no-margin" />
                <span className="btn-text-mobile-hide">Catat Hutang Baru</span>
              </button>

              <div className="airy-search-wrapper" style={{ width: 220, margin: 0 }}>
                <input
                  placeholder="Cari supplier / catatan..."
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
                  <th className="pl-6 retail-table-header">Supplier</th>
                  <th className="text-right retail-table-header">Total</th>
                  <th className="text-right retail-table-header">Terbayar</th>
                  <th className="text-right retail-table-header">Sisa</th>
                  <th className="text-center retail-table-header">Jatuh Tempo</th>
                  <th className="text-center retail-table-header">Status</th>
                  <th className="pr-6 text-right retail-table-header">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <RetailTableLoadingRow colSpan={7} />
                ) : filteredPayables.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada catatan hutang yang sesuai filter.</td></tr>
                ) : (
                  paginatedData.map(p => (
                    <tr key={p.id}>
                      <td className="pl-6 retail-text-primary">
                        <div className="font-semibold">{p.supplier?.name || '-'}</div>
                        {p.note && <div className="text-xs text-slate-400">{p.note}</div>}
                      </td>
                      <td className="text-right">{formatRp(p.total_amount)}</td>
                      <td className="text-right retail-text-secondary">{formatRp(p.paid_amount)}</td>
                      <td className="text-right font-semibold">{formatRp(p.remaining ?? (p.total_amount - p.paid_amount))}</td>
                      <td className="text-center retail-text-secondary" style={{ fontSize: 12 }}>{p.due_date ? formatDateIndo(p.due_date) : '-'}</td>
                      <td className="text-center">
                        <span className={`retail-badge ${p.status === 'paid' ? 'retail-badge-primary' : ''}`}>
                          {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="pr-6 text-right">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {p.status !== 'paid' && (
                            <button className="btn btn-sm btn-ghost" onClick={() => { setPayModal(p); setPayAmount(p.remaining ?? (p.total_amount - p.paid_amount)); }} title="Bayar"><Wallet size={15} /></button>
                          )}
                          <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(p)} title="Hapus"><Trash2 size={15} /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Catat Hutang ke Supplier">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select name="supplier_id" className="form-input" defaultValue="" required>
              <option value="" disabled>Pilih supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Hutang (Rp)</label>
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

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Catat Pembayaran">
        <form onSubmit={submitPayment} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Jumlah Dibayar (Rp)</label>
            <CurrencyInput className="form-input" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setPayModal(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Pembayaran</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
