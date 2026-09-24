import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Shield, 
  UserCheck, 
  RefreshCw,
  Search,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  LogIn
} from '@/constants/icons';
import { JasaRole, JasaStaff, Technician } from '../types';
import { jasaApi } from '../services/jasaApi';
import '../../../retail/retail.css';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import RetailTableLoadingRow from '../../../retail/components/RetailTableLoadingRow';
import { useAuth } from '../../../../contexts/AuthContext';

export const JasaStaffView: React.FC<{
  technicians: Technician[];
  onRefresh?: () => void;
}> = ({ technicians, onRefresh }) => {
  const { user, impersonateUser } = useAuth();
  const [roles, setRoles] = useState<JasaRole[]>([]);
  const [staffList, setStaffList] = useState<JasaStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<JasaStaff | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    email: string;
    password?: string;
    phone: string;
    jasa_role_id: number | '';
    is_field_technician: boolean;
    technician_mode: 'auto_create' | 'existing';
    technician_specialty: string;
    link_technician_id: string;
  }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    jasa_role_id: '',
    is_field_technician: false,
    technician_mode: 'auto_create',
    technician_specialty: 'Teknisi Umum',
    link_technician_id: ''
  });

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [rolesData, staffData] = await Promise.all([
        jasaApi.getRoles(),
        jasaApi.getStaff()
      ]);
      setRoles(rolesData);
      setStaffList(staffData);
    } catch (err: any) {
      console.error('Failed to load staff/roles:', err);
      showToast('Gagal memuat data staf & operator', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleRoleChange = (roleId: number | '') => {
    const selectedRole = roles.find(r => r.id === roleId);
    const isTechRole = selectedRole?.name?.toLowerCase().includes('teknisi') || selectedRole?.name?.toLowerCase().includes('operator');
    setStaffForm(prev => ({
      ...prev,
      jasa_role_id: roleId,
      is_field_technician: isTechRole ? true : prev.is_field_technician
    }));
  };

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    const initialRoleId = roles.length > 0 ? roles[0].id : '';
    const initialRole = roles.find(r => r.id === initialRoleId);
    const isTechRole = initialRole?.name?.toLowerCase().includes('teknisi') || initialRole?.name?.toLowerCase().includes('operator');

    setStaffForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      jasa_role_id: initialRoleId,
      is_field_technician: !!isTechRole,
      technician_mode: technicians.length > 0 ? 'existing' : 'auto_create',
      technician_specialty: 'Teknisi Umum',
      link_technician_id: technicians.length > 0 ? String(technicians[0].id) : ''
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (staff: JasaStaff) => {
    setEditingStaff(staff);
    const linkedTech = staff.technician || technicians.find(t => String(t.user_id) === String(staff.id));
    const isTechRole = staff.jasa_role?.name?.toLowerCase().includes('teknisi') || staff.jasa_role?.name?.toLowerCase().includes('operator');

    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: '',
      phone: staff.phone || '',
      jasa_role_id: staff.jasa_role_id || (roles.length > 0 ? roles[0].id : ''),
      is_field_technician: Boolean(linkedTech || isTechRole),
      technician_mode: linkedTech ? 'auto_create' : (technicians.length > 0 ? 'existing' : 'auto_create'),
      technician_specialty: linkedTech?.specialty || 'Teknisi Umum',
      link_technician_id: linkedTech ? String(linkedTech.id) : (technicians.length > 0 ? String(technicians[0].id) : '')
    });
    setIsStaffModalOpen(true);
  };

  const handleQuickCreateTech = async (staff: JasaStaff) => {
    const specialty = window.prompt(`Buatkan Profil Master Teknisi untuk "${staff.name}". Masukkan spesialisasi:`, 'Teknisi Umum');
    if (specialty === null) return;
    try {
      await jasaApi.updateStaff(staff.id, {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        jasa_role_id: staff.jasa_role_id,
        auto_create_technician: true,
        technician_specialty: specialty.trim() || 'Teknisi Umum'
      });
      showToast(`Profil Teknisi "${staff.name}" berhasil dibuat & ditautkan!`);
      fetchStaffData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Gagal menautkan profil teknisi', 'error');
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim()) {
      showToast('Nama dan email wajib diisi', 'error');
      return;
    }
    if (!editingStaff && (!staffForm.password || staffForm.password.length < 6)) {
      showToast('Password wajib diisi minimal 6 karakter', 'error');
      return;
    }

    const selectedRoleId = staffForm.jasa_role_id || (roles.length > 0 ? roles[0].id : undefined);

    const payload: any = {
      name: staffForm.name,
      email: staffForm.email,
      phone: staffForm.phone,
      jasa_role_id: selectedRoleId,
    };

    if (staffForm.is_field_technician) {
      if (staffForm.technician_mode === 'auto_create') {
        payload.auto_create_technician = true;
        payload.technician_specialty = staffForm.technician_specialty.trim() || 'Teknisi Umum';
      } else if (staffForm.technician_mode === 'existing' && staffForm.link_technician_id) {
        payload.link_technician_id = staffForm.link_technician_id;
      }
    } else {
      payload.link_technician_id = null;
    }

    try {
      if (editingStaff) {
        if (staffForm.password) {
          payload.password = staffForm.password;
        }
        await jasaApi.updateStaff(editingStaff.id, payload);
        showToast('Akun staf berhasil diperbarui');
      } else {
        payload.password = staffForm.password!;
        await jasaApi.createStaff(payload);
        showToast('Akun staf & operator berhasil dibuat');
      }
      setIsStaffModalOpen(false);
      fetchStaffData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to save staff:', err);
      const errMsg = err.response?.data?.message || 
                     err.response?.data?.errors?.email?.[0] || 
                     err.response?.data?.errors?.password?.[0] || 
                     'Gagal menyimpan akun staf';
      showToast(errMsg, 'error');
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus akun staf ini? Akun tidak akan bisa login lagi.')) {
      return;
    }
    try {
      await jasaApi.deleteStaff(id);
      showToast('Akun staf berhasil dihapus');
      fetchStaffData();
    } catch (err: any) {
      console.error('Failed to delete staff:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus akun staf', 'error');
    }
  };

  const handleImpersonate = async (targetId: number, staffName: string) => {
    if (window.confirm(`Login sementara sebagai "${staffName}" untuk menguji dan mengecek batasan hak akses akun ini?`)) {
      try {
        const redirectPath = await impersonateUser(targetId);
        window.location.href = redirectPath || '/jasa/dashboard';
      } catch (err: any) {
        console.error('Failed to impersonate:', err);
        showToast(err.response?.data?.message || 'Gagal login sebagai staf ini', 'error');
      }
    }
  };

  const filteredStaff = staffList.filter(s => 
    !search || 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  );
  const p = usePagination(filteredStaff, 15);

  return (
    <div className="retail-page-classic">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Action & Filter Bar matching invoices style */}
      <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-4">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama staf, email, atau no HP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
            />
          </div>
          <button
            onClick={fetchStaffData}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddStaff}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun Staf</span>
          </button>
        </div>
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header whitespace-nowrap">Nama Staf</th>
                <th className="retail-table-header whitespace-nowrap">Email / Akun Login</th>
                <th className="retail-table-header whitespace-nowrap">No. Telepon / HP</th>
                <th className="retail-table-header whitespace-nowrap">Role / Hak Akses</th>
                <th className="retail-table-header whitespace-nowrap">Profil Teknisi Terkait</th>
                <th className="retail-table-header text-center whitespace-nowrap">Status</th>
                <th className="pr-6 retail-table-header text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <RetailTableLoadingRow colSpan={7} text="Memuat data akun staf & operator..." />
              ) : p.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    Belum ada akun staf terdaftar.
                  </td>
                </tr>
              ) : (
                p.paginatedData.map(staff => {
                  const linkedTech = staff.technician || technicians.find(t => String(t.user_id) === String(staff.id));
                  const isTechRole = staff.jasa_role?.name?.toLowerCase().includes('teknisi') || staff.jasa_role?.name?.toLowerCase().includes('operator');

                  return (
                    <tr key={staff.id}>
                      <td className="pl-6">
                        <div className="font-semibold text-slate-800">{staff.name}</div>
                        {user?.id === staff.id && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                            👑 Anda (Akun Login Saat Ini)
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="retail-text-primary font-mono text-xs">{staff.email}</span>
                      </td>
                      <td>
                        <span className="retail-text-secondary">{staff.phone || '-'}</span>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {staff.jasa_role?.name || 'Belum diatur'}
                        </span>
                      </td>
                      <td>
                        {linkedTech ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {linkedTech.name} ({linkedTech.specialty || 'Teknisi Umum'})
                            </span>
                          </div>
                        ) : isTechRole ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200" title="Akun staf ini berstatus role teknisi, namun belum dibuatkan profil di master Tim Teknisi">
                              ⚠️ Belum Tertaut Profil
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickCreateTech(staff)}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                              title="Buatkan profil teknisi sekarang"
                            >
                              + Buat Profil
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            Non-Teknisi Lapangan
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          staff.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {staff.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="pr-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {user?.id !== staff.id && (
                            <button
                              onClick={() => handleImpersonate(staff.id, staff.name)}
                              className="p-1.5 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                              title="Uji Akses (Impersonate)"
                            >
                              <LogIn className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditStaff(staff)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Staf"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun Staf"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && <RetailPagination {...p} />}
      </div>

      {/* ── STAFF MODAL ── */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingStaff ? `✏️ Edit Akun: ${editingStaff.name}` : '👤 Buat Akun Staf Baru'}
                </h3>
                <p className="text-xs text-slate-500">Buatkan kredensial login dan tentukan role peran staf.</p>
              </div>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={staffForm.name}
                    onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="budi@service.com"
                      value={staffForm.email}
                      onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="08123456789"
                      value={staffForm.phone}
                      onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password Login {editingStaff && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                  {!editingStaff && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required={!editingStaff}
                    placeholder="Minimal 6 karakter"
                    value={staffForm.password || ''}
                    onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Role / Hak Akses <span className="text-rose-500">*</span>
                </label>
                <select
                  value={staffForm.jasa_role_id}
                  onChange={e => handleRoleChange(Number(e.target.value) || '')}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Pilih Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Technician Section */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-950">Profil Teknisi Lapangan (Penerima SPK)</div>
                      <div className="text-[11px] text-amber-700 leading-tight">
                        Apakah staf ini bertugas ke lapangan / mengerjakan servis fisik?
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={staffForm.is_field_technician}
                      onChange={e => setStaffForm({ ...staffForm, is_field_technician: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {staffForm.is_field_technician ? (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60">
                    {technicians.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                            <input
                              type="radio"
                              name="tech_mode"
                              checked={staffForm.technician_mode === 'existing'}
                              onChange={() => setStaffForm({ ...staffForm, technician_mode: 'existing' })}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            Pilih Teknisi Terdaftar
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                            <input
                              type="radio"
                              name="tech_mode"
                              checked={staffForm.technician_mode === 'auto_create'}
                              onChange={() => setStaffForm({ ...staffForm, technician_mode: 'auto_create' })}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            Buat Master Teknisi Baru
                          </label>
                        </div>

                        {staffForm.technician_mode === 'existing' ? (
                          <div>
                            <select
                              value={staffForm.link_technician_id}
                              onChange={e => setStaffForm({ ...staffForm, link_technician_id: e.target.value })}
                              className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs bg-white focus:outline-none focus:border-amber-500"
                            >
                              <option value="">-- Pilih Profil Master Teknisi --</option>
                              {technicians.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name} — {t.specialty} ({t.currentStatus || 'Tersedia'})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                              Spesialisasi / Keahlian Utama:
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: Teknisi Mesin, Servis AC & Listrik, Elektronik"
                              value={staffForm.technician_specialty}
                              onChange={e => setStaffForm({ ...staffForm, technician_specialty: e.target.value })}
                              className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs bg-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-[11px] text-amber-800 bg-amber-100/70 p-2.5 rounded-xl leading-relaxed">
                          💡 <strong>Master data teknisi di menu Tim Teknisi saat ini masih kosong.</strong> Sistem akan otomatis membuatkan profil teknisi baru untuk staf ini agar langsung tercatat di master data lapangan dan siap menerima tugas SPK.
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                            Spesialisasi / Keahlian Utama:
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Teknisi Umum, Servis Mesin, AC & Listrik"
                            value={staffForm.technician_specialty}
                            onChange={e => setStaffForm({ ...staffForm, technician_specialty: e.target.value })}
                            className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs bg-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-[10px] text-amber-700 leading-relaxed">
                      Profil teknisi ini akan otomatis muncul di menu <strong>Tim Teknisi</strong> dan dapat langsung ditugaskan saat pembuatan Surat Perintah Kerja (SPK).
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-xl">
                    Akun staf non-teknisi (seperti Kasir, Admin Toko, Supervisor) tidak memerlukan profil teknisi lapangan.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
                >
                  {editingStaff ? 'Simpan Perubahan' : 'Buat Akun Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
