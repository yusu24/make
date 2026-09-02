import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, Printer, Calendar, ArrowUpRight, ArrowDownRight, Wallet, Search, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
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

const EXPENSE_CATEGORIES = [
  'Pakan',
  'Bibit / Benih',
  'Pupuk / Nutrisi',
  'Obat & Vitamin',
  'Listrik & Air',
  'Bahan Bakar',
  'Tenaga Kerja',
  'Pemeliharaan Alat',
  'Lainnya'
];

const INCOME_CATEGORIES = [
  'Penjualan Hasil Panen',
  'Penjualan Pupuk / Kompos',
  'Penjualan Bibit / Anakan',
  'Hasil Sampingan Ternak',
  'Subsidi / Hibah Peternakan',
  'Modal Tambahan',
  'Pendapatan Lain-lain'
];

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

export default function BudidayaExpenses() {
  const { user } = useAuth();
  const terms = useBudidayaTerms();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic categories with default fallback
  const incomeCategoriesList = useMemo(() => {
    const fromApi = customCategories.filter(c => c.type === 'income' && c.is_active !== false).map(c => c.name);
    return fromApi.length > 0 ? fromApi : INCOME_CATEGORIES;
  }, [customCategories]);

  const expenseCategoriesList = useMemo(() => {
    const fromApi = customCategories.filter(c => c.type === 'expense' && c.is_active !== false).map(c => c.name);
    return fromApi.length > 0 ? fromApi : EXPENSE_CATEGORIES;
  }, [customCategories]);

  // Single Unified Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTrx, setEditingTrx] = useState(null);
  const [modalTrxType, setModalTrxType] = useState('inflow'); // 'inflow' | 'outflow'
  const [modalCategory, setModalCategory] = useState(INCOME_CATEGORIES[0]);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'inflow' | 'outflow'
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resExp, resInc, resCyc, resCats] = await Promise.all([
        api.get('/budidaya/expenses'),
        api.get('/budidaya/incomes'),
        api.get('/budidaya/cycles'),
        api.get('/budidaya/finance-categories').catch(() => ({ data: { data: [] } }))
      ]);
      setExpenses(resExp.data?.data || resExp.data || []);
      setIncomes(resInc.data?.data || resInc.data || []);
      setCycles(resCyc.data?.data || resCyc.data || []);
      setCustomCategories(resCats.data?.data || resCats.data || []);
    } catch (e) {
      console.error('Error fetching budidaya finance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  // Open modal for creating new transaction
  const handleOpenCreate = () => {
    setEditingTrx(null);
    setModalTrxType('inflow');
    setModalCategory(INCOME_CATEGORIES[0]);
    setShowModal(true);
  };

  // Open modal for editing existing transaction
  const handleOpenEdit = (item) => {
    setEditingTrx(item);
    setModalTrxType(item.trxType);
    setModalCategory(item.category);
    setShowModal(true);
  };

  // Handle modal transaction type change (Pemasukan vs Pengeluaran)
  const handleTrxTypeChange = (newType) => {
    setModalTrxType(newType);
    if (newType === 'inflow') {
      setModalCategory(INCOME_CATEGORIES[0]);
    } else {
      setModalCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  // ─── UNIFIED TRANSACTION SUBMIT ───────────────────────────────────────────
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const date = fd.get('date');
    const category = modalCategory;
    const amount = parseFloat(fd.get('amount'));
    const cycle_id = fd.get('cycle_id') || null;
    const notes = fd.get('notes') || '';
    const payment_method = fd.get('payment_method') || 'Tunai / Kas';
    const recipient_or_buyer = fd.get('recipient_or_buyer') || '';

    try {
      if (modalTrxType === 'inflow') {
        const data = { date, category, amount, cycle_id, payment_method, recipient_or_buyer, notes };
        if (editingTrx && editingTrx.trxType === 'inflow') {
          await api.put(`/budidaya/incomes/${editingTrx.id}`, data);
        } else {
          await api.post('/budidaya/incomes', data);
        }
      } else {
        const data = { date, category, amount, cycle_id, notes };
        if (editingTrx && editingTrx.trxType === 'outflow') {
          await api.put(`/budidaya/expenses/${editingTrx.id}`, data);
        } else {
          await api.post('/budidaya/expenses', data);
        }
      }

      fetchData();
      setShowModal(false);
      setEditingTrx(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan transaksi');
    }
  };

  const handleDelete = async (item) => {
    const isIncome = item.trxType === 'inflow';
    if (!window.confirm(`Yakin ingin menghapus catatan ${isIncome ? 'pemasukan' : 'pengeluaran'} ini?`)) return;
    try {
      if (isIncome) {
        await api.delete(`/budidaya/incomes/${item.id}`);
      } else {
        await api.delete(`/budidaya/expenses/${item.id}`);
      }
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus data');
    }
  };

  // ─── COMBINED TRANSACTIONS ─────────────────────────────────────────────────
  const allTransactions = useMemo(() => {
    const incList = incomes.map(i => ({
      ...i,
      trxType: 'inflow',
      displayType: 'Pemasukan',
      displayId: `INC-${i.id}`,
      inflowAmount: Number(i.amount || 0),
      outflowAmount: 0
    }));

    const expList = expenses.map(e => ({
      ...e,
      trxType: 'outflow',
      displayType: 'Pengeluaran',
      displayId: `EXP-${e.id}`,
      inflowAmount: 0,
      outflowAmount: Number(e.amount || 0)
    }));

    return [...incList, ...expList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, expenses]);

  // ─── FILTERING ─────────────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(item => {
      // Type filter (Pemasukan vs Pengeluaran)
      if (typeFilter === 'inflow' && item.trxType !== 'inflow') return false;
      if (typeFilter === 'outflow' && item.trxType !== 'outflow') return false;

      // Date range filter
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      // Text search
      if (search) {
        const s = search.toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const notes = (item.notes || '').toLowerCase();
        const cyc = item.cycle ? `siklus ${item.cycle.id} ${item.cycle.name || ''}`.toLowerCase() : '';
        const buyer = (item.recipient_or_buyer || '').toLowerCase();
        if (!cat.includes(s) && !notes.includes(s) && !cyc.includes(s) && !buyer.includes(s)) {
          return false;
        }
      }

      return true;
    });
  }, [allTransactions, typeFilter, startDate, endDate, search]);

  const totalInflow = useMemo(() => 
    filteredTransactions.reduce((acc, curr) => acc + curr.inflowAmount, 0)
  , [filteredTransactions]);

  const totalOutflow = useMemo(() => 
    filteredTransactions.reduce((acc, curr) => acc + curr.outflowAmount, 0)
  , [filteredTransactions]);

  const netCashflow = totalInflow - totalOutflow;

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredTransactions, 10);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Buku-Kas-Budidaya-${new Date().toISOString().split('T')[0]}`,
  });

  const handleExportExcel = () => {
    const headers = ['No', 'Tanggal', 'Jenis Transaksi', 'Kategori Pos', 'Keterangan / Pihak Terkait', 'Siklus', 'Kas Masuk (Rp)', 'Kas Keluar (Rp)'];
    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      `"${(t.date || '').split('T')[0]}"`,
      `"${t.displayType}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${((t.notes || '') + (t.recipient_or_buyer ? ' - ' + t.recipient_or_buyer : '')).replace(/"/g, '""')}"`,
      `"${t.cycle ? `Siklus #${t.cycle.id}` : 'Umum'}"`,
      t.inflowAmount,
      t.outflowAmount
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Kas_Budidaya_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '18px 24px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", animation: 'kd-fadeIn 0.3s ease' }}>
      
      {/* ─── Top Actions Bar (Title is in Navtop Header) ─── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <button
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '9px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          title="Cetak Buku Kas PDF"
        >
          <Printer size={16} />
          <span>Cetak PDF</span>
        </button>

        <button
          onClick={handleExportExcel}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '9px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
          title="Export ke Excel / CSV"
        >
          <Download size={16} />
          <span>Export Excel</span>
        </button>

        {/* SINGLE ACTION BUTTON: Catat Transaksi */}
        <button
          onClick={handleOpenCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1B4332', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <Plus size={16} />
          <span>Catat Transaksi</span>
        </button>
      </div>

      {/* ─── Metric Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
        
        {/* Card Inflow */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', borderLeft: '4px solid #059669', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <ArrowUpRight size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Total Kas Masuk (Pemasukan)</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#059669' }}>
              +{formatRp(totalInflow)}
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
              Penjualan panen, bibit, pupuk & penerimaan lain
            </div>
          </div>
        </div>

        {/* Card Outflow */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', borderLeft: '4px solid #DC2626', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                <ArrowDownRight size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Total Kas Keluar (Pengeluaran)</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#DC2626' }}>
              -{formatRp(totalOutflow)}
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
              Pakan, benih, listrik, gaji & operasional
            </div>
          </div>
        </div>

        {/* Card Net */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #E9F0EC', borderLeft: `4px solid ${netCashflow >= 0 ? '#2563EB' : '#D97706'}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: netCashflow >= 0 ? '#EFF6FF' : '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: netCashflow >= 0 ? '#2563EB' : '#D97706' }}>
                <Wallet size={18} />
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#334155' }}>Mutasi Kas Bersih (Net)</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: netCashflow >= 0 ? '#2563EB' : '#DC2626' }}>
              {netCashflow >= 0 ? `+${formatRp(netCashflow)}` : `-${formatRp(Math.abs(netCashflow))}`}
            </div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>
              {netCashflow >= 0 ? 'Surplus Arus Kas Operasional' : 'Defisit Arus Kas Operasional'}
            </div>
          </div>
        </div>

      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #E9F0EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        
        {/* Left: Type Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#475569' }}>Jenis:</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', background: '#fff', minWidth: 160 }}
          >
            <option value="all">Semua Transaksi ({allTransactions.length})</option>
            <option value="inflow">Pemasukan ({incomes.length})</option>
            <option value="outflow">Pengeluaran ({expenses.length})</option>
          </select>
        </div>

        {/* Right: Search & Date Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <input
              type="text"
              placeholder="Cari transaksi / catatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', height: 38, padding: '0 12px 0 34px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
            />
            <Search size={15} style={{ position: 'absolute', left: 11, top: 11, color: '#94A3B8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color="#64748b" />
            <select
              value={dateFilter}
              onChange={handleDateFilterChange}
              style={{ height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', background: '#fff' }}
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="custom">Rentang Kustom...</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ height: 38, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
              />
              <span style={{ fontSize: 12, color: '#64748B' }}>s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ height: 38, padding: '0 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
              />
            </div>
          )}
        </div>

      </div>

      {/* ─── Data Table ─── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                <th style={{ padding: '12px 14px', width: 45, textAlign: 'center', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>No</th>
                <th style={{ padding: '12px 14px', width: 105, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Tanggal</th>
                <th style={{ padding: '12px 14px', width: 130, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Jenis</th>
                <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Kategori Pos</th>
                <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Keterangan / Pihak Terkait</th>
                <th style={{ padding: '12px 14px', width: 140, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Terkait Siklus</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: 140, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Kas Masuk (Rp)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', width: 140, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Kas Keluar (Rp)</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: 85, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>
                    Memuat data buku kas...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>
                    Belum ada catatan transaksi kas pada filter ini.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={`${item.trxType}-${item.id}`} style={{ borderBottom: idx === paginatedData.length - 1 ? 'none' : '1px solid #E9F0EC' }}>
                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#64748b' }}>{startIndex + idx + 1}</td>
                    <td style={{ padding: '11px 14px', color: '#334155', whiteSpace: 'nowrap' }}>{(item.date || '').split('T')[0]}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                        background: item.trxType === 'inflow' ? '#ECFDF5' : '#FEF2F2',
                        color: item.trxType === 'inflow' ? '#059669' : '#DC2626',
                        border: `1px solid ${item.trxType === 'inflow' ? '#A7F3D0' : '#FECACA'}`
                      }}>
                        {item.displayType}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#0F172A', textTransform: 'capitalize' }}>
                      {formatTitleCase(item.category)}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#475569', fontSize: '13px' }}>
                      {formatSentenceCase(item.notes || '-')}
                      {item.recipient_or_buyer && (
                        <span style={{ color: '#64748B', marginLeft: 6 }}>
                          • {formatTitleCase(item.recipient_or_buyer)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {item.cycle ? (
                        <span style={{ fontSize: 11.5, color: '#2563EB' }}>
                          Siklus #{item.cycle.id} {item.cycle.name ? `(${item.cycle.name})` : ''}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 11.5 }}>Umum / Non-Siklus</span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: item.inflowAmount > 0 ? '#059669' : '#CBD5E1', whiteSpace: 'nowrap' }}>
                      {item.inflowAmount > 0 ? `+${formatRp(item.inflowAmount)}` : '-'}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: item.outflowAmount > 0 ? '#DC2626' : '#CBD5E1', whiteSpace: 'nowrap' }}>
                      {item.outflowAmount > 0 ? `-${formatRp(item.outflowAmount)}` : '-'}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {filteredTransactions.length > 0 && (
          <BudidayaPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredTransactions.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ─── SINGLE UNIFIED MODAL (CATAT / EDIT TRANSAKSI KAS) ─── */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTrx(null); }}
        title={editingTrx ? `Edit Transaksi ${modalTrxType === 'inflow' ? 'Pemasukan' : 'Pengeluaran'}` : "Catat Transaksi Kas Farm"}
      >
        <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Dropdown / Switcher Jenis Transaksi */}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Jenis Transaksi Kas
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleTrxTypeChange('inflow')}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: modalTrxType === 'inflow' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: modalTrxType === 'inflow' ? '#ECFDF5' : '#fff',
                  color: modalTrxType === 'inflow' ? '#059669' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <ArrowUpRight size={16} />
                <span>Pemasukan (Kas Masuk)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTrxTypeChange('outflow')}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: modalTrxType === 'outflow' ? '2px solid #DC2626' : '1px solid #cbd5e1',
                  background: modalTrxType === 'outflow' ? '#FEF2F2' : '#fff',
                  color: modalTrxType === 'outflow' ? '#DC2626' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                }}
              >
                <ArrowDownRight size={16} />
                <span>Pengeluaran (Kas Keluar)</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Tanggal Transaksi</label>
              <input
                type="date"
                name="date"
                defaultValue={editingTrx ? (editingTrx.date || '').split('T')[0] : new Date().toISOString().split('T')[0]}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Kategori {modalTrxType === 'inflow' ? 'Pemasukan' : 'Pengeluaran'}
              </label>
              <select
                value={modalCategory}
                onChange={e => setModalCategory(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
                required
              >
                {modalTrxType === 'inflow' ? (
                  incomeCategoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                ) : (
                  expenseCategoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: modalTrxType === 'inflow' ? '1fr 1fr' : '1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Terkait Siklus (Opsional)</label>
              <select
                name="cycle_id"
                defaultValue={editingTrx?.cycle_id || ''}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
              >
                <option value="">-- Biaya / Pemasukan Umum --</option>
                {cycles.map(cyc => (
                  <option key={cyc.id} value={cyc.id}>
                    Siklus #{cyc.id} - {cyc.name || `Kolam ${cyc.pond?.name || ''}`}
                  </option>
                ))}
              </select>
            </div>

            {modalTrxType === 'inflow' && (
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Metode Pembayaran</label>
                <select
                  name="payment_method"
                  defaultValue={editingTrx?.payment_method || 'Tunai / Kas'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
                >
                  <option value="Tunai / Kas">Tunai / Kas</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Nominal {modalTrxType === 'inflow' ? 'Kas Masuk' : 'Kas Keluar'} (Rp)
            </label>
            <CurrencyInput
              name="amount"
              defaultValue={editingTrx?.amount || 0}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          {modalTrxType === 'inflow' && (
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Pembeli / Pihak Penyetor (Opsional)</label>
              <input
                type="text"
                name="recipient_or_buyer"
                defaultValue={editingTrx?.recipient_or_buyer || ''}
                placeholder="Contoh: Pengepul Ikan Pak Joko, Pembeli Pupuk, dll."
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Keterangan / Catatan</label>
            <textarea
              name="notes"
              defaultValue={editingTrx?.notes || ''}
              placeholder="Contoh: Beli 2 sak pakan apung, penjualan pupuk kompos 50 karung, dll."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => { setShowModal(false); setEditingTrx(null); }}
              style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#475569' }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{ 
                padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#fff',
                background: modalTrxType === 'inflow' ? '#059669' : '#1B4332'
              }}
            >
              {editingTrx ? 'Simpan Perubahan' : `Simpan ${modalTrxType === 'inflow' ? 'Pemasukan' : 'Pengeluaran'}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE CASH BOOK REPORT                                 */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Budidaya */}
          <BudidayaPrintHeader
            user={user}
            title="Buku Kas & Transaksi Operasional Farm"
            subtitle="Rekapitulasi Kas Masuk (Pemasukan), Kas Keluar (Pengeluaran) & Mutasi Arus Kas"
            periodText={`Filter: ${typeFilter === 'inflow' ? 'Khusus Pemasukan' : typeFilter === 'outflow' ? 'Khusus Pengeluaran' : 'Semua Transaksi Kas'}`}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <BudidayaPrintSectionHeader title="I. Ringkasan Posisi Kas Masuk vs Kas Keluar" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI ARUS KAS OPERASIONAL
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pemasukan Kas Terdaftar (Inflow)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>+{formatRp(totalInflow)}</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Pengeluaran Kas Terdaftar (Outflow)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>-{formatRp(totalOutflow)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    MUTASI ARUS KAS BERSIH (NET CASHFLOW)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'center', fontSize: 10, color: '#000000' }}>
                    {totalInflow > 0 ? `${((netCashflow / totalInflow) * 100).toFixed(1)}%` : '0.0%'}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {netCashflow >= 0 ? `+${formatRp(netCashflow)}` : `-${formatRp(Math.abs(netCashflow))}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <BudidayaPrintSectionHeader 
              title="II. Buku Register Transaksi Kas Masuk & Kas Keluar" 
              rightText={`Total ${filteredTransactions.length} transaksi`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 28, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 70, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 80, fontWeight: 600 }}>Jenis</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 120, fontWeight: 600 }}>Kategori Pos</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', fontWeight: 600 }}>Keterangan / Pihak Terkait</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 100, fontWeight: 600 }}>Siklus</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 105, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Masuk (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 105, fontWeight: 600, whiteSpace: 'nowrap' }}>Kas Keluar (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item, idx) => (
                  <tr key={`${item.trxType}-${item.id}`} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 4px', color: '#000000', whiteSpace: 'nowrap' }}>
                      {(item.date || '').split('T')[0]}
                    </td>
                    <td style={{ padding: '5px 4px', fontWeight: 600, color: item.trxType === 'inflow' ? '#059669' : '#DC2626' }}>
                      {item.trxType === 'inflow' ? 'Pemasukan' : 'Pengeluaran'}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', textTransform: 'capitalize' }}>
                      {formatTitleCase(item.category)}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {formatSentenceCase(item.notes)} {item.recipient_or_buyer ? `(${formatTitleCase(item.recipient_or_buyer)})` : ''}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {item.cycle ? `Siklus #${item.cycle.id}` : 'Umum'}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      {item.inflowAmount > 0 ? `+${formatRp(item.inflowAmount)}` : '-'}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      {item.outflowAmount > 0 ? `-${formatRp(item.outflowAmount)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={6} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    +{formatRp(totalInflow)}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    -{formatRp(totalOutflow)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <BudidayaPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN PANDUAN TATA KELOLA KAS BUDIDAYA */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <BudidayaPrintAppendixHeader 
              title="Lampiran: Standar Tata Kelola Kas, Pemasukan & Pengeluaran Farm"
              subtitle={`Pedoman Pencatatan Kas Masuk, Pembelian Pakan & Efisiensi Siklus — ${user?.tenant_name || terms.farm}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <BudidayaPrintExplanationBox
                number="1"
                title="Pencatatan Seluruh Sumber Pemasukan Kas Farm"
                desc="Selain panen utama, pendapatan dari penjualan pupuk kandang/organik, anakan/bibit sisa seleksi, dan produk sampingan wajib dibukukan ke dalam kas masuk."
                variant="default"
              />

              <BudidayaPrintExplanationBox
                number="2"
                title="Alokasi Beban Pokok per Siklus vs Beban Operasional Umum"
                desc="Biaya pakan, bibit, dan vitamin wajib ditautkan langsung ke nomor ID Siklus yang bersangkutan untuk mendapatkan nilai FCR dan HPP panen yang presisi."
                variant="emerald"
              />

              <BudidayaPrintExplanationBox
                number="3"
                title="Pengendalian Kas Kecil & Belanja Perlengkapan Farm"
                desc="Setiap pembelian mendesak di toko pakan atau perlengkapan kolam/kandang wajib melampirkan nota resmi toko dan dicatat pada hari yang sama."
                variant="indigo"
              />

              <BudidayaPrintExplanationBox
                number="4"
                title="Rekonsiliasi Mutasi Pembayaran Panen & Rekening Bank"
                desc="Pencocokan berkala antara timbangan panen aktual dengan transfer pelunasan dari pengepul/tengkulak sebelum status pembayaran ditutup."
                variant="rose"
              />

              <BudidayaPrintExplanationBox
                number="5"
                title="Audit Kas Akhir Siklus & Evaluasi Laba Rugi"
                desc="Penutupan buku siklus panen membandingkan total kas masuk hasil panen terhadap akumulasi biaya pakan, bibit, listrik, dan upah pekerja."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
