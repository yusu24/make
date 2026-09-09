import React, { useState } from 'react';
import { 
  BookOpen, 
  ShoppingCart, 
  Barcode, 
  Layers, 
  Receipt, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2,
  Package,
  TrendingUp,
  CreditCard,
  Truck,
  ArrowRight,
  Printer,
  Boxes,
  Calculator,
  Percent,
  Wallet,
  Calendar,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Split,
  Tag,
  DollarSign,
  HelpCircle,
  TrendingDown,
  Archive,
  Zap,
  Store,
  Key,
  Server,
  RefreshCw
} from 'lucide-react';

const RetailGuide = () => {
  const [activeTab, setActiveTab] = useState('pos');

  // Interactive Calculator State
  const [calcBuyPrice, setCalcBuyPrice] = useState(80000);
  const [calcSellPrice, setCalcSellPrice] = useState(100000);
  const [calcDiscountPercent, setCalcDiscountPercent] = useState(0);

  // Dynamic Calculator Computations
  const discountedSellPrice = calcSellPrice - (calcSellPrice * (calcDiscountPercent / 100));
  const profitNominal = discountedSellPrice - calcBuyPrice;
  const marginPercent = discountedSellPrice > 0 ? (profitNominal / discountedSellPrice) * 100 : 0;
  const markupPercent = calcBuyPrice > 0 ? (profitNominal / calcBuyPrice) * 100 : 0;

  const fmtRp = (num) => `Rp ${Math.round(num || 0).toLocaleString('id-ID')}`;

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan, SOP & Kamus Rumus Operasional Retail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panduan Lengkap & Rumus Modul Retail & POS
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Pelajari alur lengkap seluruh menu di modul Retail: Transaksi kasir kilat, rekonsiliasi kas laci (Shift Z), konversi multi-satuan, pembelian barang (PO), audit stock opname, perhitungan pajak PPN, hingga kalkulasi mendalam HPP, Margin %, dan Laba Rugi Bersih.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'pos', label: '1. Kasir (POS) & Retur', icon: ShoppingCart },
          { id: 'shift', label: '2. Shift & Uang Laci (Shift Z)', icon: Clock },
          { id: 'master', label: '3. Multi-Satuan, Barcode & Expired', icon: Barcode },
          { id: 'purchasing', label: '4. Pembelian PO, HPP & Stok Opname', icon: Package },
          { id: 'finance', label: '5. Keuangan, Hutang & Piutang', icon: Wallet },
          { id: 'reports', label: '6. Rumus Laba Rugi & Margin', icon: TrendingUp },
          { id: 'api_backup', label: '7. API, Webhook & Backup Data', icon: Archive },
          { id: 'calculator', label: '🧮 Simulator Rumus Interaktif', icon: Calculator },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
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
      {/* SECTION 1: POS Kasir, Multi-Payment & Retur                               */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span>SOP Transaksi Kasir Cepat (Point of Sale) & Retur Pelanggan</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Panduan lengkap langkah demi langkah kasir toko dari input barang sampai cetak struk.</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                Menu: /retail/pos
              </span>
            </div>

            {/* 4 Langkah Utama POS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Scan / Cari Produk',
                  desc: 'Arahkan barcode scanner fisik ke barcode produk, atau ketik nama/kode SKU pada kolom pencarian (Shortcut keyboard F2).',
                },
                {
                  step: '2',
                  title: 'Atur Qty & Harga Grosir',
                  desc: 'Sesuaikan jumlah beli. Jika pembeli membeli kuantiti banyak (misal >= 12 pcs), sistem otomatis menerapkan harga grosir yang sudah disetting.',
                },
                {
                  step: '3',
                  title: 'Pilih Metode Pembayaran',
                  desc: 'Pilih Tunai (masukkan uang diterima), QRIS Dinamis/Statis, Kartu Debit/Kredit EDC, Split Bayar, atau Piutang Kasbon Member.',
                },
                {
                  step: '4',
                  title: 'Cetak Struk & Kick Drawer',
                  desc: 'Klik tombol Bayar (Shortcut F4). Printer thermal mencetak struk dan laci kasir (cash drawer) otomatis terbuka via sinyal RJ11.',
                }
              ].map(card => (
                <div key={card.step} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {card.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Box Rumus POS */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Kamus Rumus Perhitungan di Kasir (POS)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-indigo-300 font-bold font-sans text-xs">1. Rumus Uang Kembalian:</div>
                  <div className="text-emerald-400 font-bold">Kembalian = Uang Tunai Diterima - Total Tagihan Akhir</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Belanja Rp 87.500, Uang diterima Rp 100.000 = Kembalian Rp 12.500.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-indigo-300 font-bold font-sans text-xs">2. Rumus Diskon Persentase (%):</div>
                  <div className="text-emerald-400 font-bold">Potongan Rp = Harga Normal * (Diskon % / 100)</div>
                  <div className="text-slate-400 font-sans text-[11px]">Contoh: Kemeja Rp 150.000 diskon 20% = Potongan Rp 30.000, Bayar Rp 120.000.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-indigo-300 font-bold font-sans text-xs">3. Rumus Pajak PPN Eksklusif (11% Di Luar Harga):</div>
                  <div className="text-emerald-400 font-bold">Nilai PPN = Total Belanja * 11%</div>
                  <div className="text-slate-400 font-sans text-[11px]">Harga Rp 100.000 + PPN Rp 11.000 = Total Tagihan Rp 111.000.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-indigo-300 font-bold font-sans text-xs">4. Rumus Pajak PPN Inklusif (11% Sudah Termasuk di Harga):</div>
                  <div className="text-emerald-400 font-bold">DPP = Total Harga / 1.11 | Nilai PPN = DPP * 11%</div>
                  <div className="text-slate-400 font-sans text-[11px]">Harga Rp 111.000: DPP (Dasar Pengenaan Pajak) = Rp 100.000, PPN = Rp 11.000.</div>
                </div>
              </div>
            </div>

            {/* Fitur Khusus: Hold Cart & Retur Pelanggan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Fitur Tahan Transaksi (Hold & Recall Cart)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Jika pembeli sedang di kasir lalu ingin mengambil barang tambahan yang tertinggal, kasir dapat menekan tombol <strong>Tahan Keranjang (Hold)</strong>. Kasir dapat melayani antrean pembeli berikutnya tanpa menghapus belanjaan pembeli pertama. Setelah pembeli kembali, klik <strong>Buka Keranjang (Recall)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>SOP Retur Penjualan Pelanggan</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Buka menu <strong>Retur Pelanggan</strong>. Masukkan Nomor Struk/Invoice asli. Pilih item barang yang dikembalikan (misal rusak / salah ukuran). Stok barang akan otomatis kembali ke inventori toko dan kasir mengeluarkan dana pengembalian (Refund) yang tercatat di laporan kas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: Manajemen Shift Kasir & Rekonsiliasi Kas Laci (Shift Z)        */}
      {/* ========================================================================= */}
      {activeTab === 'shift' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>SOP Buka & Tutup Shift Kasir (Rekonsiliasi Laci Kas / Laporan Z)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Prosedur wajib pertanggungjawaban uang kasir untuk mencegah kebocoran kas.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                Menu: /retail/shifts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buka Shift */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>SOP Buka Shift (Pagi / Pergantian Kasir)</span>
                </div>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Kasir menerima modal uang kembalian receh dari Supervisor/Owner.</li>
                  <li>Hitung lembaran fisik uang receh tersebut di depan saksi (misal Rp 200.000).</li>
                  <li>Login ke sistem kasir, masukkan nominal modal awal pada prompt dialog <strong>Buka Shift</strong>.</li>
                  <li>Sistem mencatat jam mulai shift dan nama kasir yang bertugas.</li>
                </ol>
              </div>

              {/* Tutup Shift */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>SOP Tutup Shift (Malam / Closing / Serah Terima)</span>
                </div>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Keluarkan seluruh uang dari laci kasir dan hitung fisik uang per pecahan.</li>
                  <li>Klik tombol <strong>Tutup Shift (Z-Report)</strong> di menu Shift Kasir.</li>
                  <li>Masukkan total uang fisik yang dihitung.</li>
                  <li>Sistem otomatis membandingkan uang fisik vs catatan transaksi komputer dan mencetak <strong>Struk Laporan Shift Z</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Rumus Rekonsiliasi Kas */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Rumus Matematis Audit Kas Laci (Shift Z)</h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2 font-mono text-xs">
                <div className="text-indigo-300 font-sans font-bold">1. Rumus Ekspektasi Kas Sistem (Expected Cash):</div>
                <div className="text-emerald-400 font-bold text-sm">
                  Ekspektasi Kas = Modal Awal + Total Penjualan Tunai + Kas Masuk Lain - Pengeluaran Kas Kecil - Refund Tunai
                </div>
                <p className="text-slate-400 font-sans text-xs pt-1">
                  *Catatan: Pembayaran QRIS, EDC Bank, dan Piutang tidak dihitung ke uang fisik laci karena langsung masuk ke rekening bank / buku piutang.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2 font-mono text-xs">
                <div className="text-indigo-300 font-sans font-bold">2. Rumus Selisih Kas (Cash Variance):</div>
                <div className="text-emerald-400 font-bold text-sm">
                  Selisih Kas = Total Uang Fisik Terhitung - Ekspektasi Kas Sistem
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-sans">
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-200">
                    <strong>Selisih = Rp 0 (Balance)</strong>
                    <p className="text-[11px] mt-0.5">Uang kasir 100% pas dan akurat.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-900/40 border border-blue-700/60 text-blue-200">
                    <strong>Selisih {'>'} 0 (Lebih / Overage)</strong>
                    <p className="text-[11px] mt-0.5">Uang laci berlebih (kasir salah hitung kembalian pelanggan). Dibukukan ke pendapatan lain.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-900/40 border border-rose-700/60 text-rose-200">
                    <strong>Selisih {'<'} 0 (Kurang / Shortage)</strong>
                    <p className="text-[11px] mt-0.5">Uang laci kurang (kemungkinan salah kembalian atau barang tidak ter-scan). Kasir wajib mengganti.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: Multi-Satuan, Cetak Barcode & Expired Date                     */}
      {/* ========================================================================= */}
      {activeTab === 'master' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-purple-600" />
                  <span>SOP Setup Barang, Multi-Satuan (UOM), Expired Date & Label Barcode</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Mengelola fleksibilitas satuan grosir dan penandaan label produk rak toko.</p>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                Menu: /retail/products & /retail/print-labels
              </span>
            </div>

            {/* Hierarki Multi-Satuan */}
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-600" />
                <span>Konsep Rasio Multi-Satuan (Unit of Measure - UOM)</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Di toko retail, barang sering dibeli dari supplier dalam kemasan besar (Dus/Karton) tetapi dijual ke pelanggan dalam bentuk eceran (Pcs) atau pak sedang.
              </p>

              <div className="bg-white p-4 rounded-xl border border-purple-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Studi Kasus Konversi Satuan Minyak Goreng:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-purple-700 font-bold">1. Satuan Dasar: Pcs</div>
                    <div className="text-slate-600">Rasio = 1</div>
                    <div className="text-slate-900 font-bold mt-1">Harga: Rp 14.000 / Pcs</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-purple-700 font-bold">2. Satuan Sedang: Renceng / Pak</div>
                    <div className="text-slate-600">Rasio = 6 Pcs</div>
                    <div className="text-slate-900 font-bold mt-1">Harga: Rp 80.000 / Pak</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-purple-700 font-bold">3. Satuan Besar: Dus / Karton</div>
                    <div className="text-slate-600">Rasio = 24 Pcs</div>
                    <div className="text-slate-900 font-bold mt-1">Harga: Rp 315.000 / Dus</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  *Saat kasir menjual 1 Dus di POS, sistem secara cerdas langsung memotong 24 Pcs dari stok inventori utama.
                </p>
              </div>
            </div>

            {/* Expired Date & Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Manajemen Batch & Expired Date (FEFO)</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sistem menerapkan prinsip <strong>FEFO (First Expired, First Out)</strong>. Saat barang masuk dicatat tanggal kadaluarsanya, sistem akan memprioritaskan barang dengan tanggal expired terdekat untuk dijual lebih dulu dan memberi notifikasi kuning saat H-30 kadaluarsa.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Modul Cetak Label Barcode & Price Tag</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka menu <strong>Cetak Barcode</strong>. Pilih produk yang ingin dicetak labelnya (cocok untuk barang repacking, sembako curah, atau produk UMKM tanpa barcode pabrik). Format kompatibel dengan stiker barcode 3-kolom (33x15mm) atau printer thermal label.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: Pembelian PO, Moving Average HPP & Stock Opname                */}
      {/* ========================================================================= */}
      {activeTab === 'purchasing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>SOP Pembelian (PO), Rumus Moving Average HPP & Stock Opname</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Alur pengadaan barang dari supplier hingga audit fisik berkala toko.</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                Menu: /retail/purchase-orders & /retail/stock-opname
              </span>
            </div>

            {/* Rumus Moving Average HPP */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Rumus HPP Rata-Rata Tertimbang (Weighted Moving Average Costing)</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Harga beli dari supplier sering berubah-ubah naik/turun setiap minggu. Modul Retail Bizora secara otomatis menghitung <strong>HPP Rata-rata Tertimbang</strong> setiap kali ada Penerimaan Barang baru:
              </p>

              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 font-mono text-xs text-emerald-400 font-bold">
                HPP Baru = [(Stok Lama * HPP Lama) + (Qty Beli Baru * Harga Beli Baru)] ÷ (Stok Lama + Qty Beli Baru)
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs font-sans space-y-2">
                <strong className="text-indigo-300 block font-bold">Contoh Simulasi Nyata:</strong>
                <ul className="text-slate-300 space-y-1 list-disc list-inside">
                  <li>Stok awal di toko: <strong>10 Pcs</strong> dengan HPP lama <strong>Rp 10.000</strong> (Nilai modal = Rp 100.000).</li>
                  <li>Beli stok baru: <strong>20 Pcs</strong> karena harga naik menjadi <strong>Rp 13.000</strong> (Nilai modal baru = Rp 260.000).</li>
                  <li>Total Nilai Modal Toko = Rp 100.000 + Rp 260.000 = <strong>Rp 360.000</strong>.</li>
                  <li>Total Kuantiti = 10 + 20 = <strong>30 Pcs</strong>.</li>
                  <li><span className="text-emerald-400 font-bold font-mono">HPP Baru yang Diterapkan Sistem = Rp 360.000 ÷ 30 = Rp 12.000 / Pcs.</span></li>
                </ul>
              </div>
            </div>

            {/* SOP Stock Opname & Rumus Variance */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SOP Stock Opname (Audit Fisik Stok Bulanan)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="space-y-2">
                  <strong className="text-slate-900 font-bold block">Langkah Pelaksanaan Audit:</strong>
                  <ol className="space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Buka menu <strong>Stock Opname</strong>, buat sesi opname baru (pilih per rak atau seluruh toko).</li>
                    <li>Gunakan barcode scanner / smartphone untuk scan fisik barang yang ada di rak dan gudang.</li>
                    <li>Sistem langsung mencocokkan angka hitung fisik vs data sistem.</li>
                    <li>Klik <strong>Finalisasi Opname</strong> untuk menyetujui penyesuaian stok.</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 font-mono">
                  <div className="text-blue-900 font-bold font-sans">Rumus Nilai Selisih Stock Opname:</div>
                  <div className="text-slate-800 font-bold">Selisih Qty = Stok Fisik - Stok Sistem</div>
                  <div className="text-emerald-600 font-bold">Nilai Kerugian/Keuntungan = Selisih Qty * HPP Satuan</div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Jika minus (barang hilang/rusak), sistem otomatis membukukan beban kerugian ke Laporan Laba Rugi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: Keuangan, Kas Operasional, Hutang & Piutang Kasbon            */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <span>SOP Manajemen Keuangan, Buku Kas, Hutang Supplier & Piutang Pelanggan</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Panduan lengkap tata kelola arus kas masuk/keluar, pelunasan tempo supplier, kasbon member, hingga perpajakan toko.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Menu: /retail/finance/*
              </span>
            </div>

            {/* 3 Pilar Utama Modul Keuangan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>1. Buku Kas & Arus Kas (Cashflow)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mencatat seluruh mutasi kas operasional toko di luar kasir POS: Pembayaran listrik, gaji karyawan, sewa ruko, pembelian ATK/kantong plastik, serta mutasi saldo antar akun kas/bank.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>2. Hutang Dagang Supplier (AP)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setiap pembelian barang dari supplier secara tempo (TOP 14 / 30 hari) otomatis masuk ke Buku Hutang. Sistem melacak sisa tagihan dan memberi peringatan saat mendekati jatuh tempo.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>3. Piutang Kasbon Pelanggan (AR)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mencatat transaksi belanja pelanggan yang belum dibayar lunas (kasbon/kredit member). Sistem melacak plafon limit kredit maksimal per pelanggan dan mencatat riwayat pelunasan cicilan.
                </p>
              </div>
            </div>

            {/* Alur SOP Operasional Keuangan & Buku Kas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: SOP Kas Masuk & Keluar */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>SOP Pencatatan Beban Operasional & Kas Non-POS</span>
                </div>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li><strong>Tentukan Kategori Akun:</strong> Pastikan kategori beban sudah dibuat di menu <em>Kategori Keuangan</em> (misal: Beban Listrik, Beban Gaji, Beban Perlengkapan).</li>
                  <li><strong>Catat Pengeluaran:</strong> Buka menu <em>Catatan Kas</em> $\rightarrow$ Klik <em>+ Tambah Transaksi Kas</em> $\rightarrow$ Pilih Tipe *Keluar*.</li>
                  <li><strong>Pilih Akun Sumber Dana:</strong> Tentukan apakah dibayar dari Kas Toko (Tunai) atau Rekening Bank BCA/Mandiri.</li>
                  <li><strong>Simpan & Arsipkan Bukti:</strong> Masukkan nominal dan catatan nota fisik untuk lampiran audit pembukuan.</li>
                </ol>
              </div>

              {/* Box 2: SOP Mutasi Kas / Setor Bank */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <Split className="w-4 h-4 text-blue-600" />
                  <span>SOP Mutasi Antar Kas & Setor Kasir ke Bank</span>
                </div>
                <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                  <li><strong>Tujuan Mutasi:</strong> Digunakan saat uang hasil penjualan laci kasir disetorkan ke rekening bank toko, atau penarikan uang dari bank untuk modal kasir.</li>
                  <li><strong>Langkah Transfer:</strong> Buka menu <em>Mutasi Kas</em> $\rightarrow$ Klik <em>+ Transfer Dana</em>.</li>
                  <li><strong>Tentukan Akun:</strong> Pilih <em>Akun Asal</em> (misal: Kas Tunai Toko) dan <em>Akun Tujuan</em> (misal: Bank BCA Toko).</li>
                  <li><strong>Sistem Real-Time:</strong> Saldo kas tunai otomatis berkurang dan saldo rekening bank bertambah seketika tanpa mempengaruhi Laba Rugi toko.</li>
                </ol>
              </div>
            </div>

            {/* SOP Hutang Supplier & Piutang Kasbon Member */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 3: SOP Hutang Dagang Supplier */}
              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-950 font-bold text-sm">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>SOP Pembayaran & Manajemen Hutang Supplier (AP)</span>
                </div>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Saat barang diterima dari Supplier dengan metode bayar <strong>Tempo / Hutang</strong>, sistem mencatat faktur pada menu <em>Hutang Supplier</em>.
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li><strong>Status Pembayaran:</strong> <em>Belum Lunas</em>, <em>Dibayar Sebagian (Cicilan)</em>, atau <em>Lunas</em>.</li>
                    <li><strong>Pemberitahuan Jatuh Tempo:</strong> Faktur yang mendekati H-3 tanggal jatuh tempo akan bertanda kuning, dan yang terlewat akan bertanda merah (*Overdue*).</li>
                    <li><strong>Proses Pembayaran:</strong> Klik <em>Bayar Hutang</em> pada faktur terkait $\rightarrow$ Masukkan nominal transfer $\rightarrow$ Sistem mencatat kas keluar dan mengupdate sisa hutang.</li>
                  </ul>
                </div>
              </div>

              {/* Box 4: SOP Piutang Pembeli / Kasbon */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>SOP Pengelolaan & Penagihan Piutang Pelanggan (AR)</span>
                </div>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Digunakan untuk pelanggan langganan atau instansi yang melakukan transaksi kasir dengan pembayaran tempo / kasbon.
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li><strong>Plafon Kredit:</strong> Pada data pelanggan, tetapkan batas maksimal piutang (misal: maks Rp 1.000.000) untuk mencegah kasbon macet.</li>
                    <li><strong>Pencatatan di Kasir (POS):</strong> Di layar kasir, pilih pelanggan terdaftar $\rightarrow$ Pilih metode bayar <em>Piutang / Kasbon</em>.</li>
                    <li><strong>Penerimaan Cicilan:</strong> Buka menu <em>Piutang Pelanggan</em> $\rightarrow$ Pilih nama pembeli $\rightarrow$ Klik <em>Terima Pembayaran</em> untuk mencatat uang masuk.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Kamus Rumus Perpajakan & Arus Kas */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Kamus Rumus Finansial & Pajak Toko</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-indigo-300 font-bold font-sans text-xs">1. Rumus Arus Kas Bersih (Net Cashflow):</div>
                  <div className="text-emerald-400 font-bold">Net Cashflow = Total Kas Masuk - Total Kas Keluar</div>
                  <div className="text-slate-400 font-sans text-[11px]">Jika positif: Arus kas toko surplus (sehat). Jika negatif: Pengeluaran melebihi uang tunai masuk.</div>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-1.5">
                  <div className="text-indigo-300 font-bold font-sans text-xs">2. Rumus Pajak Terutang Toko (PPN / PB1):</div>
                  <div className="text-emerald-400 font-bold">Pajak Terutang = Pajak Keluaran (Penjualan) - Pajak Masukan (Pembelian PO)</div>
                  <div className="text-slate-400 font-sans text-[11px]">Nilai pajak yang wajib disetorkan pemilik toko ke kas negara / kas daerah.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: Rumus Laba Rugi, Margin % vs Markup % & Konsinyasi             */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Kamus Lengkap Rumus Laba Rugi, Margin % vs Markup % & Konsinyasi</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Rumus finansial baku yang digunakan sistem Bizora untuk menghitung profitabilitas toko Anda.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Menu: /retail/reports/* & /retail/finance/summary
              </span>
            </div>

            {/* Perbedaan Krusial: Margin vs Markup */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                <Percent className="w-4 h-4 text-indigo-600" />
                <span>Perbedaan Mendasar: Margin Keuntungan (%) vs Markup Harga (%)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Banyak pemilik toko UMKM keliru menyamakan Margin dan Markup. Berikut perbedaan rumusnya:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-2">
                  <div className="text-indigo-900 font-bold font-sans text-sm">1. Rumus Margin Keuntungan (%):</div>
                  <div className="text-blue-700 font-bold">Margin (%) = [(Harga Jual - HPP) ÷ Harga Jual] * 100%</div>
                  <p className="text-slate-600 font-sans text-[11.5px] leading-relaxed">
                    Mengukur berapa persen keuntungan bersih yang didapat dari setiap rupiah harga jual yang dibayar pelanggan.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-200 space-y-2">
                  <div className="text-indigo-900 font-bold font-sans text-sm">2. Rumus Markup Harga (%):</div>
                  <div className="text-purple-700 font-bold">Markup (%) = [(Harga Jual - HPP) ÷ HPP] * 100%</div>
                  <p className="text-slate-600 font-sans text-[11.5px] leading-relaxed">
                    Mengukur berapa persen harga dinaikkan di atas harga modal beli (HPP) supplier.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-indigo-200 text-xs font-sans text-slate-800">
                <strong>Contoh Perbandingan:</strong> Beli barang dari supplier seharga <strong>Rp 80.000 (HPP)</strong>, lalu dijual di toko seharga <strong>Rp 100.000</strong>.
                <ul className="mt-1.5 space-y-1 list-disc list-inside text-slate-700">
                  <li>Keuntungan Nominal = Rp 100.000 - Rp 80.000 = <strong>Rp 20.000</strong>.</li>
                  <li><strong>Markup</strong> = (Rp 20.000 ÷ Rp 80.000) * 100% = <strong className="text-purple-700">25.0%</strong>.</li>
                  <li><strong>Margin</strong> = (Rp 20.000 ÷ Rp 100.000) * 100% = <strong className="text-blue-700">20.0%</strong>.</li>
                </ul>
              </div>
            </div>

            {/* Rumus Laba Rugi Komprehensif */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Calculator className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Rumus Laporan Laba Rugi Toko Retail (P&L Statement)</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-indigo-300 font-sans font-bold">Langkah 1: Penjualan Bersih (Net Sales)</div>
                  <div className="text-emerald-400 font-bold">Penjualan Bersih = Total Penjualan Kotor - Diskon - Retur Penjualan</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-indigo-300 font-sans font-bold">Langkah 2: Laba Kotor (Gross Profit)</div>
                  <div className="text-emerald-400 font-bold">Laba Kotor = Penjualan Bersih - Total HPP Barang Terjual (COGS)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-indigo-300 font-sans font-bold">Langkah 3: Laba Bersih Operasional (Operating Net Profit)</div>
                  <div className="text-emerald-400 font-bold">Laba Bersih = Laba Kotor - Total Beban Operasional (Gaji + Listrik + Sewa + Plastik)</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <div className="text-indigo-300 font-sans font-bold">Langkah 4: Laba Bersih Akhir (Bottom-Line Net Profit)</div>
                  <div className="text-emerald-400 font-bold">Laba Bersih Akhir = Laba Operasional + Pendapatan Lain (Bunga Bank/Selisih Kas) - Pajak Toko</div>
                </div>
              </div>
            </div>

            {/* Rumus Konsinyasi */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Rumus Bagi Hasil Barang Konsinyasi (Titip Jual)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Untuk produk titipan UMKM lokal (misal keripik / kue basah), toko tidak membeli putus di awal. Pembayaran ke supplier titipan dihitung berdasarkan barang yang laku terjual:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-900 font-bold font-sans">Hak Setor ke Supplier Titipan:</div>
                  <div className="text-emerald-600 font-bold">Setor = Qty Terjual * Harga Kesepakatan Supplier</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-900 font-bold font-sans">Keuntungan / Komisi Toko:</div>
                  <div className="text-blue-600 font-bold">Komisi = (Harga Jual Toko - Harga Supplier) * Qty Terjual</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: API, Webhook, Multi-Cabang & Backup Data Cloud                 */}
      {/* ========================================================================= */}
      {activeTab === 'api_backup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-blue-600" />
                  <span>SOP Integrasi Developer API, Webhook & Cadangan Data Toko</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Panduan menghubungkan toko ke sistem eksternal, otomasi webhook, serta pengamanan arsip data cloud.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                  Menu: /retail/developer-api & /retail/backup
                </span>
              </div>
            </div>

            {/* 3 Pilar Utama API & Backup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Pilar 1: Developer API */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">1. REST API & Secret Key</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Gunakan API Key untuk mengintegrasikan inventaris toko dengan Website E-Commerce, Aplikasi Mobile toko, atau sistem ERP pihak ketiga.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">Header Otorisasi:</div>
                  <code className="text-indigo-600 font-mono text-[11px] block">X-API-Key: biz_live_xxxx</code>
                  <div className="text-[11px] text-slate-500 pt-1">Rate limit: 60 request / menit per tenant.</div>
                </div>
              </div>

              {/* Pilar 2: Webhook Event */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">2. Realtime Webhook Dispatcher</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem otomatis mengirim payload JSON HTTP POST seketika ke URL server Anda saat terjadi aktivitas operasional kasir.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">Event Tersedia:</div>
                  <div className="text-[11px] space-y-0.5 text-slate-600">
                    <div>• <code className="text-purple-600 font-mono">order.created</code> (Struk baru)</div>
                    <div>• <code className="text-amber-600 font-mono">stock.low</code> (Peringatan stok menipis)</div>
                    <div>• <code className="text-emerald-600 font-mono">payment.received</code> (QRIS lunas)</div>
                  </div>
                </div>
              </div>

              {/* Pilar 3: Backup & Disaster Recovery */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Archive className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">3. Pencadangan Data (Cloud Backup)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Perlindungan data terhadap potensi kehilangan data. Mengarsipkan seluruh tabel produk, mutasi stok, transaksi kasir, hutang-piutang, dan CRM pelanggan.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">Pilihan Format Ekspor:</div>
                  <div className="text-[11px] text-slate-600">
                    <div>• <strong>Excel (.xlsx)</strong>: Multi-sheet untuk analisis akuntan.</div>
                    <div>• <strong>JSON (.json)</strong>: Raw relational dump untuk migrasi database.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SOP Cadangan Berkala & Mitigasi Risiko */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
              <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>SOP Rutin Pemeliharaan & Pengamanan Data Toko</span>
              </h3>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside leading-relaxed">
                <li><strong>Aktifkan Jadwal Otomatis:</strong> Di menu Backup Data, aktifkan toggle backup otomatis mingguan atau harian ke email pemilik toko.</li>
                <li><strong>Unduh Snapshot Sebelum Perubahan Masif:</strong> Sebelum melakukan Stock Opname massal akhir bulan atau impor data harga baru, selalu klik <em>Unduh Excel (.xlsx)</em> sebagai titik pulih cadangan (*restore point*).</li>
                <li><strong>Verifikasi Integrasi API:</strong> Jaga kerahasiaan Secret Key API. Jika terjadi kebocoran kredensial pihak ketiga, segera lakukan regenerasi token di portal Developer.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: Simulator Rumus Interaktif                                     */}
      {/* ========================================================================= */}
      {activeTab === 'calculator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  <span>Simulator & Kalkulator Rumus Retail Interaktif</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Uji coba simulasi angka riil untuk melihat otomatisasi perhitungan HPP, Margin %, Markup % dan Profit Rp.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
                Fitur Alat Bantu Edukasi
              </span>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">1. Harga Beli Modal / HPP (Rp):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcBuyPrice}
                    onChange={(e) => setCalcBuyPrice(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="80000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Harga per satuan dari supplier</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">2. Harga Jual Normal Toko (Rp):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcSellPrice}
                    onChange={(e) => setCalcSellPrice(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="100000"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Harga tag yang tertera ke pembeli</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">3. Rencana Diskon Promosi (%):</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcDiscountPercent}
                    onChange={(e) => setCalcDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Persentase potongan promo (0-100%)</p>
              </div>
            </div>

            {/* Output Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Harga Jual Efektif</span>
                <div className="text-xl font-extrabold text-blue-950 font-mono">{fmtRp(discountedSellPrice)}</div>
                <p className="text-[10.5px] text-blue-600">Setelah dipotong diskon {calcDiscountPercent}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Profit Bersih / Pcs</span>
                <div className="text-xl font-extrabold text-emerald-950 font-mono">{fmtRp(profitNominal)}</div>
                <p className="text-[10.5px] text-emerald-600">Untung bersih per item terjual</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Margin Keuntungan</span>
                <div className="text-xl font-extrabold text-indigo-950 font-mono">{marginPercent.toFixed(1)}%</div>
                <p className="text-[10.5px] text-indigo-600">Dihitung dari harga jual akhir</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Markup Harga</span>
                <div className="text-xl font-extrabold text-purple-950 font-mono">{markupPercent.toFixed(1)}%</div>
                <p className="text-[10.5px] text-purple-600">Dihitung di atas harga modal beli</p>
              </div>
            </div>

            {/* Analisa Kelayakan Bisnis */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${profitNominal > 0 ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
              {profitNominal > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <strong className="font-bold text-sm block">
                  {profitNominal > 0 ? '✅ Harga Jual & Margin Sehat' : '⚠️ Perhatian: Harga Jual Berpotensi Rugi!'}
                </strong>
                <p className="leading-relaxed">
                  {profitNominal > 0 
                    ? `Dengan margin ${marginPercent.toFixed(1)}%, setiap omzet penjualan Rp 1.000.000 akan menghasilkan laba kotor sebesar ${fmtRp(1000000 * (marginPercent / 100))}. Pastikan persentase ini cukup untuk menutup biaya operasional toko (listrik, gaji kasir, sewa tempat).`
                    : `Harga jual setelah diskon (${fmtRp(discountedSellPrice)}) berada di bawah harga beli modal (${fmtRp(calcBuyPrice)}). Segera naikkan harga jual atau turunkan diskon promosi!`
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

export default RetailGuide;
