import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './CategoryStorefront.css';

const AdminCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/kuliner/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '', image_url: category.image_url || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image_url: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image_url: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/kuliner/admin/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/kuliner/admin/categories', formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      try {
        await api.delete(`/kuliner/admin/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  return (
    <div className="kl-admin-dashboard" style={{ background: '#fdfaf5', minHeight: '100vh', color: '#1a140e' }}>
      <div className="kl-admin-nav" style={{ background: '#fff', padding: '20px 48px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="kl-logo">Panel <em>{user?.tenant_name || 'Toko'}</em></div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/kuliner" className="kl-btn-ghost" style={{ fontSize: 13, color: '#666' }}>Lihat Storefront</Link>
          <Link to="/kuliner/admin" className="kl-btn-ghost" style={{ fontSize: 13, color: '#666' }}>Dashboard</Link>
          <Link to="/kuliner/admin/settings" className="kl-btn-ghost" style={{ fontSize: 13, color: '#666' }}>Pengaturan Toko</Link>
        </div>
      </div>

      <div style={{ padding: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div className="kl-section-header" style={{ textAlign: 'left', marginBottom: 0 }}>
            <h2 style={{ fontSize: 32, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#1a140e' }}>Manajemen <em>Kategori</em></h2>
            <p style={{ color: '#888', fontSize: 16, marginTop: 8 }}>Atur kategori kuliner Anda di sini.</p>
          </div>
          <button className="kl-checkout-btn" style={{ marginTop: 0, width: 'auto', padding: '12px 32px' }} onClick={() => handleOpenModal()}>+ Kategori Baru</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <p>Memuat data kuliner...</p>
          </div>
        ) : (
          <div className="kl-menu-grid">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="kl-menu-item" style={{ background: '#fff', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div className={`kl-menu-item-img kl-mi-${(idx % 6) + 1}`}>
                  {cat.image_url ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                </div>
                <div className="kl-menu-item-body">
                  <h4 style={{ color: '#1a140e', fontWeight: 700 }}>{cat.name}</h4>
                  <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>{cat.description || 'Pilihan hidangan lezat.'}</p>
                  <div className="kl-menu-item-footer" style={{ marginTop: 20 }}>
                    <button onClick={() => handleOpenModal(cat)} className="kl-btn-ghost" style={{ flex: 1, padding: '10px', fontSize: 12, borderColor: '#eee' }}>Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="kl-btn-ghost" style={{ flex: 1, padding: '10px', fontSize: 12, color: '#ef4444', borderColor: '#fee2e2' }}>Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 450, padding: 40, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, marginBottom: 24, color: '#1a140e' }}>{editingCategory ? 'Edit' : 'Tambah'} <em>Kategori</em></h2>
            <form onSubmit={handleSubmit} className="kl-checkout-form">
              <div className="kl-form-group">
                <label style={{ color: '#666' }}>Nama Kategori</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Makanan Berat" />
              </div>
              <div className="kl-form-group">
                <label style={{ color: '#666' }}>Deskripsi</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Penjelasan singkat..."></textarea>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={saving} className="kl-nav-cta" style={{ flex: 1, border: 'none', cursor: 'pointer' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                <button type="button" onClick={handleCloseModal} className="kl-btn-ghost" style={{ flex: 1, borderColor: '#eee' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
