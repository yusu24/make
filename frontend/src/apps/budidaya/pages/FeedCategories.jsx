import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table';

export default function FeedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      // Note: Endpoint will follow Retail structure but for Budidaya
      const res = await api.get('/budidaya/feed-categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
      // Fallback for demo if backend migration not yet run
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
      alert('Gagal menambah kategori (Backend Migration Required)');
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
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Data Master: Kategori Pakan</h2>

        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Daftar Kategori Pakan</h3>
        </div>
        <div style={{ padding: 20 }}>
          <form onSubmit={addCategory} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input name="name" className="form-input" placeholder="Misal: Pakan Protein Tinggi, Herbal..." required style={{flex: 1}}/>
            <button type="submit" className="btn btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Tambah Kategori
            </button>
          </form>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat kategori...</p>
            </div>
          ) : (
            <div className="aq-table-container">
              <Table>
                <TableHeader>
                  <TableRow isHoverable={false}>
                    <TableHeaderCell style={{ width: 80 }}>ID</TableHeaderCell>
                    <TableHeaderCell>Nama kategori</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow><TableCell colSpan="3" style={{ textAlign: 'center', color: 'var(--aq-text-tertiary)', padding: 32 }}>Belum ada data kategori pakan.</TableCell></TableRow>
                  ) : (
                    categories.map(c => (
                      <TableRow key={c.id}>
                        <TableCell>#{c.id}</TableCell>
                        <TableCell style={{ fontWeight: 600 }}>{c.name}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingCategory(c)}>Edit</button>
                            <button className="btn btn-sm btn-ghost" onClick={() => confirm('Hapus kategori ini?') && console.log('Delete logic')}>Hapus</button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
