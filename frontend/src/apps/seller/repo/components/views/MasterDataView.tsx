import React, { useState, useEffect } from 'react';
import { Database, Plus, Edit2, Trash2, X, Truck } from 'lucide-react';
import api from '../../../../../services/api';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface MasterDataViewProps {
  // stores: StoreChannel[]; // unused but keeping interface for stability if passed from above
}

interface SupplierRow {
  id: number;
  name: string;
  contact: string | null;
  address: string | null;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ stores }) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<SupplierRow | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');

  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    api.get('/retail/suppliers')
      .then((res) => setSuppliers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSuppliers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const { paginatedItems: paginatedSuppliers, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(suppliers);

  const openAddSupplier = () => {
    setSupplierToEdit(null);
    setSupplierName('');
    setSupplierContact('');
    setSupplierAddress('');
    setError('');
    setIsSupplierModalOpen(true);
  };

  const openEditSupplier = (s: SupplierRow) => {
    setSupplierToEdit(s);
    setSupplierName(s.name);
    setSupplierContact(s.contact || '');
    setSupplierAddress(s.address || '');
    setError('');
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (supplierToEdit) {
        await api.put(`/retail/suppliers/${supplierToEdit.id}`, { name: supplierName, contact: supplierContact, address: supplierAddress });
      } else {
        await api.post('/retail/suppliers', { name: supplierName, contact: supplierContact, address: supplierAddress });
      }
      setIsSupplierModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan supplier.');
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm('Hapus supplier ini?')) return;
    try {
      await api.delete(`/retail/suppliers/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus supplier.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Supplier Section */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{i18n?.language === 'en' ? 'Supplier Database & Factory Vendors' : 'Database Supplier & Pabrik Vendor'}</span>
          </h2>
        </div>
        <button
          onClick={openAddSupplier}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{i18n?.language === 'en' ? 'Add Supplier' : 'Tambah Supplier'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden -mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'Supplier / Vendor Name' : 'Nama Supplier / Vendor'}</th>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'Contact' : 'Kontak'}</th>
                <th className="px-4 py-3 font-semibold">{i18n?.language === 'en' ? 'Address' : 'Alamat'}</th>
                <th className="px-4 py-3 font-semibold text-right">{i18n?.language === 'en' ? 'Action' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : suppliers.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada supplier. Klik "Tambah Supplier" untuk menambahkan.</td></tr>
              ) : (
                paginatedSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{sup.name}</td>
                    <td className="px-4 py-3">{sup.contact || '-'}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{sup.address || '-'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEditSupplier(sup)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSupplier(sup)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && suppliers.length > 0 && (
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

      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {supplierToEdit ? 'Edit Supplier' : 'Tambah Supplier Baru'}
              </h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3 text-xs">
              {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium">{error}</div>}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Supplier</label>
                <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kontak (Telepon/WA)</label>
                <input type="text" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                <textarea rows={2} value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium" />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
