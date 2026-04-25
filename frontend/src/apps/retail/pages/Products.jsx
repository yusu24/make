import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  Package, RefreshCw, 
  Edit3, Trash2, AlertCircle
} from 'lucide-react';
import Modal from '../../../components/Modal';
import '../retail.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSku, setFormSku] = useState('');
  const [search, setSearch] = useState('');

  const generateSKU = () => {
    const prefix = 'BRG';
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${random}`;
  };

  useEffect(() => {
    if (showModal && !editingProduct) {
      setFormSku(generateSKU());
    }
  }, [showModal, editingProduct]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, sRes, uRes] = await Promise.all([
        api.get('/retail/products'),
        api.get('/retail/categories'),
        api.get('/retail/suppliers'),
        api.get('/retail/units')
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      setSuppliers(sRes.data || []);
      setUnits(uRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('name'),
      sku: fd.get('sku'),
      category_id: fd.get('category_id'),
      supplier_id: fd.get('supplier_id'),
      unit: fd.get('unit'),
      price_buy: fd.get('price_buy'),
      price_sell: fd.get('price_sell'),
      stock: fd.get('stock'),
      stock_min: fd.get('stock_min'),
    };
    try {
      if (editingProduct) {
        await api.put(`/retail/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/retail/products', payload);
      }
      fetchData();
      setShowModal(false);
      setEditingProduct(null);
    } catch (e) {}
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setShowModal(true);
  }

  const handleDelete = async (id) => {
    if(confirm('Hapus barang ini dari katalog?')) {
      try {
        await api.delete(`/retail/products/${id}`);
        fetchData();
      } catch(e) { alert('Gagal menghapus produk'); }
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
           <h2 className="page-title">Katalog Barang</h2>
           <p className="page-sub">Kelola daftar produk, harga modal, dan harga jual retail.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
           + Tambah baru
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid-2" style={{ marginBottom: 52 }}>
         <div className="card card-pad flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-xs font-800 text-slate-400 uppercase tracking-widest mb-1">Total Katalog</span>
               <span className="text-2xl font-800 text-slate-800">{products.length} Varian</span>
            </div>
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
               <Package size={24} />
            </div>
         </div>
         <div className="card card-pad flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-xs font-800 text-slate-400 uppercase tracking-widest mb-1">Stok Kritis</span>
               <span className="text-2xl font-800 text-red-500">{products.filter(p => Number(p.stock) <= Number(p.stock_min)).length} Items</span>
            </div>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
               <AlertCircle size={24} />
            </div>
         </div>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Daftar Produk Retail</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="airy-search-wrapper" style={{ width: 280 }}>
              <input 
                placeholder="Cari Produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
               onClick={fetchData} 
               className="btn-reset-sync"
               style={{ width: 42, height: 42 }}
               title="Segarkan Data"
            >
               <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6">Identitas Barang</th>
              <th>Kategori</th>
              <th>Posisi Stok</th>
              <th>Harga Jual</th>
              <th className="pr-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-800">Memuat katalog...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                 <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data produk di katalog.
                 </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.id}>
                  <td className="pl-6">
                      <div className="flex items-center gap-4">
                         <div className="w-1 h-8 bg-slate-200 rounded-full" />
                         <div>
                            <p className="text-base mb-0.5 text-slate-800">{p.name}</p>
                            <code className="text-[10px] text-slate-400 uppercase tracking-wider">{p.sku}</code>
                         </div>
                      </div>
                  </td>
                  <td>
                     <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] text-slate-500 uppercase">
                        {categories.find(c => c.id === p.category_id)?.name || 'General'}
                     </span>
                  </td>
                  <td>
                     <span className={`${Number(p.stock) <= Number(p.stock_min) ? 'text-red-500' : 'text-slate-600'}`}>
                        {p.stock} {p.unit}
                     </span>
                  </td>
                  <td>
                     <span className="text-slate-800">
                        Rp {Number(p.price_sell).toLocaleString('id-ID')}
                     </span>
                  </td>
                  <td className="pr-6 text-right">
                     <div className="flex justify-end gap-2">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost text-red-500" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingProduct(null); }} title={editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}>
        <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Nama Produk</label>
                 <input name="name" className="form-input" placeholder="Contoh: Beras Premium" defaultValue={editingProduct?.name} required />
              </div>
              <div className="form-group">
                 <label className="form-label">SKU (Barcode)</label>
                 <input name="sku" className="form-input" value={formSku} onChange={e => setFormSku(e.target.value)} required />
              </div>
           </div>
           <div className="grid-3">
              <div className="form-group">
                 <label className="form-label">Kategori</label>
                 <select name="category_id" className="form-input" defaultValue={editingProduct?.category_id || ''} required>
                    <option value="" disabled>Pilih...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
              <div className="form-group">
                 <label className="form-label">Supplier</label>
                 <select name="supplier_id" className="form-input" defaultValue={editingProduct?.supplier_id || ''} required>
                   <option value="" disabled>Pilih...</option>
                   {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <div className="form-group">
                 <label className="form-label">Satuan</label>
                 <select name="unit" className="form-input" defaultValue={editingProduct?.unit || ''} required>
                   <option value="" disabled>Pilih...</option>
                   {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                 </select>
              </div>
           </div>
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Harga Modal (Rp)</label>
                 <input name="price_buy" type="number" className="form-input" defaultValue={editingProduct?.price_buy} required />
              </div>
              <div className="form-group">
                 <label className="form-label">Harga Jual (Rp)</label>
                 <input name="price_sell" type="number" className="form-input" defaultValue={editingProduct?.price_sell} required />
              </div>
           </div>
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Stok Awal</label>
                 <input name="stock" type="number" className="form-input" defaultValue={editingProduct?.stock || 0} required />
              </div>
              <div className="form-group">
                 <label className="form-label">Stok Minimum</label>
                 <input name="stock_min" type="number" className="form-input" defaultValue={editingProduct?.stock_min || 5} required />
              </div>
           </div>
           <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingProduct(null); }}>Batal</button>
              <button type="submit" className="btn btn-primary">{editingProduct ? 'Simpan Perubahan' : 'Daftarkan Barang'}</button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
