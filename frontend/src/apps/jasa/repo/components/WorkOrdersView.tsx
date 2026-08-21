import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Printer, 
  ChevronRight, 
  Eye, 
  Building2, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Plus
} from 'lucide-react';
import { WorkOrder, ServiceStatus, PriorityLevel, ServiceCategory } from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  onSelectWorkOrder: (order: WorkOrder) => void;
  onPrintWorkOrder: (order: WorkOrder) => void;
  onOpenNewSpk: () => void;
  searchQuery: string;
  selectedStatusFilter?: ServiceStatus | 'Semua';
  onStatusFilterChange: (status: ServiceStatus | 'Semua') => void;
  selectedPriorityFilter: PriorityLevel | 'Semua';
  onPriorityFilterChange: (priority: PriorityLevel | 'Semua') => void;
  onQuickUpdateStatus: (orderId: string, newStatus: ServiceStatus) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  onSelectWorkOrder,
  onPrintWorkOrder,
  onOpenNewSpk,
  searchQuery,
  selectedStatusFilter = 'Semua',
  onStatusFilterChange,
  selectedPriorityFilter = 'Semua',
  onPriorityFilterChange,
  onQuickUpdateStatus
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const filteredOrders = workOrders.filter(order => {
    // Search matching
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.title.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerCompany.toLowerCase().includes(query) ||
      order.serviceObjectName.toLowerCase().includes(query) ||
      order.technicianName.toLowerCase().includes(query);

    // Status filter
    const matchesStatus = selectedStatusFilter === 'Semua' || order.status === selectedStatusFilter;

    // Priority filter
    const matchesPriority = selectedPriorityFilter === 'Semua' || order.priority === selectedPriorityFilter;

    // Category filter
    const matchesCategory = selectedCategory === 'Semua' || order.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
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
  } = usePagination(filteredOrders, 10);

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Darurat':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">● Darurat</span>;
      case 'Tinggi':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">Tinggi</span>;
      case 'Sedang':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Sedang</span>;
      case 'Rendah':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Rendah</span>;
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'Antrean':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">⏳ Antrean</span>;
      case 'Pengecekan & Estimasi':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">🔍 Cek & Estimasi</span>;
      case 'Menunggu Persetujuan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">💬 Menunggu ACC</span>;
      case 'Sedang Dikerjakan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">⚙️ Proses Servis</span>;
      case 'Menunggu Sparepart':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">📦 Tunggu Sparepart</span>;
      case 'Selesai & Siap Diambil':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">✅ Siap Diambil</span>;
      case 'Diserahkan / Lunas':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🤝 Diserahkan</span>;
      case 'Dibatalkan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">❌ Dibatalkan</span>;
    }
  };

  const statusOptions: (ServiceStatus | 'Semua')[] = [
    'Semua',
    'Antrean',
    'Pengecekan & Estimasi',
    'Menunggu Persetujuan',
    'Sedang Dikerjakan',
    'Menunggu Sparepart',
    'Selesai & Siap Diambil',
    'Diserahkan / Lunas',
    'Dibatalkan'
  ];

  return (
    <div className="space-y-4">
      {/* Action & Filter Bar (Page title is already in Navtop) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Filter:
              </span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as any)}
                aria-label="Filter berdasarkan status pengerjaan SPK"
                className="bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Semua' ? 'Semua Status Pengerjaan' : st}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedPriorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as any)}
              aria-label="Filter berdasarkan prioritas SPK"
              className="bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              <option value="Semua">Semua Prioritas</option>
              <option value="Darurat">🚨 Prioritas Darurat</option>
              <option value="Tinggi">⚡ Prioritas Tinggi</option>
              <option value="Sedang">🔵 Prioritas Sedang</option>
              <option value="Rendah">⚪ Prioritas Rendah</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenNewSpk}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/25 transition-all whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Terbitkan SPK Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">No. SPK & Jadwal</th>
                <th className="py-3 px-4">Pekerjaan & Objek Servis</th>
                <th className="py-3 px-4">Klien / Perusahaan</th>
                <th className="py-3 px-4">Pekerja / Tim</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4">Status Pengerjaan</th>
                <th className="py-3 px-4 text-right">Estimasi Biaya</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada SPK yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">Sesuaikan filter atau reset pencarian Anda</p>
                    <button
                      onClick={() => {
                        onStatusFilterChange('Semua');
                        onPriorityFilterChange('Semua');
                        setSelectedCategory('Semua');
                      }}
                      className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedData.map((order: WorkOrder) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectWorkOrder(order)}
                  >
                    {/* No SPK & Jadwal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80 inline-block mb-1">
                        {order.id}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{(order.scheduledDate || '').split('T')[0]}</span>
                        <span className="text-slate-400">({order.scheduledTime})</span>
                      </div>
                    </td>

                    {/* Pekerjaan & Objek Servis */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {order.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        <span className="text-slate-400 font-medium">Objek:</span> {order.serviceObjectName}
                      </div>
                    </td>

                    {/* Klien / Perusahaan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{order.customerCompany}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        PIC: {order.customerName}
                      </div>
                    </td>

                    {/* Teknisi */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-[10px]">
                          {order.technicianName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-semibold text-slate-800">{order.technicianName}</span>
                      </div>
                    </td>

                    {/* Prioritas */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(order.priority)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Biaya & Pembayaran */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {formatRupiah(order.grandTotal)}
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-medium flex items-center justify-end gap-1 mt-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'Lunas' ? 'bg-emerald-500' : order.paymentStatus === 'Sebagian (DP)' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span>{order.paymentStatus}</span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onPrintWorkOrder(order)}
                          title="Cetak SPK"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectWorkOrder(order)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredOrders.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>
    </div>
  );
};
