import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Income } from '../../types';
import api from '../../../../../services/api';

interface FinanceCategoryOption {
  id: number;
  name: string;
}

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIncome: (income: Omit<Income, 'id'>, financeCategoryId: string | null, idToEdit?: string) => void;
  incomeToEdit?: Income | null;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  onSaveIncome,
  incomeToEdit,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [financeCategoryId, setFinanceCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<FinanceCategoryOption[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    api.get('/retail/finance-categories', { params: { type: 'income' } })
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, [isOpen]);

  useEffect(() => {
    if (incomeToEdit) {
      setDate(incomeToEdit.date);
      setDescription(incomeToEdit.description);
      setAmount(incomeToEdit.amount.toString());
    } else {
      setDate(new Date().toISOString().substring(0, 10));
      setDescription('');
      setAmount('');
      setFinanceCategoryId('');
    }
  }, [incomeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const selectedCategory = categories.find((c) => c.id === Number(financeCategoryId));

    onSaveIncome(
      {
        date,
        description,
        amount: Number(amount),
        category: (selectedCategory?.name as Income['category']) || 'Lain-lain',
        storeName: 'Toko Offline',
      },
      financeCategoryId || null,
      incomeToEdit ? incomeToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-slate-800 dark:to-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              {incomeToEdit ? 'Edit Pemasukan Lain' : 'Tambah Pemasukan Lain'}
            </h3>
            <p className="text-xs text-slate-500">
              Catat pemasukan di luar penjualan reguler, mis. klaim retur atau cashback.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={financeCategoryId}
                onChange={(e) => setFinanceCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
              >
                <option value="">Lainnya (tanpa kategori)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Deskripsi
            </label>
            <input
              type="text"
              placeholder="Contoh: Klaim ganti rugi ekspedisi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                placeholder="250000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/40 text-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Simpan Pemasukan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
