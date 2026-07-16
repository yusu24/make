import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const REASON_LABEL = { expired: 'Kadaluarsa', damaged: 'Rusak', other: 'Lainnya' };
const emptyForm = { ingredient_id: '', quantity: '', reason: 'expired', waste_date: new Date().toISOString().slice(0, 10), note: '' };

export default function Waste() {
  const toast = useToast();
  const confirm = useConfirm();

  const [wastes, setWastes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/kuliner/admin/wastes').then((r) => setWastes(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/kuliner/admin/ingredients', { params: { per_page: 100 } }).then((r) => setIngredients(r.data.data || []));
  }, []);

  const totalLoss = wastes.reduce((sum, w) => sum + Number(w.value_lost || 0), 0);

  const openCreate = () => { setForm(emptyForm); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/kuliner/admin/wastes', form);
      toast.success('Waste tercatat, stok otomatis berkurang');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat waste');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (w) => {
    const ok = await confirm(`Hapus catatan waste "${w.ingredient?.name}"? Stok akan dikembalikan.`, { title: 'Hapus Catatan Waste' });
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/wastes/${w.id}`);
      toast.success('Catatan waste dihapus, stok dikembalikan');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Waste Management</h1>
      </div>
      <div className="kd-content">
        <div className="kd-panel" style={{ padding: 20, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>Total Kerugian (halaman ini)</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{formatRp(totalLoss)}</div>
        </div>

        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>+ Catat Waste</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Bahan Baku</th>
                  <th>Jumlah</th>
                  <th>Alasan</th>
                  <th>Nilai Kerugian</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Memuat...</td></tr>
                ) : wastes.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">Belum ada catatan waste.</td></tr>
                ) : (
                  wastes.map((w) => (
                    <tr key={w.id}>
                      <td>{new Date(w.waste_date).toLocaleDateString('id-ID')}</td>
                      <td><div className="kd-menu-name">{w.ingredient?.name}</div></td>
                      <td>{w.quantity} {w.ingredient?.unit}</td>
                      <td>{REASON_LABEL[w.reason] || w.reason}</td>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>{formatRp(w.value_lost)}</td>
                      <td className="text-right">
                        <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(w)}><Trash2 size={16} /></button>
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
              <h2 className="kd-modal-title">Catat Waste</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Bahan Baku</label>
                  <select required className="kd-form-select" value={form.ingredient_id} onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}>
                    <option value="">Pilih bahan baku</option>
                    {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                  </select>
                </div>
                <div className="kd-form-row">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Jumlah</label>
                    <input required type="number" step="0.01" min="0.01" className="kd-form-input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Alasan</label>
                    <select className="kd-form-select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                      <option value="expired">Kadaluarsa</option>
                      <option value="damaged">Rusak</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Tanggal</label>
                  <input required type="date" className="kd-form-input" value={form.waste_date} onChange={(e) => setForm({ ...form, waste_date: e.target.value })} />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Catatan (opsional)</label>
                  <textarea rows="2" className="kd-form-textarea" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
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
