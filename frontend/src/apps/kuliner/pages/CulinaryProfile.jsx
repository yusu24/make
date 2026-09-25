import React, { useState } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/Toast';
import { api } from '../../../lib/api';
import { UserCheck, User, Mail, Phone, ShieldCheck, Key, Check, Save, ShieldAlert } from '@/constants/icons';
import './KulinerDashboard.css';

const CulinaryProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
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
      toast.success('Profil Anda berhasil diperbarui!');
      // Refresh user data would be good here, or just let them re-login
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-content">
        <div>
          {/* PROFILE PREVIEW HEADER */}
          <div className="kd-panel kd-settings-header p-8 flex items-center gap-8 bg-gradient-to-r from-white to-slate-50/50" style={{ marginBottom: '20px' }}>
            <div className="w-24 h-24 rounded-3xl bg-[#b48c36] flex items-center justify-center text-4xl text-white shadow-xl shadow-[#b48c36]/20">
              {form.name.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-1">{form.name || 'Pengguna'}</h2>
              <p className="text-sm text-slate-400 mb-4">{form.email}</p>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold bg-[#b48c36] text-white px-3 py-1 rounded-full uppercase tracking-wider">Pemilik Restoran</span>
                <span className="text-[10px] font-bold bg-green-100 text-green-600 px-3 py-1 rounded-full uppercase tracking-wider">Akun Aktif</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="kd-settings-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* DATA DIRI */}
                <div className="kd-panel">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                    <UserCheck className="text-[#b48c36]" size={20} />
                    <h3 className="font-bold text-slate-800">Informasi Data Diri</h3>
                  </div>

                  <div className="kd-form-group">
                    <label className="kd-form-label flex items-center gap-2">
                      <User size={15} className="text-slate-400" /> Nama Lengkap
                    </label>
                    <input 
                      type="text" className="kd-form-input" 
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>

                  <div className="kd-form-row">
                    <div className="kd-form-group">
                      <label className="kd-form-label flex items-center gap-2">
                        <Mail size={15} className="text-slate-400" /> Email Utama
                      </label>
                      <input 
                        type="email" className="kd-form-input bg-slate-50 cursor-not-allowed text-slate-500" 
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        disabled
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Email tidak dapat diubah untuk keamanan.</p>
                    </div>

                    <div className="kd-form-group">
                      <label className="kd-form-label flex items-center gap-2">
                        <Phone size={15} className="text-slate-400" /> Nomor Telepon
                      </label>
                      <input 
                        type="text" className="kd-form-input" 
                        value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* KEAMANAN AKUN */}
                <div className="kd-panel">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                    <ShieldCheck className="text-[#b48c36]" size={20} />
                    <h3 className="font-bold text-slate-800">Keamanan Akun</h3>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 -mt-2">Kosongkan kolom di bawah jika Anda tidak ingin mengubah password.</p>

                  <div className="kd-form-row">
                    <div className="kd-form-group">
                      <label className="kd-form-label flex items-center gap-2">
                        <Key size={15} className="text-slate-400" /> Password Baru
                      </label>
                      <input 
                        type="password" className="kd-form-input" 
                        placeholder="Masukkan password baru"
                        value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      />
                    </div>

                    <div className="kd-form-group">
                      <label className="kd-form-label flex items-center gap-2">
                        <Check size={15} className="text-slate-400" /> Konfirmasi Password
                      </label>
                      <input 
                        type="password" className="kd-form-input" 
                        placeholder="Ulangi password baru"
                        value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* HELP CARD */}
                <div className="kd-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={18} className="text-amber-400" />
                    <h4 className="font-bold">Pentingnya Keamanan</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-6">Pastikan nomor telepon dan email Anda selalu aktif. Kami akan menggunakan data ini untuk verifikasi keamanan dan notifikasi penting terkait toko Anda.</p>
                </div>

                {/* SAVE BUTTON PANEL */}
                <div className="kd-panel bg-slate-50 border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-6 text-center italic">Pastikan data diri Anda sudah benar sebelum menyimpan.</p>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="kd-btn kd-btn-primary w-full py-4 text-lg shadow-xl shadow-[#b48c36]/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      'Menyimpan...'
                    ) : (
                      <>
                        <Save size={18} /> Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </KulinerAdminLayout>
  );
};

export default CulinaryProfile;
