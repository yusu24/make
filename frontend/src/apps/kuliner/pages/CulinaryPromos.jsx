import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const CulinaryPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [promoForm, setPromoForm] = useState({
    name: '',
    code: '',
    type: 'discount',
    value: '',
    description: '',
    quota: 0,
    expired_at: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const response = await api.get('/kuliner/admin/promos');
      setPromos(response.data);
    } catch (error) {
      console.error('Failed to fetch promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setPromoForm({
        name: item.name,
        code: item.code,
        type: item.type,
        value: item.value,
        description: item.description || '',
        quota: item.quota || 0,
        expired_at: item.expired_at ? item.expired_at.split('T')[0] : '',
        status: item.status
      });
    } else {
      setEditingItem(null);
      setPromoForm({ name: '', code: '', type: 'discount', value: '', description: '', quota: 0, expired_at: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/promos/${editingItem.id}`, promoForm);
      } else {
        await api.post('/kuliner/admin/promos', promoForm);
      }
      await fetchPromos();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save promo:', error);
      alert('Gagal menyimpan promo. Kode promo mungkin sudah digunakan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Yakin ingin menghapus promo ini?')) return;
    try {
      await api.delete(`/kuliner/admin/promos/${id}`);
      setPromos(promos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete promo:', error);
    }
  };

  const toggleStatus = async (promo) => {
    try {
      const newStatus = promo.status === 'active' ? 'inactive' : 'active';
      await api.put(`/kuliner/admin/promos/${promo.id}`, { ...promo, status: newStatus });
      fetchPromos();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Promo & Kupon Diskon</h1>
      </div>

      <div className="kd-content">
        {loading ? (
          <KulinerLoading message="Memuat Data Promo..." />
        ) : (
          <>
            <div className="kd-page-actions">
              <button className="kd-btn kd-btn-primary" onClick={() => handleOpenModal()}>+ Buat Promo Baru</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {promos.map(promo => (
              <div key={promo.id} className="kd-panel" style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                border: '1px solid #f1f5f9',
                opacity: promo.status === 'inactive' ? 0.6 : 1
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: 6, 
                  height: '100%', 
                  background: promo.status === 'active' ? 'linear-gradient(to bottom, #b48c36, #d97706)' : '#cbd5e1' 
                }} />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{promo.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kode:</span>
                      <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{promo.code}</code>
                    </div>
                  </div>
                  <span className={`kd-status-badge ${promo.status === 'active' ? 'kd-status-active' : 'kd-status-hidden'}`}>
                    {promo.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 italic leading-relaxed">
                  {promo.description || 'Gunakan kode promo ini saat checkout.'}
                </p>

                <div className="py-4 border-y border-dashed border-slate-100 my-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Keuntungan</span>
                    <span className="text-xl font-black text-[#b48c36]">{promo.value}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Kuota</span>
                    <span className="text-slate-600 font-bold">{promo.quota === 0 ? 'Tak Terbatas' : `${promo.used_count} / ${promo.quota} Terpakai`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] text-slate-400">
                    Berakhir: <span className="font-bold text-slate-600">{promo.expired_at ? new Date(promo.expired_at).toLocaleDateString('id-ID') : 'Selamanya'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button onClick={() => handleOpenModal(promo)} className="kd-btn kd-btn-secondary flex-1" style={{ fontSize: 11 }}>Edit</button>
                  <button 
                    onClick={() => toggleStatus(promo)}
                    className={`kd-btn flex-1 ${promo.status === 'active' ? 'kd-btn-secondary text-red-500' : 'kd-btn-primary'}`} 
                    style={{ fontSize: 11 }}
                  >
                    {promo.status === 'active' ? 'Matikan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => handleDeletePromo(promo.id)} className="kd-btn kd-btn-secondary text-red-400" style={{ padding: '8px' }}>🗑️</button>
                </div>
              </div>
            ))}

            <div 
              onClick={() => handleOpenModal()}
              className="kd-panel flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer" 
              style={{ minHeight: '200px' }}
            >
              <div className="text-3xl text-slate-300 mb-2">+</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tambah Promo Baru</div>
            </div>
          </div>
        </>
      )}

        <div style={{ marginTop: 40, padding: 24, background: '#fffbeb', borderRadius: 24, border: '1px solid #fef3c7' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ fontSize: 32 }}>💡</div>
            <div>
              <h5 className="font-bold text-amber-800 mb-1">Tips Marketing</h5>
              <p className="text-xs text-amber-700/80 leading-relaxed">Gunakan fitur **Kuota** untuk membuat promo eksklusif. Pelanggan akan lebih cepat memesan jika mereka tahu jumlah promo sangat terbatas!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Buat Promo */}
      {showModal && (
        <div className="kd-modal-overlay visible">
          <div className="kd-modal" style={{ maxWidth: '500px' }}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Buat'} Promo Baru</h2>
              <button className="kd-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSavePromo} className="kd-modal-body">
              <div className="kd-form-group">
                <label className="kd-form-label">Nama Promo</label>
                <input 
                  required 
                  type="text" 
                  className="kd-form-input" 
                  placeholder="Contoh: Promo Ramadhan" 
                  value={promoForm.name}
                  onChange={e => setPromoForm({...promoForm, name: e.target.value})}
                />
              </div>
              <div className="kd-form-grid">
                <div className="kd-form-group">
                  <label className="kd-form-label">Kode Promo</label>
                  <input 
                    required 
                    type="text" 
                    className="kd-form-input font-mono" 
                    placeholder="RAMADHAN24" 
                    value={promoForm.code}
                    disabled={!!editingItem}
                    onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Tipe</label>
                  <select 
                    className="kd-form-input"
                    value={promoForm.type}
                    onChange={e => setPromoForm({...promoForm, type: e.target.value})}
                  >
                    <option value="discount">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="bundle">Bundling</option>
                  </select>
                </div>
              </div>
              <div className="kd-form-row">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nilai Keuntungan</label>
                  <input 
                    required 
                    type="text" 
                    className="kd-form-input" 
                    placeholder="Contoh: 20% atau Rp 10.000" 
                    value={promoForm.value}
                    onChange={e => setPromoForm({...promoForm, value: e.target.value})}
                  />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Kuota Pemakaian</label>
                  <input 
                    type="number" 
                    className="kd-form-input" 
                    placeholder="0 = Tanpa Batas" 
                    value={promoForm.quota}
                    onChange={e => setPromoForm({...promoForm, quota: e.target.value})}
                  />
                </div>
              </div>
              <div className="kd-form-group">
                <label className="kd-form-label">Berlaku Hingga (Opsional)</label>
                <input 
                  type="date" 
                  className="kd-form-input" 
                  value={promoForm.expired_at}
                  onChange={e => setPromoForm({...promoForm, expired_at: e.target.value})}
                />
              </div>
              <div className="kd-form-group">
                <label className="kd-form-label">Keterangan / Deskripsi Promo</label>
                <textarea 
                  className="kd-form-input" 
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  placeholder="Contoh: Berlaku untuk minimal pembelian Rp 50.000" 
                  value={promoForm.description}
                  onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                />
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" disabled={saving} className="kd-btn kd-btn-primary">
                  {saving ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryPromos;
