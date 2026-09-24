import React, { useEffect, useState } from 'react';
import {
  Plus,
  Eye,
  Check,
  X,
  CheckCircle2,
  Clock,
  Trash2
} from '@/constants/icons';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

import ClientPagination from '../components/ClientPagination';

const emptyForm = { 
  supplier_id: '', 
  purchase_date: new Date().toISOString().split('T')[0], 
  notes: '', 
  items: [] 
};

export default function KulinerPurchases() {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Data for the form
  const [suppliers, setSuppliers] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  // For viewing details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPurchases, resSuppliers, resIngredients] = await Promise.all([
        api.get('/kuliner/admin/purchases'),
        api.get('/kuliner/admin/suppliers'),
        api.get('/kuliner/admin/ingredients?per_page=1000') // get all
      ]);
      setPurchases(resPurchases.data.data || []);
      setSuppliers(resSuppliers.data || []);
      setIngredients(resIngredients.data.data || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(purchases.length / itemsPerPage) || 1;
  const paginatedPurchases = purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenForm = () => {
    setForm({
      ...emptyForm,
      purchase_date: new Date().toISOString().split('T')[0],
      items: [{ ingredient_id: '', quantity: 1, unit_price: 0 }]
    });
    setShowModal(true);
  };

  const handleCloseForm = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { ingredient_id: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    
    // Auto fill price if ingredient selected
    if (field === 'ingredient_id') {
      const ing = ingredients.find(i => i.id == value);
      if (ing) {
        newItems[index].unit_price = ing.last_price || 0;
      }
    }
    
    setForm({ ...form, items: newItems });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast.error('Tambahkan minimal 1 bahan baku');
      return;
    }

    // validate items
    for (const item of form.items) {
      if (!item.ingredient_id || item.quantity <= 0 || item.unit_price < 0) {
        toast.error('Harap lengkapi semua baris bahan dengan benar');
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/kuliner/admin/purchases', form);
      toast.success('Pembelian berhasil dibuat');
      handleCloseForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await api.get(`/kuliner/admin/purchases/${id}`);
      setSelectedPurchase(res.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Gagal memuat detail');
    }
  };

  const updateStatus = async (id, status, payment_status) => {
    try {
      await api.patch(`/kuliner/admin/purchases/${id}/status`, { status, payment_status });
      toast.success('Status berhasil diubah');
      setShowDetailModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update status');
    }
  };

  const handleMarkReceived = (purchase) => {
    confirm.show({
      title: 'Terima Barang',
      message: 'Anda yakin barang sudah diterima? Stok bahan baku akan otomatis bertambah.',
      onConfirm: () => updateStatus(purchase.id, 'received', 'paid')
    });
  };

  const handleCancel = (purchase) => {
    confirm.show({
      title: 'Batalkan Pembelian',
      message: 'Anda yakin ingin membatalkan transaksi ini?',
      confirmText: 'Batalkan Transaksi',
      confirmColor: '#dc2626',
      onConfirm: () => updateStatus(purchase.id, 'cancelled', 'unpaid')
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received':
        return <span className="kd-status-badge kd-status-active">Diterima</span>;
      case 'cancelled':
        return <span className="kd-status-badge kd-status-hidden">Dibatalkan</span>;
      default:
        return <span className="kd-status-badge kd-status-draft">Pending</span>;
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Pembelian Bahan Baku</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary flex items-center gap-2" onClick={handleOpenForm}>
            <Plus size={16} />
            Tambah Pembelian
          </button>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>No. Referensi</th>
                  <th>Tanggal</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">Memuat data pembelian...</td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-400">Belum ada data pembelian.</td>
                  </tr>
                ) : (
                  paginatedPurchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 400, color: '#0f172a' }}>{p.reference_no}</td>
                      <td>{new Date(p.purchase_date).toLocaleDateString('id-ID')}</td>
                      <td>{p.supplier ? p.supplier.name : '-'}</td>
                      <td style={{ fontWeight: 600 }}>Rp {parseFloat(p.total_amount).toLocaleString('id-ID')}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td className="text-right">
                        <button className="kd-icon-btn" onClick={() => viewDetails(p.id)} title="Lihat Detail">
                          <Eye size={16} />
                        </button>
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
            totalItems={purchases.length}
          />
        </div>
      </div>

      {/* Modal Form Tambah */}
      {showModal && (
        <div className="kd-modal-overlay visible" onClick={handleCloseForm}>
          <div className="kd-modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">Tambah Pembelian Baru</h2>
              <button className="kd-close-btn" onClick={handleCloseForm}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Tanggal Pembelian</label>
                    <input
                      type="date"
                      className="kd-form-input"
                      value={form.purchase_date}
                      onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Supplier (Opsional)</label>
                    <select
                      className="kd-form-select"
                      value={form.supplier_id}
                      onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                    >
                      <option value="">Pilih Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="kd-form-group">
                  <label className="kd-form-label">Catatan (Opsional)</label>
                  <textarea
                    className="kd-form-textarea"
                    rows="2"
                    placeholder="Tulis catatan jika ada..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div className="kd-divider my-4" />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Item Bahan Baku</h4>
                  <button type="button" className="kd-btn kd-btn-secondary flex items-center gap-1 text-xs" onClick={addItem}>
                    <Plus size={14} /> Tambah Baris
                  </button>
                </div>

                <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                      <div style={{ flex: 2 }}>
                        <select
                          className="kd-form-select"
                          value={item.ingredient_id}
                          onChange={(e) => handleItemChange(idx, 'ingredient_id', e.target.value)}
                          required
                        >
                          <option value="">Pilih Bahan...</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          className="kd-form-input"
                          placeholder="Qty"
                          step="0.01"
                          min="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ flex: 1.5, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>Rp</span>
                        <input
                          type="number"
                          className="kd-form-input"
                          style={{ paddingLeft: 32 }}
                          placeholder="Harga Satuan"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                          required
                        />
                      </div>
                      <button type="button" className="kd-icon-btn text-red-500" onClick={() => removeItem(idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Total Estimasi: <span style={{ color: '#b48c36' }}>Rp {form.items.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unit_price || 0)), 0).toLocaleString('id-ID')}</span>
                </div>

              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={handleCloseForm}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Pembelian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetailModal && selectedPurchase && (
        <div className="kd-modal-overlay visible" onClick={() => setShowDetailModal(false)}>
          <div className="kd-modal" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">Detail Pembelian {selectedPurchase.reference_no}</h2>
              <button className="kd-close-btn" onClick={() => setShowDetailModal(false)}><X size={18} /></button>
            </div>
            <div className="kd-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: 12 }}>Tanggal Pembelian</p>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{new Date(selectedPurchase.purchase_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: 12 }}>Supplier</p>
                  <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{selectedPurchase.supplier ? selectedPurchase.supplier.name : '-'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: 12 }}>Status</p>
                  <p style={{ margin: 0 }}>{getStatusBadge(selectedPurchase.status)}</p>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div style={{ padding: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#64748b' }}>Catatan:</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#334155' }}>{selectedPurchase.notes}</p>
                </div>
              )}

              <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Daftar Barang</h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <table className="kd-table" style={{ fontSize: 12, margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Bahan Baku</th>
                      <th>Qty</th>
                      <th>Harga Satuan</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.ingredient?.name || '-'}</td>
                        <td>{parseFloat(item.quantity)} {item.ingredient?.unit || ''}</td>
                        <td>Rp {parseFloat(item.unit_price).toLocaleString('id-ID')}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700, paddingRight: 15 }}>Total</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#b48c36', fontSize: 13 }}>
                        Rp {parseFloat(selectedPurchase.total_amount).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
            <div className="kd-modal-footer">
              {selectedPurchase.status === 'pending' ? (
                <>
                  <button className="kd-btn" style={{ backgroundColor: '#ef4444', color: 'white', marginRight: 'auto' }} onClick={() => handleCancel(selectedPurchase)}>
                    Batalkan Transaksi
                  </button>
                  <button className="kd-btn kd-btn-secondary" onClick={() => setShowDetailModal(false)}>Tutup</button>
                  <button className="kd-btn flex items-center gap-1.5" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={() => handleMarkReceived(selectedPurchase)}>
                    <Check size={16} /> Terima Barang
                  </button>
                </>
              ) : (
                <button className="kd-btn kd-btn-primary" onClick={() => setShowDetailModal(false)}>Tutup</button>
              )}
            </div>
          </div>
        </div>
      )}

    </KulinerAdminLayout>
  );
}
