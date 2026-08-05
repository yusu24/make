import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, CreditCard, Building2 } from 'lucide-react';
import { Expense, ExpenseCategory, StoreChannel } from '../../types';
import { useAuth } from '../../../../../contexts/AuthContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id'>, idToEdit?: string) => void;
  expenseToEdit?: Expense | null;
  stores: StoreChannel[];
}

const today = () => new Date().toISOString().substring(0, 10);

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  expenseToEdit,
  stores,
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState<string>(today());
  const [category, setCategory] = useState<ExpenseCategory>('Iklan & Marketing');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [storeId, setStoreId] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('Transfer Bank BCA');

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString());
      setStoreId(expenseToEdit.storeId || 'all');
      setPaymentMethod(expenseToEdit.paymentMethod || 'Transfer Bank BCA');
    } else {
      setDate(today());
      setCategory('Iklan & Marketing');
      setDescription('');
      setAmount('');
      setStoreId('all');
      setPaymentMethod('Transfer Bank BCA');
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const selectedStoreObj = stores.find((s) => s.id === storeId);
    const storeName = storeId === 'all' ? 'Semua Toko' : selectedStoreObj?.name || 'Toko E-Commerce';

    onSaveExpense(
      {
        date,
        category,
        description,
        amount: Number(amount),
        storeId,
        storeName,
        paymentMethod,
        createdByName: user?.name || '-',
      },
      expenseToEdit ? expenseToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-slate-800 dark:to-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              {expenseToEdit ? 'Edit Catatan Pengeluaran' : 'Tambah Pengeluaran Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Catat pengeluaran iklan, packing, komisi platform, & operasional.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Pengeluaran
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
              >
                <option value="Iklan & Marketing">Iklan & Marketing</option>
                <option value="Biaya Admin Marketplace">Biaya Admin Marketplace</option>
                <option value="Packing & Bahan">Packing & Bahan</option>
                <option value="Gaji & Operasional">Gaji & Operasional</option>
                <option value="Logistik & Ongkir">Logistik & Ongkir</option>
                <option value="Sewa & Utilitas">Sewa & Utilitas</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Deskripsi
            </label>
            <input
              type="text"
              placeholder="Contoh: Topup Shopee Ads Kampanye Merdeka"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nominal Pengeluaran (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                placeholder="1500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500/40 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Toko Terkait
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
              >
                <option value="all">Semua Toko</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.platform})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
              >
                <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                <option value="Transfer Mandiri">Transfer Mandiri</option>
                <option value="Potongan Saldo">Potongan Saldo Marketplace</option>
                <option value="Kas Kecil / QRIS">Kas Kecil / QRIS</option>
              </select>
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
