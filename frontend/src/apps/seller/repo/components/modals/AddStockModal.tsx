import React, { useState, useEffect } from 'react';
import { X, PackagePlus } from 'lucide-react';
import { Product } from '../../types';
import api from '../../../../../services/api';

interface SupplierOption {
  id: number;
  name: string;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaved: (productId: string, qtyAdded: number) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, product, onSaved }) => {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [qty, setQty] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    api.get('/retail/suppliers')
      .then((res) => setSuppliers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSuppliers([]));
  }, [isOpen]);

  useEffect(() => {
    if (product && isOpen) {
      setQty('');
      setCostPerItem(product.hpp ? product.hpp.toString() : '');
      setSupplierId('');
      setNotes('');
      setError('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const qtyNum = Number(qty);
    if (!qtyNum || qtyNum <= 0) {
      setError('Jumlah stok harus lebih dari 0.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/retail/purchases', {
        supplier_id: supplierId || null,
        notes: notes || `Tambah stok manual: ${product.name}`,
        items: [{
          product_id: Number(product.id),
          qty: qtyNum,
          cost_per_item: Number(costPerItem) || 0,
        }],
      });
      onSaved(product.id, qtyNum);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menambah stok.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-600" />
              Tambah Stok
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{product.name} (SKU: {product.sku})</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium">{error}</div>}

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500">
            Stok saat ini: <span className="font-semibold text-slate-800 dark:text-slate-200">{product.totalStock} unit</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Masuk</label>
              <input
                type="number"
                min="1"
                placeholder="50"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Beli / Unit</label>
              <input
                type="number"
                min="0"
                placeholder="10000"
                value={costPerItem}
                onChange={(e) => setCostPerItem(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier (Opsional)</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold cursor-pointer"
            >
              <option value="">Tanpa Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Restock batch Agustus"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Tambah Stok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
