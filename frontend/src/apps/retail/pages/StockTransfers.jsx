import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Plus, ArrowRight, Eye, Check, X, RefreshCw } from 'lucide-react';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';

export default function StockTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);

  // Form State
  const [fromOutlet, setFromOutlet] = useState('');
  const [toOutlet, setToOutlet] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);

  // Detail Modal State
  const [detail, setDetail] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { 
      const res = await api.get('/retail/stock-transfers'); 
      setTransfers(res.data); 
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

  const addItem = () => {
    setItems([...items, { product_id: '', qty: 1, unit: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    if (fromOutlet === toOutlet) {
      alert("Gudang Asal dan Gudang Tujuan tidak boleh sama.");
      return;
    }
    try {
      const payload = {
        from_outlet_id: fromOutlet,
        to_outlet_id: toOutlet,
        note,
        items
      };
      await api.post('/retail/stock-transfers', payload);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal menyimpan transfer stok');
    }
  };

  const resetForm = () => {
    setFromOutlet('');
    setToOutlet('');
    setNote('');
    setItems([]);
  };

  const confirmTransfer = async (id) => {
    if (!window.confirm("Konfirmasi penerimaan stok? Stok akan ditambahkan ke Gudang Tujuan.")) return;
    try {
      await api.post(`/retail/stock-transfers/${id}/confirm`);
      fetchData();
      if (detail && detail.id === id) {
        openDetail(id);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal mengonfirmasi');
    }
  };

  const cancelTransfer = async (id) => {
    if (!window.confirm("Batalkan transfer ini? Stok akan dikembalikan ke Gudang Asal.")) return;
    try {
      await api.post(`/retail/stock-transfers/${id}/cancel`);
      fetchData();
      if (detail && detail.id === id) {
        openDetail(id);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Gagal membatalkan');
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await api.get(`/retail/stock-transfers/${id}`);
      setDetail(res.data);
    } catch {
      alert('Gagal memuat detail');
    }
  };

  const p = usePagination(transfers, 15);

  return (
    <div className="retail-page-classic">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}>
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Buat Transfer</span>
          </button>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            {/* Search can be added later if needed */}
            <input type="text" placeholder="Cari..." disabled />
          </div>
          <button onClick={fetchData} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Tanggal</th>
                <th className="retail-table-header">No. Referensi</th>
                <th className="retail-table-header">Asal</th>
                <th className="retail-table-header">Tujuan</th>
                <th className="retail-table-header">Status</th>
                <th className="text-right pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <RetailTableLoadingRow colSpan={6} /> : p.paginatedData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-slate-500">Belum ada data transfer stok.</td></tr>
              ) : p.paginatedData.map(tr => (
                <tr key={tr.id}>
                  <td className="pl-6"><div className="text-sm retail-text-secondary">{new Date(tr.created_at).toLocaleDateString('id-ID')}</div></td>
                  <td><div className="font-mono text-sm retail-text-primary">{tr.reference_no}</div></td>
                  <td><div className="text-sm retail-text-primary">{tr.from_outlet?.name || 'Pusat'}</div></td>
                  <td><div className="text-sm retail-text-primary">{tr.to_outlet?.name || 'Pusat'}</div></td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tr.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      tr.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {tr.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-right pr-6 flex items-center justify-end gap-2">
                    <button onClick={() => openDetail(tr.id)} className="btn btn-sm btn-ghost" title="Detail"><Eye size={15} /></button>
                    {tr.status === 'pending' && (
                      <>
                        <button onClick={() => confirmTransfer(tr.id)} className="btn btn-sm btn-ghost text-emerald-600" title="Konfirmasi Diterima"><Check size={15} /></button>
                        <button onClick={() => cancelTransfer(tr.id)} className="btn btn-sm btn-ghost retail-text-danger" title="Batalkan"><X size={15} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && <RetailPagination {...p} />}
      </div>

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Pengajuan Transfer Stok">
          <form onSubmit={submitTransfer} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Gudang Asal</label>
                <select className="form-input" value={fromOutlet} onChange={e => setFromOutlet(e.target.value)} required>
                  <option value="">-- Pilih --</option>
                  {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Gudang Tujuan</label>
                <select className="form-input" value={toOutlet} onChange={e => setToOutlet(e.target.value)} required>
                  <option value="">-- Pilih --</option>
                  {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Catatan</label>
              <input type="text" className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Contoh: Permintaan stok untuk event bazar" />
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-2">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <span className="font-medium text-slate-700 text-sm">Barang yang Ditransfer</span>
                <button type="button" onClick={addItem} className="text-blue-600 text-xs flex items-center hover:bg-blue-50 px-2 py-1 rounded">
                  <Plus size={14} className="mr-1" /> Tambah Barang
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select className="form-input flex-1" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                      <option value="">-- Pilih Produk --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" step="0.01" className="form-input w-24" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} required />
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
                  </div>
                ))}
                {items.length === 0 && <div className="text-center text-sm text-slate-500 py-4">Belum ada barang dipilih.</div>}
              </div>
            </div>

            <div className="modal__actions">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Batal</button>
              <button type="submit" className="btn btn-primary" disabled={items.length === 0 || !fromOutlet || !toOutlet}>Ajukan Transfer</button>
            </div>
          </form>
        </Modal>
      )}

      {detail && (
        <Modal title={`Detail Transfer Stok - ${detail.reference_no}`} onClose={() => setDetail(null)} maxWidth="max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-slate-500">Gudang Asal</p>
                <p className="font-medium text-slate-800">{detail.from_outlet?.name || 'Pusat'}</p>
              </div>
              <div>
                <p className="text-slate-500">Gudang Tujuan</p>
                <p className="font-medium text-slate-800">{detail.to_outlet?.name || 'Pusat'}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  detail.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  detail.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {detail.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-slate-500">Dibuat Oleh</p>
                <p className="font-medium text-slate-800">{detail.user?.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-slate-700">Daftar Barang</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-medium">SKU</th>
                      <th className="px-4 py-2 font-medium">Nama Barang</th>
                      <th className="px-4 py-2 font-medium text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.items?.map(it => (
                      <tr key={it.id}>
                        <td className="px-4 py-2">{it.product?.sku}</td>
                        <td className="px-4 py-2">{it.product?.name}</td>
                        <td className="px-4 py-2 text-right font-medium">{it.quantity} {it.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {detail.status === 'pending' && (
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => cancelTransfer(detail.id)} className="btn-secondary-classic text-red-600 border-red-200 hover:bg-red-50">Batalkan</button>
                <button onClick={() => confirmTransfer(detail.id)} className="btn-primary-classic">Konfirmasi Penerimaan</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
