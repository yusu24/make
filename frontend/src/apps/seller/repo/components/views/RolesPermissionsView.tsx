import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface RetailRole {
  id: number;
  name: string;
  permissions: string[];
}

const MODULE_PERMISSIONS = [
  { id: 'pos', label: 'Kasir (POS), Retur Pelanggan & Diskon Checkout' },
  { id: 'catalog', label: 'Katalog Produk' },
  { id: 'inventory', label: 'Manajemen Stok, Logistik & Stock Opname' },
  { id: 'master', label: 'Data Master (Kategori, Satuan, Supplier, Pelanggan, Pengaturan)' },
  { id: 'staff', label: 'Data Pegawai' },
  { id: 'roles', label: 'Manajemen Hak Akses' },
  { id: 'purchasing', label: 'Pembelian & Retur Supplier' },
  { id: 'discounts', label: 'Kode Diskon & Pricelist' },
  { id: 'reports', label: 'Laporan Analitik' },
  { id: 'finance', label: 'Keuangan (Pengeluaran, Hutang, Piutang)' },
];

export const RolesPermissionsView: React.FC = () => {
  const [roles, setRoles] = useState<RetailRole[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RetailRole | null>(null);
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  const [error, setError] = useState('');

  const fetchRoles = () => {
    setLoading(true);
    api.get('/retail/roles')
      .then((res) => setRoles(res.data?.data || []))
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoles(); }, []);

  const { paginatedItems: paginatedRoles, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(roles);

  const openAddRole = () => {
    setRoleToEdit(null);
    setRoleName('');
    setRolePermissions([]);
    setError('');
    setIsRoleModalOpen(true);
  };

  const openEditRole = (role: RetailRole) => {
    setRoleToEdit(role);
    setRoleName(role.name);
    setRolePermissions(role.permissions || []);
    setError('');
    setIsRoleModalOpen(true);
  };

  const togglePermission = (id: string) => {
    setRolePermissions((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { name: roleName, permissions: rolePermissions };
      if (roleToEdit) {
        await api.put(`/retail/roles/${roleToEdit.id}`, payload);
      } else {
        await api.post('/retail/roles', payload);
      }
      setIsRoleModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan peran.');
    }
  };

  const handleDeleteRole = async (role: RetailRole) => {
    if (!confirm(`Hapus peran "${role.name}"?`)) return;
    try {
      await api.delete(`/retail/roles/${role.id}`);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus peran.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Peran & Hak Akses (Roles)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Definisikan peran beserta modul yang boleh diakses. Tetapkan peran ke staf lewat menu Manajemen User.
          </p>
        </div>
        <button
          onClick={openAddRole}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Peran</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 font-semibold">Nama Peran</th>
                <th className="px-5 py-4 font-semibold">Modul yang Diizinkan</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400">Belum ada peran. Klik "Tambah Peran" untuk membuat yang pertama.</td></tr>
              ) : (
                paginatedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors align-top">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{role.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xl">
                        {(role.permissions || []).length === 0 ? (
                          <span className="text-[10px] text-slate-400">Belum ada izin diatur</span>
                        ) : (
                          role.permissions.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-600">
                              {MODULE_PERMISSIONS.find((m) => m.id === p)?.label.split(',')[0] || p}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button onClick={() => openEditRole(role)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRole(role)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && roles.length > 0 && (
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

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {roleToEdit ? 'Edit Peran' : 'Tambah Peran Baru'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRole} className="p-5 space-y-4 text-xs">
              {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium">{error}</div>}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Peran</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  placeholder="Contoh: Kasir POS"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">Modul yang Boleh Diakses</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {MODULE_PERMISSIONS.map((m) => (
                    <label key={m.id} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rolePermissions.includes(m.id)}
                        onChange={() => togglePermission(m.id)}
                        className="mt-0.5 cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md shadow-indigo-500/20 cursor-pointer">
                  Simpan Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
