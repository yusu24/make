import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Link2,
  Link2Off,
  RefreshCw,
  X,
  Check,
  Edit2,
  Plus
} from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface MappingItem {
  id: string;
  sku: string;
  name: string;
  shopee: 'mapped' | 'unmapped' | 'conflict';
  toped: 'mapped' | 'unmapped' | 'conflict';
  tiktok: 'mapped' | 'unmapped' | 'conflict';
  lazada: 'mapped' | 'unmapped' | 'conflict';
  shopeeSku?: string;
  topedSku?: string;
  tiktokSku?: string;
  lazadaSku?: string;
}

const INITIAL_MAPPING_DATA: MappingItem[] = [
  { id: '1', sku: 'GLOW-SERUM-30', name: 'GlowUp Vitamin C Brightening Serum 30ml', shopee: 'mapped', toped: 'mapped', tiktok: 'mapped', lazada: 'mapped', shopeeSku: 'SHP-GLOW-30', topedSku: 'TKP-GLOW-30', tiktokSku: 'TT-GLOW-30', lazadaSku: 'LZD-GLOW-30' },
  { id: '2', sku: 'GLOW-SUNSCREEN-50', name: 'GlowUp UV Shield Sunscreen SPF 50 PA++++', shopee: 'mapped', toped: 'conflict', tiktok: 'unmapped', lazada: 'mapped', shopeeSku: 'SHP-SUN-50', topedSku: 'TKP-SUN-50-DIFF', lazadaSku: 'LZD-SUN-50' },
  { id: '3', sku: 'TZ-HEADSET-PRO', name: 'TechZone Noise Cancelling Wireless Headset Pro', shopee: 'mapped', toped: 'mapped', tiktok: 'mapped', lazada: 'mapped', shopeeSku: 'SHP-HEADSET-PRO', topedSku: 'TKP-HEADSET-PRO', tiktokSku: 'TT-HEADSET-PRO', lazadaSku: 'LZD-HEADSET-PRO' },
  { id: '4', sku: 'ST-OVERSIZE-TEE', name: 'StyleStudio Oversized Heavy Cotton T-Shirt', shopee: 'unmapped', toped: 'unmapped', tiktok: 'mapped', lazada: 'unmapped', tiktokSku: 'TT-TEE-OS' },
  { id: '5', sku: 'TZ-POWERBANK-20K', name: 'TechZone Fast Charge Powerbank 20.000mAh 65W', shopee: 'mapped', toped: 'mapped', tiktok: 'conflict', lazada: 'mapped', shopeeSku: 'SHP-PB-20K', topedSku: 'TKP-PB-20K', tiktokSku: 'TT-PB-MISMATCH', lazadaSku: 'LZD-PB-20K' },
  { id: '6', sku: 'GLOW-CLEANSER-100', name: 'GlowUp Gentle Hydrating Facial Cleanser 100ml', shopee: 'mapped', toped: 'mapped', tiktok: 'unmapped', lazada: 'unmapped', shopeeSku: 'SHP-CLN-100', topedSku: 'TKP-CLN-100' },
  { id: '7', sku: 'ST-DENIM-JACKET', name: 'StyleStudio Vintage Oversized Denim Jacket', shopee: 'unmapped', toped: 'mapped', tiktok: 'mapped', lazada: 'unmapped', topedSku: 'TKP-JACKET-DNM', tiktokSku: 'TT-JACKET-DNM' },
  { id: '8', sku: 'TZ-CABLE-TYPEC', name: 'TechZone Braided Fast Charging Cable Type-C 2M', shopee: 'mapped', toped: 'mapped', tiktok: 'mapped', lazada: 'mapped', shopeeSku: 'SHP-CBL-TC', topedSku: 'TKP-CBL-TC', tiktokSku: 'TT-CBL-TC', lazadaSku: 'LZD-CBL-TC' },
];

export const ProductMappingView: React.FC = () => {
  const [items, setItems] = useState<MappingItem[]>(INITIAL_MAPPING_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<MappingItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    shopee: 'mapped',
    toped: 'mapped',
    tiktok: 'mapped',
    lazada: 'mapped',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto Map Handler
  const handleAutoMap = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        shopee: 'mapped',
        toped: 'mapped',
        tiktok: 'mapped',
        lazada: 'mapped',
      }))
    );
    showToast('Auto Mapping Berhasil! Semua SKU produk lokal cocok dengan SKU marketplace.');
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const matchesSearch =
        it.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'mapped' && [it.shopee, it.toped, it.tiktok, it.lazada].every((s) => s === 'mapped')) ||
        (selectedStatus === 'unmapped' && [it.shopee, it.toped, it.tiktok, it.lazada].some((s) => s === 'unmapped')) ||
        (selectedStatus === 'conflict' && [it.shopee, it.toped, it.tiktok, it.lazada].some((s) => s === 'conflict'));

      const matchesPlatform =
        selectedPlatform === 'all' ||
        (selectedPlatform === 'shopee' && it.shopee === 'mapped') ||
        (selectedPlatform === 'toped' && it.toped === 'mapped') ||
        (selectedPlatform === 'tiktok' && it.tiktok === 'mapped') ||
        (selectedPlatform === 'lazada' && it.lazada === 'mapped');

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [items, searchTerm, selectedStatus, selectedPlatform]);

  // Use Official Pagination Hook
  const {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setCurrentPage,
  } = usePagination(filteredItems);

  // Edit Mapping Modal Handlers
  const handleOpenEdit = (item: MappingItem) => {
    setSelectedItemForEdit(item);
    setEditFormData({
      shopee: item.shopee,
      toped: item.toped,
      tiktok: item.tiktok,
      lazada: item.lazada,
    });
  };

  const handleSaveMapping = () => {
    if (!selectedItemForEdit) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedItemForEdit.id
          ? {
              ...it,
              shopee: editFormData.shopee as any,
              toped: editFormData.toped as any,
              tiktok: editFormData.tiktok as any,
              lazada: editFormData.lazada as any,
            }
          : it
      )
    );
    setSelectedItemForEdit(null);
    showToast(`Mapping produk ${selectedItemForEdit.sku} berhasil diperbarui.`);
  };

  // Calculate Summary Metrics
  const totalMapped = useMemo(() => {
    return items.filter((it) => [it.shopee, it.toped, it.tiktok, it.lazada].every((s) => s === 'mapped')).length;
  }, [items]);

  const totalUnmappedOrConflict = useMemo(() => {
    return items.length - totalMapped;
  }, [items, totalMapped]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="truncate">Product Mapping</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Hubungkan produk lokal Bizora dengan produk di marketplace.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleAutoMap}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-semibold rounded-xl border border-purple-200/60 dark:border-purple-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 shadow-xs transition-all text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auto Map (By SKU)</span>
          </button>
          <button
            onClick={() => handleOpenEdit(items[0])}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all text-xs cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Mapping Manual</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Total Produk Katalog
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {items.length} Produk
            </h4>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/40">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-1">
              Ter-mapping Sempurna
            </p>
            <h4 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalMapped} SKU
            </h4>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider mb-1">
              Unmapped / Konflik
            </p>
            <h4 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {totalUnmappedOrConflict} SKU
            </h4>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800/40">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan SKU atau nama produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status Mapping</option>
              <option value="mapped">Ter-mapping Sempurna</option>
              <option value="unmapped">Belum Terhubung (Unmapped)</option>
              <option value="conflict">Konflik SKU / Harga</option>
            </select>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Marketplace</option>
              <option value="shopee">Shopee</option>
              <option value="toped">Tokopedia</option>
              <option value="tiktok">TikTok Shop</option>
              <option value="lazada">Lazada</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">PRODUK BIZORA & SKU</th>
                <th className="py-3 px-4 text-center">SHOPEE</th>
                <th className="py-3 px-4 text-center">TOKOPEDIA</th>
                <th className="py-3 px-4 text-center">TIKTOK SHOP</th>
                <th className="py-3 px-4 text-center">LAZADA</th>
                <th className="py-3 px-4 text-center">AKSI MAPPING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Tidak ada data mapping ditemukan
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {row.sku}
                      </p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {row.name}
                      </p>
                    </td>

                    {(['shopee', 'toped', 'tiktok', 'lazada'] as const).map((plat) => {
                      const status = row[plat];
                      return (
                        <td key={plat} className="py-3.5 px-4 text-center">
                          <div className="flex justify-center">
                            {status === 'mapped' ? (
                              <div
                                className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400"
                                title="Ter-mapping"
                              >
                                <Link2 className="w-4 h-4" />
                              </div>
                            ) : status === 'conflict' ? (
                              <div
                                className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400"
                                title="Konflik SKU"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400"
                                title="Belum Ter-mapping"
                              >
                                <Link2Off className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(row)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold text-xs transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Mapping</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Standardized Pagination matching CatalogView */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Interactive Manual Mapping Edit Modal */}
      {selectedItemForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Mapping SKU Produk
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForEdit(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <p className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                SKU Master: {selectedItemForEdit.sku}
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {selectedItemForEdit.name}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Atur Status Hubungan Marketplace:
              </p>

              {(['shopee', 'toped', 'tiktok', 'lazada'] as const).map((plat) => {
                const labelMap = { shopee: 'Shopee', toped: 'Tokopedia', tiktok: 'TikTok Shop', lazada: 'Lazada' };
                return (
                  <div key={plat} className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {labelMap[plat]}
                    </span>
                    <select
                      value={editFormData[plat]}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          [plat]: e.target.value as any,
                        }))
                      }
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="mapped">Ter-mapping (Mapped)</option>
                      <option value="unmapped">Belum Terhubung (Unmapped)</option>
                      <option value="conflict">Konflik SKU</option>
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedItemForEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveMapping}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
