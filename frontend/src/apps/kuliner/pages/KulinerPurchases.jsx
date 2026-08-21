import React, { useEffect, useState } from 'react';
import { Plus, Eye, Check, X, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

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
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      case 'received': return <span className="kd-badge success"><CheckCircle size={14} style={{marginRight: 4}} /> Diterima</span>;
      case 'cancelled': return <span className="kd-badge danger"><X size={14} style={{marginRight: 4}} /> Dibatalkan</span>;
      default: return <span className="kd-badge warning"><Clock size={14} style={{marginRight: 4}} /> Pending</span>;
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Pembelian Bahan Baku</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions" style={{ flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end', marginBottom: 15 }}>
          <button className="kd-btn kd-btn-primary" onClick={handleOpenForm}>
            <Plus size={18} style={{ marginRight: 8 }} />
            Tambah Pembelian
          </button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="kd-loading" style={{ padding: 40, textAlign: 'center' }}>Memuat...</div>
            ) : (
              <table className="kd-table">
              <thead>
                <tr>
                  <th>No. Referensi</th>
                  <th>Tanggal</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                      <p style={{ margin: 0 }}>Belum ada data pembelian.</p>
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.reference_no}</td>
                      <td>{new Date(p.purchase_date).toLocaleDateString('id-ID')}</td>
                      <td>{p.supplier ? p.supplier.name : '-'}</td>
                      <td>Rp {parseFloat(p.total_amount).toLocaleString('id-ID')}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="kd-btn-icon" onClick={() => viewDetails(p.id)} title="Detail">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form Tambah */}
      {showModal && (
        <div className="kd-modal-overlay">
          <div className="kd-modal" style={{ maxWidth: 700 }}>
            <div className="kd-modal-header">
              <h3>Tambah Pembelian Baru</h3>
              <button className="kd-modal-close" onClick={handleCloseForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                  <div className="kd-form-group">
                    <label>Tanggal Pembelian</label>
                    <input
                      type="date"
                      className="kd-input"
                      value={form.purchase_date}
                      onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="kd-form-group">
                    <label>Supplier (Opsional)</label>
                    <select
                      className="kd-input"
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
                  <label>Catatan (Opsional)</label>
                  <textarea
                    className="kd-input"
                    rows="2"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h4 style={{ margin: 0 }}>Item Bahan Baku</h4>
                  <button type="button" className="kd-btn kd-btn-outline" onClick={addItem} style={{ padding: '6px 12px', fontSize: 13 }}>
                    <Plus size={14} style={{ marginRight: 6 }} /> Tambah Baris
                  </button>
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 5 }}>
                  {form.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                      <div style={{ flex: 2 }}>
                        <select
                          className="kd-input"
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
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            className="kd-input"
                            placeholder="Qty"
                            step="0.01"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ flex: 1.5 }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }}>Rp</span>
                          <input
                            type="number"
                            className="kd-input"
                            style={{ paddingLeft: 35 }}
                            placeholder="Harga Satuan"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <button type="button" className="kd-btn-icon" onClick={() => removeItem(idx)} style={{ color: '#dc2626', marginTop: 4 }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 15, textAlign: 'right', fontSize: 16, fontWeight: 600 }}>
                  Total: Rp {form.items.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unit_price || 0)), 0).toLocaleString('id-ID')}
                </div>

              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-outline" onClick={handleCloseForm}>Batal</button>
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
        <div className="kd-modal-overlay">
          <div className="kd-modal" style={{ maxWidth: 650 }}>
            <div className="kd-modal-header">
              <h3>Detail Pembelian {selectedPurchase.reference_no}</h3>
              <button className="kd-modal-close" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>
            <div className="kd-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: 13 }}>Tanggal Pembelian</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{new Date(selectedPurchase.purchase_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: 13 }}>Supplier</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{selectedPurchase.supplier ? selectedPurchase.supplier.name : '-'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: 13 }}>Status</p>
                  <p style={{ margin: 0 }}>{getStatusBadge(selectedPurchase.status)}</p>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Catatan:</p>
                  <p style={{ margin: '4px 0 0', fontSize: 14 }}>{selectedPurchase.notes}</p>
                </div>
              )}

              <h4 style={{ margin: '0 0 10px' }}>Daftar Barang</h4>
              <table className="kd-table" style={{ fontSize: 13 }}>
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
                      <td>{item.ingredient.name}</td>
                      <td>{parseFloat(item.quantity)} {item.ingredient.unit}</td>
                      <td>Rp {parseFloat(item.unit_price).toLocaleString('id-ID')}</td>
                      <td style={{ textAlign: 'right' }}>Rp {parseFloat(item.subtotal).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600, paddingRight: 15 }}>Total</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      Rp {parseFloat(selectedPurchase.total_amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>

            </div>
            <div className="kd-modal-footer">
              {selectedPurchase.status === 'pending' ? (
                <>
                  <button className="kd-btn" style={{ backgroundColor: '#dc2626', color: 'white', marginRight: 'auto' }} onClick={() => handleCancel(selectedPurchase)}>
                    Batalkan Transaksi
                  </button>
                  <button className="kd-btn kd-btn-outline" onClick={() => setShowDetailModal(false)}>Tutup</button>
                  <button className="kd-btn" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={() => handleMarkReceived(selectedPurchase)}>
                    <Check size={16} style={{ marginRight: 6 }} /> Terima Barang
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
