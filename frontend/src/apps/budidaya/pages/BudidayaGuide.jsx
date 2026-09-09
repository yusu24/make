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
  RotateCcw,
  Users,
  Settings,
  Database,
  PlusCircle,
  FileText
} from 'lucide-react';
import { useBudidayaTerms } from '../hooks/useBudidayaTerms';

const BudidayaGuide = () => {
  const terms = useBudidayaTerms();
  const [activeTab, setActiveTab] = useState('quickstart');

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
            <span>Manual Pengguna & Standar Operasional Prosedur (SOP) Aplikasi Modul Budidaya</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Buku Panduan & SOP Penggunaan Aplikasi {terms.brandName || 'Budidaya'}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Panduan lengkap langkah demi langkah cara mengoperasikan seluruh fitur sistem aplikasi {terms.brandName || 'Budidaya'}: pendaftaran wadah kolam, inisialisasi siklus tebar, pencatatan pakan otomatis potong stok gudang, input mortalitas & sampling bobot, proses panen & kalkulasi HPP modal/kg, hingga pembukuan buku kas dan laporan laba rugi farm.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 top-0 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'quickstart', label: '1. Alur Cepat Aplikasi', icon: Sparkles },
          { id: 'ponds-cycles', label: `2. SOP ${terms.pond || 'Wadah'} & Siklus Tebar`, icon: Layers },
          { id: 'harvest', label: '3. SOP Panen & Tutup Siklus', icon: TrendingUp },
          { id: 'inventory', label: '4. SOP Gudang Pakan & Saprodi', icon: Package },
          { id: 'finance', label: '5. SOP Kas & Laporan Laba Rugi', icon: Wallet },
          { id: 'settings', label: '6. Master Data, Tim & Akses', icon: Settings },
          { id: 'calculator', label: '🧮 Kamus Rumus & Simulator', icon: Calculator },
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
      {/* SECTION 1: Alur Cepat Aplikasi (Quick Start)                              */}
      {/* ========================================================================= */}
      {activeTab === 'quickstart' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>Alur Utama Pengoperasian Aplikasi Modul Budidaya</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">4 langkah berurutan untuk memulai operasional harian farm dari pendaftaran hingga laporan panen.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Alur Kerja 4 Langkah
              </span>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-extrabold font-mono">1</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-900">Langkah 1</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Daftarkan {terms.pond || 'Wadah / Kolam'}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka menu <strong>Manajemen {terms.unit || 'Wadah'}</strong> (`/budidaya/ponds`). Klik tombol <strong>+ Tambah Wadah</strong>, masukkan nomor/nama kolam, jenis (terpal/bioflok/tanah), dan kapasitas volume.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                  <span>Menu: /budidaya/ponds</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs font-extrabold font-mono">2</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-900">Langkah 2</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Input Stok Pakan ke Gudang</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka menu <strong>Gudang & Pakan</strong> (`/budidaya/inventory`). Catat nama merk pakan, jumlah stok sak/kg, dan harga beli supplier agar sistem dapat otomatis memotong stok saat dicatat di kolam.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                  <span>Menu: /budidaya/inventory</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center text-xs font-extrabold font-mono">3</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900">Langkah 3</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Mulai Siklus Tebar Baru</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka menu <strong>Siklus Budidaya</strong> (`/budidaya/cycles`). Pilih kolam yang kosong, masukkan varietas benih, populasi tebar (ekor), bobot awal rata-rata (ABW), harga beli bibit, dan tanggal tebar.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                  <span>Menu: /budidaya/cycles</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs font-extrabold font-mono">4</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-900">Langkah 4</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Catat Harian, Panen & Laporan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap hari operator mencatat pakan harian & mortalitas pada detail siklus. Saat masa panen tiba, klik tombol <strong>Panen</strong> untuk menghitung HPP modal/kg dan melihat laba bersih siklus.
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                  <span>Menu: /budidaya/finance-summary</span>
                </div>
              </div>
            </div>

            {/* Role & Pembagian Tanggung Jawab Pengguna */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Pembagian Peran & Akses Pengguna Aplikasi:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <strong className="text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Owner / Farm Manager (Akses Penuh):</span>
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    Dapat mengelola siklus, mengatur harga pakan & bibit, mencatat beban kas operasional, melihat rekapitulasi laba rugi farm, memverifikasi hasil panen, dan mengatur akun staf.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <strong className="text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Teknisi Kolam / Operator Lapangan:</span>
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    Diberikan akses khusus melalui menu <em>Pengaturan &gt; Hak Akses</em> untuk hanya mencatat pakan harian, log mortalitas ikan mati, dan hasil sampling bobot tanpa menampilkan laporan keuangan modal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SOP Wadah & Siklus Tebar                                       */}
      {/* ========================================================================= */}
      {activeTab === 'ponds-cycles' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  <span>SOP Pendaftaran {terms.pond || 'Wadah / Kolam'} & Pengelolaan Siklus Tebar</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Petunjuk operasional lengkap dari pembuatan wadah, memulai tebar, hingga pencatatan log harian.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Menu: /budidaya/ponds & /budidaya/cycles
              </span>
            </div>

            {/* SOP 1: Daftarkan Kolam */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>A. Cara Mendaftarkan {terms.pond || 'Kolam / Lahan'} Baru:</span>
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Buka menu <strong>Manajemen {terms.unit || 'Wadah'}</strong> di sidebar kiri.</li>
                  <li>Klik tombol <strong>+ Tambah {terms.unit || 'Kolam'}</strong> di sudut kanan atas.</li>
                  <li>Isi formulir pendaftaran:
                    <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Nama / Kode Wadah:</strong> Contoh: <em>Kolam Bioflok D3-01</em> atau <em>Kolam Tanah A-1</em>.</li>
                      <li><strong>Tipe Wadah:</strong> Pilih jenis wadah (Terpal Bundar, Bioflok, Kolam Tanah, Beton, RAS, atau Greenhouse).</li>
                      <li><strong>Kapasitas Volume / Luas:</strong> Masukkan kapasitas dalam m³ (meter kubik) atau m² (meter persegi).</li>
                      <li><strong>Lokasi / Catatan:</strong> Lokasi blok farm untuk mempermudah identifikasi teknisi lapangan.</li>
                    </ul>
                  </li>
                  <li>Klik <strong>Simpan</strong>. Wadah baru akan langsung terdaftar dengan status <strong>Kosong (Siap Tebar)</strong>.</li>
                </ol>
              </div>
            </div>

            {/* SOP 2: Mulai Siklus */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>B. Cara Memulai Siklus Tebar Baru:</span>
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>Buka menu <strong>Siklus Budidaya</strong> (`/budidaya/cycles`).</li>
                  <li>Klik tombol <strong>+ Mulai Siklus Baru</strong>.</li>
                  <li>Pilih unit kolam kosong yang ingin ditebar pada dropdown <em>Pilih Wadah</em>.</li>
                  <li>Isi data parameter tebar:
                    <ul className="list-disc list-inside pl-5 mt-1 space-y-1 text-slate-600">
                      <li><strong>Varietas / Komoditas:</strong> Contoh: <em>Lele Sangkuriang Ukuran 7-9 cm</em> atau <em>Nila Merah Super</em>.</li>
                      <li><strong>Jumlah Populasi Tebar:</strong> Masukkan jumlah benih (misal <em>10.000 ekor</em>).</li>
                      <li><strong>Bobot Awal Rata-rata (ABW):</strong> Masukkan bobot awal per ekor dalam gram (misal <em>10 gram</em>).</li>
                      <li><strong>Harga Beli Bibit:</strong> Masukkan harga satuan per ekor (misal <em>Rp 250 / ekor</em>) untuk menghitung modal awal benih otomatis.</li>
                      <li><strong>Tanggal Tebar:</strong> Tanggal benih mulai dimasukkan ke kolam.</li>
                    </ul>
                  </li>
                  <li>Klik <strong>Mulai Siklus</strong>. Status kolam otomatis berubah menjadi <strong>Aktif (Siklus Berjalan)</strong> dan sistem mulai menghitung Hari Setelah Tebar (DOC/HST).</li>
                </ol>
              </div>
            </div>

            {/* SOP 3: Pencatatan Log Harian */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>C. Cara Mencatat Log Harian pada Detail Siklus (`/budidaya/cycles/:id`):</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Droplet className="w-4 h-4" />
                    <span>1. Log Pakan Harian (+ Potong Stok):</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Klik tombol <strong>+ Catat Pakan</strong>. Pilih merk pakan yang digunakan dari dropdown gudang dan masukkan jumlah Kg yang diberikan (Pagi, Siang, Sore/Malam). Sistem akan otomatis <strong>mengurangi stok gudang</strong> dan menjumlahkan modal pakan siklus.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>2. Log Kematian (Mortalitas):</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Jika ada ikan mati yang diangkat, klik tombol <strong>+ Catat Mortalitas</strong> dan masukkan jumlah ekor mati. Sistem akan otomatis memperbarui populasi hidup, biomassa berjalan, dan <strong>Survival Rate (SR %)</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold">
                    <Scale className="w-4 h-4" />
                    <span>3. Log Sampling Bobot Berkala:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Saat melakukan sampling (misal 7 atau 14 hari sekali), klik <strong>+ Catat Sampling</strong>. Masukkan jumlah ekor sampel (misal 50 ekor) dan total berat timbangan (misal 4.500 gram). Sistem akan otomatis menghitung <strong>ABW (gram/ekor)</strong> dan <strong>ADG (laju pertumbuhan gr/hari)</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>4. Log Biaya Khusus Kolam:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Catat pengeluaran langsung khusus wadah tersebut (seperti probiotik kolam, vitamin pakan, atau garam) dengan mengklik <strong>+ Catat Biaya</strong> agar langsung terakumulasi ke dalam HPP modal kolam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: SOP Panen & Penutupan Siklus                                   */}
      {/* ========================================================================= */}
      {activeTab === 'harvest' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>SOP Pencatatan Panen, Perhitungan HPP & Penutupan Siklus</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Alur sistem saat pelaksanaan panen parsial (grading bertahap) maupun panen total.</p>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                Menu: /budidaya/cycles/:id
              </span>
            </div>

            {/* Langkah Input Panen */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Langkah-Langkah Input Panen di Aplikasi:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold font-mono">Tipe 1</span>
                  <h4 className="font-bold text-slate-900 text-sm">Panen Parsial (Bertahap / Grading)</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Gunakan opsi ini jika Anda hanya memanen sebagian ikan yang sudah mencapai bobot konsumsi terlebih dahulu tanpa mengakhiri siklus.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 pt-1">
                    <li>Buka halaman detail siklus kolam.</li>
                    <li>Klik tombol <strong>+ Input Panen</strong>.</li>
                    <li>Pilih jenis <strong>Panen Parsial</strong>.</li>
                    <li>Masukkan tonase berat panen (Kg) dan harga jual per Kg ke pembeli/pasar.</li>
                    <li>Simpan. Pendapatan akan langsung tercatat, dan sisa ikan di kolam tetap aktif berjalan.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold font-mono">Tipe 2</span>
                  <h4 className="font-bold text-slate-900 text-sm">Panen Total & Tutup Siklus (Final)</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Gunakan opsi ini saat seluruh isi kolam dipanen habis dan siklus pemeliharaan selesai.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 pt-1">
                    <li>Buka halaman detail siklus kolam.</li>
                    <li>Klik tombol <strong>+ Input Panen</strong> dan pilih <strong>Panen Total</strong>.</li>
                    <li>Masukkan total timbangan hasil panen akhir (Kg) dan harga jual per Kg.</li>
                    <li>Centang opsi <strong>Tutup Siklus Budidaya Ini</strong>.</li>
                    <li>Sistem otomatis mengkalkulasi <strong>FCR akhir, HPP modal per Kg, dan Laba Bersih Siklus</strong>, lalu mengembalikan status kolam menjadi <strong>Kosong</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Rekapitulasi Otomatis HPP & Laba */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Bagaimana Sistem Menghitung HPP & Laba Bersih Panen?</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Saat siklus ditutup, sistem secara otomatis mengagregasikan seluruh data transaksi yang telah tercatat:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 font-mono">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-teal-400 font-sans font-bold">1. Total Biaya Modal:</span>
                  <div className="text-white mt-1 text-[11px] font-sans">Biaya Benih + Seluruh Log Pakan Terpakai + Biaya Obat/Listrik yang tercatat di siklus.</div>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-blue-400 font-sans font-bold">2. HPP Modal / Kg:</span>
                  <div className="text-white mt-1 text-[11px] font-sans">Total Biaya Modal (Rp) ÷ Total Akumulasi Hasil Panen (Kg).</div>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-sans font-bold">3. Laba Bersih:</span>
                  <div className="text-white mt-1 text-[11px] font-sans">Total Omzet Penjualan Panen (Rp) - Total Biaya Modal (Rp).</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SOP Gudang Pakan & Saprodi                                     */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>SOP Pengelolaan Gudang Pakan, Saprodi & Otomasi Pemotongan Stok</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Mengatur inventori pakan, restock barang masuk, dan sinkronisasi otomatis dengan log kolam.</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                Menu: /budidaya/inventory & /budidaya/feeds
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold font-mono">1</span>
                <h4 className="font-bold text-slate-900 text-sm">Input Master Pakan & Saprodi</h4>
                <p className="text-slate-600 leading-relaxed">
                  Buka menu <strong>Gudang & Pakan</strong> (`/budidaya/inventory`). Klik <strong>+ Tambah Item</strong> untuk mendaftarkan merk pakan (misal <em>Pakan Apung Starter LP-1</em>), tipe ukuran butiran, dan satuan (Sak / Kg).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold font-mono">2</span>
                <h4 className="font-bold text-slate-900 text-sm">Restock Pembelian Masuk</h4>
                <p className="text-slate-600 leading-relaxed">
                  Saat membeli pakan baru dari supplier/distributor, klik tombol <strong>+ Tambah Stok Masuk</strong> pada item terkait. Masukkan jumlah karung/kg dan harga beli per satuan untuk memperbarui stok dan HPP rata-rata.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold font-mono">3</span>
                <h4 className="font-bold text-slate-900 text-sm">Otomasi Potong Stok Harian</h4>
                <p className="text-slate-600 leading-relaxed">
                  Setiap kali teknisi mencatat pakan di menu Siklus Kolam, saldo stok di gudang akan <strong>otomatis berkurang seketika</strong> tanpa perlu petugas gudang melakukan pemotongan manual ganda.
                </p>
              </div>
            </div>

            {/* Peringatan Stok Menipis */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold text-sm block">Fitur Notifikasi Stok Minimum (Safety Stock):</strong>
                <p className="leading-relaxed">
                  Anda dapat menyetel batas minimum stok (misal 10 sak). Ketika sisa pakan di gudang berada di bawah batas ini, sistem akan otomatis menampilkan lencana peringatan warna kuning/merah di dashboard farm agar Anda tidak kehabisan pakan di tengah siklus.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: SOP Kas & Laporan Laba Rugi                                    */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>SOP Buku Kas Operasional & Laporan Laba Rugi Farm</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Pencatatan beban biaya umum dan cara membaca laporan analisa keuangan farm.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Menu: /budidaya/expenses & /budidaya/finance-summary
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Buku Kas Transaksi */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>1. Pencatatan Beban di Menu Buku Kas (`/budidaya/expenses`):</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Gunakan menu ini untuk mencatat seluruh pengeluaran rutin non-pakan farm agar pembukuan tidak ada yang tercecer:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  <li><strong>Tagihan Listrik PLN:</strong> Biaya operasional kincir air, aerator & lampu.</li>
                  <li><strong>BBM Solar / Bensin:</strong> Penggunaan genset dan pompa hisap air.</li>
                  <li><strong>Upah & Tenaga Kerja:</strong> Gaji teknisi harian atau borongan saat panen.</li>
                  <li><strong>Perawatan & Alat:</strong> Pembelian selang aerasi, jaring serok, atau servis pompa.</li>
                </ul>
              </div>

              {/* Laporan Laba Rugi */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>2. Membaca Laporan di Menu Laba Rugi (`/budidaya/finance-summary`):</span>
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Menu ini menyajikan rekapitulasi keuangan secara real-time:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  <li><strong>Total Omzet Panen:</strong> Akumulasi seluruh pendapatan penjualan hasil panen.</li>
                  <li><strong>Total HPP & Pakan:</strong> Nilai seluruh pakan dan bibit yang sudah terpakai.</li>
                  <li><strong>Laba Bersih Farm:</strong> Pendapatan bersih setelah dikurangi HPP dan seluruh biaya operasional kas.</li>
                  <li><strong>Tombol Ekspor / Cetak:</strong> Anda dapat mencetak laporan laba rugi ke format PDF resmi kapan saja.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: Master Data, Tim & Pengaturan                                  */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-teal-600" />
                  <span>Master Data, Manajemen Pengguna & Pengaturan Sistem</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Konfigurasi kategori, hak akses staf lapangan, serta backup keamanan data.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                Menu: /budidaya/master-data & /budidaya/users
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span>Master Data</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Atur daftar <strong>Kategori Keuangan</strong> (pemasukan/pengeluaran), <strong>Satuan Dasar</strong> (Kg, Sak, Ekor, Gram), dan <strong>Kategori Pakan</strong> di menu <em>Master Data</em> (`/budidaya/master-data`).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Staf & Peran (Role)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Tambah akun pengguna untuk teknisi farm di menu <strong>Manajemen Pengguna</strong>. Atur izin akses di menu <strong>Peran & Izin</strong> agar operator hanya bisa menginput data lapangan tanpa membuka data laba rugi owner.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Backup Data Farm</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Lakukan pencadangan database berkala di menu <strong>Backup Data</strong> (`/budidaya/backup`). Anda dapat mengunduh arsip JSON/SQL cadangan kapan saja untuk memastikan seluruh riwayat siklus tetap aman.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: Kamus Rumus & Simulator Sistem                                 */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-teal-600" />
                  <span>Kamus Rumus Aplikasi & Simulator Hasil Siklus Interaktif</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Penjelasan rumus yang digunakan sistem dan alat simulasi angka untuk menguji proyeksi hasil panen.</p>
              </div>
              
              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Preset Komoditas:</span>
                <button onClick={() => applyPreset('lele')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer">Lele Bioflok</button>
                <button onClick={() => applyPreset('nila')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer">Nila Kolam</button>
                <button onClick={() => applyPreset('vaname')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer">Udang Vaname</button>
                <button onClick={() => applyPreset('gurami')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer">Gurami</button>
                <button onClick={() => applyPreset('hidroponik')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer">Hidroponik</button>
              </div>
            </div>

            {/* Kamus Rumus Sistem */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Kamus Rumus Otomatis di Dalam Sistem Aplikasi:</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">1. Survival Rate (SR % / Tingkat Kelangsungan Hidup):</div>
                  <div className="text-emerald-400 font-bold">SR (%) = [(Populasi Tebar - Total Mortalitas) ÷ Populasi Tebar] * 100%</div>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">2. Feed Conversion Ratio (FCR / Rasio Pakan):</div>
                  <div className="text-emerald-400 font-bold">FCR = Total Pakan Terpakai (Kg) ÷ Total Tonase Panen (Kg)</div>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">3. HPP Modal Panen per Kg:</div>
                  <div className="text-emerald-400 font-bold">HPP/Kg = Total Biaya Siklus (Rp) ÷ Total Hasil Panen (Kg)</div>
                </div>

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-teal-300 font-sans font-bold">4. Laba Bersih Siklus:</div>
                  <div className="text-emerald-400 font-bold">Laba Bersih = Total Omzet Panen (Rp) - Total Biaya Modal (Rp)</div>
                </div>
              </div>
            </div>

            {/* Input Form Simulator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">1. Populasi Tebar (Ekor/Bibit):</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcStockCount ? calcStockCount.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcStockCount(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="10.000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Jumlah bibit awal tebar</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">2. Harga Beli Bibit / Ekor (Rp):</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcSeedPrice ? calcSeedPrice.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcSeedPrice(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="250"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Harga bibit satuan dari pembenih</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">3. Total Pakan Terpakai (Kg):</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcTotalFeedKg ? calcTotalFeedKg.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcTotalFeedKg(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="1.200"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Akumulasi pakan 1 siklus</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">4. Harga Rata-rata Pakan / Kg (Rp):</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcFeedPriceKg ? calcFeedPriceKg.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcFeedPriceKg(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="12.000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Harga beli pakan per kg</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">5. Hasil Panen Akhir (Kg):</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcHarvestWeightKg ? calcHarvestWeightKg.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcHarvestWeightKg(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="1.000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Total timbangan hasil panen</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">6. Harga Jual Panen / Kg (Rp):</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcSellPriceKg ? calcSellPriceKg.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcSellPriceKg(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="26.000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Harga jual ke pembeli/tengkulak</p>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">7. Biaya Operasional Lainnya (Listrik, Obat, Upah):</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={calcOperCost ? calcOperCost.toLocaleString('id-ID') : ''}
                    onChange={(e) => setCalcOperCost(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    placeholder="2.000.000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Total biaya listrik, probiotik & upah selama siklus</p>
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
                  {netProfit > 0 ? '✅ Hasil Simulasi: Siklus Menguntungkan!' : '⚠️ Perhatian: Biaya Modal Melebihi Nilai Panen!'}
                </strong>
                <p className="leading-relaxed">
                  {netProfit > 0 
                    ? `Dengan FCR ${fcrRatio.toFixed(2)} dan HPP ${fmtRp(hppPerKg)}/Kg, Anda menghasilkan keuntungan bersih sebesar ${fmtRp(netProfit)} dari siklus ini (Margin bersih ${profitMarginPercent.toFixed(1)}%, Return on Investment ${roiPercent.toFixed(1)}%). Angka ini menunjukkan alokasi modal pakan sangat efisien.`
                    : `HPP modal per kg (${fmtRp(hppPerKg)}) lebih tinggi daripada harga jual pasar (${fmtRp(calcSellPriceKg)}). Periksa kembali efisiensi pakan (FCR), kurangi angka kematian, atau tingkatkan harga jual panen Anda!`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: Troubleshooting Aplikasi & FAQ                                 */}
      {/* ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                  <span>Troubleshooting Penggunaan Aplikasi & Pertanyaan Umum (FAQ)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Panduan solusi cepat untuk kendala teknis saat mengoperasikan aplikasi Budidaya.</p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-200">
                FAQ & Bantuan Aplikasi
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>1. Mengapa stok pakan di gudang tidak berkurang saat saya mencatat pakan harian?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab & Solusi:</strong> Pastikan saat mengisi form <em>+ Catat Pakan</em>, Anda memilih jenis pakan dari dropdown yang terdaftar di menu <strong>Gudang & Pakan</strong> (`/budidaya/inventory`), bukan mengetik teks manual baru. Sistem hanya memotong stok jika pakan terhubung dengan database inventori.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>2. Bagaimana jika operator salah memasukkan angka kg pakan atau ekor mortalitas?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab & Solusi:</strong> Buka halaman detail siklus kolam bersangkutan. Di bagian bawah terdapat tabel <strong>Riwayat Log Aktivitas</strong>. Klik ikon <em>Edit</em> atau <em>Hapus</em> pada baris log yang salah. Sistem akan otomatis mengembalikan stok pakan ke gudang dan mengoreksi kembali nilai FCR/biomassa.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>3. Bagaimana cara membatasi staf agar tidak bisa melihat laporan laba rugi dan keuangan?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab & Solusi:</strong> Masuk ke menu <strong>Pengaturan &gt; Peran & Izin</strong> (`/budidaya/roles`). Buat role baru (misal: <em>Operator Lapangan</em>) dan hanya aktifkan izin untuk `feeding`, `sampling`, dan `health`. Lalu tetapkan role tersebut ke akun staf di menu <strong>Manajemen Pengguna</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>4. Apakah riwayat siklus yang sudah dipanen dan selesai tetap bisa dilihat kembali?</span>
                </h3>
                <p className="text-slate-600 leading-relaxed pl-6">
                  <strong>Penyebab & Solusi:</strong> Ya. Seluruh siklus yang sudah ditutup tersimpan permanen pada tab <strong>Riwayat Siklus Selesai</strong> di menu `/budidaya/cycles` serta terangkum dalam laporan keuangan laba rugi di `/budidaya/finance-summary`.
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
