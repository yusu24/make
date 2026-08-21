import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import Modal from '../../../components/Modal';
import CurrencyInput from '../../../components/CurrencyInput';
import RetailPagination from '../components/RetailPagination';
import '../retail.css';

const formatRp = (v) => `Rp ${Math.round(Number(v || 0)).toLocaleString('id-ID')}`;

export default function Shifts() {
  const toast = useToast();
  const confirm = useConfirm();

  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [saving, setSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(history.length / pageSize);
  const currentHistory = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const load = async () => {
    setLoading(true);
    try {
      const [curRes, histRes] = await Promise.all([
        api.get('/retail/shifts/current'),
        api.get('/retail/shifts/history'),
      ]);
      setCurrent(curRes.data.data);
      setHistory(histRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/retail/shifts/open', { opening_cash: openingCash || 0 });
      toast.success('Shift kasir berhasil dibuka');
      setShowOpenModal(false);
      setOpeningCash('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuka shift');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    const ok = await confirm('Tutup shift sekarang? Selisih uang kas akan dihitung secara otomatis berdasarkan transaksi penjualan tunai (CASH).', { title: 'Tutup Shift', danger: false });
    if (!ok) return;
    setSaving(true);
    try {
      await api.post(`/retail/shifts/${current.id}/close`, { closing_cash: closingCash || 0 });
      toast.success('Shift kasir berhasil ditutup');
      setShowCloseModal(false);
      setClosingCash('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menutup shift');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="retail-page-classic">
      {/* Header section similar to retail pages */}
      <div className="page-header" style={{ marginBottom: 32, justifyContent: 'flex-end' }}>
      </div>

      <div className="card mb-6 p-6 animate-fade-in" style={{ borderLeft: current?.id ? '4px solid #10b981' : '4px solid #94a3b8' }}>
        {loading ? (
          <div className="text-slate-400">Memuat status shift...</div>
        ) : current?.id ? (
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs font-bold tracking-wider">SHIFT AKTIF</span>
              <div className="mt-2 text-sm text-slate-600">
                Dibuka {new Date(current.opened_at).toLocaleString('id-ID')} oleh {current.user?.name || 'Kasir'}
              </div>
              <div className="mt-1 text-2xl font-bold retail-text-primary">Modal Awal: {formatRp(current.opening_cash)}</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCloseModal(true)}>Tutup Shift</button>
          </div>
        ) : (
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="px-3 py-1 rounded bg-slate-100 text-slate-500 text-xs font-bold tracking-wider">TIDAK ADA SHIFT AKTIF</span>
              <div className="mt-2 text-sm text-slate-600">Buka shift untuk mulai mencatat modal kasir di hari ini.</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowOpenModal(true)}>+ Buka Shift</button>
          </div>
        )}
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <h2 className="font-bold retail-text-primary m-0">Riwayat Shift</h2>
        </div>
        
        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Dibuka Pada</th>
                <th className="retail-table-header">Ditutup Pada</th>
                <th className="retail-table-header">Kas Awal</th>
                <th className="retail-table-header">Kas Akhir</th>
                <th className="retail-table-header">Ekspektasi Kas</th>
                <th className="retail-table-header">Selisih</th>
                <th className="pr-6 retail-table-header">Petugas</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-slate-400">Belum ada riwayat shift.</td></tr>
              ) : (
                currentHistory.map((s) => (
                  <tr key={s.id}>
                    <td className="pl-6">{new Date(s.opened_at).toLocaleString('id-ID')}</td>
                    <td>{s.closed_at ? new Date(s.closed_at).toLocaleString('id-ID') : '-'}</td>
                    <td>{formatRp(s.opening_cash)}</td>
                    <td>{s.closing_cash !== null ? formatRp(s.closing_cash) : '-'}</td>
                    <td>{s.expected_cash !== null ? formatRp(s.expected_cash) : '-'}</td>
                    <td style={{ color: s.difference < 0 ? '#ef4444' : s.difference > 0 ? '#10b981' : '#64748b', fontWeight: 700 }}>
                      {s.difference !== null ? formatRp(s.difference) : '-'}
                    </td>
                    <td className="pr-6">{s.user?.name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <RetailPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalItems={history.length}
        />
      </div>

      <Modal isOpen={showOpenModal} onClose={() => setShowOpenModal(false)} title="Buka Shift Kasir">
        <form onSubmit={handleOpen} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Modal Awal / Uang Kembalian (Rp)</label>
            <CurrencyInput required className="form-input" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} placeholder="Contoh: 100.000" />
            <p className="text-xs text-slate-500 mt-1">Masukkan jumlah uang tunai fisik yang ada di laci kasir saat ini.</p>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowOpenModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Mulai Shift'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="Tutup Shift Kasir">
        <form onSubmit={handleClose} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Total Uang Fisik Akhir (Rp)</label>
            <CurrencyInput required className="form-input" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} placeholder="Contoh: 1.500.000" />
            <p className="text-xs text-slate-500 mt-1">Hitung uang fisik di laci saat ini dan masukkan jumlahnya di sini.</p>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Tutup Shift'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
