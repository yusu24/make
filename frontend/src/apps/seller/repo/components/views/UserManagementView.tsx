import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface RetailRole {
  id: number;
  name: string;
  permissions: string[];
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
  status: string;
  retail_role_id: number | null;
  retail_role?: RetailRole | null;
}

export const UserManagementView: React.FC = () => {
  const [roles, setRoles] = useState<RetailRole[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRoleId, setStaffRoleId] = useState('');

  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/retail/roles').catch(() => ({ data: { data: [] } })),
      api.get('/retail/staff').catch(() => ({ data: [] })),
    ]).then(([rolesRes, staffRes]) => {
      setRoles(rolesRes.data?.data || []);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const { paginatedItems: paginatedStaff, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(staff);

  const openAddStaff = () => {
    setStaffToEdit(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('');
    setStaffRoleId(roles[0] ? String(roles[0].id) : '');
    setError('');
    setIsStaffModalOpen(true);
  };

  const openEditStaff = (member: StaffMember) => {
    setStaffToEdit(member);
    setStaffName(member.name);
    setStaffEmail(member.email);
    setStaffPassword('');
    setStaffRoleId(member.retail_role_id ? String(member.retail_role_id) : '');
    setError('');
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!staffRoleId) {
      setError('Pilih peran untuk user ini terlebih dahulu.');
      return;
    }
    try {
      if (staffToEdit) {
        const payload: any = { name: staffName, email: staffEmail, retail_role_id: Number(staffRoleId) };
        if (staffPassword) payload.password = staffPassword;
        await api.put(`/retail/staff/${staffToEdit.id}`, payload);
      } else {
        await api.post('/retail/staff', {
          name: staffName,
          email: staffEmail,
          password: staffPassword,
          retail_role_id: Number(staffRoleId),
        });
      }
      setIsStaffModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal menyimpan user.');
    }
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    if (!confirm(`Hapus user "${member.name}"?`)) return;
    try {
      await api.delete(`/retail/staff/${member.id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Manajemen User</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Buat akun untuk staf Anda dan tetapkan peran aksesnya. Atur daftar peran di menu Peran & Hak Akses.
          </p>
        </div>
        <button
          onClick={openAddStaff}
          disabled={roles.length === 0}
          title={roles.length === 0 ? 'Buat peran terlebih dahulu di menu Peran & Hak Akses' : ''}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {roles.length === 0 && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-700 dark:text-amber-300 font-medium">
          Belum ada peran yang dibuat. Buka menu "Peran & Hak Akses" untuk membuat peran sebelum menambah user.
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 font-semibold">Nama User</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Peran (Role)</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Belum ada user. Klik "Tambah User Baru" untuk membuat akun.</td></tr>
              ) : (
                paginatedStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">{member.name}</td>
                    <td className="px-5 py-4">{member.email}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-200 dark:border-indigo-800">
                        {member.retail_role?.name || 'Tanpa Peran'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {member.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => openEditStaff(member)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteStaff(member)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && staff.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {staffToEdit ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-5 space-y-4 text-xs">
              {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium">{error}</div>}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama User</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password {staffToEdit && <span className="font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required={!staffToEdit}
                  minLength={6}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Peran</label>
                <select
                  value={staffRoleId}
                  onChange={(e) => setStaffRoleId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                >
                  <option value="">Pilih peran...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md shadow-indigo-500/20 cursor-pointer">
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
