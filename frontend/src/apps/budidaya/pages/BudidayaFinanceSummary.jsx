import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { TrendingUp, TrendingDown, Wallet, Calendar, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import usePagination from '../../../hooks/usePagination';
import ClientPagination from '../../kuliner/components/ClientPagination'; // Reusing generic client pagination
import { useAuth } from '../../../contexts/AuthContext';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';
import '../budidaya.css';

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

  const formatRp = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Laba-Rugi-Budidaya-${startDate}_${endDate}`,
  });

  const isProfit = summary.profit >= 0;

  const renderLedgerRows = (items) => items.map(item => (
    <tr key={item.id} style={{ borderBottom: '1px solid #E9F0EC' }}>
      <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>
        {new Date(item.date).toLocaleDateString('id-ID')}
      </td>
      <td style={{ padding: '16px 12px', fontSize: 13, color: '#1e293b' }}>
        <div style={{ fontWeight: 600 }}>{item.category}</div>
        <div style={{ color: '#64748b', fontSize: 12 }}>{item.description}</div>
      </td>
      <td style={{ padding: '16px 12px', fontSize: 13, color: '#10b981', fontWeight: 600, textAlign: 'right' }}>
        {item.type === 'income' ? formatRp(item.amount) : '-'}
      </td>
      <td style={{ padding: '16px 24px 16px 12px', fontSize: 13, color: '#ef4444', fontWeight: 600, textAlign: 'right' }}>
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

  return (
    <div style={{ padding: 24, background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", animation: 'kd-fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, color: '#1B4332', fontWeight: 800 }}>Laba Rugi</h2>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1B4332', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }} 
          onClick={handlePrint} 
          disabled={loading}
        >
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      {/* Filter Section */}
      <div className="no-print" style={{ 
        background: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, 
        display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
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

      <div ref={printRef}>
        {/* Print-only header */}
        <div className="print-only" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #000' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Laporan Laba Rugi {terms.isTanaman ? 'Pertanian' : 'Budidaya'}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14 }}>{user?.tenant_name || 'Budidaya'}</p>
          <p style={{ margin: 0, fontSize: 12 }}>Periode: {formatDate(startDate)} &ndash; {formatDate(endDate)}</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
          
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8F5ED', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Total Pendapatan Panen</span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
                {loading ? '...' : formatRp(summary.total_sales)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Total nilai kotor dari seluruh panen.</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={20} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Total Pengeluaran</span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>
                {loading ? '...' : formatRp(summary.total_expenses)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Total beban operasional dan biaya siklus.</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: isProfit ? '#E8F5ED' : '#fef2f2', color: isProfit ? '#1B4332' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={20} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>Laba Bersih</span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: isProfit ? '#1B4332' : '#ef4444' }}>
                {loading ? '...' : formatRp(summary.profit)}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Pendapatan Panen dikurangi Pengeluaran.</div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
          <div className="no-print" style={{ padding: '16px 24px', borderBottom: '1px solid #E9F0EC' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1B4332' }}>Rincian Transaksi Keuangan</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                  <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Keterangan</th>
                  <th style={{ padding: '16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Pendapatan</th>
                  <th style={{ padding: '16px 24px 16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Memuat rincian...</td></tr>
                ) : ledger.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Tidak ada transaksi pada periode ini.</td></tr>
                ) : (
                  <>
                    <React.Fragment>
                      <div className="no-print" style={{ display: 'contents' }}>
                        {renderLedgerRows(paginatedData)}
                      </div>
                      <div className="print-only" style={{ display: 'contents' }}>
                        {renderLedgerRows(ledger)}
                      </div>
                    </React.Fragment>
                  </>
                )}
              </tbody>
              <tfoot className="print-only">
                <tr style={{ borderTop: '2px solid #000' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }} colSpan={2}>Total</td>
                  <td style={{ padding: '16px 12px', fontWeight: 700, color: '#10b981', textAlign: 'right' }}>{formatRp(summary.total_sales)}</td>
                  <td style={{ padding: '16px 24px 16px 12px', fontWeight: 700, color: '#ef4444', textAlign: 'right' }}>{formatRp(summary.total_expenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="no-print">
            <ClientPagination
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
  )
}
