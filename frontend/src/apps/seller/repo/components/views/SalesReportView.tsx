import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, TrendingUp, DollarSign, Calculator, ArrowUpRight, Percent, CalendarRange, RotateCcw } from 'lucide-react';
import { Expense, Order, Product } from '../../types';
import { formatIDR } from '../../utils/formatters';

interface SalesReportViewProps {
  orders: Order[];
  expenses: Expense[];
  products: Product[];
}

const todayStr = () => new Date().toISOString().substring(0, 10);
const daysAgoStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().substring(0, 10);
};

export const SalesReportView: React.FC<SalesReportViewProps> = ({ orders, expenses, products }) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const orders_ = useMemo(() => {
    if (!dateFrom && !dateTo) return orders;
    return orders.filter((o) => {
      const d = o.orderDate.substring(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  const expenses_ = useMemo(() => {
    if (!dateFrom && !dateTo) return expenses;
    return expenses.filter((e) => {
      const d = e.date.substring(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo]);

  // Calculate aggregate metrics
  const totalGrossRevenue = orders_.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPlatformFees = orders_.reduce((sum, o) => sum + (o.platformFee || 0), 0);
  const totalExpenses = expenses_.reduce((sum, e) => sum + e.amount, 0);

  // Estimate HPP
  const totalHPP = orders_.reduce((sum, o) => {
    return (
      sum +
      o.items.reduce((itemSum, item) => {
        const prod = products.find((p) => p.sku === item.sku);
        const hppUnit = prod ? prod.hpp : item.price * 0.4;
        return itemSum + hppUnit * item.quantity;
      }, 0)
    );
  }, 0);

  const netProfit = totalGrossRevenue - totalHPP - totalPlatformFees - totalExpenses;
  const netMarginPercent = totalGrossRevenue > 0 ? ((netProfit / totalGrossRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Laporan Profit & Loss / Margin Penjualan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kalkulator profit bersih setelah dikurangi HPP modal, biaya admin platform marketplace, & pengeluaran operasional.
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Rentang Tanggal:</span>
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <span className="text-slate-400 text-xs">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />

          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => { setDateFrom(todayStr()); setDateTo(todayStr()); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              onClick={() => { setDateFrom(daysAgoStr(7)); setDateTo(todayStr()); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              7 Hari
            </button>
            <button
              onClick={() => { setDateFrom(daysAgoStr(30)); setDateTo(todayStr()); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              30 Hari
            </button>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset (Semua Tanggal)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Net Profit Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-widest bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              ESTIMASI PROFIT BERSIH (NET PROFIT)
            </span>
            <div className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">{formatIDR(netProfit)}</div>
            <p className="text-xs text-emerald-100/80 mt-1">
              Sudah dipotong seluruh HPP barang, komisi platform, & pengeluaran terdaftar.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-emerald-200 font-semibold uppercase block">NET MARGIN RATE</span>
            <div className="text-3xl font-black text-emerald-300 mt-1">{netMarginPercent}%</div>
            <span className="text-[10px] text-white/80">Kategori Bisnis Sehat</span>
          </div>
        </div>
      </div>

      {/* Profit & Loss Waterfall Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/60 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Rincian Komponen Laba Rugi (P&L Summary)
          </h3>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-100">
            <span>(+) Total Omset Kotor (Gross Revenue)</span>
            <span className="text-emerald-600 dark:text-emerald-400">{formatIDR(totalGrossRevenue)}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>(-) Total HPP / Modal Awal Produk</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatIDR(totalHPP)}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>(-) Biaya Admin & Komisi Platform Marketplace</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatIDR(totalPlatformFees)}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>(-) Operational Expenses & Ads (Pengeluaran Kas)</span>
            <span className="text-rose-600 dark:text-rose-400">-{formatIDR(totalExpenses)}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl font-black text-base text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
            <span>(=) LABA BERSIH OPERASIONAL (NET MARGIN)</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatIDR(netProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
