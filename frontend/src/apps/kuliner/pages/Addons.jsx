import React, { useEffect, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import ClientPagination from '../components/ClientPagination';
import CurrencyInput from '../../../components/CurrencyInput';
import './KulinerDashboard.css';

const emptyForm = { name: '', price: '' };

export default function Addons() {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(addons.length / itemsPerPage);
  const currentAddons = addons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        toast.success(t('kulinerExtra.alertSaveSuccess'));
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
    const ok = await confirm(`${t('kulinerExtra.deleteConfirm')} "${a.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/addons/${a.id}`);
      toast.success(t('kulinerExtra.alertDeleteSuccess'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus add-on');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerExtra.addonsTitle')}</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>{t('kulinerExtra.addAddonBtn')}</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>{t('kulinerExtra.headerAddonName')}</th>
                  <th>{t('kulinerExtra.headerPrice')}</th>
                  <th className="text-right">{t('kulinerExtra.headerAction')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-10 text-slate-400">{t('kulinerExtra.loadingData')}</td></tr>
                ) : addons.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-10 text-slate-400">{t('kulinerExtra.emptyAddon')}</td></tr>
                ) : (
                  currentAddons.map((a) => (
                    <tr key={a.id}>
                      <td><div style={{ color: '#1e293b' }}>{a.name}</div></td>
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
          <ClientPagination setItemsPerPage={setItemsPerPage} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={addons.length}
          />
        </div>
      </div>

      {showModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
          <div className="kd-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? t('kulinerExtra.editAddonModalTitle') : t('kulinerExtra.addAddonModalTitle')}</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerExtra.formAddonName')}</label>
                  <input required className="kd-form-input" placeholder={t('kulinerExtra.formAddonNamePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerExtra.formPricePlaceholder')}</label>
                  <CurrencyInput required className="kd-form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>{t('kulinerExtra.cancel')}</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? t('kulinerExtra.savingBtn') : t('kulinerExtra.saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
