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

export default function CashTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [search, setSearch] = useState('');
  const printRef = useRef(null);

  const [dateFilter, setDateFilter] = useState('all'); // all, today, month, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Modal state
  const [modalType, setModalType] = useState('expense'); // 'income' or 'expense'

  const fetchCategories = async () => {
    try {
      const resIn = await api.get('/retail/finance-categories?type=income');
      const resEx = await api.get('/retail/finance-categories?type=expense');
      setCategories([...resIn.data, ...resEx.data]);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchTransactions = async (start, end) => {
    setLoading(true);
    try {
      const params = (start && end) ? `?startDate=${start}&endDate=${end}` : '';
      const [resIncomes, resExpenses] = await Promise.all([
        api.get(`/retail/finance/incomes${params}`),
        api.get(`/retail/finance/expenses${params}`)
      ]);
      
      const incomes = (resIncomes.data || []).map(i => ({ ...i, tx_type: 'income' }));
      const expenses = (resExpenses.data || []).map(e => ({ ...e, tx_type: 'expense' }));
      
      const combined = [...incomes, ...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setTransactions(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchTransactions(startDate, endDate); }, [startDate, endDate]);

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
      tanggal: fd.get('tanggal'),
      keterangan: fd.get('keterangan'),
      nominal: parseFloat(fd.get('nominal')),
      finance_category_id: fd.get('finance_category_id') || null
    };
    
    try {
      if (editingData) {
        const endpoint = editingData.tx_type === 'income' ? '/retail/finance/incomes' : '/retail/finance/expenses';
        await api.put(`${endpoint}/${editingData.id}`, data);
      } else {
        const endpoint = modalType === 'income' ? '/retail/finance/incomes' : '/retail/finance/expenses';
        await api.post(endpoint, data);
      }
      fetchTransactions(startDate, endDate);
      setShowModal(false);
      setEditingData(null);
    } catch (e) {
      alert('Terjadi kesalahan saat menyimpan data');
    }
  };

  const openEdit = (tx) => {
    setEditingData(tx);
    setModalType(tx.tx_type);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingData(null);
    setModalType('expense'); // default
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingData(null);
  }

  const filteredTransactions = transactions.filter(tx =>
    (tx.keterangan || '').toLowerCase().includes(search.toLowerCase()) ||
    (tx.kategori || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  const totalIncomes = filteredTransactions.filter(tx => tx.tx_type === 'income').reduce((sum, tx) => sum + Number(tx.nominal || 0), 0);
  const totalExpenses = filteredTransactions.filter(tx => tx.tx_type === 'expense').reduce((sum, tx) => sum + Number(tx.nominal || 0), 0);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Catatan-Kas-${startDate && endDate ? `${startDate}_${endDate}` : new Date().toISOString().split('T')[0]}`,
  });

  const renderTransactionRows = (items, { withActions }) => items.map(tx => (
    <tr key={`${tx.tx_type}_${tx.id}`}>
      <td className="pl-6">
        <span className="retail-text-primary font-medium">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</span>
      </td>
      <td>
        <span className="retail-badge retail-badge-primary">{tx.kategori}</span>
      </td>
      <td className="retail-text-primary">{tx.keterangan}</td>
      <td className="text-right retail-text-success font-semibold">
        {tx.tx_type === 'income' ? formatRp(tx.nominal) : '-'}
      </td>
      <td className="text-right retail-text-danger font-semibold">
        {tx.tx_type === 'expense' ? formatRp(tx.nominal) : '-'}
      </td>
      {withActions && (
        <td style={{ textAlign: 'right' }} className="pr-6">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button title="Edit catatan" className="btn btn-sm btn-ghost" onClick={() => openEdit(tx)}><Edit3 size={15} /></button>
            <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { 
                if (confirm('Hapus pencatatan kas ini?')) { 
                    const endpoint = tx.tx_type === 'income' ? '/retail/finance/incomes' : '/retail/finance/expenses';
                    await api.delete(`${endpoint}/${tx.id}`); 
                    fetchTransactions(startDate, endDate); 
                } 
            }} title="Hapus"><Trash2 size={15} /></button>
          </div>
        </td>
      )}
    </tr>
  ));

  const {
    currentPage, setCurrentPage, pageSize, setPageSize, totalPages, totalItems, paginatedData, startIndex, endIndex
  } = usePagination(filteredTransactions);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">

      <div className="page-header" style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary flex items-center gap-2" onClick={handlePrint} disabled={loading}>
          <Printer size={16} /> Cetak / Export PDF
        </button>
      </div>

      <div ref={printRef}>
        {/* Print-only header */}
        <div className="print-only retail-print-header">
          <h2>Catatan Kas</h2>
          <p>{user?.tenant_name || 'Toko'}</p>
          <p>
            Periode: {startDate && endDate
              ? `${formatDate(startDate)} – ${formatDate(endDate)}`
              : 'Semua Tanggal'}
          </p>
          <p>Dicetak: {formatDate(new Date().toISOString().split('T')[0])}</p>
        </div>

        {/* Table Section */}
        <div className="card table-wrap animate-fade-in mt-4">
          <div className="toolbar-no-stack no-print" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
            <button
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
              onClick={openCreate}
            >
              <Plus size={15} className="mr-2 mobile-no-margin" />
              <span className="btn-text-mobile-hide">Tambah Catatan</span>
            </button>
            <div className="airy-search-wrapper" style={{ width: 220, margin: 0 }}>
              <input
                placeholder="Cari transaksi kas..."
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

          <div className="retail-table-responsive no-print"><table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Tanggal</th>
                <th className="retail-table-header">Kategori</th>
                <th className="retail-table-header">Keterangan</th>
                <th className="retail-table-header text-right">Pemasukan</th>
                <th className="retail-table-header text-right">Pengeluaran</th>
                <th className="text-right pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <RetailTableLoadingRow colSpan={6} text="Menyinkronkan data kas..." />
              ) : filteredTransactions.length === 0 ? (
                 <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada catatan kas (Pemasukan / Pengeluaran manual).</td></tr>
              ) : renderTransactionRows(paginatedData, { withActions: true })}
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
                <th className="retail-table-header text-right">Pemasukan</th>
                <th className="pr-6 retail-table-header text-right">Pengeluaran</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                 <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada catatan kas.</td></tr>
              ) : renderTransactionRows(filteredTransactions, { withActions: false })}
            </tbody>
            <tfoot className="retail-print-totals">
              <tr>
                <td className="pl-6 text-sm font-semibold text-right" colSpan={3}>Total</td>
                <td className="text-right retail-text-success font-semibold">{formatRp(totalIncomes)}</td>
                <td className="pr-6 text-right retail-text-danger font-semibold">{formatRp(totalExpenses)}</td>
              </tr>
            </tfoot>
          </table></div>
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={handleClose}
        title={editingData ? 'Edit Catatan Kas' : 'Catat Transaksi Kas Baru'}
      >
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          
          {!editingData && (
              <div className="form-group">
                 <label className="form-label">Tipe Transaksi</label>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                       <input type="radio" name="tx_type" value="income" checked={modalType === 'income'} onChange={() => setModalType('income')} />
                       <span style={{ fontWeight: 500 }}>Pemasukan</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                       <input type="radio" name="tx_type" value="expense" checked={modalType === 'expense'} onChange={() => setModalType('expense')} />
                       <span style={{ fontWeight: 500 }}>Pengeluaran</span>
                    </label>
                 </div>
              </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input name="tanggal" type="date" className="form-input" defaultValue={editingData ? editingData.tanggal : new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select name="finance_category_id" className="form-input" defaultValue={editingData?.finance_category_id || ''} required>
                <option value="" disabled>Pilih Kategori...</option>
                {categories.filter(c => c.type === modalType).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {categories.filter(c => c.type === modalType).length === 0 && (
                <small style={{ color: 'var(--danger-500)', marginTop: 4 }}>
                  Kategori {modalType === 'income' ? 'pemasukan' : 'pengeluaran'} kosong. Tambahkan di menu Data Master.
                </small>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Keterangan</label>
            <input name="keterangan" className="form-input" placeholder="Tulis rincian catatan..." defaultValue={editingData?.keterangan} required />
          </div>

          <div className="form-group">
            <label className="form-label">Nominal (Rp)</label>
            <CurrencyInput name="nominal" className="form-input" placeholder="Contoh: 50000" defaultValue={editingData?.nominal} required />
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingData ? 'Simpan Perubahan' : 'Catat Transaksi'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
