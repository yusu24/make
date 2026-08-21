import React, { useState, useMemo } from 'react';
import { 
  Receipt,
  Search,
  Filter,
  CreditCard,
  Wallet,
  ArrowUpRight,
  Clock,
  Eye
} from 'lucide-react';
import { JasaInvoice, InvoiceStatus } from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';

interface FinanceViewProps {
  invoices: JasaInvoice[];
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onViewInvoice: (invoice: JasaInvoice) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ 
  invoices = [], 
  onUpdateInvoiceStatus,
  onViewInvoice
}) => {
  const [search, setSearch] = useState('');
  
  // Invoice Filters
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'Semua'>('Semua');

  // Metrik Ringkasan
  const totalRevenue = useMemo(() => 
    invoices.filter(i => i.status === 'Lunas').reduce((acc, curr) => acc + curr.totalAmount, 0)
  , [invoices]);

  const totalReceivables = useMemo(() => 
    invoices.filter(i => i.status !== 'Lunas' && i.status !== 'Dibatalkan').reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0)
  , [invoices]);

  // Filtered Lists
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      !search || 
      inv.id.toLowerCase().includes(search.toLowerCase()) || 
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.workOrderId.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'Semua' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
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
  } = usePagination(filteredInvoices, 10);

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dibayar Sebagian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Belum Dibayar': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Jatuh Tempo': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Dibatalkan': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Pendapatan (Lunas)</p>
            <h4 className="text-lg font-bold text-slate-900">{formatRupiah(totalRevenue)}</h4>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>Pemasukan</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Total Receivables */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Piutang Berjalan</p>
            <h4 className="text-lg font-bold text-slate-900">{formatRupiah(totalReceivables)}</h4>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600">
              <Clock className="w-3 h-3" />
              <span>Menunggu Pembayaran</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Invoice Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID Invoice, Pelanggan, atau Ref SPK..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Belum Dibayar">Belum Dibayar</option>
              <option value="Dibayar Sebagian">Dibayar Sebagian</option>
              <option value="Lunas">Lunas</option>
              <option value="Jatuh Tempo">Jatuh Tempo</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Lists */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* INVOICE LIST */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Informasi Tagihan</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Tanggal & Tempo</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Receipt className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada tagihan yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((inv: JasaInvoice) => (
                  <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80 inline-block mb-1">
                        {inv.id}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Ref SPK: <span className="font-semibold text-slate-700">{inv.workOrderId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-slate-900 truncate">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{inv.customerCompany || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{(inv.issueDate || '').split('T')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Tempo: <span className={new Date(inv.dueDate) < new Date() && inv.status !== 'Lunas' ? 'text-rose-600 font-semibold' : ''}>{(inv.dueDate || '').split('T')[0]}</span></div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-sm">
                        {formatRupiah(inv.totalAmount)}
                      </div>
                      {inv.status !== 'Lunas' && inv.paidAmount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                          Dibayar: {formatRupiah(inv.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold ${getStatusBadgeColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap space-x-2">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredInvoices.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredInvoices.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>
    </div>
  );
};
