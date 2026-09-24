import React, { useState } from 'react';
import { Package, Search, AlertTriangle, Plus, Pencil, Trash2, AlertCircle } from '@/constants/icons';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { JasaSparepart } from '../types';
import { InventoryFormModal } from './InventoryFormModal';
import { jasaApi } from '../services/jasaApi';

interface InventoryViewProps {
  inventory: JasaSparepart[];
  settings: any;
  onRefresh: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory, settings, onRefresh }) => {
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<JasaSparepart | null>(null);
  
  // Toast State
  const [toasts, setToasts] = useState<Array<{id: string, type: 'success'|'error', title: string, message: string}>>([]);

  const addToast = (type: 'success'|'error', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const filteredInventory = inventory.filter(item => 
    !search || 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.item_code.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredInventory, 10);

  const handleEdit = (item: JasaSparepart) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: JasaSparepart) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
      try {
        await jasaApi.deleteInventory(item.id);
        addToast('success', 'Dihapus', `${item.name} berhasil dihapus dari sistem.`);
        onRefresh();
      } catch (err) {
        addToast('error', 'Gagal', 'Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <div className={`mt-0.5 ${toast.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${toast.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {toast.title}
              </h4>
              <p className={`text-sm ${toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Controls (Universal Height 38px) */}
      <div className="flex flex-row justify-between gap-3 items-center bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs w-full overflow-x-auto scrollbar-none">
        <div className="relative flex-1 max-w-md min-w-[200px] h-[38px] flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama barang, kode, kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 outline-none bg-transparent placeholder:text-slate-400 font-normal"
          />
        </div>

        <button
          onClick={handleAdd}
          className="h-[38px] flex shrink-0 items-center justify-center gap-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah Sparepart</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11.5px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Info Barang</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Satuan</th>
                <th className="py-3 px-4 text-center">Stok Tersedia</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.item_code}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10.5px] font-semibold border border-slate-200/80">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{formatRupiah(item.price)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">per {item.unit}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-slate-900 text-sm">{item.stock}</span>
                    <span className="text-slate-500 text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {item.stock > item.min_stock_alert ? (
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10.5px] font-semibold rounded-md border border-emerald-200">
                        Aman
                      </span>
                    ) : item.stock > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-[10.5px] font-semibold rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 text-rose-700 text-[10.5px] font-semibold rounded-md border border-rose-200">
                        Kosong
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Edit Barang"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Barang"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900">Belum ada data barang/sparepart</p>
                    <p className="text-xs text-slate-500 mt-1">Tambahkan sparepart atau ubah kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredInventory.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredInventory.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>

      <InventoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sparepart={selectedItem}
        settings={settings}
        onSuccess={onRefresh}
        addToast={addToast}
      />
    </div>
  );
};
