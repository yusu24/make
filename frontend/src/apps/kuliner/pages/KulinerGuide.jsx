import React, { useState } from 'react';
import KulinerAdminLayout from '../components/KulinerAdminLayout';
import { 
  BookOpen, 
  Utensils, 
  Clock, 
  Layers, 
  TrendingUp, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Receipt,
  ChefHat,
  QrCode,
  Package,
  Trash2,
  DollarSign,
  ArrowRight,
  Calculator,
  Percent,
  Split,
  FileSpreadsheet,
  Flame,
  Award,
  Coins
} from 'lucide-react';

const KulinerGuide = () => {
  const [activeTab, setActiveTab] = useState('menu');

  // Interactive Food Cost & Recipe Calculator State
  const [ing1Cost, setIng1Cost] = useState(6000);   // e.g. Daging Ayam 100gr
  const [ing2Cost, setIng2Cost] = useState(2500);   // e.g. Beras & Bumbu
  const [ing3Cost, setIng3Cost] = useState(1500);   // e.g. Minyak & Kemasan/Paper Box
  const [targetSellPrice, setTargetSellPrice] = useState(25000); // Harga Jual Menu

  const totalHppBahan = ing1Cost + ing2Cost + ing3Cost;
  const grossProfitPerPortion = targetSellPrice - totalHppBahan;
  const foodCostPercent = targetSellPrice > 0 ? (totalHppBahan / targetSellPrice) * 100 : 0;
  const grossMarginPercent = targetSellPrice > 0 ? (grossProfitPerPortion / targetSellPrice) * 100 : 0;

  const fmtRp = (num) => `Rp ${Math.round(num || 0).toLocaleString('id-ID')}`;

  return (
    <KulinerAdminLayout title="Buku Panduan & SOP Resto">
      <div className="kd-content space-y-6 pb-16">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-amber-100 border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan, SOP & Kamus Rumus Resto / Kafe</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Lengkap & Rumus Operasional Kuliner
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              Pelajari alur lengkap operasional restoran dan kafe: Resep & Bill of Materials (BOM HPP Porsi), Manajemen Meja & QR Self-Order, Kitchen Display System (KDS), Stock Opname Bahan Baku & Waste Basi, Service Charge & PB1, Rekonsiliasi Kas Laci (Shift Z), serta Analisis Menu Engineering (Stars, Plowhorses, Puzzles, Dogs).
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
          {[
            { id: 'menu', label: '1. Menu, Bahan & Resep BOM', icon: Utensils },
            { id: 'table', label: '2. Meja & QR Self-Order', icon: QrCode },
            { id: 'pos', label: '3. Kasir, KDS & Split Bill', icon: ChefHat },
            { id: 'inventory', label: '4. Stok Bahan, Yield & Waste', icon: Package },
            { id: 'shift', label: '5. Buka & Tutup Shift (Shift Z)', icon: Clock },
            { id: 'reports', label: '6. Rumus Laba Rugi & Menu Matrix', icon: TrendingUp },
            { id: 'calculator', label: '🧮 Simulator Food Cost & BOM', icon: Calculator },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-amber-600 text-white shadow-sm' 
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
        {/* SECTION 1: Menu, Bahan Baku & Resep BOM                                   */}
        {/* ========================================================================= */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-amber-600" />
                    <span>SOP Setup Master Menu, Bahan Baku & Resep BOM (HPP Otomatis)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Sistem Bill of Materials memotong gramasi bahan baku saat kasir melayani transaksi penjualan.</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                  Menu: /kuliner/admin/ingredients & /kuliner/admin/recipes
                </span>
              </div>

              {/* 3 Langkah Setup Menu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: '1',
                    title: 'Input Bahan Baku (Raw Materials)',
                    desc: 'Daftarkan bahan mentah seperti Biji Kopi (gr), Susu UHT (ml), Daging Ayam (gr), Beras (gr) dengan harga beli per satuan terkecil.',
                  },
                  {
                    step: '2',
                    title: 'Rakit Resep BOM per Porsi',
                    desc: 'Tautkan komposisi takaran bahan ke menu. Contoh: "Kopi Latte" = 18 gr Biji Kopi + 150 ml Susu + 1 Paper Cup. HPP porsi terkalkulasi otomatis.',
                  },
                  {
                    step: '3',
                    title: 'Setup Modifier & Add-on',
                    desc: 'Atur varian (Less Sugar, Normal Ice, Level Pedas) dan add-on topping berbayar (Extra Shot, Keju, Telur) beserta resep tambahannya.',
                  }
                ].map(card => (
                  <div key={card.step} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-amber-300 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {card.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Box Rumus BOM & Food Cost */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Kamus Rumus HPP Resep & Food Cost Persentase Resto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                    <div className="text-amber-300 font-bold font-sans text-xs">1. Rumus HPP Resep BOM Porsi (Cost of Goods):</div>
                    <div className="text-emerald-400 font-bold">HPP Menu = Total (Gramasi Bahan * Harga Beli Dasar per Satuan)</div>
                    <div className="text-slate-400 font-sans text-[11px]">Contoh: 18 gr kopi (Rp 3.600) + 150 ml susu (Rp 2.400) + Cup (Rp 1.000) = HPP Rp 7.000.</div>
                  </div>

                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                    <div className="text-amber-300 font-bold font-sans text-xs">2. Rumus Food Cost Percentage (%):</div>
                    <div className="text-emerald-400 font-bold">Food Cost % = (HPP Bahan Baku Porsi ÷ Harga Jual Menu) * 100%</div>
                    <div className="text-slate-400 font-sans text-[11px]">Standar Industri Resto & Kafe Sehat: <strong>28% - 35%</strong> (Maksimal 38%).</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: Meja & QR Self-Order                                           */}
        {/* ========================================================================= */}
        {activeTab === 'table' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-orange-600" />
                    <span>SOP Manajemen Meja & QR Self-Order Pelanggan</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Mempercepat pesanan resto tanpa antrean panjang di kasir.</p>
                </div>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
                  Menu: /kuliner/admin/tables
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Langkah Setup Meja Resto:</span>
                  </h3>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Buka menu <strong>Manajemen Meja</strong> di sidebar kiri.</li>
                    <li>Klik <strong>+ Tambah Meja</strong>, masukkan nomor meja (contoh: Meja 01, VIP 1) dan kapasitas kursi.</li>
                    <li>Sistem otomatis men-generate URL unik dan QR Code untuk setiap meja.</li>
                    <li>Klik <strong>Cetak QR Meja</strong> untuk dicetak dan ditempelkan pada akrilik meja makan.</li>
                  </ol>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Alur Pemesanan Mandiri (QR Self-Order):</span>
                  </h3>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Tamu duduk di meja dan scan QR meja dengan kamera smartphone.</li>
                    <li>Katalog menu digital terbuka tanpa perlu mendownload aplikasi apapun.</li>
                    <li>Tamu memilih menu makanan, minuman, dan level pedas/topping.</li>
                    <li>Klik <strong>Kirim Pesanan</strong>. Pesanan langsung masuk ke Kasir dan Layar Dapur (KDS).</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: Kasir POS, KDS & Split Bill                                    */}
        {/* ========================================================================= */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-amber-600" />
                    <span>SOP Kasir POS, Kitchen Display System (KDS), Split Bill & Pajak Resto (PB1)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Alur pemrosesan pesanan dari kasir depan sampai ke koki dapur.</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                  Menu: /kuliner/admin/orders & /kuliner/admin/kitchen-queue
                </span>
              </div>

              {/* 4 Langkah Kasir & Dapur */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    step: '1',
                    title: 'Pilih Tipe Order',
                    desc: 'Pilih Dine-in (pilih nomor meja), Take Away, atau Delivery. Masukkan menu pesanan tamu beserta catatan koki.',
                  },
                  {
                    step: '2',
                    title: 'Kirim ke Dapur (KOT / KDS)',
                    desc: 'Klik tombol "Kirim ke Dapur". Tiket KOT otomatis tercetak di printer dapur/bar atau tampil di layar antrean KDS.',
                  },
                  {
                    step: '3',
                    title: 'Split Bill / Gabung Meja',
                    desc: 'Jika tamu ingin bayar terpisah, gunakan fitur Split Bill (bagi rata nominal tagihan atau bagi per item makanan).',
                  },
                  {
                    step: '4',
                    title: 'Pembayaran & Tutup Meja',
                    desc: 'Terima pembayaran Tunai, QRIS, EDC Kartu, lalu status meja otomatis kembali kosong (Hijau/Available).',
                  }
                ].map(card => (
                  <div key={card.step} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {card.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rumus Pajak Resto PB1 & Service Charge */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Rumus Perhitungan Service Charge & Pajak Restoran (PB1 10%)</h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2 font-mono text-xs">
                  <div className="text-amber-300 font-sans font-bold">Rumus Perhitungan Bertingkat Tagihan Restoran:</div>
                  <div className="text-emerald-400 font-bold">1. Subtotal = Total Harga Menu Makanan & Minuman</div>
                  <div className="text-emerald-400 font-bold">2. Service Charge (misal 5%) = Subtotal * 5%</div>
                  <div className="text-emerald-400 font-bold">3. Pajak Resto PB1 (10%) = (Subtotal + Service Charge) * 10%</div>
                  <div className="text-emerald-400 font-bold text-sm pt-1">Total Bayar = Subtotal + Service Charge + PB1</div>
                  
                  <div className="text-slate-400 font-sans text-xs pt-2">
                    *Contoh: Pesan makanan Rp 200.000. Service Charge 5% = Rp 10.000. Dasar PB1 = Rp 210.000. PB1 10% = Rp 21.000. Total Akhir Struk = <strong>Rp 231.000</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: Stok Bahan, Yield % & Pencatatan Waste                         */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-rose-600" />
                    <span>SOP Pembelian Bahan (PO), Rumus Rendemen (Yield %) & Pencatatan Waste</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Mengontrol susut bahan baku mentah dan membukukan kerugian makanan tumpah/basi.</p>
                </div>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                  Menu: /kuliner/admin/waste & /kuliner/admin/stock-opname
                </span>
              </div>

              {/* Rumus Rendemen Yield % */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>Rumus Rendemen Bahan (Yield Percentage)</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Banyak bahan baku segar mengalami penyusutan berat setelah dibersihkan (dikupas, dibuang tulang, dipotong lemak).
                </p>

                <div className="p-4 rounded-xl bg-white border border-amber-200 font-mono text-xs space-y-2">
                  <div className="text-amber-900 font-bold font-sans">Rumus Yield %:</div>
                  <div className="text-emerald-700 font-bold">Yield (%) = (Berat Bersih Siap Pakai ÷ Berat Mentah Beli) * 100%</div>
                  <div className="text-emerald-700 font-bold">HPP Riil Bahan Bersih = Harga Beli Asli ÷ (Yield % / 100)</div>
                  
                  <div className="text-slate-600 font-sans text-xs pt-1">
                    *Contoh: Beli Daging Ayam Utuh 1.000 gr seharga Rp 40.000. Setelah difillet dan dibuang tulang, tersisa 700 gr daging bersih (Yield = 70%). Maka HPP daging bersih siap masak = Rp 40.000 / 0.7 = <strong>Rp 57.142 / Kg</strong>.
                  </div>
                </div>
              </div>

              {/* Pencatatan Waste */}
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  <span>SOP Pencatatan Waste & Makanan Rusak / Basi</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Bahan baku yang tumpah, basi, kadaluarsa, atau makanan salah masak yang dibuang wajib dicatat pada menu <strong>Pencatatan Waste</strong> agar selisih stok fisik terjelaskan dan nilai kerugian langsung tercatat di laporan laba rugi.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                  <div className="p-3 rounded-lg bg-white border border-rose-200">
                    <div className="text-rose-900 font-bold font-sans">Rumus Kerugian Waste Bahan:</div>
                    <div className="text-rose-700 font-bold">Rugi Waste = Gramasi Terbuang * HPP Satuan</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-rose-200">
                    <div className="text-rose-900 font-bold font-sans">Rumus Kerugian Makanan Jadi:</div>
                    <div className="text-rose-700 font-bold">Rugi Menu = Porsi Terbuang * HPP Resep BOM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: Shift Kasir (Shift Z)                                          */}
        {/* ========================================================================= */}
        {activeTab === 'shift' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span>SOP Buka & Tutup Shift Kasir Resto (Shift Z)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Audit kas harian resto untuk mencocokkan uang tunai laci vs transaksi sistem.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                  Menu: /kuliner/admin/shift
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <strong className="text-blue-900 font-bold block text-sm">1. Saat Buka Shift (Opening Kasir):</strong>
                  <p>Kasir menghitung uang modal receh di laci kasir (misal Rp 300.000), lalu masukkan angka tersebut pada prompt "Buka Shift" sebelum melayani tamu pertama.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <strong className="text-emerald-900 font-bold block text-sm">2. Saat Tutup Shift (Closing / Z-Report):</strong>
                  <p>Kasir menghitung seluruh uang fisik di laci (Modal + Penjualan Tunai - Pengeluaran Kas Operasional seperti beli es batu/gas LPG mendadak). Masukkan nominal fisik ke sistem untuk memeriksa apakah ada selisih kas (Balance / Kurang / Lebih), lalu cetak Laporan Shift Z.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: Rumus Laba Rugi & Menu Engineering Matrix                     */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>Rumus Laba Rugi Resto, Indikator F&B & Matriks Menu Engineering</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Struktur perhitungan laba rugi standar industri F&B, Food Cost %, Prime Cost %, BEP, dan optimasi menu.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  Menu: /kuliner/admin/reports-advanced & /kuliner/admin/finance
                </span>
              </div>

              {/* Papan Rumus Laba Rugi Utama Restoran */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    <span>Struktur Resmi Laporan Laba Rugi Restoran (P&L Resto)</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Standar Akuntansi F&B
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">1. Pendapatan Penjualan Bersih (Net Revenue):</div>
                      <div className="text-emerald-300 font-bold">Net Revenue = Total Penjualan Kotor - Diskon Promo</div>
                      <div className="text-[11px] text-slate-400 font-sans">*Pajak PB1 10% & Service Charge tidak dihitung sebagai omzet resto karena merupakan titipan kas.</div>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">2. Total HPP Makanan & Minuman (COGS):</div>
                      <div className="text-rose-300 font-bold">Total HPP = Σ (Qty Menu Terjual × HPP Resep BOM) + Rugi Waste Bahan</div>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">3. Laba Kotor Resto (Gross Profit):</div>
                      <div className="text-amber-300 font-bold">Laba Kotor = Net Revenue - Total HPP Bahan</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">4. Beban Operasional Resto (Opex):</div>
                      <div className="text-rose-300 font-bold">Opex = Gaji Staf + Sewa Tempat + Listrik/Air/Gas LPG + Kemasan/Takeaway + Software/Marketing</div>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">5. Laba Bersih Resto (Net Profit):</div>
                      <div className="text-emerald-400 font-bold text-sm">Laba Bersih = Laba Kotor - Total Beban Operasional</div>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl space-y-1">
                      <div className="text-slate-400 font-sans font-semibold">6. Persentase Laba Bersih (Net Profit Margin %):</div>
                      <div className="text-teal-300 font-bold">Net Margin % = (Laba Bersih ÷ Net Revenue) × 100%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indikator Vital F&B Resto */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-indigo-600" />
                  <span>3 Indikator Keuangan Kunci Restoran / Kafe yang Sehat:</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Food Cost %</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">Ideal: 28% - 35%</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-800 bg-white p-2.5 rounded-lg border border-emerald-200">
                      Food Cost % = (HPP Bahan ÷ Harga Jual) × 100%
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Jika Food Cost di atas 40%, profit resto Anda akan terancam habis oleh biaya bahan baku mentah.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Labor Cost %</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">Ideal: 15% - 25%</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-blue-800 bg-white p-2.5 rounded-lg border border-blue-200">
                      Labor Cost % = (Total Gaji ÷ Net Revenue) × 100%
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Total pengeluaran gaji juru masak (koki), barista, kasir, dan pramusaji terhadap total omzet bulanan.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">Prime Cost %</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">Wajib &lt; 60%</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-purple-800 bg-white p-2.5 rounded-lg border border-purple-200">
                      Prime Cost % = Food Cost % + Labor Cost %
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Total gabungan biaya bahan + gaji. Jika Prime Cost melebihi 65%, resto dipastikan rugi setelah membayar sewa & listrik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rumus Titik Impas (BEP Resto) */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  <span>Rumus Titik Impas Resto (Break-Even Point / BEP)</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Menghitung berapa omzet minimal atau porsi yang wajib terjual per bulan agar resto tidak mengalami kerugian operasional:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                    <div className="font-sans font-bold text-amber-900">1. BEP Nominal Omzet Bulanan (Rp):</div>
                    <div className="font-bold text-amber-800">BEP (Rp) = Biaya Tetap (Sewa + Gaji + Listrik) ÷ [1 - (Food Cost % ÷ 100)]</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                    <div className="font-sans font-bold text-amber-900">2. BEP Target Penjualan Harian (Porsi/Hari):</div>
                    <div className="font-bold text-amber-800">Target Harian = BEP Nominal ÷ (Harga Rata-Rata Menu × 30 Hari)</div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 pt-1">
                  <em>Contoh: Biaya Tetap bulanan Rp 25.000.000, Food Cost 30% (0.3). Maka BEP Omzet = Rp 25.000.000 / (1 - 0.3) = <strong>Rp 35.714.285 / bulan</strong> (atau ~Rp 1.190.000 / hari).</em>
                </div>
              </div>

              {/* Tabel Studi Kasus Angka Riil */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  <span>Studi Kasus: Contoh Perhitungan Laba Rugi Resto / Cafe Sebulan (Omzet Rp 100 Juta)</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-200/80 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2.5">Komponen Keuangan</th>
                        <th className="p-2.5">Nominal (Rp)</th>
                        <th className="p-2.5">Rasio (%)</th>
                        <th className="p-2.5">Evaluasi Kesehatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      <tr className="bg-white">
                        <td className="p-2.5 font-bold font-sans">Penjualan Kotor (Gross Sales)</td>
                        <td className="p-2.5 text-slate-900 font-bold">Rp 100.000.000</td>
                        <td className="p-2.5 text-slate-600">100.0%</td>
                        <td className="p-2.5 text-emerald-700 font-sans font-semibold">Baseline 100%</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 text-rose-700 font-sans">(-) HPP Bahan Baku Makanan & Minuman</td>
                        <td className="p-2.5 text-rose-700">- Rp 31.000.000</td>
                        <td className="p-2.5 text-rose-700">31.0%</td>
                        <td className="p-2.5 text-emerald-700 font-sans">Sangat Sehat (Food Cost &lt; 35%)</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 text-rose-700 font-sans">(-) Kerugian Bahan Basi / Salah Masak (Waste)</td>
                        <td className="p-2.5 text-rose-700">- Rp 1.500.000</td>
                        <td className="p-2.5 text-rose-700">1.5%</td>
                        <td className="p-2.5 text-emerald-700 font-sans">Terkendali (Waste &lt; 2%)</td>
                      </tr>
                      <tr className="bg-emerald-50/50 font-bold text-emerald-900">
                        <td className="p-2.5 font-sans">(=) Laba Kotor Resto (Gross Profit)</td>
                        <td className="p-2.5">Rp 67.500.000</td>
                        <td className="p-2.5">67.5%</td>
                        <td className="p-2.5 font-sans">Margin Kotor Tebal</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-2.5 text-slate-700 font-sans">(-) Gaji Karyawan Dapur & Kasir (Labor Cost)</td>
                        <td className="p-2.5 text-rose-700">- Rp 18.000.000</td>
                        <td className="p-2.5 text-slate-600">18.0%</td>
                        <td className="p-2.5 text-emerald-700 font-sans">Prime Cost = 49% (Di bawah 60% ✓)</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-2.5 text-slate-700 font-sans">(-) Sewa Ruko / Tempat Bulanan</td>
                        <td className="p-2.5 text-rose-700">- Rp 8.000.000</td>
                        <td className="p-2.5 text-slate-600">8.0%</td>
                        <td className="p-2.5 text-slate-600 font-sans">Standar Lokasi Strategis</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-2.5 text-slate-700 font-sans">(-) Listrik, Air, Gas LPG & Wifi</td>
                        <td className="p-2.5 text-rose-700">- Rp 5.000.000</td>
                        <td className="p-2.5 text-slate-600">5.0%</td>
                        <td className="p-2.5 text-slate-600 font-sans">Utilitas Resto</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-2.5 text-slate-700 font-sans">(-) Kemasan Takeaway, Kantong & Sedotan</td>
                        <td className="p-2.5 text-rose-700">- Rp 3.500.000</td>
                        <td className="p-2.5 text-slate-600">3.5%</td>
                        <td className="p-2.5 text-slate-600 font-sans">Packaging Cost</td>
                      </tr>
                      <tr className="bg-emerald-100/80 font-extrabold text-emerald-950 text-sm">
                        <td className="p-3 font-sans">(=) Laba Bersih Resto (Net Profit)</td>
                        <td className="p-3 text-emerald-800">Rp 33.000.000</td>
                        <td className="p-3 text-emerald-800">33.0%</td>
                        <td className="p-3 font-sans text-emerald-800">Sangat Menguntungkan (Net &gt; 20% ✓)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4 Kuadran Menu Engineering */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Matriks Menu Engineering (Boston Consulting Group Resto)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span>⭐ 1. Stars (Margin Tebal & Terlaris)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Menu dengan margin profit tinggi dan volume penjualan tinggi. <strong>Tindakan:</strong> Pertahankan resep, konsistensi rasa, dan tempatkan di posisi utama buku menu.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span>🐴 2. Plowhorses (Margin Tipis & Terlaris)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Menu sangat populer tapi margin tipis (HPP mahal). <strong>Tindakan:</strong> Naikkan harga jual sedikit atau cari alternatif supplier bahan baku yang lebih murah untuk mempertebal margin.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <span>🧩 3. Puzzles (Margin Tebal & Kurang Laris)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Menu sangat menguntungkan tapi jarang dipesan tamu. <strong>Tindakan:</strong> Re-branding nama menu, pasang foto menarik, atau beri insentif pramusaji untuk merekomendasikannya ke tamu.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <span>🐶 4. Dogs (Margin Tipis & Tidak Laku)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Menu yang jarang dipesan dan tidak menguntungkan. <strong>Tindakan:</strong> Hapus dari daftar menu agar tidak membebani stok bahan baku yang berisiko basi (*waste*).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: Simulator Food Cost & BOM                                      */}
        {/* ========================================================================= */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-amber-600" />
                    <span>Simulator Food Cost & Resep BOM Resto Interaktif</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Uji coba simulasi biaya bahan baku per porsi untuk memvalidasi kelayakan margin menu resto Anda.</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                  Fitur Alat Bantu Edukasi Resto
                </span>
              </div>

              {/* Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">1. Biaya Bahan Pokok Utama (Rp):</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ing1Cost ? ing1Cost.toLocaleString('id-ID') : ''}
                      onChange={(e) => setIng1Cost(Number(e.target.value.replace(/\D/g, '')) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="6.000"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Contoh: Daging Ayam / Kopi</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">2. Biaya Bahan Pendukung (Rp):</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ing2Cost ? ing2Cost.toLocaleString('id-ID') : ''}
                      onChange={(e) => setIng2Cost(Number(e.target.value.replace(/\D/g, '')) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="2.500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Contoh: Beras, Susu, Bumbu Racik</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">3. Biaya Kemasan / Garnish (Rp):</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ing3Cost ? ing3Cost.toLocaleString('id-ID') : ''}
                      onChange={(e) => setIng3Cost(Number(e.target.value.replace(/\D/g, '')) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="1.500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Contoh: Paper Cup, Dus Box</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">4. Target Harga Jual Menu (Rp):</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 font-mono select-none">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={targetSellPrice ? targetSellPrice.toLocaleString('id-ID') : ''}
                      onChange={(e) => setTargetSellPrice(Number(e.target.value.replace(/\D/g, '')) || 0)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      placeholder="25.000"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Harga di daftar menu tamu</p>
                </div>
              </div>

              {/* Output Calculation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Total HPP Porsi (BOM)</span>
                  <div className="text-xl font-extrabold text-amber-950 font-mono">{fmtRp(totalHppBahan)}</div>
                  <p className="text-[10.5px] text-amber-600">Total modal bahan porsi</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Laba Kotor / Porsi</span>
                  <div className="text-xl font-extrabold text-emerald-950 font-mono">{fmtRp(grossProfitPerPortion)}</div>
                  <p className="text-[10.5px] text-emerald-600">Untung kotor per porsi terjual</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${foodCostPercent <= 35 ? 'bg-blue-50 border-blue-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Food Cost %</span>
                  <div className={`text-xl font-extrabold font-mono ${foodCostPercent <= 35 ? 'text-blue-950' : 'text-rose-950'}`}>{foodCostPercent.toFixed(1)}%</div>
                  <p className="text-[10.5px] text-slate-600">Ideal: 28% - 35%</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Gross Margin %</span>
                  <div className="text-xl font-extrabold text-purple-950 font-mono">{grossMarginPercent.toFixed(1)}%</div>
                  <p className="text-[10.5px] text-purple-600">Tingkat margin keuntungan</p>
                </div>
              </div>

              {/* Status Evaluasi Resto */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 ${foodCostPercent <= 35 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                {foodCostPercent <= 35 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <strong className="font-bold text-sm block">
                    {foodCostPercent <= 35 ? '✅ Resep & Food Cost Sangat Sehat (Ideal Resto)' : '⚠️ Perhatian: Food Cost Terlalu Tinggi!'}
                  </strong>
                  <p className="leading-relaxed">
                    {foodCostPercent <= 35 
                      ? `Food cost ${foodCostPercent.toFixed(1)}% berada dalam batas emas standar restoran (di bawah 35%). Margin ${grossMarginPercent.toFixed(1)}% sangat cukup untuk menutupi biaya operasional resto (sewa tempat, gaji koki/waitress, gas LPG, listrik chiller).`
                      : `Food cost ${foodCostPercent.toFixed(1)}% melebihi batas aman 35%. Restoran berisiko rugi karena sisa margin terlalu tipis untuk menutup biaya operasional. Disarankan menaikkan harga jual atau menyesuaikan takaran gramasi bahan baku!`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </KulinerAdminLayout>
  );
};

export default KulinerGuide;
