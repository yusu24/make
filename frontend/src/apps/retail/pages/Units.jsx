import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import { Edit3, Trash2 } from 'lucide-react';


export default function Units() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState(null);

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
    } catch (e) {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/retail/units/${editingUnit.id}`, { name: fd.get('name') });
      fetchUnits();
      setEditingUnit(null);
    } catch (e) {}
  };

  return (
    <div className="retail-page-classic">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Data Master: Satuan Barang</h2>
          <p className="page-sub">Kelola satuan (Unit) untuk standarisasi stok dan transaksi.</p>
        </div>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Daftar Satuan Aktif</h3>
          </div>
          <form onSubmit={addUnit} className="flex items-center gap-3 w-full md:w-auto">
             <div className="airy-search-wrapper" style={{ width: 280 }}>
                <input 
                  name="name"
                  placeholder="Satuan baru (Pcs, Kg, dll)..."
                  required
                />
             </div>
             <button type="submit" className="btn btn-primary h-[42px] px-6">
                Tambah
             </button>
          </form>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6" style={{ width: 100 }}>ID</th>
              <th>Nama Satuan</th>
              <th className="text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="3" className="py-20 text-center text-slate-400 font-800">Menyinkronkan Satuan...</td></tr>
            ) : units.length === 0 ? (
               <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada data satuan.</td></tr>
            ) : (
              units.map(u => (
                <tr key={u.id}>
                  <td className="pl-6">
                    <span className="text-slate-400">#{u.id}</span>
                  </td>
                  <td>
                    <span className="text-slate-800">{u.name}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditingUnit(u)}><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-600)' }} onClick={async () => { if(confirm('Hapus satuan ini?')) { await api.delete(`/retail/units/${u.id}`); fetchUnits(); } }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
