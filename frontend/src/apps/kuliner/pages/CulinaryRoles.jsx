import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { api } from '../../../lib/api';
import { Users, Plus, Edit2, Trash2, Shield } from 'lucide-react';

const CulinaryRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    permissions: []
  });

  const availablePermissions = [
    { id: 'orders',    name: 'Pesanan & Kasir',      icon: '📋' },
    { id: 'menu',      name: 'Menu & Produk',         icon: '🍔' },
    { id: 'reports',   name: 'Laporan & Transaksi',   icon: '📊' },
    { id: 'analytics', name: 'Analitik Bisnis',       icon: '📈' },
    { id: 'staff',     name: 'Manajemen Staff',        icon: '👥' },
    { id: 'settings',  name: 'Pengaturan Toko',       icon: '⚙️' },
  ];


  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kuliner/admin/roles');
      setRoles(res.data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await api.put(`/kuliner/admin/roles/${editingRole.id}`, form);
        alert('Role berhasil diperbarui');
      } else {
        await api.post('/kuliner/admin/roles', form);
        alert('Role baru berhasil ditambahkan');
      }
      setShowModal(false);
      setEditingRole(null);
      setForm({ name: '', permissions: [] });
      fetchRoles();
    } catch (err) {
      alert('Gagal menyimpan role');
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      permissions: role.permissions || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
      try {
        await api.delete(`/kuliner/admin/roles/${id}`);
        fetchRoles();
      } catch (err) {
        alert('Gagal menghapus role');
      }
    }
  };

  const togglePermission = (permId) => {
    setForm(prev => {
      const isExist = prev.permissions.includes(permId);
      if (isExist) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-topbar">
        <h1 className="kd-page-title">Kelola Role & Hak Akses</h1>
      </div>

      <div className="kd-content">
        <div className="kd-page-actions">
          <button 
            className="kd-btn kd-btn-primary flex items-center gap-2"
            onClick={() => {
              setEditingRole(null);
              setForm({ name: '', permissions: [] });
              setShowModal(true);
            }}
          >
            <Plus /> Tambah Role Baru
          </button>
        </div>
        <div className="kd-panel">
          <div className="kd-table-container">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>NAMA ROLE / POSISI</th>
                  <th>HAK AKSES</th>
                  <th className="text-right">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-10">Memuat data...</td></tr>
                ) : roles.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-10">Belum ada role terdaftar.</td></tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <Shield />
                          </div>
                          <span className="font-bold text-slate-700">{role.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.map(p => {
                            const detail = availablePermissions.find(ap => ap.id === p);
                            return (
                              <span key={p} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                {detail ? detail.name : p}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button className="kd-icon-btn" onClick={() => handleEdit(role)}><Edit2 /></button>
                          <button className="kd-icon-btn text-red-500" onClick={() => handleDelete(role.id)}><Trash2 /></button>
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

      {/* MODAL ROLE */}
      {showModal && (
        <div className="kd-modal-overlay active">
          <div className="kd-modal" style={{ maxWidth: 500 }}>
            <div className="kd-modal-header">
              <h2 className="text-lg font-bold text-slate-800">
                {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
              </h2>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="kd-modal-body">
                <div className="form-group mb-6">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Nama Role / Posisi</label>
                  <input 
                    type="text" className="form-input w-full" required
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Contoh: Supervisor, Manager, Waiter"
                  />
                </div>
                
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 block">Hak Akses</label>
                <div className="grid grid-cols-2 gap-3">
                  {availablePermissions.map(perm => (
                    <div 
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        form.permissions.includes(perm.id) 
                          ? 'bg-amber-50 border-amber-200 text-amber-700' 
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-xl">{perm.icon}</span>
                      <span className="text-xs font-bold">{perm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="kd-modal-footer">
                <button type="button" className="kd-btn kd-btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="kd-btn kd-btn-primary">Simpan Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </KulinerAdminLayout>
  );
};

export default CulinaryRoles;
