import React, { useState, useEffect } from 'react';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Package,
  Eye
} from '@/constants/icons';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import Modal from '../../../components/Modal';
import StatScoreCard from '@/components/ui/StatScoreCard';
import '../retail.css';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCritical, setFilterCritical] = useState(false);
  
  // Detail Modal State
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('batch');

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const isCritical = Number(p.stock) <= Number(p.stock_min);
    if (filterCritical) return matchesSearch && isCritical;
    return matchesSearch;
  });

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


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatScoreCard
          title="TOTAL KATALOG"
          value={totalItems}
          icon={Package}
          statusBadge={{ text: "Terdaftar", color: "indigo" }}
          subtitle="Jumlah SKU unik dalam sistem"
          progressBar={{ value: 100, color: "bg-indigo-500" }}
        />
        <StatScoreCard
          title="STOK AMAN"
          value={safeItems}
          icon={CheckCircle2}
          statusBadge={{ text: "Optimal", color: "emerald" }}
          subtitle="Stok berada di atas batas minimum"
          progressBar={{ value: totalItems > 0 ? Math.round((safeItems / totalItems) * 100) : 100, color: "bg-emerald-500" }}
        />
        <StatScoreCard
          title="PERLU RESTOK"
          value={criticalItems}
          icon={AlertCircle}
          statusBadge={{ text: criticalItems > 0 ? `${outOfStock} Habis` : "Aman", color: criticalItems > 0 ? "rose" : "emerald" }}
          subtitle={`${lowStock} stok menipis mendekati buffer`}
          progressBar={{ value: totalItems > 0 ? Math.round((criticalItems / totalItems) * 100) : 0, color: "bg-rose-500" }}
          onClick={() => { setFilterCritical(!filterCritical); }}
        />
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input 
              placeholder="Cari SKU atau Nama Barang..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button title="Hanya Barang Kritis" 
            className={`btn ${filterCritical ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => { setFilterCritical(!filterCritical); setCurrentPage(1); }}
            style={{ height: 38, whiteSpace: 'nowrap' }}
          >
            <AlertCircle size={15} className="mr-2" />
            <span className="btn-text-mobile-hide">Hanya Barang Kritis</span>
          </button>
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
              <th className="pl-6 retail-table-header">Identitas SKU</th>
              <th className="retail-table-header">Informasi Barang</th>
              <th className="text-center retail-table-header">Kuantitas</th>
              <th className="text-center retail-table-header">Limit Aman</th>
              <th className="text-right retail-table-header">Status</th>
              <th className="text-center pr-6 retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={6} text="Memuat data stok..." />
            ) : filteredProducts.length === 0 ? (
              <tr>
                 <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
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
                    <td className="text-right">
                      {isOut ? (
                         <span className="retail-badge retail-badge-danger">Habis Total</span>
                      ) : isLow ? (
                         <span className="retail-badge retail-badge-warning">Menipis</span>
                      ) : (
                         <span className="retail-badge retail-badge-success">Tersedia</span>
                      )}
                    </td>
                    <td className="text-center pr-6">
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', height: 'auto', fontSize: '11px', display: 'inline-flex' }}
                        onClick={() => setDetailProduct(p)}
                        title="Lihat Detail Batch"
                      >
                        <Eye size={14} className="mr-1" /> Detail
                      </button>
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

      <Modal 
        isOpen={!!detailProduct} 
        onClose={() => setDetailProduct(null)}
        title={`Detail Stok: ${detailProduct?.name || ''}`}
        maxWidth="600px"
      >
        {detailProduct && (
          <div>
            <div className="flex border-b mb-4">
              <button 
                className={`py-2 px-4 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600`}
              >
                Data Batch & Expired
              </button>
            </div>

            {activeTab === 'batch' && (
              <div className="table-wrap overflow-y-auto max-h-[300px]">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="retail-table-header">Nomor Batch</th>
                      <th className="retail-table-header">Kadaluarsa</th>
                      <th className="retail-table-header text-right">Stok Aktif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!detailProduct.batches || detailProduct.batches.length === 0) ? (
                      <tr><td colSpan="3" className="text-center py-4 text-slate-400">Tidak ada data batch</td></tr>
                    ) : (
                      detailProduct.batches.map(b => (
                        <tr key={b.id}>
                          <td className="font-medium text-slate-700">{b.batch_no}</td>
                          <td>{b.expired_date ? new Date(b.expired_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</td>
                          <td className="text-right">{b.stock}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal__actions mt-6">
              <button type="button" className="btn btn-secondary w-full" onClick={() => setDetailProduct(null)}>Tutup Detail</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
