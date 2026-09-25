import React, { useState, useEffect } from 'react';
import { KeyRound, Pencil, Trash2, Shield, Plus, X, Loader2, Users, Utensils, CreditCard, BadgeCheck } from '@/constants/icons';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { api } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from '../../../contexts/I18nContext';
import { useToast } from '../../../components/Toast';
import { useConfirm } from '../../../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import StatScoreCard from '../../../components/ui/StatScoreCard';
import ClientPagination from '../components/ClientPagination';
import KulinerTableSkeleton from '../components/KulinerTableSkeleton';
import './KulinerDashboard.css';

const CulinaryStaff = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const toast = useToast();
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(staff.length / itemsPerPage);
  const currentStaff = staff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const cashierCount = staff.filter(s => s.role === 'cashier').length;
  const kitchenCount = staff.filter(s => s.role === 'chef' || s.role === 'kitchen').length;
  const customRoleCount = staff.filter(s => s.kuliner_role_id || s.kuliner_role).length;

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
        toast.success('Data staff berhasil diperbarui');
      } else {
        await api.post('/kuliner/admin/staff', form);
        toast.success('Staff baru berhasil ditambahkan');
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
      toast.error(errorMessage);
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
      toast.error('Gagal impersonate: ' + (err.response?.data?.message || err.message));
    } finally {
      setImpersonating(null);
    }
  };

  const handleDelete = async (id) => {
    if (await confirm('Hapus staff ini?')) {
      try {
        await api.delete(`/kuliner/admin/staff/${id}`);
        toast.success('Staff berhasil dihapus');
        fetchStaff();
      } catch (err) {
        toast.error('Gagal menghapus staff');
      }
    }
  };

  return (
    <KulinerAdminLayout>
      <div className="kd-content">
        {/* Modern KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatScoreCard
            title="Total Karyawan"
            value={staff.length}
            icon={Users}
            color="amber"
            badgeText="Aktif"
            sublabel="Semua akun staf terdaftar"
          />
          <StatScoreCard
            title="Staf Kasir"
            value={cashierCount}
            icon={CreditCard}
            color="emerald"
            badgeText="Front of House"
            sublabel="Akses operasional POS"
          />
          <StatScoreCard
            title="Tim Dapur / Koki"
            value={kitchenCount}
            icon={Utensils}
            color="violet"
            badgeText="Back of House"
            sublabel="Akses antrean dapur (KDS)"
          />
          <StatScoreCard
            title="Jabatan Khusus"
            value={customRoleCount}
            icon={BadgeCheck}
            color="sky"
            badgeText={`${roles.length} Role Master`}
            sublabel="Memiliki penugasan role kustom"
          />
        </div>

        <div className="kd-page-actions">
          <a href="/kuliner/admin/roles" className="kd-btn kd-btn-secondary flex items-center gap-2">
            <Shield size={15} /> Atur Role & Izin
          </a>
          <button className="kd-btn kd-btn-primary flex items-center gap-1.5" onClick={() => {
            setEditingStaff(null);
            setForm({ name: '', email: '', password: '', role: 'cashier', kuliner_role_id: '', phone: '' });
            setShowModal(true);
          }}>
            <Plus size={15} /> Tambah Staff Baru
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
                  <KulinerTableSkeleton cols={5} rows={5} />
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400 text-xs italic">
                      {t('kulinerCommon.emptyData') || 'Belum ada staff terdaftar.'}
                    </td>
                  </tr>
                ) : (
                  currentStaff.map(member => (
                    <tr key={member.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                            {member.name.charAt(0)}
                          </div>
                            <span style={{ color: '#1e293b', fontSize: 12, fontWeight: 400 }}>{member.name}</span>
                        </div>
                      </td>
                      <td><span className="text-[12px] font-normal text-slate-500">{member.email}</span></td>
                      <td>
                          <div className="flex flex-row items-center flex-wrap gap-2">
                            <span className={`badge ${member.role === 'chef' ? 'badge-violet' : 'badge-green'}`} style={{ fontSize: 12, fontWeight: 400 }}>
                              {member.role === 'chef' ? 'Koki / Dapur' : 'Kasir'}
                            </span>
                            {member.kuliner_role && (
                              <span className="text-[12px] font-normal text-amber-600 uppercase tracking-tight bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                {member.kuliner_role.name}
                              </span>
                            )}
                          </div>
                      </td>
                      <td><span className="text-[12px] font-normal text-slate-500">{member.phone || '-'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex justify-end gap-2">
                          <button
                            className="kd-icon-btn"
                            style={{ color: '#b48c36', borderColor: '#b48c36' }}
                            onClick={() => handleImpersonate(member.id)}
                            disabled={impersonating === member.id}
                            title="Login sebagai Staff ini"
                          >
                            {impersonating === member.id ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                          </button>
                          <button className="kd-icon-btn" title="Edit" onClick={() => handleEdit(member)}><Pencil size={16} /></button>
                          <button className="kd-icon-btn text-red-500" title="Hapus" onClick={() => handleDelete(member.id)}><Trash2 size={16} /></button>
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
            totalItems={staff.length}
          />
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
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowModal(false)}><X size={18} /></button>
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
                    <option value="cashier">Kasir (Akses Transaksi)</option>
                    <option value="chef">Koki / Dapur (Akses Pesanan)</option>
                    <option value="staff">Staff Biasa</option>
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
