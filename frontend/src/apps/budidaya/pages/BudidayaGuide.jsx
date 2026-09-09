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
  FileSpreadsheet,
  HelpCircle,
  Clock,
  Wallet,
  Boxes,
  Tag,
  ChevronRight,
  TrendingDown,
  RotateCcw
} from 'lucide-react';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';

const BudidayaGuide = () => {
  const terms = useBudidayaTerms();
  const [activeTab, setActiveTab] = useState('roadmap');

  // Interactive Budidaya Simulator State
  const [calcStockCount, setCalcStockCount] = useState(10000); // Populasi tebar (ekor/benih)
  const [calcSeedPrice, setCalcSeedPrice] = useState(250);     // Harga bibit/ekor (Rp)
  const [calcHarvestWeightKg, setCalcHarvestWeightKg] = useState(1000); // Hasil Panen (Kg)
  const [calcTotalFeedKg, setCalcTotalFeedKg] = useState(1200);         // Total Pakan Terpakai (Kg)
  const [calcFeedPriceKg, setCalcFeedPriceKg] = useState(12000);        // Harga Pakan per Kg (Rp)
  const [calcSellPriceKg, setCalcSellPriceKg] = useState(26000);        // Harga Jual Panen per Kg (Rp)
  const [calcOperCost, setCalcOperCost] = useState(2000000);            // Biaya Operasional (Listrik, Probiotik, Upah)

  // Presets for Quick Testing
  const applyPreset = (type) => {
    switch (type) {
      case 'lele':
        setCalcStockCount(10000);
        setCalcSeedPrice(250);
        setCalcHarvestWeightKg(1000);
        setCalcTotalFeedKg(1100);
        setCalcFeedPriceKg(12000);
        setCalcSellPriceKg(25000);
        setCalcOperCost(1500000);
        break;
      case 'nila':
        setCalcStockCount(5000);
        setCalcSeedPrice(600);
        setCalcHarvestWeightKg(1250);
        setCalcTotalFeedKg(1600);
        setCalcFeedPriceKg(13500);
        setCalcSellPriceKg(32000);
        setCalcOperCost(2500000);
        break;
      case 'vaname':
        setCalcStockCount(100000);
        setCalcSeedPrice(45);
        setCalcHarvestWeightKg(1500);
        setCalcTotalFeedKg(1800);
        setCalcFeedPriceKg(19000);
        setCalcSellPriceKg(75000);
        setCalcOperCost(12000000);
        break;
      case 'gurami':
        setCalcStockCount(2000);
        setCalcSeedPrice(3000);
        setCalcHarvestWeightKg(1000);
        setCalcTotalFeedKg(1500);
        setCalcFeedPriceKg(14000);
        setCalcSellPriceKg(48000);
        setCalcOperCost(3000000);
        break;
      case 'hidroponik':
        setCalcStockCount(5000);
        setCalcSeedPrice(150);
        setCalcHarvestWeightKg(750);
        setCalcTotalFeedKg(200);
        setCalcFeedPriceKg(35000);
        setCalcSellPriceKg(30000);
        setCalcOperCost(1800000);
        break;
      default:
        break;
    }
  };

  // Computed Values
  const totalBibitCost = calcStockCount * calcSeedPrice;
  const totalPakanCost = calcTotalFeedKg * calcFeedPriceKg;
  const totalCost = totalBibitCost + totalPakanCost + calcOperCost;
  const totalRevenue = calcHarvestWeightKg * calcSellPriceKg;
  const netProfit = totalRevenue - totalCost;
  const hppPerKg = calcHarvestWeightKg > 0 ? totalCost / calcHarvestWeightKg : 0;
  const fcrRatio = calcHarvestWeightKg > 0 ? calcTotalFeedKg / calcHarvestWeightKg : 0;
  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  const fmtRp = (num) => `Rp ${Math.round(num || 0).toLocaleString('id-ID')}`;

  return (
    <div className="aq-container pb-16 space-y-6" style={{ animation: 'kd-fadeIn 0.3s ease' }}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-700/50">
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-teal-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5 text-teal-300" />
            <span>Pusat Buku Panduan, Standar Operasional Prosedur (SOP) & Kamus Rumus {terms.brandSub || 'Budidaya'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Panduan Lengkap, SOP & Rumus Modul {terms.brandName || 'Budidaya'}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Panduan teknis dan operasional menyeluruh untuk pengelolaan siklus {terms.commodity || 'budidaya'}: persiapan wadah steril, aklimatisasi benih, manajemen pakan harian (Feeding Rate), monitoring kualitas air, sampling bobot (ABW & ADG), evaluasi efisiensi pakan (FCR), kalkulasi HPP panen modal per kg, hingga pembukuan laba bersih siklus.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 top-0 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'roadmap', label: '1. Peta Jalan & Pra-Tebar', icon: Sparkles },
          { id: 'cycle', label: `2. ${terms.pond || 'Wadah'} & Siklus Tebar`, icon: Layers },
          { id: 'feed', label: '3. Pakan, Air & Survival Rate', icon: Droplet },
          { id: 'sampling', label: '4. Sampling Bobot & FCR', icon: Scale },
          { id: 'harvest', label: '5. Panen & HPP Modal / Kg', icon: TrendingUp },
          { id: 'inventory', label: '6. Gudang Pakan & Kas', icon: Package },
          { id: 'calculator', label: '🧮 Simulator FCR & Laba', icon: Calculator },
          { id: 'faq', label: '7. Troubleshooting & FAQ', icon: HelpCircle },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-600/30' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: Peta Jalan Siklus & SOP Pra-Tebar                               */}
      {/* ========================================================================= */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>5 Tahapan Siklus Budidaya dari Awal Tebar hingga Panen</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Gambaran alur terintegrasi modul sistem untuk memaksimalkan survival rate dan laba farm.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Alur Kerja Terpadu
              </span>
            </div>

            {/* 5 Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  step: '1',
                  title: 'Pra-Tebar & Wadah',
                  desc: 'Sterilisasi kolam, pengapuran dolomit, pembentukan bioflok/air matang (3-7 hari).',
                  color: 'bg-teal-50 border-teal-200 text-teal-900',
                  badge: 'Tahap 1'
                },
                {
                  step: '2',
                  title: 'Tebar & Aklimatisasi',
                  desc: 'Aklimatisasi suhu & pH bibit (15-30 menit) saat pagi/sore hari untuk cegah kematian stres.',
                  color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                  badge: 'Tahap 2'
                },
                {
                  step: '3',
                  title: 'Rawat, Pakan & Air',
                  desc: 'Pemberian pakan terukur (FR 3-5%), tracking mortalitas harian, dan monitoring parameter DO/pH.',
                  color: 'bg-blue-50 border-blue-200 text-blue-900',
                  badge: 'Tahap 3'
                },
                {
                  step: '4',
                  title: 'Sampling & Evaluasi FCR',
                  desc: 'Sampling berkala (7-14 hari) untuk ukur ABW, laju pertumbuhan ADG, dan evaluasi efisiensi pakan FCR.',
                  color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                  badge: 'Tahap 4'
                },
                {
                  step: '5',
                  title: 'Panen, HPP & Laba',
                  desc: 'Panen parsial/total, pemberokan air bersih, kalkulasi HPP modal/kg, dan laporan laba bersih.',
                  color: 'bg-purple-50 border-purple-200 text-purple-900',
                  badge: 'Tahap 5'
                }
              ].map((stage, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${stage.color} flex flex-col justify-between space-y-3`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                        {stage.step}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                        {stage.badge}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-2">{stage.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SOP Persiapan Wadah & Aklimatisasi Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>SOP Persiapan Media & Pembentukan Air Matang:</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
                  <li><strong>Pembersihan & Pengeringan:</strong> Cuci wadah terpal/beton dan keringkan di bawah sinar matahari minimal 1–2 hari untuk membunuh patogen.</li>
                  <li><strong>Pengisian Air & Desinfeksi:</strong> Isi air setinggi 50–80 cm, endapkan atau berikan garam krosok (1–2 kg/m³) untuk menstabilkan salinitas dan mencegah parasit.</li>
                  <li><strong>Pengapuran & Penstabil pH:</strong> Jika pH air rendah ({'<'} 6.8), berikan kapur Dolomit dosis 50–100 gr/m³.</li>
                  <li><strong>Inokulasi Probiotik / Pembentukan Flok:</strong> Tambahkan probiotik + molase/tetes tebu (dosis 10–20 ml/m³), nyalakan aerasi/kincir selama 3–5 hari hingga air berwarna hijau matang atau cokelat muda sebelum bibit ditebar.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-600" />
                  <span>SOP Aklimatisasi Tebar Benih (Pencegahan Mortalitas Awal):</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside leading-relaxed">
                  <li><strong>Waktu Terbaik Tebar:</strong> Pagi hari (06.00 – 08.30) atau sore hari (16.30 – 18.00) saat suhu air sedang sejuk dan stabil. Hindari tebar di terik siang.</li>
                  <li><strong>Penyesuaian Suhu (15 Menit):</strong> Apungkan kantong plastik packing benih di atas permukaan kolam selama 15–20 menit agar suhu air di dalam kantong sama dengan suhu air kolam.</li>
                  <li><strong>Pencampuran Air Bertahap:</strong> Buka ikatan kantong, masukkan air kolam sedikit demi sedikit ke dalam kantong secara perlahan agar benih beradaptasi dengan pH dan parameter air baru.</li>
                  <li><strong>Pelepasan Mandiri:</strong> Miringkan kantong dan biarkan benih berenang keluar sendiri ke kolam. Jangan memberi pakan pada 12–24 jam pertama pasca tebar (puasa adaptasi).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: Wadah & Siklus Tebar                                           */}
      {/* ========================================================================= */}
      {activeTab === 'cycle' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  <span>SOP Registrasi {terms.pond || 'Wadah'} & Memulai Siklus Tebar Baru</span>
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
                  Masukkan nomor/nama wadah, tipe (terpal bundar, tanah, beton, bioflok, RAS, atau greenhouse), dan kapasitas volume/luas dalam meter kubik/meter persegi.
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

            {/* Rekomendasi Padat Tebar Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-600" />
                <span>Rekomendasi Standar Padat Tebar per Komoditas:</span>
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Komoditas Budidaya</th>
                      <th className="p-3">Sistem Wadah</th>
                      <th className="p-3">Padat Tebar Ideal</th>
                      <th className="p-3">Masa Pemeliharaan</th>
                      <th className="p-3">Target Ukuran Panen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">Ikan Lele Sangkuriang / Mutiara</td>
                      <td className="p-3">Bioflok Terpal D3 (7 m³)</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">700 – 1.000 ekor / m³</td>
                      <td className="p-3">60 – 75 Hari</td>
                      <td className="p-3">8 – 10 ekor / kg (100–125 gr)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">Ikan Nila Merah / GIFT</td>
                      <td className="p-3">Kolam Tenang / Terpal Aerasi</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">30 – 60 ekor / m²</td>
                      <td className="p-3">90 – 120 Hari</td>
                      <td className="p-3">3 – 5 ekor / kg (200–350 gr)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">Ikan Nila Sistem Air Deras / RAS</td>
                      <td className="p-3">Beton Sirkulasi / RAS</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">100 – 150 ekor / m³</td>
                      <td className="p-3">75 – 90 Hari</td>
                      <td className="p-3">2 – 4 ekor / kg (250–500 gr)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">Udang Vaname Intensif</td>
                      <td className="p-3">Tambak Terpal HDPE Kincir</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">120 – 250 ekor / m²</td>
                      <td className="p-3">80 – 100 Hari</td>
                      <td className="p-3">Size 40 – 50 (20–25 gr)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="p-3 font-semibold text-slate-900">Ikan Gurami Pembesaran</td>
                      <td className="p-3">Kolam Tanah / Terpal Tanah</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">10 – 20 ekor / m²</td>
                      <td className="p-3">6 – 8 Bulan</td>
                      <td className="p-3">2 ekor / kg (500 gr)</td>
                    </tr>
                  </tbody>
                </table>
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
      {/* SECTION 3: Pakan, Parameter Air & Survival Rate (SR)                      */}
      {/* ========================================================================= */}
      {activeTab === 'feed' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-emerald-600" />
                  <span>SOP Pakan Harian, Feeding Rate (FR), Kualitas Air & Rumus SR %</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Mengatur jadwal pakan optimal, pemeliharaan air, dan menghitung persentase populasi hidup.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Menu: /budidaya/cycles/:id & /budidaya/inventory
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
                  <div className="text-slate-400 font-sans text-[11px]">Standar FR: Benih kecil 5% - 7%, Ikan Remaja/Dewasa 2.5% - 3.5% dari bobot total biomassa.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-teal-300 font-bold font-sans text-xs">2. Rumus Survival Rate (SR % / Tingkat Kelangsungan Hidup):</div>
                  <div className="text-emerald-400 font-bold">SR (%) = [(Populasi Awal - Total Kematian) ÷ Populasi Awal] * 100%</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Tebar 10.000, mati 800 ekor ➔ SR = (9.200 / 10.000) * 100% = <strong>92.0%</strong>.</div>
                </div>
              </div>
            </div>

            {/* Parameter Kualitas Air Ideal */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-600" />
                <span>Batas Parameter Kualitas Air Optimal:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                    <Thermometer className="w-4 h-4" />
                    <span>Suhu Air (°C)</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-blue-950 mt-1">27°C – 30°C</div>
                  <p className="text-[11px] text-blue-700 mt-1">Suhu di bawah 24°C menurunkan nafsu makan secara drastis.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                    <Activity className="w-4 h-4" />
                    <span>Derajat Keasaman (pH)</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-teal-950 mt-1">6.8 – 8.0</div>
                  <p className="text-[11px] text-teal-700 mt-1">pH {'<'} 6.5 memicu stres kulit/insang; pH {'>'} 8.5 meningkatkan racun amonia.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Droplet className="w-4 h-4" />
                    <span>Oksigen Terlarut (DO)</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-emerald-950 mt-1">&gt; 4.0 mg/L (ppm)</div>
                  <p className="text-[11px] text-emerald-700 mt-1">DO {'<'} 3.0 ppm menyebabkan ikan megap-megap di permukaan pada pagi hari.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Amonia (NH3) & Nitrit</span>
                  </div>
                  <div className="text-lg font-extrabold font-mono text-amber-950 mt-1">&lt; 0.1 mg/L</div>
                  <p className="text-[11px] text-amber-700 mt-1">Lakukan sifon endapan dasar jika amonia terdeteksi meningkat.</p>
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
                <li>Buka siklus aktif wadah yang bersangkutan melalui menu <strong>Siklus Budidaya</strong>.</li>
                <li>Klik tombol <strong>+ Catat Pakan</strong>. Masukkan porsi Kg pakan yang diberikan (Pagi 08:00, Siang 12:00, Sore 16:30, Malam 21:00).</li>
                <li>Stok pakan di inventori gudang akan <strong>otomatis terpotong secara real-time</strong> dan nilai biayanya langsung dibukukan ke biaya modal siklus.</li>
                <li>Jika ada ikan/benih mati yang diangkat dari wadah, masukkan jumlahnya pada kolom <strong>Mortalitas</strong> agar estimasi biomassa dan Survival Rate (SR %) tetap presisi.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: Sampling Bobot, ADG & Rumus FCR                                 */}
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
                <p className="text-xs text-slate-500 mt-1">Tolok ukur paling krusial efisiensi modal pakan dan evaluasi kecepatan tumbuh ikan.</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                Menu: /budidaya/cycles/:id
              </span>
            </div>

            {/* SOP Sampling Bobot */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" />
                <span>Tata Cara Sampling Bobot yang Benar:</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                <li>Lakukan sampling rutin setiap <strong>7 atau 14 hari sekali</strong> sebelum pemberian pakan pagi.</li>
                <li>Ambil sampel secara acak minimal <strong>30–50 ekor</strong> dari berbagai sisi kolam (atas, tengah, dasar).</li>
                <li>Timbang total berat sampel dalam gram menggunakan timbangan digital, lalu hitung <strong>ABW (Average Body Weight)</strong>.</li>
                <li>Masukkan data hasil sampling ke formulir siklus. Sistem akan otomatis menghitung ADG (Average Daily Gain) dan mengoreksi dosis pakan harian berikutnya.</li>
              </ul>
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
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: 50 ekor sampel ditimbang total 4.000 gram ➔ ABW = 4.000 ÷ 50 = <strong>80 gram/ekor</strong>.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">2. Average Daily Gain (ADG - Laju Pertumbuhan Harian):</div>
                  <div className="text-emerald-400 font-bold">ADG (gr/hari) = (ABW Sekarang - ABW Sampling Lalu) ÷ Selang Hari Sampling</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Dari 80 gr menjadi 110 gr dalam 10 hari ➔ ADG = (110 - 80) ÷ 10 = <strong>3.0 gram/hari</strong>.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">3. Feed Conversion Ratio (FCR - Rasio Konversi Pakan):</div>
                  <div className="text-emerald-400 font-bold text-sm">FCR = Total Pakan yang Diberikan (Kg) ÷ Pertambahan Bobot Daging Panen (Kg)</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 font-sans">
                    <div className="p-3 rounded-lg bg-emerald-900/40 border border-emerald-700 text-emerald-200">
                      <strong>FCR 0.95 – 1.20 (Sangat Efisien)</strong>
                      <p className="text-[11px] mt-1">Biaya pakan sangat hemat. Keuntungan panen maksimal. Umum pada sistem Bioflok & pakan berkualitas tinggi.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-900/40 border border-blue-700 text-blue-200">
                      <strong>FCR 1.25 – 1.45 (Normal Standar)</strong>
                      <p className="text-[11px] mt-1">Performa pertumbuhan baik sesuai standar komoditas air tenang.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-rose-900/40 border border-rose-700 text-rose-200">
                      <strong>FCR &gt; 1.55 (Boros Pakan / Ambyar)</strong>
                      <p className="text-[11px] mt-1">Pakan banyak terbuang/tidak dicerna. Laba farm terancam minus. Wajib cek kualitas air, jamur pakan, atau overfeeding.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: Panen, HPP/Kg & Laba Bersih Siklus                             */}
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
                <p className="text-xs text-slate-500 mt-1">Kalkulasi akhir profitabilitas siklus budidaya setelah panen total atau panen bertahap.</p>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                Menu: /budidaya/cycles/:id & /budidaya/finance-summary
              </span>
            </div>

            {/* SOP Panen & Pasca Panen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Panen Total vs Panen Parsial (Grading Ukuran):</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Panen Parsial:</strong> Mengambil 30–50% ikan yang sudah mencapai bobot konsumsi terlebih dahulu. Bertujuan mengurangi kepadatan wadah sehingga sisa ikan kecil dapat bertumbuh lebih cepat.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Panen Total:</strong> Mengeringkan air kolam dan memanen seluruh populasi sekaligus saat akhir masa siklus tercapai.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-teal-600" />
                  <span>SOP Pemberokan (Penghilang Bau Lumpur):</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Puaskan ikan selama 24 jam sebelum dipanen. Pindahkan hasil panen ke kolam penampungan air mengalir jernih selama 1–2 hari. Proses ini membersihkan sisa kotoran di perut ikan sehingga daging tidak berbau lumpur/tanah dan harga jual meningkat.
                </p>
              </div>
            </div>

            {/* Rumus Laba Bersih Siklus & HPP */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Rumus Lengkap HPP Modal per Kg & Laba Bersih Siklus</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">1. Total Modal Biaya Siklus (Cost of Production):</div>
                  <div className="text-emerald-400 font-bold">Total Biaya = Modal Benih + Total Biaya Pakan + Biaya Obat/Saprodi + Listrik/Genset + Upah Tenaga Kerja</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">2. Rumus HPP Panen Modal per Kg:</div>
                  <div className="text-emerald-400 font-bold">HPP per Kg = Total Seluruh Biaya Siklus (Rp) ÷ Total Tonase Panen (Kg)</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Total Biaya Rp 18.000.000 ÷ Panen 1.000 Kg = <strong>HPP Rp 18.000 / Kg</strong>.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">3. Rumus Laba Bersih Siklus:</div>
                  <div className="text-emerald-400 font-bold text-sm">Laba Bersih = Total Pendapatan Panen (Tonase Kg * Harga Jual/Kg) - Total Seluruh Biaya Siklus</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Panen 1.000 Kg @ Rp 26.000 = Omzet Rp 26.000.000 - Modal Rp 18.000.000 = <strong>Laba Bersih Rp 8.000.000</strong>.</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">4. Break Even Point (BEP Harga Jual Minimum):</div>
                  <div className="text-emerald-400 font-bold">BEP Harga (Rp/Kg) = Total Biaya Siklus (Rp) ÷ Total Hasil Panen (Kg)</div>
                  <div className="text-slate-400 font-sans text-[11px]">Harga jual ke tengkulak/pasar WAJIB di atas angka BEP ini agar farm tidak mengalami kerugian.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: Gudang Pakan, Saprodi & Kas                                    */}
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
                <p className="text-xs text-slate-500 mt-1">Mengontrol sisa stok karungan di gudang farm dan pencatatan biaya operasional rutin.</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                Menu: /budidaya/inventory & /budidaya/expenses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-600" />
                  <span>📦 Gudang Pakan, Probiotik & Saprodi:</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat pembelian pakan karungan (misal 50 sak @ 30kg) beserta harga beli supplier di menu <strong>Gudang & Pakan</strong>.
                </p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <strong>Otomasi Pemotongan Stok:</strong>
                  <p className="text-[11px] text-slate-500">
                    Setiap kali operator mencatat pemberian pakan di siklus kolam, stok gudang otomatis berkurang dan modal pakan tercatat di laporan keuangan tanpa perlu input manual ganda.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-teal-600" />
                  <span>💳 Buku Kas & Beban Operasional Farm:</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Catat seluruh biaya non-pakan secara teratur pada menu <strong>Buku Kas & Transaksi</strong> agar perhitungan laba rugi farm 100% akurat:
                </p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>Tagihan listrik PLN kincir air & aerator</li>
                  <li>Bahan bakar solar/bensin genset darurat</li>
                  <li>Pembelian garam krosok, molase, kapur dolomit</li>
                  <li>Upah tenaga kerja harian / borongan panen</li>
                  <li>Perawatan pompa & pipa air</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: Simulator FCR & Laba Siklus                                    */}
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
              
              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Preset:</span>
                <button onClick={() => applyPreset('lele')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer">Lele Bioflok</button>
                <button onClick={() => applyPreset('nila')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer">Nila Kolam</button>
                <button onClick={() => applyPreset('vaname')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer">Udang Vaname</button>
                <button onClick={() => applyPreset('gurami')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer">Gurami</button>
                <button onClick={() => applyPreset('hidroponik')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer">Hidroponik</button>
              </div>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">1. Populasi Tebar (Ekor/Bibit):</label>
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
              <div className={`p-4 rounded-2xl border space-y-1 ${fcrRatio <= 1.25 ? 'bg-emerald-50 border-emerald-200' : fcrRatio <= 1.45 ? 'bg-blue-50 border-blue-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Nilai FCR</span>
                <div className={`text-2xl font-extrabold font-mono ${fcrRatio <= 1.25 ? 'text-emerald-950' : fcrRatio <= 1.45 ? 'text-blue-950' : 'text-rose-950'}`}>{fcrRatio.toFixed(2)}</div>
                <p className="text-[10.5px] text-slate-600">Efisiensi pakan (Target: {'<'} 1.30)</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">HPP Modal / Kg</span>
                <div className="text-2xl font-extrabold text-blue-950 font-mono">{fmtRp(hppPerKg)}</div>
                <p className="text-[10.5px] text-blue-600">Biaya pokok produksi per kg</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Total Omzet Panen</span>
                <div className="text-2xl font-extrabold text-purple-950 font-mono">{fmtRp(totalRevenue)}</div>
                <p className="text-[10.5px] text-purple-600">Pendapatan kotor penjualan</p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 ${netProfit > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Laba Bersih Siklus</span>
                <div className={`text-2xl font-extrabold font-mono ${netProfit > 0 ? 'text-emerald-950' : 'text-rose-950'}`}>{fmtRp(netProfit)}</div>
                <p className="text-[10.5px] text-slate-600">Margin: {profitMarginPercent.toFixed(1)}% | ROI: {roiPercent.toFixed(1)}%</p>
              </div>
            </div>

            {/* Evaluasi Usaha Banner */}
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
                    ? `Dengan FCR ${fcrRatio.toFixed(2)} dan HPP ${fmtRp(hppPerKg)}/Kg, Anda menghasilkan keuntungan bersih sebesar ${fmtRp(netProfit)} dari siklus ini (Margin bersih ${profitMarginPercent.toFixed(1)}%, Return on Investment ${roiPercent.toFixed(1)}%). Pertahankan teknik manajemen pakan dan kualitas air untuk siklus berikutnya.`
                    : `HPP modal per kg (${fmtRp(hppPerKg)}) lebih tinggi daripada harga jual pasar (${fmtRp(calcSellPriceKg)}). Evaluasi kembali efisiensi pakan (FCR), kurangi mortalitas, atau negosiasikan harga jual panen Anda!`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: Troubleshooting Penyakit & FAQ                                  */}
      {/* ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                  <span>Troubleshooting Masalah Lapangan & Pertanyaan Umum (FAQ)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Panduan penanganan cepat kendala teknis budidaya di lapangan.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Solusi Cepat Lapangan
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>1. Mengapa ikan menggantung di permukaan air pada pagi hari?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab:</strong> Oksigen terlarut (Dissolved Oxygen / DO) drop di bawah 3.0 ppm akibat respirasi plankton dan pembusukan sisa pakan di dasar kolam sepanjang malam.<br />
                  <strong>Solusi:</strong> Nyalakan aerator / kincir air lebih awal, kurangi pemberian pakan pada malam hari, dan lakukan penyedotan (sifon) kotoran dasar kolam.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-600" />
                  <span>2. Mengapa nilai FCR membengkak di atas 1.50 (boros modal)?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab:</strong> 1) Pemberian pakan berlebih (overfeeding) sehingga pakan tenggelam dan membusuk; 2) Kandungan protein pakan tidak sesuai umur ikan; 3) Suhu air terlalu dingin ({'<'} 25°C) sehingga metabolisme ikan lambat.<br />
                  <strong>Solusi:</strong> Gunakan tray/anco untuk memantau pakan habis dalam 15–20 menit. Kurangi porsi pakan jika cuaca mendung/hujan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>3. Kapan waktu yang tepat untuk melakukan grading (seleksi ukuran)?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab:</strong> Pada komoditas karnivora/omnivora agresif seperti lele, perbedaan ukuran {'>'} 30% akan memicu sifat kanibalisme di mana ikan besar memakan ikan kecil.<br />
                  <strong>Solusi:</strong> Lakukan grading pertama pada DOC 15–20 hari, dan grading kedua pada DOC 35–40 hari. Pisahkan ikan berdasarkan ayakan ukuran seragam.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-600" />
                  <span>4. Air kolam berbusa dan berbau menyengat, apa yang harus dilakukan?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab:</strong> Akumulasi bahan organik tinggi dan ledakan bakteri anaerob penghasil gas amonia / asam sulfida (H2S).<br />
                  <strong>Solusi:</strong> Buang 20–30% air dasar kolam (sifon), tambahkan air baru yang sudah diendapkan, lalu berikan probiotik dan molase untuk memulihkan bakteri pengurai aerobik.
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
