import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import './KulinerDashboard.css';

export default function KulinerFinanceCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', is_active: true });
  const [filterType, setFilterType] = useState('all');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kuliner/admin/finance-categories');
      setCategories(res.data);
    } catch (e) {
      console.error(e);
      alert('Gagal memuat kategori keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/finance-categories/${editingItem.id}`, form);
      } else {
        await api.post('/kuliner/admin/finance-categories', form);
      }
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan kategori');
    }
  };

  const handleEdit = (cat) => {
    setEditingItem(cat);
    setForm({ name: cat.name, type: cat.type, is_active: cat.is_active });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      try {
        await api.delete(`/kuliner/admin/finance-categories/${id}`);
        fetchCategories();
      } catch (e) {
        console.error(e);
        alert('Gagal menghapus kategori');
      }
    }
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ name: '', type: filterType === 'income' ? 'income' : 'expense', is_active: true });
    setShowModal(true);
  };

  const filtered = categories.filter(c => filterType === 'all' ? true : c.type === filterType);

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Master Kategori Keuangan</h1>
      </div>

      <div className="kd-content">
        <div className="kd-page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div className="kd-tabs" style={{ display: 'flex', gap: 8 }}>
            <button className={`kd-btn ${filterType === 'all' ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => setFilterType('all')}>Semua</button>
            <button className={`kd-btn ${filterType === 'income' ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => setFilterType('income')}>Pemasukan</button>
            <button className={`kd-btn ${filterType === 'expense' ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => setFilterType('expense')}>Pengeluaran</button>
          </div>
          <button className="kd-btn kd-btn-primary" onClick={openNew}>
            <Plus size={16} style={{ marginRight: 8 }} /> Tambah Kategori
          </button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th>Tipe</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-400">Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-400">Belum ada kategori.</td></tr>
                ) : (
                  filtered.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{cat.name}</td>
                      <td>
                        {cat.type === 'income' 
                          ? <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Pemasukan</span>
                          : <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Pengeluaran</span>
                        }
                      </td>
                      <td>
                        {cat.is_active 
                          ? <span style={{ color: '#10b981', fontWeight: 600 }}>Aktif</span> 
                          : <span style={{ color: '#94a3b8', fontWeight: 600 }}>Nonaktif</span>
                        }
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 24 }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="kd-btn kd-btn-secondary" style={{ padding: '6px' }} onClick={() => handleEdit(cat)} title="Edit"><Edit3 size={15} /></button>
                          <button className="kd-btn" style={{ padding: '6px', background: '#fef2f2', color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => handleDelete(cat.id)} title="Hapus"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
            <div className="kd-modal max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="kd-modal-header">
                <h2 className="kd-modal-title">{editingItem ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="kd-modal-body">
                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Tipe Kategori</label>
                    <select className="kd-form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})} disabled={editingItem}>
                      <option value="expense">Pengeluaran</option>
                      <option value="income">Pemasukan</option>
                    </select>
                  </div>
                  
                  <div className="kd-form-group" style={{ marginBottom: 16 }}>
                    <label className="kd-form-label">Nama Kategori</label>
                    <input className="kd-form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Contoh: Gaji Karyawan" />
                  </div>

                  <div className="kd-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#475569', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} style={{ width: 16, height: 16 }} />
                      Kategori Aktif
                    </label>
                  </div>
                </div>
                <div className="kd-modal-footer">
                  <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="kd-btn kd-btn-primary">Simpan Kategori</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </KulinerAdminLayout>
  );
}
