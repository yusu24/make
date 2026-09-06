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
  CreditCard
} from 'lucide-react';

const RetailGuide = () => {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 p-4 sm:p-6">
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
            Panduan kasir dan inventori toko retail: Buka/Tutup Shift Kasir, transaksi barcode scanner, diskon & harga grosir, stok opname, dan rekonsiliasi laci kas.
          </p>
        </div>

        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'pos', label: '1. Transaksi Kasir (POS)', icon: ShoppingCart },
          { id: 'shift', label: '2. Buka & Tutup Shift', icon: Clock },
          { id: 'inventory', label: '3. Barcode & Stok Opname', icon: Barcode },
          { id: 'reports', label: '4. Laporan Penjualan & Laba', icon: TrendingUp },
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
              <span>Alur Transaksi Kasir Cepat (Point of Sale)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Scan Barcode / Cari Produk',
                  desc: 'Arahkan barcode scanner fisik ke produk atau ketik nama/kode barang pada kolom pencarian.',
                },
                {
                  step: '2',
                  title: 'Atur Jumlah & Diskon',
                  desc: 'Sesuaikan kuantiti barang, pilih harga khusus member/grosir, atau berikan diskon manual jika ada izin.',
                },
                {
                  step: '3',
                  title: 'Pilih Pembayaran',
                  desc: 'Pilih Tunai (masukkan nominal bayar untuk menghitung kembalian), QRIS, Transfer Bank, atau Piutang Kasbon.',
                },
                {
                  step: '4',
                  title: 'Cetak Struk',
                  desc: 'Klik Bayar, laci kasir terbuka otomatis, dan struk thermal 58mm/80mm tercetak untuk pembeli.',
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
          </div>
        </div>
      )}

      {/* SECTION 2: Shift */}
      {activeTab === 'shift' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-indigo-600" />
              <span>SOP Buka & Tutup Shift Kasir</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                <strong className="text-blue-900 font-bold block">1. Saat Buka Shift (Pagi/Pergantian Kasir):</strong>
                <p>Hitung uang receh modal awal di laci kasir (misal Rp 200.000), lalu masukkan angka tersebut pada prompt "Buka Shift".</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <strong className="text-emerald-900 font-bold block">2. Saat Tutup Shift (Malam/Selesai Jam Kerja):</strong>
                <p>Hitung total uang fisik di laci (Uang Modal + Penjualan Tunai). Masukkan ke sistem untuk melihat apakah ada selisih kas (Kurang/Lebih/Seimbang) dan cetak Laporan Shift Z.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Inventori */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Barcode className="w-6 h-6 text-purple-600" />
              <span>Manajemen Barcode & Stock Opname</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Modul Retail dilengkapi pencetakan label barcode stiker untuk barang-barang tanpa barcode pabrikan, serta modul Stock Opname untuk audit fisik barang bulanan.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: Laporan */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span>Laporan Laba Rugi & Margin Produk</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pantau produk terlaris (*Best Seller*), produk dengan margin keuntungan tertinggi, serta laporan penjualan per kasir dan per metode pembayaran.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailGuide;
