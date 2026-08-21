import React, { useState } from 'react';
import { 
  Users, 
  Star, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  Wrench,
  Search,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Technician, TechnicianStatus, WorkOrder } from '../types';

interface TechniciansViewProps {
  technicians: Technician[];
  workOrders: WorkOrder[];
  onUpdateStatus: (techId: string, newStatus: TechnicianStatus) => void;
  onSelectWorkOrder: (order: WorkOrder) => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  workOrders,
  onUpdateStatus,
  onSelectWorkOrder
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = 
      !search ||
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.specialty.toLowerCase().includes(search.toLowerCase()) ||
      tech.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'Semua' || tech.currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Manajemen Personel</span>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center space-x-2 mt-0.5">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Matriks & Kesiapan Tim Teknisi Lapangan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monitoring kesiapan personel teknis, keahlian khusus, sertifikasi K3, dan penugasan real-time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, keahlian, spesialisasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status kesiapan teknisi"
              className="bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            >
              <option value="Semua">Semua Kesiapan</option>
              <option value="Tersedia">🟢 Siap Tugas</option>
              <option value="Bertugas">🚗 Di Lapangan</option>
              <option value="Siaga">⚡ Standby / Siaga</option>
              <option value="Izin / Cuti">⚪ Cuti / Libur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Bento Technician Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechs.map((tech) => {
          const activeOrder = tech.activeWorkOrderId 
            ? workOrders.find(o => o.id === tech.activeWorkOrderId)
            : undefined;

          return (
            <div
              key={tech.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 leading-tight">{tech.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">{tech.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center text-amber-500 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                          <span>{tech.rating}</span>
                        </div>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-xs text-slate-500 font-semibold">{tech.completedJobs} SPK Selesai</span>
                      </div>
                    </div>
                  </div>

                  <div>{getStatusBadge(tech.currentStatus)}</div>
                </div>

                {/* Contact row */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">{tech.email}</span>
                  </div>
                </div>

                {/* Active Assignment if on duty */}
                {activeOrder ? (
                  <div className="mt-3.5 p-3 rounded-2xl bg-blue-50 border border-blue-100 text-xs">
                    <div className="flex items-center justify-between text-blue-800 font-semibold mb-1">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> Tugas Berjalan:
                      </span>
                      <button
                        onClick={() => onSelectWorkOrder(activeOrder)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center font-semibold"
                      >
                        <span>{activeOrder.id}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                    <p className="text-slate-800 truncate font-semibold">{activeOrder.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">📍 {activeOrder.customerCompany}</p>
                  </div>
                ) : (
                  <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center space-x-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tidak ada penugasan aktif (Standby)</span>
                  </div>
                )}

                {/* Skills & Certifications */}
                <div className="mt-4 space-y-2.5">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                      <Wrench className="w-3 h-3 mr-1 text-slate-400" /> Keahlian Teknis
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tech.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center">
                      <Shield className="w-3 h-3 mr-1 text-indigo-500" /> Sertifikasi K3 & OEM
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tech.certifications.map((cert, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Switcher Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Ubah Status:</span>
                <div className="flex items-center space-x-1">
                  {(['Tersedia', 'Bertugas', 'Siaga', 'Izin / Cuti'] as TechnicianStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(tech.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        tech.currentStatus === st
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {st.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
