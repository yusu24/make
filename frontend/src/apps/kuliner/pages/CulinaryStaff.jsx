import React, { useState, useEffect } from 'react';
import { KeyRound, Edit3, Trash2 } from 'lucide-react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './KulinerDashboard.css';

const CulinaryStaff = () => {
  const { impersonateUser } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [impersonating, setImpersonating] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier', // core role
    kuliner_role_id: '', // dynamic role
    phone: ''
  });

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kuliner/admin/staff');
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/kuliner/admin/roles');
      setRoles(res.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
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
      setForm({ name: '', email: '', password: '', role: 'cashier', kuliner_role_id: '', phone: '' });
      fetchStaff();
    } catch (err) {
      let errorMessage = 'Gagal menyimpan data staff';
      if (err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        const errorMsg = err.response.data.errors[firstErrorKey][0];
        
        // Translate common validation messages
        if (errorMsg.includes('has already been taken')) {
          errorMessage = `Email tersebut sudah terdaftar. Silakan gunakan email lain.`;
        } else if (errorMsg.includes('at least 8 characters')) {
          errorMessage = 'Password minimal harus 8 karakter.';
        } else {
          errorMessage = errorMsg;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      alert(errorMessage);
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setForm({
      name: member.name,
      email: member.email,
      password: '', 
      role: member.role || 'cashier',
      kuliner_role_id: member.kuliner_role_id || '',
      phone: member.phone || ''
    });
    setShowModal(true);
  };

  const handleImpersonate = async (id) => {
    setImpersonating(id);
    try {
      const redirect = await impersonateUser(id);
      navigate(redirect);
    } catch (err) {
      alert('Gagal impersonate: ' + (err.response?.data?.message || err.message));
    } finally {
      setImpersonating(null);
    }
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
        <h1 className="kd-page-title">Kelola Staff Karyawan</h1>
      </div>

      <div className="kd-content">
        <div className="kd-page-actions">
          <a href="/kuliner/admin/roles" className="kd-btn kd-btn-secondary flex items-center gap-2">
            ⚙️ Atur Role & Izin
          </a>
          <button className="kd-btn kd-btn-primary" onClick={() => {
            setEditingStaff(null);
            setForm({ name: '', email: '', password: '', role: 'cashier', kuliner_role_id: '', phone: '' });
            setShowModal(true);
          }}>
            + Tambah Staff Baru
          </button>
        </div>
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
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${member.role === 'chef' ? 'badge-violet' : 'badge-green'}`}>
                            {member.role === 'chef' ? '👨‍🍳 Koki / Dapur' : '💰 Kasir'}
                          </span>
                          {member.kuliner_role && (
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 mt-1">
                              {member.kuliner_role.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><span className="text-xs text-slate-500">{member.phone || '-'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex justify-end gap-2">
                          <button
                            className="kd-icon-btn"
                            style={{ color: '#b48c36', borderColor: '#b48c36' }}
                            onClick={() => handleImpersonate(member.id)}
                            disabled={impersonating === member.id}
                            title="Login sebagai Staff ini"
                          >
                            {impersonating === member.id ? '⏳' : <KeyRound size={16} />}
                          </button>
                          <button className="kd-icon-btn" title="Edit" onClick={() => handleEdit(member)}><Edit3 size={16} /></button>
                          <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(member.id)}><Trash2 size={16} /></button>
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
        <div className="kd-modal-overlay active">
          <div className="kd-modal" style={{ maxWidth: 450 }}>
            <div className="kd-modal-header">
              <h2 className="text-lg font-bold text-slate-800">
                {editingStaff ? 'Edit Data Staff' : 'Tambah Staff Baru'}
              </h2>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="kd-modal-body">
                <div className="form-group mb-5">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Nama Lengkap</label>
                  <input 
                    type="text" className="form-input w-full" required
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div className="form-group mb-5">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Email Login</label>
                  <input 
                    type="email" className="form-input w-full" required
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="budi@restoran.com"
                  />
                </div>
                <div className="form-group mb-5">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Password {editingStaff && '(Kosongkan jika tidak ganti)'}</label>
                  <input 
                    type="password" className="form-input w-full" required={!editingStaff}
                    value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    placeholder="Min. 8 karakter"
                  />
                </div>
                <div className="form-group mb-5">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Akses Sistem (Core Role)</label>
                  <select 
                    className="form-input w-full" 
                    value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  >
                    <option value="cashier">💰 Kasir (Akses Transaksi)</option>
                    <option value="chef">👨‍🍳 Koki / Dapur (Akses Pesanan)</option>
                    <option value="staff">👤 Staff Biasa</option>
                  </select>
                </div>
                <div className="form-group mb-5">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Posisi / Jabatan (Custom)</label>
                  <select 
                    className="form-input w-full" 
                    value={form.kuliner_role_id} onChange={e => setForm({...form, kuliner_role_id: e.target.value})}
                  >
                    <option value="">-- Pilih Posisi --</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1 italic">* Kelola pilihan ini di menu "Atur Role & Izin"</p>
                </div>
                <div className="form-group">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Nomor Telepon</label>
                  <input 
                    type="text" className="form-input w-full"
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="08123xxx"
                  />
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary w-full sm:w-auto" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary w-full sm:w-auto">Simpan Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryStaff;
