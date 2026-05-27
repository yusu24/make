import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { 
  User, RefreshCw, 
  Edit3, Trash2, RotateCcw
} from 'lucide-react';
import Modal from '../../../components/Modal';
import '../retail.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/customers');
      setCustomers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      contact: fd.get('contact'),
      email: fd.get('email'),
      address: fd.get('address')
    };
    try {
      if (editingCustomer) {
        await api.put(`/retail/customers/${editingCustomer.id}`, data);
      } else {
        await api.post('/retail/customers', data);
      }
      fetchCustomers();
      setShowModal(false);
      setEditingCustomer(null);
    } catch (e) {}
  };

  const openEdit = (c) => {
    setEditingCustomer(c);
    setShowModal(true);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.contact && c.contact.includes(search))
  );

  return (
    <div className="animate-fade-in retail-dashboard-spacing">
      {/* Page Header (Synced with Finance) */}


      {/* CRM Statistics */}
      <div className="grid-2" style={{ marginBottom: 52 }}>
        <div className="card card-pad flex items-center justify-between">
           <div className="flex flex-col">
              <span className="retail-label mb-1">Total Member</span>
              <span className="retail-title">{customers.length} User</span>
           </div>
           <div className="w-12 h-12 retail-bg-primary-subtle retail-text-primary rounded-2xl flex items-center justify-center">
              <User size={24} />
           </div>
        </div>
        <div className="card card-pad flex items-center justify-between">
           <div className="flex flex-col">
              <span className="retail-label mb-1">Database Health</span>
              <span className="retail-title retail-text-success">Active</span>
           </div>
           <div className="w-12 h-12 retail-bg-success-subtle retail-text-success rounded-2xl flex items-center justify-center">
              <RefreshCw size={24} />
           </div>
        </div>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex justify-end">
          <div className="flex items-center gap-3">
             <button className="btn btn-primary h-[42px] px-6 whitespace-nowrap" onClick={() => { setEditingCustomer(null); setShowModal(true); }}>
                + Tambah pelanggan
             </button>
             <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
                <input 
                  placeholder="Cari Pelanggan..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <button 
                onClick={() => { setSearch(''); fetchCustomers(); }} 
                className="btn-reset-sync"
                style={{ width: 42, height: 42 }}
                title="Segarkan Data"
             >
                <RotateCcw size={18} strokeWidth={3} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header">Informasi Profil</th>
              <th className="retail-table-header">Akses Kontak</th>
              <th className="retail-table-header">Alamat Terdaftar</th>
              <th className="pr-6 text-right retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-20 text-center font-800 text-slate-400">Memuat database...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                 <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                    Belum ada data pelanggan terdaftar.
                 </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td className="pl-6">
                      <div className="flex items-center gap-4">
                         <div className="w-1 h-8 retail-bg-primary-subtle rounded-full" />
                         <div>
                            <p className="text-base mb-0.5 retail-text-primary">{c.name}</p>
                            <code className="text-[10px] retail-text-secondary uppercase">#{c.id.toString().padStart(4, '0')}</code>
                         </div>
                      </div>
                  </td>
                  <td>
                     <div className="flex flex-col">
                        <span className="retail-text-primary">{c.contact || '-'}</span>
                        <span className="text-[11px] retail-text-secondary">{c.email || 'No email registered'}</span>
                     </div>
                  </td>
                  <td>
                     <span className="text-xs retail-text-secondary line-clamp-1 max-w-[200px]">{c.address || 'Alamat belum diinput'}</span>
                  </td>
                  <td className="pr-6 text-right">
                     <div className="flex justify-end gap-2">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => alert('Delete logic placeholder')}><Trash2 size={14} /></button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingCustomer(null); }} title={editingCustomer ? 'Edit Profil Pelanggan' : 'Daftarkan Pelanggan Baru'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
           <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input name="name" className="form-input" placeholder="Masukkan nama pelanggan" defaultValue={editingCustomer?.name} required />
           </div>
           <div className="grid-2">
              <div className="form-group">
                 <label className="form-label">Nomor WhatsApp/HP</label>
                 <input name="contact" className="form-input" placeholder="08xxxx" defaultValue={editingCustomer?.contact} required />
              </div>
              <div className="form-group">
                 <label className="form-label">Email (Opsional)</label>
                 <input name="email" type="email" className="form-input" placeholder="user@example.com" defaultValue={editingCustomer?.email} />
              </div>
           </div>
           <div className="form-group">
              <label className="form-label">Alamat Lengkap</label>
              <textarea name="address" className="form-input min-h-[100px]" placeholder="Jl. Contoh No. 123..." defaultValue={editingCustomer?.address}></textarea>
           </div>
           <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingCustomer(null); }}>Batal</button>
              <button type="submit" className="btn btn-primary">{editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Member'}</button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
