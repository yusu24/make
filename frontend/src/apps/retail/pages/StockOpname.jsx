import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { ClipboardCheck, CheckCircle2, Eye } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function StockOpname() {
  const [opnames, setOpnames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [counts, setCounts] = useState({});
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/retail/stock-opnames'); setOpnames(res.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const startOpname = async () => {
    try {
      const res = await api.post('/retail/stock-opnames', { note: '' });
      fetchData();
      openDetail(res.data.id);
    } catch (e) { alert(e.response?.data?.message || 'Gagal memulai stock opname'); }
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/retail/stock-opnames/${id}`);
      setDetail(res.data);
      const c = {};
      res.data.items.forEach(i => { c[i.product_id] = i.physical_qty; });
      setCounts(c);
    } catch { alert('Gagal memuat detail'); }
  };

  const saveCounts = async () => {
    try {
      const items = Object.entries(counts).map(([product_id, physical_qty]) => ({ product_id: Number(product_id), physical_qty: Number(physical_qty) }));
      const res = await api.put(`/retail/stock-opnames/${detail.id}`, { items });
      setDetail(res.data);
    } catch { alert('Gagal menyimpan hasil hitung'); }
  };

  const finalize = async () => {
    if (!confirm('Finalisasi stock opname? Stok sistem akan disesuaikan dengan hasil hitung fisik dan tidak bisa diubah lagi.')) return;
    try {
      await saveCounts();
      const res = await api.post(`/retail/stock-opnames/${detail.id}/finalize`);
      setDetail(res.data);
      fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal finalisasi'); }
  };

  const filteredOpnames = opnames.filter(o =>
    (o.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.status === 'finalized' ? 'selesai' : 'draft').includes(search.toLowerCase())
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
  } = usePagination(filteredOpnames);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={startOpname}
          >
            <ClipboardCheck size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Mulai Stock Opname</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari petugas/status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Tanggal Mulai</th>
              <th className="retail-table-header">Petugas</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={4} />
            ) : filteredOpnames.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada stock opname.</td></tr>
            ) : (
              paginatedData.map(o => (
                <tr key={o.id}>
                  <td className="pl-6 retail-text-secondary" style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleString('id-ID')}</td>
                  <td>{o.user?.name || '-'}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${o.status === 'finalized' ? 'retail-badge-primary' : ''}`}>{o.status === 'finalized' ? 'Selesai' : 'Draft'}</span>
                  </td>
                  <td className="pr-6 text-right">
                    <button className="btn btn-sm btn-ghost" onClick={() => openDetail(o.id)} title="Lihat"><Eye size={15} /></button>
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

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Stock Opname #${detail?.id || ''}`} maxWidth="700px">
        {detail && (
          <div className="flex flex-col gap-4">
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <div className="retail-table-responsive"><table className="table">
                <thead>
                  <tr>
                    <th className="retail-table-header">Produk</th>
                    <th className="text-center retail-table-header">Stok Sistem</th>
                    <th className="text-center retail-table-header">Hitung Fisik</th>
                    <th className="text-center retail-table-header">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name}</td>
                      <td className="text-center">{item.system_qty}</td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 90, textAlign: 'center' }}
                          disabled={detail.status === 'finalized'}
                          value={counts[item.product_id] ?? item.physical_qty}
                          onChange={e => setCounts(prev => ({ ...prev, [item.product_id]: e.target.value }))}
                        />
                      </td>
                      <td className="text-center" style={{ color: Number(counts[item.product_id] ?? item.physical_qty) - item.system_qty !== 0 ? 'var(--retail-danger, #ef4444)' : 'inherit' }}>
                        {Number(counts[item.product_id] ?? item.physical_qty) - item.system_qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
            {detail.status !== 'finalized' && (
              <div className="modal__actions">
                <button type="button" className="btn btn-secondary" onClick={saveCounts}>Simpan Hitungan</button>
                <button type="button" className="btn btn-primary" onClick={finalize}>
                  <CheckCircle2 size={16} style={{ marginRight: 6 }} /> Finalisasi
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
