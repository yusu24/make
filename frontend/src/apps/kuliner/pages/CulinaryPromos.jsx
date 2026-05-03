import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import './KulinerDashboard.css';

const CulinaryPromos = () => {
  const [promos, setPromos] = useState([
    { id: 1, name: 'Promo Jumat Berkah', code: 'JUMATBERKAH', type: 'discount', value: '20%', status: 'active', usage: 45 },
    { id: 2, name: 'Gajian Kenyang', code: 'GAJIANPuas', type: 'nominal', value: 'Rp 15.000', status: 'active', usage: 120 },
    { id: 3, name: 'Bundling Sate + Es Teh', code: 'PAKETHEMAT', type: 'bundle', value: 'Hemat Rp 5.000', status: 'inactive', usage: 0 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [promoForm, setPromoForm] = useState({
    name: '',
    code: '',
    type: 'discount',
    value: '',
    description: '',
    status: 'active'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setPromoForm({
        name: item.name,
        code: item.code,
        type: item.type,
        value: item.value,
        description: item.description || '',
        status: item.status
      });
    } else {
      setEditingItem(null);
      setPromoForm({ name: '', code: '', type: 'discount', value: '', description: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSavePromo = (e) => {
    e.preventDefault();
    if (editingItem) {
      setPromos(promos.map(p => p.id === editingItem.id ? { ...editingItem, ...promoForm } : p));
      alert('Promo berhasil diperbarui! ✨');
    } else {
      const newPromo = {
        ...promoForm,
        id: Date.now(),
        usage: 0
      };
      setPromos([newPromo, ...promos]);
      alert('Promo baru berhasil ditambahkan! 🎁');
    }
    setShowModal(false);
    setEditingItem(null);
    setPromoForm({ name: '', code: '', type: 'discount', value: '', description: '', status: 'active' });
  };

  const toggleStatus = (id) => {
    setPromos(promos.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ));
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Promo & Kupon Diskon</h1>
          <p className="text-sm text-slate-500 mt-1">Buat penawaran menarik untuk meningkatkan loyalitas pelanggan Anda.</p>
        </div>
        <div className="kd-topbar-actions">
          <button className="kd-btn kd-btn-primary" onClick={() => handleOpenModal()}>+ Buat Promo Baru</button>
        </div>
      </div>

      <div className="kd-content">
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
                {promo.description || 'Gunakan kode promo ini saat checkout untuk mendapatkan penawaran spesial.'}
              </p>

              <div className="py-4 border-y border-dashed border-slate-100 my-4">
                <div className="text-[10px] text-slate-400 font-bold mb-1">Keuntungan</div>
                <div className="text-2xl font-black text-[#b48c36]">{promo.value}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[10px] text-slate-400">
                  <span className="font-bold text-slate-600">{promo.usage}</span> kali digunakan
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(promo)} className="kd-btn kd-btn-secondary" style={{ padding: '6px 12px', fontSize: 11 }}>Edit</button>
                  <button 
                    onClick={() => toggleStatus(promo.id)}
                    className={`kd-btn ${promo.status === 'active' ? 'kd-btn-secondary text-red-500' : 'kd-btn-primary'}`} 
                    style={{ padding: '6px 12px', fontSize: 11 }}
                  >
                    {promo.status === 'active' ? 'Matikan' : 'Aktifkan'}
                  </button>
                </div>
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

        <div style={{ marginTop: 40, padding: 24, background: '#fffbeb', borderRadius: 24, border: '1px solid #fef3c7' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ fontSize: 32 }}>🎁</div>
            <div>
              <h5 className="font-bold text-amber-800 mb-1">Promo Bundling Baru Tersedia!</h5>
              <p className="text-xs text-amber-700/80 leading-relaxed">Anda sekarang bisa membuat promo "Beli Paket A, dapatkan Gratis Paket B". Fitur ini sangat efektif untuk menghabiskan stok menu tertentu dengan cepat.</p>
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
                <label className="kd-form-label">Keterangan / Deskripsi Promo</label>
                <textarea 
                  className="kd-form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Contoh: Berlaku untuk minimal pembelian Rp 50.000" 
                  value={promoForm.description}
                  onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                />
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary">Simpan Promo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryPromos;
