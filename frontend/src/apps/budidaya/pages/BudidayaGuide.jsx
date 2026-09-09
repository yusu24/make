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
  HeartPulse,
  Calculator,
  Percent,
  Waves,
  Thermometer,
  FileSpreadsheet
} from 'lucide-react';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';

const BudidayaGuide = () => {
  const terms = useBudidayaTerms();
  const [activeTab, setActiveTab] = useState('cycle');

  // Interactive Budidaya Simulator State
  const [calcStockCount, setCalcStockCount] = useState(10000); // Populasi tebar (ekor/benih)
  const [calcSeedPrice, setCalcSeedPrice] = useState(250);     // Harga bibit/ekor (Rp)
  const [calcHarvestWeightKg, setCalcHarvestWeightKg] = useState(1000); // Hasil Panen (Kg)
  const [calcTotalFeedKg, setCalcTotalFeedKg] = useState(1200);         // Total Pakan Terpakai (Kg)
  const [calcFeedPriceKg, setCalcFeedPriceKg] = useState(12000);        // Harga Pakan per Kg (Rp)
  const [calcSellPriceKg, setCalcSellPriceKg] = useState(26000);        // Harga Jual Panen per Kg (Rp)
  const [calcOperCost, setCalcOperCost] = useState(2000000);            // Biaya Operasional (Listrik, Probiotik, Upah)

  // Computed Values
  const totalBibitCost = calcStockCount * calcSeedPrice;
  const totalPakanCost = calcTotalFeedKg * calcFeedPriceKg;
  const totalCost = totalBibitCost + totalPakanCost + calcOperCost;
  const totalRevenue = calcHarvestWeightKg * calcSellPriceKg;
  const netProfit = totalRevenue - totalCost;
  const hppPerKg = calcHarvestWeightKg > 0 ? totalCost / calcHarvestWeightKg : 0;
  const fcrRatio = calcHarvestWeightKg > 0 ? calcTotalFeedKg / calcHarvestWeightKg : 0;

  const fmtRp = (num) => `Rp ${Math.round(num || 0).toLocaleString('id-ID')}`;

  return (
    <div className="aq-container pb-16" style={{ animation: 'kd-fadeIn 0.3s ease' }}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan, SOP & Kamus Rumus Operasional {terms.brandSub || 'Budidaya'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panduan Lengkap & Rumus Modul {terms.brandName || 'Budidaya'}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            Pelajari alur lengkap pemeliharaan {terms.commodity || 'Budidaya'}: Padat tebar ideal per m³, pencatatan pakan harian & feeding rate, tracking mortalitas & Survival Rate (SR %), sampling bobot (ABW & ADG), parameter kualitas air, rumus efisiensi pakan (FCR), hingga pembukuan laba bersih panen dan HPP per kg.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'cycle', label: `1. Siklus & ${terms.pond || 'Wadah'}`, icon: Layers },
          { id: 'feed', label: '2. Pakan & Survival Rate (SR)', icon: Droplet },
          { id: 'sampling', label: '3. Sampling Bobot & Rumus FCR', icon: Scale },
          { id: 'harvest', label: '4. Panen, HPP/Kg & Laba Siklus', icon: TrendingUp },
          { id: 'inventory', label: '5. Gudang Saprodi & Kas', icon: Package },
          { id: 'calculator', label: '🧮 Simulator FCR & Laba Siklus', icon: Calculator },
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

      {/* ========================================================================= */}
      {/* SECTION 1: Siklus & Wadah                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'cycle' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  <span>SOP Registrasi {terms.pond || 'Kolam / Lahan'} & Memulai Siklus Tebar Baru</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Langkah inisialisasi wadah dan perhitungan modal awal tebar bibit.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Menu: /budidaya/ponds & /budidaya/cycles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-900">Daftarkan {terms.pond || 'Kolam / Lahan'}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masukkan nomor/nama wadah, tipe (terpal bundar, tanah, beton, bioflok, atau greenhouse), dan kapasitas volume/luas.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-900">Input Data Tebar Awal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat jumlah populasi awal tebar (ekor/bibit), bobot awal rata-rata (ABW), harga bibit per satuan, dan tanggal mulai tebar.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-slate-900">Tracking DOC/HST Otomatis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem otomatis menghitung Hari Setelah Tebar (HST / DOC), mengkalkulasi biomassa berjalan, dan mengestimasi tanggal panen.
                </p>
              </div>
            </div>

            {/* Rumus Padat Tebar */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Kamus Rumus Padat Tebar & Modal Awal Benih</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-teal-300 font-bold font-sans text-xs">1. Rumus Padat Tebar Ideal:</div>
                  <div className="text-emerald-400 font-bold">Padat Tebar = Populasi Tebar (Ekor) ÷ Luas/Volume Wadah (m² atau m³)</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Kolam Bioflok D3 (Volume 7 m³) ditebar 7.000 ekor = 1.000 ekor/m³.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-teal-300 font-bold font-sans text-xs">2. Rumus Total Modal Bibit:</div>
                  <div className="text-emerald-400 font-bold">Modal Bibit = Populasi Tebar * Harga Beli per Ekor/Bibit</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: 10.000 ekor @ Rp 250 = Modal Awal Bibit Rp 2.500.000.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: Pakan & Survival Rate (SR)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'feed' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-emerald-600" />
                  <span>SOP Pakan Harian, Feeding Rate (FR) & Rumus Survival Rate (SR %)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Mengatur jadwal pakan optimal dan menghitung persentase populasi hidup.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Menu: /budidaya/cycles/:id & /budidaya/feeds
              </span>
            </div>

            {/* Rumus SR & Feeding Rate */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Rumus Feeding Rate (FR) & Survival Rate (SR %)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-teal-300 font-bold font-sans text-xs">1. Rumus Dosis Pakan Harian (Feeding Rate):</div>
                  <div className="text-emerald-400 font-bold">Pakan Harian (Kg) = Total Biomassa Kolam (Kg) * Feeding Rate %</div>
                  <div className="text-slate-400 font-sans text-[11px]">Standar FR: 3% - 5% dari total bobot biomassa ikan hidup di wadah.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-teal-300 font-bold font-sans text-xs">2. Rumus Survival Rate (SR % / Tingkat Kelangsungan Hidup):</div>
                  <div className="text-emerald-400 font-bold">SR (%) = [(Populasi Awal - Total Kematian) ÷ Populasi Awal] * 100%</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Tebar 10.000, mati 800 ekor ➔ SR = (9.200 / 10.000) * 100% = <strong>92.0%</strong>.</div>
                </div>
              </div>
            </div>

            {/* SOP Harian Petugas Farm */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SOP Rutin Harian Operator Farm:</span>
              </h3>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Buka siklus aktif wadah yang bersangkutan.</li>
                <li>Klik tombol <strong>+ Catat Pakan</strong>. Masukkan jumlah Kg pakan yang diberikan (Pagi, Siang, Sore/Malam).</li>
                <li>Stok pakan di inventori gudang akan otomatis terpotong secara real-time dan nilai biayanya langsung dibukukan ke biaya siklus.</li>
                <li>Jika ada ikan/benih mati yang diangkat, masukkan jumlahnya pada kolom <strong>Mortalitas</strong> agar estimasi biomassa tetap presisi.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: Sampling Bobot & Rumus FCR                                     */}
      {/* ========================================================================= */}
      {activeTab === 'sampling' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span>SOP Sampling Bobot, Pertumbuhan Harian (ADG) & Rumus FCR Otomatis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Tolok ukur paling krusial efisiensi modal budidaya.</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                Menu: /budidaya/cycles/:id
              </span>
            </div>

            {/* Rumus FCR, ABW, ADG */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Kamus Rumus Sampling & FCR (Feed Conversion Ratio)</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">1. Average Body Weight (ABW - Bobot Rata-rata Ekor):</div>
                  <div className="text-emerald-400 font-bold">ABW (gram) = Total Timbangan Sampel (gram) ÷ Jumlah Ekor Sampel</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">2. Average Daily Gain (ADG - Laju Pertumbuhan Harian):</div>
                  <div className="text-emerald-400 font-bold">ADG (gr/hari) = (ABW Sampling Sekarang - ABW Sampling Sebelumnya) ÷ Jumlah Hari Antar Sampling</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">3. Feed Conversion Ratio (FCR - Rasio Konversi Pakan):</div>
                  <div className="text-emerald-400 font-bold text-sm">FCR = Total Pakan yang Diberikan (Kg) ÷ Pertambahan Biomassa Panen (Kg)</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 font-sans">
                    <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700 text-emerald-200">
                      <strong>FCR 1.0 - 1.25 (Sangat Efisien)</strong>
                      <p className="text-[11px] mt-0.5">Biaya pakan sangat hemat, keuntungan panen maksimal.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-900/40 border border-blue-700 text-blue-200">
                      <strong>FCR 1.3 - 1.45 (Normal Standar)</strong>
                      <p className="text-[11px] mt-0.5">Performa pertumbuhan baik sesuai standar komoditas.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-900/40 border border-rose-700 text-rose-200">
                      <strong>FCR {'>'} 1.6 (Boros Pakan)</strong>
                      <p className="text-[11px] mt-0.5">Banyak pakan terbuang / tidak terserap. Segera cek kualitas air & pakan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: Panen, HPP/Kg & Laba Siklus                                    */}
      {/* ========================================================================= */}
      {activeTab === 'harvest' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>SOP Panen, Rumus HPP Modal per Kg & Laba Bersih Siklus</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Kalkulasi akhir profitabilitas siklus budidaya setelah panen total.</p>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                Menu: /budidaya/cycles/:id & /budidaya/finance-summary
              </span>
            </div>

            {/* Rumus Laba Bersih Siklus */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Rumus Laba Bersih Siklus & HPP Panen / Kg</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">1. Total Modal Biaya Siklus (Cost of Production):</div>
                  <div className="text-emerald-400 font-bold">Total Biaya = Modal Benih + Biaya Pakan + Obat/Saprodi + Listrik/Genset + Upah Tenaga Kerja</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">2. Rumus HPP Panen Modal per Kg:</div>
                  <div className="text-emerald-400 font-bold">HPP per Kg = Total Seluruh Biaya Siklus (Rp) ÷ Total Hasil Panen (Kg)</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Total Biaya Rp 18.000.000 ÷ Panen 1.000 Kg = <strong>HPP Rp 18.000 / Kg</strong>.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">3. Rumus Laba Bersih Siklus:</div>
                  <div className="text-emerald-400 font-bold text-sm">Laba Bersih = Total Pendapatan Panen (Kg * Harga Jual) - Total Seluruh Biaya Siklus</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Panen 1.000 Kg @ Rp 26.000 = Omzet Rp 26.000.000 - Biaya Rp 18.000.000 = <strong>Laba Bersih Rp 8.000.000</strong>.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: Gudang Saprodi & Kas                                           */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Manajemen Gudang Pakan, Saprodi & Buku Kas Pengeluaran</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Mengontrol sisa stok karungan di gudang farm dan pencatatan biaya rutin.</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                Menu: /budidaya/inventory & /budidaya/expenses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">📦 Gudang Pakan & Obat / Probiotik</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat pembelian pakan karungan (misal 50 sak @ 30kg) beserta harga beli supplier. Sistem akan otomatis memotong stok setiap kali petugas farm mencatat pemberian pakan harian ke wadah tertentu.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">💳 Buku Kas & Beban Operasional Farm</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat tagihan listrik PLN kincir air, solar genset, pembelian kapur dolomit/garam krosok, serta upah tenaga harian agar pembukuan HPP panen tidak ada yang bocor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: Simulator FCR & Laba Siklus                                    */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  <span>Simulator Budidaya, Kalkulator FCR & Laba Siklus Interaktif</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Uji coba simulasi angka riil farm Anda untuk memvalidasi FCR, HPP per Kg, dan Laba Bersih panen.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Alat Bantu Edukasi Budidaya
              </span>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">1. Populasi Tebar (Ekor/Benih):</label>
                <input
                  type="number"
                  value={calcStockCount}
                  onChange={(e) => setCalcStockCount(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="10000"
                />
                <p className="text-[11px] text-slate-400">Jumlah bibit awal tebar</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">2. Harga Bibit per Ekor (Rp):</label>
                <input
                  type="number"
                  value={calcSeedPrice}
                  onChange={(e) => setCalcSeedPrice(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="250"
                />
                <p className="text-[11px] text-slate-400">Harga beli bibit satuan</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">3. Total Pakan Terpakai (Kg):</label>
                <input
                  type="number"
                  value={calcTotalFeedKg}
                  onChange={(e) => setCalcTotalFeedKg(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1200"
                />
                <p className="text-[11px] text-slate-400">Akumulasi pakan 1 siklus</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">4. Harga Pakan per Kg (Rp):</label>
                <input
                  type="number"
                  value={calcFeedPriceKg}
                  onChange={(e) => setCalcFeedPriceKg(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="12000"
                />
                <p className="text-[11px] text-slate-400">Rata-rata harga pakan</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">5. Hasil Tonase Panen (Kg):</label>
                <input
                  type="number"
                  value={calcHarvestWeightKg}
                  onChange={(e) => setCalcHarvestWeightKg(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1000"
                />
                <p className="text-[11px] text-slate-400">Total timbangan akhir panen</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">6. Harga Jual Panen / Kg (Rp):</label>
                <input
                  type="number"
                  value={calcSellPriceKg}
                  onChange={(e) => setCalcSellPriceKg(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="26000"
                />
                <p className="text-[11px] text-slate-400">Harga jual ke tengkulak/pasar</p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">7. Biaya Listrik, Obat & Upah (Rp):</label>
                <input
                  type="number"
                  value={calcOperCost}
                  onChange={(e) => setCalcOperCost(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="2000000"
                />
                <p className="text-[11px] text-slate-400">Total biaya operasional lain selama siklus</p>
              </div>
            </div>

            {/* Output Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border space-y-1 ${fcrRatio <= 1.3 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Nilai FCR</span>
                <div className={`text-xl font-extrabold font-mono ${fcrRatio <= 1.3 ? 'text-emerald-950' : 'text-amber-950'}`}>{fcrRatio.toFixed(2)}</div>
                <p className="text-[10.5px] text-slate-600">Efisiensi pakan (Target: {'<'} 1.30)</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">HPP Modal / Kg</span>
                <div className="text-xl font-extrabold text-blue-950 font-mono">{fmtRp(hppPerKg)}</div>
                <p className="text-[10.5px] text-blue-600">Biaya pokok produksi per kg</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Omzet Panen</span>
                <div className="text-xl font-extrabold text-purple-950 font-mono">{fmtRp(totalRevenue)}</div>
                <p className="text-[10.5px] text-purple-600">Pendapatan kotor penjualan</p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${netProfit > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Laba Bersih Siklus</span>
                <div className={`text-xl font-extrabold font-mono ${netProfit > 0 ? 'text-emerald-950' : 'text-rose-950'}`}>{fmtRp(netProfit)}</div>
                <p className="text-[10.5px] text-slate-600">Keuntungan bersih setelah modal</p>
              </div>
            </div>

            {/* Evaluasi Usaha */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${netProfit > 0 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
              {netProfit > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <strong className="font-bold text-sm block">
                  {netProfit > 0 ? '✅ Siklus Budidaya Sangat Menguntungkan!' : '⚠️ Perhatian: Biaya Modal Melebihi Hasil Panen!'}
                </strong>
                <p className="leading-relaxed">
                  {netProfit > 0 
                    ? `Dengan FCR ${fcrRatio.toFixed(2)} dan HPP ${fmtRp(hppPerKg)}/Kg, Anda menghasilkan keuntungan bersih sebesar ${fmtRp(netProfit)} dari siklus ini (Margin bersih ${((netProfit/totalRevenue)*100).toFixed(1)}%). Pertahankan teknik manajemen pakan dan kualitas air untuk siklus berikutnya.`
                    : `HPP modal per kg (${fmtRp(hppPerKg)}) lebih tinggi daripada harga jual pasar (${fmtRp(calcSellPriceKg)}). Evaluasi kembali efisiensi pakan (FCR) atau tingkat kematian bibit!`
                  }
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
