import React, { useState, useEffect } from 'react';
import { X, Package, Upload, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import api from '../../../../../services/api';

interface CategoryOption {
  id: number;
  name: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (data: {
    sku: string;
    name: string;
    unit: string;
    categoryId: string;
    hpp: number;
    priceSell: number;
    stockMin: number;
    totalStock?: number;
  }, idToEdit?: string) => void;
  productToEdit?: Product | null;
  onImageUploaded?: (productId: string, imagePath: string) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  productToEdit,
  onImageUploaded,
}) => {
  const isEdit = !!productToEdit;
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [categoryId, setCategoryId] = useState('');
  const [hpp, setHpp] = useState('');
  const [priceSell, setPriceSell] = useState('');
  const [stockMin, setStockMin] = useState('5');
  const [totalStock, setTotalStock] = useState('0');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.get('/retail/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setUnit(productToEdit.unit || 'Pcs');
      setCategoryId(productToEdit.categoryId || '');
      setHpp(productToEdit.hpp.toString());
      setPriceSell(productToEdit.priceShopee.toString());
      setStockMin(productToEdit.stockMin.toString());
      setImageUrl(productToEdit.rawImageUrl);
    } else {
      setSku('');
      setName('');
      setUnit('Pcs');
      setCategoryId('');
      setHpp('');
      setPriceSell('');
      setStockMin('5');
      setTotalStock('0');
      setImageUrl(null);
    }
  }, [productToEdit, isOpen]);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productToEdit) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post(`/retail/products/${productToEdit.id}/image`, formData, {
        headers: { 'Content-Type': undefined },
      });
      setImageUrl(res.data.image_url);
      onImageUploaded?.(productToEdit.id, res.data.image_url);
    } catch (err) {
      console.error('Failed to upload product image', err);
      alert('Gagal mengunggah foto produk.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!productToEdit) return;
    try {
      await api.delete(`/retail/products/${productToEdit.id}/image`);
      setImageUrl(null);
      onImageUploaded?.(productToEdit.id, '');
    } catch (err) {
      console.error('Failed to remove product image', err);
      alert('Gagal menghapus foto produk.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    onSaveProduct(
      {
        sku,
        name,
        unit,
        categoryId,
        hpp: Number(hpp) || 0,
        priceSell: Number(priceSell) || 0,
        stockMin: Number(stockMin) || 0,
        ...(isEdit ? {} : { totalStock: Number(totalStock) || 0 }),
      },
      productToEdit ? productToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs overflow-y-auto">
          {isEdit && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Foto Produk</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer inline-flex items-center gap-1.5 w-fit">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage ? 'Mengunggah...' : imageUrl ? 'Ganti Foto' : 'Unggah Foto'}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUploadImage} disabled={uploadingImage} />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold inline-flex items-center gap-1.5 w-fit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode SKU</label>
            <input
              type="text"
              placeholder="SKU-001"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Produk</label>
            <input
              type="text"
              placeholder="Contoh: Kaos Polos Hitam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
              <input
                type="text"
                placeholder="Pcs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">HPP / Modal (Rp)</label>
              <input
                type="number"
                placeholder="35000"
                value={hpp}
                onChange={(e) => setHpp(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                placeholder="50000"
                value={priceSell}
                onChange={(e) => setPriceSell(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!isEdit && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
                <input
                  type="number"
                  placeholder="0"
                  value={totalStock}
                  onChange={(e) => setTotalStock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
            )}
            <div className={isEdit ? 'col-span-2' : ''}>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Minimum (Peringatan)</label>
              <input
                type="number"
                placeholder="5"
                value={stockMin}
                onChange={(e) => setStockMin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
          </div>
          {isEdit && (
            <p className="text-[10px] text-slate-400">
              Untuk menambah/mengurangi stok, gunakan tombol "Stok" di daftar produk — bukan di sini, supaya riwayat mutasi stok tetap tercatat.
            </p>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md"
            >
              {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
