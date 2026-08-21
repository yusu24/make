import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Phone, MapPin, X } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const emptyForm = { name: '', contact: '', address: '' };

export default function KulinerSuppliers() {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kuliner/admin/suppliers');
      setSuppliers(res.data || []);
    } catch (error) {
      toast.showError('Gagal memuat daftar supplier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, contact: item.contact || '', address: item.address || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.showError('Nama wajib diisi');

    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/suppliers/${editingItem.id}`, form);
        toast.showSuccess('Supplier berhasil diperbarui');
      } else {
        await api.post('/kuliner/admin/suppliers', form);
        toast.showSuccess('Supplier berhasil ditambahkan');
      }
      closeModal();
      fetchSuppliers();
    } catch (error) {
      toast.showError('Gagal menyimpan supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (await confirm('Hapus Supplier', `Yakin ingin menghapus ${item.name}? Data yang terkait mungkin tidak bisa dihapus.`)) {
      try {
        await api.delete(`/kuliner/admin/suppliers/${item.id}`);
        toast.showSuccess('Supplier berhasil dihapus');
        fetchSuppliers();
      } catch (error) {
        toast.showError('Gagal menghapus supplier');
      }
    }
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Manajemen Supplier</h1>
      </div>
      
      <div className="kd-content">
        <div className="kd-page-actions" style={{ flexWrap: 'wrap', gap: 10 }}>
          <input
            className="kd-form-input"
            style={{ maxWidth: 260, height: 38, fontSize: 12, border: '1px solid #94a3b8' }}
            placeholder="Cari nama supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ flex: 1 }}></div>
          <button onClick={openAdd} className="kd-btn kd-btn-primary">
            <Plus size={18} style={{ marginRight: 8 }} />
            Tambah Supplier
          </button>
        </div>

        <div className="kd-panel">

          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Nama Supplier</th>
                  <th>Kontak</th>
                  <th>Alamat</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Belum ada data supplier.</td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>
                        {s.contact ? (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
                            <Phone size={14} style={{ marginRight: 8 }} />
                            {s.contact}
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {s.address ? (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }} title={s.address}>
                            <MapPin size={14} style={{ marginRight: 8, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{s.address}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button onClick={() => openEdit(s)} className="kd-btn-icon" style={{ color: '#4f46e5' }} title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(s)} className="kd-btn-icon" style={{ color: '#dc2626' }} title="Hapus">
                            <Trash2 size={16} />
                          </button>
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
        <div className="kd-modal-overlay">
          <div className="kd-modal" style={{ maxWidth: 450 }}>
            <div className="kd-modal-header">
              <h3>
                {editingItem ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </h3>
              <button className="kd-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label>Nama Supplier <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    className="kd-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="kd-form-group">
                  <label>Kontak (No. HP / Telepon)</label>
                  <input
                    type="text"
                    className="kd-input"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
                <div className="kd-form-group">
                  <label>Alamat Lengkap</label>
                  <textarea
                    className="kd-input"
                    rows="3"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  ></textarea>
                </div>
                <div className="kd-form-group">
                  <label>Catatan Lainnya (Opsional)</label>
                  <textarea
                    className="kd-input"
                    rows="2"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="kd-btn kd-btn-outline">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="kd-btn kd-btn-primary">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
