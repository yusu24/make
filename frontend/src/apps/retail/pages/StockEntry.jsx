import React, { useState, useEffect } from 'react';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { 
  Plus, RefreshCw, Truck, 
  TrendingDown, Package, Edit3, Trash2
} from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import '../retail.css';

export default function StockEntry() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ product_id: '', qty: 1, cost_per_item: 0 }]);
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, prodRes, supRes] = await Promise.all([
        api.get('/retail/purchases'),
        api.get('/retail/products'),
        api.get('/retail/suppliers')
      ]);
      setPurchases(pRes.data);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddItem = () => {
    setItems([...items, { product_id: '', qty: 1, cost_per_item: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/retail/purchases', {
        supplier_id: supplierId,
        items: items,
        notes: notes
      });
      fetchData();
      setShowModal(false);
      setItems([{ product_id: '', qty: 1, cost_per_item: 0 }]);
      setSupplierId('');
      setNotes('');
    } catch (e) {
      alert('Gagal menyimpan transaksi');
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.notes?.toLowerCase().includes(searchQuery.toLowerCase())
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
    endIndex
  } = usePagination(filteredPurchases);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header */}


      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 52 }}>
         {/* Total Investment Card */}
         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
                  <TrendingDown size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Total Investasi Stok</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-semibold">
                  Rp {purchases.reduce((acc, p) => acc + Number(p.total_cost), 0).toLocaleString('id-ID')}
               </p>
               <p className="text-xs text-slate-400 mt-1">Total akumulasi dana untuk pengadaan barang bulan ini.</p>
            </div>
         </div>

         {/* Volume Card */}
         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                  <Truck size={18} />
               </div>
               <span className="text-sm font-medium text-slate-500">Volume Batch</span>
            </div>
            <div>
               <p className="text-2xl text-slate-900 leading-tight font-normal">
                  {purchases.length} <span className="text-sm text-slate-400 font-medium ml-1">Batch</span>
               </p>
               <p className="text-xs text-slate-400 mt-1">Jumlah transaksi penerimaan barang terekam.</p>
            </div>
         </div>
      </div>

      <div className="card animate-fade-in overflow-hidden">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button 
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => {
              setItems([{ product_id: '', qty: 1, cost_per_item: 0 }]);
              setShowModal(true);
            }}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Input barang masuk</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input 
              placeholder="Cari Supplier..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
              <th className="pl-6 retail-table-header">Waktu Terima</th>
              <th className="retail-table-header">Supplier</th>
              <th className="text-center retail-table-header">Item</th>
              <th className="retail-table-header">Total Tagihan</th>
              <th style={{ textAlign: 'right' }} className="pr-6 retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <RetailTableLoadingRow colSpan={5} text="Menyinkronkan Logistik..." />
            ) : filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                   Belum ada riwayat penerimaan barang.
                </td>
              </tr>
            ) : (
              paginatedData.map(p => (
                <tr key={p.id}>
                  <td className="pl-6">
                    <span className="retail-text-primary">{new Date(p.created_at).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="retail-text-primary uppercase tracking-tight">{p.supplier?.name || '-'}</span>
                  </td>
                  <td className="text-center">
                    <span className="retail-badge retail-badge-primary">{p.items?.length || 0} Varian</span>
                  </td>
                  <td>
                    <span className="retail-text-primary">Rp {Number(p.total_cost).toLocaleString('id-ID')}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-secondary" title="Detail"><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost retail-text-danger" title="Hapus"><Trash2 size={14} /></button>
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

      {/* Modal Input Barang Masuk */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Input Barang Masuk (Batch)"
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
           <div className="form-group">
              <label className="form-label">Pilih Supplier</label>
              <select 
                className="form-input" 
                value={supplierId} 
                onChange={e => setSupplierId(e.target.value)}
                required
              >
                 <option value="" disabled>Pilih Supplier...</option>
                 {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
           </div>

           <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3">
                 <label className="form-label" style={{ marginBottom: 0 }}>Daftar Barang</label>
                 <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{items.length} Item</span>
              </div>
              
              <div className="grid grid-cols-12 gap-3 mb-2 px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid">
                 <span className="col-span-5">Nama Barang</span>
                 <span className="col-span-3">Kuantitas</span>
                 <span className="col-span-3">Harga Beli (HPP)</span>
                 <span className="col-span-1 text-center">Aksi</span>
              </div>

              <div className="flex flex-col gap-3 md:gap-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end md:items-center bg-slate-50/50 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-200/60 md:border-0">
                    <div className="col-span-1 md:col-span-5 flex flex-col gap-1">
                       <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Nama Barang</label>
                       <select 
                          className="form-input bg-white"
                          value={item.product_id}
                          onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                          required
                       >
                          <option value="" disabled>Pilih Produk...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                       </select>
                    </div>
                    <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
                       <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Kuantitas</label>
                       <input 
                          type="number" 
                          className="form-input bg-white" 
                          placeholder="0"
                          value={item.qty}
                          onChange={e => handleItemChange(index, 'qty', e.target.value)}
                          required
                       />
                    </div>
                    <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
                       <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Harga Beli (HPP)</label>
                       <input 
                          type="number" 
                          className="form-input bg-white" 
                          placeholder="Rp 0"
                          value={item.cost_per_item}
                          onChange={e => handleItemChange(index, 'cost_per_item', e.target.value)}
                          required
                       />
                    </div>
                    <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center">
                       <button 
                         type="button" 
                         className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-150 border border-slate-200 md:border-0 bg-white md:bg-transparent" 
                         onClick={() => handleRemoveItem(index)}
                         title="Hapus Baris"
                       >
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                className="w-full mt-3 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/10 flex items-center justify-center gap-2 text-xs font-semibold transition-all duration-200" 
                onClick={handleAddItem}
              >
                 <Plus size={16} /> Tambah Baris Baru
              </button>
           </div>

           <div className="form-group">
              <label className="form-label">Catatan Tambahan</label>
              <textarea 
                className="form-input min-h-[80px]" 
                placeholder="Misal: Nomor invoice supplier, kondisi barang, dll"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
           </div>

           <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Transaksi</button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
