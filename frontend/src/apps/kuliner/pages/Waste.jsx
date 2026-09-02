import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import ClientPagination from '../components/ClientPagination';
import './KulinerDashboard.css';

const REASON_LABEL = { expired: 'Kadaluarsa', damaged: 'Rusak', other: 'Lainnya' };
const emptyForm = { ingredient_id: '', quantity: '', reason: 'expired', waste_date: new Date().toISOString().slice(0, 10), note: '' };

export default function Waste() {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [wastes, setWastes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(wastes.length / itemsPerPage);
  const currentWastes = wastes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      toast.success(t('kulinerInventory.alertSaveSuccess'));
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat waste');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (w) => {
    const ok = await confirm(`${t('kulinerInventory.deleteConfirm')} "${w.ingredient?.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/wastes/${w.id}`);
      toast.success(t('kulinerInventory.alertDeleteSuccess'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const formatRp = (v) => `Rp ${Math.round(Number(v || 0)).toLocaleString('id-ID')}`;

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerInventory.wasteTitle')}</h1>
      </div>
      <div className="kd-content">
        <div className="kd-panel" style={{ padding: 20, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>Total Kerugian (halaman ini)</span>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{formatRp(totalLoss)}</div>
        </div>

        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>{t('kulinerInventory.addWasteBtn')}</button>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>{t('kulinerInventory.headerWasteDate')}</th>
                  <th>{t('kulinerInventory.headerWasteItem')}</th>
                  <th>{t('kulinerInventory.headerWasteQty')}</th>
                  <th>{t('kulinerInventory.headerWasteReason')}</th>
                  <th>{t('kulinerInventory.headerWasteCost')}</th>
                  <th className="text-right">{t('kulinerInventory.headerAction')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">{t('kulinerInventory.loadingWaste')}</td></tr>
                ) : wastes.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-10 text-slate-400">{t('kulinerInventory.emptyWaste')}</td></tr>
                ) : (
                  currentWastes.map((w) => (
                    <tr key={w.id}>
                      <td>{new Date(w.waste_date).toLocaleDateString('id-ID')}</td>
                      <td><div style={{ color: '#1e293b' }}>{w.ingredient?.name}</div></td>
                      <td>{w.quantity} {w.ingredient?.unit}</td>
                      <td>{REASON_LABEL[w.reason] || w.reason}</td>
                      <td style={{ color: '#000', fontWeight: 700 }}>{formatRp(w.value_lost)}</td>
                      <td className="text-right">
                        <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(w)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ClientPagination setItemsPerPage={setItemsPerPage} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={wastes.length}
          />
        </div>
      </div>

      {showModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
          <div className="kd-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{t('kulinerInventory.addWasteModalTitle')}</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerInventory.formWasteTypeBahan')}</label>
                  <select required className="kd-form-select" value={form.ingredient_id} onChange={(e) => setForm({ ...form, ingredient_id: e.target.value })}>
                    <option value="">{t('kulinerInventory.formWasteItem')}</option>
                    {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                  </select>
                </div>
                <div className="kd-form-row">
                  <div className="kd-form-group">
                    <label className="kd-form-label">{t('kulinerInventory.formWasteQty')}</label>
                    <input required type="number" step="0.01" min="0.01" className="kd-form-input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">{t('kulinerInventory.formWasteReason')}</label>
                    <select className="kd-form-select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                      <option value="expired">Kadaluarsa</option>
                      <option value="damaged">Rusak</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerInventory.formWasteDate')}</label>
                  <input required type="date" className="kd-form-input" value={form.waste_date} onChange={(e) => setForm({ ...form, waste_date: e.target.value })} />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Catatan (opsional)</label>
                  <textarea rows="2" className="kd-form-textarea" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>{t('kulinerInventory.cancel')}</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? t('kulinerInventory.savingBtn') : t('kulinerInventory.saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
