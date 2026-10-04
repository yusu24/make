import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import StatScoreCard from '@/components/ui/StatScoreCard';
import EmptyTableState from '../../../components/EmptyTableState';
import RetailImportModal from '../components/RetailImportModal';
import { Pencil, Trash2, Plus, Search, Tag, RefreshCw, FolderTree, Layers, Upload } from '@/constants/icons';

export default function Categories() {
  const toast = useToast();
  const confirm = useConfirm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
      toast.success('Kategori baru berhasil ditambahkan');
      fetchCategories();
      setNewName('');
      setShowAddModal(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menambah kategori');
    }
    finally { setAdding(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/retail/categories/${editingCategory.id}`, { name: fd.get('name') });
      toast.success('Kategori berhasil diperbarui');
      fetchCategories();
      setEditingCategory(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan perubahan kategori');
    }
  };

  const handleDelete = async (category) => {
    const ok = await confirm(`Hapus kategori "${category.name}"? Produk dalam kategori ini akan menjadi unassigned.`, {
      title: 'Hapus Kategori',
      confirmLabel: 'Ya, Hapus',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/retail/categories/${category.id}`);
      toast.success('Kategori berhasil dihapus');
      fetchCategories();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus kategori');
    }
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatScoreCard
          title="Total Kategori"
          value={categories.length}
          suffix=" Kategori"
          subtitle="Grup pengelompokan produk aktif"
          icon={FolderTree}
          badgeText="Struktur"
          badgeVariant="indigo"
          progress={100}
          progressVariant="indigo"
        />
        <StatScoreCard
          title="Status Klasifikasi"
          value="100%"
          subtitle="Semua kategori siap dipetakan ke produk"
          icon={Layers}
          badgeText="Terverifikasi"
          badgeVariant="emerald"
          progress={100}
          progressVariant="emerald"
        />
        <StatScoreCard
          title="Hasil Pencarian"
          value={filteredCategories.length}
          suffix=" Kategori"
          subtitle="Sesuai filter kata kunci pencarian"
          icon={Tag}
          badgeText={search ? "Filtered" : "Semua"}
          badgeVariant={search ? "blue" : "slate"}
          progress={categories.length > 0 ? Math.min(100, Math.round((filteredCategories.length / categories.length) * 100)) : 100}
          progressVariant="blue"
        />
      </div>

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
            title="Tambah Kategori"
            type="button"
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all shrink-0 cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} className="mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Kategori</span>
          </button>

          {/* Import button */}
          <button
            title="Import Excel"
            type="button"
            onClick={() => setShowImportModal(true)}
            className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Upload size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="btn-text-mobile-hide">Import</span>
          </button>

          {/* Search */}
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
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
            style={{ width: 38, height: 38, flexShrink: 0 }}
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
                <EmptyTableState
                  colSpan={3}
                  icon={Layers}
                  title="Belum ada kategori"
                  description={search ? `Tidak ada kategori yang cocok dengan pencarian "${search}".` : "Tambahkan kategori produk untuk mengelompokkan barang dagangan toko Anda."}
                  actionLabel={search ? "Reset Pencarian" : "Tambah Kategori"}
                  onAction={() => {
                    if (search) {
                      setSearch('');
                    } else {
                      setShowAddModal(true);
                    }
                  }}
                />
              ) : (
                paginatedData.map(c => (
                  <tr key={c.id}>
                    <td className="pl-6">
                      <span className="retail-text-primary" style={{ fontSize: 13 }}>#{c.id}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--retail-text-primary)' }}>
                        {c.name}
                      </span>
                    </td>
                    <td className="pr-6" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-sm btn-ghost"
                          title="Edit"
                          onClick={() => setEditingCategory(c)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          title="Hapus"
                          style={{ color: 'var(--danger-600)' }}
                          onClick={() => handleDelete(c)}
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

      {/* ── Modal Import Excel ── */}
      <RetailImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Kategori Produk"
        entityName="Kategori"
        templateEndpoint="/retail/categories/template"
        importEndpoint="/retail/categories/import"
        onSuccess={fetchCategories}
        sampleFields={['Nama Kategori']}
      />
    </div>
  );
}
