import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import usePagination from '../../../hooks/usePagination';
import ClientPagination from '../../kuliner/components/ClientPagination';
import { useAuth } from '../../../contexts/AuthContext';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';
import '../budidaya.css';

export default function BudidayaExpenses() {
  const { user } = useAuth();
  const terms = useBudidayaTerms();
  const [expenses, setExpenses] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resExp, resCyc] = await Promise.all([
        api.get('/budidaya/expenses'),
        api.get('/budidaya/cycles')
      ]);
      setExpenses(resExp.data.data || resExp.data || []);
      setCycles(resCyc.data.data || resCyc.data || []);
    } catch (e) {
      console.error(e);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      date: fd.get('date'),
      notes: fd.get('notes'),
      amount: parseFloat(fd.get('amount')),
      category: fd.get('category') || 'Lainnya',
      cycle_id: fd.get('cycle_id') || null
    };
    
    try {
      if (editingExpense) {
        await api.put(`/budidaya/expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/budidaya/expenses', data);
      }
      fetchData();
      setShowModal(false);
      setEditingExpense(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  const openEdit = (ex) => {
    setEditingExpense(ex);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  }

  // Filter based on search and local dates
  const filteredExpenses = expenses.filter(ex => {
    const matchSearch = (ex.notes || '').toLowerCase().includes(search.toLowerCase()) ||
                        (ex.category || '').toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (startDate && endDate) {
        const d = new Date(ex.date).toISOString().split('T')[0];
        if (d < startDate || d > endDate) return false;
    }
    return true;
  });

  const formatRp = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const totalNominal = filteredExpenses.reduce((sum, ex) => sum + Number(ex.amount || 0), 0);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Pengeluaran-${startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]}`,
  });

  const renderExpenseRows = (items, { withActions }) => items.map(ex => (
    <tr key={ex.id} style={{ borderBottom: '1px solid #E9F0EC' }}>
      <td style={{ padding: '16px 24px' }}>
        <span style={{ color: '#475569', fontSize: 13 }}>{new Date(ex.date).toLocaleDateString('id-ID')}</span>
      </td>
      <td style={{ padding: '16px 12px' }}>
        <span style={{ 
            background: '#E8F5ED', color: '#1B4332', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
        }}>
            {ex.category}
        </span>
      </td>
      <td style={{ padding: '16px 12px', color: '#1e293b', fontWeight: 500 }}>
        {ex.notes}
        {ex.cycle_id && <div style={{ fontSize: 11, color: '#64748b' }}>Siklus ID: {ex.cycle_id}</div>}
      </td>
      <td style={{ padding: '16px 24px 16px 12px', color: '#ef4444', fontWeight: 600, textAlign: 'right' }}>
        - {formatRp(ex.amount)}
      </td>
      {withActions && (
        <td style={{ textAlign: 'right', paddingRight: 24 }}>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#64748b' }} onClick={() => openEdit(ex)} title="Edit"><Edit3 size={15} /></button>
            <button style={{ padding: '6px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: 6, cursor: 'pointer' }} onClick={async () => { if (confirm('Hapus pencatatan pengeluaran ini?')) { await api.delete(`/budidaya/expenses/${ex.id}`); fetchData(); } }} title="Hapus"><Trash2 size={15} /></button>
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

  const PREDEFINED_CATEGORIES = [
    'Pakan / Nutrisi',
    'Obat / Vitamin',
    'Operasional (Listrik, Air)',
    'Gaji Pekerja',
    'Peralatan Kolam/Lahan',
    'Lainnya'
  ];

  return (
    <div style={{ padding: 24, background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, color: '#1B4332', fontWeight: 800 }}>Pengeluaran Operasional</h2>
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1B4332', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }} 
          onClick={handlePrint} 
          disabled={loading}
        >
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* Print-only header */}
        <div className="print-only" style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #000' }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>Laporan Pengeluaran Operasional</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14 }}>{user?.tenant_name || 'Budidaya'}</p>
          <p style={{ margin: 0, fontSize: 12 }}>
            Periode: {startDate && endDate
              ? `${formatDate(startDate)} – ${formatDate(endDate)}`
              : 'Semua Tanggal'}
          </p>
          <p style={{ margin: 0, fontSize: 12 }}>Dicetak: {formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
          <div className="no-print" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid #E9F0EC' }}>
            <button
              style={{ display: 'flex', alignItems: 'center', height: 40, padding: '0 16px', background: '#1B4332', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setEditingExpense(null); setShowModal(true); }}
            >
              <Plus size={16} style={{ marginRight: 8 }} />
              Tambah Pengeluaran
            </button>
            <div style={{ position: 'relative', width: 240 }}>
              <input
                style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                placeholder="Cari pengeluaran..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <Calendar size={18} color="#64748b" />
              <select style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={dateFilter} onChange={handleDateFilterChange}>
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Pilih Rentang...</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span style={{ color: '#64748b' }}>-</span>
                <input type="date" style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                  <th style={{ padding: '16px 12px 16px 24px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Kategori</th>
                  <th style={{ padding: '16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600 }}>Keterangan</th>
                  <th style={{ padding: '16px 24px 16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Nominal</th>
                  <th className="no-print" style={{ padding: '16px 24px 16px 12px', fontSize: 13, color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Memuat pengeluaran...</td></tr>
                ) : filteredExpenses.length === 0 ? (
                   <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Belum ada catatan pengeluaran.</td></tr>
                ) : (
                   <React.Fragment>
                     {/* Screen view */}
                     <div className="no-print" style={{ display: 'contents' }}>
                        {renderExpenseRows(paginatedData, { withActions: true })}
                     </div>
                     {/* Print view */}
                     <div className="print-only" style={{ display: 'contents' }}>
                        {renderExpenseRows(filteredExpenses, { withActions: false })}
                     </div>
                   </React.Fragment>
                )}
              </tbody>
              <tfoot className="print-only">
                <tr style={{ borderTop: '2px solid #000' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }} colSpan={3}>Total Pengeluaran</td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#ef4444', textAlign: 'right' }}>- {formatRp(totalNominal)}</td>
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

      <Modal 
        isOpen={showModal} 
        onClose={handleClose}
        title={editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
      >
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Tanggal</label>
              <input name="date" type="date" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} defaultValue={editingExpense ? editingExpense.date : new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Kategori</label>
              <input name="category" list="expense-categories" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} defaultValue={editingExpense?.category || ''} placeholder="Ketik atau pilih..." required />
              <datalist id="expense-categories">
                {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Terkait Siklus (Opsional)</label>
            <select name="cycle_id" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} defaultValue={editingExpense?.cycle_id || ''}>
              <option value="">-- Pengeluaran Umum --</option>
              {cycles.map(c => (
                <option key={c.id} value={c.id}>{terms.isTanaman ? 'Siklus Lahan' : 'Siklus Kolam'}: {c.pond?.name || c.id} ({c.status})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Keterangan / Catatan</label>
            <input name="notes" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="Tulis rincian pengeluaran..." defaultValue={editingExpense?.notes} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Nominal (Rp)</label>
            <CurrencyInput name="amount" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} placeholder="Contoh: 50000" defaultValue={editingExpense?.amount} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }} onClick={handleClose}>Batal</button>
            <button type="submit" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#1B4332', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{editingExpense ? 'Simpan' : 'Catat'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
