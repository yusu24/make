import React, { useState, useEffect } from 'react';
import '../retail.css';
import usePagination from '../../../hooks/usePagination';
import RetailPagination from '../components/RetailPagination';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import { Edit3, Trash2, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function Staff() {
  const { user } = useAuth();
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
    try {
      const res = await api.get('/retail/staff');
      setStaff(res.data);
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
        setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan');
      }
    }
  };

  const handleEdit = (userItem) => {
    setEditingUser(userItem);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus akun pegawai ini?')) {
      try {
        await api.delete(`/retail/staff/${id}`);
        fetchStaff();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus');
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

  return (
    <div className="animate-fade-in">


      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => { setEditingUser(null); setErrorMsg(''); setShowModal(true); }}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Pegawai</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari pegawai..."
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
                <th className="pl-6 retail-table-header">Nama</th>
                <th className="retail-table-header">Email / Username</th>
                <th className="retail-table-header">Role System</th>
                <th style={{ textAlign: 'right' }} className="pr-6 retail-table-header">Aksi</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
               <RetailTableLoadingRow colSpan={4} text="Menyinkronkan Data Pegawai..." />
            ) : filteredStaff.length === 0 ? (
               <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>Belum ada data pegawai.</td></tr>
            ) : (
              paginatedData.map((s) => (
                <tr key={s.id}>
                  <td className="pl-6">
                    <div className="retail-text-primary">{s.name}</div>
                    {user.id === s.id && <span className="retail-badge retail-badge-primary">Anda (Pemilik)</span>}
                  </td>
                  <td className="retail-text-primary">{s.email}</td>
                  <td>
                    {s.retail_role ? (
                      <span className="retail-badge retail-badge-primary">{s.retail_role.name}</span>
                    ) : (
                      <span className={`retail-badge ${s.role === 'customer' ? 'retail-badge-primary' : 'retail-badge-primary'}`}>
                        {s.role === 'customer' ? 'Admin Toko' : 'Kasir (Default)'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    {user.id !== s.id && (
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(s)}><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                      </div>
                    )}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? "Edit Pegawai" : "Tambah Pegawai"}>
        {errorMsg && <div style={{ color: 'var(--retail-danger)', marginBottom: 16 }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input name="name" className="form-input" defaultValue={editingUser?.name} required />
          </div>
          <div className="form-group">
            <label className="form-label">Alamat Email (Digunakan untuk Login)</label>
            <input name="email" type="email" className="form-input" defaultValue={editingUser?.email} required />
          </div>
          <div className="form-group">
            <label className="form-label">Jabatan (Hak Akses)</label>
            <select name="retail_role_id" className="form-input" defaultValue={editingUser?.retail_role_id} required>
              <option value="" disabled>-- Pilih Jabatan --</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <small style={{marginTop: 4, display: 'block', color: 'var(--text-muted)'}}>
              Ingin membuat jabatan baru? Silakan ke menu <strong>Data Master &gt; Hak Akses</strong>.
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">{editingUser ? "Password Baru (Opsional)" : "Password"}</label>
            <input name="password" type="password" className="form-input" required={!editingUser} />
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingUser ? "Simpan Perubahan" : "Simpan Pegawai"}</button>
          </div>
        </form>
      </Modal>

      {/* Paywall Modal */}
      <Modal isOpen={showPaywall} onClose={() => setShowPaywall(false)} title="🌟 Upgrade ke Pro" maxWidth="450px">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Batas Pegawai Tercapai!</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 24 }}>
            Paket <strong style={{color:'var(--text-primary)'}}>Free</strong> Anda membatasi maksimal hanya <strong>4 Pengguna</strong> per toko. Tingkatkan paket berlangganan Anda ke Basic atau Pro untuk membuka kuota staf tak terbatas dan fitur superior lainnya.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setShowPaywall(false)}>Nanti Saja</button>
            <button className="btn btn-primary" onClick={() => alert("Fitur Integrasi Pembayaran Langganan (Xendit/Midtrans) akan ditambahkan di fase berikutnya.")} style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', border: 'none' }}>
              Lihat Paket Upgrade
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
