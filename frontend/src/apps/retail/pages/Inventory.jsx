import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Package
} from 'lucide-react';
import { CardSkeleton, TableSkeleton } from '../../../components/Skeleton';
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
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="w-64 h-8 bg-gray-200 animate-pulse rounded-lg" />
        <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={8} cols={5} />
    </div>
  );

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}


      {/* Finance-style Summary Cards */}
      <div className="finance-cards-grid" style={{ marginBottom: 52 }}>
        <div className="finance-card finance-card--primary">
          <div className="finance-card__header">
            <span className="retail-label">Total Katalog</span>
            <div className="finance-card__icon"><Package size={20} /></div>
          </div>
          <div className="retail-kpi-value">{totalItems}</div>
          <div className="finance-card__desc">Jumlah SKU unik terdaftar.</div>
        </div>

        <div className="finance-card finance-card--success">
          <div className="finance-card__header">
            <span className="retail-label">Stok Aman</span>
            <div className="finance-card__icon"><CheckCircle2 size={20} /></div>
          </div>
          <div className="retail-kpi-value">{safeItems}</div>
          <div className="finance-card__desc">Produk dengan stok di atas batas minimum.</div>
        </div>

        <div className="finance-card finance-card--danger">
          <div className="finance-card__header">
            <span className="retail-label">Perlu Restok</span>
            <div className="finance-card__icon"><AlertCircle size={20} /></div>
          </div>
          <div className="retail-kpi-value">{criticalItems}</div>
          <div className="finance-card__desc">{outOfStock} habis, {lowStock} menipis.</div>
        </div>
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-end">
          <div className="flex items-center gap-3">
            <button 
               className="btn btn-secondary h-[42px] px-6 whitespace-nowrap" 
               onClick={fetchData}
            >
               + Segarkan data
            </button>
            <div className="flex items-center gap-3">
              <div className="airy-search-wrapper" style={{ width: 300, margin: 0 }}>
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
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Identitas SKU</th>
              <th className="retail-table-header">Informasi Barang</th>
              <th className="text-center retail-table-header">Kuantitas</th>
              <th className="text-center retail-table-header">Limit Aman</th>
              <th className="text-right pr-6 retail-table-header">Status</th>
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
                       <div className="inline-flex px-3 py-1 retail-bg-primary-subtle rounded-lg">
                         <code className="text-[11px] retail-text-primary tracking-tight">{p.sku}</code>
                       </div>
                    </td>
                    <td>
                      <span className="retail-text-primary">{p.name}</span>
                    </td>
                    <td className="text-center">
                      <span className={`${isLow ? 'retail-text-danger' : 'retail-text-primary'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-xs retail-text-secondary">{p.stock_min} {p.unit}</span>
                    </td>
                    <td className="text-right pr-6">
                      {isOut ? (
                         <span className="retail-badge retail-badge-danger">Habis Total</span>
                      ) : isLow ? (
                         <span className="retail-badge retail-badge-warning">Menipis</span>
                      ) : (
                         <span className="retail-badge retail-badge-success">Tersedia</span>
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
