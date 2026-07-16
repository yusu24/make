import React, { useEffect, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const emptyForm = { name: '', description: '', bundle_price: '', items: [{ product_id: '', quantity: 1 }] };

export default function Bundles() {
  const toast = useToast();
  const confirm = useConfirm();

  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/kuliner/admin/bundles').then((r) => setBundles(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/kuliner/admin/products').then((r) => setProducts(r.data));
  }, []);

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b) => {
    setEditingItem(b);
    setForm({
      name: b.name, description: b.description || '', bundle_price: b.bundle_price,
      items: b.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    });
    setShowModal(true);
  };

  const addRow = () => setForm((f) => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }));
  const removeRow = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateRow = (idx, key, value) => setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)) }));

  const normalTotal = form.items.reduce((sum, it) => {
    const p = products.find((pr) => String(pr.id) === String(it.product_id));
    return sum + (p ? Number(p.price) * Number(it.quantity || 0) : 0);
  }, 0);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, items: form.items.filter((i) => i.product_id && i.quantity) };
      if (editingItem) {
        await api.put(`/kuliner/admin/bundles/${editingItem.id}`, payload);
        toast.success('Bundle diperbarui');
      } else {
        await api.post('/kuliner/admin/bundles', payload);
        toast.success('Bundle ditambahkan');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b) => {
    const ok = await confirm(`Hapus paket "${b.name}"?`, { title: 'Hapus Paket' });
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/bundles/${b.id}`);
      toast.success('Paket dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus paket');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Paket / Bundle Menu</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>+ Tambah Paket</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Nama Paket</th>
                  <th>Isi</th>
                  <th>Harga Paket</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Memuat paket...</td></tr>
                ) : bundles.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Belum ada paket bundle.</td></tr>
                ) : (
                  bundles.map((b) => (
                    <tr key={b.id}>
                      <td><div className="kd-menu-name">{b.name}</div></td>
                      <td style={{ fontSize: 12 }}>{b.items.map((i) => `${i.product?.name} x${i.quantity}`).join(', ')}</td>
                      <td>Rp {Number(b.bundle_price).toLocaleString('id-ID')}</td>
                      <td className="text-right">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="kd-icon-btn" title="Edit" onClick={() => openEdit(b)}><Edit3 size={16} /></button>
                          <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(b)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Tambah'} Paket</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nama Paket</label>
                  <input required className="kd-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Deskripsi</label>
                  <textarea rows="2" className="kd-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <p style={{ fontWeight: 700, fontSize: 12, marginTop: 12, marginBottom: 8 }}>ISI PAKET</p>
                {form.items.map((it, idx) => (
                  <div key={idx} className="kd-form-row" style={{ alignItems: 'center', marginBottom: 8 }}>
                    <select className="kd-form-select" value={it.product_id} onChange={(e) => updateRow(idx, 'product_id', e.target.value)}>
                      <option value="">Pilih menu</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Rp {Number(p.price).toLocaleString('id-ID')})</option>)}
                    </select>
                    <input type="number" min="1" className="kd-form-input" value={it.quantity} onChange={(e) => updateRow(idx, 'quantity', e.target.value)} />
                    <button type="button" className="kd-btn kd-btn-secondary text-red-500" onClick={() => removeRow(idx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="kd-btn kd-btn-secondary" onClick={addRow}>+ Tambah Menu</button>

                <div className="kd-form-group" style={{ marginTop: 16 }}>
                  <label className="kd-form-label">Harga Paket (Rp)</label>
                  <input required type="number" min="0" className="kd-form-input" value={form.bundle_price} onChange={(e) => setForm({ ...form, bundle_price: e.target.value })} />
                  {normalTotal > 0 && (
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      Harga normal jika dibeli satuan: Rp {normalTotal.toLocaleString('id-ID')}
                      {form.bundle_price > 0 && Number(form.bundle_price) < normalTotal && (
                        <span style={{ color: '#10b981', fontWeight: 700 }}> (hemat Rp {(normalTotal - form.bundle_price).toLocaleString('id-ID')})</span>
                      )}
                    </p>
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
    </KulinerAdminLayout>
  );
}
