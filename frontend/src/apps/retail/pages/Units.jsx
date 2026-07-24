import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2 } from 'lucide-react';


export default function Units() {
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
    try { 
      await api.post('/retail/units', { name: fd.get('name') });
      fetchUnits();
      e.target.reset();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menambah satuan');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/retail/units/${editingUnit.id}`, { name: fd.get('name') });
      fetchUnits();
      setEditingUnit(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan perubahan satuan');
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
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
      </div>

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
             <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
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
               <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada data satuan.</td></tr>
            ) : (
              paginatedData.map(u => (
                <tr key={u.id}>
                  <td className="pl-6">
                    <span className="retail-text-secondary">#{u.id}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary">{u.name}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditingUnit(u)}><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { if(confirm('Hapus satuan ini?')) { await api.delete(`/retail/units/${u.id}`); fetchUnits(); } }}><Trash2 size={14} /></button>
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
