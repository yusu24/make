import React, { useState } from 'react';
import { Package, Plus, Search, Pencil, Trash2, AlertCircle, Tag, Layers, ArrowUpDown, PackagePlus, FileSpreadsheet, Download, Upload } from '@/constants/icons';
import { Product, MarketplacePlatform } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { exportToCsv } from '../../utils/excelExport';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface CatalogViewProps {
  products: Product[];
  onAddProductClick: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onRestockClick: (product: Product) => void;
  onOpenImportModal?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onAddProductClick,
  onEditProduct,
  onDeleteProduct,
  onRestockClick,
  onOpenImportModal,
}) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const { paginatedItems: paginatedProducts, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(filteredProducts);

  const handleExportExcel = () => {
    const headers = [
      'SKU Master',
      'Nama Produk',
      'Kategori',
      'HPP Modal (Rp)',
      'Harga Tokopedia (Rp)',
      'Harga Shopee (Rp)',
      'Harga TikTok (Rp)',
      'Total Stok',
      'Status',
    ];
    const rows = filteredProducts.map((p) => [
      p.sku,
      p.name,
      p.category,
      p.costPrice,
      p.tokopediaPrice,
      p.shopeePrice,
      p.tiktokPrice,
      p.totalStock,
      p.status,
    ]);
    exportToCsv('Katalog_Produk_Bizora_Seller', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Main Catalog Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        {/* Search, Filter & Actions Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 w-full">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
            <div className="w-full sm:w-72 relative h-[38px] flex items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 shadow-xs">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder={t('seller.searchProduct')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs text-slate-800 dark:text-slate-100 outline-none bg-transparent placeholder:text-slate-400 font-normal"
              />
            </div>

            <div className="flex items-center gap-2 h-[38px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-full px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="all">{t('seller.allCategories')}</option>
                <option value="Beauty & Skincare">Beauty & Skincare</option>
                <option value="Electronics & Gadget">Electronics & Gadget</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={onOpenImportModal}
              className="h-[38px] px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Import Produk Awal via Excel/CSV"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">{t('seller.importExcel')}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="h-[38px] px-3.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export Katalog ke Excel/CSV"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{t('seller.exportExcel')}</span>
            </button>

            <button
              onClick={onAddProductClick}
              className="h-[38px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('seller.addProduct')}</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/80 text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-6">{t('seller.sku')}</th>
                <th className="py-3 px-4">{t('seller.costPrice')}</th>
                <th className="py-3 px-4">HARGA MARKETPLACE</th>
                <th className="py-3 px-4">{t('seller.totalStock')}</th>
                <th className="py-3 px-4">{t('seller.status')}</th>
                <th className="py-3 px-6 text-right">{t('seller.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-[13.5px]">
              {paginatedProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                      <div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                          {prod.name}
                        </div>
                        <div className="font-mono text-xs text-slate-400 mt-0.5">
                          SKU: {prod.sku} • {prod.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                    {formatIDR(prod.hpp)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/50 px-1.5 py-0.5 rounded text-[11px]">Shopee</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(prod.priceShopee)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded text-[11px]">Tokopedia</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(prod.priceTokopedia)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">TikTok</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(prod.priceTiktok)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-black text-sm text-slate-900 dark:text-slate-100">
                    {prod.totalStock} unit
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      prod.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : prod.status === 'Stok Menipis'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                    }`}>
                      {prod.status === 'Aktif' ? (i18n?.language === 'en' ? 'Active' : 'Stok Aman') : prod.status === 'Stok Menipis' ? t('seller.statusStockLow') : t('seller.statusStockOut')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onRestockClick(prod)}
                        title="Tambah Stok"
                        className="w-7 h-7 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditProduct(prod)}
                        title="Edit Produk"
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod)}
                        title="Hapus Produk"
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
