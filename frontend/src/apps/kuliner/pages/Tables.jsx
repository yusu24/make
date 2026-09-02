import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Edit3, Trash2, LayoutGrid, Users, X, Printer, Copy, Check } from 'lucide-react';
import { useTranslation } from '../../../contexts/I18nContext';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const STATUS_COLOR = { empty: '#22c55e', occupied: '#ef4444', reserved: '#f59e0b', cleaning: '#94a3b8' };
const STATUS_CYCLE = ['empty', 'occupied', 'reserved', 'cleaning'];
const emptyForm = { name: '', capacity: 4 };

const selfOrderUrl = (tableName) => {
  const base = window.location.origin;
  return `${base}/kuliner/menu?mode=selforder&table=${encodeURIComponent(tableName)}`;
};

export default function Tables() {
  const { t } = useTranslation();
  const STATUS_LABEL = { empty: t('kulinerOrders.statusAvailable') || 'Kosong', occupied: t('kulinerOrders.statusOccupied') || 'Terisi', reserved: t('kulinerOrders.statusReserved') || 'Dipesan', cleaning: 'Dibersihkan' };

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
        toast.success(t('kulinerOrders.alertSaveSuccess') || 'Meja diperbarui');
      } else {
        await api.post('/kuliner/admin/tables', form);
        toast.success(t('kulinerOrders.alertSaveSuccess') || 'Meja ditambahkan');
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
    const ok = await confirm(`${t('kulinerOrders.deleteConfirm') || 'Hapus meja'} "${t.name}"?`);
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/tables/${t.id}`);
      toast.success(t('kulinerOrders.alertDeleteSuccess') || 'Meja dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus meja');
    }
  };

  const handlePrintQr = () => window.print();

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">{t('kulinerOrders.tablesTitle') || 'Manajemen Meja & QR Self Order'}</h1>
      </div>
      <div className="kd-content">
        {!dineInEnabled && (
          <div className="kd-panel" style={{ padding: 16, marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
            Mode Dine-In belum diaktifkan di Pengaturan Toko. Anda tetap bisa mengelola meja, tapi aktifkan Dine-In agar QR Self Order berjalan optimal.
          </div>
        )}

        <div className="kd-page-actions">
          <button className="kd-btn kd-btn-primary" onClick={openCreate}>{t('kulinerOrders.addTableBtn') || '+ Tambah Meja'}</button>
        </div>

        <div className="kd-panel">
          {loading ? (
            <div className="text-center py-10 text-slate-400">{t('kulinerCommon.loadingData') || 'Memuat...'}</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-10 text-slate-400">{t('kulinerCommon.emptyData') || 'Belum ada meja. Tambahkan meja pertama Anda.'}</div>
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
        <div 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16
          }} 
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'kd-fadeIn 0.2s ease'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                  <LayoutGrid size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {editingTable ? (t('kulinerOrders.editTableModalTitle') || 'Edit Data Meja') : (t('kulinerOrders.addTableModalTitle') || 'Tambah Meja Baru')}
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                    {editingTable ? 'Perbarui nomor identitas dan kapasitas meja' : 'Daftarkan meja makan baru untuk pesanan & QR order'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: 8,
                  width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B', transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  {t('kulinerOrders.formTableName') || 'Nama / Nomor Meja'} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  required 
                  placeholder="Contoh: Meja 01, Meja VIP, Outdoor 03"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 10,
                    fontSize: 13.5,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#B45309'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                    {t('kulinerOrders.formTableCapacity') || 'Kapasitas Pengunjung'} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: 11, color: '#64748B' }}>Orang / Kursi</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    value={form.capacity} 
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })} 
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      fontSize: 13.5,
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#B45309'}
                    onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    height: 38,
                    padding: '0 16px',
                    borderRadius: 8,
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {t('kulinerOrders.cancel') || 'Batal'}
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    height: 38,
                    padding: '0 20px',
                    borderRadius: 8,
                    background: '#B45309',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {saving ? (t('kulinerOrders.savingBtn') || 'Menyimpan...') : (t('kulinerOrders.saveBtn') || 'Simpan Meja')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrTable && (
        <div 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16
          }} 
          onClick={() => setQrTable(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 440,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'kd-fadeIn 0.2s ease'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    QR Self Order
                  </h3>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                    Pelanggan dapat memindai untuk melihat menu & memesan
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setQrTable(null)}
                style={{
                  background: '#F1F5F9', border: 'none', borderRadius: 8,
                  width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748B'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Card Body */}
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ display: 'inline-block', padding: 20, background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <QRCodeSVG value={selfOrderUrl(qrTable.name)} size={200} />
              </div>
              <div style={{ marginTop: 14 }}>
                <span style={{ display: 'inline-block', padding: '4px 12px', background: '#FEF3C7', color: '#B45309', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
                  {qrTable.name}
                </span>
              </div>
              <div style={{ marginTop: 10, background: '#F8FAFC', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 11.5, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  {selfOrderUrl(qrTable.name)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selfOrderUrl(qrTable.name));
                    toast.success('Link QR berhasil disalin!');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', display: 'flex', alignItems: 'center', padding: 2 }}
                  title="Salin Link"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
              <button 
                type="button" 
                onClick={() => setQrTable(null)}
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 8,
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
              <button 
                type="button" 
                onClick={handlePrintQr}
                style={{
                  height: 38,
                  padding: '0 18px',
                  borderRadius: 8,
                  background: '#B45309',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Printer size={16} />
                <span>Cetak QR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
}
