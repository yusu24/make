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

const emptyOption = () => ({ name: '', price_delta: 0, is_default: false });
const emptyGroup = { name: '', is_required: false, options: [emptyOption()] };

export default function Modifiers() {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState(emptyGroup);
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(groups.length / itemsPerPage);
  const currentGroups = groups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        toast.success(t('kulinerExtra.alertSaveSuccess'));
      } else {
        await api.post('/kuliner/admin/modifier-groups', form);
        toast.success(t('kulinerExtra.alertSaveSuccess'));
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
    const ok = await confirm(`${t('kulinerExtra.deleteConfirm')} "${g.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/modifier-groups/${g.id}`);
      toast.success(t('kulinerExtra.alertDeleteSuccess'));
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus modifier');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerExtra.modifiersTitle')}</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>{t('kulinerExtra.addModifierBtn')}</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>{t('kulinerExtra.headerGroupName')}</th>
                  <th>{t('kulinerExtra.headerRules')}</th>
                  <th>{t('kulinerExtra.headerOptions')}</th>
                  <th className="text-right">{t('kulinerExtra.headerAction')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">{t('kulinerExtra.loadingData')}</td></tr>
                ) : groups.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">{t('kulinerExtra.emptyModifier')}</td></tr>
                ) : (
                  currentGroups.map((g) => (
                    <tr key={g.id}>
                      <td><div style={{ color: '#1e293b' }}>{g.name}</div></td>
                      <td>
                        <span className={`kd-status-badge ${g.is_required ? 'kd-status-active' : 'kd-status-hidden'}`}>
                          {g.is_required ? t('kulinerExtra.reqMinMax').split(',')[0] : t('kulinerExtra.formIsOptional').split(' ')[0]}
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
          <ClientPagination setItemsPerPage={setItemsPerPage} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={groups.length}
          />
        </div>
      </div>

      {showModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
          <div className="kd-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingGroup ? t('kulinerExtra.editModifierModalTitle') : t('kulinerExtra.addModifierModalTitle')}</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerExtra.formGroupName')}</label>
                  <input required className="kd-form-input" placeholder={t('kulinerExtra.formGroupNamePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })} />
                  <label className="kd-form-label" style={{ margin: 0 }}>{t('kulinerExtra.formIsRequired')}</label>
                </div>

                <p style={{ fontWeight: 700, fontSize: 12, marginTop: 16, marginBottom: 8 }}>{t('kulinerExtra.formOptionsTitle').toUpperCase()}</p>
                {form.options.map((o, idx) => (
                  <div key={idx} className="kd-form-row" style={{ alignItems: 'center', marginBottom: 8 }}>
                    <input className="kd-form-input" placeholder={t('kulinerExtra.formOptionName')} value={o.name} onChange={(e) => updateOption(idx, 'name', e.target.value)} />
                    <CurrencyInput className="kd-form-input" placeholder={t('kulinerExtra.formPricePlaceholder')} value={o.price_delta} onChange={(e) => updateOption(idx, 'price_delta', e.target.value)} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={o.is_default} onChange={(e) => updateOption(idx, 'is_default', e.target.checked)} /> Default
                    </label>
                    <button type="button" className="kd-btn kd-btn-secondary text-red-500" onClick={() => removeOptionRow(idx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="kd-btn kd-btn-secondary" onClick={addOptionRow}>{t('kulinerExtra.addOptionBtn')}</button>
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
