import React, { useState, useEffect } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { api } from '../../../lib/api';
import { Users, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import ClientPagination from '../components/ClientPagination';
import { useTranslation } from '../../../contexts/I18nContext';

const CulinaryRoles = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    permissions: []
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(roles.length / itemsPerPage);
  const currentRoles = roles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const availablePermissions = [
    { id: 'orders',      name: 'Pesanan & Kasir',        icon: '📋' },
    { id: 'menu',        name: 'Menu & Produk',          icon: '🍔' },
    { id: 'ingredients', name: 'Bahan Baku',              icon: '🥬' },
    { id: 'recipes',     name: 'Resep Menu',              icon: '📖' },
    { id: 'modifiers',   name: 'Modifier',                icon: '🧩' },
    { id: 'addons',      name: 'Add-on',                  icon: '➕' },
    { id: 'bundles',     name: 'Paket Bundling',          icon: '🎁' },
    { id: 'shift',       name: 'Buka/Tutup Shift Kasir',  icon: '💰' },
    { id: 'reports',     name: 'Laporan & Transaksi',     icon: '📊' },
    { id: 'analytics',   name: 'Analitik Bisnis',        icon: '📈' },
    { id: 'staff',       name: 'Manajemen Staff',        icon: '👥' },
    { id: 'settings',    name: 'Pengaturan Toko',        icon: '⚙️' },
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
    
    // Convert old flat permissions to granular if needed
    let perms = role.permissions || [];
    const normalizedPerms = [];
    perms.forEach(p => {
      if (!p.includes('.')) {
        // It's an old flat permission, give them all CRUD for it to avoid breaking existing access
        normalizedPerms.push(`${p}.view`, `${p}.create`, `${p}.edit`, `${p}.delete`);
      } else {
        normalizedPerms.push(p);
      }
    });

    setForm({
      name: role.name,
      permissions: normalizedPerms
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

  const togglePermission = (moduleId, action = null) => {
    setForm(prev => {
      let newPerms = [...prev.permissions];
      
      if (!action) {
        // Toggle ALL actions for this module
        const allActions = ['view', 'create', 'edit', 'delete'].map(a => `${moduleId}.${a}`);
        const hasAll = allActions.every(p => newPerms.includes(p));
        
        if (hasAll) {
          // Remove all
          newPerms = newPerms.filter(p => !p.startsWith(`${moduleId}.`));
        } else {
          // Add all
          allActions.forEach(p => {
            if (!newPerms.includes(p)) newPerms.push(p);
          });
        }
      } else {
        // Toggle specific action
        const permId = `${moduleId}.${action}`;
        if (newPerms.includes(permId)) {
          newPerms = newPerms.filter(p => p !== permId);
        } else {
          newPerms.push(permId);
        }
      }
      
      return { ...prev, permissions: newPerms };
    });
  };

  const renderPermissionsList = (permissions) => {
    if (!permissions || permissions.length === 0) return null;
    
    // Group by module
    const grouped = {};
    permissions.forEach(p => {
      if (!p.includes('.')) {
        // Flat legacy permission, treat as all
        if (!grouped[p]) grouped[p] = [];
        grouped[p].push('all');
      } else {
        const parts = p.split('.');
        const mod = parts[0];
        const act = parts[1];
        if (!grouped[mod]) grouped[mod] = [];
        grouped[mod].push(act);
      }
    });

    return Object.keys(grouped).map(mod => {
      const detail = availablePermissions.find(ap => ap.id === mod);
      const modName = detail ? detail.name : mod;
      
      // If it's old flat permission, wildcard, or has all 4 actions
      if (grouped[mod].includes('all') || grouped[mod].includes('*') || grouped[mod].length === 4) {
        return (
          <span key={mod} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium mb-1 mr-1 inline-block">
            {modName} (Semua)
          </span>
        );
      }

      // Specific actions
      const actionsTrans = grouped[mod].map(a => {
        if (a === 'view') return 'Lihat';
        if (a === 'create') return 'Tambah';
        if (a === 'edit') return 'Ubah';
        if (a === 'delete') return 'Hapus';
        return a;
      }).join(', ');

      return (
        <span key={mod} className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-full mb-1 mr-1 inline-block">
          {modName}: <span className="opacity-70">{actionsTrans}</span>
        </span>
      );
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
                  <tr><td colSpan="3" className="text-center py-10">{t('kulinerCommon.loadingData') || 'Memuat data...'}</td></tr>
                ) : roles.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-10">{t('kulinerCommon.emptyData') || 'Belum ada role terdaftar.'}</td></tr>
                ) : (
                  currentRoles.map((role) => (
                    <tr key={role.id}>
                      <td style={{ verticalAlign: 'top', paddingTop: '16px' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <Shield />
                          </div>
                          <span style={{ color: '#1e293b', fontWeight: 600 }}>{role.name}</span>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'top', paddingTop: '16px' }}>
                        <div className="flex flex-wrap">
                          {renderPermissionsList(role.permissions)}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'top', paddingTop: '16px' }}>
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
          <ClientPagination setItemsPerPage={setItemsPerPage} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={roles.length}
          />
        </div>
      </div>

      {/* MODAL ROLE */}
      {showModal && (
        <div className="kd-modal-overlay active">
          <div className="kd-modal" style={{ maxWidth: 650, width: '90%' }}>
            <div className="kd-modal-header">
              <h2 className="text-lg font-bold text-slate-800">
                {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
              </h2>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="kd-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group mb-6">
                  <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">Nama Role / Posisi</label>
                  <input 
                    type="text" className="form-input w-full" required
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Contoh: Supervisor, Manager, Waiter"
                  />
                </div>
                
                <label className="form-label text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 block">Hak Akses Detail (Granular)</label>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Modul Aplikasi</th>
                        <th className="py-2.5 px-2 text-center font-semibold border-l border-slate-200" title="Pilih Semua Aksi">Semua</th>
                        <th className="py-2.5 px-2 text-center font-semibold border-l border-slate-200 text-blue-600">Lihat (View)</th>
                        <th className="py-2.5 px-2 text-center font-semibold text-emerald-600">Tambah (Create)</th>
                        <th className="py-2.5 px-2 text-center font-semibold text-amber-600">Ubah (Edit)</th>
                        <th className="py-2.5 px-2 text-center font-semibold text-red-600">Hapus (Delete)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {availablePermissions.map(perm => {
                        const allActions = ['view', 'create', 'edit', 'delete'].map(a => `${perm.id}.${a}`);
                        const isAllSelected = allActions.every(p => form.permissions.includes(p));
                        
                        return (
                          <tr key={perm.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-700 flex items-center gap-2">
                              <span className="text-base">{perm.icon}</span> 
                              <span>{perm.name}</span>
                            </td>
                            <td className="py-2.5 px-2 text-center border-l border-slate-100 bg-slate-50/30">
                              <input 
                                type="checkbox" 
                                checked={isAllSelected} 
                                onChange={() => togglePermission(perm.id)} 
                                className="w-4 h-4 rounded border-slate-300 text-slate-700 focus:ring-slate-700 cursor-pointer" 
                              />
                            </td>
                            {['view', 'create', 'edit', 'delete'].map(action => {
                              const actionColors = {
                                'view': 'text-blue-500 focus:ring-blue-500',
                                'create': 'text-emerald-500 focus:ring-emerald-500',
                                'edit': 'text-amber-500 focus:ring-amber-500',
                                'delete': 'text-red-500 focus:ring-red-500',
                              };
                              return (
                                <td key={action} className={`py-2.5 px-2 text-center ${action === 'view' ? 'border-l border-slate-100' : ''}`}>
                                  <input 
                                    type="checkbox" 
                                    checked={form.permissions.includes(`${perm.id}.${action}`)} 
                                    onChange={() => togglePermission(perm.id, action)} 
                                    className={`w-4 h-4 rounded border-slate-300 cursor-pointer transition-all ${actionColors[action]}`} 
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
