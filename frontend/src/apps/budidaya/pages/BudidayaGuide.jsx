import React, { useState } from 'react';
import { 
  BookOpen, 
  Fish, 
  Droplet, 
  Layers, 
  TrendingUp, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ShieldCheck,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';

const BudidayaGuide = () => {
  const terms = useBudidayaTerms();
  const [activeTab, setActiveTab] = useState('cycle');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan & SOP Operasional Budidaya</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panduan Cara Penggunaan Modul Budidaya
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed">
            Panduan lengkap pemeliharaan {terms.commodity || 'Komoditas'}, mulai dari tebar bibit, pencatatan pakan harian, kontrol kualitas air/lingkungan, sampling FCR, hingga panen dan kalkulasi laba rugi.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'cycle', label: `1. Siklus & ${terms.pond || 'Kolam'}`, icon: Layers },
          { id: 'feed', label: '2. Pakan & Mortalitas Harian', icon: Droplet },
          { id: 'sampling', label: '3. Sampling Bobot & FCR', icon: Scale },
          { id: 'harvest', label: '4. Panen & Penjualan', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-sm' 
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
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900">Daftarkan {terms.pond || 'Kolam/Kandang'}</h3>
                <p className="text-xs text-slate-600">Masukkan nama/nomor wadah, tipe (terpal, tanah, beton, kandang tertutup), dan luas/kapasitas volume.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900">Input Data Tebar</h3>
                <p className="text-xs text-slate-600">Catat jumlah populasi awal tebar, bobot rata-rata awal (ABW), harga bibit, dan tanggal mulai.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-7 h-7 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900">Monitoring Otomatis</h3>
                <p className="text-xs text-slate-600">Sistem otomatis menghitung Hari Setelah Tebar (HST/DOC) dan membuat jadwal harian.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Pakan */}
      {activeTab === 'feed' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Droplet className="w-6 h-6 text-emerald-600" />
              <span>Pencatatan Pakan Harian & Mortalitas</span>
            </h2>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Langkah Rutin Harian:</h3>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                <li>Buka rincian siklus aktif.</li>
                <li>Klik tombol <strong>+ Catat Pakan</strong>, masukkan jumlah kg pakan yang diberikan pada jam pagi, siang, dan sore/malam.</li>
                <li>Jika ada kematian, catat pada kolom <strong>Mortalitas</strong> agar estimasi populasi hidup (Survival Rate) tetap akurat.</li>
                <li>Stok pakan di menu Inventori Gudang akan terpotong otomatis secara real-time.</li>
              </ol>
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
              <span>Sampling Bobot & Efisiensi Pakan (FCR)</span>
            </h2>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs text-slate-700">
              <strong className="text-sm font-bold text-blue-900 block">Rumus FCR Otomatis:</strong>
              <p>FCR = Total Pakan yang Diberikan (Kg) ÷ Pertambahan Biomassa Total (Kg)</p>
              <p className="text-slate-500">Semakin rendah angka FCR (misal 1.1 - 1.3), semakin efisien biaya pemeliharaan Anda.</p>
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
              <span>Pencatatan Panen & Laporan Laba Bersih</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Saat panen (baik panen parsial maupun panen total), catat tonase timbangan akhir, harga jual per kg, dan nama pembeli. Sistem akan membandingkan total pendapatan panen dengan seluruh biaya modal (bibit, pakan, obat, listrik, tenaga kerja) untuk menampilkan **Laba Bersih Siklus**.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudidayaGuide;
