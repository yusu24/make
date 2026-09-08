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
  ArrowRight
} from 'lucide-react';

const KulinerGuide = () => {
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <KulinerAdminLayout title="Buku Panduan & SOP Resto">
      <div className="kd-content space-y-6 pb-16">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-amber-100 border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Buku Panduan & SOP Operasional Resto / Kafe</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panduan Cara Penggunaan Modul Kuliner
            </h1>
            <p className="text-amber-100 text-sm leading-relaxed">
              Panduan lengkap operasional restoran & kafe: Master Menu & Resep (BOM HPP), Manajemen Meja & QR Self-Order, Kasir POS & Antrean Dapur (KDS), Stock Opname Bahan Baku & Waste, hingga Buka/Tutup Shift Kasir.
            </p>
          </div>

          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {[
            { id: 'menu', label: '1. Menu, Bahan & Resep BOM', icon: Utensils },
            { id: 'table', label: '2. Meja & QR Self-Order', icon: QrCode },
            { id: 'pos', label: '3. Kasir & Antrean Dapur (KDS)', icon: ChefHat },
            { id: 'inventory', label: '4. Stok Bahan & Waste', icon: Package },
            { id: 'shift', label: '5. Buka & Tutup Shift', icon: Clock },
            { id: 'reports', label: '6. Laporan Laba & Margin', icon: TrendingUp },
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

        {/* SECTION 1: Menu & Resep BOM */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <Utensils className="w-6 h-6 text-amber-600" />
                <span>SOP Setup Master Menu, Bahan Baku & Resep BOM (HPP Otomatis)</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Modul Kuliner menerapkan sistem <strong>Bill of Materials (BOM)</strong>. Setiap porsi menu makanan/minuman yang terjual akan otomatis memotong stok bahan baku mentah (gramasi tepung, ml sirup, butir telur) dan menghitung HPP secara presisi.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: '1',
                    title: 'Input Bahan Baku (Raw Ingredients)',
                    desc: 'Daftarkan bahan baku seperti Daging Ayam (kg), Kopi Biji (gr), Susu UHT (ml) beserta harga beli per satuan dasar.',
                  },
                  {
                    step: '2',
                    title: 'Buat Resep / Formula (BOM)',
                    desc: 'Hubungkan menu dengan komposisi bahan. Contoh: "Kopi Latte" = 18 gr Kopi + 150 ml Susu + 1 Paper Cup. Sistem menghitung HPP otomatis.',
                  },
                  {
                    step: '3',
                    title: 'Atur Modifier & Add-on',
                    desc: 'Tambahkan opsi level pedas/gula, pilihan ukuran (Reguler/Large), dan topping tambahan (Extra Shot, Keju, Boba).',
                  }
                ].map(card => (
                  <div key={card.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {card.step}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <strong className="font-bold block">Keuntungan Resep BOM:</strong>
                  <p>Anda langsung mengetahui margin keuntungan bersih setiap menu (Harga Jual - HPP Bahan) tanpa perlu menghitung manual di Excel.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Meja & QR Order */}
        {activeTab === 'table' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <QrCode className="w-6 h-6 text-orange-600" />
                <span>SOP Manajemen Meja & QR Self-Order Pelanggan</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Langkah Setup Meja Resto:</span>
                  </h3>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                    <li>Buka menu <strong>Manajemen Meja</strong> di sidebar kiri.</li>
                    <li>Klik <strong>+ Tambah Meja</strong>, masukkan nomor meja (contoh: Meja 01, VIP 1) dan kapasitas kursi.</li>
                    <li>Sistem otomatis membuat QR Code khusus untuk setiap meja.</li>
                    <li>Klik <strong>Cetak QR Meja</strong> dan tempelkan stiker akrilik di meja makan.</li>
                  </ol>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Alur Pemesanan Mandiri (QR Self-Order):</span>
                  </h3>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                    <li>Pelanggan scan QR meja menggunakan kamera smartphone.</li>
                    <li>Katalog menu digital terbuka tanpa perlu install aplikasi.</li>
                    <li>Pelanggan memilih menu & add-on, lalu klik <strong>Kirim Pesanan</strong>.</li>
                    <li>Pesanan langsung muncul di Kasir & Layar Antrean Dapur (KDS).</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Kasir & Dapur (KDS) */}
        {activeTab === 'pos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <ChefHat className="w-6 h-6 text-amber-600" />
                <span>SOP Kasir POS, Split Bill & Kitchen Display System (KDS)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    step: '1',
                    title: 'Input Pesanan Kasir',
                    desc: 'Pilih jenis Dine-in (pilih nomor meja), Take Away, atau Delivery. Pilih menu & modifier yang dipesan.',
                  },
                  {
                    step: '2',
                    title: 'Tiket Dapur (KOT / KDS)',
                    desc: 'Klik "Kirim ke Dapur". Tiket KOT otomatis tercetak di printer dapur/bar atau tampil di layar Antrean Dapur.',
                  },
                  {
                    step: '3',
                    title: 'Split Bill & Gabung Meja',
                    desc: 'Jika tamu ingin bayar terpisah, gunakan tombol Split Bill per item atau bagi rata nominal tagihan.',
                  },
                  {
                    step: '4',
                    title: 'Pembayaran & Struk',
                    desc: 'Terima pembayaran Tunai, QRIS Dinamis, Kartu Debit/Kredit, atau Piutang Kasbon. Cetak struk kasir.',
                  }
                ].map(card => (
                  <div key={card.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
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

        {/* SECTION 4: Stok Bahan & Waste */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <Package className="w-6 h-6 text-red-600" />
                <span>SOP Pembelian Bahan (PO), Stok Opname & Pencatatan Waste / Basi</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">1. Pembelian Bahan Baku (PO):</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Saat berbelanja ke pasar / supplier, catat di menu <strong>Pembelian Bahan</strong>. Stok bahan baku otomatis bertambah dan harga beli rata-rata diupdate.
                  </p>
                  <h3 className="text-sm font-bold text-slate-800 pt-2">2. Stock Opname Bahan Rutin:</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Lakukan penimbangan fisik sisa bahan di chiller/gudang secara mingguan/bulanan. Masukkan ke menu <strong>Stok Opname</strong> untuk mencocokkan selisih antara stok sistem vs fisik.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                    <h3 className="text-sm font-bold">Pencatatan Waste & Makanan Basi:</h3>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Bahan baku yang tumpah, basi, kadaluarsa, atau makanan salah masak yang dibuang wajib dicatat pada menu <strong>Pencatatan Waste</strong>.
                  </p>
                  <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                    <li>Pilih nama bahan / menu yang rusak</li>
                    <li>Masukkan jumlah gramasi / porsi yang terbuang</li>
                    <li>Pilih alasan: Basi, Jatuh/Tumpah, Salah Masak, Uji Rasa (QC)</li>
                    <li>Sistem otomatis membukukan nilai kerugian ke Laporan Laba Rugi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Shift Kasir */}
        {activeTab === 'shift' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-indigo-600" />
                <span>SOP Buka & Tutup Shift Kasir (Rekonsiliasi Kas Laci)</span>
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
                  <strong className="text-blue-900 font-bold block text-sm">1. Saat Buka Shift (Pagi / Masuk Kerja):</strong>
                  <p>Kasir menghitung uang modal receh di laci kasir (misal Rp 300.000), lalu masukkan angka tersebut pada prompt "Buka Shift" sebelum melayani transaksi pertama.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <strong className="text-emerald-900 font-bold block text-sm">2. Saat Tutup Shift (Selesai Jam Kerja / Closing):</strong>
                  <p>Kasir menghitung seluruh uang fisik di laci (Modal + Penjualan Tunai - Pengeluaran Kas Operasional). Masukkan nominal fisik ke sistem untuk memeriksa apakah ada selisih kas (Balance / Kurang / Lebih), lalu cetak Laporan Shift Z sebagai bukti pertanggungjawaban ke Manager Resto.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: Laporan */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <span>Laporan Penjualan, Margin Menu & Laba Rugi Resto</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">📊 Laba Rugi Resto</h3>
                  <p className="text-xs text-slate-600">Melihat total omzet penjualan bersih dikurangi HPP bahan baku (COGS), biaya operasional resto (listrik, gas LPG, gaji, sewa), dan nilai kerugian waste.</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">🍕 Laba & Margin Menu</h3>
                  <p className="text-xs text-slate-600">Menganalisis menu mana yang menjadi *Star* (Penjualan tinggi & Margin tebal) vs menu yang kurang diminati (*Dog*).</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900">💳 Rekap Metode Bayar</h3>
                  <p className="text-xs text-slate-600">Mencocokkan penerimaan QRIS / EDC EDC bank dengan mutasi rekening koran untuk audit keuangan harian.</p>
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
