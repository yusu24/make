import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Package
} from 'lucide-react';
import '../retail.css';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Metrics Calculation
  const totalItems = products.length;
  const outOfStock = products.filter(p => Number(p.stock) <= 0).length;
  const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.stock_min)).length;
  const criticalItems = outOfStock + lowStock;
  const safeItems = totalItems - criticalItems;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="retail-dashboard-spacing">
      <div className="loading-state-premium">
        <div className="spinner-glow"></div>
        <p className="loading-text">Menyinkronkan data inventori...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
           <h2 className="page-title">Monitoring Persediaan</h2>
           <p className="page-sub">Pantau stok barang di gudang Anda secara real-time.</p>
        </div>
        <button 
           className="btn btn-secondary" 
           onClick={fetchData}
        >
           + Segarkan data
        </button>
      </div>

      {/* Finance-style Summary Cards */}
      <div className="finance-cards-grid" style={{ marginBottom: 52 }}>
        <div className="finance-card finance-card--primary">
          <div className="finance-card__header">
            <span className="finance-card__title">Total Katalog</span>
            <div className="finance-card__icon"><Package size={20} /></div>
          </div>
          <div className="finance-card__amount">{totalItems}</div>
          <div className="finance-card__desc">Jumlah SKU unik terdaftar.</div>
        </div>

        <div className="finance-card finance-card--success">
          <div className="finance-card__header">
            <span className="finance-card__title">Stok Aman</span>
            <div className="finance-card__icon"><CheckCircle2 size={20} /></div>
          </div>
          <div className="finance-card__amount">{safeItems}</div>
          <div className="finance-card__desc">Produk dengan stok di atas batas minimum.</div>
        </div>

        <div className="finance-card finance-card--danger">
          <div className="finance-card__header">
            <span className="finance-card__title">Perlu Restok</span>
            <div className="finance-card__icon"><AlertCircle size={20} /></div>
          </div>
          <div className="finance-card__amount">{criticalItems}</div>
          <div className="finance-card__desc">{outOfStock} habis, {lowStock} menipis.</div>
        </div>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Daftar Detail Inventori</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="airy-search-wrapper" style={{ width: 300 }}>
               <input 
                 placeholder="Cari SKU atau Nama Barang..." 
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
              <th className="pl-6">Identitas SKU</th>
              <th>Informasi Barang</th>
              <th className="text-center">Kuantitas</th>
              <th className="text-center">Limit Aman</th>
              <th className="text-right pr-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                 <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data persediaan barang.
                 </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const isLow = Number(p.stock) <= Number(p.stock_min);
                const isOut = Number(p.stock) <= 0;
                
                return (
                  <tr key={p.id}>
                    <td className="pl-6">
                       <div className="inline-flex px-3 py-1 bg-slate-100 rounded-lg">
                         <code className="text-[11px] text-slate-600 tracking-tight">{p.sku}</code>
                       </div>
                    </td>
                    <td>
                      <span className="text-slate-800">{p.name}</span>
                    </td>
                    <td className="text-center">
                      <span className={`${isLow ? 'text-red-500' : 'text-slate-800'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-xs text-slate-400">{p.stock_min} {p.unit}</span>
                    </td>
                    <td className="text-right pr-6">
                      {isOut ? (
                         <span className="badge badge-red">Habis Total</span>
                      ) : isLow ? (
                         <span className="badge badge-yellow">Menipis</span>
                      ) : (
                         <span className="badge badge-green">Tersedia</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
