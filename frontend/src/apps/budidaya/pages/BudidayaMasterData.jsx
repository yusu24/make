import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Plus, Edit3, Trash2, Tag, Ruler, Package, CheckCircle2, XCircle, Search, Layers } from 'lucide-react';
import Modal from '../../../components/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';
import usePagination from '../../../hooks/usePagination';
import BudidayaPagination from '../components/BudidayaPagination';
import '../budidaya.css';

export default function BudidayaMasterData() {
  const { user } = useAuth();
  const terms = useBudidayaTerms();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'finance';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // ─── 1. FINANCE CATEGORIES STATE ──────────────────────────────────────────
  const [financeCategories, setFinanceCategories] = useState([]);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [editingFinanceCat, setEditingFinanceCat] = useState(null);
  const [financeTypeFilter, setFinanceTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'

  // ─── 2. UNITS STATE ───────────────────────────────────────────────────────
  const [units, setUnits] = useState([]);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitCategoryFilter, setUnitCategoryFilter] = useState('all');

  // ─── 3. FEED CATEGORIES STATE ─────────────────────────────────────────────
  const [feedCategories, setFeedCategories] = useState([]);
  const [showFeedCatModal, setShowFeedCatModal] = useState(false);
  const [editingFeedCat, setEditingFeedCat] = useState(null);

  // ─── FETCH ALL MASTER DATA ────────────────────────────────────────────────
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resFin, resUnits, resFeedCats] = await Promise.all([
        api.get('/budidaya/finance-categories').catch(() => ({ data: { data: [] } })),
        api.get('/budidaya/units').catch(() => ({ data: { data: [] } })),
        api.get('/budidaya/feed-categories').catch(() => ({ data: [] }))
      ]);

      setFinanceCategories(resFin.data?.data || resFin.data || []);
      setUnits(resUnits.data?.data || resUnits.data || []);
      setFeedCategories(Array.isArray(resFeedCats.data) ? resFeedCats.data : (resFeedCats.data?.data || []));
    } catch (e) {
      console.error('Error fetching master data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── FINANCE CATEGORY HANDLERS ────────────────────────────────────────────
  const handleFinanceSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      type: fd.get('type'),
      code: fd.get('code') || '',
      description: fd.get('description') || '',
    };

    try {
      if (editingFinanceCat) {
        await api.put(`/budidaya/finance-categories/${editingFinanceCat.id}`, data);
      } else {
        await api.post('/budidaya/finance-categories', data);
      }
      fetchAllData();
      setShowFinanceModal(false);
      setEditingFinanceCat(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kategori pos keuangan');
    }
  };

  const handleDeleteFinanceCat = async (cat) => {
    if (!window.confirm(`Yakin ingin menghapus pos keuangan "${cat.name}"?`)) return;
    try {
      await api.delete(`/budidaya/finance-categories/${cat.id}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pos keuangan');
    }
  };

  // ─── UNIT HANDLERS ────────────────────────────────────────────────────────
  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      symbol: fd.get('symbol'),
      category: fd.get('category') || 'jumlah',
      description: fd.get('description') || '',
    };

    try {
      if (editingUnit) {
        await api.put(`/budidaya/units/${editingUnit.id}`, data);
      } else {
        await api.post('/budidaya/units', data);
      }
      fetchAllData();
      setShowUnitModal(false);
      setEditingUnit(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan satuan dasar');
    }
  };

  const handleDeleteUnit = async (unit) => {
    if (!window.confirm(`Yakin ingin menghapus satuan "${unit.name}"?`)) return;
    try {
      await api.delete(`/budidaya/units/${unit.id}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus satuan');
    }
  };

  // ─── FEED CATEGORY HANDLERS ───────────────────────────────────────────────
  const handleFeedCatSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { name: fd.get('name') };

    try {
      if (editingFeedCat) {
        await api.put(`/budidaya/feed-categories/${editingFeedCat.id}`, data);
      } else {
        await api.post('/budidaya/feed-categories', data);
      }
      fetchAllData();
      setShowFeedCatModal(false);
      setEditingFeedCat(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kategori pakan');
    }
  };

  const handleDeleteFeedCat = async (cat) => {
    if (!window.confirm(`Yakin ingin menghapus kategori pakan "${cat.name}"?`)) return;
    try {
      await api.delete(`/budidaya/feed-categories/${cat.id}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori pakan');
    }
  };

  // ─── FILTERED DATA LISTS ──────────────────────────────────────────────────
  const filteredFinanceCategories = financeCategories.filter(cat => {
    if (financeTypeFilter !== 'all' && cat.type !== financeTypeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (cat.name || '').toLowerCase().includes(s) || (cat.description || '').toLowerCase().includes(s);
    }
    return true;
  });

  const filteredUnits = units.filter(u => {
    if (unitCategoryFilter !== 'all' && u.category !== unitCategoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (u.name || '').toLowerCase().includes(s) || (u.symbol || '').toLowerCase().includes(s) || (u.description || '').toLowerCase().includes(s);
    }
    return true;
  });

  const filteredFeedCategories = feedCategories.filter(c => {
    if (search) {
      return (c.name || '').toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Paginations
  const paginationFinance = usePagination(filteredFinanceCategories, 10);
  const paginationUnits = usePagination(filteredUnits, 10);
  const paginationFeedCats = usePagination(filteredFeedCategories, 10);

  return (
    <div style={{ padding: '18px 24px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif", animation: 'kd-fadeIn 0.3s ease' }}>
      
      {/* ─── Top Header Action Row (Title is in Navtop Header) ─── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {/* Primary Add Button based on Active Tab */}
        <div>
          {activeTab === 'finance' && (
            <button
              onClick={() => { setEditingFinanceCat(null); setShowFinanceModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1B4332', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <Plus size={16} />
              <span>Tambah Kategori Keuangan</span>
            </button>
          )}

          {activeTab === 'units' && (
            <button
              onClick={() => { setEditingUnit(null); setShowUnitModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1B4332', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <Plus size={16} />
              <span>Tambah Satuan Dasar</span>
            </button>
          )}

          {activeTab === 'feeds' && (
            <button
              onClick={() => { setEditingFeedCat(null); setShowFeedCatModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1B4332', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <Plus size={16} />
              <span>Tambah Kategori Pakan</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Search & Sub-Filter Bar ─── */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #E9F0EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        
        {/* Left Sub-filter based on active tab */}
        <div>
          {activeTab === 'finance' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#475569' }}>Filter Tipe:</span>
              <select
                value={financeTypeFilter}
                onChange={e => setFinanceTypeFilter(e.target.value)}
                style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', background: '#fff' }}
              >
                <option value="all">Semua Tipe Kategori ({financeCategories.length})</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
          )}

          {activeTab === 'units' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: '#475569' }}>Kategori Satuan:</span>
              <select
                value={unitCategoryFilter}
                onChange={e => setUnitCategoryFilter(e.target.value)}
                style={{ height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none', background: '#fff' }}
              >
                <option value="all">Semua Kategori ({units.length})</option>
                <option value="berat">Berat (Kg, Gram, Ton)</option>
                <option value="jumlah">Jumlah Populasi (Ekor, Bibit)</option>
                <option value="kemasan">Kemasan (Sak, Botol, Dus)</option>
                <option value="volume">Volume (Liter, mL)</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          )}

          {activeTab === 'feeds' && (
            <span style={{ fontSize: 12.5, color: '#64748b' }}>
              Daftar klasifikasi jenis pakan & suplemen
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: 240 }}>
          <input
            type="text"
            placeholder="Cari data master..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 36, padding: '0 12px 0 34px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
          />
          <Search size={15} style={{ position: 'absolute', left: 11, top: 10, color: '#94A3B8' }} />
        </div>
      </div>

      {/* ─── TAB 1: KATEGORI KEUANGAN TABLE ─── */}
      {activeTab === 'finance' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                  <th style={{ padding: '12px 14px', width: 45, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>No</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Nama Kategori</th>
                  <th style={{ padding: '12px 14px', width: 140, color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Tipe Kategori</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Keterangan</th>
                  <th style={{ padding: '12px 14px', width: 110, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 14px', width: 85, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>Memuat kategori keuangan...</td></tr>
                ) : paginationFinance.paginatedData.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>Belum ada kategori keuangan terdaftar.</td></tr>
                ) : (
                  paginationFinance.paginatedData.map((cat, idx) => (
                    <tr key={cat.id} style={{ borderBottom: idx === paginationFinance.paginatedData.length - 1 ? 'none' : '1px solid #E9F0EC' }}>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: '#64748b' }}>{paginationFinance.startIndex + idx + 1}</td>
                      <td style={{ padding: '11px 14px', color: '#0F172A', fontWeight: 500 }}>{cat.name}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                          background: cat.type === 'income' ? '#ECFDF5' : '#FEF2F2',
                          color: cat.type === 'income' ? '#059669' : '#DC2626',
                          border: `1px solid ${cat.type === 'income' ? '#A7F3D0' : '#FECACA'}`
                        }}>
                          {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>{cat.description || '-'}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: cat.is_active !== false ? '#059669' : '#94A3B8' }}>
                          {cat.is_active !== false ? '● Aktif' : '○ Nonaktif'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => { setEditingFinanceCat(cat); setShowFinanceModal(true); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteFinanceCat(cat)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredFinanceCategories.length > 0 && (
            <BudidayaPagination
              currentPage={paginationFinance.currentPage}
              totalPages={paginationFinance.totalPages}
              pageSize={paginationFinance.pageSize}
              totalItems={filteredFinanceCategories.length}
              startIndex={paginationFinance.startIndex}
              endIndex={paginationFinance.endIndex}
              onPageChange={paginationFinance.setCurrentPage}
              onPageSizeChange={paginationFinance.setPageSize}
            />
          )}
        </div>
      )}

      {/* ─── TAB 2: MASTER SATUAN DASAR (UNITS) TABLE ─── */}
      {activeTab === 'units' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                  <th style={{ padding: '12px 14px', width: 45, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>No</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Nama Satuan</th>
                  <th style={{ padding: '12px 14px', width: 100, color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Simbol</th>
                  <th style={{ padding: '12px 14px', width: 130, color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Kategori</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Keterangan Penggunaan</th>
                  <th style={{ padding: '12px 14px', width: 85, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>Memuat satuan dasar...</td></tr>
                ) : paginationUnits.paginatedData.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>Belum ada satuan dasar terdaftar.</td></tr>
                ) : (
                  paginationUnits.paginatedData.map((unit, idx) => (
                    <tr key={unit.id} style={{ borderBottom: idx === paginationUnits.paginatedData.length - 1 ? 'none' : '1px solid #E9F0EC' }}>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: '#64748b' }}>{paginationUnits.startIndex + idx + 1}</td>
                      <td style={{ padding: '11px 14px', color: '#0F172A' }}>{unit.name}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: '#F1F5F9', color: '#1B4332', fontSize: 12, fontWeight: 600, border: '1px solid #CBD5E1' }}>
                          {unit.symbol}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569', textTransform: 'capitalize' }}>{unit.category || 'Jumlah'}</td>
                      <td style={{ padding: '11px 14px', color: '#64748b' }}>{unit.description || '-'}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => { setEditingUnit(unit); setShowUnitModal(true); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredUnits.length > 0 && (
            <BudidayaPagination
              currentPage={paginationUnits.currentPage}
              totalPages={paginationUnits.totalPages}
              pageSize={paginationUnits.pageSize}
              totalItems={filteredUnits.length}
              startIndex={paginationUnits.startIndex}
              endIndex={paginationUnits.endIndex}
              onPageChange={paginationUnits.setCurrentPage}
              onPageSizeChange={paginationUnits.setPageSize}
            />
          )}
        </div>
      )}

      {/* ─── TAB 3: KATEGORI PAKAN TABLE ─── */}
      {activeTab === 'feeds' && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9F0EC', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E9F0EC' }}>
                  <th style={{ padding: '12px 14px', width: 45, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>No</th>
                  <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Nama Kategori Pakan</th>
                  <th style={{ padding: '12px 14px', width: 85, textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>Memuat kategori pakan...</td></tr>
                ) : paginationFeedCats.paginatedData.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: 36, color: '#94a3b8' }}>Belum ada kategori pakan terdaftar.</td></tr>
                ) : (
                  paginationFeedCats.paginatedData.map((cat, idx) => (
                    <tr key={cat.id} style={{ borderBottom: idx === paginationFeedCats.paginatedData.length - 1 ? 'none' : '1px solid #E9F0EC' }}>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: '#64748b' }}>{paginationFeedCats.startIndex + idx + 1}</td>
                      <td style={{ padding: '11px 14px', color: '#0F172A' }}>{cat.name}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => { setEditingFeedCat(cat); setShowFeedCatModal(true); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteFeedCat(cat)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}
                            title="Hapus"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredFeedCategories.length > 0 && (
            <BudidayaPagination
              currentPage={paginationFeedCats.currentPage}
              totalPages={paginationFeedCats.totalPages}
              pageSize={paginationFeedCats.pageSize}
              totalItems={filteredFeedCategories.length}
              startIndex={paginationFeedCats.startIndex}
              endIndex={paginationFeedCats.endIndex}
              onPageChange={paginationFeedCats.setCurrentPage}
              onPageSizeChange={paginationFeedCats.setPageSize}
            />
          )}
        </div>
      )}

      {/* ─── MODAL 1: KATEGORI KEUANGAN ─── */}
      <Modal
        isOpen={showFinanceModal}
        onClose={() => { setShowFinanceModal(false); setEditingFinanceCat(null); }}
        title={editingFinanceCat ? 'Edit Kategori Keuangan' : 'Tambah Kategori Keuangan'}
      >
        <form onSubmit={handleFinanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Tipe Kategori</label>
            <select
              name="type"
              defaultValue={editingFinanceCat?.type || 'expense'}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
              required
            >
              <option value="expense">Pengeluaran (Kas Keluar / Biaya Operasional)</option>
              <option value="income">Pemasukan (Kas Masuk / Penjualan & Pendapatan)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Nama Kategori</label>
            <input
              type="text"
              name="name"
              defaultValue={editingFinanceCat?.name || ''}
              placeholder="Contoh: Biaya Listrik, Upah Harian, Obat & Vitamin, Penjualan Sampingan..."
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Keterangan (Opsional)</label>
            <textarea
              name="description"
              defaultValue={editingFinanceCat?.description || ''}
              placeholder="Jelaskan alokasi atau penggunaan kategori ini..."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => { setShowFinanceModal(false); setEditingFinanceCat(null); }}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569' }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#1B4332', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              {editingFinanceCat ? 'Simpan Perubahan' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: MASTER SATUAN DASAR ─── */}
      <Modal
        isOpen={showUnitModal}
        onClose={() => { setShowUnitModal(false); setEditingUnit(null); }}
        title={editingUnit ? 'Edit Satuan Dasar' : 'Tambah Satuan Dasar Baru'}
      >
        <form onSubmit={handleUnitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Nama Satuan</label>
              <input
                type="text"
                name="name"
                defaultValue={editingUnit?.name || ''}
                placeholder="Contoh: Kilogram, Ekor, Sak..."
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Simbol / Singkatan</label>
              <input
                type="text"
                name="symbol"
                defaultValue={editingUnit?.symbol || ''}
                placeholder="Contoh: kg, ekor, sak, L..."
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Kategori Satuan</label>
            <select
              name="category"
              defaultValue={editingUnit?.category || 'jumlah'}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', background: '#fff' }}
            >
              <option value="berat">Berat (Kg, Gram, Ton)</option>
              <option value="jumlah">Jumlah Populasi (Ekor, Bibit, Batang)</option>
              <option value="kemasan">Kemasan (Sak, Botol, Dus, Karung)</option>
              <option value="volume">Volume (Liter, mL, Meter Kubik)</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Keterangan Satuan</label>
            <textarea
              name="description"
              defaultValue={editingUnit?.description || ''}
              placeholder="Contoh: Satuan standar berat pakan dan hasil panen..."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => { setShowUnitModal(false); setEditingUnit(null); }}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569' }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#1B4332', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              {editingUnit ? 'Simpan Perubahan' : 'Simpan Satuan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: KATEGORI PAKAN ─── */}
      <Modal
        isOpen={showFeedCatModal}
        onClose={() => { setShowFeedCatModal(false); setEditingFeedCat(null); }}
        title={editingFeedCat ? 'Edit Kategori Pakan' : 'Tambah Kategori Pakan Baru'}
      >
        <form onSubmit={handleFeedCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#334155', marginBottom: 4 }}>Nama Kategori Pakan</label>
            <input
              type="text"
              name="name"
              defaultValue={editingFeedCat?.name || ''}
              placeholder="Contoh: Pakan Pembesaran (Grower), Probiotik, Vitamin..."
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => { setShowFeedCatModal(false); setEditingFeedCat(null); }}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569' }}
            >
              Batal
            </button>
            <button
              type="submit"
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#1B4332', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              {editingFeedCat ? 'Simpan Perubahan' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
