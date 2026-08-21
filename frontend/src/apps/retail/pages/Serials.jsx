import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Serials() {
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    id: null,
    product_id: '',
    outlet_id: '',
    serial_number: '',
    status: 'available'
  });

  const fetchData = async () => {
    setLoading(true);
    try { 
      const res = await api.get('/retail/serials'); 
      setSerials(res.data); 
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
    setForm({ id: null, product_id: '', outlet_id: '', serial_number: '', status: 'available' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setForm({
      id: s.id,
      product_id: s.product_id,
      outlet_id: s.outlet_id || '',
      serial_number: s.serial_number,
      status: s.status
    });
    setShowModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await api.put(`/retail/serials/${form.id}`, form);
      } else {
        await api.post('/retail/serials', form);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menyimpan Serial Number');
    }
  };

  const deleteSerial = async (id) => {
    if (!window.confirm("Hapus Serial Number ini?")) return;
    try {
      await api.delete(`/retail/serials/${id}`);
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menghapus');
    }
  };

  const [search, setSearch] = useState('');
  
  const filtered = serials.filter(s => 
    s.product?.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.serial_number?.toLowerCase().includes(search.toLowerCase())
  );

  const p = usePagination(filtered, 15);

  return (
    <div className="retail-page-classic">
      {/* Page Title Handled by Navtop */}
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button className="btn btn-primary" onClick={openAdd} style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}>
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Serial</span>
          </button>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              type="text"
              placeholder="Cari produk atau serial..."
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
                <th className="retail-table-header">Serial Number / IMEI</th>
                <th className="retail-table-header">Status</th>
                <th className="text-right pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <RetailTableLoadingRow colSpan={5} /> : p.paginatedData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-slate-500">Belum ada data serial number.</td></tr>
              ) : p.paginatedData.map(s => (
                <tr key={s.id}>
                  <td className="pl-6">
                    <div className="retail-text-primary">{s.product?.name}</div>
                    <div className="text-[10px] retail-text-secondary">{s.product?.sku}</div>
                  </td>
                  <td><div className="text-sm retail-text-secondary">{s.outlet?.name || 'Pusat'}</div></td>
                  <td><div className="font-mono text-sm retail-text-primary">{s.serial_number}</div></td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                      s.status === 'sold' ? 'bg-amber-100 text-amber-700' :
                      s.status === 'defective' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-right pr-6 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(s)} className="btn btn-sm btn-ghost" title="Edit Data"><Edit size={15} /></button>
                    <button onClick={() => deleteSerial(s.id)} className="btn btn-sm btn-ghost retail-text-danger" title="Hapus Data"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <RetailPagination {...p} />}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={form.id ? "Edit Serial Number" : "Tambah Serial Baru"}>
          <form onSubmit={submitForm} className="flex flex-col gap-5">
            {!form.id && (
              <div className="form-group">
                <label className="form-label">Produk</label>
                <select className="form-input" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Cabang / Gudang</label>
              <select className="form-input" value={form.outlet_id} onChange={e => setForm({...form, outlet_id: e.target.value})}>
                <option value="">Pusat</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number / IMEI</label>
              <input type="text" className="form-input" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})} required>
                <option value="available">Tersedia (Available)</option>
                <option value="sold">Terjual (Sold)</option>
                <option value="defective">Rusak (Defective)</option>
                <option value="returned">Retur (Returned)</option>
              </select>
            </div>

            <div className="modal__actions">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Batal</button>
              <button type="submit" className="btn btn-primary">{form.id ? 'Simpan Perubahan' : 'Tambah Serial'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
