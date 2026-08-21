import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Wrench, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Cpu,
  FileCheck
} from 'lucide-react';
import { AIDiagnosisResult, ServiceCategory, PriorityLevel } from '../types';
import { formatRupiah } from '../data/mockData';

interface AiDiagnosticsModalProps {
  onClose: () => void;
  onApplyToNewSpk: (data: {
    category: ServiceCategory;
    equipmentName: string;
    priority: PriorityLevel;
    estimatedHours: number;
    laborRate: number;
    description: string;
    recommendedParts: { name: string; estimatedCost: number }[];
  }) => void;
}

export const AiDiagnosticsModal: React.FC<AiDiagnosticsModalProps> = ({
  onClose,
  onApplyToNewSpk
}) => {
  const [problemDescription, setProblemDescription] = useState(
    'Chiller outdoor Daikin trip error E3 tekanan tinggi saat cuaca panas. Suhu ruang server tidak stabil dan fan outdoor berisik tidak berputar konstan.'
  );
  const [equipmentType, setEquipmentType] = useState('Chiller VRV Daikin 30HP');
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('Perbaikan & Troubleshooting (Corrective)');
  const [urgency, setUrgency] = useState<PriorityLevel>('Darurat');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIDiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/diagnose-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription,
          equipmentType,
          serviceCategory,
          urgency
        })
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi modul AI.');
      }

      const data: AIDiagnosisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Terjadi kendala saat memproses diagnosa AI. Memuat mode estimasi lokal.');
      // Smart offline fallback
      setResult({
        diagnosis: `Diagnosa teknis untuk ${equipmentType}: Kemungkinan penyumbatan pada jalur refrigerant, kegagalan motor fan kompresor, atau sensor tekanan EEV aus.`,
        estimatedHours: urgency === 'Darurat' ? 4 : 3,
        complexity: 'Tinggi',
        recommendedParts: [
          { name: 'Sensor Tekanan / Expansion Valve', estimatedCost: 850000 },
          { name: 'Refrigerant R410A / R32 Murni', estimatedCost: 650000 },
          { name: 'Flushing & Contact Cleaner Industri', estimatedCost: 150000 }
        ],
        estimatedLaborCost: 650000,
        suggestedTechnicianSkills: ['Teknisi Senior HVAC Bersertifikat', 'Keahlian Uji Tekanan Manifold'],
        safetyPrecautions: [
          'Matikan saklar pemutus daya utama (Breaker Lockout/Tagout)',
          'Gunakan kacamata pelindung dan sarung tangan saat menangani gas bertekanan'
        ],
        quotationSummary: `Estimasi pekerjaan perbaikan ${equipmentType} mencakup penggantian sensor, pembersihan jalur kondensor, dan uji kestabilan suhu 1 jam.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyToNewSpk({
      category: serviceCategory,
      equipmentName: equipmentType,
      priority: urgency,
      estimatedHours: result.estimatedHours || 3,
      laborRate: result.estimatedLaborCost || 500000,
      description: `${problemDescription}\n\n[Diagnosa AI]: ${result.diagnosis}`,
      recommendedParts: result.recommendedParts || []
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-semibold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">AI Intelligence</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Gemini Flash
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5">Asisten Diagnosa & Estimator Jasa</h2>
              <p className="text-xs text-slate-500">Analisis kerusakan otomatis, estimasi suku cadang, jam kerja teknisi, dan draf SPK</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm text-slate-700">
          
          {/* Input Form */}
          <form onSubmit={handleDiagnose} className="space-y-3.5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Alat / Objek Servis</label>
                <input
                  type="text"
                  required
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  placeholder="e.g. Genset Perkins 500kVA / Pompa Booster"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs font-medium shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Jasa</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                  aria-label="Kategori jasa untuk diagnosa AI"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs font-semibold shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Perbaikan & Troubleshooting (Corrective)">Perbaikan & Troubleshooting</option>
                  <option value="Pemeliharaan Berkala (Preventive)">Pemeliharaan Berkala</option>
                  <option value="Instalasi & Commissioning">Instalasi & Setup</option>
                  <option value="Kalibrasi & Pengujian">Kalibrasi & Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgensi Kasus</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as PriorityLevel)}
                  aria-label="Tingkat urgensi kasus servis"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs font-semibold shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Darurat">🚨 Darurat (Stop Produksi)</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Kendala dari Pelanggan / Gejala Masalah *
              </label>
              <textarea
                rows={2}
                required
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Ceritakan detail kerusakan atau pesan error yang muncul..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-xs shadow-2xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Kerusakan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Jalankan Diagnosa & Estimasi AI</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* AI Result Card */}
          {result && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-slate-900 text-sm">Hasil Rekomendasi Teknis AI</span>
                </div>
                <span className="text-xs text-slate-500">
                  Kompleksitas: <strong className="text-amber-700 font-semibold">{result.complexity || 'Sedang'}</strong>
                </span>
              </div>

              {/* Diagnosis Narrative */}
              <div>
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  1. Analisa Diagnostik Masalah
                </h4>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs font-medium shadow-2xs">
                  {result.diagnosis}
                </div>
              </div>

              {/* Cost & Hours Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-blue-600" /> Estimasi Durasi Pengerjaan
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">
                    {result.estimatedHours} Jam Kerja
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Estimasi Biaya Jasa: <strong className="text-blue-700">{formatRupiah(result.estimatedLaborCost || 450000)}</strong>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center">
                    <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Estimasi Total Sparepart
                  </div>
                  <div className="text-lg font-semibold text-emerald-700 mt-1">
                    {formatRupiah((result.recommendedParts || []).reduce((acc, p) => acc + p.estimatedCost, 0))}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {(result.recommendedParts || []).length} jenis suku cadang disarankan
                  </div>
                </div>
              </div>

              {/* Recommended Spare Parts */}
              {result.recommendedParts && result.recommendedParts.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                    <Wrench className="w-3.5 h-3.5 mr-1 text-slate-400" /> Rekomendasi Suku Cadang & Bahan
                  </h4>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    {result.recommendedParts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-slate-700 font-medium">• {p.name}</span>
                        <span className="font-semibold text-emerald-700">{formatRupiah(p.estimatedCost)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Precautions */}
              {result.safetyPrecautions && result.safetyPrecautions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-rose-700 uppercase tracking-widest mb-1.5 flex items-center">
                    <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" /> Langkah Keselamatan Kerja (K3) Teknisi
                  </h4>
                  <ul className="space-y-1 bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-900 font-medium">
                    {result.safetyPrecautions.map((safe, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-rose-600 font-semibold">⚠️</span>
                        <span>{safe}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quotation Summary */}
              {result.quotationSummary && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                    <FileCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Draf Penawaran / Ringkasan SPK
                  </h4>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs italic text-slate-700 shadow-2xs">
                    "{result.quotationSummary}"
                  </div>
                </div>
              )}

              {/* Apply Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApply}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                >
                  <span>Terapkan Hasil ke Formulir SPK Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
