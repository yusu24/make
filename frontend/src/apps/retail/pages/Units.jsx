import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2, Scale } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import EmptyTableState from '../../../components/EmptyTableState';

export default function Units() {
  const toast = useToast();
  const confirm = useConfirm();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState(null);
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
      {/* Page Title Handled by Navtop */}
      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-between items-center gap-3 flex-wrap">
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              placeholder="Cari satuan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <form onSubmit={addUnit} className="flex items-center gap-3">
             <div className="airy-input-wrapper" style={{ width: 280, margin: 0 }}>
                <input
                  name="name"
                  placeholder="Satuan baru (Pcs, Kg, dll)..."
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
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditingUnit(u)} title="Edit Satuan"><Edit3 size={14} /></button>
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
    </div>
  );
}
