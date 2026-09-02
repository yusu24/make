import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { TrendingUp, TrendingDown, Wallet, Calendar, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import usePagination from '../../../hooks/usePagination';
import BudidayaPagination from '../components/BudidayaPagination';
import { useAuth } from '../../../contexts/AuthContext';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';
import '../budidaya.css';
import '../budidaya-print.css';
import {
  BudidayaPrintHeader,
  BudidayaPrintSectionHeader,
  BudidayaPrintAppendixHeader,
  BudidayaPrintExplanationBox,
  BudidayaPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/BudidayaPrintLayout';

const formatTitleCase = (str) => {
  if (!str) return '-';
  return String(str)
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const formatSentenceCase = (str) => {
  if (!str) return '-';
  const trimmed = String(str).trim();
  if (!trimmed) return '-';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export default function BudidayaFinanceSummary() {
  const { user } = useAuth();
  const terms = useBudidayaTerms();
  const [summary, setSummary] = useState({ total_sales: 0, total_expenses: 0, profit: 0 });
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  // Default filter: Bulan Ini
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState('month'); 
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchSummary = async (start, end) => {
    setLoading(true);
    try {
      const res = await api.get(`/budidaya/finance/summary?startDate=${start}&endDate=${end}`);
      setSummary(res.data);
      const ledgerRes = await api.get(`/budidaya/finance/ledger?startDate=${start}&endDate=${end}`);
      setLedger(ledgerRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(startDate, endDate);
  }, [startDate, endDate]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setDateFilter(val);
    
    const t = new Date();
    if (val === 'today') {
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Laba-Rugi-Budidaya-${startDate}_${endDate}`,
  });

  const isProfit = summary.profit >= 0;

  const totalInflow = ledger
    .filter(item => item.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalOutflow = ledger
    .filter(item => item.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const renderLedgerRows = (items) => items.map((item, idx) => (
    <tr key={item.id} style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid #E9F0EC' }}>
      <td style={{ padding: '10px 16px', fontSize: 12.5, color: '#64748b' }}>
        {new Date(item.date).toLocaleDateString('id-ID')}
      </td>
      <td style={{ padding: '10px 16px', fontSize: 12.5, color: '#0f172a', textTransform: 'capitalize' }}>
        {formatTitleCase(item.category)}
      </td>
      <td style={{ padding: '10px 16px', fontSize: 12.5, color: '#475569' }}>
        {formatSentenceCase(item.description)}
      </td>
      <td style={{ padding: '10px 16px', fontSize: 12.5, color: '#059669', textAlign: 'right' }}>
        {item.type === 'income' ? formatRp(item.amount) : '-'}
      </td>
      <td style={{ padding: '10px 16px', fontSize: 12.5, color: '#DC2626', textAlign: 'right' }}>
        {item.type === 'expense' ? formatRp(item.amount) : '-'}
      </td>
    </tr>
  ));

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
  } = usePagination(ledger);

  const handleExportExcel = () => {
    const headers = ['Tanggal', 'Kategori', 'Keterangan', 'Kas Masuk (Rp)', 'Kas Keluar (Rp)'];
    const rows = ledger.map(item => [
      `"${(item.date || '').split('T')[0]}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.description || '').replace(/"/g, '""')}"`,
      item.type === 'income' ? item.amount : 0,
      item.type === 'expense' ? item.amount : 0
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Laba_Rugi_Budidaya_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '18px 24px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", animation: 'kd-fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1B4332', color: 'white', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }} 
          onClick={handlePrint} 
          disabled={loading}
        >
          <Printer size={16} /> Cetak / Export PDF
        </button>

        <button 
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }} 
          onClick={handleExportExcel} 
          disabled={loading}
        >
          Export Excel
        </button>
      </div>

      {/* Filter Section */}
      <div className="no-print" style={{ 
        background: '#fff', borderRadius: 12, padding: '10px 16px', marginBottom: 14, 
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        border: '1px solid #E9F0EC'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="#64748b" />
          <span style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Periode:</span>
        </div>
        <select style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={dateFilter} onChange={handleFilterChange}>
          <option value="today">Hari Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="custom">Pilih Rentang Tanggal...</option>
        </select>

        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span style={{ color: '#64748b' }}>-</span>
            <input type="date" style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}
      </div>

      {/* Screen Interactive View */}
      <div className="no-print">
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#E8F5ED', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Total Pendapatan Panen</span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
                {loading ? '...' : formatRp(summary.total_sales)}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>Akumulasi omzet penjualan hasil panen.</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Total Pengeluaran Siklus</span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
                {loading ? '...' : formatRp(summary.total_expenses)}
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>Total beban operasional dan biaya siklus.</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', borderLeft: `4px solid ${isProfit ? '#059669' : '#DC2626'}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: isProfit ? '#ECFDF5' : '#FEF2F2', color: isProfit ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: isProfit ? '#059669' : '#DC2626' }}>
                    {isProfit ? 'Laba Bersih (Untung)' : 'Rugi Bersih (Defisit)'}
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Hasil Perhitungan Finansial</span>
                </div>
              </div>

              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                background: isProfit ? '#ECFDF5' : '#FEF2F2',
                color: isProfit ? '#059669' : '#DC2626',
                border: `1px solid ${isProfit ? '#A7F3D0' : '#FECACA'}`
              }}>
                {isProfit ? 'UNTUNG' : 'RUGI'}
              </span>
            </div>

            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: isProfit ? '#059669' : '#DC2626' }}>
                {loading ? '...' : (summary.profit >= 0 ? `+${formatRp(summary.profit)}` : `-${formatRp(Math.abs(summary.profit))}`)}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                {isProfit 
                  ? 'Status: Untung / Pendapatan melampaui seluruh beban biaya.' 
                  : 'Status: Rugi / Total biaya pengeluaran melebihi pendapatan.'}
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table (Screen) */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E9F0EC' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1B4332' }}>Rincian Transaksi Keuangan</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tanggal</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kategori</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Keterangan</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Kas Masuk / Inflow</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Kas Keluar / Outflow</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Memuat rincian...</td></tr>
                ) : ledger.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Tidak ada transaksi pada periode ini.</td></tr>
                ) : (
                  renderLedgerRows(paginatedData)
                )}
              </tbody>
            </table>
          </div>

          <BudidayaPagination
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

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE ACCOUNTING LAYOUT                                */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Budidaya */}
          <BudidayaPrintHeader
            user={user}
            title={`Laporan Laba Rugi ${terms.isTanaman ? 'Pertanian' : 'Budidaya'}`}
            subtitle={`Ringkasan Hasil Panen & Beban Siklus Operasional Farm — ${user?.tenant_name || 'Budidaya'}`}
            startDate={startDate}
            endDate={endDate}
            terms={terms}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <BudidayaPrintSectionHeader title="I. Ringkasan Posisi Laba Rugi Siklus (Financial Summary)" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI PENJUALAN & BEBAN OPERASIONAL
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pendapatan Penjualan Hasil Panen</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(summary.total_sales)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pengeluaran Beban Siklus & Pakan</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(summary.total_expenses)})</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    {isProfit ? 'HASIL KEUANGAN: LABA BERSIH (UNTUNG)' : 'HASIL KEUANGAN: RUGI BERSIH (DEFISIT)'}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    Margin: {summary.total_sales > 0 ? ((summary.profit / summary.total_sales) * 100).toFixed(1) : 0}%
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {summary.profit >= 0 ? `+${formatRp(summary.profit)}` : `-${formatRp(Math.abs(summary.profit))}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table (Separated Inflow vs Outflow) */}
          <div style={{ marginBottom: 20 }}>
            <BudidayaPrintSectionHeader 
              title="II. Buku Register Transaksi Keuangan (Cash Ledger)" 
              rightText={`Total ${ledger.length} transaksi pencatatan`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 85, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', width: 140, fontWeight: 600 }}>Kategori</th>
                  <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan Transaksi</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 130, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Masuk / Inflow (Rp)</th>
                  <th style={{ padding: '7px 6px', textAlign: 'right', width: 130, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Keluar / Outflow (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                    <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{item.category}</td>
                    <td style={{ padding: '6px 6px', color: '#000000' }}>{item.description || '-'}</td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {item.type === 'income' ? `+${formatRp(item.amount)}` : '-'}
                    </td>
                    <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>
                      {item.type === 'expense' ? `(${formatRp(item.amount)})` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Kas:
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalInflow)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ({formatRp(totalOutflow)})
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <BudidayaPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN METODOLOGI AKUNTANSI BUDIDAYA */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <BudidayaPrintAppendixHeader 
              title="Lampiran: Penjelasan & Metodologi Akuntansi Siklus Budidaya"
              subtitle={`Keterangan Pengakuan Hasil Panen, Efisiensi Pakan & Beban Operasional — ${user?.tenant_name || 'Farm Budidaya'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <BudidayaPrintExplanationBox
                number="1"
                title="Pengakuan Pendapatan Panen (Harvest Revenue Recognition)"
                desc="Pendapatan diakui saat komoditas hasil panen ditimbang, diserahkan kepada pembeli/tengkulak, dan diterbitkan nota timbang resmi."
                formula="Rumus: Omzet Panen = Total Bobot Panen (Kg) × Harga Jual per Kg"
                variant="default"
              />

              <BudidayaPrintExplanationBox
                number="2"
                title="Beban Pokok Produksi & Efisiensi Pakan (Feed Conversion Ratio / FCR)"
                desc="Komponen biaya pakan merupakan porsi pengeluaran terbesar siklus. Efisiensi pakan dinilai dari rasio FCR terhadap bobot daging panen yang dihasilkan."
                formula="Rumus: FCR = Total Pakan Diberikan (Kg) ÷ Total Bobot Panen (Kg)"
                variant="emerald"
              />

              <BudidayaPrintExplanationBox
                number="3"
                title="Tingkat Kelulushidupan (Survival Rate / SR)"
                desc="Persentase populasi komoditas yang berhasil hidup sampai masa panen dibandingkan dengan total tebar bibit/benih awal."
                formula="Rumus: SR (%) = (Jumlah Ekor Panen ÷ Jumlah Tebar Awal) × 100%"
                variant="indigo"
              />

              <BudidayaPrintExplanationBox
                number="4"
                title="Alokasi Beban Operasional Farm (Direct Farm Overheads)"
                desc="Biaya listrik aerator, bahan bakar pompa, probiotik/suplemen air, obat-obatan, serta tenaga kerja harian selama masa siklus berlangsung."
                variant="rose"
              />

              <BudidayaPrintExplanationBox
                number="5"
                title="Laba Bersih Siklus (Net Cycle Margin)"
                desc="Indikator keuntungan bersih riil yang diterima pengelola setelah menutup seluruh beban modal bibit, pakan, suplemen, dan perawatan farm."
                formula="Rumus: Laba Bersih = Omzet Panen - (Beban Pakan + Bibit + Suplemen + Operasional Farm)"
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
