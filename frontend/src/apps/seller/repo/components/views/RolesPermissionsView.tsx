import React, { useState, useEffect } from 'react';
import { Shield, Plus, Pencil, Trash2, X } from '@/constants/icons';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface RetailRole {
  id: number;
  name: string;
  permissions: string[];
}

export interface PermissionGroup {
  group: string;
  permissions: { id: string; label: string }[];
}

export const MODULE_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: '🌐 Omnichannel & Marketplace Seller',
    permissions: [
      { id: 'seller_marketplace', label: 'Dashboard Marketplace & Hubungkan Akun (Shopee, Tokopedia, TikTok, Lazada)' },
      { id: 'seller_orders', label: 'Pesanan Omnichannel (Proses, Batalkan, Update Status Pengiriman)' },
      { id: 'seller_mapping', label: 'Pemetaan SKU (Product Mapping) & Multi-Channel Pricing' },
      { id: 'seller_sync', label: 'Pusat Sinkronisasi Stok & Riwayat Log Sinkronisasi' },
      { id: 'seller_shipping', label: 'Logistik & Pengiriman (Request Pickup, Ekspedisi, Cetak Resi AWB)' },
      { id: 'seller_packing', label: 'Peningkatan Quality Packing & Scan Barcode Pesanan' },
      { id: 'seller_warehouses', label: 'Multi-Gudang Seller & Alokasi Stok Antar Gudang' },
      { id: 'seller_notifications', label: 'Pusat Notifikasi Toko & Resolusi Konflik Stok' },
    ],
  },
  {
    group: '🏪 Toko Retail, Kasir & Inventori',
    permissions: [
      { id: 'pos', label: 'Kasir POS & Transaksi Kasir Offline' },
      { id: 'catalog', label: 'Katalog Master Produk & Stok' },
      { id: 'inventory', label: 'Manajemen Stok Fisik & Stock Opname' },
      { id: 'purchasing', label: 'Pembelian & Retur Supplier' },
      { id: 'discounts', label: 'Kode Diskon Promo & Daftar Harga' },
      { id: 'finance', label: 'Keuangan & Pencairan Saldo (Kas, Hutang, Piutang)' },
      { id: 'reports', label: 'Laporan Penjualan & Analitik Margin' },
      { id: 'master', label: 'Data Master (Supplier, Cabang, Satuan, Kategori)' },
      { id: 'staff', label: 'Data Pegawai & Manajemen Staf' },
      { id: 'roles', label: 'Manajemen Hak Akses & Peran' },
    ],
  },
];

export const MODULE_PERMISSIONS = MODULE_PERMISSION_GROUPS.flatMap((g) => g.permissions);

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
      <div className="flex items-center justify-end gap-2 shrink-0">
        <button
          onClick={openAddRole}
          className="px-4 h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Peran</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/70 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Nama Peran</th>
                <th className="px-5 py-3.5">Modul yang Diizinkan</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-[13.5px] text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-sm">Memuat...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400 text-sm">Belum ada peran. Klik "Tambah Peran" untuk membuat yang pertama.</td></tr>
              ) : (
                paginatedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors align-top">
                    <td className="px-5 py-3.5 font-normal text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">{role.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5 max-w-xl">
                        {(role.permissions || []).length === 0 ? (
                          <span className="text-xs text-slate-400">Belum ada izin diatur</span>
                        ) : (
                          role.permissions.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-600">
                              {MODULE_PERMISSIONS.find((m) => m.id === p)?.label.split(',')[0] || p}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button onClick={() => openEditRole(role)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Pencil className="w-4 h-4" />
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
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {MODULE_PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="space-y-2">
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                        {group.group}
                      </div>
                      <div className="space-y-1.5 pl-1">
                        {group.permissions.map((m) => (
                          <label key={m.id} className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 p-1 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={rolePermissions.includes(m.id)}
                              onChange={() => togglePermission(m.id)}
                              className="mt-0.5 cursor-pointer accent-indigo-600 rounded"
                            />
                            <span className="text-slate-700 dark:text-slate-300 text-xs">{m.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
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
