import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

export default function Shift() {
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

  const load = async () => {
    setLoading(true);
    try {
      const [curRes, histRes] = await Promise.all([
        api.get('/kuliner/admin/shifts/current'),
        api.get('/kuliner/admin/shifts/history'),
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
      await api.post('/kuliner/admin/shifts/open', { opening_cash: openingCash || 0 });
      toast.success('Shift dibuka');
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
    const ok = await confirm('Tutup shift sekarang? Selisih kas akan dihitung otomatis.', { title: 'Tutup Shift', danger: false });
    if (!ok) return;
    setSaving(true);
    try {
      await api.post(`/kuliner/admin/shifts/${current.id}/close`, { closing_cash: closingCash || 0 });
      toast.success('Shift ditutup');
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
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Shift Kasir</h1>
      </div>
      <div className="kd-content">
        <div className="kd-panel" style={{ padding: 24, marginBottom: 16 }}>
          {loading ? (
            <div className="text-slate-400">Memuat status shift...</div>
          ) : current?.id ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="kd-status-badge kd-status-active">SHIFT AKTIF</span>
                <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>
                  Dibuka {new Date(current.opened_at).toLocaleString('id-ID')} oleh {current.user?.name}
                </div>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>Kas Awal: {formatRp(current.opening_cash)}</div>
              </div>
              <button className="kd-btn kd-btn-primary" onClick={() => setShowCloseModal(true)}>Tutup Shift</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="kd-status-badge kd-status-hidden">TIDAK ADA SHIFT AKTIF</span>
                <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>Buka shift untuk mulai mencatat kas kasir hari ini.</div>
              </div>
              <button className="kd-btn kd-btn-primary" onClick={() => setShowOpenModal(true)}>+ Buka Shift</button>
            </div>
          )}
        </div>

        <div className="kd-panel">
          <div className="kd-panel-header"><span className="kd-panel-title">Riwayat Shift</span></div>
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Dibuka</th>
                  <th>Ditutup</th>
                  <th>Kas Awal</th>
                  <th>Kas Akhir</th>
                  <th>Ekspektasi</th>
                  <th>Selisih</th>
                  <th>Petugas</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-slate-400">Belum ada riwayat shift.</td></tr>
                ) : (
                  history.map((s) => (
                    <tr key={s.id}>
                      <td>{new Date(s.opened_at).toLocaleString('id-ID')}</td>
                      <td>{s.closed_at ? new Date(s.closed_at).toLocaleString('id-ID') : '-'}</td>
                      <td>{formatRp(s.opening_cash)}</td>
                      <td>{s.closing_cash !== null ? formatRp(s.closing_cash) : '-'}</td>
                      <td>{s.expected_cash !== null ? formatRp(s.expected_cash) : '-'}</td>
                      <td style={{ color: s.difference < 0 ? '#ef4444' : s.difference > 0 ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                        {s.difference !== null ? formatRp(s.difference) : '-'}
                      </td>
                      <td>{s.user?.name || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showOpenModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowOpenModal(false)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">Buka Shift</h2>
              <button className="kd-close-btn" onClick={() => setShowOpenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleOpen}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Kas Awal (Rp)</label>
                  <input required type="number" min="0" className="kd-form-input" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowOpenModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Buka Shift'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowCloseModal(false)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">Tutup Shift</h2>
              <button className="kd-close-btn" onClick={() => setShowCloseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleClose}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Kas Akhir (Rp) — hitung fisik uang di laci kasir</label>
                  <input required type="number" min="0" className="kd-form-input" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowCloseModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Tutup Shift'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
