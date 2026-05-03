import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { api } from '../../../lib/api';
import './KulinerDashboard.css';

const CulinaryStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier', // cashier or chef
    phone: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // We will use the generic user management but filtered for this tenant in backend
      const res = await api.get('/kuliner/admin/staff');
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/kuliner/admin/staff/${editingStaff.id}`, form);
        alert('Data staff berhasil diperbarui');
      } else {
        await api.post('/kuliner/admin/staff', form);
        alert('Staff baru berhasil ditambahkan');
      }
      setShowModal(false);
      setEditingStaff(null);
      setForm({ name: '', email: '', password: '', role: 'cashier', phone: '' });
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data staff');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setForm({
      name: member.name,
      email: member.email,
      password: '', // Leave empty for security
      role: member.role || 'cashier',
      phone: member.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus staff ini?')) {
      try {
        await api.delete(`/kuliner/admin/staff/${id}`);
        fetchStaff();
      } catch (err) {
        alert('Gagal menghapus staff');
      }
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <div>
          <h1 className="kd-page-title">Kelola Staff Karyawan</h1>
          <p className="text-sm text-slate-500 mt-1">Atur akses kasir dan koki untuk operasional restoran Anda.</p>
        </div>
        <button className="kd-btn kd-btn-primary" onClick={() => {
          setEditingStaff(null);
          setForm({ name: '', email: '', password: '', role: 'cashier', phone: '' });
          setShowModal(true);
        }}>
          + Tambah Staff Baru
        </button>
      </div>

      <div className="kd-content">
        <div className="kd-panel">
          <div className="p-0 overflow-hidden">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>NAMA STAFF</th>
                  <th>EMAIL</th>
                  <th>ROLE / POSISI</th>
                  <th>NO. TELEPON</th>
                  <th style={{ textAlign: 'right' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10">
                      <div className="spinner" style={{ margin: '0 auto 10px' }} />
                      <span className="text-slate-400 text-xs">Memuat data staff...</span>
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 text-xs italic">
                      Belum ada staff terdaftar.
                    </td>
                  </tr>
                ) : (
                  staff.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{member.name}</span>
                        </div>
                      </td>
                      <td><span className="text-xs text-slate-500">{member.email}</span></td>
                      <td>
                        <span className={`badge ${member.role === 'chef' ? 'badge-violet' : 'badge-green'}`}>
                          {member.role === 'chef' ? '👨‍🍳 Koki / Dapur' : '💰 Kasir'}
                        </span>
                      </td>
                      <td><span className="text-xs text-slate-500">{member.phone || '-'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex justify-end gap-2">
                          <button className="kd-btn-icon" onClick={() => handleEdit(member)}>Edit</button>
                          <button className="kd-btn-icon text-red-500" onClick={() => handleDelete(member.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL STAFF */}
      {showModal && (
        <div className="kd-modal-overlay">
          <div className="kd-modal" style={{ maxWidth: 450 }}>
            <div className="kd-modal-header">
              <h2 className="text-lg font-bold text-slate-800">
                {editingStaff ? 'Edit Data Staff' : 'Tambah Staff Baru'}
              </h2>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="form-group mb-4">
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Nama Lengkap</label>
                <input 
                  type="text" className="form-input" required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Email Login</label>
                <input 
                  type="email" className="form-input" required
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="budi@restoran.com"
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Password {editingStaff && '(Kosongkan jika tidak ganti)'}</label>
                <input 
                  type="password" className="form-input" required={!editingStaff}
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 8 karakter"
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Posisi / Role</label>
                <select 
                  className="form-input" 
                  value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                >
                  <option value="cashier">💰 Kasir (Akses Transaksi)</option>
                  <option value="chef">👨‍🍳 Koki / Dapur (Akses Pesanan)</option>
                </select>
              </div>
              <div className="form-group mb-6">
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Nomor Telepon</label>
                <input 
                  type="text" className="form-input"
                  value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="08123xxx"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" className="kd-btn kd-btn-secondary flex-1" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary flex-1">Simpan Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryStaff;
