import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Tag } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/retail/discounts'); setDiscounts(res.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      code: fd.get('code').toUpperCase(),
      name: fd.get('name'),
      type: fd.get('type'),
      value: Number(fd.get('value')),
      min_purchase: Number(fd.get('min_purchase') || 0),
      max_uses: fd.get('max_uses') ? Number(fd.get('max_uses')) : null,
      is_active: fd.get('is_active') === 'on',
    };
    try {
      if (editing) await api.put(`/retail/discounts/${editing.id}`, data);
      else await api.post('/retail/discounts', data);
      setShowModal(false); setEditing(null); fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan diskon'); }
  };

  const filteredDiscounts = discounts.filter(d =>
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredDiscounts);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => { setEditing(null); setShowModal(true); }}
          >
            <Tag size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Kode Diskon Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari kode/nama diskon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Kode</th>
              <th className="retail-table-header">Nama</th>
              <th className="retail-table-header">Tipe</th>
              <th className="text-center retail-table-header">Nilai</th>
              <th className="text-center retail-table-header">Terpakai</th>
              <th className="text-center retail-table-header">Status</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={7} />
            ) : filteredDiscounts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada kode diskon.</td></tr>
            ) : (
              paginatedData.map(d => (
                <tr key={d.id}>
                  <td className="pl-6"><span className="retail-badge retail-badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Tag size={11} /> {d.code}</span></td>
                  <td className="retail-text-primary">{d.name}</td>
                  <td className="retail-text-secondary">{d.type === 'percentage' ? 'Persentase' : d.type === 'flat' ? 'Nominal' : 'BOGO'}</td>
                  <td className="text-center">{d.type === 'percentage' ? `${d.value}%` : `Rp ${Number(d.value).toLocaleString('id-ID')}`}</td>
                  <td className="text-center">{d.used_count}{d.max_uses ? ` / ${d.max_uses}` : ''}</td>
                  <td className="text-center">
                    <span className={`retail-badge ${d.is_active ? 'retail-badge-primary' : ''}`}>{d.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                  <td className="pr-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-sm btn-ghost" onClick={() => { setEditing(d); setShowModal(true); }}><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { if (confirm('Hapus kode diskon ini?')) { await api.delete(`/retail/discounts/${d.id}`); fetchData(); } }}><Trash2 size={14} /></button>
                    </div>
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Kode Diskon' : 'Kode Diskon Baru'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Kode</label>
            <input name="code" className="form-input" defaultValue={editing?.code} required placeholder="PROMO10" />
          </div>
          <div className="form-group">
            <label className="form-label">Nama</label>
            <input name="name" className="form-input" defaultValue={editing?.name} required placeholder="Promo Ulang Tahun" />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe</label>
            <select name="type" className="form-input" defaultValue={editing?.type || 'percentage'}>
              <option value="percentage">Persentase (%)</option>
              <option value="flat">Nominal (Rp)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nilai</label>
            <input name="value" type="number" className="form-input" defaultValue={editing?.value} required />
          </div>
          <div className="form-group">
            <label className="form-label">Minimal Pembelian (Rp)</label>
            <input name="min_purchase" type="number" className="form-input" defaultValue={editing?.min_purchase || 0} />
          </div>
          <div className="form-group">
            <label className="form-label">Maks. Penggunaan (kosongkan jika tanpa batas)</label>
            <input name="max_uses" type="number" className="form-input" defaultValue={editing?.max_uses || ''} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_active" defaultChecked={editing ? editing.is_active : true} />
            <span className="form-label" style={{ marginBottom: 0 }}>Aktif</span>
          </label>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditing(null); }}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
