import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Plus, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function SupplierReturns() {
  const [returns, setReturns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, sRes, pRes] = await Promise.all([
        api.get('/retail/supplier-returns'),
        api.get('/retail/suppliers'),
        api.get('/retail/products'),
      ]);
      setReturns(rRes.data);
      setSuppliers(sRes.data);
      setProducts(pRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleItemChange = (i, field, value) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/retail/supplier-returns', { supplier_id: supplierId, reason, items });
      setShowModal(false);
      setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
      setSupplierId(''); setReason('');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan retur');
    }
  };

  const confirmReturn = async (id) => {
    if (!confirm('Konfirmasi retur ini? Stok akan berkurang dan tidak bisa dibatalkan.')) return;
    try {
      await api.post(`/retail/supplier-returns/${id}/confirm`);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengonfirmasi retur');
    }
  };

  const removeReturn = async (id) => {
    if (!confirm('Hapus draft retur ini?')) return;
    try { await api.delete(`/retail/supplier-returns/${id}`); fetchData(); } catch { alert('Gagal menghapus'); }
  };

  const filteredReturns = returns.filter(r =>
    r.return_number.toLowerCase().includes(search.toLowerCase()) ||
    (r.supplier?.name || '').toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredReturns);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => setShowModal(true)}
          >
            <RotateCcw size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Retur ke Supplier</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari no. retur/supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">No. Retur</th>
              <th className="retail-table-header">Supplier</th>
              <th className="retail-table-header">Alasan</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="text-right retail-table-header">Total</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={6} />
            ) : filteredReturns.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada retur supplier.</td></tr>
            ) : (
              paginatedData.map(r => (
                <tr key={r.id}>
                  <td className="pl-6 retail-text-primary">{r.return_number}</td>
                  <td>{r.supplier?.name || '-'}</td>
                  <td className="retail-text-secondary" style={{ fontSize: 12 }}>{r.reason || '-'}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${r.status === 'confirmed' ? 'retail-badge-primary' : ''}`}>{r.status === 'confirmed' ? 'Dikonfirmasi' : 'Draft'}</span>
                  </td>
                  <td className="text-right">Rp {Number(r.total_amount).toLocaleString('id-ID')}</td>
                  <td className="pr-6 text-right">
                    <div className="flex gap-2 justify-end">
                      {r.status === 'draft' && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => confirmReturn(r.id)} title="Konfirmasi">
                            <CheckCircle2 size={14} />
                          </button>
                          <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => removeReturn(r.id)} title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
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

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Retur Barang ke Supplier"
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-input" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
              <option value="" disabled>Pilih supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Alasan Retur</label>
            <input className="form-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="cth. Barang rusak / cacat produksi" />
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className="form-label" style={{ marginBottom: 0 }}>Daftar Barang</label>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{items.length} Item</span>
            </div>

            <div className="grid grid-cols-12 gap-3 mb-2 px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid">
              <span className="col-span-5">Nama Barang</span>
              <span className="col-span-3">Kuantitas</span>
              <span className="col-span-3">Harga Satuan</span>
              <span className="col-span-1 text-center">Aksi</span>
            </div>

            <div className="flex flex-col gap-3 md:gap-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end md:items-center bg-slate-50/50 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-200/60 md:border-0">
                  <div className="col-span-1 md:col-span-5 flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Nama Barang</label>
                    <select className="form-input bg-white" value={item.product_id} onChange={e => handleItemChange(i, 'product_id', e.target.value)} required>
                      <option value="" disabled>Pilih Produk...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Kuantitas</label>
                    <input type="number" className="form-input bg-white" placeholder="0" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', Number(e.target.value))} required />
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Harga Satuan</label>
                    <input type="number" className="form-input bg-white" placeholder="Rp 0" value={item.unit_price} onChange={e => handleItemChange(i, 'unit_price', Number(e.target.value))} required />
                  </div>
                  <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center">
                    <button 
                      type="button" 
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-150 border border-slate-200 md:border-0 bg-white md:bg-transparent" 
                      onClick={() => setItems(items.filter((_, idx) => idx !== i))}
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
              onClick={() => setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }])}
            >
              <Plus size={16} /> Tambah Barang
            </button>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Draft Retur</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
