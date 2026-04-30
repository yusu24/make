import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/Table';

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
          <h2 className="aq-page-title">Data master: Satuan pakan</h2>

        </div>
      </div>

      <div className="aquagrow-card" style={{ maxWidth: 800 }}>
        <div style={{ padding: 20, borderBottom: '1px solid var(--aq-border)', background: '#F8FAFC' }}>
          <h3 className="aq-section-title" style={{ fontSize: 16 }}>Daftar satuan aktif</h3>
        </div>
        <div style={{ padding: 20 }}>
          <form onSubmit={addUnit} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <input name="name" className="form-input" placeholder="Masukkan nama satuan baru..." required style={{flex: 1}}/>
            <button type="submit" className="btn btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
              Tambah Satuan
            </button>
          </form>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 36, height: 36, border: '3px solid #E9F0EC', borderTopColor: '#1B4332', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>Memuat data satuan...</p>
            </div>
          ) : (
            <div className="aq-table-container">
              <Table>
                <TableHeader>
                  <TableRow isHoverable={false}>
                    <TableHeaderCell style={{ width: 80 }}>ID</TableHeaderCell>
                    <TableHeaderCell>Nama satuan</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: 'right' }}>Aksi</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.length === 0 ? (
                    <TableRow><TableCell colSpan="3" style={{ textAlign: 'center', color: 'var(--aq-text-tertiary)', padding: 32 }}>Belum ada data satuan pakan.</TableCell></TableRow>
                  ) : (
                    units.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>#{u.id}</TableCell>
                        <TableCell style={{ fontWeight: 600 }}>{u.name}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingUnit(u)}>Edit</button>
                            <button className="btn btn-sm btn-ghost" onClick={() => confirm('Hapus satuan ini?') && console.log('Delete logic')}>Hapus</button>
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
