import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';

export default function FeedUnits() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState(null);

  const fetchUnits = async () => {
    try {
      const res = await api.get('/budidaya/feed-units');
      setUnits(res.data);
    } catch (e) {
      console.error(e);
      // Fallback
      setUnits([
        { id: 1, name: 'Kilogram (Kg)' },
        { id: 2, name: 'Karung (50Kg)' },
        { id: 3, name: 'Butiran (Pellet)' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUnits(); }, []);

  const addUnit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try { 
      await api.post('/budidaya/feed-units', { name: fd.get('name') }); 
      fetchUnits(); 
      e.target.reset(); 
    } catch (e) {
      alert('Gagal menambah satuan (Backend Migration Required)');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.put(`/budidaya/feed-units/${editingUnit.id}`, { name: fd.get('name') });
      fetchUnits();
      setEditingUnit(null);
    } catch (e) {}
  };

  return (
    <div className="animate-fade-in" style={{ padding: 24 }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h2 className="page-title">Data Master: Satuan Pakan</h2>
          <p className="page-sub">Kelola unit pengukuran stok pakan untuk akurasi pencatatan logistik.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Daftar Satuan Aktif</h3>
        </div>
        <div style={{ padding: 20 }}>
          <form onSubmit={addUnit} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input name="name" className="form-input" placeholder="Masukkan nama satuan baru..." required style={{flex: 1}}/>
            <button type="submit" className="btn btn-primary">Tambah Satuan</button>
          </form>
          
          {loading ? <p>Memuat...</p> : (
            <table className="table">
              <thead><tr><th style={{ width: 80 }}>ID</th><th>Nama Satuan</th><th style={{ textAlign: 'right' }}>Aksi</th></tr></thead>
              <tbody>
                {units.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Belum ada data satuan pakan.</td></tr>
                ) : (
                  units.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => setEditingUnit(u)}>Edit</button>
                          <button className="btn btn-sm btn-ghost" onClick={() => confirm('Hapus satuan ini?') && console.log('Delete logic')}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={!!editingUnit} 
        onClose={() => setEditingUnit(null)}
        title="Edit Satuan Pakan"
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
