import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Tag,
  Layers,
  ArrowUpDown,
  PackagePlus
} from 'lucide-react';
import { Product, MarketplacePlatform } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface CatalogViewProps {
  products: Product[];
  onAddProductClick: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onRestockClick: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onAddProductClick,
  onEditProduct,
  onDeleteProduct,
  onRestockClick,
}) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="truncate">Katalog Produk Master & Sync Harga</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            Atur SKU Master, HPP modal, serta harga jual khusus Shopee, Tokopedia, & TikTok Shop.
          </p>
        </div>

        <button
          onClick={onAddProductClick}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Produk Master</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Main Catalog Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-700 flex flex-row flex-nowrap whitespace-nowrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 w-full overflow-x-auto">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Produk atau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="Beauty & Skincare">Beauty & Skincare</option>
              <option value="Electronics & Gadget">Electronics & Gadget</option>
              <option value="Fashion & Apparel">Fashion & Apparel</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">PRODUK & SKU MASTER</th>
                <th className="py-3 px-4">HPP (MODAL)</th>
                <th className="py-3 px-4">HARGA MARKTPLACE</th>
                <th className="py-3 px-4">TOTAL STOK</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                          {prod.name}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          SKU: {prod.sku} • {prod.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-extrabold text-slate-700 dark:text-slate-300">
                    {formatIDR(prod.hpp)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-orange-600 bg-orange-50 px-1 rounded">Shopee</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(prod.priceShopee)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">Tokopedia</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(prod.priceTokopedia)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-1 rounded">TikTok</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatIDR(prod.priceTiktok)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100">
                    {prod.totalStock} unit
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      prod.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : prod.status === 'Stok Menipis'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {prod.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onRestockClick(prod)}
                        title="Tambah Stok"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                      >
                        <PackagePlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditProduct(prod)}
                        title="Edit Produk"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod)}
                        title="Hapus Produk"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
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
