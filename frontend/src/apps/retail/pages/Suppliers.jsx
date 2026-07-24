import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import { Truck, Phone, MapPin, Edit3, Trash2, ChevronRight, PackageCheck, Plus, Building2, RefreshCw } from 'lucide-react';

import Modal from '../../../components/Modal';
import RetailLoading from '../components/RetailLoading';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState('');

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/retail/suppliers');
      setSuppliers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      contact: fd.get('contact'),
      address: fd.get('address')
    };
    try {
      if (editingSupplier) {
        await api.put(`/retail/suppliers/${editingSupplier.id}`, data);
      } else {
        await api.post('/retail/suppliers', data);
      }
      fetchSuppliers();
      setShowModal(false);
      setEditingSupplier(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan data supplier');
    }
  };

  const openEdit = (s) => {
    setEditingSupplier(s);
    setShowModal(true);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact && s.contact.toLowerCase().includes(search.toLowerCase())) ||
    (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
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
  } = usePagination(filteredSuppliers);

  if (loading) return <RetailLoading text="Memuat data mitra supplier..." />;

  

  return (
    <div className="animate-fade-in retail-dashboard-spacing">


      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }} onClick={() => { setEditingSupplier(null); setShowModal(true); }}>
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Registrasi Supplier</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchSuppliers} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
               <th className="pl-6 retail-table-header">Identitas Supplier</th>
               <th className="retail-table-header">Kontak PIC</th>
               <th className="retail-table-header">Alamat Operasional</th>
               <th className="text-right pr-6 retail-table-header">Kontrol</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                 <td colSpan="4" className="text-center" style={{ padding: 60 }}>
                    <div className="flex flex-col items-center gap-4 text-muted">
                       <Truck size={40} className="opacity-20" />
                       <p className="text-sm">Belum ada data supplier.</p>
                    </div>
                 </td>
              </tr>
            ) : (
              paginatedData.map(s => (
                <tr key={s.id}>
                  <td className="pl-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl retail-bg-primary-subtle flex items-center justify-center retail-text-primary retail-border">
                           <Building2 size={18} />
                        </div>
                        <div>
                           <div className="retail-text-primary">{s.name}</div>
                           <div className="text-[10px] retail-text-secondary uppercase tracking-widest">{s.id.toString().padStart(4, '0')}</div>
                        </div>
                     </div>
                  </td>
                  <td>
                     <div className="flex items-center gap-2 text-sm retail-text-primary">
                        <Phone size={13} className="retail-text-secondary" />
                        {s.contact || '-'}
                     </div>
                  </td>
                  <td>
                     <div className="flex items-center gap-2 text-sm retail-text-secondary max-w-xs truncate">
                        <MapPin size={13} className="retail-text-secondary shrink-0" />
                        {s.address || '-'}
                     </div>
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(s)} title="Edit Data">
                         <Edit3 size={15} />
                      </button>

                      <button className="btn btn-sm btn-ghost retail-text-danger" onClick={async () => { if(confirm('Hapus supplier ini?')) { await api.delete(`/retail/suppliers/${s.id}`); fetchSuppliers(); } }} title="Hapus Data">
                         <Trash2 size={15} />
                      </button>
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
        onClose={() => { setShowModal(false); setEditingSupplier(null); }}
        title={editingSupplier ? 'Edit Data Supplier' : 'Registrasi Partner Supplier'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Nama Badan Usaha / Supplier</label>
            <input name="name" className="form-input" defaultValue={editingSupplier?.name} required placeholder="Contoh: PT. Sumber Makmur" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nomor Kontak / PIC (WhatsApp)</label>
            <input name="contact" className="form-input" defaultValue={editingSupplier?.contact} placeholder="0812xxxx" />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Kantor / Gudang</label>
            <textarea name="address" className="form-input min-h-[100px]" defaultValue={editingSupplier?.address} placeholder="Jl. Industri No. 45..."></textarea>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingSupplier(null); }}>Batal</button>
            <button type="submit" className="btn btn-primary">
               {editingSupplier ? 'Simpan Perubahan' : 'Registrasi Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      <style>{`
         .min-h-\\[100px\\] { min-height: 100px; }
      `}</style>
    </div>
  );
}
