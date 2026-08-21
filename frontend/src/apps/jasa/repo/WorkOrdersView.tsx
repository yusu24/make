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
      order.equipmentName.toLowerCase().includes(query) ||
      order.technicianName.toLowerCase().includes(query);

    // Status filter
    const matchesStatus = selectedStatusFilter === 'Semua' || order.status === selectedStatusFilter;

    // Priority filter
    const matchesPriority = selectedPriorityFilter === 'Semua' || order.priority === selectedPriorityFilter;

    // Category filter
    const matchesCategory = selectedCategory === 'Semua' || order.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

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
      case 'Menunggu Konfirmasi':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">⏳ Konfirmasi</span>;
      case 'Dijadwalkan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">📅 Dijadwalkan</span>;
      case 'Dalam Perjalanan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">🚗 Perjalanan</span>;
      case 'Sedang Dikerjakan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">⚙️ Proses Servis</span>;
      case 'Menunggu Sparepart':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">📦 Tunggu Sparepart</span>;
      case 'Uji Coba & QC':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">🔍 QC & Testing</span>;
      case 'Selesai':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">✅ Selesai</span>;
      case 'Dibatalkan':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">❌ Dibatalkan</span>;
    }
  };

  const statusOptions: (ServiceStatus | 'Semua')[] = [
    'Semua',
    'Menunggu Konfirmasi',
    'Dijadwalkan',
    'Sedang Dikerjakan',
    'Menunggu Sparepart',
    'Uji Coba & QC',
    'Selesai'
  ];

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Administrasi Operasional</span>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center space-x-2 mt-0.5">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span>Surat Perintah Kerja (SPK) & Order Servis</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan {filteredOrders.length} dari total {workOrders.length} tiket pengerjaan aktif
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewSpk}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Terbitkan SPK Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Bar in Bento Style */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Status:
          </span>
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => onStatusFilterChange(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatusFilter === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}

          <div className="ml-auto flex items-center space-x-2 mt-2 sm:mt-0">
            <select
              value={selectedPriorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value as any)}
              aria-label="Filter berdasarkan prioritas SPK"
              className="bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Semua">Semua Prioritas</option>
              <option value="Darurat">🚨 Darurat</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Bento List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Tidak ada SPK yang sesuai kriteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Coba sesuaikan kata kunci pencarian atau reset filter status dan prioritas di atas.
            </p>
            <button
              onClick={() => {
                onStatusFilterChange('Semua');
                onPriorityFilterChange('Semua');
                setSelectedCategory('Semua');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-5 sm:p-6 transition-all shadow-xs group hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: ID, Title, Equipment & Customer */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
                      {order.id}
                    </span>
                    {getPriorityBadge(order.priority)}
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 font-medium flex items-center ml-auto lg:ml-0">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {order.scheduledDate} ({order.scheduledTime})
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectWorkOrder(order)}
                    className="text-base sm:text-lg font-semibold text-slate-900 group-hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {order.title}
                  </h3>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate font-semibold text-slate-800">{order.customerCompany}</span>
                      <span className="text-slate-400">({order.customerName.split(' ')[0]})</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400">Objek:</span>
                      <span className="font-semibold text-slate-700 truncate">{order.equipmentName}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-400">Teknisi:</span>
                      <span className="font-semibold text-slate-900 truncate">{order.technicianName}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="mt-2.5 text-xs text-slate-500 line-clamp-1 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                    "{order.serviceDescription}"
                  </p>
                </div>

                {/* Right: Cost, SLA & Actions */}
                <div className="flex sm:items-center justify-between lg:flex-col lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Estimasi Total Biaya</div>
                    <div className="text-lg font-semibold text-slate-900 mt-0.5">
                      {formatRupiah(order.grandTotal)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center lg:justify-end gap-1 mt-0.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${order.paymentStatus === 'Lunas' ? 'bg-emerald-500' : order.paymentStatus === 'Sebagian (DP)' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="font-semibold text-slate-700">{order.paymentStatus}</span>
                      <span className="text-slate-300">•</span>
                      <span>Garansi {order.warrantyPeriod}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onPrintWorkOrder(order)}
                      title="Cetak SPK / Faktur Jasa"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectWorkOrder(order)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rincian SPK</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
