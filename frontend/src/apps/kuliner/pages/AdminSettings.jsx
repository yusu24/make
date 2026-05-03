import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const AdminSettings = () => {
  const { updateUser } = useAuth();
  const [settings, setSettings] = useState({
    store_name: '',
    address: '',
    phone: '',
    opening_hours: '',
    operational_days: '',
    total_tables: '',
    hero_title: '',
    hero_subtitle: '',
    promo_title: '',
    promo_desc: '',
    instagram_url: '',
    whatsapp_number: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/kuliner/admin/settings');
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/kuliner/admin/settings', settings);
      
      // Update global user context so sidebar/layout updates instantly
      updateUser({
        tenant_name: settings.store_name
      });

      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KulinerAdminLayout>
      {loading ? (
        <KulinerLoading message="Memuat Pengaturan..." />
      ) : (
        <>
          <div className="kd-topbar">
            <div>
              <h1 className="kd-page-title">Pengaturan Toko</h1>
              <p className="text-sm text-slate-500 mt-1">Sesuaikan identitas dan profil bisnis kuliner Anda.</p>
            </div>
          </div>

          <div className="kd-content">
            {message && (
              <div className={`p-4 rounded-2xl mb-8 text-sm font-bold border animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {message.type === 'success' ? '✨ ' : '❌ '} {message.text}
              </div>
            )}

            <div>
              {/* PROFILE PREVIEW HEADER */}
              <div className="kd-panel kd-settings-header p-8 flex items-center gap-8 bg-gradient-to-r from-white to-slate-50/50" style={{ marginBottom: '20px' }}>
                <div className="w-24 h-24 rounded-3xl bg-[#b48c36] flex items-center justify-center text-4xl text-white shadow-xl shadow-[#b48c36]/20">
                  {settings.store_name?.charAt(0) || '🏠'}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-1">{settings.store_name || 'Nama Toko Anda'}</h2>
                  <p className="text-sm text-slate-400 mb-4">{settings.address || 'Alamat belum diatur'}</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">Premium UMKM</span>
                    <span className="text-[10px] font-bold bg-green-100 text-green-600 px-3 py-1 rounded-full uppercase tracking-wider">Toko Aktif</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="kd-settings-layout">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* BASIC INFO */}
                    <div className="kd-panel">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <span className="text-xl">📋</span>
                        <h3 className="font-bold text-slate-800">Informasi Dasar</h3>
                      </div>
                      
                      <div className="kd-form-group">
                        <label className="kd-form-label flex items-center gap-2">
                          <span>🏪</span> Nama Toko
                        </label>
                        <input 
                          required
                          type="text" 
                          className="kd-form-input"
                          placeholder="Masukkan nama brand kuliner Anda"
                          value={settings.store_name} 
                          onChange={e => setSettings({...settings, store_name: e.target.value})} 
                        />
                      </div>

                      <div className="kd-form-group">
                        <label className="kd-form-label flex items-center gap-2">
                          <span>📍</span> Alamat Lengkap
                        </label>
                        <textarea 
                          rows="3"
                          className="kd-form-textarea"
                          placeholder="Jl. Nama Jalan No. XX, Kota..."
                          value={settings.address} 
                          onChange={e => setSettings({...settings, address: e.target.value})} 
                        />
                      </div>

                      <div className="kd-form-row">
                        <div className="kd-form-group">
                          <label className="kd-form-label flex items-center gap-2">
                            <span>📅</span> Hari Operasional
                          </label>
                          <input 
                            type="text" 
                            className="kd-form-input"
                            placeholder="Senin - Minggu"
                            value={settings.operational_days} 
                            onChange={e => setSettings({...settings, operational_days: e.target.value})} 
                          />
                        </div>
                        <div className="kd-form-group">
                          <label className="kd-form-label flex items-center gap-2">
                            <span>🕒</span> Jam Operasional
                          </label>
                          <input 
                            type="text" 
                            className="kd-form-input"
                            placeholder="08:00 - 22:00"
                            value={settings.opening_hours} 
                            onChange={e => setSettings({...settings, opening_hours: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="kd-form-row">
                        <div className="kd-form-group">
                          <label className="kd-form-label flex items-center gap-2">
                            <span>📱</span> WhatsApp
                          </label>
                          <input 
                            type="text" 
                            className="kd-form-input"
                            placeholder="0812..."
                            value={settings.whatsapp_number} 
                            onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} 
                          />
                        </div>
                        <div className="kd-form-group">
                          <label className="kd-form-label flex items-center gap-2">
                            <span>🪑</span> Jumlah Meja
                          </label>
                          <input 
                            type="number" 
                            className="kd-form-input"
                            placeholder="20"
                            value={settings.total_tables} 
                            onChange={e => setSettings({...settings, total_tables: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* PROMO & MARKETING */}
                    <div className="kd-panel">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <span className="text-xl">📢</span>
                        <h3 className="font-bold text-slate-800">Promosi & Tampilan</h3>
                      </div>

                      <div className="kd-form-group">
                        <label className="kd-form-label flex items-center gap-2">
                          <span>🎬</span> Judul Utama Halaman (Hero Title)
                        </label>
                        <input 
                          type="text" 
                          className="kd-form-input"
                          placeholder="Contoh: Kelezatan Daging Kambing Muda Pilihan"
                          value={settings.hero_title} 
                          onChange={e => setSettings({...settings, hero_title: e.target.value})} 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Gunakan tag &lt;em&gt;kata&lt;/em&gt; untuk memberikan efek tulisan miring berwarna emas.</p>
                      </div>

                      <div className="kd-form-group">
                        <label className="kd-form-label flex items-center gap-2">
                          <span>📄</span> Sub-judul / Deskripsi Hero
                        </label>
                        <textarea 
                          rows="2"
                          className="kd-form-textarea"
                          placeholder="Jelaskan keunggulan toko Anda secara singkat..."
                          value={settings.hero_subtitle} 
                          onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} 
                        />
                      </div>
                      
                      <div className="kd-divider my-6 opacity-50"></div>

                      <div className="kd-form-group">
                        <label className="kd-form-label flex items-center gap-2">
                          <span>✨</span> Judul Promo Banner
                        </label>
                        <input 
                          type="text" 
                          className="kd-form-input"
                          placeholder="Contoh: Promo Weekend Mantap!"
                          value={settings.promo_title} 
                          onChange={e => setSettings({...settings, promo_title: e.target.value})} 
                        />
                      </div>

                      <div className="kd-form-group">
                        <label className="kd-form-label flex items-center gap-2">
                          <span>📝</span> Deskripsi Promo
                        </label>
                        <textarea 
                          rows="3"
                          className="kd-form-textarea"
                          placeholder="Jelaskan detail promo Anda di sini..."
                          value={settings.promo_desc} 
                          onChange={e => setSettings({...settings, promo_desc: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* SOCIAL MEDIA */}
                    <div className="kd-panel">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <span className="text-xl">🌐</span>
                        <h3 className="font-bold text-slate-800">Media Sosial</h3>
                      </div>
                      
                      <div className="kd-form-group">
                        <label className="kd-form-label">Username Instagram</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" style={{ fontSize: '14px' }}>@</span>
                          <input 
                            type="text" 
                            className="kd-form-input"
                            style={{ paddingLeft: '40px' }}
                            placeholder="username"
                            value={settings.instagram_url} 
                            onChange={e => setSettings({...settings, instagram_url: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="kd-form-group">
                        <label className="kd-form-label">Link Website (Opsional)</label>
                        <input 
                          type="text" 
                          className="kd-form-input"
                          placeholder="https://..."
                          value={settings.website_url} 
                          onChange={e => setSettings({...settings, website_url: e.target.value})} 
                        />
                      </div>
                    </div>

                    {/* HELP CARD */}
                    <div className="kd-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                      <h4 className="font-bold mb-2">Butuh Bantuan?</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-6">Jika Anda kesulitan mengatur profil toko, hubungi tim support kami melalui tombol di bawah ini.</p>
                      <button type="button" className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">Hubungi Support 💬</button>
                    </div>

                    {/* SAVE BUTTON PANEL */}
                    <div className="kd-panel bg-slate-50 border-slate-100">
                      <p className="text-[10px] text-slate-400 mb-6 text-center italic">Pastikan semua data sudah benar sebelum menyimpan.</p>
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="kd-btn kd-btn-primary w-full py-4 text-lg shadow-xl shadow-[#b48c36]/20"
                      >
                        {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </KulinerAdminLayout>
  );
};

export default AdminSettings;
