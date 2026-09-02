import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import usePagination from '../../../hooks/usePagination';
import ClientPagination from '../components/ClientPagination';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import { useAuth } from '../../../contexts/AuthContext';
import './KulinerDashboard.css';
import '../kuliner-print.css';
import {
  KulinerPrintHeader,
  KulinerPrintSectionHeader,
  KulinerPrintAppendixHeader,
  KulinerPrintExplanationBox,
  KulinerPrintFooter,
  formatRp,
  formatDateIndo
} from '../components/KulinerPrintLayout';

export default function KulinerExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [financeCategories, setFinanceCategories] = useState([]);
  const [modalType, setModalType] = useState('expense');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchExpenses = async (start, end) => {
    try {
      setLoading(true);
      const res = await api.get('/kuliner/admin/expenses', {
        params: { startDate: start, endDate: end }
      });
      setExpenses(res.data);
    } catch (e) {
      console.error(e);
      alert('Gagal mengambil data pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/kuliner/admin/finance-categories');
      setFinanceCategories(res.data.filter(c => c.is_active));
    } catch (e) {
      console.error('Gagal mengambil kategori', e);
    }
  };

  useEffect(() => {
    fetchExpenses(startDate, endDate);
    fetchCategories();
  }, [startDate, endDate]);

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
    const data = {
      date: fd.get('date'),
      type: fd.get('type'),
      description: fd.get('description'),
      amount: parseFloat(fd.get('amount')),
      category: fd.get('category') || 'Lainnya'
    };
    
    try {
      if (editingExpense) {
        await api.put(`/kuliner/admin/expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/kuliner/admin/expenses', data);
      }
      fetchExpenses(startDate, endDate);
      setShowModal(false);
      setEditingExpense(null);
    } catch (e) {
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const openEdit = (ex) => {
    setEditingExpense(ex);
    setModalType(ex.type || 'expense');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  }

  const filteredExpenses = expenses.filter(ex => {
    const matchSearch = ((ex.description || '').toLowerCase().includes(search.toLowerCase()) || (ex.category || '').toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || (typeFilter === 'income' ? ex.type === 'income' : (!ex.type || ex.type === 'expense'));
    return matchSearch && matchType;
  });

  const formatRp = (num) => `Rp ${Math.round(Number(num || 0)).toLocaleString('id-ID')}`;

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const totalIncome = filteredExpenses.filter(ex => ex.type === 'income').reduce((sum, ex) => sum + Number(ex.amount || 0), 0);
  const totalExpense = filteredExpenses.filter(ex => (!ex.type || ex.type === 'expense')).reduce((sum, ex) => sum + Number(ex.amount || 0), 0);
  const totalBalance = totalIncome - totalExpense;

  const chartDataRaw = filteredExpenses.reduce((acc, curr) => {
    const d = curr.date.split('T')[0];
    if (!acc[d]) acc[d] = { dateRaw: d, Pemasukan: 0, Pengeluaran: 0 };
    if (curr.type === 'income') {
      acc[d].Pemasukan += Number(curr.amount || 0);
    } else {
      acc[d].Pengeluaran += Number(curr.amount || 0);
    }
    return acc;
  }, {});
  
  const chartData = Object.values(chartDataRaw).sort((a, b) => a.dateRaw.localeCompare(b.dateRaw)).map(item => ({
    ...item,
    name: new Date(item.dateRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }));

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Pengeluaran-Kuliner-${startDate}_${endDate}`,
    pageStyle: "@page { size: A4; margin: 1cm !important; }",
  });

  const renderExpenseRows = (items, { withActions }) => items.map(ex => (
    <tr key={ex.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
      <td style={{ padding: '12px 18px', fontSize: 12.5, color: '#64748B', whiteSpace: 'nowrap' }}>
        {new Date(ex.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
        <span style={{ 
            background: ex.type === 'income' ? '#DCFCE7' : '#F1F5F9', 
            color: ex.type === 'income' ? '#166534' : '#475569', 
            padding: '3px 10px', 
            borderRadius: 20, 
            fontSize: 11.5, 
            fontWeight: 600, 
            display: 'inline-block'
        }}>
            {ex.category}
        </span>
      </td>
      <td style={{ padding: '12px 18px', color: '#0F172A', fontWeight: 500 }}>
        {ex.description}
      </td>
      <td style={{ padding: '12px 18px', color: '#16A34A', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {ex.type === 'income' ? formatRp(ex.amount) : '-'}
      </td>
      <td style={{ padding: '12px 18px', color: '#DC2626', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {(!ex.type || ex.type === 'expense') ? formatRp(ex.amount) : '-'}
      </td>
      {withActions && (
        <td style={{ padding: '12px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
            <button 
              className="kd-btn" 
              style={{ width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, color: '#475569', cursor: 'pointer' }} 
              onClick={() => openEdit(ex)} 
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button 
              className="kd-btn" 
              style={{ width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }} 
              onClick={async () => { if (confirm('Hapus pencatatan kas ini?')) { await api.delete(`/kuliner/admin/expenses/${ex.id}`); fetchExpenses(startDate, endDate); } }} 
              title="Hapus"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      )}
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
  } = usePagination(filteredExpenses);

  // Remove PREDEFINED_CATEGORIES, we use financeCategories now

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Pencatatan Kas</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memuat pengeluaran operasional..." />
        ) : (
          <>
            {/* RESPONSIVE ACTION & FILTER BAR */}
            <div className="no-print" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: 12, 
              marginBottom: 20 
            }}>
              {/* Left: Primary Action Button */}
              <button
                className="kd-btn kd-btn-primary"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: 38, 
                  padding: '0 18px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: 'nowrap'
                }}
                onClick={() => { setEditingExpense(null); setModalType('expense'); setShowModal(true); }}
              >
                <Plus size={16} style={{ marginRight: 6 }} />
                Tambah Transaksi Kas
              </button>

              {/* Right: Search + Type Filter + Date Filter + Print Button */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, flex: '1 1 auto', justifyContent: 'flex-end' }}>
                <div style={{ minWidth: 160, flex: '1 1 180px', maxWidth: 260 }}>
                  <input
                    style={{ 
                      width: '100%', 
                      height: 38, 
                      padding: '0 12px', 
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1', 
                      borderRadius: 10, 
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="🔍 Cari transaksi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <select 
                  style={{ 
                    height: 38, 
                    padding: '0 10px', 
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1', 
                    borderRadius: 10, 
                    fontSize: 13,
                    fontWeight: 500,
                    outline: 'none',
                    color: '#334155',
                    boxSizing: 'border-box'
                  }}
                  value={typeFilter}
                  onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">Semua Jenis Kas</option>
                  <option value="income">Hanya Pemasukan</option>
                  <option value="expense">Hanya Pengeluaran</option>
                </select>

                <select 
                  style={{ 
                    height: 38, 
                    padding: '0 10px', 
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1', 
                    borderRadius: 10, 
                    fontSize: 13,
                    fontWeight: 500,
                    outline: 'none',
                    color: '#334155',
                    boxSizing: 'border-box'
                  }} 
                  value={dateFilter} 
                  onChange={handleDateFilterChange}
                >
                  <option value="all">📅 Semua Waktu</option>
                  <option value="today">📅 Hari Ini</option>
                  <option value="month">📅 Bulan Ini</option>
                  <option value="custom">📅 Custom</option>
                </select>

                {dateFilter === 'custom' && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input 
                      type="date" 
                      style={{ height: 38, padding: '0 8px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12 }} 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                    />
                    <span style={{ color: '#64748b', fontWeight: 600 }}>–</span>
                    <input 
                      type="date" 
                      style={{ height: 38, padding: '0 8px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, fontSize: 12 }} 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                    />
                  </div>
                )}

                <button 
                  className="kd-btn kd-btn-secondary" 
                  onClick={handlePrint}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: 38, 
                    padding: '0 14px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Printer size={15} style={{ marginRight: 6 }} /> Cetak
                </button>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="kd-panel no-print" style={{ marginBottom: 20 }}>
                <div className="kd-panel-header">
                  <div className="text-sm font-bold text-slate-800">Grafik Arus Kas</div>
                </div>
                <div style={{ height: 300, padding: '20px 20px 0 0' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis 
                        tickFormatter={(v) => `Rp ${v / 1000}k`} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => [formatRp(value), undefined]}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div ref={printRef}>
              <div className="no-print" style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: 24 }}>
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Tanggal</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>Kategori</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Keterangan</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' }}>Pemasukan</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' }}>Pengeluaran</th>
                        <th style={{ padding: '12px 18px', fontSize: 11.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', paddingRight: 24, whiteSpace: 'nowrap' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                            Belum ada pencatatan kas.
                          </td>
                        </tr>
                      ) : (
                        renderExpenseRows(paginatedData, { withActions: true })
                      )}
                    </tbody>
                  </table>
                </div>
                
                <ClientPagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={pageSize}
                  setItemsPerPage={setPageSize}
                  totalPages={totalPages}
                  totalItems={totalItems}
                />
              </div>

              {/* ========================================================================= */}
              {/* PRINT-ONLY FORMAL ACCOUNTING CASH & EXPENSE REPORT TEMPLATE              */}
              {/* ========================================================================= */}
              <div className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
                
                {/* 1. Header / Kop Laporan Resmi Kuliner */}
                <KulinerPrintHeader
                  user={user}
                  title="Laporan Catatan Kas Resto"
                  subtitle="Rekapitulasi Mutasi Kas Masuk & Pengeluaran Operasional Restoran / Kafe"
                  startDate={startDate}
                  endDate={endDate}
                />

                {/* 2. Ringkasan Saldo Kas (Horizontal borders only) */}
                <div style={{ marginBottom: 22 }}>
                  <KulinerPrintSectionHeader title="I. Ringkasan Mutasi Kas & Saldo Operasional" />

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #000000' }}>
                        <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                          A. AKUMULASI TRANSAKSI KAS RESTORAN
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Penerimaan / Pemasukan Kas Operasional</td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalIncome)}</td>
                        <td style={{ width: 140 }}></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pengeluaran / Beban Operasional Resto</td>
                        <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>({formatRp(totalExpense)})</td>
                        <td></td>
                      </tr>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                        <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                          SALDO MUTASI KAS BERSIH (NET CASH MOVEMENT)
                        </td>
                        <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                          {filteredExpenses.length} Transaksi Tercatat
                        </td>
                        <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatRp(totalBalance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Buku Kas Register Transaksi (NO VERTICAL LINES, BLACK & WHITE) */}
                <div style={{ marginBottom: 22 }}>
                  <KulinerPrintSectionHeader 
                    title="II. Buku Register Transaksi Kas Operasional Restoran" 
                    rightText={`Total ${filteredExpenses.length} transaksi`} 
                  />

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5, color: '#000000' }}>
                    <thead>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                        <th style={{ padding: '7px 4px', textAlign: 'center', width: 35, fontWeight: 600 }}>No</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', width: 110, fontWeight: 600 }}>Tanggal</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', width: 130, fontWeight: 600 }}>Kategori</th>
                        <th style={{ padding: '7px 6px', textAlign: 'left', fontWeight: 600 }}>Keterangan / Deskripsi</th>
                        <th style={{ padding: '7px 6px', textAlign: 'right', width: 135, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Masuk / Inflow (Rp)</th>
                        <th style={{ padding: '7px 6px', textAlign: 'right', width: 135, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Keluar / Outflow (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#4B5563', fontStyle: 'italic', borderBottom: '1px solid #E5E7EB' }}>
                            Tidak ada transaksi kas pada filter periode ini.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((ex, idx) => (
                          <tr key={ex.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '6px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                            <td style={{ padding: '6px 6px', color: '#000000', whiteSpace: 'nowrap' }}>{formatDateIndo(ex.date)}</td>
                            <td style={{ padding: '6px 6px', fontWeight: 500, color: '#000000' }}>{ex.category || '-'}</td>
                            <td style={{ padding: '6px 6px', color: '#374151', fontSize: 9.5 }}>{ex.description || '-'}</td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', fontWeight: ex.type === 'income' ? 600 : 400, whiteSpace: 'nowrap' }}>
                              {ex.type === 'income' ? `+${formatRp(ex.amount)}` : '-'}
                            </td>
                            <td style={{ padding: '6px 6px', textAlign: 'right', color: '#000000', fontWeight: (!ex.type || ex.type === 'expense') ? 600 : 400, whiteSpace: 'nowrap' }}>
                              {(!ex.type || ex.type === 'expense') ? `(${formatRp(ex.amount)})` : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                        <td colSpan={4} style={{ padding: '7px 6px', textAlign: 'right', textTransform: 'uppercase', fontSize: 10, color: '#000000', whiteSpace: 'nowrap' }}>
                          Total Rekapitulasi Kas:
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          +{formatRp(totalIncome)}
                        </td>
                        <td style={{ padding: '7px 6px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ({formatRp(totalExpense)})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
                <KulinerPrintFooter user={user} showSignatures={true} />

                {/* 4. HALAMAN 2: LAMPIRAN TATA KELOLA KAS OPERASIONAL RESTORAN */}
                <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
                  <KulinerPrintAppendixHeader 
                    title="Lampiran: Penjelasan & Tata Kelola Kas Operasional Restoran"
                    subtitle={`Keterangan Kebijakan Kas Kecil (Petty Cash) & Pengeluaran Dapur — ${user?.tenant_name || 'Restoran & Kafe'}`}
                    user={user}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
                    <KulinerPrintExplanationBox
                      number="1"
                      title="Kas Masuk Operasional (Inflow)"
                      desc="Seluruh aliran dana yang masuk ke laci kasir atau rekening operasional di luar transaksi penjualan POS harian, seperti setoran modal tambahan pemilik atau pengembalian belanja pasar."
                      variant="default"
                    />

                    <KulinerPrintExplanationBox
                      number="2"
                      title="Belanja Harian Pasar & Bahan Segar (Fresh Ingredients)"
                      desc="Pengeluaran kas kecil (petty cash) langsung untuk pembelian sayur, bumbu segar, es batu, atau bahan baku mendadak yang dibeli secara tunai setiap pagi."
                      variant="emerald"
                    />

                    <KulinerPrintExplanationBox
                      number="3"
                      title="Beban Utilitas Dapur & Restoran (Kitchen Utilities)"
                      desc="Biaya pemakaian gas LPG restoran, token listrik dapur, tagihan air PDAM, serta iuran kebersihan dan pembuangan limbah sisa makanan."
                      variant="indigo"
                    />

                    <KulinerPrintExplanationBox
                      number="4"
                      title="Beban Operasional & Servis (Operational & Front-of-House)"
                      desc="Biaya kemasan takeaway, sedotan, tisu makan, sabun cuci piring, perawatan kompor/blender, serta insentif operasional kru restoran."
                      variant="rose"
                    />

                    <KulinerPrintExplanationBox
                      number="5"
                      title="Rekonsiliasi Kas Akhir Shift (Cash Drawer Reconciliation)"
                      desc="Setiap pergantian shift kasir, sisa fisik uang tunai di laci wajib dihitung dan dicocokkan dengan saldo mutasi kas bersih pada sistem."
                      formula="Rumus: Fisik Kas = Kas Awal Modal + Total Kas Masuk - Total Kas Keluar"
                      variant="dark"
                    />
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

        {showModal && (
          <div className="kd-modal-overlay visible" onClick={handleClose}>
            <div className="kd-modal max-w-md" onClick={e => e.stopPropagation()}>
              <div className="kd-modal-header">
                <h2 className="kd-modal-title">{editingExpense ? 'Edit Pencatatan Kas' : 'Catat Kas Baru'}</h2>
                <button className="kd-close-btn" onClick={handleClose}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="kd-modal-body">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom: 16 }}>
                    <div className="kd-form-group">
                      <label className="kd-form-label">Tanggal</label>
                      <input name="date" type="date" className="kd-form-input" defaultValue={editingExpense ? editingExpense.date : new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="kd-form-group">
                      <label className="kd-form-label">Jenis Kas</label>
                      <select name="type" className="kd-form-select" value={modalType} onChange={e => setModalType(e.target.value)} required>
                        <option value="expense">Kas Keluar (Pengeluaran)</option>
                        <option value="income">Kas Masuk (Pemasukan)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Kategori</label>
                    <select name="category" className="kd-form-select" defaultValue={editingExpense?.category || ''} required>
                      <option value="">-- Pilih Kategori --</option>
                      {financeCategories.filter(c => c.type === modalType).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Keterangan</label>
                    <input name="description" className="kd-form-input" placeholder={modalType === 'expense' ? "Tulis rincian pengeluaran..." : "Tulis rincian pemasukan..."} defaultValue={editingExpense?.description} required />
                  </div>

                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Nominal (Rp)</label>
                    <CurrencyInput name="amount" className="kd-form-input" placeholder="Contoh: 50000" defaultValue={editingExpense?.amount} required />
                  </div>
                </div>
                
                <div className="kd-modal-footer">
                  <button type="button" className="kd-btn kd-btn-secondary" onClick={handleClose}>Batal</button>
                  <button type="submit" className="kd-btn kd-btn-primary">{editingExpense ? 'Simpan Perubahan' : 'Catat Kas'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </KulinerAdminLayout>
  );
}
