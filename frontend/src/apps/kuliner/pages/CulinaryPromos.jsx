import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Lightbulb, X, Search, Tag, Check, Ban } from '@/constants/icons';
import api from '../../../services/api';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import KulinerLoading from '../components/KulinerLoading';
import ClientPagination from '../components/ClientPagination';
import { useConfirm } from '../../../components/ConfirmDialog';
import './KulinerDashboard.css';

const CulinaryPromos = () => {
  const confirm = useConfirm();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [promoForm, setPromoForm] = useState({
    name: '',
    code: '',
    type: 'discount',
    value: '',
    description: '',
    quota: 0,
    expired_at: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const response = await api.get('/kuliner/admin/promos');
      setPromos(response.data || []);
    } catch (error) {
      console.error('Failed to fetch promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setPromoForm({
        name: item.name,
        code: item.code,
        type: item.type,
        value: item.value,
        description: item.description || '',
        quota: item.quota || 0,
        expired_at: item.expired_at ? item.expired_at.split('T')[0] : '',
        status: item.status
      });
    } else {
      setEditingItem(null);
      setPromoForm({ name: '', code: '', type: 'discount', value: '', description: '', quota: 0, expired_at: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/kuliner/admin/promos/${editingItem.id}`, promoForm);
      } else {
        await api.post('/kuliner/admin/promos', promoForm);
      }
      await fetchPromos();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save promo:', error);
      alert('Gagal menyimpan promo. Kode promo mungkin sudah digunakan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromo = async (id) => {
    const ok = await confirm('Yakin ingin menghapus promo ini?');
    if (!ok) return;
    try {
      await api.delete(`/kuliner/admin/promos/${id}`);
      setPromos(promos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete promo:', error);
    }
  };

  const toggleStatus = async (promo) => {
    try {
      const newStatus = promo.status === 'active' ? 'inactive' : 'active';
      await api.put(`/kuliner/admin/promos/${promo.id}`, { ...promo, status: newStatus });
      fetchPromos();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  // Filtered promos
  const filteredPromos = useMemo(() => {
    return promos.filter(promo => {
      const matchSearch = (promo.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (promo.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (promo.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || promo.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [promos, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage) || 1;
  const paginatedPromos = useMemo(() => {
    return filteredPromos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredPromos, currentPage, itemsPerPage]);

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Promo & Kupon Diskon</h1>
      </div>

      <div className="kd-content">
        <div className="kd-page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="kd-form-input"
                style={{ paddingLeft: 34, height: 36, fontSize: 12 }}
                placeholder="Cari nama atau kode promo..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select
              className="kd-form-select"
              style={{ width: 'auto', height: 36, fontSize: 12, padding: '0 10px' }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <button className="kd-btn kd-btn-primary flex items-center gap-1.5" onClick={() => handleOpenModal()}>
            <Plus size={15} /> Buat Promo Baru
          </button>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="kd-table">
              <thead>
                <tr>
                  <th style={{ width: 44, textAlign: 'center' }}>#</th>
                  <th>Kode Promo</th>
                  <th>Nama Promo</th>
                  <th>Tipe & Nilai</th>
                  <th>Kuota</th>
                  <th>Masa Berlaku</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10">
                      <div className="spinner" style={{ margin: '0 auto 10px' }} />
                      <span className="text-slate-400 text-xs">Memuat data promo...</span>
                    </td>
                  </tr>
                ) : paginatedPromos.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400 text-xs italic">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Tidak ada promo yang sesuai dengan filter pencarian.' 
                        : 'Belum ada promo atau kupon dibuat. Klik "+ Buat Promo Baru" untuk menambahkan.'}
                    </td>
                  </tr>
                ) : (
                  paginatedPromos.map((promo, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    const isExpired = promo.expired_at && new Date(promo.expired_at) < new Date();

                    return (
                      <tr key={promo.id} style={{ opacity: promo.status === 'inactive' ? 0.65 : 1 }}>
                        {/* No */}
                        <td style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                          {globalIndex}
                        </td>

                        {/* Kode Promo */}
                        <td className="whitespace-nowrap">
                          <code className="text-[12px] font-mono font-normal bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded">
                            {promo.code}
                          </code>
                        </td>

                        {/* Nama Promo */}
                        <td>
                          <span className="font-normal text-slate-800 text-[12px]">{promo.name}</span>
                        </td>

                        {/* Tipe & Nilai */}
                        <td className="whitespace-nowrap">
                          <span className="font-semibold text-amber-700 text-[12px]">{promo.value}</span>
                          <span className="text-[12px] text-slate-400 ml-1.5 font-normal">
                            ({promo.type === 'discount' ? 'Diskon %' : promo.type === 'nominal' ? 'Nominal' : 'Bundling'})
                          </span>
                        </td>

                        {/* Kuota */}
                        <td className="whitespace-nowrap text-[12px] text-slate-700 font-normal">
                          {promo.quota === 0 ? (
                            <span className="text-slate-500 font-normal">Tak Terbatas</span>
                          ) : (
                            <span><span className="font-semibold">{promo.used_count || 0} / {promo.quota}</span> <span className="text-[12px] text-slate-400 font-normal">terpakai</span></span>
                          )}
                        </td>

                        {/* Masa Berlaku */}
                        <td className="whitespace-nowrap text-[12px] font-normal">
                          {promo.expired_at ? (
                            <span className={isExpired ? 'text-rose-600 font-normal' : 'text-slate-700 font-normal'}>
                              {new Date(promo.expired_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                              {isExpired && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[12px] font-normal border border-rose-200">
                                  Kedaluwarsa
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-normal text-[12px]">Selamanya</span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleStatus(promo)}
                            className={`kd-status-badge cursor-pointer hover:opacity-80 transition-opacity ${promo.status === 'active' ? 'kd-status-active' : 'kd-status-hidden'}`}
                            title="Klik untuk mengubah status"
                          >
                            {promo.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>

                        {/* Aksi */}
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              className="kd-icon-btn"
                              title="Edit Promo"
                              onClick={() => handleOpenModal(promo)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="kd-icon-btn text-red-500"
                              title="Hapus Promo"
                              onClick={() => handleDeletePromo(promo.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <ClientPagination
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredPromos.length}
          />
        </div>

        <div style={{ marginTop: 24, padding: '16px 20px', background: '#fffbeb', borderRadius: 16, border: '1px solid #fef3c7' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Lightbulb size={24} className="text-amber-500 flex-shrink-0" />
            <div>
              <h5 className="font-bold text-amber-800 text-xs mb-0.5">Tips Marketing Restoran</h5>
              <p className="text-[11px] text-amber-700/80 leading-relaxed m-0">Gunakan fitur <strong>Kuota</strong> untuk membuat promo eksklusif. Pelanggan akan lebih cepat memesan jika mereka tahu jumlah promo sangat terbatas!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Buat Promo */}
      {showModal && (
        <div className="kd-modal-overlay visible">
          <div className="kd-modal" style={{ maxWidth: '500px' }}>
            <div className="kd-modal-header">
              <h2 className="kd-modal-title">{editingItem ? 'Edit' : 'Buat'} Promo Baru</h2>
              <button className="kd-modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSavePromo} className="kd-modal-body">
              <div className="kd-form-group">
                <label className="kd-form-label">Nama Promo</label>
                <input 
                  required 
                  type="text" 
                  className="kd-form-input" 
                  placeholder="Contoh: Promo Ramadhan" 
                  value={promoForm.name}
                  onChange={e => setPromoForm({...promoForm, name: e.target.value})}
                />
              </div>
              <div className="kd-form-grid">
                <div className="kd-form-group">
                  <label className="kd-form-label">Kode Promo</label>
                  <input 
                    required 
                    type="text" 
                    className="kd-form-input font-mono" 
                    placeholder="RAMADHAN24" 
                    value={promoForm.code}
                    disabled={!!editingItem}
                    onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Tipe</label>
                  <select 
                    className="kd-form-input"
                    value={promoForm.type}
                    onChange={e => setPromoForm({...promoForm, type: e.target.value})}
                  >
                    <option value="discount">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="bundle">Bundling</option>
                  </select>
                </div>
              </div>
              <div className="kd-form-row">
                <div className="kd-form-group">
                  <label className="kd-form-label">Nilai Keuntungan</label>
                  <input 
                    required 
                    type="text" 
                    className="kd-form-input" 
                    placeholder="Contoh: 20% atau Rp 10.000" 
                    value={promoForm.value}
                    onChange={e => setPromoForm({...promoForm, value: e.target.value})}
                  />
                </div>
                <div className="kd-form-group">
                  <label className="kd-form-label">Kuota Pemakaian</label>
                  <input 
                    type="number" 
                    className="kd-form-input" 
                    placeholder="0 = Tanpa Batas" 
                    value={promoForm.quota}
                    onChange={e => setPromoForm({...promoForm, quota: e.target.value})}
                  />
                </div>
              </div>
              <div className="kd-form-group">
                <label className="kd-form-label">Berlaku Hingga (Opsional)</label>
                <input 
                  type="date" 
                  className="kd-form-input" 
                  value={promoForm.expired_at}
                  onChange={e => setPromoForm({...promoForm, expired_at: e.target.value})}
                />
              </div>
              <div className="kd-form-group">
                <label className="kd-form-label">Keterangan / Deskripsi Promo</label>
                <textarea 
                  className="kd-form-input" 
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  placeholder="Contoh: Berlaku untuk minimal pembelian Rp 50.000" 
                  value={promoForm.description}
                  onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                />
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" disabled={saving} className="kd-btn kd-btn-primary">
                  {saving ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryPromos;
