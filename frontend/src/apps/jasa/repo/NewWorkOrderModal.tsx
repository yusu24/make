import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ClipboardCheck, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Sparkles 
} from 'lucide-react';
import { 
  WorkOrder, 
  Technician, 
  ServiceCategory, 
  PriorityLevel, 
  ServiceItemRequirement 
} from '../types';
import { formatRupiah } from '../data/mockData';

interface NewWorkOrderModalProps {
  technicians: Technician[];
  onClose: () => void;
  onSubmit: (newOrder: WorkOrder) => void;
  onOpenAiAssistant?: () => void;
}

const CATEGORIES: ServiceCategory[] = [
  'Pemeliharaan Berkala (Preventive)',
  'Perbaikan & Troubleshooting (Corrective)',
  'Instalasi & Commissioning',
  'Kalibrasi & Pengujian',
  'Konsultasi & Audit Teknis',
  'Upgrade & Modifikasi'
];

export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({
  technicians,
  onClose,
  onSubmit,
  onOpenAiAssistant
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Perbaikan & Troubleshooting (Corrective)');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Sedang');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(technicians[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [estimatedHours, setEstimatedHours] = useState(3);
  const [laborRate, setLaborRate] = useState(750000);
  const [serviceDescription, setServiceDescription] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('30 Hari');

  // Parts list
  const [parts, setParts] = useState<ServiceItemRequirement[]>([
    { id: '1', name: 'Material Pembersih / Kontak Pembersih', quantity: 1, unitCost: 150000 }
  ]);

  const [partNameInput, setPartNameInput] = useState('');
  const [partQtyInput, setPartQtyInput] = useState(1);
  const [partCostInput, setPartCostInput] = useState(100000);

  const handleAddPart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!partNameInput.trim()) return;
    setParts([
      ...parts,
      {
        id: `${Date.now()}`,
        name: partNameInput.trim(),
        quantity: Number(partQtyInput),
        unitCost: Number(partCostInput)
      }
    ]);
    setPartNameInput('');
    setPartQtyInput(1);
    setPartCostInput(100000);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const totalPartsCost = parts.reduce((sum, p) => sum + (p.quantity * p.unitCost), 0);
  const totalLaborCost = Number(laborRate);
  const grandTotal = totalPartsCost + totalLaborCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !customerCompany || !equipmentName || !serviceDescription) {
      alert('Harap lengkapi semua field yang berbintang (*)');
      return;
    }

    const assignedTech = technicians.find(t => t.id === assignedTechnicianId);
    const orderIdNumber = Math.floor(1000 + Math.random() * 9000);
    const newId = `SPK-2026-${orderIdNumber}`;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newOrder: WorkOrder = {
      id: newId,
      title: title.trim(),
      customerName: customerName.trim() || customerCompany.trim(),
      customerCompany: customerCompany.trim(),
      customerPhone: customerPhone.trim() || '0812-0000-0000',
      customerEmail: customerEmail.trim() || 'pic@perusahaan.co.id',
      customerAddress: customerAddress.trim() || 'Jakarta & Sekitarnya',
      category,
      equipmentName: equipmentName.trim(),
      serialNumber: serialNumber.trim() || undefined,
      priority,
      status: 'Dijadwalkan',
      createdAt: nowStr,
      scheduledDate,
      scheduledTime,
      assignedTechnicianId,
      technicianName: assignedTech ? assignedTech.name : 'Tim Teknisi Jasa',
      estimatedHours: Number(estimatedHours),
      laborRate: Number(laborRate),
      serviceDescription: serviceDescription.trim(),
      partsUsed: parts,
      totalPartsCost,
      totalLaborCost,
      grandTotal,
      paymentStatus: 'Belum Bayar',
      warrantyPeriod,
      slaDeadline: `${scheduledDate} 17:00`,
      logs: [
        {
          id: `L-${Date.now()}`,
          timestamp: nowStr,
          author: 'Customer Service & Dispatcher',
          action: 'SPK Diterbitkan',
          notes: `SPK baru diterbitkan dan dialokasikan ke teknisi ${assignedTech?.name || 'Teknisi'}.`
        }
      ]
    };

    onSubmit(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Order Creation</span>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Terbitkan Surat Perintah Kerja (SPK)</h2>
              <p className="text-xs text-slate-500">Isi data permintaan servis, objek kerja, dan alokasi teknisi lapangan</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenAiAssistant && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Bantu Estimasi AI</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm text-slate-700">
          
          {/* Section 1: Ringkasan Tugas SPK */}
          <div className="space-y-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-widest block">1. Informasi Pekerjaan & Layanan</span>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul SPK / Perintah Kerja *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Perbaikan Darurat Chiller VRV Gedung Tower B"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Layanan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  aria-label="Pilih kategori layanan jasa"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs shadow-2xs"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  aria-label="Pilih prioritas SPK"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                >
                  <option value="Darurat">🚨 Darurat (Immediate)</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teknisi Ditugaskan
                </label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  aria-label="Pilih teknisi yang ditugaskan"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs shadow-2xs"
                >
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.currentStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Servis
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam Mulai
                </label>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Kendala / Ruang Lingkup Pengerjaan *
              </label>
              <textarea
                required
                rows={2}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Rincikan gejala kerusakan, batas tanggung jawab pengerjaan, instruksi khusus teknisi..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Data Pelanggan & Objek Servis */}
          <div className="space-y-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest block">2. Data Pelanggan & Objek Servis</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Perusahaan / Klien *</label>
                <input
                  type="text"
                  required
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  placeholder="PT Sinarmas / RS Graha Medika"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama PIC Lapangan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ir. Handoko Prasetyo"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Kontak / WA</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lokasi Pengerjaan</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Jl. Jend Sudirman Kav 51, Gedung Plaza Tower Lt 14"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objek / Nama Alat *</label>
                <input
                  type="text"
                  required
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  placeholder="Daikin VRV 30 HP / Genset Perkins"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Estimasi Biaya & Sparepart Awal */}
          <div className="space-y-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest block">3. Estimasi Biaya Jasa & Sparepart</span>
              <div className="text-xs text-slate-500">
                Total Estimasi: <strong className="text-emerald-700 text-sm font-semibold">{formatRupiah(grandTotal)}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Jam Kerja</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Biaya Jasa (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  value={laborRate}
                  onChange={(e) => setLaborRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Garansi Pekerjaan</label>
                <input
                  type="text"
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(e.target.value)}
                  placeholder="30 Hari / 60 Hari"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            {/* Initial Spare Parts Entry */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">Kebutuhan Suku Cadang / Material Awal:</label>
              
              <div className="flex flex-wrap gap-2 mb-2.5">
                <input
                  type="text"
                  placeholder="Nama material (e.g. Oli Mesin 20L / Sensor Valve)"
                  value={partNameInput}
                  onChange={(e) => setPartNameInput(e.target.value)}
                  className="flex-1 min-w-[160px] bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-2xs"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={partQtyInput}
                  onChange={(e) => setPartQtyInput(Number(e.target.value))}
                  className="w-16 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-2xs"
                />
                <input
                  type="number"
                  step="10000"
                  placeholder="Harga Satuan"
                  value={partCostInput}
                  onChange={(e) => setPartCostInput(Number(e.target.value))}
                  className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {parts.length > 0 && (
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 max-h-32 overflow-y-auto shadow-2xs">
                  {parts.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-slate-700 font-medium">{p.name} ({p.quantity}x)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-700 font-semibold">{formatRupiah(p.quantity * p.unitCost)}</span>
                        <button type="button" onClick={() => handleRemovePart(p.id)} className="text-rose-500 hover:text-rose-700 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all hover:scale-[1.01]"
            >
              Terbitkan SPK Sekarang
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
