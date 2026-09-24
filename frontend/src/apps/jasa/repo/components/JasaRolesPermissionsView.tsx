import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  Wrench, 
  ClipboardList, 
  ShoppingBag, 
  Package, 
  Wallet, 
  Lock, 
  UserCheck, 
  RefreshCw,
  Search,
  CheckSquare,
  Square
} from '@/constants/icons';
import { JasaRole, JasaStaff, Technician } from '../types';
import { jasaApi } from '../services/jasaApi';

export const JASA_PERMISSION_GROUPS = [
  {
    group: '📋 Surat Perintah Kerja (SPK)',
    icon: ClipboardList,
    color: '#3b82f6',
    permissions: [
      { id: 'spk_view_all', label: 'Lihat Semua SPK Seluruh Teknisi' },
      { id: 'spk_view_assigned', label: 'Lihat SPK Penugasan Sendiri (Operator Mode)' },
      { id: 'spk_create', label: 'Buat SPK / Order Servis Baru' },
      { id: 'spk_edit', label: 'Edit Rincian Kerusakan & Estimasi SPK' },
      { id: 'spk_update_status', label: 'Ubah Status Pengerjaan (Antrean → Pengerjaan → Selesai)' },
      { id: 'spk_delete', label: 'Hapus / Batalkan SPK' },
      { id: 'spk_print', label: 'Cetak Lembar Kerja SPK & Tanda Terima' },
    ]
  },
  {
    group: '🛒 Kasir POS & Faktur Tagihan',
    icon: ShoppingBag,
    color: '#10b981',
    permissions: [
      { id: 'pos_checkout', label: 'Akses Kasir POS Penjualan Cepat & Pelunasan' },
      { id: 'pos_invoices', label: 'Kelola Invoice Tagihan & Input Pembayaran DP' },
      { id: 'pos_discount', label: 'Berikan Diskon Khusus / Potongan Manual' },
    ]
  },
  {
    group: '⚙️ Suku Cadang & Material (Spareparts)',
    icon: Package,
    color: '#f59e0b',
    permissions: [
      { id: 'inventory_view', label: 'Monitoring Stok Suku Cadang & Material' },
      { id: 'inventory_use_parts', label: 'Pakai & Pasang Sparepart pada SPK' },
      { id: 'inventory_manage', label: 'Tambah Stok & Kelola Harga Sparepart' },
    ]
  },
  {
    group: '👥 Tim Teknisi & Kontrak Servis',
    icon: Wrench,
    color: '#8b5cf6',
    permissions: [
      { id: 'technicians_manage', label: 'Kelola Data Personel & Master Teknisi' },
      { id: 'contracts_manage', label: 'Kelola Kontrak Perawatan Berkala (B2B)' },
      { id: 'catalog_manage', label: 'Kelola Katalog Tarif & Layanan Servis' },
    ]
  },
  {
    group: '💰 Keuangan & Akses Sistem',
    icon: Wallet,
    color: '#ef4444',
    permissions: [
      { id: 'finance_view', label: 'Lihat Laporan Laba Rugi & Performa SLA' },
      { id: 'finance_expenses', label: 'Catat Pengeluaran & Biaya Operasional' },
      { id: 'finance_accounts', label: 'Kelola Rekening Kas & Bank Usaha' },
      { id: 'staff_manage', label: 'Kelola Akun Staf & Hak Akses (Roles)' },
    ]
  }
];

export const JasaRolesPermissionsView: React.FC<{
  technicians: Technician[];
  onRefresh: () => void;
}> = ({ technicians }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'staff'>('roles');
  const [roles, setRoles] = useState<JasaRole[]>([]);
  const [staffList, setStaffList] = useState<JasaStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<JasaRole | null>(null);
  const [roleForm, setRoleForm] = useState<{
    name: string;
    description: string;
    permissions: Record<string, boolean>;
  }>({
    name: '',
    description: '',
    permissions: {}
  });

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<JasaStaff | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    email: string;
    password?: string;
    phone: string;
    jasa_role_id: number | '';
    link_technician_id: string;
  }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    jasa_role_id: '',
    link_technician_id: ''
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, staffData] = await Promise.all([
        jasaApi.getRoles(),
        jasaApi.getStaff()
      ]);
      setRoles(rolesData);
      setStaffList(staffData);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data peran & staf', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Role Handlers ──
  const handleOpenAddRole = () => {
    setEditingRole(null);
    const initialPerms: Record<string, boolean> = {};
    JASA_PERMISSION_GROUPS.forEach(g => {
      g.permissions.forEach(p => {
        initialPerms[p.id] = false;
      });
    });
    setRoleForm({
      name: '',
      description: '',
      permissions: initialPerms
    });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: JasaRole) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: { ...(role.permissions || {}) }
    });
    setIsRoleModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permId]: !prev.permissions[permId]
      }
    }));
  };

  const handleToggleGroup = (groupPermIds: string[], targetState: boolean) => {
    setRoleForm(prev => {
      const updated = { ...prev.permissions };
      groupPermIds.forEach(id => {
        updated[id] = targetState;
      });
      return { ...prev, permissions: updated };
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      showToast('Nama role wajib diisi', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingRole) {
        await jasaApi.updateRole(editingRole.id, roleForm);
        showToast('Role berhasil diperbarui');
      } else {
        await jasaApi.storeRole(roleForm);
        showToast('Role baru berhasil ditambahkan');
      }
      setIsRoleModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan role', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Yakin ingin menghapus role ini? Akun staf dengan role ini akan kehilangan akses perannya.')) return;
    try {
      await jasaApi.deleteRole(roleId);
      showToast('Role berhasil dihapus');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus role', 'error');
    }
  };

  // ── Staff Handlers ──
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      jasa_role_id: roles.length > 0 ? roles[0].id : '',
      link_technician_id: ''
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: JasaStaff) => {
    setEditingStaff(staff);
    // Find linked technician if any
    const linkedTech = technicians.find(t => (t as any).user_id === staff.id);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: '',
      phone: staff.phone || '',
      jasa_role_id: staff.jasa_role_id || (roles.length > 0 ? roles[0].id : ''),
      link_technician_id: linkedTech ? String(linkedTech.id) : ''
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) {
      showToast('Nama dan Email wajib diisi', 'error');
      return;
    }
    if (!editingStaff && !staffForm.password) {
      showToast('Password wajib diisi untuk akun baru', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        jasa_role_id: staffForm.jasa_role_id,
        link_technician_id: staffForm.link_technician_id ? Number(staffForm.link_technician_id) : null
      };
      if (staffForm.password) {
        payload.password = staffForm.password;
      }

      if (editingStaff) {
        await jasaApi.updateStaff(editingStaff.id, payload);
        showToast('Data akun staf berhasil diperbarui');
      } else {
        await jasaApi.storeStaff(payload);
        showToast('Akun staf baru berhasil dibuat');
      }
      setIsStaffModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menyimpan akun staf', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (!window.confirm('Yakin ingin menghapus akun staf ini?')) return;
    try {
      await jasaApi.deleteStaff(staffId);
      showToast('Akun staf berhasil dihapus');
      loadData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus akun staf', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={24} />
            Role, Hak Akses &amp; Akun Tim Servis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur peran khusus teknisi/operator, izin akses SPK lapangan, dan kelola akun login tim Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'roles' ? (
            <button
              onClick={handleOpenAddRole}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus size={16} /> Tambah Role Baru
            </button>
          ) : (
            <button
              onClick={handleOpenAddStaff}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus size={16} /> Tambah Akun Staf
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('roles')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={18} />
          Daftar Role &amp; Hak Akses ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`py-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={18} />
          Akun Staf &amp; Operator Lapangan ({staffList.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-b-2xl border border-slate-200/80 text-center">
          <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat konfigurasi peran &amp; staf...</p>
        </div>
      ) : activeTab === 'roles' ? (
        /* ── ROLES TAB ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map(role => {
            const permCount = Object.values(role.permissions || {}).filter(Boolean).length;
            const isOwner = role.name.toLowerCase().includes('owner') || role.name.toLowerCase().includes('manajer');

            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Shield size={20} />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                      {role.users_count || 0} Pengguna
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{role.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {role.description || 'Tidak ada deskripsi peran'}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Izin Aktif: {permCount} Hak Akses
                    </div>
                    {JASA_PERMISSION_GROUPS.map(g => {
                      const activeInGroup = g.permissions.filter(p => role.permissions?.[p.id]).length;
                      if (activeInGroup === 0) return null;
                      return (
                        <div key={g.group} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate">{g.group}</span>
                          <span className="font-semibold text-indigo-600">
                            {activeInGroup}/{g.permissions.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-5">
                  <button
                    onClick={() => handleOpenEditRole(role)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Pencil size={13} /> Edit Izin
                  </button>
                  {!isOwner && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── STAFF TAB ── */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama staf atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Nama Staf &amp; Kontak</th>
                  <th className="p-3.5">Role / Peran</th>
                  <th className="p-3.5">Profil Teknisi Terkait</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList
                  .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
                  .map(staff => {
                    const linkedTech = technicians.find(t => (t as any).user_id === staff.id);

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/80">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{staff.name}</div>
                          <div className="text-[11px] text-slate-400">{staff.email} • {staff.phone || 'Tanpa No. HP'}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                            <Shield size={12} />
                            {staff.jasa_role?.name || 'Belum diatur'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {linkedTech ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                              <UserCheck size={12} />
                              {linkedTech.name} ({linkedTech.specialty})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Bukan Teknisi Lapangan</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            staff.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {staff.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditStaff(staff)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                              title="Edit Akun"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                              title="Hapus Akun"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ROLE MODAL ── */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRole ? `✏️ Edit Role: ${editingRole.name}` : '🛡️ Buat Role Baru'}
                </h3>
                <p className="text-xs text-slate-500">Tentukan nama peran dan centang izin hak akses yang diberikan.</p>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Role / Peran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Senior Teknisi AC, Operator Lapangan, Kasir Servis"
                    value={roleForm.name}
                    onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Tanggung Jawab</label>
                  <input
                    type="text"
                    placeholder="Contoh: Menangani servis AC di rumah pelanggan dan update progres pekerjaan"
                    value={roleForm.description}
                    onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Pilih Hak Akses (Granular Permissions):
                </h4>

                <div className="space-y-4">
                  {JASA_PERMISSION_GROUPS.map(group => {
                    const groupPermIds = group.permissions.map(p => p.id);
                    const allChecked = groupPermIds.every(id => roleForm.permissions[id]);
                    const someChecked = groupPermIds.some(id => roleForm.permissions[id]);

                    return (
                      <div key={group.group} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                            <group.icon size={16} style={{ color: group.color }} />
                            {group.group}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleGroup(groupPermIds, !allChecked)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            {allChecked ? 'Hapus Semua' : 'Pilih Semua'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {group.permissions.map(p => {
                            const isChecked = !!roleForm.permissions[p.id];
                            return (
                              <label
                                key={p.id}
                                className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                                  isChecked ? 'bg-indigo-50/60 border border-indigo-100' : 'hover:bg-white border border-transparent'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(p.id)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs text-slate-700 leading-tight select-none">
                                  {p.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STAFF MODAL ── */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingStaff ? `✏️ Edit Akun: ${editingStaff.name}` : '👤 Tambah Akun Staf'}
                </h3>
                <p className="text-xs text-slate-500">Buat login akun untuk kasir atau teknisi lapangan.</p>
              </div>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={staffForm.name}
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Login <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="teknisi@bengkel.com"
                  value={staffForm.email}
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password {editingStaff ? <span className="text-slate-400 font-normal">(Kosongkan jika tidak ingin diubah)</span> : <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  placeholder={editingStaff ? '••••••••' : 'Minimal 6 karakter'}
                  value={staffForm.password}
                  onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={staffForm.phone}
                  onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Hak Akses <span className="text-rose-500">*</span></label>
                <select
                  value={staffForm.jasa_role_id}
                  onChange={e => setStaffForm({ ...staffForm, jasa_role_id: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  required
                >
                  <option value="">-- Pilih Role --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tautkan ke Profil Master Teknisi <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <select
                  value={staffForm.link_technician_id}
                  onChange={e => setStaffForm({ ...staffForm, link_technician_id: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Bukan Teknisi Lapangan / Tidak Ditautkan --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Jika ditautkan, teknisi ini akan otomatis dapat melihat daftar SPK penugasan dirinya saat login.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
