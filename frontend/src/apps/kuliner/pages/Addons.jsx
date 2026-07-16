import React, { useEffect, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const emptyForm = { name: '', price: '' };

export default function Addons() {
  const toast = useToast();
  const confirm = useConfirm();

  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/kuliner/admin/addons').then((r) => setAddons(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a) => { setEditingItem(a); setForm({ name: a.name, price: a.price }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/addons/${editingItem.id}`, form);
        toast.success('Add-on diperbarui');
      } else {
        await api.post('/kuliner/admin/addons', form);
        toast.success('Add-on ditambahkan');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan add-on');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    const ok = await confirm(`Hapus add-on "${a.name}"?`, { title: 'Hapus Add-on' });
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/addons/${a.id}`);
      toast.success('Add-on dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus add-on');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Add-on / Topping</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>+ Tambah Add-on</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Harga Tambahan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-10 text-slate-400">Memuat add-on...</td></tr>
                ) : addons.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-10 text-slate-400">Belum ada add-on.</td></tr>
                ) : (
                  addons.map((a) => (
                    <tr key={a.id}>
                      <td><div className="kd-menu-name">{a.name}</div></td>
                      <td>+Rp {Number(a.price).toLocaleString('id-ID')}</td>
                      <td className="text-right">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="kd-icon-btn" title="Edit" onClick={() => openEdit(a)}><Edit3 size={16} /></button>
                          <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(a)}><Trash2 size={16} /></button>
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
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Tambah'} Add-on</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nama (contoh: Extra Shot, Boba, Cheese Foam)</label>
                  <input required className="kd-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Harga Tambahan (Rp)</label>
                  <input required type="number" min="0" className="kd-form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
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
