import React, { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, X } from '@/constants/icons';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface CustomerRow {
  id: number;
  name: string;
  contact: string | null;
  email: string | null;
  address: string | null;
}

export const CustomerView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerRow | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    api.get('/retail/customers')
      .then((res) => setCustomers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { paginatedItems: paginatedCustomers, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(filteredCustomers);

  const openAdd = () => {
    setCustomerToEdit(null);
    setName('');
    setContact('');
    setEmail('');
    setAddress('');
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (c: CustomerRow) => {
    setCustomerToEdit(c);
    setName(c.name);
    setContact(c.contact || '');
    setEmail(c.email || '');
    setAddress(c.address || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { name, contact: contact || null, email: email || null, address: address || null };
      if (customerToEdit) {
        await api.put(`/retail/customers/${customerToEdit.id}`, payload);
      } else {
        await api.post('/retail/customers', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.errors?.name?.[0] || err.response?.data?.errors?.email?.[0] || 'Gagal menyimpan pelanggan.');
    }
  };

  const handleDelete = async (c: CustomerRow) => {
    if (!confirm(`Hapus pelanggan "${c.name}"?`)) return;
    try {
      await api.delete(`/retail/customers/${c.id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pelanggan.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Cari nama, kontak, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 h-[38px] px-3.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />

          <button
            onClick={openAdd}
            className="shrink-0 px-4 h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Pelanggan</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/70 dark:bg-slate-800/80 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 pl-6">Nama Pelanggan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-[13px] text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Memuat...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                  {customers.length === 0 ? 'Belum ada pelanggan. Klik "Tambah Pelanggan" untuk menambahkan.' : 'Tidak ada pelanggan yang cocok dengan pencarian.'}
                </td></tr>
              ) : (
                paginatedCustomers.map((cus) => (
                  <tr key={cus.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3.5 px-4 pl-6 font-semibold text-slate-900 dark:text-slate-100">{cus.name}</td>
                    <td className="py-3.5 px-4">{cus.contact || '-'}</td>
                    <td className="py-3.5 px-4">{cus.email || '-'}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{cus.address || '-'}</td>
                    <td className="py-3.5 px-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cus)}
                          title="Edit Pelanggan"
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cus)}
                          title="Hapus Pelanggan"
                          className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredCustomers.length > 0 && (
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {customerToEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium">{error}</div>}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pelanggan</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kontak (Telepon/WA)</label>
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
