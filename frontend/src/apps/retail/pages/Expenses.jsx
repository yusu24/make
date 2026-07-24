import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDependencies = async () => {
    setLoading(true);
    try {
      // Load categories first as they are critical for the form
      const resCat = await api.get('/retail/expense-categories');
      setCategories(resCat.data);
      
      // Load expenses
      const resExp = await api.get('/retail/finance/expenses');
      setExpenses(resExp.data);
    } catch (e) {
      console.error('Error fetching finance data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/retail/finance/expenses');
      setExpenses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchDependencies(); }, []);

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
      fetchExpenses();
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


      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in mt-8">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => { setEditingExpense(null); setShowModal(true); }}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Pengeluaran</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari pengeluaran..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive"><table className="table">
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
            ) : (
              paginatedData.map(ex => (
                <tr key={ex.id}>
                  <td className="pl-6">
                    <span className="retail-text-secondary">{new Date(ex.tanggal).toLocaleDateString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="retail-badge retail-badge-primary">{ex.kategori}</span>
                  </td>
                  <td className="retail-text-primary">{ex.keterangan}</td>
                  <td className="retail-text-danger">
                    - Rp {Number(ex.nominal).toLocaleString('id-ID')}
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(ex)} title="Edit"><Edit3 size={15} /></button>
                      <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { if(confirm('Hapus pencatatan pengeluaran ini?')) { await api.delete(`/retail/finance/expenses/${ex.id}`); fetchExpenses(); } }} title="Hapus"><Trash2 size={15} /></button>
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
            <input name="nominal" type="number" min="0" className="form-input" placeholder="Contoh: 50000" defaultValue={editingExpense?.nominal} required />
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
