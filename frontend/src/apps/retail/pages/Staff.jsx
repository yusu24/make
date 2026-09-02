import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2, RefreshCw, Plus, LogIn, Users, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function Staff() {
  const { user, impersonateUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [search, setSearch] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await api.get('/retail/roles');
      setAvailableRoles(res.data.data || []);
    } catch (e) {
      console.error('Gagal mengambil daftar jabatan:', e);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/retail/staff');
      setStaff(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, []);

  const handleImpersonate = async (targetId) => {
    if (window.confirm('Login sebagai pegawai ini untuk menguji batasan hak akses kasir/staf?')) {
      try {
        const redirectPath = await impersonateUser(targetId);
        window.location.href = redirectPath || '/retail/dashboard';
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal login sebagai pegawai');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    try {
      if (editingUser) {
        await api.put(`/retail/staff/${editingUser.id}`, data);
      } else {
        await api.post('/retail/staff', data);
      }
      fetchStaff();
      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.code === 'QUOTA_EXCEEDED') {
        setShowModal(false);
        setShowPaywall(true);
      } else {
        setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pegawai');
      }
    }
  };

  const handleEdit = (userItem) => {
    setEditingUser(userItem);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus akun pegawai ini? Pegawai tidak akan bisa login lagi ke sistem kasir toko.')) {
      try {
        await api.delete(`/retail/staff/${id}`);
        fetchStaff();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus pegawai');
      }
    }
  };

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredStaff);

  const maxQuota = user?.subscription_plan === 'pro' ? 'Tak Terbatas' : user?.subscription_plan === 'basic' ? '5 Pegawai' : '1 Pegawai (Owner)';

  return (
    <div className="retail-page-classic animate-fade-in">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pegawai Terdaftar</p>
            <p className="text-xl font-bold text-slate-800">{staff.length} <span className="text-xs text-slate-400 font-normal">Akun</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Status Pengguna Aktif</p>
            <p className="text-xl font-bold text-emerald-600">{staff.filter(s => s.status !== 'inactive').length} <span className="text-xs text-slate-400 font-normal">Aktif Bekerja</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Kuota Paket ({user?.subscription_plan?.toUpperCase() || 'FREE'})</p>
            <p className="text-xl font-bold text-slate-800">{maxQuota}</p>
          </div>
        </div>
      </div>

      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button 
            title="Tambah Pegawai Baru"
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => { setEditingUser(null); setErrorMsg(''); setShowModal(true); }}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Pegawai Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              placeholder="Cari nama / email pegawai..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchStaff} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header whitespace-nowrap">Nama Pegawai</th>
              <th className="retail-table-header whitespace-nowrap">Email / Akun Login</th>
              <th className="retail-table-header whitespace-nowrap">Jabatan / Role</th>
              <th className="retail-table-header whitespace-nowrap" style={{ width: 140 }}>Status Keaktifan</th>
              <th style={{ textAlign: 'right', width: 140 }} className="pr-6 retail-table-header whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={5} text="Menyinkronkan Data Pegawai & Status Keaktifan..." />
            ) : filteredStaff.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Belum ada data pegawai terdaftar.</td></tr>
            ) : (
              paginatedData.map((s) => (
                <tr key={s.id}>
                  <td className="pl-6">
                    <div className="font-medium text-slate-800">{s.name}</div>
                    {user.id === s.id && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                        👑 Anda (Pemilik Toko)
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="retail-text-primary font-mono text-xs">{s.email}</span>
                  </td>
                  <td>
                    {s.retail_role ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Shield size={12} /> {s.retail_role.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {s.role === 'customer' ? 'Owner / Admin Toko' : 'Kasir Toko'}
                      </span>
                    )}
                  </td>
                  <td>
                    {s.status === 'inactive' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Nonaktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Aktif
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {user.id !== s.id ? (
                        <>
                          <button 
                            className="btn btn-sm btn-secondary text-xs flex items-center gap-1 px-2.5 py-1" 
                            onClick={() => handleImpersonate(s.id)}
                            title="Login & Uji Akses sebagai Pegawai Ini"
                          >
                            <LogIn size={13} />
                            <span>Impersonate</span>
                          </button>
                          <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(s)} title="Edit Pegawai"><Edit3 size={14} /></button>
                          <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(s.id)} title="Hapus Akun Pegawai"><Trash2 size={14} /></button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Akun Utama</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
        <RetailPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>

      {/* Form Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? "Edit Akun Pegawai" : "Tambah Pegawai Baru"}>
        {errorMsg && <div style={{ color: 'var(--retail-danger)', marginBottom: 16 }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label font-semibold">Nama Lengkap Pegawai</label>
            <input name="name" className="form-input" defaultValue={editingUser?.name} placeholder="Contoh: Siti Rahmawati" required />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Alamat Email (Digunakan untuk Login Kasir)</label>
            <input name="email" type="email" className="form-input" defaultValue={editingUser?.email} placeholder="kasir1@tokoanda.com" required />
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">Jabatan & Hak Akses</label>
            <select name="retail_role_id" className="form-input" defaultValue={editingUser?.retail_role_id} required>
              <option value="" disabled>-- Pilih Jabatan / Hak Akses --</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <small style={{marginTop: 6, display: 'block', color: 'var(--text-muted)'}}>
              Ingin mengatur izin fitur spesifik? Silakan buka menu <strong>Data Master &gt; Hak Akses</strong>.
            </small>
          </div>
          <div className="form-group">
            <label className="form-label font-semibold">{editingUser ? "Password Baru (Kosongkan bila tidak diubah)" : "Password Awal Pegawai"}</label>
            <input name="password" type="password" className="form-input" placeholder="Minimal 8 karakter" required={!editingUser} />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingUser ? "Simpan Perubahan" : "Simpan & Buat Akun"}</button>
          </div>
        </form>
      </Modal>

      {/* Paywall Modal */}
      <Modal isOpen={showPaywall} onClose={() => setShowPaywall(false)} title="🌟 Batas Kuota Paket Tercapai" maxWidth="480px">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Batas Pegawai Tercapai!</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
            Paket <strong style={{color:'var(--text-primary)'}}>{user?.subscription_plan?.toUpperCase() || 'FREE'}</strong> Anda membatasi maksimal <strong>{user?.subscription_plan === 'free' ? '1 Pegawai (Owner)' : '5 Pegawai'}</strong>. Tingkatkan paket berlangganan Anda ke <strong>Pro</strong> untuk membuka kuota staf tak terbatas dan integrasi multi-cabang.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setShowPaywall(false)}>Tutup</button>
            <a href="/retail/subscription" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Upgrade Paket Langganan
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
