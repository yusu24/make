import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Phone, MapPin, X, Truck } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import ClientPagination from '../components/ClientPagination';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const emptyForm = { name: '', contact: '', address: '', notes: '' };

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
      toast.error('Gagal memuat daftar supplier');
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
    setForm({ 
      name: item.name, 
      contact: item.contact || '', 
      address: item.address || '',
      notes: item.notes || '' 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nama supplier wajib diisi');

    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/suppliers/${editingItem.id}`, form);
        toast.success('Supplier berhasil diperbarui');
      } else {
        await api.post('/kuliner/admin/suppliers', form);
        toast.success('Supplier berhasil ditambahkan');
      }
      closeModal();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`Yakin ingin menghapus supplier "${item.name}"? Data yang terkait mungkin tidak bisa dihapus.`, { title: 'Hapus Supplier' });
    if (ok) {
      try {
        await api.delete(`/kuliner/admin/suppliers/${item.id}`);
        toast.success('Supplier berhasil dihapus');
        fetchSuppliers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus supplier');
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedSuppliers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Manajemen Supplier</h1>
      </div>
      
      <div className="kd-content">
        <div className="kd-page-actions" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <input
            className="kd-form-input"
            style={{ maxWidth: 260, height: 38, fontSize: 13, border: '1px solid #CBD5E1', borderRadius: 8, padding: '0 12px' }}
            placeholder="Cari nama supplier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div style={{ flex: 1 }}></div>
          <button 
            onClick={openAdd} 
            className="kd-btn kd-btn-primary"
            style={{ height: 38, padding: '0 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, background: '#B45309', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={18} />
            <span>Tambah Supplier</span>
          </button>
        </div>

        <div className="kd-panel" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', padding: 0 }}>
          <div className="kd-table-container" style={{ overflowX: 'auto', marginBottom: 0, border: 'none', borderRadius: 0 }}>
            <table className="kd-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nama Supplier</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Kontak</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Alamat</th>
                  <th style={{ padding: '10px 16px', fontSize: 11.5, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>Memuat data supplier...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>Belum ada data supplier.</td></tr>
                ) : (
                  paginatedSuppliers.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{s.name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12.5 }}>
                        {s.contact ? (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#475569', gap: 6 }}>
                            <Phone size={14} color="#64748B" />
                            {s.contact}
                          </div>
                        ) : <span style={{ color: '#94A3B8' }}>-</span>}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12.5 }}>
                        {s.address ? (
                          <div style={{ display: 'flex', alignItems: 'center', color: '#475569', gap: 6 }} title={s.address}>
                            <MapPin size={14} color="#64748B" style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{s.address}</span>
                          </div>
                        ) : <span style={{ color: '#94A3B8' }}>-</span>}
                      </td>
                      <td style={{ textAlign: 'right', padding: '10px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button 
                            onClick={() => openEdit(s)} 
                            title="Edit"
                            style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', cursor: 'pointer' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(s)} 
                            title="Hapus"
                            style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ClientPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            totalItems={filtered.length}
          />
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT SUPPLIER */}
      {showModal && (
        <div 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16
          }} 
          onClick={closeModal}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 460,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'kd-fadeIn 0.2s ease'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                  <Truck size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {editingItem ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                    {editingItem ? 'Perbarui informasi kontak dan alamat supplier' : 'Daftarkan mitra supplier bahan baku baru'}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: 8,
                  width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Nama Supplier <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Sumber Pangan, Toko Sayur Segar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 10,
                    fontSize: 13.5,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#B45309'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Kontak (No. HP / Telepon / WhatsApp)
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: 13.5,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#B45309'}
                    onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Alamat Lengkap
                </label>
                <textarea
                  rows="2"
                  placeholder="Alamat kantor / gudang supplier..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 10,
                    fontSize: 13.5,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#B45309'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                ></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Catatan termin pembayaran, kontak sales, dll..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 10,
                    fontSize: 13.5,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#B45309'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                ></textarea>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                <button 
                  type="button" 
                  onClick={closeModal}
                  style={{
                    height: 38,
                    padding: '0 16px',
                    borderRadius: 8,
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    height: 38,
                    padding: '0 20px',
                    borderRadius: 8,
                    background: '#B45309',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {saving ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
