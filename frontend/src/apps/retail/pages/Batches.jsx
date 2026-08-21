import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    id: null,
    product_id: '',
    outlet_id: '',
    batch_no: '',
    expired_date: '',
    stock: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try { 
      const res = await api.get('/retail/batches'); 
      setBatches(res.data); 
    }
    catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const fetchDependencies = async () => {
    try {
      const [resOutlets, resProducts] = await Promise.all([
        api.get('/retail/outlets'),
        api.get('/retail/products')
      ]);
      setOutlets(resOutlets.data);
      setProducts(resProducts.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchDependencies();
  }, []);

  const openAdd = () => {
    setForm({ id: null, product_id: '', outlet_id: '', batch_no: '', expired_date: '', stock: '' });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setForm({
      id: b.id,
      product_id: b.product_id,
      outlet_id: b.outlet_id,
      batch_no: b.batch_no,
      expired_date: b.expired_date ? b.expired_date.substring(0, 10) : '',
      stock: b.stock
    });
    setShowModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/retail/batches/${form.id}`, form);
      } else {
        await api.post('/retail/batches', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menyimpan Batch');
    }
  };

  const deleteBatch = async (id) => {
    if (!window.confirm("Hapus Batch ini?")) return;
    try {
      await api.delete(`/retail/batches/${id}`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menghapus');
    }
  };

  const filtered = batches.filter(b => 
    b.product?.name?.toLowerCase().includes(search.toLowerCase()) || 
    b.batch_no?.toLowerCase().includes(search.toLowerCase())
  );

  const p = usePagination(filtered, 15);

  return (
    <div className="retail-page-classic">
      {/* Page Title Handled by Navtop */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button className="btn btn-primary" onClick={openAdd} style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}>
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Batch</span>
          </button>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              type="text"
              placeholder="Cari produk atau batch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Produk</th>
                <th className="retail-table-header">Cabang / Gudang</th>
                <th className="retail-table-header">Nomor Batch</th>
                <th className="retail-table-header">Expired Date</th>
                <th className="retail-table-header">Stok</th>
                <th className="text-right pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <RetailTableLoadingRow colSpan={6} /> : p.paginatedData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-slate-500">Belum ada data batch.</td></tr>
              ) : p.paginatedData.map(b => {
                const isExpired = b.expired_date && new Date(b.expired_date) < new Date();
                return (
                  <tr key={b.id} className={isExpired ? 'bg-red-50' : ''}>
                    <td className="pl-6">
                      <div className="retail-text-primary">{b.product?.name}</div>
                      <div className="text-[10px] retail-text-secondary">{b.product?.sku}</div>
                    </td>
                    <td><div className="text-sm retail-text-secondary">{b.outlet?.name || 'Pusat'}</div></td>
                    <td><div className="font-mono text-sm retail-text-primary">{b.batch_no}</div></td>
                    <td>
                      {b.expired_date ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          {new Date(b.expired_date).toLocaleDateString('id-ID')}
                        </span>
                      ) : '-'}
                    </td>
                    <td><div className="text-sm retail-text-primary">{b.stock}</div></td>
                    <td className="text-right pr-6 flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(b)} className="btn btn-sm btn-ghost" title="Edit Data"><Edit size={15} /></button>
                      <button onClick={() => deleteBatch(b.id)} className="btn btn-sm btn-ghost retail-text-danger" title="Hapus Data"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && <RetailPagination {...p} />}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={form.id ? "Edit Batch" : "Tambah Batch Baru"}>
          <form onSubmit={submitForm} className="flex flex-col gap-5">
            {!form.id && (
              <>
                <div className="form-group">
                  <label className="form-label">Produk</label>
                  <select className="form-input" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                    <option value="">-- Pilih Produk --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cabang / Gudang</label>
                  <select className="form-input" value={form.outlet_id} onChange={e => setForm({...form, outlet_id: e.target.value})} required>
                    <option value="">-- Pilih Cabang --</option>
                    {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Nomor Batch</label>
              <input type="text" className="form-input" value={form.batch_no} onChange={e => setForm({...form, batch_no: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Expired Date (Opsional)</label>
              <input type="date" className="form-input" value={form.expired_date} onChange={e => setForm({...form, expired_date: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Stok Awal</label>
              <input type="number" step="0.01" className="form-input" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
            </div>

            <div className="modal__actions">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Batal</button>
              <button type="submit" className="btn btn-primary">{form.id ? 'Simpan Perubahan' : 'Tambah Batch'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
