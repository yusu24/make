import React, { useEffect, useState } from 'react';
import { X, Truck, Plus, Trash2 } from 'lucide-react';
import api from '../../../../../services/api';

interface SupplierOption {
  id: number;
  name: string;
}

interface ProductOption {
  id: number;
  name: string;
  sku: string;
  price_buy: string | number;
}

interface PurchaseLine {
  productId: string;
  qty: string;
  costPerItem: string;
}

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const emptyLine = (): PurchaseLine => ({ productId: '', qty: '', costPerItem: '' });

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<PurchaseLine[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    api.get('/retail/suppliers').then((res) => setSuppliers(Array.isArray(res.data) ? res.data : [])).catch(() => setSuppliers([]));
    api.get('/retail/products').then((res) => setProducts(Array.isArray(res.data) ? res.data : [])).catch(() => setProducts([]));
    setSupplierId('');
    setPurchaseDate(new Date().toISOString().substring(0, 10));
    setNotes('');
    setLines([emptyLine()]);
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const updateLine = (idx: number, patch: Partial<PurchaseLine>) => {
    setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  };

  const handleProductPick = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === Number(productId));
    updateLine(idx, {
      productId,
      costPerItem: prod ? String(prod.price_buy || '') : '',
    });
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const total = lines.reduce((sum, l) => sum + (Number(l.qty) || 0) * (Number(l.costPerItem) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validLines = lines.filter((l) => l.productId && Number(l.qty) > 0);
    if (validLines.length === 0) {
      setError('Tambahkan minimal 1 produk dengan jumlah lebih dari 0.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/retail/purchases', {
        supplier_id: supplierId || null,
        purchase_date: purchaseDate || null,
        notes: notes || null,
        items: validLines.map((l) => ({
          product_id: Number(l.productId),
          qty: Number(l.qty),
          cost_per_item: Number(l.costPerItem) || 0,
        })),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mencatat penerimaan barang.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            Catat Penerimaan Barang
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Penerimaan</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Daftar Barang Diterima</label>
              <button
                type="button"
                onClick={addLine}
                className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris
              </button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <select
                    value={line.productId}
                    onChange={(e) => handleProductPick(idx, e.target.value)}
                    className="col-span-5 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium cursor-pointer"
                  >
                    <option value="">Pilih produk...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Qty"
                    value={line.qty}
                    onChange={(e) => updateLine(idx, { qty: e.target.value })}
                    className="col-span-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Harga Beli"
                    value={line.costPerItem}
                    onChange={(e) => updateLine(idx, { costPerItem: e.target.value })}
                    className="col-span-4 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length === 1}
                    className="col-span-1 flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Kiriman batch Agustus dari CV Sumber Jaya"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl font-semibold text-slate-800 dark:text-slate-100">
            <span>Total Biaya Penerimaan</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="pt-1 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Penerimaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
