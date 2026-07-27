import React, { useEffect, useState } from 'react';
import { ChevronDown, Check, UtensilsCrossed, Trash2 } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import ClientPagination from '../components/ClientPagination';
import './KulinerDashboard.css';

export default function Recipes() {
  const { t } = useTranslation();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [addons, setAddons] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipeItems, setRecipeItems] = useState([]);
  const [attachedGroups, setAttachedGroups] = useState([]);
  const [attachedAddons, setAttachedAddons] = useState([]);
  const [saving, setSaving] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  // New states for filtering & pagination
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Number of items in sidebar per page

  useEffect(() => {
    api.get('/kuliner/admin/products').then((r) => setProducts(r.data));
    api.get('/kuliner/admin/categories').then((r) => setCategories(r.data));
    api.get('/kuliner/admin/ingredients', { params: { per_page: 100 } }).then((r) => setIngredients(r.data.data || []));
    api.get('/kuliner/admin/modifier-groups').then((r) => setModifierGroups(r.data));
    api.get('/kuliner/admin/addons').then((r) => setAddons(r.data));
  }, []);

  // Filter products based on search and category
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || String(p.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Pagination for products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const openProduct = async (product) => {
    setSelectedProduct(product);
    const res = await api.get(`/kuliner/admin/products/${product.id}/recipe`);
    setRecipeItems(res.data.map((r) => ({ ingredient_id: r.ingredient_id, quantity: r.quantity, note: r.note || '' })));
    setAttachedGroups((product.modifier_groups || []).map((g) => g.id));
    setAttachedAddons((product.addons || []).map((a) => a.id));
  };

  const addRow = () => setRecipeItems((rows) => [...rows, { ingredient_id: '', quantity: '', note: '' }]);
  const removeRow = (idx) => setRecipeItems((rows) => rows.filter((_, i) => i !== idx));
  const updateRow = (idx, key, value) => setRecipeItems((rows) => rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  const saveRecipe = async () => {
    setSaving(true);
    try {
      const items = recipeItems.filter((r) => r.ingredient_id && r.quantity);
      await api.put(`/kuliner/admin/products/${selectedProduct.id}/recipe`, { items });
      toast.success(t('kulinerInventory.alertSaveSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan resep');
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = async (groupId, attached) => {
    try {
      if (attached) {
        await api.delete(`/kuliner/admin/products/${selectedProduct.id}/modifier-groups/${groupId}`);
        setAttachedGroups((prev) => prev.filter((id) => id !== groupId));
      } else {
        await api.post(`/kuliner/admin/products/${selectedProduct.id}/modifier-groups/${groupId}`);
        setAttachedGroups((prev) => [...prev, groupId]);
      }
    } catch {
      toast.error('Gagal memperbarui modifier produk');
    }
  };

  const toggleAddon = async (addonId, attached) => {
    try {
      if (attached) {
        await api.delete(`/kuliner/admin/products/${selectedProduct.id}/addons/${addonId}`);
        setAttachedAddons((prev) => prev.filter((id) => id !== addonId));
      } else {
        await api.post(`/kuliner/admin/products/${selectedProduct.id}/addons/${addonId}`);
        setAttachedAddons((prev) => [...prev, addonId]);
      }
    } catch {
      toast.error('Gagal memperbarui add-on produk');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerInventory.recipesTitle')}</h1>
      </div>
      <div className="kd-content">
        <style>{`
          .kr-layout { display: grid; grid-template-columns: 280px 1fr; gap: 16px; align-items: flex-start; }
          .kr-sidebar-wrapper { display: block; }
          .kr-mobile-dropdown-container { display: none; width: 100%; margin-bottom: 16px; position: relative; z-index: 50; }
          @media (max-width: 768px) {
            .kr-layout { grid-template-columns: 1fr; }
            .kr-sidebar-wrapper { display: none; }
            .kr-mobile-dropdown-container { display: block; }
          }
        `}</style>

        {/* Mobile dropdown selector — replaces the desktop sidebar list */}
        <div className="kr-mobile-dropdown-container">
          <button
            onClick={() => setMobileDropdownOpen((v) => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              color: '#1e293b', textAlign: 'left',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#fef3e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b48c36', flexShrink: 0,
            }}>
              <UtensilsCrossed size={16} />
            </div>
            <span style={{ flex: 1 }}>{selectedProduct ? selectedProduct.name : 'Pilih Menu'}</span>
            <ChevronDown size={16} style={{ color: '#94a3b8', transform: mobileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {mobileDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              overflow: 'hidden', maxHeight: 320, overflowY: 'auto', zIndex: 60,
            }}>
              {filteredProducts.map((p) => {
                const isActive = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { openProduct(p); setMobileDropdownOpen(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', border: 'none',
                      background: isActive ? '#fef3e2' : '#fff',
                      color: isActive ? '#b48c36' : '#1e293b',
                      cursor: 'pointer', fontSize: 13.5, fontWeight: isActive ? 600 : 500, textAlign: 'left',
                    }}
                  >
                    <span style={{ flex: 1 }}>{p.name}</span>
                    {isActive && <Check size={14} style={{ color: '#b48c36' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="kr-layout">
          <div className="kr-sidebar-wrapper">
            <div className="kd-panel">
              <div className="kd-panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                <span className="kd-panel-title">Pilih Menu</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    className="kd-form-input"
                    placeholder="Cari menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: 12, padding: '8px 12px' }}
                  />
                  <select
                    className="kd-form-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ fontSize: 12, padding: '8px 12px' }}
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {currentProducts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">Tidak ada menu yang sesuai filter.</div>
                ) : (
                  currentProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openProduct(p)}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                        background: selectedProduct?.id === p.id ? 'var(--bg-elevated, #f1f5f9)' : 'transparent',
                        borderBottom: '1px solid #f1f5f9',
                        fontWeight: selectedProduct?.id === p.id ? '600' : 'normal'
                      }}
                    >
                      {p.name}
                    </div>
                  ))
                )}
              </div>
              {filteredProducts.length > itemsPerPage && (
                <div style={{ borderTop: '1px solid #f1f5f9' }}>
                  <ClientPagination setItemsPerPage={setItemsPerPage} 
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredProducts.length}
                    compact={true}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="kd-panel">
            {!selectedProduct ? (
              <div className="text-center py-10 text-slate-400">{t('kulinerInventory.formRecipeMenuInfo')}</div>
            ) : (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Resep: {selectedProduct.name}</h3>
                <div className="kd-table-container" style={{ marginBottom: 16 }}>
                  <table className="kd-table">
                    <thead>
                      <tr>
                        <th>{t('kulinerInventory.headerRecipeItem') || 'Bahan Baku'}</th>
                        <th style={{ width: 150 }}>{t('kulinerInventory.headerWasteQty') || 'Jumlah'}</th>
                        <th style={{ width: 60 }} className="text-center">{t('kulinerInventory.headerAction') || 'Aksi'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeItems.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '6px 12px' }}>
                            <select className="kd-form-select" style={{ marginBottom: 0, padding: '6px 10px', fontSize: 13, height: 'auto' }} value={row.ingredient_id} onChange={(e) => updateRow(idx, 'ingredient_id', e.target.value)}>
                              <option value="">{t('kulinerInventory.formRecipeIngredient')}</option>
                              {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <input type="number" step="0.001" className="kd-form-input" style={{ marginBottom: 0, padding: '6px 10px', fontSize: 13, height: 'auto' }} placeholder={t('kulinerInventory.formRecipeQty') || 'Jumlah'} value={row.quantity} onChange={(e) => updateRow(idx, 'quantity', e.target.value)} />
                          </td>
                          <td style={{ padding: '6px 12px' }} className="text-center">
                            <button type="button" className="kd-icon-btn text-red-500 mx-auto" style={{ padding: 6 }} onClick={() => removeRow(idx)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {recipeItems.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center py-6 text-slate-400 text-sm">
                            {t('kulinerInventory.emptyRecipeItems') || 'Belum ada bahan baku ditambahkan.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="kd-btn kd-btn-secondary" onClick={addRow}>{t('kulinerInventory.formRecipeAddItemBtn')}</button>
                <div style={{ marginTop: 16 }}>
                  <button className="kd-btn kd-btn-primary" onClick={saveRecipe} disabled={saving}>{saving ? t('kulinerInventory.savingBtn') : t('kulinerInventory.saveBtn')}</button>
                </div>

                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{t('kulinerExtra.modifierForMenu') || 'Modifier untuk Menu Ini'}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {modifierGroups.map((g) => {
                    const attached = attachedGroups.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        className={`kd-btn ${attached ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                        style={{ fontSize: 11, padding: '6px 12px' }}
                        onClick={() => toggleGroup(g.id, attached)}
                      >
                        {attached ? '✓ ' : '+ '}{g.name}
                      </button>
                    );
                  })}
                </div>

                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{t('kulinerExtra.addonForMenu') || 'Add-on untuk Menu Ini'}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {addons.map((a) => {
                    const attached = attachedAddons.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        className={`kd-btn ${attached ? 'kd-btn-primary' : 'kd-btn-secondary'}`}
                        style={{ fontSize: 11, padding: '6px 12px' }}
                        onClick={() => toggleAddon(a.id, attached)}
                      >
                        {attached ? '✓ ' : '+ '}{a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </KulinerAdminLayout>
  );
}
