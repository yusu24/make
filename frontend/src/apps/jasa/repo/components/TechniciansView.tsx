import React, { useState } from 'react';
import { Users, Star, Phone, Mail, CheckCircle2, Clock, AlertCircle, Award, Wrench, Search, ExternalLink, Shield, Plus, Pencil, Trash2, Key } from '@/constants/icons';
import { Technician, TechnicianStatus, WorkOrder } from '../types';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { TechnicianFormModal } from './TechnicianFormModal';
import { jasaApi } from '../services/jasaApi';
import '../../../retail/retail.css';

interface TechniciansViewProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  settings: any;
  onUpdateStatus: (techId: number, status: 'Tersedia' | 'Bertugas' | 'Izin / Cuti' | 'Siaga') => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
  onRefresh: () => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  workOrders,
  settings,
  onUpdateStatus,
  onSelectWorkOrder,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [toasts, setToasts] = useState<Array<{id: string, type: 'success'|'error', title: string, message: string}>>([]);

  const addToast = (type: 'success'|'error', title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = 
      !search ||
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(search.toLowerCase()) ||
      tech.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'Semua' || tech.currentStatus === statusFilter;

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
  } = usePagination(filteredTechs, 10);

  const getStatusBadge = (status: TechnicianStatus) => {
    switch (status) {
      case 'Tersedia':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Siap Tugas</span>;
      case 'Bertugas':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">🚗 Di Lapangan</span>;
      case 'Siaga':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">⚡ On-Call / Siaga</span>;
      case 'Izin / Cuti':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">⚪ Cuti / Libur</span>;
    }
  };

  const handleAdd = () => {
    setSelectedTech(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tech: Technician) => {
    setSelectedTech(tech);
    setIsModalOpen(true);
  };

  const handleDelete = async (tech: Technician) => {
    if (confirm(`Apakah Anda yakin ingin menghapus profil ${tech.name}?`)) {
      try {
        await jasaApi.deleteTechnician(tech.id);
        addToast('success', 'Dihapus', `Pegawai ${tech.name} berhasil dihapus.`);
        onRefresh();
      } catch (err) {
        addToast('error', 'Gagal', 'Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <div className={`mt-0.5 ${toast.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${toast.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {toast.title}
              </h4>
              <p className={`text-sm ${toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action & Filter Bar (Universal Height 38px) */}
      <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs mb-4">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:max-w-xs h-[38px] flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama atau keahlian teknisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs text-slate-800 outline-none bg-transparent placeholder:text-slate-400 font-normal"
            />
          </div>

          <div className="relative h-[38px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status kesiapan pekerja"
              className="h-full px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none cursor-pointer shadow-xs"
            >
              <option value="Semua">Semua Kesiapan</option>
              <option value="Tersedia">🟢 Siap Tugas</option>
              <option value="Bertugas">🚗 Di Lapangan</option>
              <option value="Siaga">⚡ Standby / Siaga</option>
              <option value="Izin / Cuti">⚪ Cuti / Libur</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="h-[38px] flex items-center gap-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pegawai</span>
          </button>
        </div>
      </div>

      {/* Technicians Table Container */}
      <div className="card table-wrap animate-fade-in">
        <div className="retail-table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-6 retail-table-header whitespace-nowrap">Teknisi & Spesialisasi</th>
                <th className="retail-table-header whitespace-nowrap">Rating & Kinerja</th>
                <th className="retail-table-header whitespace-nowrap">Keahlian Tambahan</th>
                <th className="retail-table-header whitespace-nowrap">Penugasan Aktif</th>
                <th className="retail-table-header whitespace-nowrap">Kontak</th>
                <th className="retail-table-header text-center whitespace-nowrap">Ubah Status</th>
                <th className="pr-6 retail-table-header text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Tidak ada teknisi yang sesuai pencarian/filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">Sesuaikan filter kesiapan atau reset pencarian</p>
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
                paginatedData.map((tech: Technician) => {
                  const activeOrder = tech.activeWorkOrderId ? workOrders.find(wo => wo.id === tech.activeWorkOrderId) : null;
                  
                  return (
                    <tr key={tech.id}>
                      <td className="pl-6 align-top">
                        <div className="flex items-start gap-3">
                          <img 
                            src={tech.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=random`} 
                            alt={tech.name} 
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=random`;
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">{tech.name}</div>
                            <div className="text-[11.5px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              {tech.specialty}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1">
                              {tech.user_id || tech.user ? (
                                <span 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  title={`Akun login aktif: ${tech.user?.email || tech.email || ''}`}
                                >
                                  <Key className="w-2.5 h-2.5" />
                                  <span>{tech.user?.jasaRole?.name || 'Akun Login Aktif'}</span>
                                </span>
                              ) : (
                                <span 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200"
                                  title="Teknisi ini belum memiliki akun login aplikasi. Klik Edit untuk membuat akun."
                                >
                                  Belum ada akun login
                                </span>
                              )}
                            </div>
                            <div className="mt-2 block sm:hidden">
                              {getStatusBadge(tech.currentStatus)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1 text-amber-500 font-semibold text-[13px]">
                            <Star className="w-4 h-4 fill-amber-500" />
                            {tech.rating} <span className="text-slate-400 text-[11px] font-normal ml-0.5">(Avg)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {tech.completedJobs} Pekerjaan Selesai
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {tech.skills?.map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10.5px] text-slate-600">
                              {skill}
                            </span>
                          ))}
                          {(!tech.skills || tech.skills.length === 0) && (
                            <span className="text-slate-400 italic text-[11px]">- Belum ada data -</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top">
                        {tech.currentStatus === 'Bertugas' && activeOrder ? (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 max-w-[220px]">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">{activeOrder.id}</span>
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-600">
                                <Clock className="w-3 h-3" /> SLA
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-800 truncate mb-1">
                              {activeOrder.customerName}
                            </div>
                            <div className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                              {activeOrder.serviceDescription}
                            </div>
                            <button 
                              onClick={() => onSelectWorkOrder(activeOrder)}
                              className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 w-full justify-center py-1 bg-white rounded-lg border border-blue-100 transition-colors"
                            >
                              Detail SPK <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs italic flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            Tidak ada penugasan aktif
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="flex flex-col gap-1.5 text-xs">
                          {tech.phone ? (
                            <a href={`https://wa.me/${tech.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors">
                              <Phone className="w-3.5 h-3.5" />
                              {tech.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">- No HP -</span>
                          )}
                          {tech.email ? (
                            <a href={`mailto:${tech.email}`} className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors truncate max-w-[120px]" title={tech.email}>
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{tech.email}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">- Email -</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top text-center">
                        <select
                          value={tech.currentStatus}
                          onChange={(e) => onUpdateStatus(tech.id, e.target.value as TechnicianStatus)}
                          disabled={tech.currentStatus === 'Bertugas'}
                          title={tech.currentStatus === 'Bertugas' ? "Pegawai sedang bertugas, tidak bisa diubah manual. Selesaikan SPK terlebih dahulu." : "Ubah status kesiapan pegawai"}
                          className={`
                            text-[11px] font-bold px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-2 cursor-pointer transition-colors
                            ${tech.currentStatus === 'Tersedia' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-500' : ''}
                            ${tech.currentStatus === 'Siaga' ? 'bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-500' : ''}
                            ${tech.currentStatus === 'Izin / Cuti' ? 'bg-slate-100 text-slate-700 border-slate-200 focus:ring-slate-400' : ''}
                            ${tech.currentStatus === 'Bertugas' ? 'bg-blue-50 text-blue-800 border-blue-200 cursor-not-allowed opacity-80' : ''}
                          `}
                        >
                          {tech.currentStatus === 'Bertugas' && <option value="Bertugas">🚗 Di Lapangan</option>}
                          <option value="Tersedia">🟢 Tersedia</option>
                          <option value="Siaga">⚡ Siaga (On-Call)</option>
                          <option value="Izin / Cuti">⚪ Izin / Cuti</option>
                        </select>
                        {tech.currentStatus === 'Bertugas' && (
                          <div className="mt-1.5 text-[9px] text-slate-400 leading-tight">Status terkunci otomatis<br/>oleh Sistem SPK.</div>
                        )}
                      </td>
                      <td className="pr-6 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEdit(tech)}
                            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Edit Data Pegawai"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(tech)}
                            className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Data Pegawai"
                          >
                            <Trash2 size={14} />
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

        {/* Pagination */}
        {filteredTechs.length > 0 && (
          <RetailPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={filteredTechs.length}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        )}
      </div>

      <TechnicianFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        technician={selectedTech}
        settings={settings}
        onSuccess={onRefresh}
        addToast={addToast}
      />
    </div>
  );
};
