import React, { useEffect, useRef, useState } from 'react';
import { History, Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import useServerTable from '../../../hooks/useServerTable';
import ServerPagination from '../../../components/ServerPagination';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const emptyForm = { name: '', code: '', category: '', unit: '', supplier_id: '', last_price: '', min_stock: '', stock: '' };

export default function BahanBaku() {
  const toast = useToast();
  const confirm = useConfirm();
  const fileInputRef = useRef(null);

  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [movementsFor, setMovementsFor] = useState(null);
  const [movements, setMovements] = useState([]);

  const table = useServerTable(
    (params) => api.get('/kuliner/admin/ingredients', { params }),
    { initialSort: 'name' }
  );

  useEffect(() => {
    api.get('/kuliner/admin/suppliers').then((r) => setSuppliers(r.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name, code: item.code || '', category: item.category || '',
      unit: item.unit, supplier_id: item.supplier_id || '',
      last_price: item.last_price, min_stock: item.min_stock, stock: item.stock,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, supplier_id: form.supplier_id || null };
      if (editingItem) {
        delete payload.stock; // stock is only changed via adjust-stock, not direct edit
        await api.put(`/kuliner/admin/ingredients/${editingItem.id}`, payload);
        toast.success('Bahan baku diperbarui');
      } else {
        await api.post('/kuliner/admin/ingredients', payload);
        toast.success('Bahan baku ditambahkan');
      }
      setShowModal(false);
      table.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan bahan baku');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`Hapus bahan baku "${item.name}"? Tindakan ini tidak bisa dibatalkan.`, { title: 'Hapus Bahan Baku' });
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/ingredients/${item.id}`);
      toast.success('Bahan baku dihapus');
      table.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus bahan baku');
    }
  };

  const openMovements = async (item) => {
    setMovementsFor(item);
    try {
      const res = await api.get(`/kuliner/admin/ingredients/${item.id}/movements`);
      setMovements(res.data.data || []);
    } catch {
      toast.error('Gagal memuat riwayat stok');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/kuliner/admin/ingredients-export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bahan-baku.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Gagal mengekspor data');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/kuliner/admin/ingredients-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const s = res.data.summary;
      toast.success(`Import selesai: ${s.created} baru, ${s.updated} diperbarui`);
      table.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal import file');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Bahan Baku</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions" style={{ flexWrap: 'wrap', gap: 10 }}>
          <input
            className="kd-form-input"
            style={{ maxWidth: 260 }}
            placeholder="Cari nama atau kode..."
            value={table.search}
            onChange={(e) => table.setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="kd-btn kd-btn-secondary" onClick={handleExport}>⬇ Export Excel</button>
            <button className="kd-btn kd-btn-secondary" onClick={() => fileInputRef.current?.click()}>⬆ Import Excel</button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleImport} />
            <button className="kd-btn kd-btn-primary" onClick={openCreate}>+ Tambah Bahan Baku</button>
          </div>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th onClick={() => table.toggleSort('name')} style={{ cursor: 'pointer' }}>Nama {table.sortBy === 'name' ? (table.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th>Kategori</th>
                  <th>Supplier</th>
                  <th onClick={() => table.toggleSort('stock')} style={{ cursor: 'pointer' }}>Stok {table.sortBy === 'stock' ? (table.sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => table.toggleSort('last_price')} style={{ cursor: 'pointer' }}>Harga Terakhir</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {table.loading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Memuat bahan baku...</td></tr>
                ) : table.rows.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada bahan baku.</td></tr>
                ) : (
                  table.rows.map((ing) => (
                    <tr key={ing.id}>
                      <td>
                        <div className="kd-menu-name">{ing.name}</div>
                        {ing.code && <div className="text-[10px] text-slate-400">{ing.code}</div>}
                      </td>
                      <td>{ing.category || '-'}</td>
                      <td>{ing.supplier?.name || '-'}</td>
                      <td>
                        <span className={`kd-status-badge ${ing.is_low_stock ? 'kd-status-hidden' : 'kd-status-active'}`}>
                          {Number(ing.stock).toLocaleString('id-ID')} {ing.unit}
                        </span>
                      </td>
                      <td>{formatRp(ing.last_price)}</td>
                      <td className="text-right">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="kd-icon-btn" title="Riwayat" onClick={() => openMovements(ing)}><History size={16} /></button>
                          <button className="kd-icon-btn" title="Edit" onClick={() => openEdit(ing)}><Edit3 size={16} /></button>
                          <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(ing)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ServerPagination meta={table.meta} page={table.page} setPage={table.setPage} perPage={table.perPage} setPerPage={table.setPerPage} />
        </div>
      </div>

      {showModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Tambah'} Bahan Baku</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-row">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Nama</label>
                    <input required className="kd-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Kode (opsional)</label>
                    <input className="kd-form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  </div>
                </div>
                <div className="kd-form-row">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Kategori</label>
                    <input className="kd-form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Satuan</label>
                    <input required className="kd-form-input" placeholder="gram, ml, pcs" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                  </div>
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Supplier</label>
                  <select className="kd-form-select" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
                    <option value="">- Tidak ada -</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="kd-form-row">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Harga Terakhir (Rp)</label>
                    <input type="number" min="0" className="kd-form-input" value={form.last_price} onChange={(e) => setForm({ ...form, last_price: e.target.value })} />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Stok Minimum</label>
                    <input type="number" min="0" className="kd-form-input" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
                  </div>
                  {!editingItem && (
                    <div className="kd-form-group">
                      <label className="kd-form-label">Stok Awal</label>
                      <input type="number" min="0" className="kd-form-input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {movementsFor && (
        <div className="kd-modal-overlay visible" onClick={() => setMovementsFor(null)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">Riwayat Stok — {movementsFor.name}</h2>
              <button className="kd-close-btn" onClick={() => setMovementsFor(null)}>✕</button>
            </div>
            <div className="kd-modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {movements.length === 0 ? (
                <p className="text-center text-slate-400 py-6">Belum ada riwayat pergerakan stok.</p>
              ) : (
                movements.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.type} — {m.quantity > 0 ? '+' : ''}{m.quantity}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.note}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
                      {new Date(m.created_at).toLocaleString('id-ID')}<br />
                      {m.quantity_before} → {m.quantity_after}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
