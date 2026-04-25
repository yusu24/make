import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  Plus, RefreshCw, Truck, 
  TrendingDown, Package, Edit3, Trash2
} from 'lucide-react';
import Modal from '../../../components/Modal';
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

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
           <h2 className="page-title">Penerimaan Pesanan</h2>
           <p className="page-sub">Logistik barang masuk dan manajemen stok supplier.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setItems([{ product_id: '', qty: 1, cost_per_item: 0 }]);
            setShowModal(true);
          }}
        >
           + Input barang masuk
        </button>
      </div>

      {/* KPI Section */}
      <div className="finance-cards-grid" style={{ marginBottom: 52 }}>
         {/* Total Investment Card */}
         <div className="finance-card finance-card--danger lg:col-span-2" style={{ padding: '16px 20px' }}>
            <div className="finance-card__header" style={{ marginBottom: '8px' }}>
               <span className="finance-card__title" style={{ fontSize: '11px' }}>Total Investasi Stok</span>
               <div className="finance-card__icon" style={{ width: '36px', height: '36px' }}><TrendingDown size={18} /></div>
            </div>
            <div className="finance-card__amount" style={{ fontSize: '20px' }}>
               Rp {purchases.reduce((acc, p) => acc + Number(p.total_cost), 0).toLocaleString('id-ID')}
            </div>
            <div className="finance-card__desc" style={{ fontSize: '12px' }}>Total akumulasi dana untuk pengadaan barang bulan ini.</div>
         </div>

         {/* Volume Card */}
         <div className="finance-card finance-card--primary" style={{ padding: '16px 20px' }}>
            <div className="finance-card__header" style={{ marginBottom: '8px' }}>
               <span className="finance-card__title" style={{ fontSize: '11px' }}>Volume Batch</span>
               <div className="finance-card__icon" style={{ width: '36px', height: '36px' }}><Truck size={18} /></div>
            </div>
            <div className="finance-card__amount" style={{ fontSize: '20px' }}>
               {purchases.length} <span className="text-sm font-800 opacity-20 ml-1 uppercase">Batch</span>
            </div>
            <div className="finance-card__desc" style={{ fontSize: '12px' }}>Jumlah transaksi penerimaan barang terekam.</div>
         </div>
      </div>

      {/* Histori Section (Synced with Staff Table Style) */}
      <div className="card animate-fade-in overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Histori Pengadaan</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="airy-search-wrapper" style={{ width: 280 }}>
               <input 
                 placeholder="Cari Supplier..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
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
              <th className="pl-6">Waktu Terima</th>
              <th>Supplier</th>
              <th className="text-center">Item</th>
              <th>Total Tagihan</th>
              <th style={{ textAlign: 'right' }} className="pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-800">Menyinkronkan Logistik...</td></tr>
            ) : filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                   Belum ada riwayat penerimaan barang.
                </td>
              </tr>
            ) : (
              filteredPurchases.map(p => (
                <tr key={p.id}>
                  <td className="pl-6">
                    <span className="text-slate-800">{new Date(p.created_at).toLocaleString('id-ID')}</span>
                  </td>
                  <td>
                    <span className="text-primary-600 uppercase tracking-tight">{p.supplier?.name || '-'}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-gray">{p.items?.length || 0} Varian</span>
                  </td>
                  <td>
                    <span className="text-slate-800">Rp {Number(p.total_cost).toLocaleString('id-ID')}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-secondary" title="Detail"><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger-600)' }} title="Hapus"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Input Barang Masuk */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Input Barang Masuk (Batch)"
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
              <div className="flex justify-between items-center mb-4">
                 <label className="form-label" style={{ marginBottom: 0 }}>Daftar Barang</label>
                 <span className="text-[10px] font-800 text-slate-400 uppercase tracking-widest">{items.length} Item terdaftar</span>
              </div>
              
              <div className="stock-entry-header md:grid hidden">
                 <span className="stock-entry-label">Nama Barang</span>
                 <span className="stock-entry-label">Kuantitas</span>
                 <span className="stock-entry-label">Harga Beli (HPP)</span>
                 <span></span>
              </div>

              <div className="flex flex-col gap-1">
                {items.map((item, index) => (
                  <div key={index} className="stock-entry-row">
                    <div className="form-group mb-0">
                        <select 
                           className="form-input"
                           value={item.product_id}
                           onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                           required
                        >
                           <option value="" disabled>Pilih Produk...</option>
                           {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                    <div className="form-group mb-0">
                        <input 
                           type="number" 
                           className="form-input" 
                           placeholder="0"
                           value={item.qty}
                           onChange={e => handleItemChange(index, 'qty', e.target.value)}
                           required
                        />
                    </div>
                    <div className="form-group mb-0">
                        <input 
                           type="number" 
                           className="form-input" 
                           placeholder="Rp 0"
                           value={item.cost_per_item}
                           onChange={e => handleItemChange(index, 'cost_per_item', e.target.value)}
                           required
                        />
                    </div>
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={() => handleRemoveItem(index)}>
                       <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="btn-add-row mt-2" onClick={handleAddItem}>
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
