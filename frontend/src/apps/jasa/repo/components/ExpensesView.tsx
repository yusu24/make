import React, { useState, useMemo, useRef } from 'react';
import { 
  Receipt,
  Search,
  Filter,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Plus,
  Printer,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { JasaExpense, ExpenseCategory } from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { useAuth } from '../../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import '../../jasa-print.css';
import {
  JasaPrintHeader,
  JasaPrintSectionHeader,
  JasaPrintAppendixHeader,
  JasaPrintExplanationBox,
  JasaPrintFooter,
  formatRp,
  formatDateIndo
} from '../../components/JasaPrintLayout';

interface ExpensesViewProps {
  expenses: JasaExpense[];
  onAddExpense: (expense: Omit<JasaExpense, 'id'>) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  expenses = [],
  onAddExpense
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  
  // Expense Filters & State
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<ExpenseCategory | 'Semua'>('Semua');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // New Transaction Form State
  const [newExpense, setNewExpense] = useState<{
    type: 'Pemasukan' | 'Pengeluaran';
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    referenceSpkId: string;
    notes: string;
  }>({
    type: 'Pengeluaran',
    date: new Date().toISOString().slice(0, 10),
    category: 'Biaya Operasional',
    description: '',
    amount: 0,
    referenceSpkId: '',
    notes: ''
  });

  const totalPemasukan = useMemo(() => 
    expenses.filter(e => e.type === 'Pemasukan').reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  , [expenses]);

  const totalPengeluaran = useMemo(() => 
    expenses.filter(e => e.type !== 'Pemasukan').reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  , [expenses]);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Buku-Kas-Jasa-${new Date().toISOString().split('T')[0]}`,
  });

  const handleExportExcel = () => {
    const headers = ['ID', 'Tanggal', 'Kategori', 'Deskripsi', 'Referensi SPK', 'Nominal (Rp)', 'Dicatat Oleh'];
    const rows = filteredExpenses.map(e => [
      e.id,
      (e.date || '').split('T')[0],
      e.category,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.referenceSpkId || '-',
      e.amount,
      e.recordedBy || 'Admin'
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pengeluaran_Jasa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = useMemo(() => {
    const grouped = expenses.filter(e => e.type !== 'Pemasukan').reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // sort by highest expense
  }, [expenses]);

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6'];

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      !search || 
      exp.id.toLowerCase().includes(search.toLowerCase()) || 
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      (exp.referenceSpkId && exp.referenceSpkId.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = expenseCategoryFilter === 'Semua' || exp.category === expenseCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredExpenses, 10);

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.amount <= 0 || !newExpense.description) return;
    
    onAddExpense({
      ...newExpense,
      recordedBy: 'Admin Jasa', // Mock user
    });
    
      setShowAddExpense(false);
      setNewExpense({
        type: 'Pengeluaran',
        date: new Date().toISOString().slice(0, 10),
        category: 'Biaya Operasional',
        description: '',
        amount: 0,
        referenceSpkId: '',
        notes: ''
      });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Metric Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Unified Cashbook Summary Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-tight">Saldo Kas Bersih<br/>(Buku Kas)</p>
            </div>
            <h4 className="text-3xl font-bold text-slate-900 mb-4">{formatRupiah(saldoBersih)}</h4>
            
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Masuk</p>
                <p className="text-sm font-bold text-emerald-600">+{formatRupiah(totalPemasukan)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Keluar</p>
                <p className="text-sm font-bold text-rose-600">-{formatRupiah(totalPengeluaran)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">Distribusi Pengeluaran (Berdasarkan Kategori)</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  tickFormatter={(val) => `Rp${(val / 1000000).toFixed(1)}M`}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={130} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
                />
                <Tooltip 
                  formatter={(value: number) => [formatRupiah(value), 'Total']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Controls */}
      <div className="flex flex-row gap-3 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs w-full overflow-x-auto scrollbar-none">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengeluaran atau Ref SPK..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
          />
        </div>
        
        <div className="relative shrink-0">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={expenseCategoryFilter}
            onChange={e => setExpenseCategoryFilter(e.target.value as any)}
            className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Biaya Operasional">Biaya Operasional</option>
            <option value="Suku Cadang & Material">Suku Cadang & Material</option>
            <option value="Transportasi & Bensin">Transportasi & Bensin</option>
            <option value="Konsumsi & Lembur">Konsumsi & Lembur</option>
            <option value="Peralatan Kerja">Peralatan Kerja</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            title="Cetak Buku Kas Pengeluaran Jasa PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            title="Export Buku Kas ke Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Catat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Add Expense Form Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-5">
          <form onSubmit={handleAddExpenseSubmit} className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Catat Transaksi Kas Baru</h4>
                  <p className="text-[11px] text-slate-500">Masukkan detail arus kas (pemasukan atau pengeluaran).</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-2">Jenis Transaksi</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="transactionType"
                        value="Pemasukan" 
                        checked={newExpense.type === 'Pemasukan'} 
                        onChange={() => setNewExpense({...newExpense, type: 'Pemasukan'})}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                      />
                      Pemasukan (Kas Masuk)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="transactionType"
                        value="Pengeluaran" 
                        checked={newExpense.type === 'Pengeluaran'} 
                        onChange={() => setNewExpense({...newExpense, type: 'Pengeluaran'})}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                      />
                      Pengeluaran (Kas Keluar)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tanggal</label>
                  <input 
                    type="date" 
                    required
                    value={newExpense.date}
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Kategori Transaksi</label>
                  <select 
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  >
                    {newExpense.type === 'Pemasukan' ? (
                      <>
                        <option value="Pendapatan Jasa">Pendapatan Jasa</option>
                        <option value="Pendapatan Penjualan">Pendapatan Penjualan</option>
                        <option value="Pendapatan Lain-lain">Pendapatan Lain-lain</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </>
                    ) : (
                      <>
                        <option value="Biaya Operasional">Biaya Operasional</option>
                        <option value="Belanja Suku Cadang (Parts)">Suku Cadang & Material</option>
                        <option value="Transportasi & Akomodasi">Transportasi & Bensin</option>
                        <option value="Peralatan Kerja">Peralatan Kerja</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Deskripsi Transaksi</label>
                  <input 
                    type="text" 
                    required
                    placeholder={newExpense.type === 'Pemasukan' ? "Cth: DP Proyek, Pembayaran Lunas, dll." : "Cth: Beli Freon R32, Bensin Truk, dll."}
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-xs font-semibold">Rp</span>
                    </div>
                    <input 
                      type="number" 
                      required
                      min={0}
                      value={newExpense.amount || ''}
                      onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Referensi SPK (Opsional)</label>
                  <input 
                    type="text" 
                    placeholder="Cth: SPK-20231015-01"
                    value={newExpense.referenceSpkId}
                    onChange={e => setNewExpense({...newExpense, referenceSpkId: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
          </form>
        </div>
      )}

      {/* Data Lists */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* EXPENSES LIST */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal & ID</th>
                <th className="py-3 px-4">Kategori Transaksi</th>
                <th className="py-3 px-4 min-w-[200px]">Deskripsi Transaksi</th>
                <th className="py-3 px-4">Ref. SPK</th>
                <th className="py-3 px-4 text-right">Kas Masuk (Debit)</th>
                <th className="py-3 px-4 text-right">Kas Keluar (Kredit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Banknote className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada data transaksi</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((exp: JasaExpense) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{(exp.date || '').split('T')[0]}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{exp.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 line-clamp-2">{exp.description}</div>
                      {exp.notes && <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{exp.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.referenceSpkId ? (
                        <span className="font-mono text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {exp.referenceSpkId}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {exp.type === 'Pemasukan' ? (
                        <div className="font-bold text-emerald-600 text-sm">
                          {formatRupiah(exp.amount)}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {exp.type !== 'Pemasukan' ? (
                        <div className="font-bold text-rose-600 text-sm">
                          {formatRupiah(exp.amount)}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                      <div className="text-[9px] text-slate-400 mt-0.5">Oleh: {exp.recordedBy}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredExpenses.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredExpenses.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY FORMAL 2-PAGE JASA EXPENSES CASH BOOK REPORT                   */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          
          {/* 1. Header / Kop Surat Resmi Bengkel / Jasa */}
          <JasaPrintHeader
            user={user}
            title="Buku Kas (Arus Masuk & Keluar) Operasional Jasa"
            subtitle="Rekapitulasi Pemasukan dan Pengeluaran Kas (Buku Kas Umum)"
            periodText={`Kategori: ${expenseCategoryFilter === 'Semua' ? 'Semua Kategori' : expenseCategoryFilter}`}
          />

          {/* 2. Formal Summary Table (Horizontal Borders Only) */}
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Posisi Arus Kas" />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600, color: '#000000' }}>
                    A. REKAPITULASI ARUS KAS JASA & SERVIS
                  </td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Volume Transaksi Terdaftar</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', width: 140, whiteSpace: 'nowrap' }}>{filteredExpenses.length} Transaksi</td>
                  <td style={{ width: 140 }}></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Arus Kas Masuk (Pemasukan)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>+{formatRp(totalPemasukan)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px 5px 20px', color: '#111827' }}>Total Arus Kas Keluar (Pengeluaran)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#000000', whiteSpace: 'nowrap' }}>-{formatRp(totalPengeluaran)}</td>
                  <td></td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={2} style={{ padding: '7px 4px', fontSize: 11, color: '#000000' }}>
                    SALDO KAS BERSIH (NET CASH BALANCE)
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 11.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {saldoBersih >= 0 ? '+' : ''}{formatRp(saldoBersih)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Detailed Formal Accounting Ledger Table */}
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader 
              title="II. Buku Register Kas (Cashbook Ledger)" 
              rightText={`Total ${filteredExpenses.length} transaksi`} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '1.5px solid #000000' }}>
                  <th style={{ padding: '7px 4px', textAlign: 'center', width: 30, fontWeight: 600 }}>No</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 75, fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 90, fontWeight: 600 }}>No. Kas / ID</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 130, fontWeight: 600 }}>Kategori Transaksi</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', fontWeight: 600 }}>Deskripsi / Catatan</th>
                  <th style={{ padding: '7px 4px', textAlign: 'left', width: 90, fontWeight: 600 }}>Ref. SPK</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>Masuk (Rp)</th>
                  <th style={{ padding: '7px 4px', textAlign: 'right', width: 90, fontWeight: 600, whiteSpace: 'nowrap' }}>Keluar (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e, idx) => (
                  <tr key={e.id || idx} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', color: '#000000' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 4px', color: '#000000', whiteSpace: 'nowrap' }}>
                      {(e.date || '').split('T')[0]}
                    </td>
                    <td style={{ padding: '5px 4px', fontWeight: 600, color: '#000000', fontFamily: 'monospace' }}>
                      {e.id}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {e.category}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000' }}>
                      {e.description} {e.notes ? `(${e.notes})` : ''}
                    </td>
                    <td style={{ padding: '5px 4px', color: '#000000', fontFamily: 'monospace' }}>
                      {e.referenceSpkId || '-'}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      {e.type === 'Pemasukan' ? formatRp(e.amount) : '-'}
                    </td>
                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 500, color: '#000000', whiteSpace: 'nowrap' }}>
                      {e.type !== 'Pemasukan' ? formatRp(e.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td colSpan={6} style={{ padding: '7px 4px', textAlign: 'right', textTransform: 'uppercase', fontSize: 9.5, color: '#000000', whiteSpace: 'nowrap' }}>
                    Total Rekapitulasi Kas Bersih:
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalPemasukan)}
                  </td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontSize: 10.5, color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRp(totalPengeluaran)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kolom Tanda Tangan & Pengesahan Dokumen (Halaman 1) */}
          <JasaPrintFooter user={user} />

          {/* 4. HALAMAN 2: LAMPIRAN PANDUAN TATA KELOLA KAS & BIAYA JASA */}
          <div style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: 16 }}>
            <JasaPrintAppendixHeader 
              title="Lampiran: Standar Tata Kelola Biaya Operasional & Material Jasa"
              subtitle={`Pedoman Pembelian Suku Cadang, Transportasi Teknisi & Kas Kecil — ${user?.tenant_name || 'Layanan Jasa & Servis'}`}
              user={user}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 16 }}>
              <JasaPrintExplanationBox
                number="1"
                title="Pengendalian Pengadaan Suku Cadang & Bahan Material"
                desc="Setiap pembelian sparepart untuk pengerjaan SPK wajib dilampiri nota resmi toko dan dicatat nomor referensi SPK terkait guna akurasi HPP proyek."
                variant="default"
              />

              <JasaPrintExplanationBox
                number="2"
                title="Reimbursement Bensin & Transportasi Teknisi Lapangan"
                desc="Klaim uang transport kunjungan servis ke lokasi klien diverifikasi berdasarkan riwayat penugasan SPK dan bukti struk BBM resmi."
                variant="emerald"
              />

              <JasaPrintExplanationBox
                number="3"
                title="Perawatan & Kalibrasi Peralatan Servis (Tools & Equipment)"
                desc="Alokasi biaya servis berkala dan kalibrasi perkakas teknisi agar kualitas hasil pengerjaan memenuhi standar keselamatan dan keandalan kerja."
                variant="indigo"
              />

              <JasaPrintExplanationBox
                number="4"
                title="Tata Kelola Kas Kecil (Petty Cash) Workshop"
                desc="Pengeluaran operasional mendesak di bawah limit kas kecil dibukukan secara real-time dan dilakukan penutupan buku (closing) setiap akhir pekan."
                variant="rose"
              />

              <JasaPrintExplanationBox
                number="5"
                title="Audit Bukti Transaksi & Rekonsiliasi Bank"
                desc="Pencocokan berkala antara saldo kas fisik, mutasi rekening bank operasional, dan total pengeluaran yang tercatat pada sistem keuangan."
                variant="dark"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
