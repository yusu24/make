import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2, Store, MapPin, Phone, Star } from 'lucide-react';

export default function Outlets() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/outlets');
      setOutlets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOutlets(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('name'),
      address: fd.get('address'),
      phone: fd.get('phone'),
      is_primary: fd.get('is_primary') === 'on' ? 1 : 0
    };

    if (!payload.name) {
      setErrors({ name: 'Nama outlet wajib diisi' });
      return;
    }

    try {
      if (editingOutlet) {
        await api.put(`/retail/outlets/${editingOutlet.id}`, payload);
      } else {
        await api.post('/retail/outlets', payload);
      }
      fetchOutlets();
      setShowModal(false);
      setEditingOutlet(null);
    } catch (e) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else {
        alert(e.response?.data?.message || 'Gagal menyimpan outlet');
      }
    }
  };

  const openEdit = (outlet) => {
    setEditingOutlet(outlet);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus outlet ini? Peringatan: Data yang berhubungan dengan outlet ini (seperti stok dan riwayat transaksi cabang) dapat terhapus.')) {
      try {
        await api.delete(`/retail/outlets/${id}`);
        fetchOutlets();
      } catch (e) {
        alert(e.response?.data?.message || 'Gagal menghapus outlet. Pastikan tidak ada transaksi terkait.');
      }
    }
  };

  const filteredOutlets = outlets.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.address && o.address.toLowerCase().includes(search.toLowerCase()))
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
  } = usePagination(filteredOutlets);

  return (
    <div className="retail-page-classic">
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-between items-center gap-3 flex-wrap">
          <div className="airy-search-wrapper" style={{ width: 320, margin: 0 }}>
            <input
              placeholder="Cari cabang/outlet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            type="button" 
            className="btn btn-primary h-[42px] px-6 whitespace-nowrap flex items-center gap-2"
            onClick={() => {
              setEditingOutlet(null);
              setErrors({});
              setShowModal(true);
            }}
          >
            <Store size={16} />
            Tambah Cabang Baru
          </button>
        </div>

        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header" style={{ width: 250 }}>Nama Cabang</th>
                <th className="retail-table-header">Informasi Cabang</th>
                <th className="retail-table-header" style={{ width: 120 }}>Status</th>
                <th className="text-right pr-6 retail-table-header" style={{ width: 100 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <RetailTableLoadingRow colSpan={4} text="Memuat daftar cabang..." />
              ) : filteredOutlets.length === 0 ? (
                 <tr>
                   <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                     Belum ada data cabang / outlet.
                   </td>
                 </tr>
              ) : (
                paginatedData.map(o => (
                  <tr key={o.id}>
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                           <Store size={20} />
                        </div>
                        <div>
                           <p className="font-semibold text-slate-800 text-[14px]">{o.name}</p>
                           {o.is_primary ? (
                             <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-1 w-max">
                               <Star size={10} fill="currentColor" /> Pusat / Utama
                             </span>
                           ) : (
                             <span className="text-[11px] text-slate-500 mt-1 block">Cabang Pembantu</span>
                           )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 text-[13px]">
                        {o.address ? (
                          <div className="flex gap-2 items-start text-slate-600">
                             <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                             <span>{o.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Alamat belum diatur</span>
                        )}
                        {o.phone && (
                          <div className="flex gap-2 items-center text-slate-600">
                             <Phone size={14} className="text-slate-400 shrink-0" />
                             <span>{o.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Aktif</span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="pr-6">
                      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(o)}><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(o.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
        title={editingOutlet ? "Edit Data Cabang" : "Tambah Cabang Baru"}
      >
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Outlet/Cabang <span className="text-red-500">*</span></label>
            <input name="name" className={`form-input ${errors.name ? 'border-red-500 bg-red-50' : ''}`} defaultValue={editingOutlet?.name} placeholder="Contoh: Cabang Sudirman" />
            {errors.name && <span className="text-[10px] text-red-500 font-700 mt-1 uppercase tracking-tight">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Alamat Lengkap</label>
            <textarea name="address" className="form-input" rows="3" defaultValue={editingOutlet?.address} placeholder="Jalan, Nomor, Kota..."></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Nomor Telepon</label>
            <input name="phone" type="tel" className="form-input" defaultValue={editingOutlet?.phone} placeholder="0812..." />
          </div>
          <div className="form-group mt-2">
             <label className="flex items-center gap-3 cursor-pointer p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100/70 transition-colors">
                <input 
                   type="checkbox" 
                   name="is_primary" 
                   defaultChecked={editingOutlet?.is_primary}
                   className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
                />
                <div>
                   <p className="text-sm font-bold text-amber-800">Jadikan Outlet Utama (Pusat)</p>
                   <p className="text-xs text-amber-700/70 leading-relaxed mt-0.5">Semua sinkronisasi produk dan harga default akan berpatokan pada outlet pusat.</p>
                </div>
             </label>
          </div>
          <div className="modal__actions mt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingOutlet ? 'Simpan Perubahan' : 'Buat Cabang'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
