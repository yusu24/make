import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  TrendingUp, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Droplet,
  Package,
  DollarSign,
  ArrowRight,
  Activity,
  HeartPulse
} from 'lucide-react';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';

const BudidayaGuide = () => {
  const terms = useBudidayaTerms();
  const [activeTab, setActiveTab] = useState('cycle');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan & SOP Operasional {terms.brandSub || 'Budidaya'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panduan Cara Penggunaan Modul {terms.brandName || 'Budidaya'}
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed">
            Panduan lengkap pemeliharaan komoditas {terms.commodity || 'Budidaya'}, mulai dari registrasi {terms.pond || 'kolam/lahan'}, input tebar bibit/benih, pencatatan pakan & nutrisi harian, sampling bobot & kalkulasi FCR otomatis, hingga panen dan pembukuan laba bersih siklus.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'cycle', label: `1. Siklus & ${terms.pond || 'Wadah'}`, icon: Layers },
          { id: 'feed', label: '2. Pakan / Nutrisi Harian', icon: Droplet },
          { id: 'sampling', label: '3. Sampling & FCR Otomatis', icon: Scale },
          { id: 'harvest', label: '4. Panen & Laba Siklus', icon: TrendingUp },
          { id: 'inventory', label: '5. Gudang Saprodi & Kas', icon: Package },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-teal-700 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Siklus */}
      {activeTab === 'cycle' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-teal-600" />
              <span>SOP Memulai Siklus {terms.cycle || 'Pemeliharaan'} Baru</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-xl flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900">Daftarkan {terms.pond || 'Kolam / Lahan'}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masukkan nomor/nama wadah, tipe (terpal, tanah, beton, bioflok, atau lahan terbuka/greenhouse), dan kapasitas luas/volume.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-xl flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900">Input Data Tebar / Tanam</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat populasi awal tebar (ekor/bibit), bobot awal rata-rata (ABW), harga bibit per satuan, dan tanggal mulai tebar.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-xl flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900">Tracking DOC/HST Otomatis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem otomatis menghitung Hari Setelah Tebar / Tanam (HST/DOC), Survival Rate (SR), dan mengestimasi tanggal panen.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-teal-900">
              <Lightbulb className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block">Tips Sukses Siklus:</strong>
                <p>Selalu catat perlakuan awal air / media tanah (pengapuran, pemupukan dasar, probiotik) sebelum menebar bibit agar tingkat kelangsungan hidup (SR) tinggi.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Pakan / Nutrisi */}
      {activeTab === 'feed' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Droplet className="w-6 h-6 text-emerald-600" />
              <span>SOP Pencatatan Pakan / Nutrisi Harian & Mortalitas</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pencatatan Pakan / Nutrisi Rutin:</span>
                </h3>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Buka rincian siklus aktif pada wadah yang bersangkutan.</li>
                  <li>Klik tombol <strong>+ Catat Pakan</strong>.</li>
                  <li>Pilih jenis pakan dari gudang dan masukkan jumlah Kg yang diberikan (Pagi, Siang, Sore/Malam).</li>
                  <li>Stok pakan di inventori gudang akan otomatis terpotong secara real-time dan nilai biayanya langsung dibukukan ke biaya siklus.</li>
                </ol>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Pencatatan Mortalitas / Kematian:</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika terjadi kematian benih/ikan/tanaman rusak, catat jumlahnya di kolom Mortalitas harian. Sistem akan merevisi estimasi populasi hidup, biomassa, dan menghitung persentase Survival Rate (SR) akurat.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Sampling & FCR */}
      {activeTab === 'sampling' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-blue-600" />
              <span>SOP Sampling Bobot & Efisiensi Pakan (FCR)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs text-slate-700">
                <strong className="text-sm font-bold text-blue-900 block">Kalkulasi FCR Otomatis:</strong>
                <p className="font-mono bg-white p-2.5 rounded-lg border border-blue-200 text-blue-950 font-bold">
                  FCR = Total Pakan Diberikan (Kg) ÷ Pertambahan Biomassa (Kg)
                </p>
                <p className="text-slate-600 pt-1">
                  Angka FCR di bawah 1.3 menunjukkan penggunaan pakan sangat efisien, sehingga biaya modal pakan dapat ditekan seminimal mungkin.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                <strong className="text-sm font-bold text-slate-900 block">Prosedur Sampling Berkala:</strong>
                <p>Lakukan sampling setiap 7-10 hari sekali dengan mengambil acak 30-50 sampel ekor, timbang total bobotnya, lalu sistem menghitung Average Body Weight (ABW) dan Average Daily Gain (ADG).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Panen */}
      {activeTab === 'harvest' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <span>SOP Panen & Rekapitulasi Laba Bersih Siklus</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                Saat tiba waktu panen (baik panen parsial maupun panen total):
              </p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Buka siklus aktif dan klik <strong>+ Catat Panen</strong>.</li>
                <li>Masukkan tonase / total kilogram panen yang tertimbang, size (jumlah ekor per kg), dan harga jual per kg.</li>
                <li>Pilih metode pembayaran pembeli / tengkulak (Lunas Tunai / Transfer / Piutang).</li>
                <li>Sistem mengkalkulasikan <strong>Laba Bersih Siklus</strong> dengan membandingkan Pendapatan Panen vs Total Modal (Bibit + Pakan + Obat/Saprodi + Biaya Operasional Listrik/Gaji).</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Inventori & Kas */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-amber-600" />
              <span>Gudang Saprodi, Pakan & Buku Kas Pengeluaran</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">📦 Gudang Pakan & Obat</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat pembelian pakan karungan, probiotik, vitamin, dan disinfektan. Stok otomatis berkurang setiap kali ada penginputan pakan harian ke wadah.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">💳 Buku Kas & Biaya Operasional</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat pengeluaran listrik kincir/pompa, solar genset, biaya tenaga kerja harian, dan perawatan wadah agar perhitungan HPP panen tidak meleset.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudidayaGuide;
