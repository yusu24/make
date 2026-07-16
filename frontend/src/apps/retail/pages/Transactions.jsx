import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Eye, Ban } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [voidModal, setVoidModal] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/transactions');
      setTransactions(res.data.data || res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openDetail = async (id) => {
    try { const res = await api.get(`/retail/transactions/${id}`); setDetail(res.data); }
    catch { alert('Gagal memuat detail'); }
  };

  const submitVoid = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/retail/transactions/${voidModal.id}/void`, { reason: voidReason });
      setVoidModal(null); setVoidReason(''); fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal membatalkan transaksi'); }
  };

  const filteredTransactions = transactions.filter(t =>
    t.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
    (t.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.payment_method || '').toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredTransactions);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari invoice/pelanggan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Invoice</th>
              <th className="retail-table-header">Waktu</th>
              <th className="retail-table-header">Pelanggan</th>
              <th className="retail-table-header">Metode</th>
              <th className="text-right retail-table-header">Total</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={7} />
            ) : filteredTransactions.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada transaksi.</td></tr>
            ) : (
              paginatedData.map(t => (
                <tr key={t.id}>
                  <td className="pl-6 retail-text-primary">{t.invoice_no}</td>
                  <td className="retail-text-secondary" style={{ fontSize: 12 }}>{new Date(t.created_at).toLocaleString('id-ID')}</td>
                  <td>{t.customer?.name || 'Umum'}</td>
                  <td className="retail-text-secondary">{t.payment_method}</td>
                  <td className="text-right font-semibold">Rp {Number(t.total_amount).toLocaleString('id-ID')}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${t.status === 'voided' ? 'retail-text-danger' : 'retail-badge-primary'}`}>{t.status === 'voided' ? 'Dibatalkan' : 'Lunas'}</span>
                  </td>
                  <td className="pr-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-sm btn-ghost" onClick={() => openDetail(t.id)}><Eye size={14} /></button>
                      {t.status !== 'voided' && (
                        <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => setVoidModal(t)}><Ban size={14} /></button>
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

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={`Detail ${detail?.invoice_no || ''}`}>
        {detail && (
          <div className="flex flex-col gap-4">
            <div className="retail-table-responsive"><table className="table">
              <thead>
                <tr>
                  <th className="retail-table-header">Produk</th>
                  <th className="text-center retail-table-header">Qty</th>
                  <th className="text-right retail-table-header">Harga</th>
                  <th className="text-right retail-table-header">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detail.items?.map(item => (
                  <tr key={item.id}>
                    <td>{item.product?.name || '-'}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">Rp {Number(item.price).toLocaleString('id-ID')}</td>
                    <td className="text-right">Rp {Number(item.subtotal).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between"><span>Diskon</span><span>Rp {Number(detail.discount_amount).toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Pajak</span><span>Rp {Number(detail.tax_amount).toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>Rp {Number(detail.total_amount).toLocaleString('id-ID')}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!voidModal} onClose={() => setVoidModal(null)} title="Batalkan Transaksi">
        <form onSubmit={submitVoid} className="flex flex-col gap-5">
          <p className="retail-text-secondary" style={{ fontSize: 13 }}>Stok akan dikembalikan dan poin loyalitas pelanggan (jika ada) akan dibatalkan.</p>
          <div className="form-group">
            <label className="form-label">Alasan Pembatalan</label>
            <textarea className="form-input" value={voidReason} onChange={e => setVoidReason(e.target.value)} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setVoidModal(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Konfirmasi Pembatalan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
