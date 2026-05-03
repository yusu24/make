import React, { useState } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import './KulinerDashboard.css';

const CulinaryProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    password_confirmation: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile', form);
      alert('Profil Anda berhasil diperbarui! ✨');
      // Refresh user data would be good here, or just let them re-login
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar" style={{ display: 'none' }}>{/* Hidden because layout has one now */}</div>
      
      <div className="kd-content" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="kd-panel">
          <div className="kd-panel-header">
            <div className="text-sm font-bold text-slate-800">Pengaturan Profil Pengguna</div>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: 'linear-gradient(135deg, #b48c36, #e8c97a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, color: 'white', fontWeight: 'bold', marginBottom: 16,
                boxShadow: '0 8px 16px rgba(180, 140, 54, 0.2)'
              }}>
                {form.name.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-slate-800">{form.name}</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Pemilik Restoran</p>
            </div>

            <div className="kd-form-group mb-4">
              <label className="kd-form-label">Nama Lengkap</label>
              <input 
                type="text" className="kd-form-input" 
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="kd-form-group mb-4">
              <label className="kd-form-label">Email Utama</label>
              <input 
                type="email" className="kd-form-input" 
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                disabled
              />
              <p className="text-[10px] text-slate-400 mt-1">Email tidak dapat diubah untuk alasan keamanan.</p>
            </div>

            <div className="kd-form-group mb-4">
              <label className="kd-form-label">Nomor Telepon</label>
              <input 
                type="text" className="kd-form-input" 
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '32px 0' }} />

            <div className="kd-form-group mb-4">
              <label className="kd-form-label">Ganti Password (Opsional)</label>
              <input 
                type="password" className="kd-form-input" 
                placeholder="Masukkan password baru"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>

            <div className="kd-form-group mb-8">
              <label className="kd-form-label">Konfirmasi Password</label>
              <input 
                type="password" className="kd-form-input" 
                placeholder="Ulangi password baru"
                value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})}
              />
            </div>

            <button type="submit" className="kd-btn kd-btn-primary w-full py-4" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </form>
        </div>
      </div>
    </KulinerAdminLayout>
  );
};

export default CulinaryProfile;
