import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import {
  Package, RefreshCw, Plus,
  Edit3, Trash2, AlertCircle, Download, Upload
} from 'lucide-react';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import '../retail.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSku, setFormSku] = useState('');
  const [multiUnits, setMultiUnits] = useState([]);
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

  const [errors, setErrors] = useState({});

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name) newErrors.name = 'Nama produk wajib diisi';
    if (!data.sku) newErrors.sku = 'SKU wajib diisi';
    if (!data.category_id) newErrors.category_id = 'Pilih kategori';
    if (!data.unit) newErrors.unit = 'Pilih satuan';
    
    if (Number(data.price_buy) < 0) newErrors.price_buy = 'Harga modal tidak boleh minus';
    if (Number(data.price_sell) < 0) newErrors.price_sell = 'Harga jual tidak boleh minus';
    if (Number(data.stock) < 0) newErrors.stock = 'Stok tidak boleh minus';
    if (Number(data.stock_min) < 0) newErrors.stock_min = 'Stok minimum tidak boleh minus';
    
    return newErrors;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setErrors({});
    
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
      commission_rate: fd.get('commission_rate'),
      is_consignment: fd.get('is_consignment') === 'true' ? 1 : 0,
      multi_units: multiUnits,
    };

    const validationErrors = validateForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (editingProduct) {
        await api.put(`/retail/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/retail/products', payload);
      }
      fetchData();
      setShowModal(false);
      setEditingProduct(null);
    } catch (e) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      }
    }
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setMultiUnits(p.multi_units || []);
    setShowModal(true);
  }

  const addMultiUnit = () => {
    setMultiUnits([...multiUnits, { unit: '', conversion: '', price_sell: '', barcode: '' }]);
  };

  const updateMultiUnit = (index, field, value) => {
    const newUnits = [...multiUnits];
    newUnits[index][field] = value;
    setMultiUnits(newUnits);
  };

  const removeMultiUnit = (index) => {
    setMultiUnits(multiUnits.filter((_, i) => i !== index));
  };

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

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex,
  } = usePagination(filteredProducts);


  const handleExport = async () => {
    try {
      const res = await api.get('/retail/products/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'produk_retail.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Gagal mengunduh Excel');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post('/retail/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      setShowImportModal(false);
      alert('Produk berhasil diimpor!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengimpor data produk');
    }
  };

  return (
    <div className="retail-page-classic">
      {/* Page Header (Synced with Finance) */}




      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 animate-fade-in flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package size={24} />
          </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Produk</p>
                <p className="text-2xl font-bold text-slate-800">{products.length}</p>
              </div>
            </div>
            <div className="card p-4 animate-fade-in flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <RefreshCw size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Kategori Tersedia</p>
                <p className="text-2xl font-bold text-slate-800">{categories.length}</p>
              </div>
            </div>
            <div className="card p-4 animate-fade-in flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Stok Menipis</p>
                <p className="text-2xl font-bold text-slate-800">{products.filter(p => Number(p.stock) <= Number(p.stock_min)).length}</p>
              </div>
            </div>
        </div>
      
      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button title="Tambah baru" className="btn btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }} onClick={() => setShowModal(true)}>
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah baru</span>
          </button>
          
          <button 
            title="Import" 
            className="btn" 
            style={{ 
              whiteSpace: 'nowrap', 
              flexShrink: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 42, 
              padding: '0 16px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              fontWeight: 600
            }} 
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={15} className="mr-2 text-blue-600" />
            <span className="btn-text-mobile-hide">Import</span>
          </button>
          
          <button 
            title="Export" 
            className="btn" 
            style={{ 
              whiteSpace: 'nowrap', 
              flexShrink: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 42, 
              padding: '0 16px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              fontWeight: 600
            }} 
            onClick={handleExport}
          >
            <Download size={15} className="mr-2 text-green-600" />
            <span className="btn-text-mobile-hide">Export</span>
          </button>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input 
              placeholder="Cari Produk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchData} 
            className="btn-reset-sync"
            style={{ width: 42, height: 42, flexShrink: 0 }}
            title="Segarkan Data"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Identitas Barang</th>
              <th className="retail-table-header">SKU</th>
              <th className="retail-table-header">Kategori</th>
              <th className="retail-table-header">Posisi Stok</th>
              <th className="retail-table-header">Harga Modal</th>
              <th className="retail-table-header">Harga Jual</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={7} text="Memuat katalog..." />
            ) : filteredProducts.length === 0 ? (
              <tr>
                 <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data produk di katalog.
                 </td>
              </tr>
            ) : (
              paginatedData.map(p => (
                <tr key={p.id}>
                  <td className="pl-6">
                     <p className="retail-text-primary">{p.name}</p>
                  </td>
                  <td>
                     <code className="retail-text-primary uppercase tracking-wider">{p.sku}</code>
                  </td>
                  <td>
                     <span className="px-3 py-1 retail-bg-primary-subtle rounded-lg text-[10px] retail-text-secondary uppercase">
                        {categories.find(c => c.id === p.category_id)?.name || 'General'}
                     </span>
                  </td>
                  <td>
                     <span className={`${Number(p.stock) <= Number(p.stock_min) ? 'retail-text-danger' : 'retail-text-primary'}`}>
                        {Number(p.stock || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })} {p.unit}
                     </span>
                     {p.is_consignment ? (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-purple-100 text-purple-700 border border-purple-200">
                             Titipan
                          </span>
                        </div>
                     ) : null}
                  </td>
                  <td>
                     <span className="text-slate-800 font-medium">
                         Rp {Number(p.price_buy || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                     </span>
                  </td>
                  <td>
                     <span className="retail-text-primary font-medium">
                         Rp {Number(p.price_sell || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                     </span>
                  </td>
                  <td className="pr-6 text-right">
                     <div className="flex justify-end gap-2">
                        <button className="btn btn-sm btn-ghost" title="Edit Data" onClick={() => openEdit(p)}><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost retail-text-danger" title="Hapus Data" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
        <RetailPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingProduct(null); setErrors({}); }} title={editingProduct ? 'Edit Barang' : 'Tambah Barang Baru'}>
        <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Nama Produk</label>
                 <input name="name" className={`form-input ${errors.name ? 'retail-border-danger retail-bg-danger-subtle' : ''}`} placeholder="Contoh: Beras Premium" defaultValue={editingProduct?.name} />
                 {errors.name && <span className="text-[10px] retail-text-danger font-700 mt-1 uppercase tracking-tight">{errors.name}</span>}
              </div>
              <div className="form-group">
                 <label className="form-label">SKU (Barcode)</label>
                 <input name="sku" className={`form-input ${errors.sku ? 'retail-border-danger retail-bg-danger-subtle' : ''}`} value={formSku} onChange={e => setFormSku(e.target.value)} />
                 {errors.sku && <span className="text-[10px] retail-text-danger font-700 mt-1 uppercase tracking-tight">{errors.sku}</span>}
              </div>
           </div>
           <div className="grid-3">
              <div className="form-group">
                 <label className="form-label">Kategori</label>
                 <select name="category_id" className={`form-input ${errors.category_id ? 'retail-border-danger retail-bg-danger-subtle' : ''}`} defaultValue={editingProduct?.category_id || ''}>
                    <option value="" disabled>Pilih...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 {errors.category_id && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.category_id}</span>}
              </div>
              <div className="form-group">
                 <label className="form-label">Supplier</label>
                 <select name="supplier_id" className="form-input" defaultValue={editingProduct?.supplier_id || ''}>
                   <option value="" disabled>Pilih...</option>
                   {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <div className="form-group">
                 <label className="form-label">Satuan</label>
                 <select name="unit" className={`form-input ${errors.unit ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.unit || ''}>
                   <option value="" disabled>Pilih...</option>
                   {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                 </select>
                 {errors.unit && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.unit}</span>}
              </div>
           </div>
            <div className="grid-2">
               <div className="form-group">
                  <label className="form-label">Harga Modal (Rp)</label>
                  <CurrencyInput name="price_buy" className={`form-input ${errors.price_buy ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.price_buy} />
                  {errors.price_buy && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.price_buy}</span>}
               </div>
               <div className="form-group">
                  <label className="form-label">Harga Jual (Rp)</label>
                  <CurrencyInput name="price_sell" className={`form-input ${errors.price_sell ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.price_sell} />
                  {errors.price_sell && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.price_sell}</span>}
               </div>
            </div>

           <div className="form-group border-t border-slate-200 pt-4 mt-2">
              <div className="flex justify-between items-center mb-3">
                 <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Satuan Turunan (Grosir/Packaging)</h4>
                    <p className="text-xs text-slate-500">Contoh: 1 Box = 12 Pcs (Satuan Dasar)</p>
                 </div>
                 <button type="button" className="btn btn-sm btn-secondary" onClick={addMultiUnit}>+ Tambah Satuan</button>
              </div>
              
              {multiUnits.length > 0 && (
                 <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col gap-3">
                    {multiUnits.map((mu, i) => (
                       <div key={i} className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-3">
                             <input 
                                placeholder="Nama (Box)" 
                                className="form-input" 
                                value={mu.unit} 
                                onChange={e => updateMultiUnit(i, 'unit', e.target.value)} 
                             />
                          </div>
                          <div className="col-span-2">
                             <input 
                                type="number"
                                placeholder="Isi" 
                                className="form-input" 
                                value={mu.conversion} 
                                onChange={e => updateMultiUnit(i, 'conversion', e.target.value)} 
                             />
                          </div>
                          <div className="col-span-3">
                             <input 
                                placeholder="Barcode Ops." 
                                className="form-input" 
                                value={mu.barcode || ''} 
                                onChange={e => updateMultiUnit(i, 'barcode', e.target.value)} 
                             />
                          </div>
                          <div className="col-span-3">
                             <input 
                                type="number"
                                placeholder="Harga Jual" 
                                className="form-input" 
                                value={mu.price_sell} 
                                onChange={e => updateMultiUnit(i, 'price_sell', e.target.value)} 
                             />
                          </div>
                          <div className="col-span-1 flex justify-center">
                             <button type="button" className="btn btn-icon text-red-500 hover:bg-red-50 mt-1" onClick={() => removeMultiUnit(i)}>
                                <X size={16} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Stok Awal</label>
                 <input name="stock" type="number" className={`form-input ${errors.stock ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.stock || 0} />
                 {errors.stock && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.stock}</span>}
              </div>
              <div className="form-group">
                 <label className="form-label">Stok Minimum</label>
                 <input name="stock_min" type="number" className={`form-input ${errors.stock_min ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.stock_min || 5} />
                 {errors.stock_min && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.stock_min}</span>}
              </div>
           </div>

           <div className="form-group border-t border-slate-200 pt-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                 <input 
                    type="checkbox" 
                    name="is_consignment" 
                    value="true"
                    defaultChecked={editingProduct?.is_consignment}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                 />
                 <div>
                    <p className="text-sm font-semibold text-slate-700">Ini adalah Barang Konsinyasi (Titipan)</p>
                    <p className="text-xs text-slate-500">Centang jika barang ini adalah titipan dari supplier dan pembayarannya didasarkan pada jumlah yang terjual.</p>
                 </div>
              </label>
           </div>
           
           <div className="form-group">
              <label className="form-label">Komisi Sales / Karyawan (%)</label>
              <input name="commission_rate" type="number" step="0.1" min="0" max="100" className={`form-input ${errors.commission_rate ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.commission_rate || 0} placeholder="Contoh: 5.0" />
              {errors.commission_rate && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.commission_rate}</span>}
              <small className="text-xs text-slate-500 mt-1 block">Persentase dari harga jual yang akan diberikan kepada pramuniaga/sales.</small>
           </div>
           <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingProduct(null); setErrors({}); }}>Batal</button>
              <button type="submit" className="btn btn-primary">{editingProduct ? 'Simpan Perubahan' : 'Daftarkan Barang'}</button>
           </div>
        </form>
      </Modal>

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Produk (Excel/CSV)">
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-2 border border-blue-100">
            <p className="font-semibold mb-1">Panduan Import Data</p>
            <ul className="list-disc pl-5 space-y-1">
               <li>Gunakan format file <strong>.xlsx, .xls, atau .csv</strong>.</li>
               <li>Anda dapat mengunduh data saat ini via tombol <strong>Export</strong> dan menggunakannya sebagai template (ubah isinya, lalu Import kembali).</li>
               <li>Kolom yang wajib ada: <strong>SKU / Barcode</strong> dan <strong>Nama Produk</strong>.</li>
               <li>Jika SKU sudah ada di database, data produk tersebut akan diperbarui. Jika belum ada, akan ditambahkan sebagai produk baru.</li>
            </ul>
          </div>
          <div className="form-group">
            <label className="form-label">Pilih File Excel/CSV</label>
            <input type="file" name="file" accept=".xlsx,.xls,.csv" required className="form-input" />
          </div>
          <div className="modal__actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Upload size={16} />
              Upload & Proses
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
