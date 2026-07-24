import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Edit3, Trash2 } from 'lucide-react';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const STATUS_LABEL = { empty: 'Kosong', occupied: 'Terisi', reserved: 'Dipesan', cleaning: 'Dibersihkan' };
const STATUS_COLOR = { empty: '#22c55e', occupied: '#ef4444', reserved: '#f59e0b', cleaning: '#94a3b8' };
const STATUS_CYCLE = ['empty', 'occupied', 'reserved', 'cleaning'];
const emptyForm = { name: '', capacity: 4 };

const selfOrderUrl = (tableName) => {
  const base = window.location.origin;
  return `${base}/kuliner/menu?mode=selforder&table=${encodeURIComponent(tableName)}`;
};

export default function Tables() {
  const toast = useToast();
  const confirm = useConfirm();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dineInEnabled, setDineInEnabled] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [qrTable, setQrTable] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/kuliner/admin/tables').then((r) => setTables(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/kuliner/admin/settings').then((r) => setDineInEnabled(!!r.data?.dine_in_enabled)).catch(() => console.error('Gagal memuat pengaturan dine-in'));
  }, []);

  const openCreate = () => { setEditingTable(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t) => { setEditingTable(t); setForm({ name: t.name, capacity: t.capacity }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTable) {
        await api.put(`/kuliner/admin/tables/${editingTable.id}`, form);
        toast.success('Meja diperbarui');
      } else {
        await api.post('/kuliner/admin/tables', form);
        toast.success('Meja ditambahkan');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan meja');
    } finally {
      setSaving(false);
    }
  };

  const cycleStatus = async (t) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(t.status) + 1) % STATUS_CYCLE.length];
    try {
      await api.patch(`/kuliner/admin/tables/${t.id}/status`, { status: next });
      setTables((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: next } : x)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status meja');
    }
  };

  const handleDelete = async (t) => {
    const ok = await confirm(`Hapus meja "${t.name}"?`, { title: 'Hapus Meja' });
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/tables/${t.id}`);
      toast.success('Meja dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus meja');
    }
  };

  const handlePrintQr = () => window.print();

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Manajemen Meja & QR Self Order</h1>
      </div>
      <div className="kd-content">
        {!dineInEnabled && (
          <div className="kd-panel" style={{ padding: 16, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
            Mode Dine-In belum diaktifkan di Pengaturan Toko. Anda tetap bisa mengelola meja, tapi aktifkan Dine-In agar QR Self Order berjalan optimal.
          </div>
        )}

        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>+ Tambah Meja</button>
        </div>

        <div className="kd-panel">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Memuat...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-10 text-slate-400">Belum ada meja. Tambahkan meja pertama Anda.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, padding: 16 }}>
              {tables.map((t) => (
                <div
                  key={t.id}
                  style={{
                    borderRadius: 12,
                    padding: 14,
                    border: `2px solid ${STATUS_COLOR[t.status]}`,
                    background: `${STATUS_COLOR[t.status]}14`,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Kapasitas {t.capacity} orang</div>
                  <button
                    onClick={() => cycleStatus(t)}
                    style={{
                      width: '100%', padding: '6px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: STATUS_COLOR[t.status], color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 8,
                    }}
                    title="Klik untuk ubah status"
                  >
                    {STATUS_LABEL[t.status]}
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="kd-icon-btn" style={{ flex: 1 }} title="QR Code" onClick={() => setQrTable(t)}><QrCode size={16} /></button>
                    <button className="kd-icon-btn" style={{ flex: 1 }} title="Edit" onClick={() => openEdit(t)}><Edit3 size={16} /></button>
                    <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(t)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="kd-modal-overlay visible" onClick={() => setShowModal(false)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingTable ? 'Edit Meja' : 'Tambah Meja'}</h2>
              <button className="kd-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="kd-modal-body">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nama / Nomor Meja</label>
                  <input required className="kd-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Meja 01" />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Kapasitas</label>
                  <input required type="number" min="1" className="kd-form-input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrTable && (
        <div className="kd-modal-overlay visible" onClick={() => setQrTable(null)}>
          <div className="kd-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">QR Self Order — {qrTable.name}</h2>
              <button className="kd-close-btn" onClick={() => setQrTable(null)}>✕</button>
            </div>
            <div className="kd-modal-body" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12 }}>
                <QRCodeSVG value={selfOrderUrl(qrTable.name)} size={220} />
              </div>
              <p style={{ marginTop: 12, fontWeight: 700 }}>{qrTable.name}</p>
              <p style={{ fontSize: 12, color: '#64748b', wordBreak: 'break-all' }}>{selfOrderUrl(qrTable.name)}</p>
            </div>
            <div className="kd-modal-footer">
              <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setQrTable(null)}>Tutup</button>
              <button type="button" className="kd-btn kd-btn-primary" onClick={handlePrintQr}>Cetak</button>
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
