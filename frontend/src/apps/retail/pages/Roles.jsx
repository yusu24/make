import { useState, useEffect } from 'react';
import '../retail.css';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import RetailPagination from '../components/RetailPagination';
import usePagination from '../../../hooks/usePagination';
import { Edit3, Trash2, RefreshCw, Plus } from 'lucide-react';

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

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/retail/roles');
      setRoles(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowModal(true);
    setErrorMsg('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jabatan ini?')) {
      try {
        await api.delete(`/retail/roles/${id}`);
        fetchRoles();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus role');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const formData = new FormData(e.target);

    const permissions = [];
    MODULE_PERMISSIONS.forEach(perm => {
      if (formData.get(`perm_${perm.id}`) === 'on') {
        permissions.push(perm.id);
      }
    });

    const payload = {
      name: formData.get('name'),
      permissions,
    };

    try {
      if (editingRole) {
        await api.put(`/retail/roles/${editingRole.id}`, payload);
      } else {
        await api.post('/retail/roles', payload);
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    }
  };

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
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
    endIndex,
  } = usePagination(filteredRoles);

  return (
    <div className="animate-fade-in">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={() => { setEditingRole(null); setShowModal(true); setErrorMsg(''); }}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Jabatan Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ flex: 1, margin: 0 }}>
            <input
              placeholder="Cari jabatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header" style={{ width: '25%' }}>Nama Jabatan</th>
              <th className="retail-table-header" style={{ width: '55%' }}>Izin Akses Fitur</th>
              <th style={{ width: '20%', textAlign: 'right' }} className="pr-6 retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={3} text="Menyinkronkan Jabatan..." />
            ) : filteredRoles.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: 20 }}>Belum ada kustomisasi jabatan.</td></tr>
            ) : (
              paginatedData.map(r => (
                <tr key={r.id}>
                  <td className="pl-6">
                    <span className="retail-text-primary">{r.name}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(!r.permissions || r.permissions.length === 0) && <span style={{ color: 'var(--text-muted)' }}>Tidak ada akses</span>}
                      {r.permissions?.map(p => {
                        const m = MODULE_PERMISSIONS.find(x => x.id === p);
                        return <span key={p} className="retail-badge retail-badge-primary" style={{ fontSize: 10 }}>{m ? m.label : p}</span>;
                      })}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }} className="pr-6">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(r)} title="Edit"><Edit3 size={14} /></button>
                      <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(r.id)} title="Hapus"><Trash2 size={14} /></button>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRole ? 'Edit Jabatan' : 'Tambah Jabatan Baru'} maxWidth="600px">
        {errorMsg && <div style={{ color: 'var(--retail-danger)', marginBottom: 16 }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Nama Jabatan</label>
            <input name="name" className="form-input" defaultValue={editingRole?.name} required placeholder="Contoh: Manajer Gudang, Kasir Shift Pagi" />
          </div>

          <div className="form-group">
            <label className="form-label">Izin Akses Fitur</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
              {MODULE_PERMISSIONS.map(perm => (
                <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name={`perm_${perm.id}`}
                    defaultChecked={editingRole && editingRole.permissions?.includes(perm.id)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 8 }}>Centang modul apa saja yang boleh dibuka oleh jabatan ini.</small>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingRole ? 'Simpan Perubahan' : 'Buat Jabatan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
