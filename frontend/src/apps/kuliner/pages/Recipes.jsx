import React, { useEffect, useState } from 'react';
import { ChevronDown, Check, UtensilsCrossed } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import './KulinerDashboard.css';

export default function Recipes() {
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

  useEffect(() => {
    api.get('/kuliner/admin/products').then((r) => setProducts(r.data));
    api.get('/kuliner/admin/ingredients', { params: { per_page: 100 } }).then((r) => setIngredients(r.data.data || []));
    api.get('/kuliner/admin/modifier-groups').then((r) => setModifierGroups(r.data));
    api.get('/kuliner/admin/addons').then((r) => setAddons(r.data));
  }, []);

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
      toast.success('Resep berhasil disimpan');
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
        <h1 className="kd-page-title">Resep &amp; BOM Menu</h1>
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
              {products.map((p) => {
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
              <div className="kd-panel-header"><span className="kd-panel-title">Pilih Menu</span></div>
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openProduct(p)}
                    style={{
                      padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                      background: selectedProduct?.id === p.id ? 'var(--bg-elevated, #f1f5f9)' : 'transparent',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="kd-panel">
            {!selectedProduct ? (
              <div className="text-center py-10 text-slate-400">Pilih menu untuk mengatur resep.</div>
            ) : (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Resep: {selectedProduct.name}</h3>
                {recipeItems.map((row, idx) => (
                  <div key={idx} className="kd-form-row" style={{ alignItems: 'center', marginBottom: 8 }}>
                    <select className="kd-form-select" value={row.ingredient_id} onChange={(e) => updateRow(idx, 'ingredient_id', e.target.value)}>
                      <option value="">Pilih bahan baku</option>
                      {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                    </select>
                    <input type="number" step="0.001" className="kd-form-input" placeholder="Jumlah" value={row.quantity} onChange={(e) => updateRow(idx, 'quantity', e.target.value)} />
                    <button type="button" className="kd-btn kd-btn-secondary text-red-500" onClick={() => removeRow(idx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="kd-btn kd-btn-secondary" onClick={addRow}>+ Tambah Bahan</button>
                <div style={{ marginTop: 16 }}>
                  <button className="kd-btn kd-btn-primary" onClick={saveRecipe} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Resep'}</button>
                </div>

                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Modifier untuk Menu Ini</h4>
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

                <h4 style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Add-on untuk Menu Ini</h4>
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
