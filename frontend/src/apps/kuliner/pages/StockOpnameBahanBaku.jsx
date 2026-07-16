import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const STATUS_LABEL = {
  draft: 'Draft', pending_approval: 'Menunggu Persetujuan', approved: 'Disetujui', rejected: 'Ditolak',
};

export default function StockOpnameBahanBaku() {
  const toast = useToast();
  const confirm = useConfirm();

  const [opnames, setOpnames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [counts, setCounts] = useState({});

  const load = () => {
    setLoading(true);
    api.get('/kuliner/admin/ingredient-opnames').then((r) => setOpnames(r.data.data || [])).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount, same pattern used throughout this app
  useEffect(() => { load(); }, []);

  const startOpname = async () => {
    try {
      const res = await api.post('/kuliner/admin/ingredient-opnames', {});
      load();
      openDetail(res.data.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memulai stock opname');
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/kuliner/admin/ingredient-opnames/${id}`);
      setDetail(res.data);
      const c = {};
      res.data.items.forEach((i) => { c[i.ingredient_id] = i.physical_qty; });
      setCounts(c);
    } catch {
      toast.error('Gagal memuat detail stock opname');
    }
  };

  const saveCounts = async () => {
    try {
      const items = Object.entries(counts).map(([ingredient_id, physical_qty]) => ({ ingredient_id: Number(ingredient_id), physical_qty: Number(physical_qty) }));
      const res = await api.put(`/kuliner/admin/ingredient-opnames/${detail.id}`, { items });
      setDetail(res.data);
      toast.success('Hasil hitung disimpan');
    } catch {
      toast.error('Gagal menyimpan hasil hitung');
    }
  };

  const submitForApproval = async () => {
    await saveCounts();
    try {
      const res = await api.post(`/kuliner/admin/ingredient-opnames/${detail.id}/submit`);
      setDetail((prev) => ({ ...prev, status: res.data.status }));
      toast.success('Diajukan untuk persetujuan');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengajukan persetujuan');
    }
  };

  const approve = async () => {
    const ok = await confirm('Setujui stock opname ini? Stok bahan baku akan disesuaikan otomatis sesuai hasil hitung fisik.', { title: 'Setujui Stock Opname', danger: false });
    if (!ok) return;
    try {
      const res = await api.post(`/kuliner/admin/ingredient-opnames/${detail.id}/approve`);
      setDetail(res.data);
      toast.success('Stock opname disetujui, stok telah disesuaikan');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    }
  };

  const reject = async () => {
    const ok = await confirm('Tolak stock opname ini?', { title: 'Tolak Stock Opname' });
    if (!ok) return;
    try {
      const res = await api.post(`/kuliner/admin/ingredient-opnames/${detail.id}/reject`);
      setDetail(res.data);
      toast.success('Stock opname ditolak');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menolak');
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Stock Opname Bahan Baku</h1>
      </div>
      <div className="kd-content">
        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={startOpname}>+ Mulai Stock Opname</button>
        </div>

        <div className="kd-panel">
          <div className="kd-table-container" style={{ overflowX: 'auto' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Tanggal Mulai</th>
                  <th>Petugas</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Memuat...</td></tr>
                ) : opnames.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-slate-400">Belum ada stock opname.</td></tr>
                ) : (
                  opnames.map((o) => (
                    <tr key={o.id}>
                      <td>{new Date(o.created_at).toLocaleString('id-ID')}</td>
                      <td>{o.user?.name || '-'}</td>
                      <td><span className="kd-status-badge kd-status-active">{STATUS_LABEL[o.status] || o.status}</span></td>
                      <td className="text-right">
                        <button className="kd-icon-btn" title="Lihat" onClick={() => openDetail(o.id)}><Eye size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {detail && (
        <div className="kd-modal-overlay visible" onClick={() => setDetail(null)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">Stock Opname #{detail.id} — {STATUS_LABEL[detail.status]}</h2>
              <button className="kd-close-btn" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="kd-modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="kd-table">
                <thead>
                  <tr>
                    <th>Bahan Baku</th>
                    <th className="text-center">Stok Sistem</th>
                    <th className="text-center">Hitung Fisik</th>
                    <th className="text-center">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.ingredient?.name}</td>
                      <td className="text-center">{item.system_qty}</td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="kd-form-input"
                          style={{ width: 90, textAlign: 'center' }}
                          disabled={detail.status !== 'draft'}
                          value={counts[item.ingredient_id] ?? item.physical_qty}
                          onChange={(e) => setCounts((prev) => ({ ...prev, [item.ingredient_id]: e.target.value }))}
                        />
                      </td>
                      <td className="text-center" style={{ color: Number(counts[item.ingredient_id] ?? item.physical_qty) - item.system_qty !== 0 ? '#ef4444' : 'inherit' }}>
                        {Number(counts[item.ingredient_id] ?? item.physical_qty) - item.system_qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="kd-modal-footer">
              {detail.status === 'draft' && (
                <>
                  <button className="kd-btn kd-btn-secondary" onClick={saveCounts}>Simpan Hitungan</button>
                  <button className="kd-btn kd-btn-primary" onClick={submitForApproval}>Ajukan Persetujuan</button>
                </>
              )}
              {detail.status === 'pending_approval' && (
                <>
                  <button className="kd-btn kd-btn-secondary text-red-500" onClick={reject}>Tolak</button>
                  <button className="kd-btn kd-btn-primary" onClick={approve}>Setujui & Sesuaikan Stok</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
