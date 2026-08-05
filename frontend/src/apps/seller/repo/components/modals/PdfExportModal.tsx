import React from 'react';
import { X, Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { Expense, Order } from '../../types';
import { formatIDR } from '../../utils/formatters';
import { useAuth } from '../../../../../contexts/AuthContext';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  orders: Order[];
  storeCount: number;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  orders,
  storeCount,
}) => {
  const { user } = useAuth();
  if (!isOpen) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOmset = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const printedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              Pratinjau Cetak Laporan Keuangan PDF (BIZORA ERP)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Preview */}
        <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-900 flex-1 flex justify-center">
          <div className="w-full max-w-xl bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 text-xs font-sans print:shadow-none print:border-none">
            {/* Invoice Letterhead */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-indigo-600 mb-6">
              <div>
                <h1 className="text-xl font-black tracking-tight text-indigo-700">
                  BIZORA E-COMMERCE SUITE
                </h1>
                <p className="text-[10px] text-slate-500">
                  PT Bizora Commerce • Platform Manajemen Seller Multi-Channel
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-800">LAPORAN FINANSIAL</span>
                <p className="text-[10px] text-slate-400">Dicetak: {printedAt}</p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 font-semibold block text-[9px]">NAMA SELLER</span>
                <span className="font-extrabold text-slate-800">{user?.tenant_name || user?.name || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[9px]">CHANNEL PENJUALAN</span>
                <span className="font-semibold text-emerald-600">{storeCount} Channel Terhubung</span>
              </div>
            </div>

            {/* Summary Box */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-[10px] font-semibold text-emerald-800 uppercase block">TOTAL OMSET SALES</span>
                <span className="text-base font-black text-emerald-700">{formatIDR(totalOmset)}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="text-[10px] font-semibold text-rose-800 uppercase block">TOTAL PENGELUARAN</span>
                <span className="text-base font-black text-rose-700">{formatIDR(totalExpenses)}</span>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <h4 className="font-extrabold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">
              RINCIAN PENGELUARAN DITERBITKAN
            </h4>
            <table className="w-full text-left border-collapse border border-slate-200 text-[10px] mb-6">
              <thead>
                <tr className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Keterangan</th>
                  <th className="p-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="p-2 font-mono">{e.date}</td>
                    <td className="p-2 font-semibold">{e.category}</td>
                    <td className="p-2">{e.description}</td>
                    <td className="p-2 text-right font-extrabold text-rose-600">{formatIDR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div className="pt-8 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
              <div>
                <p>Dicetak Oleh: {user?.name || '-'}</p>
              </div>
              <div className="text-right">
                <p>{printedAt}</p>
                <div className="h-10"></div>
                <p className="font-extrabold text-slate-800 underline">{user?.tenant_name || user?.name || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
