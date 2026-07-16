import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2 } from 'lucide-react';


export default function ExpenseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/retail/expense-categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { 
      await api.post('/retail/expense-categories', { name: fd.get('name') }); 
      fetchCategories(); 
      e.target.reset(); 
    } catch (e) {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/retail/expense-categories/${editingCategory.id}`, { name: fd.get('name') });
      fetchCategories();
      setEditingCategory(null);
    } catch (e) {}
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredCategories);

  return (
    <div className="retail-page-classic">
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-between items-center gap-3 flex-wrap">
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              placeholder="Cari kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <form onSubmit={addCategory} className="flex items-center gap-3">
             <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
                <input
                  name="name"
                  placeholder="Kategori pengeluaran baru..."
                  required
                />
             </div>
             <button type="submit" className="btn btn-primary h-[42px] px-6 whitespace-nowrap">
                Tambah
             </button>
          </form>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header" style={{ width: 100 }}>ID</th>
              <th className="retail-table-header">Nama Kategori</th>
              <th className="text-right pr-6 retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <RetailTableLoadingRow colSpan={3} text="Menyinkronkan Kategori..." />
            ) : filteredCategories.length === 0 ? (
               <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada master kategori pengeluaran.</td></tr>
            ) : (
              paginatedData.map(c => (
                <tr key={c.id}>
                  <td className="pl-6">
                    <span className="text-slate-400">#{c.id}</span>
                  </td>
                  <td>
                    <span className="badge badge-gray">{c.name}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditingCategory(c)}><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-600)' }} onClick={async () => { if(confirm('Hapus kategori ini? Data pengeluaran lama tidak akan kehilangan label teksnya.')) { await api.delete(`/retail/expense-categories/${c.id}`); fetchCategories(); } }}><Trash2 size={14} /></button>
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
        isOpen={!!editingCategory} 
        onClose={() => setEditingCategory(null)}
        title="Edit Kategori Pengeluaran"
      >
        <form onSubmit={handleUpdate} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Kategori</label>
            <input name="name" className="form-input" defaultValue={editingCategory?.name} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
