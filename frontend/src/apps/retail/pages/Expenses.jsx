import React, { useState, useEffect, useRef } from 'react';
import '../retail.css';
import '../retail-print.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, Printer, Calendar } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { useAuth } from '../../../contexts/AuthContext';

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); // all, today, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchCategories = async () => {
    try {
      const resCat = await api.get('/retail/expense-categories');
      setCategories(resCat.data);
    } catch (e) {
      console.error('Error fetching expense categories:', e);
    }
  };

  const fetchExpenses = async (start, end) => {
    setLoading(true);
    try {
      const params = (start && end) ? `?startDate=${start}&endDate=${end}` : '';
      const res = await api.get(`/retail/finance/expenses${params}`);
      setExpenses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchExpenses(startDate, endDate); }, [startDate, endDate]);

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
    // if custom, user picks with the date inputs below
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      tanggal: fd.get('tanggal'),
      keterangan: fd.get('keterangan'),
      nominal: parseFloat(fd.get('nominal')),
      expense_category_id: fd.get('expense_category_id') || null
    };
    
    try {
      if (editingExpense) {
        await api.put(`/retail/finance/expenses/${editingExpense.id}`, data);
      } else {
        await api.post('/retail/finance/expenses', data);
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
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  }

  const filteredExpenses = expenses.filter(ex =>
    (ex.keterangan || '').toLowerCase().includes(search.toLowerCase()) ||
    (ex.kategori || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatRp = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const totalNominal = filteredExpenses.reduce((sum, ex) => sum + Number(ex.nominal || 0), 0);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan-Pengeluaran-${startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]}`,
  });

  const renderExpenseRows = (items, { withActions }) => items.map(ex => (
    <tr key={ex.id}>
      <td className="pl-6">
        <span className="retail-text-secondary">{new Date(ex.tanggal).toLocaleDateString('id-ID')}</span>
      </td>
      <td>
        <span className="retail-badge retail-badge-primary">{ex.kategori}</span>
      </td>
      <td className="retail-text-primary">{ex.keterangan}</td>
      <td className={withActions ? 'retail-text-danger' : 'pr-6 retail-text-danger'}>
        - {formatRp(ex.nominal)}
      </td>
      {withActions && (
        <td style={{ textAlign: 'right' }} className="pr-6">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => openEdit(ex)} title="Edit"><Edit3 size={15} /></button>
            <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { if (confirm('Hapus pencatatan pengeluaran ini?')) { await api.delete(`/retail/finance/expenses/${ex.id}`); fetchExpenses(startDate, endDate); } }} title="Hapus"><Trash2 size={15} /></button>
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

  return (
    <div className="animate-fade-in">

      <div className="page-header" style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint} disabled={loading}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* Print-only header */}
        <div className="print-only retail-print-header">
          <h2>Laporan Pengeluaran</h2>
          <p>{user?.tenant_name || 'Toko'}</p>
          <p>
            Periode: {startDate && endDate
              ? `${formatDate(startDate)} – ${formatDate(endDate)}`
              : 'Semua Tanggal'}
          </p>
          <p>Dicetak: {formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>

        {/* Table Section (Unified Style) */}
        <div className="card table-wrap animate-fade-in mt-8">
          <div className="toolbar-no-stack no-print" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
            <button
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
              onClick={() => { setEditingExpense(null); setShowModal(true); }}
            >
              <Plus size={15} className="mr-2 mobile-no-margin" />
              <span className="btn-text-mobile-hide">Tambah Pengeluaran</span>
            </button>
            <div className="airy-search-wrapper" style={{ width: 200, margin: 0 }}>
              <input
                placeholder="Cari pengeluaran..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} className="retail-text-secondary" style={{ flexShrink: 0 }} />
              <select className="form-input" style={{ width: 'auto', height: 42 }} value={dateFilter} onChange={handleDateFilterChange}>
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Pilih Rentang Tanggal...</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" className="form-input" style={{ height: 42 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                <span>-</span>
                <input type="date" className="form-input" style={{ height: 42 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            )}
          </div>

          {/* Screen view: paginated, with actions */}
          <div className="retail-table-responsive no-print"><table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Tanggal</th>
                <th className="retail-table-header">Kategori</th>
                <th className="retail-table-header">Keterangan</th>
                <th className="retail-table-header">Nominal</th>
                <th className="text-right pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <RetailTableLoadingRow colSpan={5} text="Menyinkronkan Pengeluaran..." />
              ) : filteredExpenses.length === 0 ? (
                 <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada catatan pengeluaran.</td></tr>
              ) : renderExpenseRows(paginatedData, { withActions: true })}
            </tbody>
          </table></div>
          <div className="no-print">
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

          {/* Print/PDF view: full list, no actions */}
          <div className="retail-table-responsive print-only"><table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Tanggal</th>
                <th className="retail-table-header">Kategori</th>
                <th className="retail-table-header">Keterangan</th>
                <th className="pr-6 retail-table-header">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                 <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada catatan pengeluaran.</td></tr>
              ) : renderExpenseRows(filteredExpenses, { withActions: false })}
            </tbody>
            <tfoot className="retail-print-totals">
              <tr>
                <td className="pl-6 text-sm font-semibold" colSpan={3}>Total Pengeluaran</td>
                <td className="pr-6 retail-text-danger font-semibold">- {formatRp(totalNominal)}</td>
              </tr>
            </tfoot>
          </table></div>
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={handleClose}
        title={editingExpense ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
      >
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input name="tanggal" type="date" className="form-input" defaultValue={editingExpense ? editingExpense.tanggal : new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select name="expense_category_id" className="form-input" defaultValue={editingExpense?.expense_category_id || ''} required>
                <option value="" disabled>Pilih Kategori...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <small style={{ color: 'var(--danger-500)', marginTop: 4 }}>
                  Master kategori masih kosong. Tambahkan dulu di menu Data Master.
                </small>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input name="keterangan" className="form-input" placeholder="Tulis rincian pengeluaran..." defaultValue={editingExpense?.keterangan} required />
          </div>

          <div className="form-group">
            <label className="form-label">Nominal Pengeluaran (Rp)</label>
            <CurrencyInput name="nominal" className="form-input" placeholder="Contoh: 50000" defaultValue={editingExpense?.nominal} required />
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingExpense ? 'Simpan Perubahan' : 'Catat Pengeluaran'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
