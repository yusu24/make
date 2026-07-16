import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Search, CheckCircle2, Trash2, RotateCcw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function CustomerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [listSearch, setListSearch] = useState('');

  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [returnType, setReturnType] = useState('refund');
  const [note, setNote] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/customer-returns');
      setReturns(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const lookupTransaction = async () => {
    setLookupError('');
    setTransaction(null);
    if (!invoiceQuery.trim()) return;
    try {
      const res = await api.get(`/retail/customer-returns/order/${invoiceQuery.trim()}`);
      setTransaction(res.data);
      setSelectedItems({});
    } catch {
      setLookupError('Transaksi tidak ditemukan. Masukkan ID transaksi (angka).');
    }
  };

  const toggleItem = (item, checked) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (checked) {
        next[item.id] = { transaction_item_id: item.id, product_id: item.product_id, product_name: item.product?.name, quantity: item.qty, unit_price: item.price };
      } else {
        delete next[item.id];
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = Object.values(selectedItems);
    if (items.length === 0) { alert('Pilih minimal satu barang untuk diretur.'); return; }
    try {
      await api.post('/retail/customer-returns', {
        transaction_id: transaction.id,
        type: returnType,
        note,
        items,
      });
      setShowModal(false);
      setTransaction(null);
      setInvoiceQuery('');
      setSelectedItems({});
      setNote('');
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan retur');
    }
  };

  const confirmReturn = async (id) => {
    if (!confirm('Konfirmasi retur ini? Stok akan bertambah kembali.')) return;
    try { await api.post(`/retail/customer-returns/${id}/confirm`); fetchData(); }
    catch (e) { alert(e.response?.data?.message || 'Gagal mengonfirmasi'); }
  };

  const removeReturn = async (id) => {
    if (!confirm('Hapus draft retur ini?')) return;
    try { await api.delete(`/retail/customer-returns/${id}`); fetchData(); } catch { alert('Gagal menghapus'); }
  };

  const filteredReturns = returns.filter(r =>
    r.return_number.toLowerCase().includes(listSearch.toLowerCase()) ||
    (r.customer?.name || '').toLowerCase().includes(listSearch.toLowerCase())
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
            <span className="btn-text-mobile-hide">Retur dari Pelanggan</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari no. retur/pelanggan..."
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">No. Retur</th>
              <th className="retail-table-header">Pelanggan</th>
              <th className="retail-table-header">Tipe</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="text-right retail-table-header">Total</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={6} />
            ) : filteredReturns.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada retur pelanggan.</td></tr>
            ) : (
              paginatedData.map(r => (
                <tr key={r.id}>
                  <td className="pl-6 retail-text-primary">{r.return_number}</td>
                  <td>{r.customer?.name || 'Umum'}</td>
                  <td className="retail-text-secondary" style={{ fontSize: 12 }}>{r.type === 'exchange' ? 'Tukar Barang' : 'Refund'}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${r.status === 'confirmed' ? 'retail-badge-primary' : ''}`}>{r.status === 'confirmed' ? 'Dikonfirmasi' : 'Draft'}</span>
                  </td>
                  <td className="text-right">Rp {Number(r.total_amount).toLocaleString('id-ID')}</td>
                  <td className="pr-6 text-right">
                    <div className="flex gap-2 justify-end">
                      {r.status === 'draft' && (
                        <>
                          <button className="btn btn-sm btn-secondary" onClick={() => confirmReturn(r.id)} title="Konfirmasi"><CheckCircle2 size={14} /></button>
                          <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => removeReturn(r.id)} title="Hapus"><Trash2 size={14} /></button>
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setTransaction(null); }} title="Retur Barang dari Pelanggan">
        <div className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">ID Transaksi</label>
            <div className="flex gap-2">
              <input className="form-input" placeholder="cth. 42" value={invoiceQuery} onChange={e => setInvoiceQuery(e.target.value)} />
              <button type="button" className="btn btn-secondary" onClick={lookupTransaction}><Search size={16} /></button>
            </div>
            {lookupError && <p style={{ color: 'var(--retail-danger, #ef4444)', fontSize: 12, marginTop: 6 }}>{lookupError}</p>}
          </div>

          {transaction && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="text-sm retail-text-secondary">
                Invoice <strong>{transaction.invoice_no}</strong> — {transaction.customer?.name || 'Pelanggan Umum'}
              </div>
              <div className="flex flex-col gap-2">
                {transaction.items?.map(item => (
                  <label key={item.id} className="stock-entry-row" style={{ alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" onChange={e => toggleItem(item, e.target.checked)} />
                    <span>{item.product?.name}</span>
                    <span className="retail-text-secondary">Qty dibeli: {item.qty}</span>
                    <span className="retail-text-secondary">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  </label>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Tipe Retur</label>
                <select className="form-input" value={returnType} onChange={e => setReturnType(e.target.value)}>
                  <option value="refund">Refund (Uang Kembali)</option>
                  <option value="exchange">Tukar Barang</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Catatan</label>
                <textarea className="form-input" value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setTransaction(null); }}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Draft Retur</button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
