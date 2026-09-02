import { useState, useEffect } from 'react';
import '../retail.css';
import { api } from '../../../lib/api';
import Modal from '../../../components/Modal';
import RetailTableLoadingRow from '../components/RetailTableLoadingRow';
import RetailPagination from '../components/RetailPagination';
import usePagination from '../../../hooks/usePagination';
import { Edit3, Trash2, RefreshCw, Plus, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export const GRANULAR_PERMISSION_GROUPS = [
  {
    group: '🛒 Kasir & Transaksi POS',
    permissions: [
      { id: 'pos', label: 'Akses Mesin Kasir POS & Checkout Transaksi' },
      { id: 'pos_transactions', label: 'Lihat Riwayat & Cetak Ulang Struk Kasir' },
      { id: 'pos_void', label: 'Batalkan Transaksi Penjualan (Void Transaksi)' },
      { id: 'pos_shifts', label: 'Buka & Tutup Shift Kasir (Input Saldo Kas)' },
      { id: 'customer_returns', label: 'Proses Retur, Refund & Tukar Barang Pelanggan' },
      { id: 'pos_custom_discount', label: 'Berikan Diskon Manual / Potongan Khusus di Kasir' },
      { id: 'pos_change_price', label: 'Ubah Harga Jual Manual Saat Transaksi' },
      { id: 'pos_credit_sales', label: 'Izinkan Transaksi Kasbon / Piutang Pelanggan' },
    ]
  },
  {
    group: '📦 Katalog & Master Data',
    permissions: [
      { id: 'catalog', label: 'Lihat Katalog Produk & Daftar Harga' },
      { id: 'catalog_create', label: 'Tambah Produk Baru ke Katalog' },
      { id: 'catalog_edit', label: 'Edit Informasi, Foto & Harga Produk' },
      { id: 'catalog_delete', label: 'Hapus Produk dari Sistem' },
      { id: 'categories', label: 'Kelola Kategori Produk & Departemen' },
      { id: 'units', label: 'Kelola Satuan Unit (Pcs, Box, Kg, Liter, dll)' },
      { id: 'suppliers', label: 'Kelola Mitra Supplier & Kontak Pengadaan' },
      { id: 'customers', label: 'Kelola Data Pelanggan & Segmentasi CRM' },
      { id: 'outlets', label: 'Kelola Cabang Toko & Lokasi Gudang' },
      { id: 'discounts', label: 'Atur Program Promo, Diskon & Harga Grosir' },
    ]
  },
  {
    group: '🚚 Logistik & Persediaan Stok',
    permissions: [
      { id: 'inventory', label: 'Monitoring Stok Realtime Semua Produk' },
      { id: 'stock_adjustment', label: 'Penyesuaian Stok Manual (Barang Masuk / Keluar)' },
      { id: 'stock_movements', label: 'Lihat Log Kartu Riwayat Mutasi Stok' },
      { id: 'stock_transfers', label: 'Kirim & Terima Transfer Stok Antar Cabang' },
      { id: 'stock_opname', label: 'Eksekusi & Finalisasi Stock Opname Fisik' },
      { id: 'batches', label: 'Pelacakan Nomor Batch & Tanggal Expired' },
      { id: 'serials', label: 'Pelacakan Nomor Seri / IMEI Perangkat' },
      { id: 'purchasing', label: 'Buat & Kelola Purchase Order (PO) Supplier' },
      { id: 'purchasing_receive', label: 'Terima Barang Masuk dari Purchase Order' },
      { id: 'supplier_returns', label: 'Proses Retur Pembelian Barang ke Supplier' },
      { id: 'print_labels', label: 'Cetak Barcode, QR Code & Label Rak Produk' },
    ]
  },
  {
    group: '💰 Keuangan & Pembukuan',
    permissions: [
      { id: 'finance', label: 'Catat Kas Operasional Harian (Masuk / Keluar)' },
      { id: 'cash_transfers', label: 'Transfer Saldo Antar Rekening Kas & Bank' },
      { id: 'payables', label: 'Manajemen Buku Hutang Supplier & Jadwal Bayar' },
      { id: 'receivables', label: 'Manajemen Buku Piutang Pelanggan & Pelunasan' },
      { id: 'cash_flow', label: 'Laporan Arus Kas (Direct Cash Flow)' },
      { id: 'tax_report', label: 'Rekapitulasi Pajak PPN & Faktur Pajak' },
    ]
  },
  {
    group: '📊 Laporan & Analitik Bisnis',
    permissions: [
      { id: 'reports', label: 'Laporan Ringkasan Omset & Penjualan Harian' },
      { id: 'report_sales_detail', label: 'Laporan Rincian Transaksi per Kasir & Outlet' },
      { id: 'report_margin', label: 'Laporan Margin Keuntungan & Laba Bersih' },
      { id: 'report_products', label: 'Laporan Produk Terlaris, Mati & Slow Moving' },
      { id: 'report_customers', label: 'Analitik Pelanggan (Frekuensi & Nilai Belanja)' },
      { id: 'report_shifts', label: 'Laporan Audit Shift & Rekonsiliasi Kas Kasir' },
      { id: 'report_payments', label: 'Laporan Penjualan per Metode Bayar (Cash/QRIS/EDC)' },
      { id: 'report_export', label: 'Export Seluruh Data Laporan ke File Excel & CSV' },
    ]
  },
  {
    group: '⚙️ Tim, Hak Akses & Pengaturan',
    permissions: [
      { id: 'staff', label: 'Tambah & Kelola Akun Karyawan / Kasir' },
      { id: 'roles', label: 'Atur Jabatan & Struktur Hak Akses Granular' },
      { id: 'settings', label: 'Pengaturan Identitas Toko, Logo & Alamat' },
      { id: 'printer_settings', label: 'Konfigurasi Printer Thermal & Format Footer Struk' },
    ]
  },
];

export const ALL_PERMISSIONS_FLAT = GRANULAR_PERMISSION_GROUPS.flatMap(g => g.permissions);

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
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

  const handleOpenAdd = () => {
    setEditingRole(null);
    setSelectedPerms(['pos', 'pos_transactions']);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setSelectedPerms(Array.isArray(role.permissions) ? role.permissions : []);
    setErrorMsg('');
    setShowModal(true);
  };

  const togglePermission = (permId) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroup = (groupPerms) => {
    const groupIds = groupPerms.map(p => p.id);
    const allSelected = groupIds.every(id => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedPerms(prev => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jabatan ini? Pegawai dengan jabatan ini akan kehilangan hak akses kustom.')) {
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

    const payload = {
      name: formData.get('name'),
      permissions: selectedPerms,
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
    endIndex
  } = usePagination(filteredRoles);

  return (
    <div className="retail-page-classic">
      <div className="card table-wrap animate-fade-in">
        <div className="toolbar-no-stack" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--retail-border, #e2e8f0)' }}>
          <button 
            title="Tambah Jabatan Baru" 
            className="btn btn-primary" 
            style={{ whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, padding: '0 16px' }}
            onClick={handleOpenAdd}
          >
            <Plus size={15} className="mr-2 mobile-no-margin" />
            <span className="btn-text-mobile-hide">Tambah Jabatan Baru</span>
          </button>
          <div className="airy-search-wrapper" style={{ width: 280, margin: 0 }}>
            <input
              placeholder="Cari jabatan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchRoles} className="btn-reset-sync" style={{ width: 42, height: 42, flexShrink: 0 }} title="Segarkan Data">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="retail-table-responsive"><table className="table">
          <thead>
            <tr>
              <th className="pl-6 retail-table-header" style={{ width: '22%' }}>Nama Jabatan</th>
              <th className="retail-table-header" style={{ width: '60%' }}>Cakupan Izin Akses Granular</th>
              <th style={{ width: '18%', textAlign: 'right' }} className="pr-6 retail-table-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <RetailTableLoadingRow colSpan={3} text="Menyinkronkan Jabatan & Hak Akses..." />
            ) : filteredRoles.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Belum ada kustomisasi jabatan.</td></tr>
            ) : (
              paginatedData.map(r => {
                const perms = Array.isArray(r.permissions) ? r.permissions : [];
                return (
                  <tr key={r.id}>
                    <td className="pl-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{r.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {perms.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Tidak ada izin akses</span>}
                        {perms.map(p => {
                          const matched = ALL_PERMISSIONS_FLAT.find(x => x.id === p);
                          return (
                            <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {matched ? matched.label.split('&')[0].trim() : p}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} className="pr-6">
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(r)} title="Edit Izin Jabatan"><Edit3 size={14} /></button>
                        <button className="btn btn-sm btn-ghost retail-text-danger" onClick={() => handleDelete(r.id)} title="Hapus Jabatan"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Modal Dialog Form */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingRole ? `Edit Izin: ${editingRole.name}` : "Tambah Jabatan & Hak Akses"}
        maxWidth="740px"
      >
        {errorMsg && <div style={{ color: 'var(--retail-danger)', marginBottom: 16 }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Nama Jabatan / Role</label>
            <input 
              name="name" 
              className="form-input" 
              defaultValue={editingRole?.name} 
              placeholder="Contoh: Kepala Gudang, Kasir Senior, Supervisor Keuangan..." 
              required 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="form-label font-semibold m-0">Pengaturan Hak Akses Fitur (Granular Permissions)</label>
              <div className="flex gap-2 text-xs">
                <button 
                  type="button" 
                  className="text-indigo-600 hover:underline"
                  onClick={() => setSelectedPerms(ALL_PERMISSIONS_FLAT.map(p => p.id))}
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  type="button" 
                  className="text-slate-500 hover:underline"
                  onClick={() => setSelectedPerms([])}
                >
                  Batal Semua
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
              {GRANULAR_PERMISSION_GROUPS.map((group) => {
                const groupIds = group.permissions.map(p => p.id);
                const allSelected = groupIds.every(id => selectedPerms.includes(id));
                const someSelected = groupIds.some(id => selectedPerms.includes(id));

                return (
                  <div key={group.group} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-2.5 pb-2 border-b border-slate-200/60"
                      onClick={() => toggleGroup(group.permissions)}
                    >
                      <span className="font-semibold text-slate-800 text-[13px]">{group.group}</span>
                      <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                        {allSelected ? <CheckSquare size={14} /> : someSelected ? <Square size={14} className="text-slate-400" /> : <Square size={14} className="text-slate-300" />}
                        {allSelected ? 'Semua Aktif' : 'Pilih Grup Ini'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map((perm) => {
                        const isChecked = selectedPerms.includes(perm.id);
                        return (
                          <label 
                            key={perm.id} 
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                              isChecked ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              className="mt-0.5 accent-indigo-600 rounded"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <span>{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal__actions mt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editingRole ? "Simpan Perubahan" : "Buat Jabatan Baru"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
