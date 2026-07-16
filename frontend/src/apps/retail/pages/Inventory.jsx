import React, { useState, useEffect } from 'react';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Package
} from 'lucide-react';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
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

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: paginatedTotalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredProducts);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}


      {/* Finance-style Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 52 }}>
        {/* Total Katalog Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
              <Package size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Katalog</span>
          </div>
          <div>
            <p className="text-2xl text-slate-900 leading-tight font-normal">{totalItems}</p>
            <p className="text-xs text-slate-400 mt-1">Jumlah SKU unik terdaftar.</p>
          </div>
        </div>

        {/* Stok Aman Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Stok Aman</span>
          </div>
          <div>
            <p className="text-2xl text-slate-900 leading-tight font-normal">{safeItems}</p>
            <p className="text-xs text-slate-400 mt-1">Produk dengan stok di atas batas minimum.</p>
          </div>
        </div>

        {/* Perlu Restok Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
              <AlertCircle size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Perlu Restok</span>
          </div>
          <div>
            <p className="text-2xl text-slate-900 leading-tight font-normal">{criticalItems}</p>
            <p className="text-xs text-slate-400 mt-1">{outOfStock} habis, {lowStock} menipis.</p>
          </div>
        </div>
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input 
              placeholder="Cari SKU atau Nama Barang..." 
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
              <th className="pl-6 retail-table-header">Identitas SKU</th>
              <th className="retail-table-header">Informasi Barang</th>
              <th className="text-center retail-table-header">Kuantitas</th>
              <th className="text-center retail-table-header">Limit Aman</th>
              <th className="text-right pr-6 retail-table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={5} text="Memuat data stok..." />
            ) : filteredProducts.length === 0 ? (
              <tr>
                 <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data persediaan barang.
                 </td>
              </tr>
            ) : (
              paginatedData.map(p => {
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
        </table></div>
        <RetailPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalItems={paginatedTotalItems}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>
    </div>
  );
}
