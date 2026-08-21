import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  UserCheck, 
  AlertCircle, 
  Plus, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Trash2,
  Send
} from 'lucide-react';
import { WorkOrder, ServiceStatus, PriorityLevel, Technician } from '../types';
import { formatRupiah } from '../data/mockData';

interface WorkOrderDetailModalProps {
  order: WorkOrder | null;
  technicians: Technician[];
  onClose: () => void;
  onUpdateOrder: (updatedOrder: WorkOrder) => void;
  onPrintOrder: (order: WorkOrder) => void;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  order,
  technicians,
  onClose,
  onUpdateOrder,
  onPrintOrder
}) => {
  if (!order) return null;

  const [currentOrder, setCurrentOrder] = useState<WorkOrder>(order);
  const [newLogNote, setNewLogNote] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartCost, setNewPartCost] = useState(100000);
  const [showAddPart, setShowAddPart] = useState(false);

  const handleStatusChange = (newStatus: ServiceStatus) => {
    const updatedLogs = [
      ...currentOrder.logs,
      {
        id: `L-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        author: 'Staff Operasional Jasa',
        action: `Ubah Status ke ${newStatus}`,
        notes: `Status pekerjaan diperbarui dari "${currentOrder.status}" menjadi "${newStatus}".`
      }
    ];

    const updated: WorkOrder = {
      ...currentOrder,
      status: newStatus,
      completionDate: newStatus === 'Selesai' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : currentOrder.completionDate,
      logs: updatedLogs
    };

    setCurrentOrder(updated);
    onUpdateOrder(updated);
  };

  const handleTechnicianChange = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    if (!tech) return;

    const updatedLogs = [
      ...currentOrder.logs,
      {
        id: `L-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        author: 'Dispatch Manager',
        action: 'Re-alokasi Teknisi',
        notes: `Penugasan dialihkan kepada ${tech.name} (${tech.specialty}).`
      }
    ];

    const updated: WorkOrder = {
      ...currentOrder,
      assignedTechnicianId: tech.id,
      technicianName: tech.name,
      logs: updatedLogs
    };

    setCurrentOrder(updated);
    onUpdateOrder(updated);
  };

  const handleAddLogNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const updatedLogs = [
      ...currentOrder.logs,
      {
        id: `L-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        author: 'Teknisi / Supervisor',
        action: 'Catatan Lapangan',
        notes: newLogNote.trim()
      }
    ];

    const updated = { ...currentOrder, logs: updatedLogs };
    setCurrentOrder(updated);
    onUpdateOrder(updated);
    setNewLogNote('');
  };

  const handleAddSparePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;

    const newPart = {
      id: `P-${Date.now()}`,
      name: newPartName.trim(),
      quantity: Number(newPartQty),
      unitCost: Number(newPartCost)
    };

    const updatedParts = [...currentOrder.partsUsed, newPart];
    const totalPartsCost = updatedParts.reduce((acc, p) => acc + (p.quantity * p.unitCost), 0);
    const grandTotal = totalPartsCost + currentOrder.totalLaborCost;

    const updatedLogs = [
      ...currentOrder.logs,
      {
        id: `L-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        author: 'Gudang & Logistik',
        action: 'Sparepart Ditambahkan',
        notes: `Ditambahkan: ${newPart.name} (${newPart.quantity}x @ ${formatRupiah(newPart.unitCost)}).`
      }
    ];

    const updated = {
      ...currentOrder,
      partsUsed: updatedParts,
      totalPartsCost,
      grandTotal,
      logs: updatedLogs
    };

    setCurrentOrder(updated);
    onUpdateOrder(updated);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartCost(100000);
    setShowAddPart(false);
  };

  const handleRemovePart = (partId: string) => {
    const updatedParts = currentOrder.partsUsed.filter(p => p.id !== partId);
    const totalPartsCost = updatedParts.reduce((acc, p) => acc + (p.quantity * p.unitCost), 0);
    const grandTotal = totalPartsCost + currentOrder.totalLaborCost;

    const updated = {
      ...currentOrder,
      partsUsed: updatedParts,
      totalPartsCost,
      grandTotal
    };

    setCurrentOrder(updated);
    onUpdateOrder(updated);
  };

  const statusList: ServiceStatus[] = [
    'Menunggu Konfirmasi',
    'Dijadwalkan',
    'Dalam Perjalanan',
    'Sedang Dikerjakan',
    'Menunggu Sparepart',
    'Uji Coba & QC',
    'Selesai',
    'Dibatalkan'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {currentOrder.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                currentOrder.priority === 'Darurat' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse font-semibold' :
                currentOrder.priority === 'Tinggi' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                Prioritas {currentOrder.priority}
              </span>
              <span className="text-xs text-slate-500">
                Kategori: <strong className="text-slate-800 font-semibold">{currentOrder.category}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mt-2">{currentOrder.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPrintOrder(currentOrder)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Cetak SPK</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          
          {/* Quick Status Control & Assigned Technician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Ubah Status Pengerjaan (Live Stage)
              </label>
              <select
                value={currentOrder.status}
                onChange={(e) => handleStatusChange(e.target.value as ServiceStatus)}
                aria-label="Pilih status pengerjaan SPK"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
              >
                {statusList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Perubahan status otomatis tercatat pada riwayat audit SPK.</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Teknisi Bertanggung Jawab
              </label>
              <select
                value={currentOrder.assignedTechnicianId}
                onChange={(e) => handleTechnicianChange(e.target.value)}
                aria-label="Pilih teknisi penanggung jawab"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.specialty} ({t.currentStatus})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Tarif Jasa: {formatRupiah(currentOrder.laborRate)} ({currentOrder.estimatedHours} Jam)</p>
            </div>
          </div>

          {/* Customer & Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Informasi Klien / Pemesan
              </h3>
              <div>
                <div className="font-semibold text-slate-900 text-base">{currentOrder.customerCompany}</div>
                <div className="text-xs text-slate-500 font-medium">PIC: {currentOrder.customerName}</div>
              </div>
              <div className="flex items-center text-xs text-slate-600 space-x-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentOrder.customerPhone}</span>
              </div>
              <div className="flex items-center text-xs text-slate-600 space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentOrder.customerEmail}</span>
              </div>
              <div className="flex items-start text-xs text-slate-600 space-x-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{currentOrder.customerAddress}</span>
              </div>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Objek Servis & Garansi
              </h3>
              <div>
                <div className="font-semibold text-slate-900 text-base">{currentOrder.equipmentName}</div>
                <div className="text-xs text-slate-500 font-mono">S/N: {currentOrder.serialNumber || 'N/A (General Installation)'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <div className="text-slate-400 text-[10px] font-semibold">Tenggat SLA</div>
                  <div className="font-semibold text-amber-700 mt-0.5">{currentOrder.slaDeadline}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <div className="text-slate-400 text-[10px] font-semibold">Masa Garansi</div>
                  <div className="font-semibold text-emerald-700 mt-0.5">{currentOrder.warrantyPeriod}</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 pt-1">
                Status Pembayaran: <strong className="text-blue-700 font-semibold">{currentOrder.paymentStatus}</strong>
              </div>
            </div>
          </div>

          {/* Issue Description & Root Cause */}
          <div className="space-y-3">
            <div>
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Keluhan / Ruang Lingkup Permintaan Servis
              </h3>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
                {currentOrder.serviceDescription}
              </div>
            </div>

            {currentOrder.rootCauseNotes && (
              <div>
                <h3 className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mb-1.5 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Diagnosa Penyebab Akar (Root Cause Analysis)
                </h3>
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-900 text-xs leading-relaxed font-medium">
                  {currentOrder.rootCauseNotes}
                </div>
              </div>
            )}
          </div>

          {/* Spare Parts & Cost Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-emerald-600" /> Rincian Biaya Suku Cadang & Jasa
              </h3>
              <button
                onClick={() => setShowAddPart(!showAddPart)}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center space-x-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tambah Sparepart</span>
              </button>
            </div>

            {/* Form Add Spare Part */}
            {showAddPart && (
              <form onSubmit={handleAddSparePart} className="mb-4 p-3.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-end gap-2.5 shadow-2xs">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Suku Cadang / Material</label>
                  <input
                    type="text"
                    required
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    placeholder="e.g. Refrigerant R410A / Relay 24V"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPartQty}
                    onChange={(e) => setNewPartQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    value={newPartCost}
                    onChange={(e) => setNewPartCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="flex space-x-1.5">
                  <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs">
                    Simpan
                  </button>
                  <button type="button" onClick={() => setShowAddPart(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {/* Parts List */}
            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="py-2 px-3 font-semibold uppercase text-[10px]">Item Material / Jasa</th>
                    <th className="py-2 px-3 font-semibold uppercase text-[10px] text-center">Qty</th>
                    <th className="py-2 px-3 font-semibold uppercase text-[10px] text-right">Harga Satuan</th>
                    <th className="py-2 px-3 font-semibold uppercase text-[10px] text-right">Subtotal</th>
                    <th className="py-2 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentOrder.partsUsed.map(part => (
                    <tr key={part.id}>
                      <td className="py-2.5 px-3 font-medium">{part.name}</td>
                      <td className="py-2.5 px-3 text-center font-semibold">{part.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{formatRupiah(part.unitCost)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{formatRupiah(part.quantity * part.unitCost)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={() => handleRemovePart(part.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Hapus part"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Labor Cost Row */}
                  <tr className="bg-blue-50/40">
                    <td className="py-2.5 px-3 font-semibold text-blue-900">
                      Jasa Layanan Teknisi ({currentOrder.estimatedHours} Jam Kerja)
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-blue-800">1 Paket</td>
                    <td className="py-2.5 px-3 text-right text-blue-800">{formatRupiah(currentOrder.laborRate)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-blue-900">{formatRupiah(currentOrder.totalLaborCost)}</td>
                    <td></td>
                  </tr>
                </tbody>
                <tfoot className="border-t border-slate-200 font-semibold bg-slate-50/60 text-slate-900">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right uppercase text-xs tracking-wider">Total Biaya (Grand Total):</td>
                    <td className="py-3 px-3 text-right text-emerald-700 text-sm font-semibold">{formatRupiah(currentOrder.grandTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Audit Logs & Technician Updates */}
          <div>
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Riwayat Aktivitas & Catatan Lapangan
            </h3>
            
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
              {currentOrder.logs.map((log) => (
                <div key={log.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold text-blue-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp} • oleh {log.author}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{log.notes}</p>
                </div>
              ))}
            </div>

            {/* Quick Add Log Note */}
            <form onSubmit={handleAddLogNote} className="flex gap-2">
              <input
                type="text"
                value={newLogNote}
                onChange={(e) => setNewLogNote(e.target.value)}
                placeholder="Tambahkan catatan teknisi / progress penanganan..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!newLogNote.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Dibuat pada: <strong className="text-slate-700">{currentOrder.createdAt}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
