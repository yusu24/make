import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Tag, X } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import ClientPagination from '../components/ClientPagination';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

export default function KulinerFinanceCategories() {
  const toast = useToast();
  const confirm = useConfirm();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', is_active: true });
  const [filterType, setFilterType] = useState('all');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kuliner/admin/finance-categories');
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat kategori keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nama kategori wajib diisi');

    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/finance-categories/${editingItem.id}`, form);
        toast.success('Kategori berhasil diperbarui');
      } else {
        await api.post('/kuliner/admin/finance-categories', form);
        toast.success('Kategori berhasil ditambahkan');
      }
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingItem(cat);
    setForm({ name: cat.name, type: cat.type, is_active: cat.is_active });
    setShowModal(true);
  };

  const handleDelete = async (cat) => {
    const ok = await confirm(`Yakin ingin menghapus kategori "${cat.name}"? Data pengeluaran/pemasukan terkait mungkin terpengaruh.`, { title: 'Hapus Kategori Keuangan' });
    if (ok) {
      try {
        await api.delete(`/kuliner/admin/finance-categories/${cat.id}`);
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      } catch (e) {
        console.error(e);
        toast.error(e.response?.data?.message || 'Gagal menghapus kategori');
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const openNew = () => {
    setEditingItem(null);
    setForm({ name: '', type: filterType === 'income' ? 'income' : 'expense', is_active: true });
    setShowModal(true);
  };

  const filtered = categories.filter(c => filterType === 'all' ? true : c.type === filterType);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedCategories = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Master Kategori Keuangan</h1>
      </div>

      <div className="kd-content">
        <div className="kd-page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div className="kd-tabs" style={{ display: 'flex', gap: 8 }}>
            <button className={`kd-btn ${filterType === 'all' ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => { setFilterType('all'); setCurrentPage(1); }} style={{ height: 38, fontSize: 13, borderRadius: 8 }}>Semua</button>
            <button className={`kd-btn ${filterType === 'income' ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => { setFilterType('income'); setCurrentPage(1); }} style={{ height: 38, fontSize: 13, borderRadius: 8 }}>Pemasukan</button>
            <button className={`kd-btn ${filterType === 'expense' ? 'kd-btn-primary' : 'kd-btn-secondary'}`} onClick={() => { setFilterType('expense'); setCurrentPage(1); }} style={{ height: 38, fontSize: 13, borderRadius: 8 }}>Pengeluaran</button>
          </div>
          <button 
            className="kd-btn kd-btn-primary" 
            onClick={openNew}
            style={{ height: 38, padding: '0 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, background: '#B45309', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={18} /> Tambah Kategori
          </button>
        </div>

        <div className="kd-panel" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', padding: 0 }}>
          <div className="kd-table-container" style={{ overflowX: 'auto', marginBottom: 0, border: 'none', borderRadius: 0 }}>
            <table className="kd-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nama Kategori</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tipe</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>Memuat data kategori...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>Belum ada kategori keuangan.</td></tr>
                ) : (
                  paginatedCategories.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{cat.name}</td>
                      <td style={{ padding: '10px 16px' }}>
                        {cat.type === 'income' 
                          ? <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>Pemasukan</span>
                          : <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>Pengeluaran</span>
                        }
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12.5 }}>
                        {cat.is_active 
                          ? <span style={{ color: '#059669', fontWeight: 500 }}>Aktif</span> 
                          : <span style={{ color: '#94A3B8', fontWeight: 500 }}>Nonaktif</span>
                        }
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleEdit(cat)} 
                            title="Edit"
                            style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', cursor: 'pointer' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat)} 
                            title="Hapus"
                            style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', cursor: 'pointer' }}
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
          <ClientPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            totalItems={filtered.length}
          />
        </div>

        {/* MODAL TAMBAH / EDIT KATEGORI KEUANGAN */}
        {showModal && (
          <div 
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: 16
            }} 
            onClick={() => setShowModal(false)}
          >
            <div 
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: 24,
                width: '100%',
                maxWidth: 440,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                position: 'relative',
                animation: 'kd-fadeIn 0.2s ease'
              }} 
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                    <Tag size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {editingItem ? 'Edit Kategori Keuangan' : 'Tambah Kategori Baru'}
                    </h3>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                      {editingItem ? 'Perbarui informasi pos kategori keuangan' : 'Daftarkan pos pemasukan atau pengeluaran baru'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#F1F5F9', border: 'none', borderRadius: 8,
                    width: 32, height: 32, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748B', transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Tipe Kategori
                  </label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})} 
                    disabled={!!editingItem}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: 13.5,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: editingItem ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="expense">Pengeluaran (Expense)</option>
                    <option value="income">Pemasukan (Income)</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Nama Kategori <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                    placeholder="Contoh: Gaji Karyawan, Listrik & Air, Sewa Tempat"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: 13.5,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#B45309'}
                    onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                    <input 
                      type="checkbox" 
                      checked={form.is_active} 
                      onChange={e => setForm({...form, is_active: e.target.checked})} 
                      style={{ width: 16, height: 16, accentColor: '#B45309' }} 
                    />
                    Status Kategori Aktif
                  </label>
                </div>

                {/* Modal Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    style={{
                      height: 38,
                      padding: '0 16px',
                      borderRadius: 8,
                      background: '#F1F5F9',
                      color: '#475569',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={{
                      height: 38,
                      padding: '0 20px',
                      borderRadius: 8,
                      background: '#B45309',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {saving ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Kategori')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </KulinerAdminLayout>
  );
}
