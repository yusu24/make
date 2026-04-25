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
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
           <h2 className="page-title">Database Pelanggan</h2>
           <p className="page-sub">Kelola profil dan data kontak pelanggan retail Anda.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingCustomer(null); setShowModal(true); }}>
           + Tambah pelanggan
        </button>
      </div>

      {/* CRM Statistics */}
      <div className="grid-2" style={{ marginBottom: 52 }}>
        <div className="card card-pad flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs font-800 text-slate-400 uppercase tracking-widest mb-1">Total Member</span>
              <span className="text-2xl font-800 text-slate-800">{customers.length} User</span>
           </div>
           <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
              <User size={24} />
           </div>
        </div>
        <div className="card card-pad flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs font-800 text-slate-400 uppercase tracking-widest mb-1">Database Health</span>
              <span className="text-2xl font-800 text-green-500">Active</span>
           </div>
           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <RefreshCw size={24} />
           </div>
        </div>
      </div>

      {/* Table Section (Unified Style) */}
      <div className="card table-wrap animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-1 h-5 bg-primary-500 rounded-full" />
             <h3 className="font-800 text-lg tracking-tight text-primary-500" style={{ fontFamily: 'var(--font-heading)' }}>Direktori Pelanggan</h3>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="airy-search-wrapper" style={{ width: 280 }}>
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
              <th className="pl-6">Informasi Profil</th>
              <th>Akses Kontak</th>
              <th>Alamat Terdaftar</th>
              <th className="pr-6 text-right">Aksi</th>
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
                         <div className="w-1 h-8 bg-slate-200 rounded-full" />
                         <div>
                            <p className="text-base mb-0.5 text-slate-800">{c.name}</p>
                            <code className="text-[10px] text-slate-400 uppercase">#{c.id.toString().padStart(4, '0')}</code>
                         </div>
                      </div>
                  </td>
                  <td>
                     <div className="flex flex-col">
                        <span className="text-slate-700">{c.contact || '-'}</span>
                        <span className="text-[11px] text-slate-400">{c.email || 'No email registered'}</span>
                     </div>
                  </td>
                  <td>
                     <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{c.address || 'Alamat belum diinput'}</span>
                  </td>
                  <td className="pr-6 text-right">
                     <div className="flex justify-end gap-2">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost text-red-500" onClick={() => alert('Delete logic placeholder')}><Trash2 size={14} /></button>
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
