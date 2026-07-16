import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Wallet, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Receivables() {
  const [receivables, setReceivables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([api.get('/retail/receivables'), api.get('/retail/customers')]);
      setReceivables(rRes.data.data); setSummary(rRes.data.summary); setCustomers(cRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/retail/receivables', {
        customer_id: fd.get('customer_id'),
        total_amount: Number(fd.get('total_amount')),
        due_date: fd.get('due_date') || null,
        note: fd.get('note'),
      });
      setShowModal(false); fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan'); }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/retail/receivables/${payModal.id}/payments`, { amount_paid: payAmount, payment_method: 'CASH' });
      setPayModal(null); setPayAmount(0); fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal mencatat pembayaran'); }
  };

  const filteredReceivables = receivables.filter(r =>
    (r.customer?.name || '').toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredReceivables);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {/* Total Piutang Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
              <TrendingUp size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Piutang</span>
          </div>
          <div>
            <p className="text-2xl text-slate-900 leading-tight font-semibold">Rp {Number(summary.total_credit || 0).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-1">Total keseluruhan piutang dari pelanggan.</p>
          </div>
        </div>

        {/* Sudah Diterima Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <CheckCircle size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Sudah Diterima</span>
          </div>
          <div>
            <p className="text-2xl text-emerald-600 leading-tight font-semibold">Rp {Number(summary.total_paid || 0).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-1">Total pembayaran yang telah diterima.</p>
          </div>
        </div>

        {/* Sisa Piutang Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
              <AlertCircle size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Sisa Piutang</span>
          </div>
          <div>
            <p className="text-2xl text-rose-600 leading-tight font-semibold">Rp {Number(summary.total_outstanding || 0).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-1">Piutang yang belum dilunasi pelanggan.</p>
          </div>
        </div>
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => setShowModal(true)}
          >
            <Wallet size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Catat Piutang Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari pelanggan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Pelanggan</th>
              <th className="text-right retail-table-header">Total</th>
              <th className="text-right retail-table-header">Diterima</th>
              <th className="text-right retail-table-header">Sisa</th>
              <th className="text-center retail-table-header">Jatuh Tempo</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={7} />
            ) : filteredReceivables.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada catatan piutang.</td></tr>
            ) : (
              paginatedData.map(r => (
                <tr key={r.id}>
                  <td className="pl-6 retail-text-primary">{r.customer?.name || '-'}</td>
                  <td className="text-right">Rp {Number(r.total_amount).toLocaleString('id-ID')}</td>
                  <td className="text-right retail-text-secondary">Rp {Number(r.paid_amount).toLocaleString('id-ID')}</td>
                  <td className="text-right font-semibold">Rp {Number(r.remaining ?? (r.total_amount - r.paid_amount)).toLocaleString('id-ID')}</td>
                  <td className="text-center retail-text-secondary" style={{ fontSize: 12 }}>{r.due_date || '-'}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${r.status === 'paid' ? 'retail-badge-primary' : ''}`}>{r.status === 'paid' ? 'Lunas' : r.status === 'partial' ? 'Sebagian' : 'Belum Bayar'}</span>
                  </td>
                  <td className="pr-6 text-right">
                    {r.status !== 'paid' && (
                      <button className="btn btn-sm btn-ghost" onClick={() => { setPayModal(r); setPayAmount(r.remaining ?? (r.total_amount - r.paid_amount)); }} title="Terima"><Wallet size={15} /></button>
                    )}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Catat Piutang Pelanggan">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Pelanggan</label>
            <select name="customer_id" className="form-input" defaultValue="" required>
              <option value="" disabled>Pilih pelanggan...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Piutang (Rp)</label>
            <input name="total_amount" type="number" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Jatuh Tempo</label>
            <input name="due_date" type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Catatan</label>
            <textarea name="note" className="form-input" />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Catat Penerimaan Pembayaran">
        <form onSubmit={submitPayment} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Jumlah Diterima (Rp)</label>
            <input type="number" className="form-input" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setPayModal(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
