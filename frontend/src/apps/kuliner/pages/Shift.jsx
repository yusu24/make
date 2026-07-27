import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import ClientPagination from '../components/ClientPagination';
import './KulinerDashboard.css';

const formatRp = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

export default function Shift() {
  const { t } = useTranslation();
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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
      toast.success(t('kulinerShift.alertOpenSuccess') || 'Shift dibuka');
      setShowOpenModal(false);
      setOpeningCash('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('kulinerShift.alertOpenFail') || 'Gagal membuka shift');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    const ok = await confirm(t('kulinerShift.closeShiftPromptMsg') || 'Tutup shift sekarang? Selisih kas akan dihitung otomatis.', { title: t('kulinerShift.closeShiftPromptTitle') || 'Tutup Shift', danger: false });
    if (!ok) return;
    setSaving(true);
    try {
      await api.post(`/kuliner/admin/shifts/${current.id}/close`, { closing_cash: closingCash || 0 });
      toast.success(t('kulinerShift.alertCloseSuccess') || 'Shift ditutup');
      setShowCloseModal(false);
      setClosingCash('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || t('kulinerShift.alertCloseFail') || 'Gagal menutup shift');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerShift.title') || 'Shift Kasir'}</h1>
      </div>
      <div className="kd-content">
        <div className="kd-panel" style={{ padding: 24, marginBottom: 16 }}>
          {loading ? (
            <div className="text-slate-400">{t('kulinerShift.loading') || 'Memuat status shift...'}</div>
          ) : current?.id ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="kd-status-badge kd-status-active">{t('kulinerShift.activeShift') || 'SHIFT AKTIF'}</span>
                <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>
                  {t('kulinerShift.openedBy', { date: new Date(current.opened_at).toLocaleString('id-ID'), name: current.user?.name }) || `Dibuka ${new Date(current.opened_at).toLocaleString('id-ID')} oleh ${current.user?.name}`}
                </div>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{t('kulinerShift.openingCash', { cash: formatRp(current.opening_cash) }) || `Kas Awal: ${formatRp(current.opening_cash)}`}</div>
              </div>
              <button className="kd-btn kd-btn-primary" onClick={() => setShowCloseModal(true)}>{t('kulinerShift.closeShiftBtn') || 'Tutup Shift'}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="kd-status-badge kd-status-hidden">{t('kulinerShift.noActiveShift') || 'TIDAK ADA SHIFT AKTIF'}</span>
                <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>{t('kulinerShift.openShiftInfo') || 'Buka shift untuk mulai mencatat kas kasir hari ini.'}</div>
              </div>
              <button className="kd-btn kd-btn-primary" onClick={() => setShowOpenModal(true)}>{t('kulinerShift.openShiftBtn') || '+ Buka Shift'}</button>
            </div>
          )}
        </div>

        <div className="kd-panel">
          <div className="kd-panel-header"><span className="kd-panel-title">{t('kulinerShift.historyTitle') || 'Riwayat Shift'}</span></div>
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>{t('kulinerShift.headerOpenedAt') || 'Dibuka'}</th>
                  <th>{t('kulinerShift.headerClosedAt') || 'Ditutup'}</th>
                  <th>{t('kulinerShift.headerOpeningCash') || 'Kas Awal'}</th>
                  <th>{t('kulinerShift.headerClosingCash') || 'Kas Akhir'}</th>
                  <th>{t('kulinerShift.headerExpectedCash') || 'Ekspektasi'}</th>
                  <th>{t('kulinerShift.headerDifference') || 'Selisih'}</th>
                  <th>{t('kulinerShift.headerOfficer') || 'Petugas'}</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-slate-400">{t('kulinerShift.emptyHistory') || 'Belum ada riwayat shift.'}</td></tr>
                ) : (
                  currentHistory.map((s) => (
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
          <ClientPagination setItemsPerPage={setItemsPerPage} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={history.length}
          />
        </div>
      </div>

      {showOpenModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowOpenModal(false)}>
          <div className="kd-modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{t('kulinerShift.openModalTitle') || 'Buka Shift'}</h2>
              <button className="kd-close-btn" onClick={() => setShowOpenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleOpen}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerShift.formOpeningCash') || 'Kas Awal (Rp)'}</label>
                  <input required type="number" min="0" className="kd-form-input" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowOpenModal(false)}>{t('kulinerShift.cancelBtn') || 'Batal'}</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? t('kulinerShift.savingBtn') || 'Menyimpan...' : t('kulinerShift.openModalTitle') || 'Buka Shift'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowCloseModal(false)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{t('kulinerShift.closeModalTitle') || 'Tutup Shift'}</h2>
              <button className="kd-close-btn" onClick={() => setShowCloseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleClose}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">{t('kulinerShift.formClosingCash') || 'Kas Akhir (Rp) — hitung fisik uang di laci kasir'}</label>
                  <input required type="number" min="0" className="kd-form-input" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowCloseModal(false)}>{t('kulinerShift.cancelBtn') || 'Batal'}</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? t('kulinerShift.savingBtn') || 'Menyimpan...' : t('kulinerShift.closeModalTitle') || 'Tutup Shift'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
