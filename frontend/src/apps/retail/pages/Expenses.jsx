import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

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
      kategori: fd.get('kategori') || 'Lainnya'
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

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Keuangan: Pengeluaran</h2>
          <p className="page-sub">Catat dan kelola pengeluaran operasional toko Anda.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingExpense(null); setShowModal(true); }}>+ Tambah Pengeluaran</button>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in mt-8">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Histori Pengeluaran Toko</h3>
          </div>
          <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-800 text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading)' }}>
             {expenses.length} Records Found
          </span>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6">Tanggal</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th className="text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-800">Menyinkronkan Pengeluaran...</td></tr>
            ) : expenses.length === 0 ? (
               <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada catatan pengeluaran.</td></tr>
            ) : (
              expenses.map(ex => (
                <tr key={ex.id}>
                  <td className="pl-6">
                    <span className="text-slate-500">{new Date(ex.tanggal).toLocaleDateString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="badge badge-gray">{ex.kategori}</span>
                  </td>
                  <td className="text-slate-800">{ex.keterangan}</td>
                  <td style={{ color: 'var(--danger-500)' }}>
                    - Rp {Number(ex.nominal).toLocaleString('id-ID')}
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(ex)}>Edit</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-600)' }} onClick={async () => { if(confirm('Hapus pencatatan pengeluaran ini?')) { await api.delete(`/retail/finance/expenses/${ex.id}`); fetchExpenses(); } }}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              <select name="kategori" className="form-input" defaultValue={editingExpense?.kategori || ''} required>
                <option value="" disabled>Pilih Kategori...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
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
