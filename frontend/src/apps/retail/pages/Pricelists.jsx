import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Edit3, Trash2, Plus, RefreshCw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function Pricelists() {
  const [pricelists, setPricelists] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('wholesale');
  const [items, setItems] = useState([{ product_id: '', price: 0, min_qty: 1 }]);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plRes, pRes] = await Promise.all([api.get('/retail/pricelists'), api.get('/retail/products')]);
      setPricelists(plRes.data);
      setProducts(pRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (pl) => {
    setEditing(pl);
    setName(pl.name);
    setType(pl.type);
    setItems(pl.items?.length ? pl.items.map(i => ({ product_id: i.product_id, price: i.price, min_qty: i.min_qty })) : [{ product_id: '', price: 0, min_qty: 1 }]);
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null); setName(''); setType('wholesale');
    setItems([{ product_id: '', price: 0, min_qty: 1 }]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, type, items };
    try {
      if (editing) await api.put(`/retail/pricelists/${editing.id}`, payload);
      else await api.post('/retail/pricelists', payload);
      setShowModal(false); fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Gagal menyimpan pricelist'); }
  };

  const filteredPricelists = pricelists.filter(pl =>
    pl.name.toLowerCase().includes(search.toLowerCase()) ||
    pl.type.toLowerCase().includes(search.toLowerCase())
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
  } = usePagination(filteredPricelists);

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={openNew}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Pricelist Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari pricelist..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Nama</th>
              <th className="retail-table-header">Tipe</th>
              <th className="text-center retail-table-header">Jumlah Produk</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={4} />
            ) : filteredPricelists.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada pricelist.</td></tr>
            ) : (
              paginatedData.map(pl => (
                <tr key={pl.id}>
                  <td className="pl-6 retail-text-primary">{pl.name}</td>
                  <td className="retail-text-secondary">{pl.type === 'wholesale' ? 'Grosir' : pl.type === 'member' ? 'Member' : 'Retail'}</td>
                  <td className="text-center">{pl.items?.length || 0}</td>
                  <td className="pr-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(pl)}><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { if (confirm('Hapus pricelist ini?')) { await api.delete(`/retail/pricelists/${pl.id}`); fetchData(); } }}><Trash2 size={14} /></button>
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

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editing ? 'Edit Pricelist' : 'Pricelist Baru'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Nama Pricelist</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="cth. Harga Grosir Toko" />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe</label>
            <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
              <option value="wholesale">Grosir</option>
              <option value="member">Member</option>
              <option value="retail">Retail</option>
            </select>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <label className="form-label" style={{ marginBottom: 0 }}>Daftar Produk</label>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{items.length} Produk</span>
            </div>

            <div className="grid grid-cols-12 gap-3 mb-2 px-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:grid">
              <span className="col-span-5">Nama Barang</span>
              <span className="col-span-3">Harga Khusus</span>
              <span className="col-span-3">Min. Qty</span>
              <span className="col-span-1 text-center">Aksi</span>
            </div>

            <div className="flex flex-col gap-3 md:gap-2">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end md:items-center bg-slate-50/50 md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-200/60 md:border-0">
                  <div className="col-span-1 md:col-span-5 flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Nama Barang</label>
                    <select className="form-input bg-white" value={item.product_id} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, product_id: e.target.value } : it))} required>
                      <option value="" disabled>Pilih Produk...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Harga Khusus</label>
                    <input type="number" className="form-input bg-white" placeholder="Rp 0" value={item.price} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, price: Number(e.target.value) } : it))} required />
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider md:hidden">Min. Qty</label>
                    <input type="number" className="form-input bg-white" placeholder="1" value={item.min_qty} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, min_qty: Number(e.target.value) } : it))} />
                  </div>
                  <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center">
                    <button 
                      type="button" 
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-150 border border-slate-200 md:border-0 bg-white md:bg-transparent" 
                      onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                      title="Hapus Baris"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              className="w-full mt-3 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/10 flex items-center justify-center gap-2 text-xs font-semibold transition-all duration-200" 
              onClick={() => setItems([...items, { product_id: '', price: 0, min_qty: 1 }])}
            >
              <Plus size={16} /> Tambah Produk
            </button>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
