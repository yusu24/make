import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  ShieldCheck, 
  Wrench,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { ServiceCatalogItem, ServiceCategory } from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { ServiceCatalogFormModal } from './ServiceCatalogFormModal';
import { jasaApi } from '../services/jasaApi';

interface ServiceCatalogViewProps {
  catalog: ServiceCatalogItem[];
  settings: any;
  onRefresh: () => void;
  onSelectCatalogForSpk: (item: ServiceCatalogItem) => void;
}

export const ServiceCatalogView: React.FC<ServiceCatalogViewProps> = ({
  catalog,
  settings,
  onRefresh,
  onSelectCatalogForSpk
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceCatalogItem | null>(null);

  // Derive unique categories from current data + standard
  const uniqueCategories = Array.from(new Set([
    ...(settings?.service_categories || []),
    ...catalog.map(c => c.category)
  ])).filter(Boolean);
  if (uniqueCategories.length === 0) {
    uniqueCategories.push('Umum'); // fallback category
  }

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = 
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCat === 'Semua' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredCatalog, 10);

  const handleSaveItem = async (payload: any) => {
    if (editingItem) {
      await jasaApi.updateService(editingItem.id, payload);
    } else {
      await jasaApi.storeService(payload);
    }
    onRefresh();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      await jasaApi.deleteService(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode atau nama layanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-xs"
              />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value as any)}
              aria-label="Filter kategori layanan"
              className="bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer max-w-[200px] sm:max-w-xs"
            >
              <option value="Semua">Semua Kategori</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowFormModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/25 transition-all whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Tambah Layanan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode & Nama Layanan</th>
                <th className="py-3 px-4">Kategori & Kualifikasi</th>
                <th className="py-3 px-4">Ruang Lingkup & Material</th>
                <th className="py-3 px-4">Estimasi SLA</th>
                <th className="py-3 px-4 text-right">Tarif Standar</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Belum ada data Master Layanan.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan klik Tambah Layanan untuk memulai.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: ServiceCatalogItem) => (
                  <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <div className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/80 inline-block mb-1">
                        {item.code}
                      </div>
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {item.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-indigo-700 text-[11px] mb-1">
                        {item.category}
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/70">
                        Level: {item.requiredSkillLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[280px]">
                      <p className="text-slate-600 truncate text-[11px]">
                        {item.description}
                      </p>
                      {Array.isArray(item.recommendedParts) && item.recommendedParts.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 truncate">
                          <Wrench className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.recommendedParts.join(', ')}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-800 font-semibold text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                        <span>{item.estimatedDurationHours} Jam</span>
                      </div>
                      <div className="flex items-center text-emerald-700 font-semibold text-xs mt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                        <span>Garansi {item.warrantyDays} Hari</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-sm">
                        {formatRupiah(item.basePrice)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Tarif Dasar</div>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onSelectCatalogForSpk(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
                          title="Pilih ke SPK"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowFormModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors"
                          title="Edit Layanan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-colors"
                          title="Hapus Layanan"
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

        {filteredCatalog.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredCatalog.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>

      {showFormModal && (
        <ServiceCatalogFormModal
          catalogItem={editingItem}
          settings={settings}
          onClose={() => {
            setShowFormModal(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};
