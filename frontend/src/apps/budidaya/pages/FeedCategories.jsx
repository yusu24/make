import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table';

import usePagination from '../../../hooks/usePagination';
import BudidayaPagination from '../components/BudidayaPagination';

export default function FeedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

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
  } = usePagination(categories)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/budidaya/feed-categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
      setCategories([
        { id: 1, name: 'Pakan Pembesaran' },
        { id: 2, name: 'Pakan Benih (Starter)' },
        { id: 3, name: 'Suplemen & Vitamin' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { 
      await api.post('/budidaya/feed-categories', { name: fd.get('name') }); 
      fetchCategories(); 
      e.target.reset(); 
    } catch (e) {
      alert('Gagal menambah kategori');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/budidaya/feed-categories/${editingCategory.id}`, { name: fd.get('name') });
      fetchCategories();
      setEditingCategory(null);
    } catch (e) {}
  };

  return (
    <div className="aq-container">

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', maxWidth: 800 }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Daftar Kategori Pakan</h3>
        </div>
        <div style={{ padding: 14 }}>
          <form onSubmit={addCategory} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <input 
              name="name" 
              placeholder="Misal: Pakan Protein Tinggi, Herbal..." 
              required 
              style={{
                flex: 1, padding: '8px 12px', background: '#ffffff',
                border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Tambah Kategori
            </button>
          </form>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>Memuat kategori...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow isHoverable={false}>
                    <TableHeaderCell style={{ width: 80 }}>ID</TableHeaderCell>
                    <TableHeaderCell>Nama Kategori</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow><TableCell colSpan="3" style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>Belum ada data kategori pakan.</TableCell></TableRow>
                  ) : (
                    paginatedData.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>#{c.id}</TableCell>
                        <TableCell style={{ color: '#0f172a' }}>{c.name}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <div className="table-row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button 
                              title="Edit Kategori"
                              className="btn-table-action" 
                              onClick={() => setEditingCategory(c)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                            </button>
                            <button 
                              title="Hapus Kategori"
                              className="btn-table-action" 
                              onClick={() => confirm('Hapus kategori ini?') && console.log('Delete logic')}
                              style={{ color: '#EF4444' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
            </>
          )}
        </div>
      </div>

      <Modal 
        isOpen={!!editingCategory} 
        onClose={() => setEditingCategory(null)}
        title="Edit Kategori Pakan"
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
