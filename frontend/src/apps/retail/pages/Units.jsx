import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import EmptyTableState from '../../../components/EmptyTableState';
import StatScoreCard from '@/components/ui/StatScoreCard';
import RetailImportModal from '../components/RetailImportModal';
import { Pencil, Trash2, Scale, RefreshCw, Upload, Plus } from '@/constants/icons';

export default function Units() {
  const toast = useToast();
  const confirm = useConfirm();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUnits = async () => {
    try {
      const res = await api.get('/retail/units');
      setUnits(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUnits(); }, []);

  const addUnit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    if (!name) return;
    try { 
      await api.post('/retail/units', { name });
      toast.success(`Satuan "${name}" berhasil ditambahkan`);
      fetchUnits();
      e.target.reset();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menambah satuan');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    try { 
      await api.put(`/retail/units/${editingUnit.id}`, { name });
      toast.success('Perubahan satuan berhasil disimpan');
      fetchUnits();
      setEditingUnit(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan perubahan satuan');
    }
  };

  const filteredUnits = units.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredUnits);

  return (
    <div className="retail-page-classic">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatScoreCard
          title="Total Satuan Ukur"
          value={units.length}
          suffix=" Unit"
          subtitle="Standar pengukuran unit barang"
          icon={Scale}
          badgeText="Metrik"
          badgeVariant="indigo"
          progress={100}
          progressVariant="indigo"
        />
        <StatScoreCard
          title="Standarisasi Kuantitas"
          value="100%"
          subtitle="Seluruh satuan aktif dapat digunakan"
          icon={Scale}
          badgeText="Siap Pakai"
          badgeVariant="emerald"
          progress={100}
          progressVariant="emerald"
        />
        <StatScoreCard
          title="Hasil Pencarian"
          value={filteredUnits.length}
          suffix=" Unit"
          subtitle="Sesuai kata kunci pencarian"
          icon={Scale}
          badgeText={search ? "Filtered" : "Semua"}
          badgeVariant={search ? "blue" : "slate"}
          progress={units.length > 0 ? Math.min(100, Math.round((filteredUnits.length / units.length) * 100)) : 100}
          progressVariant="blue"
        />
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
              <input
                placeholder="Cari satuan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchUnits} className="btn-reset-sync" style={{ width: 38, height: 38, flexShrink: 0 }} title="Segarkan Data">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              title="Import Excel"
              type="button"
              onClick={() => setShowImportModal(true)}
              className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Upload size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="btn-text-mobile-hide">Import</span>
            </button>
          </div>
          <form onSubmit={addUnit} className="flex items-center gap-3">
             <div className="airy-input-wrapper" style={{ width: 280, margin: 0 }}>
                <input
                  name="name"
                  placeholder="Satuan baru (Pcs, Kg, dll)..."
                  required
                />
             </div>
             <button
               type="submit"
               className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all shrink-0 cursor-pointer whitespace-nowrap"
             >
                <Plus size={15} className="mobile-no-margin" />
                <span>Tambah</span>
             </button>
          </form>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header" style={{ width: 100 }}>ID</th>
              <th className="retail-table-header">Nama Satuan</th>
              <th className="text-right pr-6 retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <RetailTableLoadingRow colSpan={3} text="Menyinkronkan Satuan..." />
            ) : filteredUnits.length === 0 ? (
                <EmptyTableState
                  colSpan={3}
                  icon={Scale}
                  title="Belum ada data satuan"
                  description={search ? `Tidak ada satuan yang cocok dengan pencarian "${search}".` : "Tambahkan satuan unit seperti Pcs, Box, Kg, atau Liter."}
                  actionLabel={search ? "Reset Pencarian" : null}
                  onAction={() => setSearch('')}
                />
            ) : (
              paginatedData.map(u => (
                <tr key={u.id}>
                  <td className="pl-6">
                    <span className="retail-text-primary">#{u.id}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary">{u.name}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditingUnit(u)} title="Edit Satuan"><Pencil size={14} /></button>
                      <button
                        className="btn btn-sm btn-ghost retail-text-danger"
                        title="Hapus Satuan"
                        onClick={async () => {
                          const ok = await confirm(`Hapus satuan "${u.name}"?`, {
                            title: 'Hapus Satuan',
                            confirmLabel: 'Ya, Hapus',
                            danger: true
                          });
                          if (ok) {
                            try {
                              await api.delete(`/retail/units/${u.id}`);
                              toast.success(`Satuan "${u.name}" berhasil dihapus`);
                              fetchUnits();
                            } catch (e) {
                              toast.error(e.response?.data?.message || 'Gagal menghapus satuan');
                            }
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
        isOpen={!!editingUnit} 
        onClose={() => setEditingUnit(null)}
        title="Edit Satuan"
      >
        <form onSubmit={handleUpdate} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Satuan</label>
            <input name="name" className="form-input" defaultValue={editingUnit?.name} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditingUnit(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Import Excel ── */}
      <RetailImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Satuan Barang"
        entityName="Satuan"
        templateEndpoint="/retail/units/template"
        importEndpoint="/retail/units/import"
        onSuccess={fetchUnits}
        sampleFields={['Nama Satuan (Pcs, Botol, Dus, Kg, dll)']}
      />
    </div>
  );
}
