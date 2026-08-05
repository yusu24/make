import React, { useState } from 'react';
import { TrendingUp, Plus, Search, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { Income } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';
import { useTranslation } from '../../../../../contexts/I18nContext';

interface OtherIncomeViewProps {
  incomes: Income[];
  onAddIncomeClick: () => void;
  onEditIncome?: (income: Income) => void;
  onDeleteIncome?: (id: string) => void;
}

export const OtherIncomeView: React.FC<OtherIncomeViewProps> = ({ incomes, onAddIncomeClick, onEditIncome, onDeleteIncome }) => {
  const i18n = useTranslation();
  const t = i18n?.t || ((key: string) => key);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncomes = incomes.filter(
    (inc) =>
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  const { paginatedItems: paginatedIncomes, currentPage, totalPages, totalItems, pageSize, setPageSize, setCurrentPage } = usePagination(filteredIncomes);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="truncate">{i18n?.language === 'en' ? 'Other Income & Claims' : 'Pemasukan Lain (Outside Sales & Marketplace Claims)'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-full">
            {i18n?.language === 'en' ? 'Record lost package insurance claims, TikTok/Shopee affiliate commissions, & cashback bonuses.' : 'Catat klaim ganti rugi paket hilang, komisi affiliate TikTok/Shopee, dan cashback campaign.'}
          </p>
        </div>

        <button
          onClick={onAddIncomeClick}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{i18n?.language === 'en' ? 'Add Other Income' : 'Tambah Pemasukan Lain'}</span>
          <span className="sm:hidden">{i18n?.language === 'en' ? 'Add' : 'Tambah'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
          <div className="w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={i18n?.language === 'en' ? 'Search income...' : 'Cari pemasukan...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
          <div className="text-xs font-extrabold text-emerald-600">
            {i18n?.language === 'en' ? 'Total Amount:' : 'Total Bayar:'} {formatIDR(totalIncome)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-700">
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'DATE' : 'TANGGAL'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'CATEGORY' : 'KATEGORI'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'DESCRIPTION' : 'KETERANGAN'}</th>
                <th className="py-3 px-4">{i18n?.language === 'en' ? 'AMOUNT' : 'NOMINAL'}</th>
                <th className="py-3 px-4 text-center">{i18n?.language === 'en' ? 'ACTION' : 'AKSI'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {paginatedIncomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">{inc.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {inc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-100">{inc.description}</td>
                  <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">{formatIDR(inc.amount)}</td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onEditIncome?.(inc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="Edit Pemasukan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteIncome?.(inc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Hapus Pemasukan"
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
