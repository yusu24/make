import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Tag, 
  Wrench,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { ServiceCatalogItem, ServiceCategory } from '../types';
import { formatRupiah } from '../data/mockData';

interface ServiceCatalogViewProps {
  catalog: ServiceCatalogItem[];
  onAddCatalogItem: (newItem: ServiceCatalogItem) => void;
  onSelectCatalogForSpk: (item: ServiceCatalogItem) => void;
}

const CATEGORIES = [
  'Semua',
  'Pemeliharaan Berkala (Preventive)',
  'Perbaikan & Troubleshooting (Corrective)',
  'Instalasi & Commissioning',
  'Kalibrasi & Pengujian',
  'Konsultasi & Audit Teknis'
];

export const ServiceCatalogView: React.FC<ServiceCatalogViewProps> = ({
  catalog,
  onAddCatalogItem,
  onSelectCatalogForSpk
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Catalog Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Pemeliharaan Berkala (Preventive)');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(1500000);
  const [estimatedDurationHours, setEstimatedDurationHours] = useState(3);
  const [warrantyDays, setWarrantyDays] = useState(30);
  const [requiredSkillLevel, setRequiredSkillLevel] = useState<'Junior' | 'Madya' | 'Senior' | 'Spesialis Ahli'>('Madya');

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = 
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCat === 'Semua' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    const newItem: ServiceCatalogItem = {
      id: `CAT-${Date.now()}`,
      code: code.trim() || `SRV-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      description: description.trim(),
      basePrice: Number(basePrice),
      estimatedDurationHours: Number(estimatedDurationHours),
      warrantyDays: Number(warrantyDays),
      requiredSkillLevel,
      recommendedParts: ['Material Standar & APD'],
      activeOrdersCount: 0
    };

    onAddCatalogItem(newItem);
    setShowAddModal(false);
    setName('');
    setCode('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Master Data & SLA</span>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center space-x-2 mt-0.5">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Katalog Layanan Jasa & Standar Tarif Operasional</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Daftar paket jasa resmi, estimasi durasi SLA pengerjaan, dan ketentuan garansi servis
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Paket Layanan</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCat === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode layanan atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalog.map(item => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Code & Category */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80">
                  {item.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Level: {item.requiredSkillLevel}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">{item.category}</p>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {item.description}
              </p>

              {/* Specs & Recommendations */}
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] font-semibold flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> Estimasi SLA
                  </div>
                  <div className="font-semibold text-slate-800 mt-1">{item.estimatedDurationHours} Jam Pengerjaan</div>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <div className="text-emerald-700 text-[10px] font-semibold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Garansi Kerja
                  </div>
                  <div className="font-semibold text-emerald-700 mt-1">{item.warrantyDays} Hari Kalender</div>
                </div>
              </div>

              {/* Recommended Consumables */}
              {item.recommendedParts.length > 0 && (
                <div className="mt-3.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center">
                    <Wrench className="w-3 h-3 mr-1 text-slate-400" /> Material & APD:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.recommendedParts.map((part, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">Tarif Standar Jasa</div>
                <div className="text-base font-semibold text-slate-900 mt-0.5">{formatRupiah(item.basePrice)}</div>
              </div>

              <button
                onClick={() => onSelectCatalogForSpk(item)}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-2xs"
              >
                Gunakan di SPK →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Catalog Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-600">Form Master Data</span>
                <h3 className="text-lg font-semibold text-slate-900 flex items-center mt-0.5">
                  <Plus className="w-4 h-4 mr-1.5 text-indigo-600 stroke-[3]" /> Tambah Paket Layanan Jasa
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Layanan *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kalibrasi Sensor Tekanan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Layanan</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SRV-CAL-08"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  aria-label="Kategori layanan jasa baru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.filter(c => c !== 'Semua').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Ruang Lingkup Kerja *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rincian prosedur teknis dan cakupan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Dasar (Rp)</label>
                  <input
                    type="number"
                    step="50000"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Jam)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedDurationHours}
                    onChange={(e) => setEstimatedDurationHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Garansi (Hari)</label>
                  <input
                    type="number"
                    value={warrantyDays}
                    onChange={(e) => setWarrantyDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/25 transition-all"
                >
                  Simpan Paket Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
