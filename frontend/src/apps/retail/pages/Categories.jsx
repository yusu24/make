import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2, Plus, Search, Tag, RefreshCw } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/retail/categories');
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
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await api.post('/retail/categories', { name: newName.trim() });
      fetchCategories();
      setNewName('');
      setShowAddModal(false);
    } catch (e) {}
    finally { setAdding(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/retail/categories/${editingCategory.id}`, { name: fd.get('name') });
      fetchCategories();
      setEditingCategory(null);
    } catch (e) {}
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages, totalItems,
    paginatedData, startIndex, endIndex
  } = usePagination(filteredCategories);

  return (
    <div className="retail-page-classic">

      {/* ── Table card ── */}
      <div className="card table-wrap animate-fade-in">

        {/* Toolbar — responsive */}
        <div className="toolbar-no-stack" style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid var(--retail-border, #e2e8f0)',
        }}>
          {/* Add button */}
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Kategori</span>
          </button>

          {/* Search */}
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari kategori..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchCategories}
            className="btn-reset-sync"
            style={{ width: 42, height: 42, flexShrink: 0 }}
            title="Segarkan Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <div className="retail-table-responsive"><table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header" style={{ width: 80 }}>ID</th>
                <th className="retail-table-header">Nama Kategori</th>
                <th className="text-right pr-6 retail-table-header" style={{ width: 100 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <RetailTableLoadingRow colSpan={3} text="Menyinkronkan Kategori..." />
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--retail-text-secondary)' }}>
                      <Tag size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                      <p style={{ margin: 0 }}>
                        {search ? `Tidak ada kategori dengan nama "${search}"` : 'Belum ada kategori. Tambah sekarang!'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map(c => (
                  <tr key={c.id}>
                    <td className="pl-6">
                      <span className="retail-text-secondary" style={{ fontSize: 13 }}>#{c.id}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: 'var(--retail-primary-light, #ede9fe)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Tag size={14} color="var(--retail-primary, #6366f1)" />
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--retail-text-primary)' }}>
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="pr-6" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          title="Edit"
                          onClick={() => setEditingCategory(c)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          title="Hapus"
                          style={{ color: 'var(--danger-600)' }}
                          onClick={async () => {
                            if (confirm('Hapus kategori ini?')) {
                              await api.delete(`/retail/categories/${c.id}`);
                              fetchCategories();
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>

        <RetailPagination
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          pageSize={pageSize} setPageSize={setPageSize}
          totalPages={totalPages} totalItems={totalItems}
          startIndex={startIndex} endIndex={endIndex}
        />
      </div>

      {/* ── Modal Tambah ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setNewName(''); }}
        title="Tambah Kategori Baru"
      >
        <form onSubmit={addCategory} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Kategori</label>
            <input
              className="form-input"
              placeholder="cth. Minuman, Makanan Ringan..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setShowAddModal(false); setNewName(''); }}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Menyimpan...' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Edit ── */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Kategori"
      >
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Kategori</label>
            <input
              name="name"
              className="form-input"
              defaultValue={editingCategory?.name}
              required
              autoFocus
            />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
