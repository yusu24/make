import React, { useState, useMemo } from 'react';
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
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { JasaExpense, ExpenseCategory } from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';

interface ExpensesViewProps {
  expenses: JasaExpense[];
  onAddExpense: (expense: Omit<JasaExpense, 'id'>) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  expenses = [],
  onAddExpense
}) => {
  const [search, setSearch] = useState('');
  
  // Expense Filters & State
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<ExpenseCategory | 'Semua'>('Semua');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // New Expense Form State
  const [newExpense, setNewExpense] = useState<{
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    referenceSpkId: string;
    notes: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    category: 'Biaya Operasional',
    description: '',
    amount: 0,
    referenceSpkId: '',
    notes: ''
  });

  const totalExpenses = useMemo(() => 
    expenses.reduce((acc, curr) => acc + curr.amount, 0)
  , [expenses]);

  const chartData = useMemo(() => {
    const grouped = expenses.reduce((acc, exp) => {
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
        {/* Total Expenses Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
                <Banknote className="w-5 h-5 text-rose-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-tight">Total Pengeluaran<br/>(Beban)</p>
            </div>
            <h4 className="text-3xl font-bold text-slate-900 mb-2">{formatRupiah(totalExpenses)}</h4>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Semua Kategori Beban</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Total pencatatan dari seluruh kategori biaya operasional dan pengeluaran jasa.
            </p>
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
        
        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="flex shrink-0 items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Pengeluaran</span>
        </button>
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
                  <h4 className="text-base font-semibold text-slate-900">Catat Beban Baru</h4>
                  <p className="text-[11px] text-slate-500">Masukkan detail pengeluaran operasional.</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Kategori Beban</label>
                  <select 
                    value={newExpense.category}
                    onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  >
                    <option value="Biaya Operasional">Biaya Operasional</option>
                    <option value="Suku Cadang & Material">Suku Cadang & Material</option>
                    <option value="Transportasi & Bensin">Transportasi & Bensin</option>
                    <option value="Konsumsi & Lembur">Konsumsi & Lembur</option>
                    <option value="Peralatan Kerja">Peralatan Kerja</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Deskripsi Pengeluaran</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Cth: Beli Freon R32, Bensin Truk, dll."
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
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
            
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExpense(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Simpan Pengeluaran
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
                <th className="py-3 px-4">Kategori Beban</th>
                <th className="py-3 px-4 min-w-[200px]">Deskripsi Pengeluaran</th>
                <th className="py-3 px-4">Ref. SPK</th>
                <th className="py-3 px-4 text-right">Nominal Beban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Banknote className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada data pengeluaran</p>
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
                      <div className="font-bold text-rose-600 text-sm">
                        {formatRupiah(exp.amount)}
                      </div>
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
    </div>
  );
};
