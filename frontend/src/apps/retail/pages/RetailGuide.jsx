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
  Boxes
} from 'lucide-react';

const RetailGuide = () => {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 border border-white/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku Panduan & SOP Operasional Toko Retail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panduan Cara Penggunaan Modul Retail & POS
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Panduan lengkap kasir dan inventori toko retail: Buka/Tutup Shift Kasir, transaksi barcode scanner cepat, diskon kupon & harga grosir bertingkat, pembelian barang (PO), cetak label barcode, serta audit stock opname.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'pos', label: '1. Transaksi Kasir (POS)', icon: ShoppingCart },
          { id: 'shift', label: '2. Buka & Tutup Shift', icon: Clock },
          { id: 'master', label: '3. Multi-Satuan & Barcode', icon: Barcode },
          { id: 'purchasing', label: '4. Pembelian & Stok Opname', icon: Package },
          { id: 'reports', label: '5. Laporan Penjualan & Laba', icon: TrendingUp },
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

      {/* SECTION 1: POS Kasir */}
      {activeTab === 'pos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <span>SOP Transaksi Kasir Cepat (Point of Sale)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Scan Barcode / Cari Barang',
                  desc: 'Arahkan barcode scanner fisik ke produk atau ketik nama/kode barang pada kolom pencarian kasir.',
                },
                {
                  step: '2',
                  title: 'Atur Qty, Diskon & Satuan',
                  desc: 'Pilih satuan (Pcs/Dus/Lusin), masukkan kuantiti, atau pilih tingkatan harga grosir / member terdaftar.',
                },
                {
                  step: '3',
                  title: 'Pilih Metode Bayar',
                  desc: 'Pilih Tunai (masukkan nominal uang bayar untuk hitung kembalian), QRIS Statis/Dinamis, Debit/Kredit, atau Piutang Kasbon.',
                },
                {
                  step: '4',
                  title: 'Cetak Struk & Buka Laci',
                  desc: 'Klik Bayar, laci kasir terbuka otomatis, dan printer thermal 58mm/80mm mencetak struk belanja pelanggan.',
                }
              ].map(card => (
                <div key={card.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {card.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-blue-900">
              <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <strong className="font-bold block">Shortcut Kasir Keyboard:</strong>
                <p>Gunakan tombol keyboard `F2` untuk fokus ke pencarian barcode, `F4` untuk bayar cepat, dan `F8` untuk menahan (hold) keranjang saat antrean sedang ramai.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Shift */}
      {activeTab === 'shift' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-indigo-600" />
              <span>SOP Buka & Tutup Shift Kasir (Audit Uang Laci Kas)</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <strong className="text-blue-900 font-bold block text-sm">1. Saat Buka Shift (Pagi / Masuk Kerja):</strong>
                <p>Kasir menghitung fisik uang modal receh di laci kasir (misal Rp 200.000), lalu masukkan nominal tersebut pada modal dialog "Buka Shift" sebelum melayani transaksi penjualan pertama.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <strong className="text-emerald-900 font-bold block text-sm">2. Saat Tutup Shift (Selesai Jam Kerja / Closing):</strong>
                <p>Kasir menghitung seluruh uang fisik di laci (Modal Awal + Total Penjualan Tunai - Pengeluaran Kas Kecil). Masukkan nominal fisik ke sistem. Sistem akan mendeteksi apakah ada selisih kas (Balance / Selisih Kurang / Selisih Lebih), lalu mencetak Laporan Shift Z untuk diserahkan ke Supervisor / Owner.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Multi-Satuan & Barcode */}
      {activeTab === 'master' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Barcode className="w-6 h-6 text-purple-600" />
              <span>SOP Multi-Satuan, Harga Grosir & Cetak Label Barcode</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-600" />
                  <span>Konversi Multi-Satuan & Harga Grosir:</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Satu produk dapat memiliki banyak satuan. Contoh: Minyak Goreng 1 Dus = 12 Pcs.
                  Saat Anda membeli 10 Dus, stok bertambah 120 Pcs. Anda dapat menjual eceran per Pcs atau grosir per Dus dengan harga spesial otomatis saat kuantiti terpenuhi.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Cetak Label Barcode Rak / Stiker:</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gunakan menu <strong>Cetak Barcode</strong> untuk mencetak stiker barcode produk UMKM lokal yang belum memiliki barcode dari pabrik. Mendukung printer stiker barcode standar 3-kolom (33x15mm) atau printer thermal 58mm.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Pembelian PO & Stok Opname */}
      {activeTab === 'purchasing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Package className="w-6 h-6 text-amber-600" />
              <span>SOP Pembelian Barang (PO), Hutang Supplier & Stock Opname</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">1. Alur Pembelian & Penerimaan Barang:</h3>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Buat Purchase Order (PO) ke Supplier di menu <strong>Purchase Order (PO)</strong>.</li>
                  <li>Saat barang fisik tiba, cocokkan surat jalan dan klik <strong>Terima Barang</strong> di menu Penerimaan.</li>
                  <li>Stok toko otomatis bertambah dan status hutang / pelunasan tercatat di buku Kas.</li>
                </ol>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">2. SOP Stock Opname Berkala:</h3>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Buka menu <strong>Stock Opname</strong>, pilih kategori / rak yang akan diaudit.</li>
                  <li>Gunakan barcode scanner untuk scan fisik barang yang ada di etalase dan gudang.</li>
                  <li>Sistem menghitung selisih fisik vs sistem, serta membuat jurnal penyesuaian nilai stok hilang / rusak.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Laporan */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span>Laporan Laba Rugi, Margin Produk & Konsinyasi</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">📈 Laporan Margin Produk</h3>
                <p className="text-xs text-slate-600">Mengetahui margin persentase (%) dan nominal (Rp) keuntungan setiap item barang yang terjual setelah dipotong HPP beli.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">📦 Laporan Barang Konsinyasi</h3>
                <p className="text-xs text-slate-600">Mencatat barang titipan supplier/produsen luar, menghitung bagi hasil penjualan, dan membuat bukti setor bagi hasil.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">💰 Laba Rugi Komprehensif</h3>
                <p className="text-xs text-slate-600">Menampilkan pendapatan bersih, HPP barang terjual, beban biaya operasional (listrik, gaji karyawan), dan Laba Bersih toko.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailGuide;
