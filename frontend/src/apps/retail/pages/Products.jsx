import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Package, RefreshCw, Plus, Pencil, Trash2, AlertCircle, Download, Upload } from '@/constants/icons';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import StatScoreCard from '@/components/ui/StatScoreCard';
import EmptyTableState from '../../../components/EmptyTableState';
import FormLabel from '../../../components/FormLabel';
import '../retail.css';

export default function Products() {
  const toast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
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
    const ok = await confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?', {
      title: 'Hapus Produk',
      confirmLabel: 'Ya, Hapus',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/retail/products/${id}`);
      toast.success('Produk berhasil dihapus dari katalog');
      fetchData();
    } catch(e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus produk');
    }
  };

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


  const handleExport = async (format = 'xlsx') => {
    try {
      const res = await api.get(`/retail/products/export?format=${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `katalog_produk_${new Date().toISOString().slice(0,10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Katalog produk berhasil diunduh');
    } catch (e) {
      toast.error('Gagal mengunduh katalog produk');
    }
  };

  const handleDownloadTemplate = async (format = 'xlsx') => {
    try {
      const res = await api.get(`/retail/products/template?format=${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `template_import_produk.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Template ${format.toUpperCase()} berhasil diunduh`);
    } catch (e) {
      toast.error('Gagal mengunduh template');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('file');
    if (!file || !file.name) {
      toast.error('Silakan pilih file Excel atau CSV terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const res = await api.post('/retail/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      setShowImportModal(false);
      toast.success(res.data?.message || 'Produk berhasil diimpor ke katalog!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimpor data produk');
    } finally {
      setImporting(false);
    }
  };

  const lowStockCount = products.filter(p => Number(p.stock) <= Number(p.stock_min)).length;

  return (
    <div className="retail-page-classic">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatScoreCard
          title="TOTAL PRODUK"
          value={products.length}
          icon={Package}
          statusBadge={{ text: "Katalog", color: "indigo" }}
          subtitle="Seluruh SKU produk terdaftar"
          progressBar={{ value: 100, color: "bg-indigo-500" }}
        />
        <StatScoreCard
          title="KATEGORI TERSEDIA"
          value={categories.length}
          icon={RefreshCw}
          statusBadge={{ text: "Aktif", color: "blue" }}
          subtitle="Klasifikasi departemen barang"
          progressBar={{ value: 85, color: "bg-blue-500" }}
        />
        <StatScoreCard
          title="STOK MENIPIS"
          value={lowStockCount}
          icon={AlertCircle}
          statusBadge={{
            text: lowStockCount > 0 ? "Perlu Reorder" : "Aman",
            color: lowStockCount > 0 ? "rose" : "emerald"
          }}
          subtitle="Stok mendekati batas minimum"
          progressBar={{
            value: Math.min(100, lowStockCount * 12),
            color: lowStockCount > 0 ? "bg-rose-500" : "bg-emerald-500"
          }}
        />
      </div>
      
      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            title="Tambah baru"
            className="h-[38px] px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all shrink-0 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Plus size={15} className="mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Produk</span>
          </button>
          
          <button 
            title="Import Excel" 
            className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold text-xs shadow-xs transition-colors shrink-0" 
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="btn-text-mobile-hide">Import</span>
          </button>
          
          <button 
            title="Export Excel" 
            className="h-[38px] px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-xs shadow-xs transition-colors shrink-0" 
            onClick={handleExport}
          >
            <Download size={14} className="text-emerald-600 dark:text-emerald-400" />
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
            style={{ width: 38, height: 38, flexShrink: 0 }}
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
              search ? (
                <EmptyTableState
                  colSpan={7}
                  icon={Package}
                  title="Produk tidak ditemukan"
                  description={`Tidak ada produk yang cocok dengan pencarian "${search}".`}
                  actionLabel="Reset Pencarian"
                  onAction={() => setSearch('')}
                />
              ) : (
                <tr>
                  <td colSpan={7} className="p-0 border-none">
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-lg mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs border border-indigo-100 dark:border-indigo-900/50">
                        <Package size={28} className="stroke-[1.75]" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                        Katalog Toko Masih Kosong
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                        Mulai isi katalog barang toko Anda untuk memulai operasional kasir & penjualan. Anda dapat langsung mengimpor banyak produk sekaligus via file Excel/CSV atau menginput secara manual.
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                        <button
                          type="button"
                          onClick={() => setShowImportModal(true)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                        >
                          <Upload size={15} />
                          Import Massal Excel / CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <Plus size={15} />
                          Tambah Produk Manual
                        </button>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-2 text-xs text-slate-500">
                        <span>Belum punya format Excel?</span>
                        <button
                          type="button"
                          onClick={() => handleDownloadTemplate('xlsx')}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={13} />
                          Unduh Template Excel Siap Pakai
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )
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
                        <button className="btn btn-sm btn-ghost" title="Edit Data" onClick={() => openEdit(p)}><Pencil size={14} /></button>
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
                 <FormLabel required>Nama Produk</FormLabel>
                 <input name="name" className={`form-input ${errors.name ? 'retail-border-danger retail-bg-danger-subtle' : ''}`} placeholder="Contoh: Beras Premium" defaultValue={editingProduct?.name} />
                 {errors.name && <span className="text-[10px] retail-text-danger font-700 mt-1 uppercase tracking-tight">{errors.name}</span>}
              </div>
              <div className="form-group">
                 <FormLabel required helper="Barcode">SKU (Barcode)</FormLabel>
                 <input name="sku" className={`form-input ${errors.sku ? 'retail-border-danger retail-bg-danger-subtle' : ''}`} value={formSku} onChange={e => setFormSku(e.target.value)} />
                 {errors.sku && <span className="text-[10px] retail-text-danger font-700 mt-1 uppercase tracking-tight">{errors.sku}</span>}
              </div>
           </div>
           <div className="grid-3">
              <div className="form-group">
                 <FormLabel required>Kategori</FormLabel>
                 <select name="category_id" className={`form-input ${errors.category_id ? 'retail-border-danger retail-bg-danger-subtle' : ''}`} defaultValue={editingProduct?.category_id || ''}>
                    <option value="" disabled>Pilih...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 {errors.category_id && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.category_id}</span>}
              </div>
              <div className="form-group">
                 <FormLabel helper="Opsional">Supplier</FormLabel>
                 <select name="supplier_id" className="form-input" defaultValue={editingProduct?.supplier_id || ''}>
                   <option value="" disabled>Pilih...</option>
                   {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <div className="form-group">
                 <FormLabel required>Satuan</FormLabel>
                 <select name="unit" className={`form-input ${errors.unit ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.unit || ''}>
                   <option value="" disabled>Pilih...</option>
                   {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                 </select>
                 {errors.unit && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.unit}</span>}
              </div>
           </div>
            <div className="grid-2">
               <div className="form-group">
                  <FormLabel required>Harga Modal (Rp)</FormLabel>
                  <CurrencyInput name="price_buy" className={`form-input ${errors.price_buy ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingProduct?.price_buy} />
                  {errors.price_buy && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.price_buy}</span>}
               </div>
               <div className="form-group">
                  <FormLabel required>Harga Jual (Rp)</FormLabel>
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

      <Modal isOpen={showImportModal} onClose={() => { if (!importing) setShowImportModal(false); }} title="Import Katalog Produk (Excel / CSV)">
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          {/* Step 1: Download Template */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5">Langkah 1: Unduh Format Template</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan file template resmi yang telah berisi judul kolom & contoh data.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('xlsx')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Download size={13} />
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('csv')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download size={13} />
                  CSV
                </button>
              </div>
            </div>
          </div>

          {/* Panduan / Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 p-4 rounded-xl text-xs border border-blue-100 dark:border-blue-900/60 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <span>💡</span> Ketentuan & Kemudahan Import:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Kolom Utama:</strong> SKU / Barcode, Nama Produk, Kategori, Satuan Dasar, Harga Beli (Modal), Harga Jual, Stok Awal, Stok Minimum.</li>
              <li><strong>Kategori & Satuan Otomatis:</strong> Kategori atau satuan baru yang tertulis di Excel akan <em>otomatis dibuatkan</em> oleh sistem.</li>
              <li><strong>Pembaruan Otomatis:</strong> Jika kode SKU sudah ada di toko Anda, sistem akan otomatis memperbarui harga dan stoknya.</li>
              <li>Mendukung file format <strong>.xlsx, .xls, .csv</strong> (maksimal 10MB).</li>
            </ul>
          </div>

          {/* Step 2: Upload File */}
          <div className="form-group">
            <label className="form-label font-bold text-slate-800 dark:text-slate-100">
              Langkah 2: Pilih File Excel / CSV yang Telah Diisi
            </label>
            <input 
              type="file" 
              name="file" 
              accept=".xlsx,.xls,.csv,.txt" 
              required 
              disabled={importing}
              className="form-input text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
          </div>

          <div className="modal__actions mt-2">
            <button 
              type="button" 
              className="btn btn-secondary text-xs" 
              disabled={importing}
              onClick={() => setShowImportModal(false)}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={importing}
              className="btn btn-primary text-xs flex items-center gap-2 cursor-pointer"
            >
              {importing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Memproses Import...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload & Proses Import
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
