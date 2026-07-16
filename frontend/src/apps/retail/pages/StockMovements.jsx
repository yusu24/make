import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { History, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

const TYPE_LABELS = {
  in: 'Masuk',
  out: 'Keluar',
  adjustment: 'Penyesuaian',
  void: 'Void',
  return_supplier: 'Retur ke Supplier',
  return_customer: 'Retur dari Pelanggan',
};

const getBadgeClass = (type) => {
  switch (type) {
    case 'in':
    case 'return_customer':
      return 'retail-badge-success'; // Green
    case 'out':
    case 'return_supplier':
      return 'retail-badge-danger'; // Red
    case 'adjustment':
      return 'retail-badge-warning'; // Yellow
    case 'void':
      return 'retail-badge-secondary'; // Gray
    default:
      return 'retail-badge-primary'; // Purple
  }
};

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/stock/movements', { params: typeFilter ? { type: typeFilter } : {} });
      setMovements(res.data.data || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [typeFilter]);

  const filteredMovements = movements.filter(m =>
    (m.product?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.note || '').toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredMovements);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari produk/catatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-input" style={{ width: 140, height: 42, flexShrink: 0 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">Semua Tipe</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={fetchData} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Waktu</th>
              <th className="retail-table-header">Produk</th>
              <th className="retail-table-header">Tipe</th>
              <th className="text-center retail-table-header">Qty</th>
              <th className="text-center retail-table-header">Stok Sebelum</th>
              <th className="text-center retail-table-header">Stok Sesudah</th>
              <th className="retail-table-header">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={7} />
            ) : filteredMovements.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada pergerakan stok.</td></tr>
            ) : (
              paginatedData.map(m => (
                <tr key={m.id}>
                  <td className="pl-6 retail-text-secondary" style={{ fontSize: 12 }}>{new Date(m.created_at).toLocaleString('id-ID')}</td>
                  <td className="retail-text-primary">{m.product?.name || '-'}</td>
                  <td>
                    <span className={`retail-badge ${getBadgeClass(m.type)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {Number(m.quantity) >= 0 ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                      {TYPE_LABELS[m.type] || m.type}
                    </span>
                  </td>
                  <td className="text-center">{m.quantity}</td>
                  <td className="text-center retail-text-secondary">{m.quantity_before}</td>
                  <td className="text-center retail-text-primary">{m.quantity_after}</td>
                  <td className="retail-text-secondary" style={{ fontSize: 12 }}>{m.note || '-'}</td>
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
    </div>
  );
}
