import React, { useEffect, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const emptyOption = () => ({ name: '', price_delta: 0, is_default: false });
const emptyGroup = { name: '', is_required: false, options: [emptyOption()] };

export default function Modifiers() {
  const toast = useToast();
  const confirm = useConfirm();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState(emptyGroup);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/kuliner/admin/modifier-groups').then((r) => setGroups(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditingGroup(null); setForm(emptyGroup); setShowModal(true); };
  const openEdit = (g) => {
    setEditingGroup(g);
    setForm({
      name: g.name,
      is_required: g.is_required,
      options: g.options.length ? g.options.map((o) => ({ id: o.id, name: o.name, price_delta: o.price_delta, is_default: o.is_default })) : [emptyOption()],
    });
    setShowModal(true);
  };

  const addOptionRow = () => setForm((f) => ({ ...f, options: [...f.options, emptyOption()] }));
  const removeOptionRow = (idx) => setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  const updateOption = (idx, key, value) => setForm((f) => ({
    ...f,
    options: f.options.map((o, i) => (i === idx ? { ...o, [key]: value } : o)),
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGroup) {
        await api.put(`/kuliner/admin/modifier-groups/${editingGroup.id}`, form);
        toast.success('Modifier diperbarui');
      } else {
        await api.post('/kuliner/admin/modifier-groups', form);
        toast.success('Modifier ditambahkan');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan modifier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g) => {
    const ok = await confirm(`Hapus grup modifier "${g.name}"?`, { title: 'Hapus Modifier' });
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/modifier-groups/${g.id}`);
      toast.success('Modifier dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus modifier');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Modifier Menu</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>+ Tambah Grup Modifier</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Nama Grup</th>
                  <th>Wajib?</th>
                  <th>Pilihan</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Memuat modifier...</td></tr>
                ) : groups.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Belum ada modifier.</td></tr>
                ) : (
                  groups.map((g) => (
                    <tr key={g.id}>
                      <td><div className="kd-menu-name">{g.name}</div></td>
                      <td>
                        <span className={`kd-status-badge ${g.is_required ? 'kd-status-active' : 'kd-status-hidden'}`}>
                          {g.is_required ? 'Wajib' : 'Opsional'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {g.options.map((o) => `${o.name} (${o.price_delta > 0 ? '+' : ''}${Number(o.price_delta).toLocaleString('id-ID')})`).join(', ')}
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="kd-icon-btn" title="Edit" onClick={() => openEdit(g)}><Edit3 size={16} /></button>
                          <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(g)}><Trash2 size={16} /></button>
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
              <h2 className="kd-modal-title">{editingGroup ? 'Edit' : 'Tambah'} Grup Modifier</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nama Grup (contoh: Ice Level, Sugar Level, Size)</label>
                  <input required className="kd-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })} />
                  <label className="kd-form-label" style={{ margin: 0 }}>Wajib dipilih saat kasir memproses transaksi</label>
                </div>

                <p style={{ fontWeight: 700, fontSize: 12, marginTop: 16, marginBottom: 8 }}>PILIHAN</p>
                {form.options.map((o, idx) => (
                  <div key={idx} className="kd-form-row" style={{ alignItems: 'center', marginBottom: 8 }}>
                    <input className="kd-form-input" placeholder="Nama pilihan" value={o.name} onChange={(e) => updateOption(idx, 'name', e.target.value)} />
                    <input type="number" className="kd-form-input" placeholder="Tambahan harga" value={o.price_delta} onChange={(e) => updateOption(idx, 'price_delta', e.target.value)} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={o.is_default} onChange={(e) => updateOption(idx, 'is_default', e.target.checked)} /> Default
                    </label>
                    <button type="button" className="kd-btn kd-btn-secondary text-red-500" onClick={() => removeOptionRow(idx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="kd-btn kd-btn-secondary" onClick={addOptionRow}>+ Tambah Pilihan</button>
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
