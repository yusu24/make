import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Link } from 'react-router-dom';
import './CategoryStorefront.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    store_name: '',
    address: '',
    phone: '',
    opening_hours: '',
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
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="kl-loading">Memuat Pengaturan...</div>;

  return (
    <div className="kl-admin-dashboard" style={{ background: '#fdfaf5', minHeight: '100vh', color: '#1a140e' }}>
      <nav className="kl-admin-nav" style={{ background: '#fff', padding: '20px 48px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="kl-logo">Admin <em>Settings</em></div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/kuliner" className="kl-btn-ghost" style={{ fontSize: 13, color: '#666' }}>Lihat Storefront</Link>
          <Link to="/kuliner/admin" className="kl-btn-ghost" style={{ fontSize: 13, color: '#666' }}>Dashboard</Link>
          <Link to="/kuliner/admin/categories" className="kl-btn-ghost" style={{ fontSize: 13, color: '#666' }}>Kategori</Link>
        </div>
      </nav>

      <section style={{ padding: '60px 48px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="kl-section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontFamily: 'Playfair Display, serif', fontWeight: 700, marginBottom: 0 }}>Pengaturan <em>Toko</em></h2>
        </div>

        {message && (
          <div style={{ padding: '16px 24px', borderRadius: '12px', background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#166534' : '#991b1b', marginBottom: 32, fontSize: 14, fontWeight: 600, border: '1px solid #eee' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="kl-checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 24 }}>Informasi Dasar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="kl-form-group">
                <label style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>Nama Toko</label>
                <input type="text" value={settings.store_name} onChange={e => setSettings({...settings, store_name: e.target.value})} style={{ border: '1px solid #ddd', background: '#fff' }} placeholder="Masukkan nama toko" />
              </div>
              <div className="kl-form-group">
                <label style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>Alamat Toko</label>
                <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} style={{ border: '1px solid #ddd', background: '#fff' }} placeholder="Alamat lengkap" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="kl-form-group">
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>No. WhatsApp</label>
                  <input type="text" value={settings.whatsapp_number} onChange={e => setSettings({...settings, whatsapp_number: e.target.value})} style={{ border: '1px solid #ddd', background: '#fff' }} placeholder="0812..." />
                </div>
                <div className="kl-form-group">
                  <label style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>Jam Operasional</label>
                  <input type="text" value={settings.opening_hours} onChange={e => setSettings({...settings, opening_hours: e.target.value})} style={{ border: '1px solid #ddd', background: '#fff' }} placeholder="Senin - Minggu (08:00 - 22:00)" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 24 }}>Promosi & Banner</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="kl-form-group">
                <label style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>Judul Promo</label>
                <input type="text" value={settings.promo_title} onChange={e => setSettings({...settings, promo_title: e.target.value})} style={{ border: '1px solid #ddd', background: '#fff' }} placeholder="Contoh: Promo Spesial Akhir Pekan" />
              </div>
              <div className="kl-form-group">
                <label style={{ fontWeight: 700, fontSize: 13, color: '#333' }}>Deskripsi Promo</label>
                <textarea rows="3" value={settings.promo_desc} onChange={e => setSettings({...settings, promo_desc: e.target.value})} style={{ border: '1px solid #ddd', background: '#fff' }} placeholder="Tuliskan detail promo Anda..."></textarea>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 20 }}>
            <button type="submit" disabled={saving} className="kl-checkout-btn" style={{ width: 'auto', padding: '16px 60px', marginTop: 0 }}>
              {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdminSettings;
