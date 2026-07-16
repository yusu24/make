import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Plus, Wallet, TrendingDown, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Payables() {
  const [payables, setPayables] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([api.get('/retail/payables'), api.get('/retail/suppliers')]);
      setPayables(pRes.data.data); setSummary(pRes.data.summary); setSuppliers(sRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.post('/retail/payables', {
        supplier_id: fd.get('supplier_id'),
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
      await api.post(`/retail/payables/${payModal.id}/payments`, { amount_paid: payAmount, payment_method: 'CASH' });
      setPayModal(null); setPayAmount(0); fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal mencatat pembayaran'); }
  };

  const filteredPayables = payables.filter(p =>
    (p.supplier?.name || '').toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredPayables);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {/* Total Hutang Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
              <TrendingDown size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Hutang</span>
          </div>
          <div>
            <p className="text-2xl text-slate-900 leading-tight font-semibold">Rp {Number(summary.total_debt || 0).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-1">Total keseluruhan hutang ke supplier.</p>
          </div>
        </div>

        {/* Sudah Dibayar Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
              <CheckCircle size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Sudah Dibayar</span>
          </div>
          <div>
            <p className="text-2xl text-emerald-600 leading-tight font-semibold">Rp {Number(summary.total_paid || 0).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-1">Total pembayaran yang telah dilunasi.</p>
          </div>
        </div>

        {/* Sisa Hutang Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
              <AlertCircle size={18} />
            </div>
            <span className="text-sm font-medium text-slate-500">Sisa Hutang</span>
          </div>
          <div>
            <p className="text-2xl text-amber-600 leading-tight font-semibold">Rp {Number(summary.total_outstanding || 0).toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-400 mt-1">Hutang yang belum dilunasi.</p>
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
            <span className="btn-text-mobile-hide">Catat Hutang Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari supplier..."
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
              <th className="pl-6 retail-table-header">Supplier</th>
              <th className="text-right retail-table-header">Total</th>
              <th className="text-right retail-table-header">Terbayar</th>
              <th className="text-right retail-table-header">Sisa</th>
              <th className="text-center retail-table-header">Jatuh Tempo</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={7} />
            ) : filteredPayables.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada catatan hutang.</td></tr>
            ) : (
              paginatedData.map(p => (
                <tr key={p.id}>
                  <td className="pl-6 retail-text-primary">{p.supplier?.name || '-'}</td>
                  <td className="text-right">Rp {Number(p.total_amount).toLocaleString('id-ID')}</td>
                  <td className="text-right retail-text-secondary">Rp {Number(p.paid_amount).toLocaleString('id-ID')}</td>
                  <td className="text-right font-semibold">Rp {Number(p.remaining ?? (p.total_amount - p.paid_amount)).toLocaleString('id-ID')}</td>
                  <td className="text-center retail-text-secondary" style={{ fontSize: 12 }}>{p.due_date || '-'}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${p.status === 'paid' ? 'retail-badge-primary' : ''}`}>{p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Belum Bayar'}</span>
                  </td>
                  <td className="pr-6 text-right">
                    {p.status !== 'paid' && (
                      <button className="btn btn-sm btn-ghost" onClick={() => { setPayModal(p); setPayAmount(p.remaining ?? (p.total_amount - p.paid_amount)); }} title="Bayar"><Wallet size={15} /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Catat Hutang ke Supplier">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select name="supplier_id" className="form-input" defaultValue="" required>
              <option value="" disabled>Pilih supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Hutang (Rp)</label>
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

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Catat Pembayaran">
        <form onSubmit={submitPayment} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Jumlah Dibayar (Rp)</label>
            <input type="number" className="form-input" value={payAmount} onChange={e => setPayAmount(Number(e.target.value))} required />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setPayModal(null)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Pembayaran</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
