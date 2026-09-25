import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  ClipboardList, 
  ShoppingBag, 
  Package, 
  Wrench, 
  Wallet, 
  RefreshCw,
  CheckSquare,
  Square,
  Users,
  Loader2,
  Search
} from '@/constants/icons';
import { JasaRole } from '../types';
import { jasaApi } from '../services/jasaApi';
import '../../../retail/retail.css';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { JasaTableSkeleton } from './JasaTableSkeleton';

export const JASA_PERMISSION_GROUPS = [
  {
    group: '📋 Surat Perintah Kerja (SPK)',
    shortName: 'SPK',
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
    shortName: 'Kasir POS',
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
    shortName: 'Sparepart',
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
    shortName: 'Teknisi & Kontrak',
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
    shortName: 'Keuangan',
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

export const JasaRolesView: React.FC<{
  onRefresh?: () => void;
}> = () => {
  const [roles, setRoles] = useState<JasaRole[]>([]);
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

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const rolesData = await jasaApi.getRoles();
      setRoles(rolesData);
    } catch (err: any) {
      console.error('Failed to load roles:', err);
      showToast('Gagal memuat daftar role', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: {
        spk_view_assigned: true,
        spk_update_status: true,
        inventory_use_parts: true
      }
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

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      showToast('Nama role wajib diisi', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await jasaApi.updateRole(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        });
        showToast('Role berhasil diperbarui');
      } else {
        await jasaApi.createRole({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        });
        showToast('Role baru berhasil ditambahkan');
      }
      setIsRoleModalOpen(false);
      await fetchRoles();
    } catch (err: any) {
      console.error('Failed to save role:', err);
      const validationErrors = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : '';
      const errMsg = validationErrors || err.response?.data?.message || 'Gagal menyimpan role';
      showToast(errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus role ini? Pastikan tidak ada staf yang masih menggunakan role ini.')) {
      return;
    }
    try {
      await jasaApi.deleteRole(id);
      showToast('Role berhasil dihapus');
      fetchRoles();
    } catch (err: any) {
      console.error('Failed to delete role:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus role', 'error');
    }
  };

  const togglePermission = (permId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permId]: !prev.permissions[permId]
      }
    }));
  };

  const toggleGroupPermissions = (groupPermIds: string[]) => {
    const allChecked = groupPermIds.every(id => roleForm.permissions[id]);
    setRoleForm(prev => {
      const nextPerms = { ...prev.permissions };
      groupPermIds.forEach(id => {
        nextPerms[id] = !allChecked;
      });
      return { ...prev, permissions: nextPerms };
    });
  };

  const filteredRoles = roles.filter(r => 
    !search || 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );
  const p = usePagination(filteredRoles, 15);

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
              placeholder="Cari role atau deskripsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
            />
          </div>
          <button
            onClick={fetchRoles}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddRole}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Role</span>
          </button>
        </div>
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header">Nama Role</th>
                <th className="retail-table-header">Deskripsi</th>
                <th className="retail-table-header">Pengguna Terdaftar</th>
                <th className="retail-table-header">Cakupan Izin</th>
                <th className="retail-table-header">Rincian Akses Modul</th>
                <th className="pr-6 retail-table-header text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <JasaTableSkeleton rows={4} cols={6} />
              ) : p.paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500">
                    Belum ada data role / hak akses.
                  </td>
                </tr>
              ) : (
                p.paginatedData.map(role => {
                  const permCount = Object.values(role.permissions || {}).filter(Boolean).length;
                  const isOwner = role.name.toLowerCase().includes('owner') || role.name.toLowerCase().includes('manajer');

                  return (
                    <tr key={role.id}>
                      <td className="pl-6">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                          <span>{role.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="retail-text-secondary">{role.description || '-'}</span>
                      </td>
                      <td>
                        <span className="font-medium text-slate-800">
                          {role.users_count || 0} Pengguna
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          permCount >= 15
                            ? 'bg-purple-100 text-purple-700'
                            : permCount >= 5
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {permCount} dari 20 Izin
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1.5 max-w-[360px]">
                          {JASA_PERMISSION_GROUPS.map(g => {
                            const activeInGroup = g.permissions.filter(p => role.permissions?.[p.id]).length;
                            if (activeInGroup === 0) return null;
                            const isFull = activeInGroup === g.permissions.length;
                            return (
                              <span
                                key={g.group}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-medium border ${
                                  isFull
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                                title={`${g.group}: ${activeInGroup}/${g.permissions.length} izin`}
                              >
                                <span>{g.shortName}</span>
                                <span className="font-bold">{activeInGroup}/{g.permissions.length}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="pr-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditRole(role)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Hak Akses"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {!isOwner && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
                      <div key={group.group} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                          <div className="flex items-center gap-2">
                            <group.icon size={16} style={{ color: group.color }} />
                            <span className="text-xs font-bold text-slate-800">{group.group}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleGroupPermissions(groupPermIds)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            {allChecked ? (
                              <>
                                <CheckSquare size={14} /> Batal Pilih Semua
                              </>
                            ) : (
                              <>
                                <Square size={14} /> Pilih Semua
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {group.permissions.map(perm => {
                            const isChecked = !!roleForm.permissions[perm.id];
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                                    : 'bg-white border-slate-200/70 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm.id)}
                                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs leading-relaxed">{perm.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Menyimpan...' : (editingRole ? 'Simpan Perubahan' : 'Buat Role')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
