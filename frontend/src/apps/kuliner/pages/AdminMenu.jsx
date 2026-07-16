import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import './KulinerDashboard.css';

const AdminMenu = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filter states (at component level — correct hook placement)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: '',
    discount_price: '',
    description: '',
    image_url: '',
    is_available: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/kuliner/admin/products'),
        api.get('/kuliner/admin/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered products derived from the 3 filter states
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory ||
        String(product.category_id) === String(selectedCategory);

      let matchesAvailability = true;
      if (availabilityFilter === 'available') {
        matchesAvailability = product.is_available === true || product.is_available === 1;
      } else if (availabilityFilter === 'out_of_stock') {
        matchesAvailability = product.is_available === false || product.is_available === 0;
      }

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, searchQuery, selectedCategory, availabilityFilter]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== '' || availabilityFilter !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setAvailabilityFilter('');
  };

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingItem(product);
      setProductForm({
        name: product.name,
        category_id: product.category_id || '',
        price: product.price,
        discount_price: product.discount_price || '',
        description: product.description || '',
        image_url: product.image_url || '',
        is_available: product.is_available ?? true
      });
    } else {
      setEditingItem(null);
      setProductForm({ name: '', category_id: '', price: '', discount_price: '', description: '', image_url: '', is_available: true });
    }
    setShowProductModal(true);
  };

  const formatRp = (n) => {
    if (n === undefined || n === null) return 'Rp 0';
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(parseInt(n));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setProductForm({ ...productForm, price: value });
  };

  const handleDiscountPriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setProductForm({ ...productForm, discount_price: value });
  };

  const displayPrice = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(val));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        price: parseInt(productForm.price) || 0,
        discount_price: productForm.discount_price ? parseInt(productForm.discount_price) : null
      };
      if (editingItem) {
        await api.put(`/kuliner/admin/products/${editingItem.id}`, payload);
      } else {
        await api.post('/kuliner/admin/products', payload);
      }
      alert('Menu berhasil disimpan! ✨');
      fetchData();
      setShowProductModal(false);
    } catch (error) {
      alert('Gagal menyimpan produk: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Hapus menu ini?')) {
      try {
        await api.delete(`/kuliner/admin/products/${id}`);
        alert('Menu berhasil dihapus.');
        fetchData();
      } catch (error) {
        alert('Gagal menghapus produk');
      }
    }
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingItem(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || '📁'
      });
    } else {
      setEditingItem(null);
      setCategoryForm({ name: '', description: '', image_url: '📁' });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/categories/${editingItem.id}`, categoryForm);
        alert('Kategori berhasil diperbarui! ✨');
      } else {
        await api.post('/kuliner/admin/categories', categoryForm);
        alert('Kategori berhasil ditambahkan! 📁');
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '', image_url: '📁' });
      fetchData();
    } catch (error) {
      console.error('Failed to save category:', error);
      const msg = error.response?.data?.message || 'Gagal menyimpan kategori';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Hapus kategori ini? Semua produk dalam kategori ini tetap ada tapi tidak memiliki kategori.')) {
      try {
        await api.delete(`/kuliner/admin/categories/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus kategori');
      }
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Manajemen Katalog</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          {activeTab === 'products' ? (
            <button className="kd-btn kd-btn-primary" onClick={() => handleOpenProductModal()}>
              + Tambah Menu Baru
            </button>
          ) : (
            <button className="kd-btn kd-btn-primary" onClick={() => handleOpenCategoryModal()}>
              + Tambah Kategori Baru
            </button>
          )}
        </div>

        <div className="kd-panel">
          {/* Header: Tabs + Filter Bar */}
          <div className="kd-panel-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '14px' }}>
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <button
                className={`kd-btn flex-shrink-0 ${activeTab === 'products' ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                onClick={() => setActiveTab('products')}
                style={{ padding: '8px 18px', fontSize: 12, whiteSpace: 'nowrap' }}
              >
                Daftar Menu
              </button>
              <button
                className={`kd-btn flex-shrink-0 ${activeTab === 'categories' ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                onClick={() => setActiveTab('categories')}
                style={{ padding: '8px 18px', fontSize: 12, whiteSpace: 'nowrap' }}
              >
                Kategori Menu
              </button>
            </div>

            {/* Filter Bar — only visible in Products tab */}
            {activeTab === 'products' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
                paddingTop: 4,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 14
              }}>
                {/* Search Field */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14, pointerEvents: 'none' }}>
                    🔍
                  </span>
                  <input
                    type="text"
                    className="kd-form-input"
                    style={{ height: 38, fontSize: 12, paddingLeft: 32, margin: 0 }}
                    placeholder="Cari nama / deskripsi menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <select
                  className="kd-form-select"
                  style={{ height: 38, fontSize: 12, padding: '0 12px', margin: 0 }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.image_url ? `${c.image_url} ` : ''}{c.name}</option>
                  ))}
                </select>

                {/* Availability Filter */}
                <select
                  className="kd-form-select"
                  style={{ height: 38, fontSize: 12, padding: '0 12px', margin: 0 }}
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="">Semua Status Stok</option>
                  <option value="available">✅ Tersedia</option>
                  <option value="out_of_stock">❌ Habis</option>
                </select>

                {/* Reset Filter Button — appears only when filters are active */}
                {hasActiveFilters && (
                  <button
                    className="kd-btn kd-btn-secondary"
                    onClick={resetFilters}
                    style={{ height: 38, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    ✕ Hapus Filter
                  </button>
                )}
              </div>
            )}

            {/* Result count summary when filters active */}
            {activeTab === 'products' && hasActiveFilters && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -4 }}>
                Menampilkan <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> dari <strong style={{ color: 'var(--text-primary)' }}>{products.length}</strong> menu
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="kd-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>

            {/* Products Table */}
            {activeTab === 'products' && (
              <table className="kd-table">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10 text-slate-400">Sedang memuat menu lezat...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        {hasActiveFilters
                          ? <><div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div><div style={{ fontWeight: 600, marginBottom: 4 }}>Tidak ada menu yang cocok</div><div style={{ fontSize: 11 }}>Coba ubah atau <button onClick={resetFilters} style={{ color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>hapus filter</button></div></>
                          : <><div style={{ fontSize: 28, marginBottom: 8 }}>🍽️</div><div>Belum ada menu di katalog ini.</div></>
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shadow-sm border border-slate-50">
                              {product.image_url || '🍲'}
                            </div>
                            <div>
                              <div className="kd-menu-name">{product.name}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="font-bold text-slate-700">{formatRp(product.price)}</td>
                        <td>
                          <span className={`kd-status-badge ${product.is_available ? 'kd-status-active' : 'kd-status-hidden'}`}>
                            {product.is_available ? 'Tersedia' : 'Habis'}
                          </span>
                        </td>
                        <td className="text-right">
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="kd-icon-btn" title="Edit" onClick={() => handleOpenProductModal(product)}><Edit3 size={16} /></button>
                            <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDeleteProduct(product.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Categories Table */}
            {activeTab === 'categories' && (
              <table className="kd-table">
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Deskripsi</th>
                    <th>Total Produk</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-10 text-slate-400">Sedang mengambil daftar kategori...</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-10 text-slate-400">Belum ada kategori yang dibuat.</td></tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="text-2xl">{cat.image_url || '📂'}</div>
                            <div className="kd-menu-name">{cat.name}</div>
                          </div>
                        </td>
                        <td className="text-xs text-slate-500 italic max-w-[300px] line-clamp-1">{cat.description || '-'}</td>
                        <td>
                          <span className="font-bold text-[#b48c36]">
                            {products.filter(p => p.category_id === cat.id).length}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1 font-bold">Menu</span>
                        </td>
                        <td className="text-right">
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="kd-icon-btn" title="Edit" onClick={() => handleOpenCategoryModal(cat)}><Edit3 size={16} /></button>
                            <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDeleteCategory(cat.id)}><Trash2 size={16} /></button>
                          </div>
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

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowProductModal(false)}>
          <div className="kd-modal max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Tambah'} Menu Kuliner</h2>
              <button className="kd-close-btn" onClick={() => setShowProductModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nama Menu</label>
                  <input
                    required
                    className="kd-form-input"
                    placeholder="Contoh: Rendang Daging"
                    value={productForm.name}
                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>

                <div className="kd-form-row">
                  <div className="kd-form-group">
                    <label className="kd-form-label">Kategori</label>
                    <select
                      className="kd-form-select"
                      value={productForm.category_id}
                      onChange={e => setProductForm({...productForm, category_id: e.target.value})}
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label">Harga Asli (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" style={{ fontSize: '13px' }}>Rp</span>
                      <input
                        required
                        type="text"
                        className="kd-form-input"
                        style={{ paddingLeft: '40px' }}
                        placeholder="0"
                        value={displayPrice(productForm.price)}
                        onChange={handlePriceChange}
                      />
                    </div>
                  </div>
                  <div className="kd-form-group">
                    <label className="kd-form-label text-green-600 font-bold">Harga Promo (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-bold" style={{ fontSize: '13px' }}>Rp</span>
                      <input
                        type="text"
                        className="kd-form-input border-green-200 focus:border-green-500"
                        style={{ paddingLeft: '40px' }}
                        placeholder="Kosongkan jika tidak promo"
                        value={displayPrice(productForm.discount_price)}
                        onChange={handleDiscountPriceChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="kd-form-group">
                  <label className="kd-form-label">Deskripsi Lezat</label>
                  <textarea
                    rows="3"
                    className="kd-form-textarea"
                    placeholder="Ceritakan keunggulan menu ini..."
                    value={productForm.description}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>

                <div className="kd-form-group">
                  <label className="kd-form-label">URL Foto Menu (Opsional)</label>
                  <input
                    className="kd-form-input"
                    placeholder="https://..."
                    value={productForm.image_url}
                    onChange={e => setProductForm({...productForm, image_url: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="status"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={productForm.is_available}
                    onChange={e => setProductForm({...productForm, is_available: e.target.checked})}
                  />
                  <label htmlFor="status" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                    Tandai sebagai menu yang tersedia
                  </label>
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowProductModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowCategoryModal(false)}>
          <div className="kd-modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Tambah'} Kategori</h2>
              <button className="kd-close-btn" onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Ikon Kategori</label>
                  <select
                    className="kd-form-select"
                    style={{ fontSize: '14px' }}
                    value={categoryForm.image_url}
                    onChange={e => setCategoryForm({...categoryForm, image_url: e.target.value})}
                  >
                    <option value="📁">📁 Default</option>
                    <option value="🍛">🍛 Makanan</option>
                    <option value="🥤">🥤 Minuman</option>
                    <option value="🍰">🍰 Dessert</option>
                    <option value="🍜">🍜 Mie & Bakso</option>
                    <option value="🔥">🔥 Promo Panas</option>
                    <option value="🥗">🥗 Sehat</option>
                  </select>
                </div>

                <div className="kd-form-group">
                  <label className="kd-form-label">Nama Kategori</label>
                  <input
                    required
                    type="text"
                    className="kd-form-input"
                    placeholder="Contoh: Makanan Utama"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                  />
                </div>

                <div className="kd-form-group" style={{ marginBottom: 0 }}>
                  <label className="kd-form-label">Deskripsi (Opsional)</label>
                  <textarea
                    className="kd-form-textarea"
                    placeholder="Berikan keterangan singkat..."
                    rows="3"
                    value={categoryForm.description}
                    onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowCategoryModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default AdminMenu;
