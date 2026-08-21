import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  UserCheck, 
  Wrench, 
  ShieldCheck, 
  Sparkles, 
  X,
  CalendarCheck,
  Zap,
  Phone,
  Mail,
  MapPin,
  ListFilter
} from 'lucide-react';
import { JasaContract, ContractStatus, ContractFrequency, ServiceCategory, Technician, WorkOrder } from '../types';
import { formatRupiah, formatNumberInput, parseNumberInput } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';

interface ContractsViewProps {
  contracts: JasaContract[];
  technicians: Technician[];
  workOrders: WorkOrder[];
  onCreateContract: (newContract: Partial<JasaContract>) => Promise<void>;
  onGenerateSpkFromContract: (contract: JasaContract) => Promise<void>;
  onSelectWorkOrder: (order: WorkOrder) => void;
}

const FREQUENCY_OPTIONS: ContractFrequency[] = [
  'Bulanan',
  '2 Bulan Sekali',
  'Kuartalan',
  '6 Bulan Sekali',
  'Tahunan'
];

const CATEGORIES: ServiceCategory[] = [
  'Pemeliharaan Berkala (Preventive)',
  'Perbaikan & Troubleshooting (Corrective)',
  'Instalasi & Commissioning',
  'Kalibrasi & Pengujian',
  'Konsultasi & Audit Teknis',
  'Upgrade & Modifikasi'
];

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  technicians,
  workOrders,
  onCreateContract,
  onGenerateSpkFromContract,
  onSelectWorkOrder
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [activeTabMode, setActiveTabMode] = useState<'table' | 'calendar'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContractDetail, setSelectedContractDetail] = useState<JasaContract | null>(null);

  // Calendar view state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Form State
  const [title, setTitle] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Pemeliharaan Berkala (Preventive)');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<ContractFrequency>('Bulanan');
  const [totalVisitsQuota, setTotalVisitsQuota] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
  const [slaNotes, setSlaNotes] = useState('');

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        c.contractNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.clientCompany.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'Semua' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, search, statusFilter]);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex
  } = usePagination(filteredContracts, 10);

  // Urgent / Expiring Contracts (<= 30 days)
  const expiringContracts = useMemo(() => {
    return contracts.filter(c => {
      if (c.status === 'Berakhir') return false;
      const days = c.daysUntilExpiration ?? 999;
      return days <= 30 && days >= 0;
    });
  }, [contracts]);

  // Scheduled Visits for This Month
  const upcomingVisits = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return contracts.filter(c => {
      if (!c.nextScheduleDate || c.status === 'Berakhir') return false;
      const d = new Date(c.nextScheduleDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [contracts]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientCompany || !clientName) return;

    const equipments = equipmentInput
      ? equipmentInput.split(',').map(s => s.trim()).filter(Boolean)
      : ['Unit Mesin / Perangkat Utama'];

    await onCreateContract({
      contractNumber: contractNumber.trim() || undefined,
      title: title.trim(),
      clientCompany: clientCompany.trim(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      clientAddress: clientAddress.trim(),
      serviceCategory,
      equipmentList: equipments,
      startDate,
      endDate,
      frequency,
      totalVisitsQuota: parseNumberInput(totalVisitsQuota) || 12,
      contractValue: parseNumberInput(contractValue) || 0,
      assignedTechnicianId: assignedTechnicianId || undefined,
      slaNotes: slaNotes.trim()
    });

    setShowAddModal(false);
    // Reset
    setTitle('');
    setContractNumber('');
    setClientCompany('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
    setEquipmentInput('');
    setTotalVisitsQuota('');
    setContractValue('');
    setSlaNotes('');
  };

  // Calendar Helpers
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const prevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Days in current calendar month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    // Padding from previous month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const monthFormatted = String(currentMonth + 1).padStart(2, '0');
      const dayFormatted = String(i).padStart(2, '0');
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
      days.push({
        day: i,
        isCurrentMonth: true,
        dateStr
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'Aktif':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Aktif</span>;
      case 'Segera Berakhir':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">⚠️ Segera Berakhir</span>;
      case 'Berakhir':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">❌ Berakhir</span>;
      case 'Ditangguhkan':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">⏸️ Ditangguhkan</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Expiration & Scheduled Service Reminder Banner */}
      {expiringContracts.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
              ⚠️
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold">
                Pengingat Masa Berlaku Kontrak B2B ({expiringContracts.length} Perjanjian Segera Habis)
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5 truncate">
                {expiringContracts.map(c => `${c.clientCompany} (${c.daysUntilExpiration} hari lagi)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Segera Berakhir')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap shadow-2xs cursor-pointer shrink-0"
          >
            Tinjau Kontrak
          </button>
        </div>
      )}

      {/* Action & Filter Bar (Page title is already in Navtop) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor kontrak atau klien..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status kontrak"
              className="bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
            >
              <option value="Semua">Semua Status Kontrak</option>
              <option value="Aktif">🟢 Aktif</option>
              <option value="Segera Berakhir">⚠️ Segera Berakhir (&le; 30 Hari)</option>
              <option value="Berakhir">❌ Berakhir</option>
            </select>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setActiveTabMode('table')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTabMode === 'table'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Tabel Kontrak</span>
              </button>
              <button
                onClick={() => setActiveTabMode('calendar')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTabMode === 'calendar'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Kalender Jadwal</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/25 transition-all whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Daftarkan Kontrak B2B</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CONTRACTS ERP TABLE */}
      {activeTabMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Kontrak & Masa Berlaku</th>
                  <th className="py-3 px-4">Klien / Perusahaan</th>
                  <th className="py-3 px-4">Kategori & Objek Servis</th>
                  <th className="py-3 px-4">Siklus & Jadwal Berikutnya</th>
                  <th className="py-3 px-4">Progress Kuota Kunjungan</th>
                  <th className="py-3 px-4 text-right">Nilai Kontrak</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <FileText className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Tidak ada kontrak yang sesuai kriteria</p>
                      <p className="text-xs text-slate-400 mt-0.5">Daftarkan kontrak kerja sama baru atau sesuaikan filter</p>
                      <button
                        onClick={() => {
                          setStatusFilter('Semua');
                          setSearch('');
                        }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((c: JasaContract) => {
                    const daysLeft = c.daysUntilExpiration ?? 0;
                    const progressPercent = Math.min(100, Math.round((c.completedVisitsCount / (c.totalVisitsQuota || 1)) * 100));

                    return (
                      <tr key={c.id} className="hover:bg-blue-50/40 transition-colors group">
                        {/* No. Kontrak & Masa Berlaku */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80 inline-block mb-1">
                            {c.contractNumber}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {c.startDate?.split('T')[0]} s/d {c.endDate?.split('T')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {daysLeft > 0 ? (
                              <span className={daysLeft <= 30 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                                ⏳ Sisa {daysLeft} hari
                              </span>
                            ) : (
                              <span className="text-rose-600 font-semibold">Telah Berakhir</span>
                            )}
                          </div>
                        </td>

                        {/* Klien / Perusahaan */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{c.clientCompany}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            PIC: {c.clientName}
                          </div>
                          {c.clientPhone && (
                            <div className="text-[10px] text-slate-400">
                              📞 {c.clientPhone}
                            </div>
                          )}
                        </td>

                        {/* Kategori & Objek Servis */}
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <div className="font-semibold text-slate-800 text-[11px] truncate">
                            {c.title}
                          </div>
                          <div className="text-[10.5px] text-blue-600 truncate mt-0.5">
                            {c.serviceCategory}
                          </div>
                          {c.equipmentList && c.equipmentList.length > 0 && (
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              🔧 {c.equipmentList.join(', ')}
                            </div>
                          )}
                        </td>

                        {/* Siklus & Jadwal Berikutnya */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10.5px] font-semibold border border-blue-200/80 mb-1">
                            {c.frequency}
                          </span>
                          <div className="text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                            <CalendarCheck className="w-3 h-3 text-emerald-600" />
                            <span>{c.nextScheduleDate ? c.nextScheduleDate.split('T')[0] : '-'}</span>
                          </div>
                        </td>

                        {/* Progress Kuota Kunjungan */}
                        <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                          <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-700 mb-1">
                            <span>{c.completedVisitsCount} / {c.totalVisitsQuota} Visit</span>
                            <span className="text-blue-600">{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </td>

                        {/* Nilai Kontrak */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {formatRupiah(c.contractValue)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Nilai Perjanjian SLA</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {getStatusBadge(c.status)}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => onGenerateSpkFromContract(c)}
                              title="Terbitkan SPK Otomatis dari Jadwal Kontrak Ini"
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 fill-emerald-500 stroke-none" />
                              <span>Terbitkan SPK</span>
                            </button>
                            <button
                              onClick={() => setSelectedContractDetail(c)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                              title="Lihat Rincian SLA Kontrak"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredContracts.length > 0 && (
            <RetailPagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              totalItems={filteredContracts.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          )}
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE MONTHLY CALENDAR */}
      {activeTabMode === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          {/* Calendar Header Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                aria-label="Bulan Sebelumnya"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base font-semibold text-slate-900 min-w-[170px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={nextMonth}
                aria-label="Bulan Berikutnya"
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg ml-2 cursor-pointer"
              >
                Hari Ini
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Jadwal Kontrak B2B</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">SPK Reguler</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-600">SPK Darurat</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, idx) => (
              <div key={idx} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500">
                {dayName}
              </div>
            ))}

            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return (
                  <div key={idx} className="bg-slate-50/50 min-h-[90px] p-1.5 text-slate-300 text-xs">
                    {item.day}
                  </div>
                );
              }

              const isToday = item.dateStr === new Date().toISOString().slice(0, 10);
              
              // Find matching scheduled contracts
              const dayContracts = contracts.filter(c => c.nextScheduleDate === item.dateStr);
              // Find matching scheduled work orders
              const dayOrders = workOrders.filter(o => o.scheduledDate === item.dateStr);

              return (
                <div
                  key={idx}
                  className={`bg-white min-h-[90px] p-1.5 transition-colors flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/30 ring-1 ring-inset ring-blue-400' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${isToday ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center' : 'text-slate-700'}`}>
                      {item.day}
                    </span>
                    {(dayContracts.length > 0 || dayOrders.length > 0) && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                        {dayContracts.length + dayOrders.length} Event
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[70px]">
                    {/* Contract events */}
                    {dayContracts.map(c => (
                      <div
                        key={`c-${c.id}`}
                        onClick={() => setSelectedContractDetail(c)}
                        className="p-1 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-semibold truncate cursor-pointer hover:bg-emerald-100 transition-colors"
                        title={`Jadwal Pemeliharaan Kontrak: ${c.clientCompany} (${c.title})`}
                      >
                        🏢 {c.clientCompany.split(' ')[0]} - {c.title.slice(0, 15)}...
                      </div>
                    ))}

                    {/* Work order events */}
                    {dayOrders.map(o => (
                      <div
                        key={`o-${o.id}`}
                        onClick={() => onSelectWorkOrder(o)}
                        className={`p-1 rounded text-[10px] font-semibold truncate cursor-pointer transition-colors ${
                          o.priority === 'Darurat'
                            ? 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                            : 'bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100'
                        }`}
                        title={`SPK: ${o.id} - ${o.title}`}
                      >
                        {o.priority === 'Darurat' ? '🚨' : '🛠️'} {o.id}: {o.title.slice(0, 12)}...
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: DETAIL KONTRAK */}
      {selectedContractDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedContractDetail.contractNumber}
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-1">
                  {selectedContractDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedContractDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Perusahaan Klien:</span>
                  <span className="font-semibold text-slate-900">{selectedContractDetail.clientCompany}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nama PIC:</span>
                  <span className="font-semibold text-slate-900">{selectedContractDetail.clientName}</span>
                </div>
                {selectedContractDetail.clientPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kontak:</span>
                    <span className="font-semibold text-slate-900">{selectedContractDetail.clientPhone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Masa Kontrak:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedContractDetail.startDate?.split('T')[0]} s/d {selectedContractDetail.endDate?.split('T')[0]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-semibold uppercase">Frekuensi Servis</span>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedContractDetail.frequency}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Jadwal: {selectedContractDetail.nextScheduleDate}</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase">Nilai Kontrak</span>
                  <p className="font-semibold text-emerald-800 text-sm mt-0.5">{formatRupiah(selectedContractDetail.contractValue)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedContractDetail.completedVisitsCount} / {selectedContractDetail.totalVisitsQuota} Visit Tuntas</p>
                </div>
              </div>

              {selectedContractDetail.equipmentList && selectedContractDetail.equipmentList.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Daftar Perangkat / Mesin Tercakup:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContractDetail.equipmentList.map((eq, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px]">
                        🔧 {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedContractDetail.slaNotes && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                  <span className="text-[10px] font-semibold text-amber-800 uppercase block mb-0.5">Ketentuan SLA & Catatan Khusus:</span>
                  <p className="text-slate-700 text-xs italic">"{selectedContractDetail.slaNotes}"</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedContractDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const c = selectedContractDetail;
                  setSelectedContractDetail(null);
                  onGenerateSpkFromContract(c);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 fill-white stroke-none" />
                <span>Terbitkan SPK Jadwal Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR KONTRAK BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">B2B Maintenance Agreement</span>
                <h3 className="text-base font-semibold text-slate-900 flex items-center mt-0.5">
                  <FileText className="w-4 h-4 mr-1.5 text-blue-600" /> Pendaftaran Kontrak Kerja Sama Servis
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Judul Perjanjian / Kontrak *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: SLA Pemeliharaan Chiller & AHU Tahunan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Kontrak</label>
                  <input
                    type="text"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                    placeholder="CTR-2026-005"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perusahaan Klien *</label>
                  <input
                    type="text"
                    required
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="PT Industri Maju Bersama"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama PIC *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Bpk. Hendra"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Layanan</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daftar Mesin / Objek Servis (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  placeholder="Contoh: Chiller Daikin 100TR, Pompa Ebara 30kW, Panel Daya Utama"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mulai Kontrak</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Akhir Kontrak</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frekuensi Servis</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ContractFrequency)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {FREQUENCY_OPTIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kuota Visit</label>
                  <input
                    type="number"
                    min="1"
                    value={totalVisitsQuota}
                    onChange={(e) => setTotalVisitsQuota(e.target.value)}
                    placeholder="Contoh: 12"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nilai Kontrak (Rp)</label>
                  <input
                    type="text"
                    value={contractValue}
                    onChange={(e) => setContractValue(formatNumberInput(e.target.value))}
                    placeholder="Contoh: 24.000.000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teknisi PIC</label>
                  <select
                    value={assignedTechnicianId}
                    onChange={(e) => setAssignedTechnicianId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Teknisi</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ketentuan SLA / Catatan Perjanjian</label>
                <textarea
                  rows={2}
                  value={slaNotes}
                  onChange={(e) => setSlaNotes(e.target.value)}
                  placeholder="SLA Waktu Respon Darurat 2 Jam, garansi servis 30 hari..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
                >
                  Simpan Kontrak B2B
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
